import { Pressable, Text, View } from "react-native";
import { Product } from "../types/product";

type Props = {
  product: Product;
  onAddToList: () => void;
};

export default function ProductCard({ product, onAddToList }: Props) {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#e5e7eb",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", marginBottom: 4 }}>
            {product.name}
          </Text>

          <Text style={{ color: "#6b7280", marginBottom: 4 }}>
            {product.category}
          </Text>

          {product.brand && (
            <Text style={{ color: "#6b7280" }}>{product.brand}</Text>
          )}
        </View>

        <Pressable
          onPress={onAddToList}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: "#16a34a",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 24, fontWeight: "800" }}>
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );
}