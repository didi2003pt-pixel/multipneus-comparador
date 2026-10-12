export type SupplierId = "abtyres" | "sjose" | "rscontreras";

export interface TyreOffer {
  supplier: SupplierId;
  brand: string;
  model: string;
  size: string;
  loadIndex?: string;
  speedIndex?: string;
  ean?: string;
  supplierCode?: string;
  stock?: number;
  stockLabel?: string;
  unitNetPrice: number;
  ecoValue?: number;
  shippingPerTyre?: number;
  vatRate?: number;
  currency: "EUR";
}

export interface RankedOffer extends TyreOffer {
  knownNetCostPerTyre: number;
  costIsComplete: boolean;
}
