# Orçamento Peraltas — Extensão do Chrome

Esta extensão abre o **orçamento já pré-preenchido** a partir de um lead do Kommo.
Na página de um lead, clique no ícone da extensão e escolha **Hospedagem**,
**Corporativo** ou **Orçamentos do cliente**.

## Como instalar (passo a passo)

1. **Descompacte** este arquivo `.zip` em uma pasta fixa do computador
   (ex.: `Documentos\orcamento-peraltas`). Não apague essa pasta depois —
   o Chrome carrega a extensão de lá.
2. Abra o Chrome e acesse **`chrome://extensions`** (digite na barra de endereço).
3. No canto superior direito, **ative o "Modo do desenvolvedor"**.
4. Clique em **"Carregar sem compactação"** (Load unpacked).
5. Selecione a **pasta** onde você descompactou os arquivos (a que contém o
   `manifest.json`) e confirme.
6. Pronto: o ícone **"Orçamento Peraltas"** aparece na barra de extensões.
   Fixe-o no pino para acesso rápido.

## Como usar

1. Abra um **lead no Kommo** (`https://admperaltasturismo.kommo.com/leads/detail/...`).
2. Clique no ícone da extensão. O popup mostra **"Lead detectado: #..."**.
3. Clique na ação desejada — o orçamento abre já preenchido com os dados do lead.

Fora de uma página de lead, os botões ficam desabilitados e o popup avisa
para abrir um lead.

## Atualização

⚠️ Esta extensão **não se atualiza sozinha**. Quando houver uma nova versão,
baixe o `.zip` mais recente pelo botão de download no sistema de orçamento,
**substitua os arquivos** na mesma pasta e, em `chrome://extensions`, clique no
botão **atualizar/recarregar** da extensão (ou remova e carregue novamente).
