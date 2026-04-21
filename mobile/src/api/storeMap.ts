import { apiGet } from "./client";

export type MapNode = {
  id: number;
  x: number;
  y: number;
  label: string;
};

export type MapEdge = {
  fromNodeId: number;
  toNodeId: number;
};

export type StoreMap = {
  nodes: MapNode[];
  edges: MapEdge[];
};

export function getStoreMap(storeId: number) {
  return apiGet<StoreMap>(`/api/stores/${storeId}/map`);
}