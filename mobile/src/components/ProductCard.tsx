import { Pressable, Text, View } from "react-native";
import { Product } from "../types/product";

type ProductCardProps = {
  product: Product;
  onAddToList?: () => void;
};

export default function ProductCard({ product, onAddToList }: ProductCardProps) {
  return (
    <View
      style={{
        padding: 14,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 10,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "600" }}>{product.name}</Text>
      <Text>{product.brand}</Text>
      <Text style={{ opacity: 0.7 }}>{product.category}</Text>

      {product.price !== undefined && (
        <Text style={{ marginTop: 6 }}>Pris: {product.price} kr</Text>
      )}

      {product.quantity !== undefined && (
        <Text>Lager: {product.quantity}</Text>
      )}

      {product.aisle && (
        <Text>
          Plats: {product.aisle}
          {product.shelf ? `, ${product.shelf}` : ""}
        </Text>
      )}

      <Pressable
        onPress={onAddToList}
        style={{
          marginTop: 10,
          backgroundColor: "#222",
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          Lägg till i inköpslista
        </Text>
      </Pressable>
    </View>
  );
}