import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function SearchBar({ value, onChangeText }: Props) {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Sök produkter..."
        style={{ fontSize: 16, flex: 1 }}
      />

      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText("")}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "#e5e7eb",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 8,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#374151" }}>
            ×
          </Text>
        </Pressable>
      )}
    </View>
  );
}