import MapView, { Circle, Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { StyleSheet, View } from "react-native";

import { WeatherMarker } from "@/components/weather/weather-marker";
import type { Coordinates, WeatherEvent } from "@/lib/weather-types";

export function WeatherMap({ coordinates, events, onEventPress }: { coordinates: Coordinates; events: WeatherEvent[]; onEventPress: (event: WeatherEvent) => void }) {
  return (
    <View style={styles.wrap}>
      <MapView provider={PROVIDER_DEFAULT} style={StyleSheet.absoluteFill} initialRegion={{ latitude: coordinates.latitude, longitude: coordinates.longitude, latitudeDelta: 0.075, longitudeDelta: 0.075 }} region={{ latitude: coordinates.latitude, longitude: coordinates.longitude, latitudeDelta: 0.075, longitudeDelta: 0.075 }}>
        <Circle center={{ latitude: coordinates.latitude, longitude: coordinates.longitude }} radius={2600} strokeColor="rgba(22,119,200,0.38)" fillColor="rgba(22,119,200,0.10)" />
        <Marker coordinate={{ latitude: coordinates.latitude, longitude: coordinates.longitude }} title={coordinates.label} pinColor="#1677C8" />
        {events.map((event) => <WeatherMarker key={event.id} event={event} onPress={() => onEventPress(event)} />)}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { flex: 1, overflow: "hidden" } });
