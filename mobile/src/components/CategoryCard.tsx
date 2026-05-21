import { Pressable, Text } from "react-native";

type Props = {
  category: string;
  onPress: () => void;
};

export default function CategoryCard({ category, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 16,
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 10,
        backgroundColor: "#f9fafb",
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "700" }}>{category}</Text>
      <Text style={{ marginTop: 4, opacity: 0.7 }}>Visa produkter</Text>
    </Pressable>
  );
}