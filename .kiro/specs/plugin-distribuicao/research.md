# Gap Analysis — plugin-distribuicao

> Gap entre os requisitos (rebranding + DNS + empacotamento automático do plugin) e o código atual. Sem `.kiro/steering/` (contexto derivado do código). Abordagem confirmada na discovery: zip self-hosted empacotado pelo CI, sem Chrome Web Store.

## 1. Resumo

- O plugin vive em `rd-plugin/` (raiz do repo) e é servido como **binário estático versionado** `frontend/public/rd-plugin.zip` (5,5K, **rastreado no git**), com link em `Navbar/index.tsx` (`href='/rd-plugin.zip'`). Atualização do zip é 100% manual → versão velha.
- **Restrição central**: o CI (`docker-build.yml`, job `build-frontend`) faz `docker build` com **`context: ./frontend`**. O plugin (raiz) **não entra** no contexto de build da imagem, então a imagem só "vê" o que está em `frontend/`. Por isso hoje o zip precisa estar pré-colocado em `frontend/public/`.
- O `APP_BASE` já foi trocado para `https://orcamento.grupoperaltas.com.br` (commit direto), e o `manifest.json` já está sem "rd" no nome ("KOMMO PLUGIN PERALTAS"). Resta: renomear pasta/zip/label, rebrand para "Orçamento Peraltas", melhorar UI, e automatizar o empacotamento.
- Decisão-chave de design: **onde o plugin mora** (raiz vs dentro de `frontend/`) determina se o empacotamento é feito no Dockerfile (self-contained) ou num passo de CI antes do build.
- Esforço global: **S–M (1–3 dias)**; risco **Baixo–Médio** (a fiação CI/contexto é o único ponto sensível).

## 2. Mapa Requisito → Ativo (gaps marcados)

| Req | Ativo atual | Gap |
|---|---|---|
| 1 Rebranding "Orçamento Peraltas" | `rd-plugin/manifest.json` (name "KOMMO PLUGIN PERALTAS"), pasta `rd-plugin/`, `Navbar` (`download='RD_Plugin'`, `href='/rd-plugin.zip'`), `index.html`/`style.css` (popup) | **Missing**: nome final "Orçamento Peraltas"; renomear pasta + zip + label; **UI** do popup a melhorar |
| 2 Destino por domínio | `rd-plugin/script.js` `APP_BASE` **já = HTTPS DNS** (feito); IP removido | **Constraint**: já atendido; manter ponto único de config |
| 3 Empacotamento no CI | `.github/workflows/docker-build.yml` (job frontend, `context: ./frontend`); sem passo de zip | **Missing total**: passo que gera o zip do fonte; **Constraint**: contexto `./frontend` (plugin na raiz fora dele); **Constraint**: remover binário do git |
| 4 Download sempre atual | `frontend/public/rd-plugin.zip` estático + `Navbar` link | **Constraint**: zip passa a ser artefato de build; ponto único de download; atualizar o `href`/nome |
| 5 Guia de instalação | inexistente | **Missing total**: guia "load unpacked" (página no app, README no zip, ou doc) |
| 6 Preservar comportamento | `rd-plugin/script.js` (`extractLeadId`, 3 fluxos), `extractLeadId.test.js` | **Constraint**: não regredir; o teste node deve continuar passando após rename |

## 3. Pontos de acoplamento / fatos do código

1. **Contexto de build** `./frontend` (`docker-build.yml`). O Dockerfile faz `COPY . .` (de `frontend/`) → `yarn build` (vite copia `public/*` → `dist/`) → `serve -s dist`. Logo, **o que estiver em `frontend/public/` no momento do build é servido**. O plugin na raiz não é alcançável pelo Dockerfile.
2. `frontend/public/rd-plugin.zip` está **rastreado** e sem regra no `.gitignore` → precisa `git rm` + gitignore do novo artefato.
3. `frontend/package.json` não tem `prebuild`; `build = "tsc && vite build"`. Um passo de empacotamento local precisaria ser adicionado (script) para o download funcionar em build local, não só no CI.
4. `Navbar/index.tsx`: `href='/rd-plugin.zip' download='RD_Plugin'` — atualizar para o novo nome.
5. O checkout do CI (`actions/checkout`) traz o **repo inteiro** (plugin da raiz disponível no runner) — então um passo de CI **antes** do `docker build` consegue zipar a raiz para dentro de `frontend/public/`.

## 4. Opções de implementação

### Opção A — Plugin permanece na raiz; CI zipa para `frontend/public/` antes do build
Passo novo no job `build-frontend` (antes do `docker/build-push-action`): `zip -r frontend/public/orcamento-plugin.zip orcamento-plugin/`. O `docker build` (contexto `./frontend`) então inclui o zip no `dist`. Para build local, adicionar um script (`yarn package:plugin` ou `prebuild`) que zipa de `../orcamento-plugin`. Remover o zip estático do git.
- ✅ Menos reestruturação; plugin continua no lugar atual (criado em `migracao-crm-kommo`).
- ✅ Zip sempre construído do fonte no CI.
- ❌ Dockerfile **não** é self-contained: depende do passo de CI (ou do script local) ter colocado o zip. Build "cru" da imagem sem o pré-passo → download ausente.
- ❌ Caminho `../orcamento-plugin` no script local fica fora do pacote `frontend`.

### Opção B — Mover o fonte do plugin para dentro de `frontend/` (ex.: `frontend/extension/`); Dockerfile/Vite empacota
O fonte do plugin passa a viver no contexto de build. Um passo no Dockerfile (ou `prebuild` do vite) zipa `extension/` → `public/orcamento-plugin.zip` durante o build.
- ✅ **Self-contained**: a imagem sempre contém o zip atual, independente do CI; build local idem.
- ✅ Um único mecanismo (build) para CI e local; sem passo extra de workflow.
- ❌ Move a pasta do plugin (atualiza referências, `extractLeadId.test.js`, e a doc do `migracao-crm-kommo`).
- ❌ Mistura "fonte da extensão" dentro do app web (organização).

### Opção C — Híbrido: mover para `frontend/` (B) + também publicar o zip como artefato/Release no CI
Como B, e o CI ainda anexa o zip a um GitHub Release nas tags (canal alternativo de download/versão).
- ✅ Self-contained + um ponto versionado de releases.
- ❌ Mais peças no workflow do que o necessário para o objetivo atual.

## 5. Esforço & Risco

| Área | Esforço | Risco | Justificativa |
|---|---|---|---|
| Rebranding (nome, pasta, zip, Navbar) | S | Baixo | Renomeações + atualizar referências; teste node guarda regressão |
| UI do popup | S | Baixo | HTML/CSS estático simples |
| Empacotamento no CI/build | S–M | Médio | Fiação do contexto de build; validar que o zip servido = fonte |
| Remover binário do git + gitignore | S | Baixo | `git rm` + regra |
| Guia de instalação | S | Baixo | Conteúdo estático |
| **Global** | **S–M (1–3 dias)** | **Baixo–Médio** | Tecnologia trivial; risco só na automação do empacotamento |

## 6. Recomendações para o design

- **Abordagem preferida**: **Opção B** (mover o fonte do plugin para `frontend/extension/` e empacotar no build) — torna a imagem self-contained, unifica CI e local num só mecanismo, e elimina a fragilidade da Opção A (zip dependente de passo externo). O custo é atualizar referências/doc do `migracao-crm-kommo`.
  - Se o usuário preferir **não mover** a pasta, cair para Opção A com um passo de CI explícito + script local + nota de que a imagem não é self-contained.
- **Decisões a fechar no design**:
  - Nome final da pasta/zip/extensão (ex.: `orcamento-plugin` / "Orçamento Peraltas").
  - Mecanismo de zip (ferramenta disponível no estágio de build node:20-alpine — `zip` não vem por padrão no alpine; usar `apk add zip` ou um zip via Node, ex. `bestzip`/`adm-zip`, para não depender de binário do sistema).
  - Onde entregar o guia de instalação (página no app vs README dentro do zip vs ambos).
  - Versão da extensão: bump manual no `manifest.json` vs injeção automática no build.
- **Research Needed (design)**:
  - Confirmar ferramenta de zip no estágio de build (alpine não tem `zip`; preferir lib Node multiplataforma para funcionar igual em CI e local).
  - Garantir que `vite build` inclui o `public/<zip>` no `dist` (inclui — `public/` é copiado as-is).
- **Tratar junto**: remover `frontend/public/rd-plugin.zip` do versionamento e gitignorar o novo artefato; atualizar o `Navbar` para o novo nome.

## 7. Decisões fechadas com o usuário (2026-06-19)

1. **Local do plugin**: **Opção B** — mover o fonte para **dentro de `frontend/`** (ex.: `frontend/extension/`). O build do frontend empacota o zip (via lib Node multiplataforma, ex. `adm-zip`, já que `node:20-alpine` não tem `zip`), de modo que a imagem é **self-contained** e o mesmo mecanismo vale para CI e build local. Implica atualizar referências e a doc/notes do `migracao-crm-kommo` (a extensão sai da raiz `rd-plugin/`).
2. **Guia de instalação**: **somente um README dentro do zip** (passos de "load unpacked" + aviso de que não auto-atualiza). Sem página no app.
3. (Já aplicado) `APP_BASE` = `https://orcamento.grupoperaltas.com.br`; manter ponto único de config.

Consequências para o design:
- O `package.json` do frontend ganha um passo de empacotamento (ex.: `prebuild`/script) que gera `public/<nome>.zip` a partir de `frontend/extension/` usando a lib Node — roda tanto no `yarn build` local quanto no estágio builder do Dockerfile, sem passo extra no `docker-build.yml`.
- O README de instalação é incluído no conteúdo zipado (dentro de `frontend/extension/`).
- `frontend/public/rd-plugin.zip` sai do git (gitignorar o novo artefato gerado).
- `Navbar` aponta para o novo nome de arquivo/label.
