import { View, Text } from "react-native";
import { RouteStep } from "../types/route";
import { StoreMap } from "../api/storeMap";

type Props = {
  steps: RouteStep[];
  map: StoreMap | null;
};

export default function StoreMapView({ steps, map }: Props) {
  if (!map) {
    return <Text>Laddar karta...</Text>;
  }

  return (
    <View
      style={{
        height: 300,
        borderWidth: 1,
        marginBottom: 20,
        position: "relative",
        backgroundColor: "#f9fafb",
      }}
    >
      {/* 🔹 Rita edges */}
      {map.edges.map((edge, index) => {
        const from = map.nodes.find(n => n.id === edge.fromNodeId);
        const to = map.nodes.find(n => n.id === edge.toNodeId);

        if (!from || !to) return null;

        return (
          <View
            key={index}
            style={{
              position: "absolute",
              left: from.x,
              top: from.y,
              width: Math.abs(to.x - from.x),
              height: 2,
              backgroundColor: "#999",
            }}
          />
        );
      })}

      {/* 🔹 Rita noder */}
      {map.nodes.map(node => {
        const step = steps.find(s => s.nodeId === node.id);

        return (
          <View
            key={node.id}
            style={{
              position: "absolute",
              left: node.x,
              top: node.y,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: step ? "#22c55e" : "#e5e7eb",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {step && (
                <Text style={{ fontSize: 12, color: "white" }}>
                  {step.orderIndex}
                </Text>
              )}
            </View>

            <Text style={{ fontSize: 10 }}>{node.label}</Text>
          </View>
        );
      })}
    </View>
  );
}