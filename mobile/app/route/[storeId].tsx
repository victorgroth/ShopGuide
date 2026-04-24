import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import StoreMapView from "../../src/components/StoreMapView";
import { getStoreMap, StoreMap } from "../../src/api/storeMap";
import { RouteStep } from "../../src/types/route";
import { getStoreMapImage } from "../../src/utils/storeMapImage";

export default function RoutePage() {
  const params = useLocalSearchParams();

  const rawStoreId = Array.isArray(params.storeId)
    ? params.storeId[0]
    : params.storeId;

  const storeId = Number(rawStoreId);
  const storeName = Array.isArray(params.storeName)
    ? params.storeName[0]
    : (params.storeName as string) ?? "Butik";

  const mapImage = getStoreMapImage(storeName);
  const [map, setMap] = useState<StoreMap | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  let steps: RouteStep[] = [];

  try {
    steps = params.steps ? JSON.parse(params.steps as string) : [];
  } catch {
    steps = [];
  }

  const sortedSteps = [...steps].sort((a, b) => a.orderIndex - b.orderIndex);


  useEffect(() => {
    async function loadMap() {
      try {
        if (!rawStoreId || Number.isNaN(storeId)) {
          setMapError("Ogiltigt butik-id");
          return;
        }

        setMapLoading(true);
        setMapError(null);

        const data = await getStoreMap(storeId);
        setMap(data);
      } catch (err: any) {
        console.log("Map load error:", err);
        setMapError(err.message ?? "Kunde inte hämta butikskarta");
      } finally {
        setMapLoading(false);
      }
    }

    loadMap();
  }, [rawStoreId, storeId]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>
        Din rutt
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 4 }}>{storeName}</Text>
      <Text style={{ marginBottom: 4, opacity: 0.7 }}>
        Butikens id: {rawStoreId}
      </Text>
      <Text style={{ marginBottom: 16, opacity: 0.7 }}>
        Antal stopp: {sortedSteps.length}
      </Text>

    {mapLoading ? (
        <Text style={{ marginBottom: 16 }}>Laddar karta...</Text>
    ) : mapError ? (
        <Text style={{ color: "red", marginBottom: 16 }}>
            Fel: {mapError}
        </Text>
    ) : !mapImage ? (
        <Text style={{ color: "red", marginBottom: 16 }}>
            Ingen kartbild hittades för butiken.
        </Text>
    ) : !map ? (
        <Text style={{ color: "red", marginBottom: 16 }}>
            Ingen kartdata hämtades från backend.
        </Text>
    ) : (
        <StoreMapView
            steps={sortedSteps}
            map={map}
            image={mapImage}
        />
        )}

      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        Steg-för-steg
      </Text>

      {sortedSteps.length === 0 ? (
        <Text>Ingen rutt planerad ännu.</Text>
      ) : (
        <FlatList
          data={sortedSteps}
          keyExtractor={(item) => `${item.productId}-${item.orderIndex}`}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 14,
                borderWidth: 1,
                borderRadius: 10,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontWeight: "700", marginBottom: 4 }}>
                Steg {item.orderIndex}
              </Text>

              <Text style={{ fontSize: 16, fontWeight: "600" }}>
                {item.productName}
              </Text>

              <Text>Antal: {item.quantity}</Text>
              <Text>Plats: {item.nodeLabel}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}