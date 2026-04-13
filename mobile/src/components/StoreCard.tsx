import { Pressable, Text, View } from "react-native";
import { Store } from "../types/store";

type StoreCardProps = {
  store: Store;
  onPress?: () => void;
};

export default function StoreCard({ store, onPress }: StoreCardProps) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 10,
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600" }}>{store.name}</Text>
        <Text>{store.address}</Text>
        <Text>{store.city}</Text>
        <Text style={{ opacity: 0.7 }}>{store.storeType}</Text>
      </View>
    </Pressable>
  );
}