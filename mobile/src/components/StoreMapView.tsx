import React from "react";
import { Image, Text, View } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { StoreMap } from "../api/storeMap";
import { RouteStep } from "../types/route";

type Props = {
  steps: RouteStep[];
  map: StoreMap | null;
  image: any;
  pathNodeIds?: number[];
};

export default function StoreMapView({
  steps,
  map,
  image,
  pathNodeIds = [],
}: Props) {
  if (!map || !image) {
    return <Text>Ingen karta att visa</Text>;
  }

  const width = 320;
  const height = 304;

  const imageWidth = map.imageWidth || 800;
  const imageHeight = map.imageHeight || 760;

  const scaleX = (x: number) => (x / imageWidth) * width;
  const scaleY = (y: number) => (y / imageHeight) * height;

  function getNode(nodeId: number) {
    return map!.nodes.find((node) => node.id === nodeId);
  }

  return (
    <View
      style={{
        width,
        height,
        alignSelf: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#f8fafc",
      }}
    >
      <Image
        source={image}
        style={{
          width,
          height,
          position: "absolute",
          opacity: 0.72,
        }}
        resizeMode="stretch"
      />

      <Svg width={width} height={height}>
        {pathNodeIds.map((nodeId, index) => {
          if (index === pathNodeIds.length - 1) return null;

          const from = getNode(nodeId);
          const to = getNode(pathNodeIds[index + 1]);

          if (!from || !to) return null;

          return (
            <Line
              key={`route-${index}`}
              x1={scaleX(from.x)}
              y1={scaleY(from.y)}
              x2={scaleX(to.x)}
              y2={scaleY(to.y)}
              stroke="#6ea36f"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="7 5"
              opacity={0.95}
            />
          );
        })}

        {steps.map((step) => {
          if (!step.nodeId) return null;

          const node = getNode(step.nodeId);
          if (!node) return null;

          const x = scaleX(node.x);
          const y = scaleY(node.y);

          return (
            <React.Fragment key={`step-${step.orderIndex}-${step.nodeId}`}>
              <Circle
                cx={x}
                cy={y}
                r={9}
                fill="#f97316"
                stroke="#ffffff"
                strokeWidth={2}
              />

              <Circle
                cx={x}
                cy={y}
                r={9}
                fill="none"
                stroke="#c2410c"
                strokeWidth={1}
                opacity={0.85}
              />

              <SvgText
                x={x}
                y={y + 3}
                fontSize="8"
                fontWeight="bold"
                fill="#ffffff"
                textAnchor="middle"
              >
                {step.orderIndex}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}