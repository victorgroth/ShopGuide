import { apiGet } from "./client";
import { Store } from "../types/store";

export function getStores() {
  return apiGet<Store[]>("/api/stores");
}