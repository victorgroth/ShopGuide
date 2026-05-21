import { Pressable, Text, View } from "react-native";
import { ShoppingListDto } from "../api/shoppingLists";

type Props = {
  shoppingList: ShoppingListDto | null;
  onPlanRoute: () => void;
  onRemoveItem: (itemId: number) => void;
};

export default function ShoppingCartPreview({
  shoppingList,
  onPlanRoute,
  onRemoveItem,
}: Props) {
  const count = shoppingList?.items.length ?? 0;

  return (
    <View
      style={{
        backgroundColor: "#ecfdf3",
        borderRadius: 20,
        padding: 16,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "#bbf7d0",
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 4 }}>
        Din inköpslista
      </Text>

      <Text style={{ color: "#374151", marginBottom: 12 }}>
        {count === 0 ? "Inga produkter tillagda ännu" : `${count} produkter`}
      </Text>

      {shoppingList && shoppingList.items.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          {shoppingList.items.slice(0, 4).map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ flex: 1 }}>
                • {item.productName} x{item.quantity}
              </Text>

              <Pressable
  onPress={() => onRemoveItem(item.id)}
  style={{
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  }}
>
  <Text style={{ color: "#166534", fontWeight: "800" }}>×</Text>
</Pressable>
            </View>
          ))}

          {shoppingList.items.length > 4 && (
            <Text style={{ color: "#15803d", fontWeight: "700" }}>
              +{shoppingList.items.length - 4} fler
            </Text>
          )}
        </View>
      )}

      <Pressable
        disabled={count === 0}
        onPress={onPlanRoute}
        style={{
          backgroundColor: count === 0 ? "#d1d5db" : "#16a34a",
          paddingVertical: 13,
          borderRadius: 14,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: count === 0 ? "#6b7280" : "white",
            fontWeight: "800",
          }}
        >
          Planera rutt
        </Text>
      </Pressable>
    </View>
  );
}