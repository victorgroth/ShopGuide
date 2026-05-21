import { Pressable, Text } from "react-native";

type Props = {
  category: string;
  selected: boolean;
  onPress: () => void;
};

export default function CategoryPill({ category, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        marginRight: 8,
        backgroundColor: selected ? "#16a34a" : "white",
        borderWidth: 1,
        borderColor: selected ? "#16a34a" : "#e5e7eb",
      }}
    >
      <Text
        style={{
          color: selected ? "white" : "#111827",
          fontWeight: "700",
        }}
      >
        {category}
      </Text>
    </Pressable>
  );
}