# Gap Analysis — migracao-crm-kommo

> Análise do gap entre os requisitos (RD Station → Kommo) e o código atual. Brownfield, sem `.kiro/steering/` (contexto derivado do código + brief). Abordagem confirmada: troca direta, sem camada de abstração de CRM.

## 1. Resumo

- A integração RD é **token em query-param + custom_field_id hardcoded** de ponta a ponta, sem nenhuma camada de abstração: o shape do JSON do RD (`deal_custom_fields[]`, `deal_products[]`, `deal_stage_id`, `contacts[]`) vaza para controller, services, frontend, extensão e até para o banco (o id do deal fica **dentro de um JSON blob** e é consultado por JSON-path do Postgres). Todas as camadas mudam.
- O salto não-trivial principal é a **virada do modelo de auth**: RD `?token=` (env nos services + por-usuário no controller + token em texto plano na extensão) → Kommo `Authorization: Bearer` único da conta.
- Os IDs de campo estão **duplicados em 3+ lugares** (config, 8 literais inline no `RDController.changeStage`, 1 no `winChange`, 5 na extensão). Kommo usa `field_id` numérico + `enum_id`.
- **Dois pontos de escopo não cobertos pelos requisitos** apareceram no código e precisam de decisão (ver §6): sincronização de **produtos** no deal (`deal_products` + `tariff.product_rd`) e a chamada inline ao **ChatGuru** dentro do `changeStage`.
- Esforço global estimado: **L (1–2 semanas)**; risco **Médio** (tecnologia conhecida, mas muitos pontos de acoplamento e duas integrações satélites a decidir).

## 2. Mapa Requisito → Ativo (gaps marcados)

| Req | Ativo atual no código | Gap |
|---|---|---|
| 1 Auth token único | `services/rdstation/rdApi.ts` + `rdApiAdm.ts` (`axios.create({params:{token}})`); `RDController` cria axios próprio com `params:{token:user.token_rd}`; `User.token_rd`/`user_rd` (non-null) | **Constraint**: dois caminhos de auth (env vs por-usuário) a unificar; **Missing**: header Bearer; **Constraint**: migração Prisma para remover campos non-null |
| 2 Mapeamento de campos | `config/rdstationConfig.ts` (11 IDs hex); `CustomFieldFilter` lê `deal_custom_fields.find(custom_field_id===)` | **Constraint**: IDs duplicados fora da config (controller, winChange, extensão); **Missing**: leitura no formato Kommo `custom_fields_values[].field_id` → `values[].value` + enums; **Research**: IDs numéricos do Kommo (descobrir via API após token) |
| 3 Alimentar lead ao salvar | `RDController.changeStage` (PUT inline, 8 literais, **stage IDs hardcoded**, **não faz merge** → PUT do RD apaga campos não enviados); `winChange` para status; frontend `rdSaveProcess`/`Corp` | **Constraint**: remover troca de etapa; **Missing**: PATCH parcial Kommo (a lógica read-merge-write de `updateDeal.ts` pode ser deletada); **Decisão**: produtos (§6) |
| 4 Anexar PDF | `pdfBudget.ts` gera blob e só faz `window.open` (sem acoplamento RD); **nenhum** mecanismo de upload existe | **Missing total**: Files API do Kommo (sessão de upload → `POST /api/v4/leads/{id}/files`); endpoint backend para receber o blob; escopo "Access to files" no token |
| 5 Resiliência | Fluxo atual: `await rdSaveProcess` **antes** do PDF e do `budget.save`; falha de RD pode interromper | **Constraint**: reordenar/try-catch para não bloquear; **Missing**: rate-limit (7 req/s) e log auditável |
| 6 Pré-preenchimento (PULL) | Query-params lidos por `rdClient/pipeNumber/CalendarPicker/adult/child/pet`; `useClientName`→`getDealById`→`name` | **Constraint**: nomes de params são contrato com a extensão; **Missing**: leitura do lead no shape Kommo; tratamento de lead inexistente |
| 7 Extensão | `rd-plugin/script.js`: token RD em texto plano, **XHR síncrono** a `crm.rdstation.com`, parsing de URL `deals/`, base URL LAN `http://192.168.10.87:83`; `manifest.json` sem `host_permissions` | **Missing**: endpoint backend proxy `GET lead/:id`; parsing de URL do Kommo; provável `host_permissions`; remover token/IDs RD |
| 8 Desativar crons RD | `server.ts:66-73` registra crons; `#2 fsAssistDBStatus`+`#5 fsAssistDaysDeadLine` ativos; `/routines/*` **públicos** (antes do authMiddleware) | **Constraint**: desativar cron E neutralizar gatilho manual `/routines/*` público |
| 9 Remover RD + rotacionar | `server/.env` com segredos reais commitados; código RD em `services/rdstation/*`, `RDController`, `rdstationConfig` | **Constraint**: rotacionar segredos; decidir remover vs neutralizar código |

## 3. Pontos de acoplamento não-triviais (prioridade)

1. **Virada de auth** — `rdApi.ts`/`rdApiAdm.ts` (params→header), `RDController` (axios próprio + token por-usuário), `User` schema, extensão.
2. **IDs de campo duplicados** — centralizar tudo na config; controller e extensão hoje **bypassam** a config.
3. **`updateDeal.ts` read-merge-write** — removível com PATCH do Kommo; mas o PUT direto do controller **não** faz merge (comportamento atual já inconsistente/lossy) — reconciliar.
4. **Id do lead dentro de JSON, consultado por JSON-path** — `winChange` e ambos os models de budget (`rd_client` em `saveBudgets[0].arrComplete.responseForm.rd_client`, `idClient` em `saveBudgetsCorp`). Manter o id do Kommo nos mesmos paths OU renomear + atualizar as queries JSON-path.
5. **Stage IDs hardcoded** (`649dcc52…`/`64ca5415…`) — eliminados (sem troca de etapa).
6. **`tariff.product_rd`** — FK ao catálogo de produtos do RD, usado em `addProduct` (ver §6).
7. **Extensão** — XHR síncrono, token em texto plano, base URL LAN HTTP, parsing de URL RD, `host_permissions`.
8. **Ordem do save-flow** (`use-component-buttons-budget.ts`): hoje `rdSaveProcess` (produtos+stage) e `getDealById` (para o **nome do lead**) acontecem **antes** do `budget.save` local — o nome do deal é gravado junto. O equivalente Kommo precisa devolver o `name` do mesmo jeito ou o orçamento salvo perde o rótulo.

## 4. Opções de implementação

### Opção A — Edição in-place dos arquivos RD (substituição direta)
Reescrever `rdApi.ts`, services, `RDController`, `winChange`, `rdSaveProcess`, extensão trocando chamadas RD por Kommo, mantendo nomes de arquivo/rota/contrato frontend (`rd.api.ts`, `/rd/*`, query-params).
- ✅ Menos arquivos novos; preserva o contrato estável (`rd.api.ts` + `/rd/*` + nomes de params) enquanto troca o interior.
- ✅ Mais rápido; alinhado com "troca direta" e sistema legado a ser reescrito.
- ❌ Nomes "rd"/"deal" ficam enganosos no código (dívida cosmética).
- ❌ Risco de deixar literais RD esquecidos (estão espalhados).

### Opção B — Novo módulo `kommo` + remoção do `rdstation`
Criar `services/kommo/*`, `config/kommoConfig.ts`, `controllers/Kommo/KommoController.ts`, novas rotas `/kommo/*`, e remover os arquivos RD. Frontend passa a chamar `/kommo/*`.
- ✅ Nomenclatura limpa, sem dívida cosmética; fácil testar isolado.
- ✅ Remove de vez o código RD (atende Req 9 com clareza).
- ❌ Mais arquivos e mais pontos de mudança no frontend (renomear `rd.api.ts`, ajustar todos os call-sites).
- ❌ Maior superfície para regressão nesta migração.

### Opção C — Híbrido (recomendado)
Backend: criar `services/kommo/*` + `config/kommoConfig.ts` (limpo) **mas** manter as **rotas `/rd/*` e o contrato `rd.api.ts` do frontend estáveis** apontando para a implementação Kommo por baixo; adicionar o endpoint novo de upload de PDF e o proxy de lead da extensão. Extensão refeita do zero (decisão da discovery). Remover/neutralizar `services/rdstation/*` e `rdstationConfig` ao final.
- ✅ Backend ganha nomenclatura Kommo limpa sem forçar refactor amplo no frontend.
- ✅ Contrato estável reduz regressão no save-flow; entrega incremental.
- ❌ Convivência temporária de nomes "rd" (rota) com "kommo" (serviço) — documentar.

## 5. Esforço & Risco

| Área | Esforço | Risco | Justificativa |
|---|---|---|---|
| Cliente/auth Kommo + config de campos | M | Médio | Bearer + descoberta de `field_id`/enum; padrão novo mas conhecido |
| PUSH (escrever campos no lead) | M | Médio | PATCH parcial simplifica; reconciliar merge + remover stage/produtos |
| Upload de PDF (Files API) | M | Médio-Alto | Fluxo multi-etapas inédito (sessão→upload→attach); escopo de arquivos; passar blob ao backend |
| PULL + pré-preenchimento | S | Baixo | Leitura de lead + mapear params; contrato já existe |
| Extensão refeita | M | Médio | `host_permissions`, parsing de URL Kommo, proxy backend, remover token plano |
| Desativar crons + remover RD + rotacionar segredos | S | Baixo | Mecânico, mas atenção aos `/routines/*` públicos e à migração Prisma |
| **Global** | **L (1–2 sem)** | **Médio** | Tecnologia conhecida; risco vem da quantidade de pontos de acoplamento + 2 satélites a decidir |

## 6. Decisões de escopo (RESOLVIDAS com o usuário em 2026-06-18)

1. **Valor/produtos no lead** — DECIDIDO: **registrar o valor do orçamento no lead** (objetivo é relatório de vendas: quanto vendeu em julho/natal etc.) + os **tarifários usados em um campo à parte**. O espelhamento de `deal_products`/`tariff.product_rd` do RD pode ser **substituído** por isso — não precisa ser produto de catálogo. Forma exata (campo de valor do lead vs catálogo Kommo + campo de tarifários) fica para o design. Refletido em `requirements.md` Req 3.3 + Boundary in-scope.
2. **ChatGuru** — DECIDIDO: **descontinuar** totalmente (mensageria passa a ser feita pelo Kommo). O fluxo migrado não dispara ChatGuru. Refletido em Req 3.6, Req 9.5 e Boundary out-of-scope. Consequência: a pesquisa "mapeamento de contato/telefone Kommo se ChatGuru mantido" sai do §7 (não é mais necessária para o ChatGuru; telefone só se algum outro requisito precisar).

## 7. Recomendações para o design

- **Abordagem preferida**: Opção C (híbrido) — serviço Kommo limpo no backend, contrato frontend/rota estável, extensão refeita, RD removido ao final.
- **Decisões-chave a fechar no design**: formato do `kommoConfig` (field_id numérico + enum), estratégia de upload (blob→endpoint→Files API), padrão de URL de lead do Kommo para a extensão, e a migração Prisma (`User.token_rd`/`user_rd` e onde guardar o id do lead — manter paths `rd_client`/`idClient` para não quebrar `winChange`/save).
- **Research Needed (carregar para o design)**:
  - IDs numéricos dos `custom_fields` e `pipelines/statuses` do Kommo (descobrir via API após o token).
  - Padrão exato da URL da página de lead (`https://<subdominio>.kommo.com/leads/detail/{id}`) — confirmar.
  - Fluxo concreto da Files API (tamanho/partes, `session_id`/`upload_url`, content-type do anexo).
  - Mapeamento de contato/telefone no Kommo (`_embedded.contacts`) **se** ChatGuru for mantido (§6.2).
  - Equivalente de catálogo de produtos no Kommo **se** produtos forem mantidos (§6.1).
- **Tratar antes/junto**: `/routines/*` públicos (Req 8.4) e rotação dos segredos commitados em `server/.env` (Req 9.2).

---

# Discovery do Design (2026-06-18)

## Contratos concretos da API Kommo (verificados na doc oficial)

**Auth** — `Authorization: Bearer <long-lived-token>`. Token criado em integração privada (admin), aba "Keys and scopes", validade 1 dia–5 anos, sem refresh. Precisa do escopo **"Access to files"** para anexar PDF. Limite **7 req/s**.

**Ler lead** — `GET /api/v4/leads/{id}` retorna `id`, `name`, `price`, `custom_fields_values[]`. Contatos via `?with=contacts` em `_embedded.contacts` (não mais necessário — ChatGuru descontinuado).

**Escrever lead** — `PATCH /api/v4/leads/{id}` (parcial, não apaga campos não enviados — elimina o read-merge-write do `updateDeal.ts`). Corpo aceita:
- `price`: number — campo nativo "Lead sale" → **usar para o valor do orçamento**.
- `custom_fields_values`: `[{ field_id:number, values:[{ value }] }]`. Tipos: texto=string, número=string, data=**unix timestamp**, select=`enum_id`.

**Anexar PDF (Files API)** — fluxo multi-etapas, requer escopo de arquivos:
1. `POST` criar sessão de upload no drive da conta → resposta `{ session_id, upload_url, max_file_size, max_part_size }` (`session_token` = parte do `upload_url` após `https://drive.kommo.com/upload/`).
2. `POST /upload/{session_token}` com o binário (em partes se > `max_part_size`); parte intermediária → `{ next_url }`; parte final → `{ uuid, type, name, size, ... }`.
3. `PUT /api/v4/leads/{id}/files` body `[{ "file_uuid": "<uuid>" }]` → 200 `{}`.

**Descoberta de IDs** — `GET /api/v4/leads/custom_fields` lista `field_id` numéricos (preencher `kommoConfig.fields` após token). Sem necessidade de `pipelines/statuses` (sem troca de etapa).

Fontes: developers.kommo.com/reference/{upload-file,attached-to-entity,custom-fields,updating-single-lead}.md; /docs/long-lived-token.

## Conta Kommo provisionada (descoberta da tarefa 1.3 — 2026-06-18)

- Subdomínio/base: `https://admperaltasturismo.kommo.com/api/v4`; `account_id 34496259`; `api_domain api-c.kommo.com`.
- Token `CRM_TOKEN` (JWT long-lived) no `server/.env` (gitignored). **Escopos: `crm`, `files`, `files_delete`, `push_notifications`, `notifications`** → escopo de arquivos OK. `exp` ≈ 2030.
- ⚠️ A env é `CRM_TOKEN` (não `KOMMO_TOKEN`); base URL `CRM_BASE_URL` ainda a adicionar. Ajustar `kommoConfig` para esses nomes.

### MAPA FINAL DE CAMPOS (confirmado com o usuário em 2026-06-18) — destrava `kommoConfig`
Grupo de leads usado: **`leads_11861760358941`** ("Brotas Eco" — contém Quant. Adulto e o Check-in/out corretos).

| Dado do orçamento | Campo Kommo | field_id | tipo | escrita |
|---|---|---|---|---|
| Check-in | Check-in (grupo Brotas Eco) | **804864** | date | unix timestamp (início do dia) |
| Check-out | Check-out (grupo Brotas Eco) | **804868** | date | unix timestamp |
| Adulto | Quant. Adulto | **786330** | numeric | string |
| Qtd CHD | Quant. CHD | **786328** | numeric | string |
| Idades CHD | Idade CHD | **786322** | text | csv de idades |
| Qtd PET | Quant. PETS | **786324** | numeric | string |
| Porte PET | Porte PET | **786326** | multiselect | `enum_id`: Pequeno **648186** / Médio **648188** / Grande **648190** |
| Tarifários usados | Condições comerciais | **805299** | text | lista de tarifários (string) |
| Valor | **price nativo** (Lead sale) | — | number | campo nativo do PATCH, não custom_field |
| PDF | **aba Arquivos** (genérico) | — | — | Files API → `PUT /leads/{id}/files` (sem custom field) |

**Não escritos** (decidido): Status orçamento (786342) — troca de etapa é manual; o par Check-in/out 807064/807066 (grupo `leads_20991781285683`) é de outro fluxo (Eficha/escola); "Valor total do pacote" (786084) e campos file de PDF (786338/786340/786344) não usados.

### Env final (ajustar `kommoConfig` para estes nomes)
- `CRM_TOKEN` (já no `.env`) — JWT long-lived, escopos `crm`+`files`.
- `CRM_BASE_URL=https://admperaltasturismo.kommo.com` — **o usuário precisa adicionar ao `.env`** (esqueceu). `kommoConfig.baseUrl = ${CRM_BASE_URL}/api/v4`; drive em `https://drive.kommo.com`.

## Síntese (generalização / build-vs-adopt / simplificação)

- **Generalização**: PUSH, PULL, prefill e proxy do plugin compartilham **um único `KommoClient`** (Bearer + throttle) + um **mapeador de campos** (`kommoConfig` + `fieldMapper`). A leitura de lead para o nome do cliente e para o pré-preenchimento é **a mesma** `getLead`.
- **Build-vs-adopt**: adotar o campo nativo `price` (valor) e a Files API nativa (PDF); reusar axios já no projeto. **Sem** camada `CrmAdapter` (decisão da discovery — fica para o rebuild). Throttle via lib de rate-limit simples.
- **Simplificação**: produtos/`deal_products` + `tariff.product_rd` → substituídos por `price` + custom field `tariffs_used`. Some `updateDeal` merge (PATCH parcial). Somem stage IDs, tokens por usuário, ChatGuru. `changeStage`+`addProduct`+`deleteProduct` colapsam em **uma** chamada `updateLeadBudget`.
- **Decisão de fluxo do plugin (mais segura que o esquema atual)**: o plugin é reduzido a **extrair o lead-id da URL do Kommo e abrir o app autenticado** (`?client_id=<id>`). O **app logado** busca os campos do lead via `POST /kommo/lead` (atrás de `authMiddleware`) e pré-preenche. Logo o plugin **não contém token nem faz chamada autenticada ao backend** — satisfaz Req 7.3/7.5 com folga (o token nunca sai do servidor e o endpoint de leitura fica protegido por auth de usuário).
- **Naming**: como produtos/etapa saíram, o contrato `rd.api.ts`/`changeStage` mudaria de qualquer forma; opta-se por **módulo `kommo` limpo** (substitui Opção C do gap por naming limpo) e remoção do código RD — atende Req 9 com clareza. Chave do lead no JSON do budget permanece `rd_client`/`idClient` (agora guardando o id do Kommo) para evitar migração de dados — dívida de nome documentada.

---

# Follow-up: campos "Tarifário", "Ações de venda" e correção do 805299 (2026-06-22)

Equívoco anterior: os tarifários estavam indo para o campo **Condições comerciais (805299)**, que na verdade é **manual** (preenchido pelas atendentes). O usuário criou dois campos novos no grupo Brotas Eco:
- **Tarifário** = `807182` (text) — destino correto dos tarifários (substitui 805299).
- **Ações de venda** = `807184` (text) — resumo legível de descontos/ações aplicados (campo de API).
- **Condições comerciais (805299)** — **parar de escrever via API** (vira só manual).

Decisões (discovery 2026-06-22):
- **Tarifários** → mover de 805299 para **807182**.
- **Ações de venda (807184)** — texto:
  - COM desconto: `"Ação: <NOME> | Desconto: <X>%"` (sem ação selecionada → `"Ação: — | Desconto: <X>%"`).
  - SEM desconto → `"Padrão"`.
  - **Incluir descontos unitários** (por quarto/linha) também no texto.
- Fontes de dados (no momento de salvar):
  - Desconto geral: `arrComplete.responseForm.action` (nome) + `arrComplete.responseForm.discount` (%). JÁ disponível no frontend.
  - Desconto unitário: `RowModalDiscount[] { id, name, type, discount }` — **NÃO** está no objeto salvo hoje; precisa ser persistido no budget (DataContentProps) e threadado via `handleForm`/`buildBudgetTable` (igual `tariffsUsed`). Corp: `useBodyCorporateBudget.changeUnitaryDiscounts`.
- Escopo da mudança: kommoConfig (807182/807184, remover 805299), fieldMapper (escrever os 2 campos), kommoSaveProcess (montar a string de ações de venda; hospedagem + corp), BudgetLeadInput (+`salesActions`), DataContentProps (+ persistir unitários), threading no handleForm/buildBudgetTable. Path A (extensão de migracao-crm-kommo).
