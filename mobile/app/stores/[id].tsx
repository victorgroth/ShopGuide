import TopBar from "../../src/components/TopBar";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import ProductCard from "../../src/components/ProductCard";
import SearchBar from "../../src/components/SearchBar";
import CategoryPill from "../../src/components/CategoryPill";
import ShoppingCartPreview from "../../src/components/ShoppingCartPreview";

import { getProductsForStore } from "../../src/api/products";
import {
  createShoppingList,
  getShoppingList,
  addItemToShoppingList,
  removeShoppingListItem,
  planRoute,
  getRoutePlan,
  ShoppingListDto,
} from "../../src/api/shoppingLists";
import { Product } from "../../src/types/product";

export default function StoreDetailsPage() {
  const { id, name } = useLocalSearchParams();

  const rawId = Array.isArray(id) ? id[0] : id;
  const storeId = Number(rawId);
  const storeName = name?.toString() ?? "Butik";

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Alla");
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [shoppingList, setShoppingList] = useState<ShoppingListDto | null>(null);
  const [shoppingListLoading, setShoppingListLoading] = useState(true);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((product) => product.category))
    ).sort();

    return ["Alla", ...unique];
  }, [products]);

  const normalize = (text?: string) =>
    (text ?? "")
      .toLowerCase()
      .trim()
      .replaceAll("å", "a")
      .replaceAll("ä", "a")
      .replaceAll("ö", "o");

  const filteredProducts = useMemo(() => {
    const search = normalize(searchText);

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "Alla" || product.category === selectedCategory;

      if (!matchesCategory) return false;
      if (search.length === 0) return true;

      const fields = [
        product.name,
        product.category,
        product.brand,
        product.description,
        product.searchKeywords,
      ].filter(Boolean) as string[];

      const normalizedFields = fields.map(normalize);

      const startsWithMatch = normalizedFields.some((field) =>
        field.split(" ").some((word) => word.startsWith(search))
      );

      const includesMatch = normalizedFields.some((field) =>
        field.includes(search)
      );

      return startsWithMatch || includesMatch;
    });
  }, [products, selectedCategory, searchText]);

  useEffect(() => {
    async function loadPage() {
      try {
        if (!rawId || Number.isNaN(storeId)) {
          setError("Ogiltigt butik-id");
          return;
        }

        setLoading(true);
        setShoppingListLoading(true);
        setError(null);

        const productsData = await getProductsForStore(rawId);
        setProducts(productsData);

        const shoppingListData = await createShoppingList(storeId);
        setShoppingList(shoppingListData);
      } catch (err: any) {
        console.log("Store page load error:", err);
        setError(err.message ?? "Kunde inte ladda butikssidan");
      } finally {
        setLoading(false);
        setShoppingListLoading(false);
      }
    }

    loadPage();
  }, [rawId, storeId]);

  async function refreshShoppingList() {
    if (!shoppingList) return;

    const updated = await getShoppingList(shoppingList.id);
    setShoppingList(updated);
  }

  async function handleAddToShoppingList(product: Product) {
    if (!shoppingList) return;

    try {
      await addItemToShoppingList(shoppingList.id, product.productId, 1);
      await refreshShoppingList();
    } catch (err: any) {
      setError(err.message ?? "Kunde inte lägga till produkt");
    }
  }

  async function handleRemoveItem(itemId: number) {
    try {
      await removeShoppingListItem(itemId);
      await refreshShoppingList();
    } catch (err: any) {
      setError(err.message ?? "Kunde inte ta bort produkt");
    }
  }

  async function handlePlanRoute() {
    if (!shoppingList) return;

    try {
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

      const routePlan = await getRoutePlan(shoppingList.id);

      router.push({
        pathname: "/route/[storeId]",
        params: {
          storeId: storeId.toString(),
          storeName,
          steps: JSON.stringify(routeSteps),
          routePlan: JSON.stringify(routePlan),
        },
      });
    } catch (err: any) {
      setError(err.message ?? "Kunde inte planera rutt");
    }
  }

    return (
  <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7f6" }}>
    <TopBar
      title="Inköpslista"
      subtitle={storeName}
      backLabel="Butiker"
    />

    <FlatList
      data={filteredProducts}
      keyExtractor={(item) => item.productId.toString()}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      ListHeaderComponent={
        <View>
          <SearchBar value={searchText} onChangeText={setSearchText} />

            {shoppingListLoading ? (
              <View style={{ marginBottom: 18 }}>
                <ActivityIndicator size="small" />
              </View>
            ) : (
              <ShoppingCartPreview
                shoppingList={shoppingList}
                onPlanRoute={handlePlanRoute}
                onRemoveItem={handleRemoveItem}
              />
            )}

            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                marginBottom: 12,
                color: "#111827",
              }}
            >
              Kategorier
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 18 }}
            >
              {categories.map((category) => (
                <CategoryPill
                  key={category}
                  category={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                />
              ))}
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#111827",
                }}
              >
                Produkter
              </Text>

              <Text style={{ color: "#6b7280" }}>
                {filteredProducts.length} st
              </Text>
            </View>

            {loading && (
              <ActivityIndicator size="large" style={{ marginBottom: 12 }} />
            )}

            {error && (
              <Text style={{ color: "red", marginBottom: 12 }}>
                Fel: {error}
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onAddToList={() => handleAddToShoppingList(item)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: "#6b7280", marginTop: 20 }}>
              Inga produkter hittades.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}