# Arquitetura da Primeira Versão Educacional

## Escopo implementado

O aplicativo web utiliza um estado educacional compartilhado para representar instituição, professor, alunos, turmas, aula ativa e eventos globais. A interface permite alternar entre as perspectivas de professor e aluno para demonstrar o acompanhamento de aula em tempo real no mesmo navegador. Cadastros, criação de aula, associação de aluno e preferências de apresentação são mantidos localmente para viabilizar o fluxo demonstrativo.

| Requisitos | Entrega da primeira versão |
|---|---|
| RF01–RF05 | Formulários de cadastro de professor/aluno, turma, aula e associação de alunos |
| RF06–RF11 | Mapa mundial com eventos, seleção de cidade, envio à turma e alteração do evento ativo |
| RF12–RF18 | Explicações em três níveis, formação, impactos e medidas de mitigação |
| RF19–RF22 | Preferências de alertas, fonte do dado e histórico de monitoramento |
| RF23–RF24 | Perspectiva de aluno e modo de apresentação controlado pelo professor |
| RF25 | Procedimento de servidor para adaptar explicações usando IA generativa |

## Evolução recomendada

A camada de demonstração deve migrar para tabelas de instituição, perfil educacional, turma, matrícula e sessão de aula. A autenticação OAuth existente pode identificar usuários e o procedimento de IA deve ser protegido por limites de uso e auditoria de solicitações.

