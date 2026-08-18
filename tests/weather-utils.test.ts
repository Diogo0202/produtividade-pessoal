import { describe, expect, it } from "vitest";

import { buildWeatherEvents, filterWeatherEvents, getConditionLabel, getNearbyHighRiskEvents, mergeAlertHistory, parseWeatherResponse } from "../lib/weather-utils";

const coordinates = { latitude: -23.5505, longitude: -46.6333, label: "São Paulo, SP", source: "demo" as const };

describe("utilitários meteorológicos", () => {
  it("traduz códigos meteorológicos para condições legíveis", () => {
    expect(getConditionLabel(0)).toBe("Céu aberto");
    expect(getConditionLabel(95)).toBe("Trovoada");
  });

  it("classifica sinais de chuva, vento, trovoada, calor e baixa visibilidade", () => {
    const events = buildWeatherEvents([
      { time: "2026-08-19T12:00", temperature: 34, apparentTemperature: 38, precipitationProbability: 90, precipitation: 14, weatherCode: 95, windSpeed: 34, gusts: 78, visibility: 400, uvIndex: 8 },
    ], coordinates);
    expect(events.map((event) => event.kind)).toEqual(["trovoada", "chuva", "vento", "calor", "visibilidade"]);
    expect(events.find((event) => event.kind === "calor")?.level).toBe("moderado");
    expect(events.find((event) => event.kind === "trovoada")?.level).toBe("moderado");
    expect(events.find((event) => event.kind === "chuva")?.level).toBe("alto");
    expect(events.find((event) => event.kind === "vento")?.level).toBe("alto");
    expect(events.find((event) => event.kind === "visibilidade")?.level).toBe("alto");
  });

  it("transforma a resposta externa em um formato estável para as telas", () => {
    const snapshot = parseWeatherResponse({
      timezone: "America/Sao_Paulo",
      current: { temperature_2m: 25.4, apparent_temperature: 26, relative_humidity_2m: 70, weather_code: 2, wind_speed_10m: 16, wind_gusts_10m: 31, precipitation: 0, is_day: 1 },
      hourly: { time: ["2026-08-19T12:00"], temperature_2m: [25.4], apparent_temperature: [26], precipitation_probability: [25], precipitation: [0], weather_code: [2], wind_speed_10m: [16], wind_gusts_10m: [31], visibility: [10000], uv_index: [4] },
    });
    expect(snapshot.current.temperature).toBe(25.4);
    expect(snapshot.hours[0].visibility).toBe(10000);
  });

  it("filtra eventos por múltiplos tipos sem alterar a lista original", () => {
    const events = buildWeatherEvents([{ time: "2026-08-19T12:00", temperature: 34, apparentTemperature: 38, precipitationProbability: 90, precipitation: 14, weatherCode: 95, windSpeed: 34, gusts: 78, visibility: 400, uvIndex: 8 }], coordinates);
    expect(filterWeatherEvents(events, ["trovoada", "calor"]).map((event) => event.kind)).toEqual(["trovoada", "calor"]);
    expect(filterWeatherEvents(events, [])).toHaveLength(events.length);
  });

  it("combina filtros de tipo e severidade para priorizar eventos perigosos", () => {
    const events = buildWeatherEvents([{ time: "2026-08-19T12:00", temperature: 34, apparentTemperature: 38, precipitationProbability: 90, precipitation: 14, weatherCode: 95, windSpeed: 34, gusts: 78, visibility: 400, uvIndex: 8 }], coordinates);
    expect(filterWeatherEvents(events, [], ["alto"]).every((event) => event.level === "alto")).toBe(true);
    expect(filterWeatherEvents(events, ["chuva", "trovoada"], ["alto"]).map((event) => event.kind)).toEqual(["chuva"]);
  });

  it("destaca apenas riscos altos dentro do entorno configurado", () => {
    const events = buildWeatherEvents([{ time: "2026-08-19T12:00", temperature: 34, apparentTemperature: 38, precipitationProbability: 90, precipitation: 14, weatherCode: 95, windSpeed: 34, gusts: 78, visibility: 400, uvIndex: 8 }], coordinates);
    expect(getNearbyHighRiskEvents(events, coordinates).map((event) => event.kind)).toEqual(["chuva", "vento", "visibilidade"]);
    expect(getNearbyHighRiskEvents(events, coordinates, 0.1)).toHaveLength(0);
  });

  it("registra alertas locais sem duplicar eventos já identificados", () => {
    const events = buildWeatherEvents([{ time: "2026-08-19T12:00", temperature: 34, apparentTemperature: 38, precipitationProbability: 90, precipitation: 14, weatherCode: 95, windSpeed: 34, gusts: 78, visibility: 400, uvIndex: 8 }], coordinates);
    const highRisk = getNearbyHighRiskEvents(events, coordinates);
    const firstRecord = mergeAlertHistory([], highRisk, coordinates, "2026-08-19T10:00:00.000Z");
    const updatedRecord = mergeAlertHistory(firstRecord, highRisk, coordinates, "2026-08-19T11:00:00.000Z");
    expect(firstRecord).toHaveLength(3);
    expect(updatedRecord).toHaveLength(3);
    expect(updatedRecord[0].regionLabel).toBe("São Paulo, SP");
  });
});
