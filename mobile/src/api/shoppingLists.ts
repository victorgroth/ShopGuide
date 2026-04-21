import { apiGet, BASE_URL } from "./client";

export type ShoppingListItemDto = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  nodeId?: number | null;
  nodeLabel?: string | null;
  orderIndex?: number | null;
};

export type ShoppingListDto = {
  id: number;
  storeId: number;
  userId: string;
  createdAt: string;
  items: ShoppingListItemDto[];
};

export async function createShoppingList(storeId: number, userId = "demo-user") {
  console.log("createShoppingList called with storeId:", storeId);
  console.log("POST URL:", `${BASE_URL}/api/shoppinglists`);

  const requestBody = {
    storeId,
    userId,
  };

  console.log("Request body:", JSON.stringify(requestBody));

  const response = await fetch(`${BASE_URL}/api/shoppinglists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const text = await response.text();

  console.log("Response status:", response.status);
  console.log("Response text:", text);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return JSON.parse(text) as ShoppingListDto;
}

export async function addItemToShoppingList(
  shoppingListId: number,
  productId: number,
  quantity: number
) {
  const response = await fetch(
    `${BASE_URL}/api/shoppinglists/${shoppingListId}/items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        quantity,
      }),
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return JSON.parse(text);
}

export function getShoppingList(shoppingListId: number) {
  return apiGet<ShoppingListDto>(`/api/shoppinglists/${shoppingListId}`);
}

export async function planRoute(shoppingListId: number) {
  const response = await fetch(
    `${BASE_URL}/api/shoppinglists/${shoppingListId}/plan-route`,
    {
      method: "POST",
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return JSON.parse(text);
}