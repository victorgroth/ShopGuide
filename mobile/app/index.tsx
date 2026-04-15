import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, Text } from "react-native";
import StoreCard from "../src/components/StoreCard";
import { Store } from "../src/types/store";

export default function Index() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch("http://192.168.0.16:5187/api/stores");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setStores(data);
      } catch (err: any) {
        setError(err.message ?? "Kunde inte hämta butiker");
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12 }}>
        Välj butik
      </Text>

      {loading && <ActivityIndicator size="large" />}

      {error && (
        <Text style={{ color: "red", marginBottom: 12 }}>
          Fel: {error}
        </Text>
      )}

      <FlatList
        data={stores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <StoreCard
            store={item}
            onPress={() =>
              router.push({
                pathname: "/stores/[id]",
                params: {
                  id: item.id.toString(),
                  name: item.name,
                },
              })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}