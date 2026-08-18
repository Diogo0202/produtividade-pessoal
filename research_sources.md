# Fontes de dados meteorológicos

O aplicativo combinará previsões por coordenadas com avisos oficiais acessíveis ao usuário. A **Open-Meteo** disponibiliza previsão por latitude e longitude, incluindo variáveis horárias de precipitação, probabilidade de precipitação, vento, rajadas, código meteorológico, visibilidade e índice UV, além de horizonte de previsão de até 16 dias. Esses dados serão usados para identificar **riscos previstos** no entorno do usuário, e não para declarar uma ocorrência observada.

O portal de **Avisos do INMET** exibe avisos meteorológicos por data e estado, sobre um mapa nacional, e informa que seu conteúdo pode ser reproduzido desde que a fonte seja citada. A primeira versão apresentará um acesso contextual a essa fonte oficial e distinguirá visualmente os eventos estimados a partir da previsão dos avisos oficiais.

| Origem | Uso no aplicativo | Limite comunicado ao usuário |
|---|---|---|
| Open-Meteo Weather Forecast API | Condições atuais, previsão e gatilhos de risco baseados em variáveis meteorológicas | Previsão modelada, sujeita a atualização e incerteza local |
| INMET — Avisos | Referência oficial de avisos severos no Brasil | O aviso oficial deve prevalecer sobre a classificação de risco do aplicativo |

## Referências

[1] [Open-Meteo — Weather Forecast API](https://open-meteo.com/en/docs)

[2] [INMET — Avisos Meteorológicos](https://avisos.inmet.gov.br/)
