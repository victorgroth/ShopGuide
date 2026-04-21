import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import ProductCard from "../../src/components/ProductCard";
import { getProductsForStore } from "../../src/api/products";
import {
  createShoppingList,
  getShoppingList,
  addItemToShoppingList,
  planRoute,
  ShoppingListDto,
} from "../../src/api/shoppingLists";
import { Product } from "../../src/types/product";

export default function StoreDetailsPage() {
  const { id, name } = useLocalSearchParams();

  const rawId = Array.isArray(id) ? id[0] : id;
  const storeId = Number(rawId);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [shoppingList, setShoppingList] = useState<ShoppingListDto | null>(null);
  const [shoppingListLoading, setShoppingListLoading] = useState(true);
  const [shoppingListError, setShoppingListError] = useState<string | null>(null);

  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPage() {
      if (!rawId || Number.isNaN(storeId)) {
        setProductsError("Ogiltigt butik-id");
        setShoppingListError("Ogiltigt butik-id");
        setLoading(false);
        setShoppingListLoading(false);
        return;
      }

      setLoading(true);
      setShoppingListLoading(true);
      setProductsError(null);
      setShoppingListError(null);
      setRouteError(null);

      console.log("rawId:", rawId);
      console.log("storeId:", storeId);

      try {
        const productsData = await getProductsForStore(rawId);
        setProducts(productsData);
      } catch (err: any) {
        console.log("Products load error:", err);
        setProductsError(err.message ?? "Kunde inte hämta produkter");
      } finally {
        setLoading(false);
      }

      try {
        console.log("Trying to create shopping list for storeId:", storeId);
        const shoppingListData = await createShoppingList(storeId);
        console.log("Created shopping list:", shoppingListData);
        setShoppingList(shoppingListData);
      } catch (err: any) {
        console.log("Shopping list create error:", err);
        setShoppingListError(err.message ?? "Kunde inte skapa shoppinglista");
      } finally {
        setShoppingListLoading(false);
      }
    }

    loadPage();
  }, [rawId, storeId]);

  async function refreshShoppingList() {
    if (!shoppingList) return;

    try {
      const updated = await getShoppingList(shoppingList.id);
      setShoppingList(updated);
    } catch (err: any) {
      console.log("Refresh shopping list error:", err);
      setShoppingListError(err.message ?? "Kunde inte uppdatera inköpslista");
    }
  }

  async function handleAddToShoppingList(product: Product) {
    if (!shoppingList) return;

    try {
      setShoppingListError(null);
      await addItemToShoppingList(shoppingList.id, product.productId, 1);
      await refreshShoppingList();
    } catch (err: any) {
      console.log("Add item error:", err);
      setShoppingListError(err.message ?? "Kunde inte lägga till produkt");
    }
  }

  async function handlePlanRoute() {
    if (!shoppingList) return;

    try {
      setRouteError(null);

      await planRoute(shoppingList.id);
      const updated = await getShoppingList(shoppingList.id);
      setShoppingList(updated);

      const routeSteps = updated.items
  .sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999))
  .map((item, index) => ({
    orderIndex: item.orderIndex ?? index + 1,
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    nodeLabel: item.nodeLabel ?? "Okänd plats",
    nodeId: item.nodeId,
  }));

      router.push({
        pathname: "/route/[storeId]",
        params: {
          storeId: storeId.toString(),
          storeName: name?.toString() ?? "Butik",
          steps: JSON.stringify(routeSteps),
        },
      });
    } catch (err: any) {
      console.log("Plan route error:", err);
      setRouteError(err.message ?? "Kunde inte planera rutt");
    }
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

            {loading && (
              <ActivityIndicator size="large" style={{ marginBottom: 12 }} />
            )}

            {productsError && (
              <Text style={{ color: "red", marginBottom: 12 }}>
                Fel: {productsError}
              </Text>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={{ marginTop: 20, paddingBottom: 40 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
              Min inköpslista
            </Text>

            {shoppingListLoading ? (
              <ActivityIndicator size="small" />
            ) : shoppingListError ? (
              <Text style={{ color: "red", marginBottom: 12 }}>
                Fel: {shoppingListError}
              </Text>
            ) : !shoppingList || shoppingList.items.length === 0 ? (
              <Text>Inga produkter tillagda ännu.</Text>
            ) : (
              <>
                {shoppingList.items.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      padding: 12,
                      borderWidth: 1,
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontWeight: "600" }}>{item.productName}</Text>
                    <Text>Antal: {item.quantity}</Text>
                    {item.nodeLabel && <Text>Plats: {item.nodeLabel}</Text>}
                    {item.orderIndex && (
                      <Text>Ruttordning: {item.orderIndex}</Text>
                    )}
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

                {routeError && (
                  <Text style={{ color: "red", marginTop: 12 }}>
                    Fel: {routeError}
                  </Text>
                )}
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}