# Requirements Document

## Introduction

A extensão de navegador que abre o orçamento pré-preenchido a partir de um lead do Kommo (criada na spec `migracao-crm-kommo`) hoje é distribuída como um arquivo `rd-plugin.zip` estático dentro do frontend, atualizado manualmente. Isso causa três problemas: o consultor baixa uma **versão desatualizada**, o plugin ainda carrega **nome do RD** ("rd-plugin") e aponta o app por **IP fixo** (`192.168.10.87:83`), que está sendo substituído pelo domínio `https://orcamento.grupoperaltas.com.br`.

Esta especificação cobre o **empacotamento e a distribuição** do plugin: renomear/rebrandar para "Orçamento Peraltas", apontar para o domínio de produção, melhorar a UI do popup, e fazer o **CI empacotar o plugin automaticamente** de modo que o download no frontend sempre sirva a versão atual — sem reempacotamento manual. A lógica funcional do plugin (identificar o lead na URL e abrir o app) não muda. A instalação permanece via "load unpacked" (sem auto-update), acompanhada de um guia curto; a publicação na Chrome Web Store fica fora do escopo.

## Boundary Context

- **In scope**:
  - Rebranding do plugin para "Orçamento Peraltas" (nome exibido, nome da pasta/artefato, rótulo do download) e melhoria visual do popup.
  - Apontar o destino do app para `https://orcamento.grupoperaltas.com.br` de forma centralizada/configurável.
  - Empacotamento automático do plugin pelo pipeline de CI, de modo que o download servido pelo frontend seja sempre a versão mais recente do código.
  - Remoção do artefato `.zip` estático do versionamento (passa a ser gerado no build).
  - Guia de instalação curto entregue junto ao download.
- **Out of scope**:
  - Publicação na Chrome Web Store e auto-atualização via loja.
  - Provisionamento de DNS/HTTPS e deploy de infraestrutura.
  - Alteração da lógica funcional do plugin (extração do lead, abertura dos fluxos hospedagem/corporativo/lista).
- **Adjacent expectations**:
  - O domínio `https://orcamento.grupoperaltas.com.br` já está no ar com HTTPS válido.
  - O pipeline de CI já existente constrói e publica a imagem do frontend (o empacotamento do plugin se integra a esse fluxo).
  - O `host_permissions` do manifesto continua cobrindo o subdomínio do Kommo; a mudança de domínio afeta apenas o destino que o popup abre.

## Requirements

### Requirement 1: Rebranding do plugin para "Orçamento Peraltas"
**Objective:** Como gestor do produto, quero que a extensão não carregue mais o nome do RD e tenha identidade "Orçamento Peraltas", para que reflita a ferramenta atual e não confunda o consultor.

#### Acceptance Criteria
1. The Plugin Orçamento Peraltas shall apresentar o nome "Orçamento Peraltas" no navegador (nome e descrição da extensão).
2. The Plugin Orçamento Peraltas shall NOT exibir referências ao "RD" no nome, na descrição ou no rótulo do download.
3. The Frontend shall oferecer o download da extensão com um rótulo e um nome de arquivo alinhados a "Orçamento Peraltas".
4. Where o usuário abre o popup da extensão, the Plugin Orçamento Peraltas shall apresentar uma interface com os rótulos claros das ações disponíveis (orçamento de hospedagem, orçamento corporativo e lista de orçamentos do cliente).

### Requirement 2: Destino do app por domínio de produção
**Objective:** Como consultor comercial, quero que a extensão abra o app pelo domínio de produção, para que continue funcionando após a saída do IP fixo.

#### Acceptance Criteria
1. When a extensão abre qualquer um dos fluxos (hospedagem, corporativo ou lista), the Plugin Orçamento Peraltas shall direcionar para `https://orcamento.grupoperaltas.com.br` com os parâmetros do lead.
2. The Plugin Orçamento Peraltas shall NOT conter o endereço IP fixo antigo (`192.168.10.87:83`).
3. The Plugin Orçamento Peraltas shall manter o endereço de destino do app em um único ponto de configuração, de forma que a troca de ambiente exija alterar apenas um lugar.

### Requirement 3: Empacotamento automático pelo CI
**Objective:** Como mantenedor, quero que o plugin seja empacotado automaticamente quando eu subo as atualizações, para que eu não precise reempacotar e copiar o zip na mão.

#### Acceptance Criteria
1. When uma atualização é enviada e o pipeline de CI é executado, the Pipeline de CI shall empacotar o plugin a partir do código-fonte do repositório.
2. The Pipeline de CI shall disponibilizar o pacote gerado para que o frontend o sirva como download, sem etapa manual de reempacotamento.
3. The Sistema shall NOT manter o pacote `.zip` da extensão versionado no repositório como binário estático (o pacote passa a ser gerado no build).
4. If o empacotamento do plugin falhar durante o CI, then the Pipeline de CI shall falhar a execução de forma visível em vez de publicar um pacote ausente ou desatualizado.

### Requirement 4: Download sempre na versão mais recente
**Objective:** Como consultor comercial, quero baixar sempre a versão atual da extensão, para que eu não instale uma versão antiga sem perceber.

#### Acceptance Criteria
1. When o consultor baixa a extensão pelo frontend, the Frontend shall entregar o pacote correspondente à versão atual do plugin publicada pelo último build.
2. The Frontend shall expor um único ponto de download da extensão (sem múltiplos arquivos conflitantes de versões diferentes).
3. While uma nova versão do plugin não foi publicada por um novo build, the Frontend shall continuar servindo a última versão publicada.

### Requirement 5: Guia de instalação
**Objective:** Como consultor comercial, quero um guia curto de instalação, para que eu consiga instalar a extensão mesmo sem conhecimento técnico.

#### Acceptance Criteria
1. The Sistema shall disponibilizar, junto ao download, um guia curto de instalação da extensão.
2. The guia de instalação shall descrever os passos de instalação por "load unpacked" (modo desenvolvedor) de forma sequencial e objetiva.
3. The guia de instalação shall deixar explícito que a extensão não se atualiza sozinha e como obter uma nova versão.

### Requirement 6: Preservação do comportamento existente
**Objective:** Como consultor comercial, quero que o rebranding e o reempacotamento não quebrem o funcionamento atual, para que a extensão continue abrindo o orçamento corretamente.

#### Acceptance Criteria
1. The Plugin Orçamento Peraltas shall continuar identificando o lead na página de detalhe do Kommo e extraindo seu identificador.
2. When acionado em uma página de lead do Kommo, the Plugin Orçamento Peraltas shall abrir o app pré-preenchido (hospedagem e corporativo) e a lista filtrada pelo lead, como antes.
3. If a página ativa não for uma página de lead do Kommo, then the Plugin Orçamento Peraltas shall não realizar nenhuma ação.
4. The Plugin Orçamento Peraltas shall NOT conter token de CRM nem realizar chamadas de API a partir da extensão.
