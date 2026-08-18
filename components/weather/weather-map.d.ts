import type { ReactElement } from "react";

import type { Coordinates, WeatherEvent } from "@/lib/weather-types";

export declare function WeatherMap(props: {
  coordinates: Coordinates;
  events: WeatherEvent[];
  onEventPress: (event: WeatherEvent) => void;
}): ReactElement;
