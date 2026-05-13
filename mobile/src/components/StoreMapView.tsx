import React from "react";
import { Image, Text, View } from "react-native";
import Svg, { Circle, Line, Rect, Text as SvgText } from "react-native-svg";
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
    return map?.nodes.find((node) => node.id === nodeId);
  }

  function getStepForNode(nodeId: number) {
    return steps.find((step) => step.nodeId === nodeId);
  }

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

        {/* Debug: zoner */}
<Rect
  x={scaleX(0)}
  y={scaleY(300)}
  width={scaleX(300)}
  height={scaleY(460)}
  fill="green"
  opacity={0.15}
/>

<Rect
  x={scaleX(0)}
  y={scaleY(0)}
  width={scaleX(300)}
  height={scaleY(300)}
  fill="yellow"
  opacity={0.18}
/>

<Rect
  x={scaleX(300)}
  y={scaleY(0)}
  width={scaleX(300)}
  height={scaleY(300)}
  fill="blue"
  opacity={0.14}
/>

<Rect
  x={scaleX(300)}
  y={scaleY(300)}
  width={scaleX(500)}
  height={scaleY(460)}
  fill="red"
  opacity={0.13}
/>

<SvgText x={scaleX(120)} y={scaleY(450)} fontSize="12" fill="#111" fontWeight="bold">
  ZON 1
</SvgText>

<SvgText x={scaleX(120)} y={scaleY(150)} fontSize="12" fill="#111" fontWeight="bold">
  ZON 2
</SvgText>

<SvgText x={scaleX(420)} y={scaleY(150)} fontSize="12" fill="#111" fontWeight="bold">
  ZON 3
</SvgText>

<SvgText x={scaleX(420)} y={scaleY(450)} fontSize="12" fill="#111" fontWeight="bold">
  ZON 4
</SvgText>
        {/* Vanliga gångar/edges */}
        {map.edges.map((edge, index) => {
          const from = getNode(edge.fromNodeId);
          const to = getNode(edge.toNodeId);

          if (!from || !to) return null;

          return (
            <Line
              key={`edge-${index}`}
              x1={scaleX(from.x)}
              y1={scaleY(from.y)}
              x2={scaleX(to.x)}
              y2={scaleY(to.y)}
              stroke="#2563eb"
              strokeWidth={1.5}
              opacity={0.35}
            />
          );
        })}

        {/* Planerad rutt som följer route-path från backend */}
        {pathNodeIds.map((nodeId, index) => {
          if (index === pathNodeIds.length - 1) return null;

          const from = getNode(nodeId);
          const to = getNode(pathNodeIds[index + 1]);

          if (!from || !to) return null;

          return (
            <Line
              key={`route-path-${index}`}
              x1={scaleX(from.x)}
              y1={scaleY(from.y)}
              x2={scaleX(to.x)}
              y2={scaleY(to.y)}
              stroke="#22c55e"
              strokeWidth={4}
              opacity={0.95}
            />
          );
        })}

        {/* Alla nodes i debugläge */}
        {map.nodes.map((node) => {
          const step = getStepForNode(node.id);

          return (
            <React.Fragment key={node.id}>
              <Circle
                cx={scaleX(node.x)}
                cy={scaleY(node.y)}
                r={step ? 6 : 3.5}
                fill={step ? "#f97316" : "#ef4444"}
                stroke="#111827"
                strokeWidth={1}
              />

              {step ? (
                <SvgText
                  x={scaleX(node.x)}
                  y={scaleY(node.y) + 3}
                  fontSize="7"
                  fontWeight="bold"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  {step.orderIndex}
                </SvgText>
              ) : (
                <SvgText
                  x={scaleX(node.x) + 5}
                  y={scaleY(node.y) + 3}
                  fontSize="6"
                  fill="#111827"
                >
                  {node.id}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}