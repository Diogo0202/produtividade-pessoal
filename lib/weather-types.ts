export type Coordinates = { latitude: number; longitude: number; label: string; source: "gps" | "demo" };

export type RiskLevel = "moderado" | "alto";
export type WeatherEventKind = "chuva" | "vento" | "trovoada" | "calor" | "visibilidade";

export type WeatherEvent = {
  id: string;
  kind: WeatherEventKind;
  level: RiskLevel;
  title: string;
  shortDescription: string;
  time: string;
  source: "previsão";
  latitude: number;
  longitude: number;
  metrics: Array<{ label: string; value: string }>;
};

export type CurrentWeather = {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  windSpeed: number;
  gusts: number;
  precipitation: number;
  humidity: number;
  isDay: boolean;
};

export type ForecastHour = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  gusts: number;
  visibility: number;
  uvIndex: number;
};

export type WeatherSnapshot = {
  current: CurrentWeather;
  hours: ForecastHour[];
  updatedAt: string;
  timezone: string;
};
