import { apiGet } from "./client";
import { Product } from "../types/product";

export function getProductsForStore(storeId: string | number) {
  return apiGet<Product[]>(`/api/stores/${storeId}/products`);
}