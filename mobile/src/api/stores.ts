import { apiGet } from "./client";

export type Store = {
    Id: number;
    name: string;
    address: string;
    city: string;
    storeType: string;
};

export function getStores() {
    return apiGet<Store[]>("/api/stores");
}