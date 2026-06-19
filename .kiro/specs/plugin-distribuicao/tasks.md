# Implementation Plan

- [ ] 1. Mover e rebrandar a extensão
- [x] 1.1 Mover o fonte da extensão para dentro do frontend
  - Mover `rd-plugin/` para `frontend/extension/` preservando os arquivos (manifest, script, popup, teste) e o comportamento (extração de lead-id e os 3 fluxos).
  - Confirmar que o destino do app continua no domínio de produção e sem IP fixo, num único ponto de configuração.
  - Observável: o teste `extractLeadId` roda a partir do novo local e passa; `APP_BASE` aponta para o domínio de produção e não há mais o IP antigo no fonte.
  - _Requirements: 2.1, 2.2, 2.3, 6.1, 6.3, 6.4_
- [x] 1.2 Rebranding "Orçamento Peraltas" e melhoria da UI do popup
  - Atualizar o nome/descrição da extensão para "Orçamento Peraltas" e remover qualquer referência a "RD" no manifesto e no popup.
  - Melhorar a interface do popup com rótulos claros das três ações (hospedagem, corporativo, lista do cliente).
  - Observável: ao abrir o popup, a extensão exibe "Orçamento Peraltas" e botões com rótulos claros; nenhuma string "RD" permanece no fonte da extensão.
  - _Requirements: 1.1, 1.2, 1.4_
- [x] 1.3 Guia de instalação dentro do pacote
  - Adicionar um README de instalação no fonte da extensão descrevendo o passo a passo de "load unpacked" e deixando explícito que não há auto-atualização e como obter uma nova versão.
  - Observável: existe um README de instalação no fonte da extensão que será incluído no pacote baixado.
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 2. Empacotamento automático no build
- [x] 2.1 Script de empacotamento da extensão
  - Criar um script Node (usando uma biblioteca de zip multiplataforma) que gera o pacote da extensão a partir do fonte, incluindo o README e excluindo arquivos de teste, e que falha com código de erro se o fonte estiver ausente ou o pacote não puder ser escrito.
  - Observável: executar o script gera o pacote em `frontend/public/` contendo o manifesto, o script e o README, sem os arquivos de teste; uma falha de empacotamento retorna código ≠ 0.
  - _Requirements: 3.1, 3.4, 5.1_
- [x] 2.2 Integrar o empacotamento ao build e remover o binário versionado
  - Encadear o script de empacotamento ao `build` do frontend (rodando no build local e no Dockerfile, sem passo extra de CI); ignorar o artefato gerado no versionamento; e remover o `.zip` estático antigo do repositório.
  - Observável: `yarn build` no frontend produz o pacote servível em `dist/`; o artefato gerado está no `.gitignore`; o `.zip` antigo não está mais versionado.
  - _Requirements: 3.2, 3.3, 4.3_
  - _Depends: 2.1_

- [ ] 3. Download e limpeza
- [ ] 3.1 Atualizar o ponto de download no frontend
  - Apontar o link de download do `Navbar` para o novo nome de artefato e rótulo "Orçamento Peraltas", mantendo um único ponto de download.
  - Observável: o botão de download entrega o novo pacote com rótulo "Orçamento Peraltas"; não há referência ao nome antigo no frontend.
  - _Requirements: 1.3, 4.1, 4.2_
  - _Depends: 2.2_
- [ ] 3.2 Remover a pasta antiga e atualizar notas relacionadas
  - Remover a pasta `rd-plugin/` da raiz (conteúdo já movido) e atualizar as notas/documentos que referenciam o local antigo da extensão.
  - Observável: a pasta raiz antiga não existe mais; o build e o teste do plugin seguem verdes a partir do novo local.
  - _Requirements: 1.2_
  - _Depends: 1.1_

- [ ] 4. Validação
- [ ] 4.1 Testes de empacotamento e preservação de comportamento
  - Cobrir: o pacote gerado contém manifesto/script/README e exclui os testes; o `extractLeadId` continua passando a partir do novo local.
  - Observável: a suíte passa verificando o conteúdo do pacote e a extração de lead-id.
  - _Requirements: 3.1, 5.1, 6.1_
  - _Depends: 2.1_
