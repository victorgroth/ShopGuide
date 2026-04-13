export type RouteStep = {
  orderIndex: number;
  productId: number;
  productName: string;
  quantity: number;
  aisle?: string;
  shelf?: string;
};