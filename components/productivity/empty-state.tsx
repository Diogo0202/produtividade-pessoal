import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

export function EmptyState({ icon, title, description, actionLabel, onAction }: { icon: "checklist" | "calendar" | "target"; title: string; description: string; actionLabel: string; onAction: () => void }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconBubble}><IconSymbol name={icon} size={28} color="#3B5BDB" /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable onPress={onAction} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingHorizontal: 30, paddingTop: 28, paddingBottom: 22 },
  iconBubble: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#E9EDFF", alignItems: "center", justifyContent: "center", marginBottom: 15 },
  title: { color: "#283042", fontSize: 18, lineHeight: 24, fontWeight: "800", textAlign: "center" },
  description: { color: "#788295", fontSize: 14, lineHeight: 20, fontWeight: "550", textAlign: "center", marginTop: 5 },
  button: { backgroundColor: "#E9EDFF", borderRadius: 13, paddingHorizontal: 16, paddingVertical: 11, marginTop: 17 },
  buttonText: { color: "#3B5BDB", fontSize: 14, lineHeight: 19, fontWeight: "800" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
} as any);
