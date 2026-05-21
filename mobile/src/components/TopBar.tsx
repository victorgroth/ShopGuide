import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  backLabel?: string;
};

export default function TopBar({ title, subtitle, backLabel = "Tillbaka" }: Props) {
  return (
    <View
      style={{
        backgroundColor: "#f5f7f6",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        zIndex: 10,
      }}
    >
      <Pressable
        onPress={() => router.back()}
        style={{
          alignSelf: "flex-start",
          marginBottom: 8,
          backgroundColor: "#dcfce7",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#166534", fontWeight: "800" }}>
          ← {backLabel}
        </Text>
      </Pressable>

      <Text style={{ fontSize: 26, fontWeight: "900", color: "#064e3b" }}>
        {title}
      </Text>

      {subtitle && (
        <Text style={{ color: "#6b7280", marginTop: 2 }}>{subtitle}</Text>
      )}
    </View>
  );
}