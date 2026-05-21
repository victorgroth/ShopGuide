import TopBar from "../../src/components/TopBar";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";

import StoreMapView from "../../src/components/StoreMapView";
import { getStoreMap, StoreMap } from "../../src/api/storeMap";
import {
  RoutePlanDto,
  RouteSegmentDto,
} from "../../src/api/shoppingLists";
import { RouteStep } from "../../src/types/route";
import { getStoreMapImage } from "../../src/utils/storeMapImage";

export default function RoutePage() {
  const params = useLocalSearchParams();

  const rawStoreId = Array.isArray(params.storeId)
    ? params.storeId[0]
    : params.storeId;

  const storeId = Number(rawStoreId);

  const storeName = Array.isArray(params.storeName)
    ? params.storeName[0]
    : (params.storeName as string) ?? "Butik";

  const mapImage = getStoreMapImage(storeName);

  const [map, setMap] = useState<StoreMap | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [viewMode, setViewMode] = useState<"step" | "full">("step");

  let steps: RouteStep[] = [];

  try {
    steps = params.steps ? JSON.parse(params.steps as string) : [];
  } catch {
    steps = [];
  }

  let routePlan: RoutePlanDto | null = null;

  try {
    routePlan = params.routePlan
      ? JSON.parse(params.routePlan as string)
      : null;
  } catch {
    routePlan = null;
  }

  const sortedSteps = [...steps].sort((a, b) => a.orderIndex - b.orderIndex);

  const currentSegment: RouteSegmentDto | undefined =
    routePlan?.segments[currentStepIndex];

  const currentStep = sortedSteps[currentStepIndex];

  const isFinished =
    routePlan !== null &&
    currentStepIndex >= routePlan.segments.length;

  const pathToDraw =
    viewMode === "full"
      ? routePlan?.fullPathNodeIds ?? []
      : currentSegment?.pathNodeIds ?? [];

  useEffect(() => {
    async function loadMap() {
      try {
        if (!rawStoreId || Number.isNaN(storeId)) {
          setMapError("Ogiltigt butik-id");
          return;
        }

        setMapLoading(true);
        setMapError(null);

        const data = await getStoreMap(storeId);

        setMap(data);
      } catch (err: any) {
        console.log("Map load error:", err);
        setMapError(err.message ?? "Kunde inte hämta butikskarta");
      } finally {
        setMapLoading(false);
      }
    }

    loadMap();
  }, [rawStoreId, storeId]);

  function handleNextStep() {
    setCurrentStepIndex((prev) => prev + 1);
  }

  function handlePreviousStep() {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#f5f7f6",
      }}
    >
      <TopBar
  title="Din rutt"
  subtitle={storeName}
  backLabel="Inköpslista"
/>
      <FlatList
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            

            <Text
              style={{
                opacity: 0.7,
                marginBottom: 20,
                fontSize: 15,
              }}
            >
              {sortedSteps.length} stopp
            </Text>

            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#e5e7eb",
                borderRadius: 14,
                padding: 4,
                marginBottom: 20,
              }}
            >
              <Pressable
                onPress={() => setViewMode("step")}
                style={{
                  flex: 1,
                  backgroundColor:
                    viewMode === "step" ? "#16a34a" : "transparent",
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: viewMode === "step" ? "white" : "#111827",
                    fontWeight: "700",
                  }}
                >
                  Steg-för-steg
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setViewMode("full")}
                style={{
                  flex: 1,
                  backgroundColor:
                    viewMode === "full" ? "#16a34a" : "transparent",
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: viewMode === "full" ? "white" : "#111827",
                    fontWeight: "700",
                  }}
                >
                  Hela rutten
                </Text>
              </Pressable>
            </View>

            {viewMode === "step" && !isFinished && currentSegment && (
              <View
                style={{
                  backgroundColor: "#ecfdf3",
                  borderRadius: 18,
                  padding: 18,
                  marginBottom: 18,
                  borderWidth: 1,
                  borderColor: "#bbf7d0",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#15803d",
                    marginBottom: 8,
                  }}
                >
                  Steg {currentStepIndex + 1}
                </Text>

                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "800",
                    marginBottom: 6,
                    color: "#111827",
                  }}
                >
                  {currentSegment.productName ?? "Kassan"}
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: "#374151",
                  }}
                >
                  {currentStep?.nodeLabel ?? "Följ rutten"}
                </Text>
              </View>
            )}

            {mapLoading ? (
              <Text>Laddar karta...</Text>
            ) : mapError ? (
              <Text style={{ color: "red" }}>{mapError}</Text>
            ) : map && mapImage ? (
              <StoreMapView
                steps={
                  viewMode === "full"
                    ? sortedSteps
                    : currentStep
                    ? [currentStep]
                    : []
                }
                map={map}
                image={mapImage}
                pathNodeIds={pathToDraw}
              />
            ) : null}

            {viewMode === "step" && !isFinished && (
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <Pressable
                  disabled={currentStepIndex === 0}
                  onPress={handlePreviousStep}
                  style={{
                    flex: 1,
                    backgroundColor:
                      currentStepIndex === 0 ? "#d1d5db" : "#e5e7eb",
                    paddingVertical: 16,
                    borderRadius: 14,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      color:
                        currentStepIndex === 0 ? "#6b7280" : "#111827",
                    }}
                  >
                    ← Föregående
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleNextStep}
                  style={{
                    flex: 1,
                    backgroundColor: "#16a34a",
                    paddingVertical: 16,
                    borderRadius: 14,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "700",
                    }}
                  >
                    Nästa steg →
                  </Text>
                </Pressable>
              </View>
            )}

            {isFinished && (
              <View
                style={{
                  backgroundColor: "#dcfce7",
                  padding: 18,
                  borderRadius: 18,
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    marginBottom: 6,
                  }}
                >
                  Rutten är klar!
                </Text>

                <Text>Alla produkter är plockade.</Text>
              </View>
            )}

            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                marginBottom: 14,
                color: "#111827",
              }}
            >
              Alla steg
            </Text>
          </View>
        }
        data={sortedSteps}
        keyExtractor={(item) =>
          `${item.productId}-${item.orderIndex}`
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
        renderItem={({ item, index }) => {
          const isActive =
            viewMode === "step" && index === currentStepIndex;

          const isCompleted =
            viewMode === "step" && index < currentStepIndex;

          return (
            <View
              style={{
                backgroundColor: isActive ? "#ecfdf3" : "white",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isActive ? "#bbf7d0" : "#e5e7eb",
                opacity: isCompleted ? 0.55 : 1,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: isActive
                      ? "#16a34a"
                      : "#e5e7eb",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? "white" : "#111827",
                      fontWeight: "700",
                    }}
                  >
                    {item.orderIndex}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      marginBottom: 4,
                    }}
                  >
                    {item.productName}
                  </Text>

                  <Text
                    style={{
                      color: "#6b7280",
                    }}
                  >
                    {item.nodeLabel}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}