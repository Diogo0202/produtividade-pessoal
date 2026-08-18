import { WEATHER_KNOWLEDGE } from "./weather-knowledge";
import type { Coordinates, ForecastHour, RiskLevel, WeatherEvent, WeatherEventKind, WeatherSnapshot } from "./weather-types";

export const FALLBACK_COORDINATES: Coordinates = { latitude: -23.5505, longitude: -46.6333, label: "São Paulo, SP", source: "demo" };

export function getConditionLabel(code: number) {
  if (code === 0) return "Céu aberto";
  if ([1, 2, 3].includes(code)) return "Parcialmente nublado";
  if ([45, 48].includes(code)) return "Nevoeiro";
  if ([51, 53, 55, 56, 57].includes(code)) return "Garoa";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Chuva";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Neve";
  if ([95, 96, 99].includes(code)) return "Trovoada";
  return "Condições variáveis";
}

export function getConditionIcon(code: number, isDay = true): "sun" | "cloud" | "rain" | "bolt" | "fog" {
  if ([45, 48].includes(code)) return "fog";
  if ([95, 96, 99].includes(code)) return "bolt";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([1, 2, 3].includes(code)) return "cloud";
  return isDay ? "sun" : "cloud";
}

export function formatHour(time: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(time));
}

export function formatDateTime(time: string) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(time));
}

export function formatVisibility(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)} km` : `${Math.round(meters)} m`;
}

function createEvent(kind: WeatherEventKind, level: RiskLevel, hour: ForecastHour, coordinates: Coordinates, index: number, metrics: WeatherEvent["metrics"]): WeatherEvent {
  const knowledge = WEATHER_KNOWLEDGE[kind];
  const titles: Record<WeatherEventKind, string> = {
    chuva: "Possibilidade de chuva intensa",
    vento: "Ventos e rajadas previstos",
    trovoada: "Condição favorável a trovoadas",
    calor: "Estresse térmico previsto",
    visibilidade: "Visibilidade reduzida prevista",
  };
  const offsets = [
    { latitude: 0.008, longitude: -0.01 },
    { latitude: -0.006, longitude: 0.012 },
    { latitude: 0.012, longitude: 0.009 },
    { latitude: -0.012, longitude: -0.007 },
    { latitude: 0.002, longitude: 0.016 },
  ];
  const offset = offsets[index % offsets.length];
  return {
    id: `${kind}-${hour.time}`,
    kind,
    level,
    title: titles[kind],
    shortDescription: `Janela estimada para ${formatHour(hour.time)} · ponto de referência no entorno local.`,
    time: hour.time,
    source: "previsão",
    latitude: coordinates.latitude + offset.latitude,
    longitude: coordinates.longitude + offset.longitude,
    metrics,
  };
}

export function buildWeatherEvents(hours: ForecastHour[], coordinates: Coordinates): WeatherEvent[] {
  const events: WeatherEvent[] = [];
  const inspectedHours = hours.slice(0, 48);
  const hasNearbyEvent = (kind: WeatherEventKind, time: string) => events.some((event) => event.kind === kind && Math.abs(new Date(event.time).getTime() - new Date(time).getTime()) < 5 * 60 * 60 * 1000);

  inspectedHours.forEach((hour) => {
    if ([95, 96, 99].includes(hour.weatherCode) && !hasNearbyEvent("trovoada", hour.time)) {
      events.push(createEvent("trovoada", hour.weatherCode >= 96 ? "alto" : "moderado", hour, coordinates, events.length, [{ label: "Código de tempo", value: "Trovoada" }, { label: "Rajada", value: `${Math.round(hour.gusts)} km/h` }]));
    }
    if ((hour.precipitation >= 7 || (hour.precipitationProbability >= 80 && hour.precipitation >= 2.5)) && !hasNearbyEvent("chuva", hour.time)) {
      events.push(createEvent("chuva", hour.precipitation >= 12 ? "alto" : "moderado", hour, coordinates, events.length, [{ label: "Precipitação", value: `${hour.precipitation.toFixed(1)} mm` }, { label: "Probabilidade", value: `${Math.round(hour.precipitationProbability)}%` }]));
    }
    if (hour.gusts >= 55 && !hasNearbyEvent("vento", hour.time)) {
      events.push(createEvent("vento", hour.gusts >= 75 ? "alto" : "moderado", hour, coordinates, events.length, [{ label: "Rajada", value: `${Math.round(hour.gusts)} km/h` }, { label: "Vento", value: `${Math.round(hour.windSpeed)} km/h` }]));
    }
    if (hour.apparentTemperature >= 35 && hour.uvIndex >= 7 && !hasNearbyEvent("calor", hour.time)) {
      events.push(createEvent("calor", hour.apparentTemperature >= 40 ? "alto" : "moderado", hour, coordinates, events.length, [{ label: "Sensação", value: `${Math.round(hour.apparentTemperature)}°` }, { label: "Índice UV", value: `${hour.uvIndex.toFixed(0)}` }]));
    }
    if (hour.visibility > 0 && hour.visibility <= 1000 && !hasNearbyEvent("visibilidade", hour.time)) {
      events.push(createEvent("visibilidade", hour.visibility <= 500 ? "alto" : "moderado", hour, coordinates, events.length, [{ label: "Visibilidade", value: formatVisibility(hour.visibility) }, { label: "Condição", value: getConditionLabel(hour.weatherCode) }]));
    }
  });

  return events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

export function filterWeatherEvents(events: WeatherEvent[], selectedKinds: WeatherEventKind[] = [], selectedLevels: RiskLevel[] = []) {
  return events.filter((event) => {
    const matchesKind = !selectedKinds.length || selectedKinds.includes(event.kind);
    const matchesLevel = !selectedLevels.length || selectedLevels.includes(event.level);
    return matchesKind && matchesLevel;
  });
}

export function distanceInKm(from: Coordinates, to: Pick<WeatherEvent, "latitude" | "longitude">) {
  const earthRadiusKm = 6371;
  const latitudeDelta = ((to.latitude - from.latitude) * Math.PI) / 180;
  const longitudeDelta = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos((from.latitude * Math.PI) / 180) * Math.cos((to.latitude * Math.PI) / 180) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearbyHighRiskEvents(events: WeatherEvent[], coordinates: Coordinates, radiusKm = 5) {
  return events.filter((event) => event.level === "alto" && distanceInKm(coordinates, event) <= radiusKm);
}

export function parseWeatherResponse(data: any): WeatherSnapshot {
  const current = data.current;
  const hourly = data.hourly;
  return {
    current: {
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      weatherCode: current.weather_code,
      windSpeed: current.wind_speed_10m,
      gusts: current.wind_gusts_10m,
      precipitation: current.precipitation,
      humidity: current.relative_humidity_2m,
      isDay: Boolean(current.is_day),
    },
    hours: hourly.time.map((time: string, index: number) => ({
      time,
      temperature: hourly.temperature_2m[index],
      apparentTemperature: hourly.apparent_temperature[index],
      precipitationProbability: hourly.precipitation_probability[index],
      precipitation: hourly.precipitation[index],
      weatherCode: hourly.weather_code[index],
      windSpeed: hourly.wind_speed_10m[index],
      gusts: hourly.wind_gusts_10m[index],
      visibility: hourly.visibility[index],
      uvIndex: hourly.uv_index[index],
    })),
    updatedAt: new Date().toISOString(),
    timezone: data.timezone,
  };
}
