import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, Text, View } from "react-native";
import ProductCard from "../../src/components/ProductCard";
import { getProductsForStore } from "../../src/api/products";
import { Product } from "../../src/types/product";

type ShoppingListItem = Product & {
  addedQuantity: number;
};

export default function StoreDetailsPage() {
  const { id, name } = useLocalSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [plannedRoute, setPlannedRoute] = useState<ShoppingListItem[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProductsForStore(id?.toString() ?? "");
        setProducts(data);
      } catch (err: any) {
        setError(err.message ?? "Kunde inte hämta produkter");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [id]);

  function handleAddToShoppingList(product: Product) {
    setShoppingList((prev) => {
      const existingItem = prev.find((item) => item.productId === product.productId);

      if (existingItem) {
        return prev.map((item) =>
          item.productId === product.productId
            ? { ...item, addedQuantity: item.addedQuantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, addedQuantity: 1 }];
    });

    setPlannedRoute([]);
  }

  function handleRemoveFromShoppingList(productId: number) {
    setShoppingList((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, addedQuantity: item.addedQuantity - 1 }
            : item
        )
        .filter((item) => item.addedQuantity > 0)
    );

    setPlannedRoute([]);
  }

  function handlePlanRoute() {
    const sorted = [...shoppingList].sort((a, b) => {
      const aisleA = a.aisle ?? "";
      const aisleB = b.aisle ?? "";

      if (aisleA < aisleB) return -1;
      if (aisleA > aisleB) return 1;

      return a.name.localeCompare(b.name);
    });

    setPlannedRoute(sorted);

    const routeSteps = sorted.map((item, index) => ({
      orderIndex: index + 1,
      productId: item.productId,
      productName: item.name,
      quantity: item.addedQuantity,
      aisle: item.aisle,
      shelf: item.shelf,
    }));

    router.push({
      pathname: "/route/[storeId]",
      params: {
        storeId: id?.toString() ?? "",
        storeName: name?.toString() ?? "Butik",
        steps: JSON.stringify(routeSteps),
      },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onAddToList={() => handleAddToShoppingList(item)}
          />
        )}
        ListHeaderComponent={
          <View>
            <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>
              {name}
            </Text>

            <Text style={{ fontSize: 16, marginBottom: 16 }}>
              Butikens id: {id}
            </Text>

            <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 12 }}>
              Produkter i butiken
            </Text>

            {loading && <ActivityIndicator size="large" style={{ marginBottom: 12 }} />}

            {error && (
              <Text style={{ color: "red", marginBottom: 12 }}>
                Fel: {error}
              </Text>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={{ marginTop: 20, paddingBottom: 40 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
              Min inköpslista
            </Text>

            {shoppingList.length === 0 ? (
              <Text>Inga produkter tillagda ännu.</Text>
            ) : (
              <>
                {shoppingList.map((item) => (
                  <View
                    key={item.productId}
                    style={{
                      padding: 12,
                      borderWidth: 1,
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                    <Text>Antal: {item.addedQuantity}</Text>
                    {item.aisle && <Text>Plats: {item.aisle}</Text>}

                    <Pressable
                      onPress={() => handleRemoveFromShoppingList(item.productId)}
                      style={{
                        marginTop: 8,
                        backgroundColor: "#b00020",
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        borderRadius: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "600" }}>
                        Ta bort en
                      </Text>
                    </Pressable>
                  </View>
                ))}

                <Pressable
                  onPress={handlePlanRoute}
                  style={{
                    marginTop: 12,
                    backgroundColor: "#1d4ed8",
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "700" }}>
                    Planera rutt
                  </Text>
                </Pressable>
              </>
            )}

            {plannedRoute.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
                  Planerad rutt
                </Text>

                {plannedRoute.map((item, index) => (
                  <View
                    key={item.productId}
                    style={{
                      padding: 12,
                      borderWidth: 1,
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>
                      {index + 1}. {item.name}
                    </Text>
                    <Text>Antal: {item.addedQuantity}</Text>
                    {item.aisle && <Text>Gå till: {item.aisle}</Text>}
                    {item.shelf && <Text>Hylla: {item.shelf}</Text>}
                  </View>
                ))}
              </View>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}