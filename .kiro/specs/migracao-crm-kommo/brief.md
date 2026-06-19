# Brief: migracao-crm-kommo

## Problem
A empresa trocou o CRM de **RD Station** para **Kommo**. O sistema de orçamento atual (legado `frontend/` + `server/`) ainda integra com o RD Station em dois fluxos críticos do dia a dia comercial: alimentar o lead após gerar o orçamento e pré-preencher o orçamento a partir de um lead. Com o RD desativado, esses fluxos quebram e o consultor perde a ligação entre orçamento e CRM.

## Current State
Integração RD Station viva em dois fluxos + crons (a maioria já desativada):

- **PUSH (gera orçamento → alimenta o lead):** `server/src/controllers/RdStation/RDController.ts` (`changeStage`, `addProduct`, `deleteProduct`) + `frontend/src/context/generateTariff/functions/rdSaveProcess.ts`. Autentica com `?token=` (query string) usando token **por usuário** (`User.token_rd` / `User.user_rd` no Prisma). IDs de campos personalizados e de etapas (`deal_stage_id`) hardcoded em `server/src/config/rdstationConfig.ts` e no `RDController`.
- **PULL / pré-preenchimento (extensão abre orçamento preenchido):** a extensão de navegador (fora deste repo) abre o app em `/?client_id=<dealId>&check-in=…&check-out=…&adt=…&chd=…&pet=…`. Os campos React leem via `useQuery()` (`frontend/src/components/FormOrc/partForm/*`, `CalendarPicker`). O nome do cliente é puxado via `getDealById(client_id)` em `useClientName.ts`.
- **Camada de serviço RD:** `server/src/services/rdstation/*` (8 call sites, axios com `baseURL = RD_API_URL`).
- **Config/secrets:** env `RD_TOKEN`, `RD_API_URL` (`server/.env.example`, `docker-compose.prod.yml`). Há **secrets reais commitados** em `server/.env` (RD, ChatGuru, DB, fidelidade) — devem ser rotacionados/removidos.
- **Crons RD ativos:** `#2 fsAssistDBStatus` (2h) e `#5 fsAssistDaysDeadLine` (3h). Demais crons RD (#1, #3, #4) já comentados.

## Desired Outcome
- Ao gerar/salvar orçamento, os dados (check-in/out, adt, chd+idades, pet, status) são escritos no campo do **lead do Kommo** equivalente. **NÃO** há mais troca de etapa do pipeline pelo sistema — isso passa a ser feito manualmente dentro do Kommo.
- **Novo:** ao gerar o orçamento, o **PDF do orçamento é anexado ao lead** no Kommo (algo que o RD não comportava). PDF gerado no client (`pdfBudget.ts`, `pdfmake`), enviado ao backend, que faz o upload via Files API do Kommo e anexa ao lead.
- A extensão consegue abrir o app pré-preenchido a partir de um lead do Kommo, e o app puxa o lead via API v4 do Kommo para confirmar o cliente.
- Autenticação via **integração privada única** com **token de longa duração** (Bearer), sem tokens por usuário.
- Crons que escrevem no RD (#2 e #5) desativados; nada mais aponta para RD Station.

## Approach
**Troca direta mínima** (sem camada `CrmAdapter`): substituir as chamadas RD pelas chamadas Kommo nos mesmos pontos de integração, preservando o comportamento dos fluxos PUSH e PULL. Justificativa: o sistema será reescrito em Next.js no futuro (onde o `CrmAdapter` será introduzido); investir em abstração no legado não se paga. Autenticação por **token long-lived único** (Bearer no header `Authorization`) substituindo o `?token=` por usuário. IDs de campos personalizados do Kommo serão descobertos via API (`GET /api/v4/leads/custom_fields`) e mapeados em um config equivalente ao `rdstationConfig.ts`. **Sem mapeamento de pipeline/status** — não há mais troca de etapa pelo sistema.

**Upload de PDF (novo):** o PDF é gerado no client (`pdfBudget.ts`, `pdfmake`, hoje só aberto em nova aba). O blob será enviado para um **novo endpoint no backend**, que executa o fluxo da **Files API do Kommo** (criar sessão de upload → `session_id`/`upload_url` → enviar arquivo → anexar UUID via `POST /api/v4/leads/{id}/files`). O upload passa pelo backend (e não direto do browser) para **manter o token long-lived no servidor**, nunca exposto no client.

## Scope
- **In**:
  - Cliente HTTP Kommo (axios, `baseURL = https://<subdominio>.kommo.com/api/v4`, Bearer token).
  - Config de mapeamento Kommo (IDs de campos personalizados) substituindo `rdstationConfig.ts`. **Sem** `pipeline_id`/`status_id` (não há troca de etapa).
  - Reescrita do fluxo PUSH (RDController + `rdSaveProcess`) para `PATCH /api/v4/leads/{id}` — só escreve campos, **sem mover etapa**.
  - **Upload de PDF ao lead** (novo): endpoint backend que recebe o blob do PDF e usa a Files API do Kommo (`session_id`/`upload_url` → `POST /api/v4/leads/{id}/files`).
  - Reescrita do fluxo PULL/pré-preenchimento (`getDealById`/`useClientName`, leitura dos query params) para `GET /api/v4/leads/{id}`.
  - **Extensão `rd-plugin/`** (agora no repo): pode ser **refeita** como for melhor, desde que mantenha a função de abrir o orçamento pré-preenchido. Detecta o lead na URL da página do Kommo e **busca os campos via proxy no nosso backend** (`GET /kommo/lead/:id`) — o token long-lived **fica no servidor**, não no plugin. Remover o token RD hardcoded (`script.js:4`) e os IDs de campos do RD; atualizar `host_permissions`/`manifest.json`.
  - Remoção de `User.token_rd` / `User.user_rd` (migração Prisma) e dos envs `RD_TOKEN`/`RD_API_URL`; novos envs Kommo.
  - Desativar crons `#2 fsAssistDBStatus` e `#5 fsAssistDaysDeadLine`.
  - Rotacionar/remover secrets commitados em `server/.env`.
- **Out**:
  - Reescrita dos crons no Kommo (apenas desativação, não reimplementação).
  - Crons que não tocam CRM: `#6 fsAssistGoogleForms` e `#7 fsAttDataAppHotel` permanecem ativos.
  - Integração ChatGuru e fidelidade (só desacopladas na medida em que os crons RD que as chamavam são desativados).
  - O rebuild Next.js (projeto separado).

## Boundary Candidates
- Camada de cliente/serviço Kommo (substitui `services/rdstation/*`).
- Config de mapeamento de campos do Kommo.
- Fluxo PUSH (save → lead), sem etapa.
- Upload de PDF ao lead (Files API).
- Fluxo PULL (lead → pré-preenchimento).
- Extensão `rd-plugin/` (lê lead no Kommo → abre app).
- Limpeza de schema/secrets/crons (tokens por usuário, envs, crons RD ativos).

## Out of Boundary
- Troca de etapa do lead no pipeline — passa a ser feita **manualmente dentro do Kommo** (gatilho: PDF anexado ao lead).
- Reimplementação da automação pós-venda (cron #5) no Kommo.
- Webhooks do Kommo (substituiriam o polling do cron #1, mas #1 já está desativado e fora de escopo).

## Upstream / Downstream
- **Upstream**: conta Kommo provisionada — subdomínio, integração privada (client_id/secret), **token de longa duração com escopo "Access to files"** (necessário para a Files API), e os IDs de campos personalizados (descobríveis via API após o token).
- **Downstream**: o rebuild Next.js futuro reaproveitará o mapeamento de campos Kommo.

## Existing Spec Touchpoints
- **Extends**: nenhum (primeiro spec do projeto).
- **Adjacent**: rebuild Next.js planejado (memória `rebuild-decisions`) — mesma direção RD→Kommo, mas projeto/rep& momento distintos; manter o mapeamento de campos compatível para reaproveitar.

## Constraints
- API Kommo v4: Bearer token no header `Authorization`; limite de **7 req/s**; base por subdomínio.
- Token long-lived sem refresh (validade 1 dia–5 anos), criado por admin da conta; **precisa do escopo "Access to files"** para o upload de PDF.
- A extensão `rd-plugin/` busca o lead **via proxy no backend** (decidido) — o token Kommo nunca vai para o cliente. A extensão pode ser refeita à vontade, mantendo a função de abrir o orçamento pré-preenchido.
- Padrão de URL da página de lead no Kommo (`https://<subdominio>.kommo.com/leads/detail/{id}`) substitui o match de `crm.rdstation.com/app/deals/`.
- Preservar a estrutura de dados de orçamento existente (`rd_client` / `idClient` no JSON do budget são as chaves de lookup; renomear é opcional mas precisa de migração de dados se feito).
- `server/.env` tem secrets reais commitados — rotacionar como parte da migração.
- Sistema legado destinado a reescrita: evitar over-engineering; troca direta.
