import type { WeatherEventKind } from "./weather-types";

export const WEATHER_KNOWLEDGE: Record<WeatherEventKind, { icon: "rain" | "wind" | "bolt" | "thermostat" | "fog"; color: string; formation: string; mitigation: string[]; season: string; officialNote: string }> = {
  chuva: {
    icon: "rain",
    color: "#2E7FC8",
    formation: "Chuva intensa pode se formar quando ar quente e úmido sobe rapidamente, resfria em altitude e condensa em nuvens de grande desenvolvimento vertical.",
    mitigation: ["Evite áreas alagáveis e não atravesse vias com correnteza.", "Mantenha distância de encostas, muros instáveis e redes elétricas.", "Acompanhe avisos oficiais se houver persistência da chuva."],
    season: "É mais frequente em períodos quentes e úmidos, mas varia conforme a região e o sistema meteorológico.",
    officialNote: "Para decisões de segurança, consulte os avisos meteorológicos oficiais vigentes na sua região.",
  },
  vento: {
    icon: "wind",
    color: "#D96B41",
    formation: "Rajadas acontecem quando diferenças de pressão aceleram o ar; tempestades e frentes também podem intensificar o vento perto da superfície.",
    mitigation: ["Afaste-se de árvores, placas, telhados frágeis e estruturas soltas.", "Recolha objetos de áreas externas quando houver tempo para isso.", "Em deslocamento, reduza a velocidade e mantenha as duas mãos no volante."],
    season: "Pode ocorrer em qualquer estação; frentes e linhas de instabilidade costumam trazer mudanças rápidas.",
    officialNote: "Avisos oficiais podem indicar áreas e janelas temporais mais específicas para vento forte.",
  },
  trovoada: {
    icon: "bolt",
    color: "#7957C7",
    formation: "Trovoadas surgem em nuvens convectivas, quando fortes correntes ascendentes favorecem separação de cargas elétricas e descargas atmosféricas.",
    mitigation: ["Procure abrigo em construção fechada ou veículo com teto rígido.", "Evite campo aberto, água, árvores isoladas e objetos metálicos.", "Desconecte equipamentos sensíveis se puder fazê-lo com segurança."],
    season: "Costumam ser mais comuns em tardes quentes e úmidas e durante a passagem de frentes, com variações regionais.",
    officialNote: "Não permaneça exposto ao ar livre quando houver trovoadas próximas ou aviso oficial de tempestade.",
  },
  calor: {
    icon: "thermostat",
    color: "#E99732",
    formation: "O estresse térmico aumenta quando temperatura, umidade, baixa ventilação e radiação solar elevam a sensação de calor do corpo.",
    mitigation: ["Hidrate-se regularmente e priorize locais ventilados ou sombreados.", "Evite atividade física intensa nos horários mais quentes.", "Dê atenção extra a crianças, idosos e pessoas com condições de saúde sensíveis ao calor."],
    season: "É mais provável em períodos de maior insolação e em ondas de calor, que podem acontecer fora do verão.",
    officialNote: "A previsão auxilia o planejamento, mas condições individuais e locais podem mudar a exposição ao calor.",
  },
  visibilidade: {
    icon: "fog",
    color: "#547086",
    formation: "Visibilidade reduzida pode ocorrer por nevoeiro, nuvens baixas, chuva forte ou aerossóis, quando partículas ou gotículas dispersam a luz.",
    mitigation: ["Ao dirigir, reduza a velocidade e aumente a distância do veículo à frente.", "Use farol baixo; evite farol alto em nevoeiro denso.", "Se a visibilidade cair muito, procure um local seguro para aguardar."],
    season: "É mais comum em madrugadas e manhãs com alta umidade, resfriamento noturno e pouco vento, dependendo do relevo local.",
    officialNote: "Em estradas e aeroportos, siga sempre a sinalização e os comunicados operacionais oficiais.",
  },
};
