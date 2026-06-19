# Brief: plugin-distribuicao

## Problem
A extensão de navegador (que abre o orçamento pré-preenchido a partir de um lead do Kommo) é distribuída como um `rd-plugin.zip` **estático** dentro do frontend, atualizado **manualmente**. Resultado: o cliente baixa uma **versão antiga** e é preciso reempacotar na mão a cada mudança. Além disso, o plugin aponta para o app via **IP fixo** (`192.168.10.87:83`), que está sendo trocado por DNS, e ainda carrega **nome/branding do RD** ("rd-plugin"). A instalação no PC do cliente é trabalhosa (baixar zip → ativar modo dev → apontar a pasta).

## Current State
- Plugin em `rd-plugin/` (pasta ainda com nome RD); `manifest.json` já renomeado para "KOMMO PLUGIN PERALTAS" v2.0; `APP_BASE = "http://192.168.10.87:83"` hardcoded em `rd-plugin/script.js`.
- Frontend serve o download via `frontend/public/rd-plugin.zip` (binário estático no repo) com link no `frontend/src/components/Navbar/index.tsx` (`href='/rd-plugin.zip'`).
- CI: só `.github/workflows/docker-build.yml` (build/push das imagens frontend+backend em push na main / tags; contexto de build do frontend = `./frontend`). Nada empacota o plugin.
- App passará a ser servido em `https://orcamento.grupoperaltas.com.br` (HTTPS no ar, confirmado).

## Desired Outcome
- O plugin aponta para `https://orcamento.grupoperaltas.com.br` (configurável, não IP fixo).
- O download no frontend **sempre serve a versão atual** do plugin — empacotada automaticamente pelo CI a cada push, sem passo manual.
- Plugin renomeado para **"Orçamento Peraltas"** (pasta, zip, label do download), com a UI do popup melhorada.
- Um **guia curto de instalação** acompanha o download (já que a instalação segue "load unpacked").

## Approach
**Zip self-hosted empacotado pelo CI** (sem Chrome Web Store por ora — decisão do usuário). O plugin continua sendo instalado via "load unpacked" (sem auto-update), mas o **zip servido é construído a partir do código-fonte no CI**, eliminando o reempacotamento manual e a versão velha. Como o contexto de build do frontend é `./frontend` e o plugin vive na raiz, o CI **zipa o plugin para `frontend/public/<nome>.zip` antes do build da imagem do frontend** (ou um passo equivalente no Dockerfile do frontend). O `rd-plugin.zip` estático sai do versionamento (passa a ser artefato de build, gitignored). `APP_BASE` vira `https://orcamento.grupoperaltas.com.br`.

Justificativa: pesquisa confirmou que `.crx` self-hosted é bloqueado no Windows/Mac para usuário comum e auto-update real só existe via Web Store (ou gestão corporativa) — o usuário optou por manter controle total sem depender do Google. Esta abordagem resolve o problema imediato (versão velha + manual + IP + nome RD) e deixa o caminho aberto para a Web Store no futuro.

## Scope
- **In**:
  - Renomear a pasta `rd-plugin/` → `orcamento-plugin/` (nome a confirmar no design); atualizar `manifest.json` (name "Orçamento Peraltas", description), o nome do zip e o label/atributo `download` no `Navbar`.
  - Trocar `APP_BASE` para `https://orcamento.grupoperaltas.com.br` (constante claramente marcada/config).
  - Melhorar a UI do popup (`index.html`/`style.css`): identidade visual, rótulos claros dos 3 botões (hospedagem, corporativo, lista).
  - Passo de CI no `docker-build.yml` que empacota o plugin em `frontend/public/<nome>.zip` antes do build do frontend, de modo que a imagem do frontend sirva sempre a versão atual.
  - Remover o `rd-plugin.zip` estático do repo e gitignorar o artefato de build.
  - Guia de instalação curto (1 página) entregue junto ao download (no popup, numa página do app, ou README no zip).
- **Out**:
  - Publicação na Chrome Web Store e auto-update via store (deferido; pode ser spec futura).
  - Deploy/infra do DNS e HTTPS em si (feito fora; aqui só consumimos a URL).
  - Mudança da lógica funcional do plugin (extrair lead-id, abrir app) — já entregue em `migracao-crm-kommo`; aqui não se altera comportamento, só base URL/branding/UI/empacotamento.
  - Mecanismo de auto-update (impossível com "load unpacked").

## Boundary Candidates
- Plugin (rename, APP_BASE, UI).
- Pipeline de empacotamento no CI + remoção do zip estático.
- Ponto de download no frontend (Navbar) + guia de instalação.

## Out of Boundary
- Web Store / auto-update.
- Integração CRM (Kommo) — pertence a `migracao-crm-kommo`.
- Configuração de servidor/DNS/HTTPS.

## Upstream / Downstream
- **Upstream**: `migracao-crm-kommo` (a lógica e o manifest atual do plugin vêm de lá); o DNS/HTTPS `orcamento.grupoperaltas.com.br` provisionado.
- **Downstream**: uma futura spec de publicação na Chrome Web Store (auto-update) pode reusar o zip empacotado e os assets de branding.

## Existing Spec Touchpoints
- **Extends/Adjacent**: `migracao-crm-kommo` criou a extensão (`rd-plugin/`, task 4.1) e o link de download. Esta spec **renomeia e reempacota** esses artefatos, sem mexer na lógica de lead-id/abrir-app. Cuidar para não regredir o `extractLeadId` nem os 3 fluxos (hospedagem/corp/lista).

## Constraints
- Contexto de build do frontend no CI = `./frontend`; o plugin (raiz) precisa ser zipado para dentro de `frontend/public/` antes do build (ou mover o fonte do plugin para dentro de `frontend/`).
- Instalação permanece "load unpacked" (modo desenvolvedor) — sem auto-update; o guia deve deixar isso claro.
- `host_permissions` do manifest deve seguir cobrindo o subdomínio do Kommo (`https://admperaltasturismo.kommo.com/*`); a mudança de DNS é só do `APP_BASE` (destino que o popup abre), não exige host permission do app.
- Evitar versionar binário: o zip passa a ser artefato de build.
