import { Text, View } from "react-native";
import { RouteStep } from "../types/route";

type StoreMapViewProps = {
  steps: RouteStep[];
};

export default function StoreMapView({ steps }: StoreMapViewProps) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        minHeight: 260,
        backgroundColor: "#fafafa",
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 16 }}>
        Översiktskarta
      </Text>

      <View
        style={{
          flex: 1,
          position: "relative",
          minHeight: 180,
          borderWidth: 1,
          borderRadius: 10,
          backgroundColor: "white",
        }}
      >
        {/* Entré */}
        <View
          style={{
            position: "absolute",
            left: 20,
            top: 70,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: "green",
              marginBottom: 4,
            }}
          />
          <Text style={{ fontSize: 12 }}>Entré</Text>
        </View>

        {/* Gång 1 */}
        <View
          style={{
            position: "absolute",
            left: 110,
            top: 40,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: "#dbeafe",
              borderWidth: 1,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text style={{ fontSize: 10 }}>1</Text>
          </View>
          <Text style={{ fontSize: 12 }}>Gång 1</Text>
        </View>

        {/* Gång 2 */}
        <View
          style={{
            position: "absolute",
            left: 110,
            top: 120,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: "#dbeafe",
              borderWidth: 1,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text style={{ fontSize: 10 }}>2</Text>
          </View>
          <Text style={{ fontSize: 12 }}>Gång 2</Text>
        </View>

        {/* Kassa */}
        <View
          style={{
            position: "absolute",
            right: 20,
            top: 120,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: "red",
              marginBottom: 4,
            }}
          />
          <Text style={{ fontSize: 12 }}>Kassa</Text>
        </View>

        {/* Linjer / väg */}
        <View
          style={{
            position: "absolute",
            left: 38,
            top: 78,
            width: 72,
            height: 2,
            backgroundColor: "#999",
          }}
        />
        <View
          style={{
            position: "absolute",
            left: 121,
            top: 62,
            width: 2,
            height: 58,
            backgroundColor: "#999",
          }}
        />
        <View
          style={{
            position: "absolute",
            left: 132,
            top: 130,
            width: 110,
            height: 2,
            backgroundColor: "#999",
          }}
        />

        {/* Planerade steg */}
        <View
          style={{
            position: "absolute",
            left: 150,
            top: 20,
            right: 10,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>
            Rutt:
          </Text>

          {steps.map((step) => (
            <Text key={`${step.productId}-${step.orderIndex}`} style={{ fontSize: 12, marginBottom: 2 }}>
              {step.orderIndex}. {step.productName}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}