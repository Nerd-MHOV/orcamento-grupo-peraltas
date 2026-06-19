# Requirements Document

## Introduction

A empresa migrou o CRM de **RD Station** para **Kommo**. O sistema de orçamento (frontend React + backend Node, mais a extensão de navegador `rd-plugin/`) ainda integra com o RD Station em dois fluxos operacionais críticos: alimentar o lead com os dados após gerar o orçamento (PUSH) e abrir o orçamento já pré-preenchido a partir de um lead (PULL, via extensão). Esta especificação cobre a migração desses fluxos para o Kommo, incluindo um requisito novo — **anexar o PDF do orçamento ao lead** — que o RD não suportava. A migração também desativa os cronjobs que ainda escrevem no RD Station e remove credenciais e código RD obsoletos.

A autenticação passa a usar uma **integração privada única da conta** com **token de longa duração** (Bearer), substituindo os tokens por usuário do RD. A troca de etapa do lead no pipeline **deixa de ser feita pelo sistema** — passa a ser ação manual do consultor dentro do Kommo, tendo o PDF anexado como gatilho visual. A abordagem é de **troca direta** sobre o sistema legado (sem camada de abstração de CRM), pois o sistema será reescrito futuramente.

## Boundary Context

- **In scope**:
  - Escrita dos dados do orçamento no lead do Kommo (campos: check-in, check-out, adt, chd e idades, pet) para os fluxos de **hospedagem e corporativo**.
  - Registro no lead do **valor do orçamento** e dos **tarifários usados**, para fins de relatório de vendas no Kommo (substitui o espelhamento de `deal_products` do RD).
  - Anexação do PDF do orçamento ao lead do Kommo no momento da geração do PDF.
  - Pré-preenchimento do orçamento (hospedagem e corporativo) a partir dos dados do lead do Kommo.
  - Extensão de navegador que abre o orçamento pré-preenchido lendo o lead via o backend do sistema (proxy), sem expor o token.
  - Autenticação por token único de longa duração e descoberta/mapeamento dos campos personalizados do Kommo.
  - Desativação dos cronjobs que ainda escrevem no RD Station e remoção de credenciais/código RD.
- **Out of scope**:
  - Troca de etapa do lead no pipeline pelo sistema (passa a ser manual no Kommo).
  - Reimplementação no Kommo das automações de cron (apenas desativação).
  - Cronjobs que não tocam CRM (Google Forms e App Hotel) permanecem ativos e inalterados.
  - **Integração ChatGuru**: descontinuada (mensageria passa a ser feita pelo Kommo) — o fluxo migrado não dispara ChatGuru.
  - Reescrita futura do sistema em outra stack.
- **Adjacent expectations**:
  - A conta Kommo precisa estar provisionada com uma integração privada e um token de longa duração com escopo de **acesso a arquivos** (necessário para anexar PDF).
  - Os IDs dos campos personalizados e o padrão de URL da página de lead do Kommo são fornecidos pela conta Kommo e descobertos via API.

## Requirements

### Requirement 1: Autenticação e configuração do Kommo
**Objective:** Como administrador do sistema, quero que a integração com o CRM use um único token de longa duração da conta Kommo, para que a autenticação seja simples, centralizada e sem manutenção de tokens por usuário.

#### Acceptance Criteria
1. The Sistema de Orçamento shall autenticar todas as chamadas ao Kommo usando um único token de longa duração da conta, enviado como credencial Bearer.
2. The Sistema de Orçamento shall obter o subdomínio da conta e o token do Kommo a partir de configuração de ambiente, sem valores fixos no código.
3. When o orçamento é gerado, salvo ou pré-preenchido, the Sistema de Orçamento shall usar o token único da conta em vez de qualquer token associado ao usuário logado.
4. The Sistema de Orçamento shall remover do cadastro de usuários os campos de credencial específicos do RD Station (token e identificador RD por usuário), pois deixam de ser usados.
5. If o token do Kommo estiver ausente, inválido ou expirado, then the Sistema de Orçamento shall registrar o erro e informar que a sincronização com o CRM está indisponível, sem interromper o trabalho local do consultor.

### Requirement 2: Mapeamento dos campos do lead no Kommo
**Objective:** Como integrador, quero que o sistema saiba quais campos do lead no Kommo correspondem a cada dado do orçamento, para que a leitura e a escrita usem os campos corretos.

#### Acceptance Criteria
1. The Sistema de Orçamento shall manter um mapeamento configurável entre os dados do orçamento (check-in, check-out, adt, chd e idades, pet) e os campos personalizados correspondentes do lead no Kommo.
2. Where os IDs dos campos personalizados do Kommo ainda não forem conhecidos, the Sistema de Orçamento shall permitir descobri-los consultando a definição de campos personalizados da conta Kommo.
3. If um campo personalizado mapeado não existir no lead consultado, then the Sistema de Orçamento shall tratar o valor como vazio em vez de falhar.

### Requirement 3: Alimentar o lead ao salvar o orçamento
**Objective:** Como consultor comercial, quero que, ao salvar um orçamento, os dados sejam gravados no lead correspondente do Kommo, para que o CRM reflita as informações do atendimento.

#### Acceptance Criteria
1. When um orçamento de hospedagem é salvo e está vinculado a um lead do Kommo, the Sistema de Orçamento shall gravar no lead os campos de check-in, check-out, adt, chd e idades, e pet.
2. When um orçamento corporativo é salvo e está vinculado a um lead do Kommo, the Sistema de Orçamento shall gravar no lead os campos correspondentes do orçamento corporativo.
3. When um orçamento é salvo e está vinculado a um lead do Kommo, the Sistema de Orçamento shall registrar no lead o valor do orçamento e os tarifários usados, de forma recuperável para relatórios de vendas.
4. The Sistema de Orçamento shall preservar os demais campos já existentes no lead ao gravar, atualizando apenas os campos do orçamento.
5. The Sistema de Orçamento shall NOT alterar a etapa (estágio de pipeline) do lead ao gravar os dados.
6. The Sistema de Orçamento shall NOT acionar a integração ChatGuru ao gravar os dados do orçamento.
7. If o orçamento não estiver vinculado a um lead do Kommo, then the Sistema de Orçamento shall salvar o orçamento normalmente sem tentar gravar no CRM.

### Requirement 4: Anexar o PDF do orçamento ao lead
**Objective:** Como consultor comercial, quero que o PDF do orçamento seja anexado ao lead do Kommo quando eu o gero, para que o documento fique disponível no CRM e sirva de gatilho para eu avançar o lead de etapa manualmente.

#### Acceptance Criteria
1. When o consultor gera o PDF de um orçamento vinculado a um lead do Kommo, the Sistema de Orçamento shall anexar o PDF gerado ao lead correspondente.
2. The Sistema de Orçamento shall realizar a anexação do PDF de forma que o token do CRM não seja exposto ao navegador do consultor.
3. When o PDF é anexado com sucesso, the Sistema de Orçamento shall confirmar ao consultor que o documento foi enviado ao lead.
4. Where a conta Kommo exigir escopo de acesso a arquivos para anexação, the Sistema de Orçamento shall depender desse escopo estar habilitado no token configurado.
5. If a geração ou anexação do PDF falhar, then the Sistema de Orçamento shall continuar disponibilizando o PDF ao consultor localmente e informar que o envio ao lead falhou.

### Requirement 5: Resiliência da sincronização com o CRM
**Objective:** Como consultor comercial, quero que falhas de comunicação com o Kommo não me impeçam de salvar orçamentos ou obter o PDF, para que meu trabalho não pare quando o CRM estiver indisponível.

#### Acceptance Criteria
1. If a gravação de dados no lead falhar, then the Sistema de Orçamento shall concluir o salvamento do orçamento e informar que a sincronização com o Kommo não foi realizada.
2. If a anexação do PDF ao lead falhar, then the Sistema de Orçamento shall manter o PDF disponível para o consultor e informar a falha de envio.
3. The Sistema de Orçamento shall registrar as falhas de integração com o Kommo de forma que possam ser auditadas posteriormente.
4. The Sistema de Orçamento shall respeitar o limite de requisições da API do Kommo, evitando exceder a taxa máxima permitida pela conta.

### Requirement 6: Pré-preenchimento do orçamento a partir do lead
**Objective:** Como consultor comercial, quero abrir o orçamento já preenchido com os dados do lead do Kommo, para que eu não precise redigitar informações do atendimento.

#### Acceptance Criteria
1. When o orçamento é aberto com a referência de um lead do Kommo, the Sistema de Orçamento shall consultar o lead e pré-preencher os campos de check-in, check-out, adt, chd e idades, e pet (conforme o fluxo de hospedagem ou corporativo).
2. When um lead é consultado para confirmação, the Sistema de Orçamento shall exibir o nome do cliente associado ao lead.
3. If algum dado do lead estiver ausente, then the Sistema de Orçamento shall abrir o orçamento com os campos disponíveis preenchidos e os demais em branco.
4. If a referência de lead informada não corresponder a um lead existente no Kommo, then the Sistema de Orçamento shall abrir o orçamento sem dados pré-preenchidos e indicar que o lead não foi encontrado.

### Requirement 7: Extensão de navegador para abrir o orçamento pré-preenchido
**Objective:** Como consultor comercial, quero acionar a abertura do orçamento pré-preenchido a partir da página de um lead no Kommo, para que eu inicie o orçamento direto do CRM, como fazia antes com o RD Station.

#### Acceptance Criteria
1. While o consultor está na página de detalhe de um lead no Kommo, when ele aciona a extensão, the Extensão shall identificar o lead atual e abrir o orçamento (hospedagem ou corporativo) pré-preenchido com os dados desse lead.
2. While o consultor está na página de detalhe de um lead no Kommo, when ele aciona a opção de listagem, the Extensão shall abrir a lista de orçamentos filtrada pelo lead atual.
3. The Extensão shall obter os dados do lead por meio do backend do sistema, sem conter o token do Kommo no seu próprio código.
4. If a página ativa não for uma página de lead do Kommo, then the Extensão shall não realizar nenhuma ação.
5. The Sistema de Orçamento shall expor ao acesso da extensão a consulta dos dados de um lead a partir do seu identificador, mantendo o token do CRM apenas no servidor.

### Requirement 8: Desativação dos cronjobs que escrevem no RD Station
**Objective:** Como operador do sistema, quero que as rotinas automáticas que ainda escrevem no RD Station sejam desativadas, para que nada continue tentando atualizar o CRM antigo após a migração.

#### Acceptance Criteria
1. The Sistema de Orçamento shall desativar a rotina periódica que marca orçamentos vencidos e atualiza o status no RD Station.
2. The Sistema de Orçamento shall desativar a rotina periódica de automação de pós-venda que avança etapas e grava dados no RD Station.
3. The Sistema de Orçamento shall manter ativas e inalteradas as rotinas que não tocam o CRM (integração de formulários e atualização de dados do app do hotel).
4. The Sistema de Orçamento shall garantir que nenhum gatilho manual remanescente das rotinas desativadas execute escrita no RD Station.

### Requirement 9: Remoção das integrações legadas (RD Station e ChatGuru) e rotação de credenciais
**Objective:** Como administrador do sistema, quero remover o código e as credenciais das integrações legadas (RD Station e ChatGuru) dos fluxos migrados, para que não restem segredos expostos nem caminhos que apontem para serviços descontinuados.

#### Acceptance Criteria
1. The Sistema de Orçamento shall remover as configurações de ambiente e as credenciais específicas do RD Station que deixam de ser usadas.
2. The Sistema de Orçamento shall rotacionar ou invalidar quaisquer credenciais sensíveis que estejam versionadas no repositório como parte da migração.
3. The Sistema de Orçamento shall remover ou neutralizar os caminhos de código que realizam chamadas ao RD Station nos fluxos migrados.
4. After a migração, the Sistema de Orçamento shall não realizar nenhuma chamada ao RD Station nos fluxos de gerar, salvar e pré-preencher orçamento.
5. The Sistema de Orçamento shall remover ou neutralizar a chamada à integração ChatGuru no fluxo de salvar orçamento, já que a mensageria passa a ser feita pelo Kommo.
