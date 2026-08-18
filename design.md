# Plano de Interface — Ritmo

## Direção do produto

**Ritmo** é um organizador pessoal para uso diário, em orientação retrato, que une três perguntas em uma mesma experiência: o que preciso fazer agora, onde cabe isso na minha semana e como isso contribui para uma meta. A interface prioriza leitura rápida, ações ao alcance do polegar e dados locais no dispositivo, sem conta ou sincronização em nuvem nesta primeira versão.

## Lista de telas

| Tela | Conteúdo principal | Funções principais |
|---|---|---|
| Hoje | Saudação contextual, resumo do dia, progresso, próxima tarefa e lista de tarefas de hoje | Marcar tarefa como concluída, abrir criação rápida e navegar para as áreas do produto |
| Tarefas | Lista filtrável por estado, prioridade e prazo | Criar, concluir, editar e excluir tarefas; associar cada tarefa a uma meta opcional |
| Planejar | Faixa de dias da semana, linha do tempo diária e blocos de tarefas agendadas | Selecionar o dia, ver tarefas com horário e abrir nova tarefa com data/hora |
| Metas | Cartões de metas com progresso mensurável e tarefas vinculadas | Criar meta, atualizar progresso e encerrar uma meta quando concluída |
| Criar / editar tarefa | Formulário em folha modal com título, prioridade, data, horário e meta | Salvar uma tarefa completa ou criar uma tarefa simples sem planejamento |
| Criar / editar meta | Formulário em folha modal com título, horizonte, valor-meta e unidade | Salvar uma meta e ajustar o progresso atual |

## Fluxos prioritários

| Fluxo | Caminho | Resultado esperado |
|---|---|---|
| Capturar uma tarefa | Botão flutuante “+” → folha de tarefa → preencher título → salvar | A tarefa aparece em “Hoje” ou em “Tarefas” e fica salva localmente |
| Planejar o dia | Aba “Planejar” → selecionar data → tocar no horário ou “Adicionar bloco” → salvar tarefa | A atividade é organizada na linha do tempo do dia escolhido |
| Concluir uma tarefa | Hoje ou Tarefas → tocar no círculo de conclusão | O estado muda imediatamente, o resumo diário é recalculado e há confirmação tátil discreta em dispositivos compatíveis |
| Acompanhar uma meta | Aba “Metas” → criar ou abrir uma meta → ajustar progresso | O cartão atualiza a porcentagem e evidencia o avanço até o resultado desejado |

## Modelo de dados local

| Entidade | Campos essenciais | Regras de relacionamento |
|---|---|---|
| Tarefa | id, título, concluída, prioridade, data, hora, duração, metaId, criadoEm | Uma tarefa pode estar vinculada a zero ou uma meta |
| Meta | id, título, unidade, valorAtual, valorMeta, prazo, cor | Uma meta pode reunir muitas tarefas |
| Preferências | início do dia, formato de horário, data do último acesso | Mantidas para futura personalização, sem conta de usuário |

## Linguagem visual e layout

O estilo segue a clareza e o equilíbrio de aplicativos nativos do iOS: superfícies suaves, hierarquia tipográfica ampla, barras de navegação compactas e feedback por toque. A tela “Hoje” mantém o conteúdo mais acionável no primeiro terço vertical; o botão de criação fica no canto inferior direito, dentro do alcance do polegar. Formulários são apresentados em folha modal para preservar o contexto da tela anterior.

| Elemento | Escolha | Uso |
|---|---|---|
| Cor principal | `#3B5BDB` (índigo ritmado) | Ações primárias, seleção e indicadores de foco |
| Fundo | `#F7F8FC` | Fundo leve que separa cartões sem ruído visual |
| Superfície | `#FFFFFF` | Cartões, folhas e campos de formulário |
| Texto | `#1D2433` | Títulos e conteúdo de alta importância |
| Texto secundário | `#697386` | Metadados, rótulos e informações auxiliares |
| Progresso | `#2F9E78` | Sucesso, progresso concluído e metas alcançadas |
| Atenção | `#E58C33` | Prioridade média e prazos próximos |
| Urgência | `#D9485F` | Prioridade alta e ações destrutivas |

## Critérios de qualidade

Cada ação visível terá um resultado concreto, sem botões inativos. O conteúdo precisa permanecer confortável em telas pequenas, respeitar áreas seguras e usar textos em português claros. Dados são persistidos em armazenamento local e cálculos de progresso são derivados das tarefas e metas existentes.
