# Plano de Interface — Radar do Tempo

## Direção do produto

**Radar do Tempo** é um aplicativo de consciência meteorológica para orientação retrato e uso rápido com uma mão. Ele combina a localização atual do usuário, previsão por coordenadas e sinais de risco derivados de variáveis meteorológicas. A interface deve diferenciar de maneira inequívoca **risco previsto** de **aviso oficial**, evitando apresentar previsões modeladas como um alerta confirmado.

## Lista de telas

| Tela | Conteúdo e estrutura | Funcionalidade principal |
|---|---|---|
| Mapa | Mapa de contexto, ponto da localização, marcadores de eventos previstos e pílula de atualização | Visualizar os riscos no entorno e tocar um marcador para abrir seu detalhe |
| Agora | Resumo de temperatura, condição atual, vento, UV, precipitação e faixa de confiança da previsão | Atualizar dados e abrir a visualização no mapa |
| Eventos | Lista ordenada por severidade e hora prevista, com fonte e status do evento | Filtrar riscos e abrir a ficha de cada fenômeno |
| Ficha do evento | Severidade, janela estimada, sinais que levaram à classificação, formação, mitigação, estação mais comum e fonte | Ler orientações de segurança e consultar o aviso oficial quando disponível |
| Sobre os dados | Data/hora da atualização, modelo de previsão, legenda de risco e link para avisos oficiais | Dar transparência à origem, atualização e limites das informações |

## Fluxos prioritários

| Fluxo | Caminho | Resultado |
|---|---|---|
| Ver o cenário local | Abrir aplicativo → conceder localização durante o uso → dados por coordenadas são carregados | O mapa centraliza o usuário e exibe condições e riscos previstos no entorno |
| Explorar um risco | Tocar marcador no mapa ou item da lista → abrir folha de detalhe | O usuário entende o tipo, a janela de ocorrência, os gatilhos do modelo e ações de mitigação |
| Ver a condição atual | Aba “Agora” → tocar “Atualizar” | A tela consulta a previsão novamente e informa o horário da resposta |
| Conferir alertas oficiais | Detalhe de evento → “Ver avisos oficiais” | O usuário é direcionado à página de avisos do INMET, identificada como fonte externa |

## Regras de classificação de riscos previstos

| Risco exibido | Sinais de previsão usados | Linguagem na interface |
|---|---|---|
| Chuva intensa | Probabilidade alta de precipitação e acumulado horário elevado | “Possibilidade de chuva intensa” |
| Rajadas fortes | Rajada prevista elevada | “Ventos e rajadas previstos” |
| Trovoadas | Código de tempo com trovoada ou instabilidade convectiva | “Condição favorável a trovoadas” |
| Calor intenso | Temperatura aparente elevada e UV alto | “Estresse térmico previsto” |
| Baixa visibilidade | Visibilidade prevista reduzida | “Visibilidade reduzida prevista” |

## Linguagem visual e layout

O mapa ocupa o plano principal da tela e recebe uma folha de resumo arredondada na base, mantendo as ações frequentes dentro do alcance do polegar. Azul-noturno e azul-oceano organizam a identidade de confiança; laranja, rosa e violeta são reservados exclusivamente aos níveis de risco. Marcadores devem usar símbolos simples, rótulos curtos e contraste alto, sem depender somente da cor.

| Token | Cor | Uso |
|---|---|---|
| Horizonte | `#0B1B3A` | Fundo de cabeçalhos e contexto noturno |
| Oceano | `#1677C8` | Ações primárias, localização e elementos navegacionais |
| Céu | `#EAF4FF` | Superfícies informativas e áreas de mapa auxiliares |
| Atenção | `#E48B2C` | Risco moderado e precipitação relevante |
| Severo | `#D95363` | Risco elevado e avisos que exigem atenção imediata |
| Informação | `#7856C8` | Trovoadas, fenômenos elétricos e conteúdo educativo |
| Texto | `#18243A` | Hierarquia tipográfica principal |

## Critérios de qualidade

O aplicativo solicitará somente permissão de localização em primeiro plano e continuará útil com uma localização de demonstração caso a autorização seja negada. Cada evento mostrará sua categoria, hora aproximada, fonte e a distinção entre previsão e aviso oficial. Dados reais são buscados por coordenadas no momento da atualização; conteúdos educativos permanecem locais e não devem ser interpretados como orientação de emergência substitutiva.
