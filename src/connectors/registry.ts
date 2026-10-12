import type { SupplierId } from "../domain/tyre-offer.js";

export interface SupplierState {
  id: SupplierId;
  label: string;
  integration: "portal-parser";
  status: "mapped" | "live";
}

export const suppliers: SupplierState[] = [
  { id: "abtyres", label: "AB Tyres", integration: "portal-parser", status: "mapped" },
  { id: "sjose", label: "S. José Pneus", integration: "portal-parser", status: "mapped" },
  { id: "rscontreras", label: "RS Contreras", integration: "portal-parser", status: "mapped" },
];
