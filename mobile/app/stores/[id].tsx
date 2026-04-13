import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, SafeAreaView, Text, View } from "react-native";
import ProductCard from "../../src/components/ProductCard";
import { Product } from "../../src/types/product";


type ShoppingListItem = Product & {
  addedQuantity: number;
};

export default function StoreDetailsPage() {
  const { id, name } = useLocalSearchParams();

  const products: Product[] = [
    {
      id: 1,
      name: "Mjölk 1L",
      brand: "Arla",
      category: "Mejeri",
      price: 16.9,
      quantity: 50,
      aisle: "Gång 2",
      shelf: "Kyldisk",
    },
    {
      id: 2,
      name: "FormFranska",
      brand: "Pågen",
      category: "Bröd",
      price: 24.9,
      quantity: 30,
      aisle: "Gång 1",
      shelf: "Brödhylla",
    },
    {
      id: 3,
      name: "Kaffe 450g",
      brand: "Zoegas",
      category: "Dryck",
      price: 54.9,
      quantity: 18,
      aisle: "Gång 1",
      shelf: "Kaffe/Te",
    },
  ];

  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [plannedRoute, setPlannedRoute] = useState<ShoppingListItem[]>([]);

  function handleAddToShoppingList(product: Product) {
    setShoppingList((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, addedQuantity: item.addedQuantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, addedQuantity: 1 }];
    });

    // Nollställ tidigare planerad rutt när listan ändras
    setPlannedRoute([]);
  }

  function handleRemoveFromShoppingList(productId: number) {
    setShoppingList((prev) =>
      prev
        .map((item) =>
          item.id === productId
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
    productId: item.id,
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
        keyExtractor={(item) => item.id.toString()}
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
                    key={item.id}
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
                      onPress={() => handleRemoveFromShoppingList(item.id)}
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
                    key={item.id}
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