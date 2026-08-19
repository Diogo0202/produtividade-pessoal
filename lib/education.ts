export type EducationRole = "teacher" | "student";
export type ExplanationLevel = "leigo" | "técnico" | "acadêmico";
export type EventSeverity = "alto" | "moderado" | "observação";

export type Student = { id: string; name: string; email: string; level: string };
export type Classroom = { id: string; name: string; educationLevel: string; studentIds: string[]; city: string; isPresenting: boolean; activeEventId?: string };
export type LessonEvent = { id: string; city: string; country: string; x: number; y: number; type: "Trovoada" | "Chuva intensa" | "Ventos fortes" | "Onda de calor" | "Baixa visibilidade"; severity: EventSeverity; source: string; updatedAt: string; formation: string; impacts: string[]; mitigation: string[] };

export const EDUCATION_EVENTS: LessonEvent[] = [
  { id: "sao-paulo", city: "São Paulo", country: "Brasil", x: 29, y: 70, type: "Chuva intensa", severity: "alto", source: "Open-Meteo · previsão horária", updatedAt: "Agora", formation: "O encontro de ar quente e úmido com frentes mais frias favorece nuvens de grande desenvolvimento vertical e chuva concentrada.", impacts: ["Alagamentos em vias urbanas", "Redução de visibilidade", "Interrupções no transporte"], mitigation: ["Acompanhar comunicados oficiais", "Evitar áreas alagadas", "Manter rotas alternativas" ] },
  { id: "miami", city: "Miami", country: "Estados Unidos", x: 22, y: 47, type: "Trovoada", severity: "moderado", source: "Open-Meteo · previsão horária", updatedAt: "Há 5 min", formation: "A atmosfera quente e úmida cria correntes de ar ascendentes. Quando a nuvem cresce rapidamente, ela pode gerar raios, vento e chuva forte.", impacts: ["Raios e descargas elétricas", "Rajadas curtas", "Atrasos em aeroportos"], mitigation: ["Buscar abrigo fechado", "Evitar áreas abertas", "Desconectar equipamentos sensíveis" ] },
  { id: "napoles", city: "Nápoles", country: "Itália", x: 51, y: 39, type: "Ventos fortes", severity: "alto", source: "Open-Meteo · previsão horária", updatedAt: "Há 12 min", formation: "Grandes diferenças de pressão atmosférica aceleram o deslocamento do ar, podendo gerar rajadas intensas em zonas costeiras e de relevo.", impacts: ["Queda de galhos", "Risco para embarcações", "Instabilidade em estruturas leves"], mitigation: ["Fixar objetos externos", "Evitar áreas arborizadas", "Consultar alertas marítimos" ] },
  { id: "jaipur", city: "Jaipur", country: "Índia", x: 67, y: 53, type: "Onda de calor", severity: "alto", source: "Open-Meteo · condições atuais", updatedAt: "Há 3 min", formation: "Massas de ar quente persistentes, céu pouco nublado e solo seco podem manter temperaturas elevadas por vários dias.", impacts: ["Estresse térmico", "Aumento do consumo de água", "Risco para grupos vulneráveis"], mitigation: ["Hidratar-se regularmente", "Reduzir esforço no pico do calor", "Priorizar ambientes ventilados" ] },
  { id: "manila", city: "Manila", country: "Filipinas", x: 82, y: 61, type: "Trovoada", severity: "alto", source: "Open-Meteo · previsão horária", updatedAt: "Há 8 min", formation: "Aquecimento intenso e umidade favorecem convecção rápida, criando nuvens com correntes ascendentes e descargas elétricas.", impacts: ["Chuva intensa localizada", "Raios", "Alagamentos rápidos"], mitigation: ["Monitorar nível da água", "Permanecer longe de redes elétricas", "Seguir autoridades locais" ] },
];

export const EXPLANATION_LEVELS: Array<{ id: ExplanationLevel; label: string; description: string }> = [
  { id: "leigo", label: "Leigo", description: "Linguagem simples, com exemplos do cotidiano" },
  { id: "técnico", label: "Técnico", description: "Conceitos e vocabulário meteorológico escolar" },
  { id: "acadêmico", label: "Acadêmico", description: "Conexões com dinâmica atmosférica e análise crítica" },
];

export function defaultExplanation(event: LessonEvent, level: ExplanationLevel) {
  if (level === "leigo") return `${event.type} em ${event.city} acontece quando as condições do ar mudam de forma rápida. ${event.formation} Para a turma, o ponto principal é reconhecer os sinais, entender os possíveis impactos e saber como se proteger.`;
  if (level === "técnico") return `${event.type} em ${event.city}: ${event.formation} A leitura deve relacionar variáveis como temperatura, umidade, pressão, vento e cobertura de nuvens aos impactos territoriais indicados.`;
  return `${event.type} em ${event.city} pode ser analisada como resultado da interação entre dinâmica atmosférica, disponibilidade de umidade, gradientes de pressão e condições de superfície. ${event.formation} Discuta a incerteza da previsão, a escala espacial do fenômeno e as estratégias de redução de risco.`;
}

export function createStudent(name: string, email: string, educationLevel: string): Student {
  return { id: `student-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: name.trim(), email: email.trim(), level: educationLevel };
}
