export type Product = {
  productId: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  quantity: number;
  aisle?: string;
  shelf?: string;
  nodeId?: number | null;
  nodeLabel?: string | null;
};