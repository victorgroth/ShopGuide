import { useLocalSearchParams } from "expo-router";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import { RouteStep } from "../../src/types/route";
import StoreMapView from "../../src/components/StoreMapView";

export default function RoutePage() {
  const params = useLocalSearchParams();

  const storeId = params.storeId as string;
  const storeName = (params.storeName as string) ?? "Butik";

  let steps: RouteStep[] = [];

  try {
    steps = params.steps ? JSON.parse(params.steps as string) : [];
  } catch {
    steps = [];
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>
        Din rutt
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 4 }}>{storeName}</Text>
      <Text style={{ marginBottom: 16, opacity: 0.7 }}>Butikens id: {storeId}</Text>

      <StoreMapView steps={steps} />

      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        Steg-för-steg
      </Text>

      {steps.length === 0 ? (
        <Text>Ingen rutt planerad ännu.</Text>
      ) : (
        <FlatList
          data={steps}
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
              {item.aisle && <Text>Gå till: {item.aisle}</Text>}
              {item.shelf && <Text>Hylla: {item.shelf}</Text>}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}