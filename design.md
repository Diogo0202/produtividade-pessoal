# Plano de Interface Web — Radar do Tempo Educação

## Objetivo da primeira versão

**Radar do Tempo Educação** transforma eventos meteorológicos em atividades guiadas por professor. A versão web privilegia telas largas, leitura coletiva em projetor e acompanhamento sincronizado dos alunos. O professor organiza turmas, escolhe uma cidade e um evento no mapa mundial e controla qual conteúdo aparece aos alunos durante a aula.

## Perfis e entidades

| Entidade | Dados essenciais | Responsabilidade |
|---|---|---|
| Instituição | Nome, cidade e identificador | Agrupa usuários e turmas |
| Professor | Nome, e-mail e instituição | Cria aulas, adiciona alunos e controla a apresentação |
| Aluno | Nome, e-mail e instituição | Acompanha a aula publicada pelo professor |
| Turma | Nome, nível educacional, professor e alunos | Define o contexto pedagógico e o nível de explicação |
| Aula | Turma, cidade, evento ativo e status | Mantém o evento projetado e o modo de apresentação |
| Evento | Tipo, cidade, coordenadas, severidade, fonte e atualização | É selecionado no mapa e compartilhado com a turma |

## Estrutura da interface web

| Área | Professor | Aluno |
|---|---|---|
| Barra superior | Instituição, turma ativa, modo de apresentação e perfil | Instituição, turma acompanhada e indicador de aula ao vivo |
| Navegação lateral | Painel, Minhas aulas, Turmas, Eventos e Alertas | Minha aula, Eventos e Histórico |
| Centro | Mapa mundial com marcadores de eventos e painel de seleção | Evento que está sendo apresentado e mapa de contexto |
| Painel direito | Detalhe do evento, envio à turma, explicações por nível e IA | Explicação selecionada, impactos e mitigação |

## Fluxos prioritários

| Fluxo | Caminho | Resultado |
|---|---|---|
| Criar aula | Professor → “Nova aula” → nome, turma e nível → salvar | Uma aula associada à instituição fica pronta para apresentação |
| Adicionar aluno | Professor → Turma → “Adicionar aluno” → preencher dados | O aluno fica vinculado à turma ativa |
| Apresentar evento | Professor → mapa → cidade/evento → “Enviar à turma” → iniciar apresentação | Todos os alunos no modo aluno veem o evento ativo |
| Adaptar explicação | Professor ou aluno → níveis Leigo/Técnico/Acadêmico → “Adaptar com IA” | A explicação considera o tipo de evento e o nível escolhido |
| Acompanhar aula | Aluno → modo aluno → “Aula ao vivo” | O conteúdo enviado pelo professor aparece com impactos e mitigação |

## Regras de dados e transparência

Eventos são classificados como **monitoramento educativo** e exibem fonte e horário de atualização. Explicações adaptadas por IA são identificadas como conteúdo de apoio e mantêm a fonte meteorológica visível. Nesta primeira interface, dados de aulas, usuários e vínculos permanecem no armazenamento local do navegador como modo demonstrativo; a arquitetura prepara o uso de autenticação e banco de dados em uma evolução posterior.

## Direção visual

A marca combina azul profundo de observatório (`#0D2344`), azul-celeste científico (`#2D8CDA`), âmbar de atenção (`#ECA63D`) e coral para severidade (`#DF5C69`). O mapa ocupa a região central; cartões brancos, grid leve e tipografia de alta legibilidade organizam informações para salas de aula e projetores.
