import * as Location from "expo-location";
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Coordinates, WeatherEvent, WeatherSnapshot } from "@/lib/weather-types";
import { buildWeatherEvents, FALLBACK_COORDINATES, parseWeatherResponse } from "@/lib/weather-utils";

type LocationState = "initial" | "granted" | "denied" | "unavailable";
type WeatherContextValue = {
  coordinates: Coordinates;
  snapshot: WeatherSnapshot | null;
  events: WeatherEvent[];
  loading: boolean;
  error: string | null;
  locationState: LocationState;
  selectedEvent: WeatherEvent | null;
  requestLocation: () => Promise<void>;
  refresh: (coordinatesOverride?: Coordinates) => Promise<void>;
  selectEvent: (event: WeatherEvent | null) => void;
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

export function WeatherProvider({ children }: PropsWithChildren) {
  const [coordinates, setCoordinates] = useState<Coordinates>(FALLBACK_COORDINATES);
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationState, setLocationState] = useState<LocationState>("initial");
  const [selectedEvent, setSelectedEvent] = useState<WeatherEvent | null>(null);

  const refresh = useCallback(async (coordinatesOverride?: Coordinates) => {
    const target = coordinatesOverride ?? coordinates;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(forecastUrl(target));
      if (!response.ok) throw new Error("A fonte meteorológica não respondeu no momento.");
      const data = parseWeatherResponse(await response.json());
      setSnapshot(data);
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
      const nextCoordinates: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        label: "Sua localização",
        source: "gps",
      };
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

  const events = useMemo(() => (snapshot ? buildWeatherEvents(snapshot.hours, coordinates) : []), [coordinates, snapshot]);
  const value = useMemo<WeatherContextValue>(() => ({ coordinates, snapshot, events, loading, error, locationState, selectedEvent, requestLocation, refresh, selectEvent: setSelectedEvent }), [coordinates, snapshot, events, loading, error, locationState, selectedEvent, requestLocation, refresh]);

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) throw new Error("useWeather deve ser utilizado dentro de WeatherProvider");
  return context;
}
