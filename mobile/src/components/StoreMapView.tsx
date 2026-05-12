import React from "react";
import { Image, Text, View } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { StoreMap } from "../api/storeMap";
import { RouteStep } from "../types/route";

type Props = {
  steps: RouteStep[];
  map: StoreMap | null;
  image: any;
};

export default function StoreMapView({ map, image }: Props) {
  if (!map || !image) {
    return <Text>Ingen karta att visa</Text>;
  }

  const width = 320;
  const height = 304;

  const imageWidth = map.imageWidth || 1536;
  const imageHeight = map.imageHeight || 1024;

  const scaleX = (x: number) => (x / imageWidth) * width;
  const scaleY = (y: number) => (y / imageHeight) * height;

  return (
    <View
      style={{
        width,
        height,
        alignSelf: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      <Image
        source={image}
        style={{
          width,
          height,
          position: "absolute",
        }}
        resizeMode="stretch"
      />

      <Svg width={width} height={height}>
        {map.edges.map((edge, index) => {
          const from = map.nodes.find((n) => n.id === edge.fromNodeId);
          const to = map.nodes.find((n) => n.id === edge.toNodeId);

          if (!from || !to) return null;

          return (
            <Line
              key={`edge-${index}`}
              x1={scaleX(from.x)}
              y1={scaleY(from.y)}
              x2={scaleX(to.x)}
              y2={scaleY(to.y)}
              stroke="#2563eb"
              strokeWidth={2}
              opacity={0.65}
            />
          );
        })}

        {map.nodes.map((node) => (
          <React.Fragment key={node.id}>
            <Circle
              cx={scaleX(node.x)}
              cy={scaleY(node.y)}
              r={4}
              fill="#ef4444"
              stroke="#111827"
              strokeWidth={1}
            />

            <SvgText
              x={scaleX(node.x) + 5}
              y={scaleY(node.y) + 3}
              fontSize="7"
              fill="#111827"
            >
              {node.id}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}