import type { SupplierId, TyreOffer } from "../domain/tyre-offer.js";

export interface SupplierSearchQuery {
  size: string;
  brand?: string;
  quantity?: number;
}

export interface SupplierConnector {
  readonly id: SupplierId;
  searchTyres(query: SupplierSearchQuery): Promise<TyreOffer[]>;
}
