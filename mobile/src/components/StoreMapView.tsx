import Svg, { Circle, Line, Rect, Text as SvgText } from "react-native-svg";
import { View } from "react-native";
import { RouteStep } from "../types/route";
import { StoreMap } from "../api/storeMap";

type Props = {
  steps: RouteStep[];
  map: StoreMap | null;
};

export default function StoreMapView({ steps, map }: Props) {
  if (!map) return null;

  const width = 320;
  const height = 260;
  const padding = 20;

  const xs = map.nodes.map((n) => n.x);
  const ys = map.nodes.map((n) => n.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const scaleX = (x: number) => {
    if (maxX === minX) return width / 2;
    return padding + ((x - minX) / (maxX - minX)) * (width - padding * 2);
  };

  const scaleY = (y: number) => {
    if (maxY === minY) return height / 2;
    return padding + ((y - minY) / (maxY - minY)) * (height - padding * 2);
  };

  const getStepForNode = (nodeId: number) =>
    steps.find((step) => step.nodeId === nodeId);

  const routeNodes = steps
    .map((step) => map.nodes.find((n) => n.id === step.nodeId))
    .filter(Boolean);

  return (
    <View
      style={{
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        backgroundColor: "#fafafa",
      }}
    >
      <Svg width={width} height={height}>
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={12}
          fill="#ffffff"
          stroke="#d1d5db"
        />

        {/* Vanliga edges */}
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
              stroke="#cbd5e1"
              strokeWidth={3}
            />
          );
        })}

        {/* Rutten mellan steg */}
        {routeNodes.map((node, index) => {
          if (!node || index === routeNodes.length - 1) return null;

          const nextNode = routeNodes[index + 1];
          if (!nextNode) return null;

          return (
            <Line
              key={`route-${index}`}
              x1={scaleX(node.x)}
              y1={scaleY(node.y)}
              x2={scaleX(nextNode.x)}
              y2={scaleY(nextNode.y)}
              stroke="#2563eb"
              strokeWidth={4}
            />
          );
        })}

        {/* Noder */}
        {map.nodes.map((node) => {
          const step = getStepForNode(node.id);
          const cx = scaleX(node.x);
          const cy = scaleY(node.y);

          const fillColor = step ? "#22c55e" : "#e5e7eb";
          const textColor = step ? "#ffffff" : "#111827";

          return (
            <>
              <Circle
                key={`circle-${node.id}`}
                cx={cx}
                cy={cy}
                r={14}
                fill={fillColor}
                stroke="#374151"
                strokeWidth={1.5}
              />

              {step && (
                <SvgText
                  key={`step-${node.id}`}
                  x={cx}
                  y={cy + 4}
                  fontSize="11"
                  fontWeight="bold"
                  fill={textColor}
                  textAnchor="middle"
                >
                  {step.orderIndex}
                </SvgText>
              )}

              {!step && (
                <SvgText
                  key={`node-${node.id}`}
                  x={cx}
                  y={cy + 4}
                  fontSize="10"
                  fill={textColor}
                  textAnchor="middle"
                >
                  •
                </SvgText>
              )}

              <SvgText
                key={`label-${node.id}`}
                x={cx}
                y={cy + 28}
                fontSize="10"
                fill="#111827"
                textAnchor="middle"
              >
                {node.label}
              </SvgText>
            </>
          );
        })}
      </Svg>
    </View>
  );
}