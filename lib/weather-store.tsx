import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Coordinates, RiskLevel, WeatherEvent, WeatherEventKind, WeatherSnapshot } from "@/lib/weather-types";
import { buildWeatherEvents, FALLBACK_COORDINATES, filterWeatherEvents, getNearbyHighRiskEvents, parseWeatherResponse } from "@/lib/weather-utils";

const FILTER_PREFERENCES_KEY = "radar-tempo-filter-preferences-v1";
const EVENT_KINDS: WeatherEventKind[] = ["trovoada", "chuva", "vento", "calor", "visibilidade"];
const RISK_LEVELS: RiskLevel[] = ["alto", "moderado"];

type LocationState = "initial" | "granted" | "denied" | "unavailable";
type SavedFilterPreferences = { eventKinds?: WeatherEventKind[]; riskLevels?: RiskLevel[] };
type WeatherContextValue = {
  coordinates: Coordinates;
  snapshot: WeatherSnapshot | null;
  events: WeatherEvent[];
  nearbyHighRiskEvents: WeatherEvent[];
  eventCounts: Record<WeatherEventKind, number>;
  activeEventKinds: WeatherEventKind[];
  activeRiskLevels: RiskLevel[];
  preferencesReady: boolean;
  loading: boolean;
  error: string | null;
  locationState: LocationState;
  selectedEvent: WeatherEvent | null;
  requestLocation: () => Promise<void>;
  refresh: (coordinatesOverride?: Coordinates) => Promise<void>;
  selectEvent: (event: WeatherEvent | null) => void;
  toggleEventKind: (kind: WeatherEventKind) => void;
  toggleRiskLevel: (level: RiskLevel) => void;
  clearEventKinds: () => void;
  clearRiskLevels: () => void;
  clearAllFilters: () => void;
};

const WeatherContext = createContext<WeatherContextValue | null>(null);

function forecastUrl(coordinates: Coordinates) {
  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m,precipitation,is_day",
    hourly: "temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,visibility,uv_index",
    forecast_days: "3",
    timezone: "auto",
    wind_speed_unit: "kmh",
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function validKinds(values: unknown): WeatherEventKind[] {
  return Array.isArray(values) ? values.filter((value): value is WeatherEventKind => EVENT_KINDS.includes(value as WeatherEventKind)) : [];
}

function validLevels(values: unknown): RiskLevel[] {
  return Array.isArray(values) ? values.filter((value): value is RiskLevel => RISK_LEVELS.includes(value as RiskLevel)) : [];
}

export function WeatherProvider({ children }: PropsWithChildren) {
  const [coordinates, setCoordinates] = useState<Coordinates>(FALLBACK_COORDINATES);
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationState, setLocationState] = useState<LocationState>("initial");
  const [selectedEvent, setSelectedEvent] = useState<WeatherEvent | null>(null);
  const [activeEventKinds, setActiveEventKinds] = useState<WeatherEventKind[]>([]);
  const [activeRiskLevels, setActiveRiskLevels] = useState<RiskLevel[]>([]);
  const [preferencesReady, setPreferencesReady] = useState(false);

  const refresh = useCallback(async (coordinatesOverride?: Coordinates) => {
    const target = coordinatesOverride ?? coordinates;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(forecastUrl(target));
      if (!response.ok) throw new Error("A fonte meteorológica não respondeu no momento.");
      setSnapshot(parseWeatherResponse(await response.json()));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível atualizar os dados meteorológicos.");
    } finally {
      setLoading(false);
    }
  }, [coordinates]);

  useEffect(() => {
    void refresh(FALLBACK_COORDINATES);
    // A carga inicial usa a localização de demonstração até que a pessoa autorize a posição do aparelho.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    async function restorePreferences() {
      try {
        const raw = await AsyncStorage.getItem(FILTER_PREFERENCES_KEY);
        if (!raw || !active) return;
        const saved = JSON.parse(raw) as SavedFilterPreferences;
        setActiveEventKinds(validKinds(saved.eventKinds));
        setActiveRiskLevels(validLevels(saved.riskLevels));
      } catch {
        // Preferências são auxiliares: o filtro permanece funcional com os valores padrão.
      } finally {
        if (active) setPreferencesReady(true);
      }
    }
    void restorePreferences();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!preferencesReady) return;
    void AsyncStorage.setItem(FILTER_PREFERENCES_KEY, JSON.stringify({ eventKinds: activeEventKinds, riskLevels: activeRiskLevels }));
  }, [activeEventKinds, activeRiskLevels, preferencesReady]);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setLocationState("unavailable");
        setError("Ative os serviços de localização para centralizar o mapa na sua região.");
        return;
      }
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setLocationState("denied");
        setError("A localização não foi autorizada. Mostramos dados de demonstração para São Paulo.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nextCoordinates: Coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude, label: "Sua localização", source: "gps" };
      setCoordinates(nextCoordinates);
      setLocationState("granted");
      await refresh(nextCoordinates);
    } catch {
      setLocationState("unavailable");
      setError("Não foi possível obter sua localização agora. Tente novamente em alguns instantes.");
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const allEvents = useMemo(() => (snapshot ? buildWeatherEvents(snapshot.hours, coordinates) : []), [coordinates, snapshot]);
  const eventCounts = useMemo<Record<WeatherEventKind, number>>(() => ({
    trovoada: allEvents.filter((event) => event.kind === "trovoada").length,
    chuva: allEvents.filter((event) => event.kind === "chuva").length,
    vento: allEvents.filter((event) => event.kind === "vento").length,
    calor: allEvents.filter((event) => event.kind === "calor").length,
    visibilidade: allEvents.filter((event) => event.kind === "visibilidade").length,
  }), [allEvents]);
  const nearbyHighRiskEvents = useMemo(() => getNearbyHighRiskEvents(allEvents, coordinates), [allEvents, coordinates]);
  const events = useMemo(() => filterWeatherEvents(allEvents, activeEventKinds, activeRiskLevels), [activeEventKinds, activeRiskLevels, allEvents]);
  const toggleEventKind = useCallback((kind: WeatherEventKind) => setActiveEventKinds((current) => current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind]), []);
  const toggleRiskLevel = useCallback((level: RiskLevel) => setActiveRiskLevels((current) => current.includes(level) ? current.filter((item) => item !== level) : [...current, level]), []);
  const clearEventKinds = useCallback(() => setActiveEventKinds([]), []);
  const clearRiskLevels = useCallback(() => setActiveRiskLevels([]), []);
  const clearAllFilters = useCallback(() => { setActiveEventKinds([]); setActiveRiskLevels([]); }, []);
  const value = useMemo<WeatherContextValue>(() => ({ coordinates, snapshot, events, nearbyHighRiskEvents, eventCounts, activeEventKinds, activeRiskLevels, preferencesReady, loading, error, locationState, selectedEvent, requestLocation, refresh, selectEvent: setSelectedEvent, toggleEventKind, toggleRiskLevel, clearEventKinds, clearRiskLevels, clearAllFilters }), [coordinates, snapshot, events, nearbyHighRiskEvents, eventCounts, activeEventKinds, activeRiskLevels, preferencesReady, loading, error, locationState, selectedEvent, requestLocation, refresh, toggleEventKind, toggleRiskLevel, clearEventKinds, clearRiskLevels, clearAllFilters]);

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) throw new Error("useWeather deve ser utilizado dentro de WeatherProvider");
  return context;
}
