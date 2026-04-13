import { router } from "expo-router";
import { FlatList, SafeAreaView, Text } from "react-native";
import StoreCard from "../src/components/StoreCard";
import { Store } from "../src/types/store";

export default function Index() {
  const stores: Store[] = [
    {
      id: 1,
      name: "ICA Maxi Mölndal",
      address: "Mölndalsvägen 123",
      city: "Mölndal",
      storeType: "Grocery",
    },
    {
      id: 2,
      name: "ByggHallen Sisjön",
      address: "Sisjövägen 45",
      city: "Göteborg",
      storeType: "Hardware",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12 }}>
        Välj butik
      </Text>

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