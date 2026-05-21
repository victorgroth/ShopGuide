import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import { getStores } from "../src/api/stores";
import { Store } from "../src/types/store";

export default function Index() {
  const [stores, setStores] = useState<Store[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredStores = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (search.length === 0) return stores;

    return stores.filter((store) => {
      const text = [
        store.name,
        store.address,
        store.city,
        store.storeType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(search);
    });
  }, [stores, searchText]);

  useEffect(() => {
    async function fetchStores() {
      try {
        const data = await getStores();
        setStores(data);
      } catch (err: any) {
        setError(err.message ?? "Kunde inte hämta butiker");
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, []);

  function goToStore(store: Store) {
    router.push({
      pathname: "/stores/[id]",
      params: {
        id: store.id.toString(),
        name: store.name,
      },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7f6" }}>
      <FlatList
        data={filteredStores}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={
          <View>
            <Text
              style={{
                fontSize: 34,
                fontWeight: "900",
                color: "#064e3b",
                marginBottom: 8,
              }}
            >
              Välj butik
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: "#374151",
                lineHeight: 22,
                marginBottom: 18,
              }}
            >
              Välj en butik för att börja din smarta shoppingrutt.
            </Text>

            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginBottom: 18,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              

              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Sök butik..."
                style={{ fontSize: 16, flex: 1 }}
              />

              {searchText.length > 0 && (
                <Pressable
                  onPress={() => setSearchText("")}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: "#e5e7eb",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "800",
                      color: "#374151",
                    }}
                  >
                    ×
                  </Text>
                </Pressable>
              )}
            </View>

            {loading && (
              <ActivityIndicator size="large" style={{ marginBottom: 16 }} />
            )}

            {error && (
              <Text style={{ color: "red", marginBottom: 12 }}>
                Fel: {error}
              </Text>
            )}

            {!loading && !error && (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#111827",
                  marginBottom: 12,
                }}
              >
                Butiker nära dig
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => goToStore(item)}
            style={{
              backgroundColor: "white",
              borderRadius: 18,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                backgroundColor: "#dcfce7",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
              }}
            >
              <Text style={{ fontSize: 26 }}>🏪</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                {item.name}
              </Text>

              <Text style={{ color: "#4b5563", marginBottom: 2 }}>
                {item.address}
              </Text>

              <Text style={{ color: "#6b7280" }}>
                {item.city} • {item.storeType}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 28,
                color: "#15803d",
                marginLeft: 8,
              }}
            >
              ›
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: "#6b7280", marginTop: 20 }}>
              Ingen butik hittades.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}