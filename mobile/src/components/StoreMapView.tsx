import React from "react";
import { View, Image } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { RouteStep } from "../types/route";
import { StoreMap } from "../api/storeMap";

type Props = {
  steps: RouteStep[];
  map: StoreMap | null;
  image: any;
};

export default function StoreMapView({ steps, map, image }: Props) {
  if (!map || !image) return null;

  const width = 320;
  const height = 260;

  const getStep = (nodeId: number) =>
    steps.find((s) => s.nodeId === nodeId);

  const routeNodes = steps
    .map((s) => map.nodes.find((n) => n.id === s.nodeId))
    .filter(Boolean);

  return (
    <View style={{ marginBottom: 20 }}>
      {/* 🖼️ Bakgrundsbild */}
      <Image
        source={image}
        style={{
          width,
          height,
          position: "absolute",
          borderRadius: 12,
        }}
        resizeMode="contain"
      />

      {/* 🔷 Overlay SVG */}
      <Svg width={width} height={height}>
        {/* 🔵 Ruttlinje */}
        {routeNodes.map((node, i) => {
          if (!node || i === routeNodes.length - 1) return null;

          const next = routeNodes[i + 1];
          if (!next) return null;

          return (
            <Line
              key={i}
              x1={node.x}
              y1={node.y}
              x2={next.x}
              y2={next.y}
              stroke="#2563eb"
              strokeWidth={4}
            />
          );
        })}

        {/* 🟢 Noder */}
        {map.nodes.map((node) => {
          const step = getStep(node.id);

          return (
            <React.Fragment key={node.id}>
              <Circle
                cx={node.x}
                cy={node.y}
                r={10}
                fill={step ? "#22c55e" : "#e5e7eb"}
              />

              {step && (
                <SvgText
                  x={node.x}
                  y={node.y + 4}
                  fontSize="10"
                  fill="#fff"
                  textAnchor="middle"
                >
                  {step.orderIndex}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}