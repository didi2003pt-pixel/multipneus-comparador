import type { SupplierSearchQuery } from "../connectors/supplier-connector.js";
import { rankOffers } from "../core/rank-offers.js";
import { searchAllSuppliers } from "../core/search-suppliers.js";
import { demoConnectors } from "./demo-connectors.js";

export async function searchDemo(query: SupplierSearchQuery) {
  const result = await searchAllSuppliers(demoConnectors, query, 2_000);

  return {
    mode: "demo" as const,
    query: result.query,
    suppliers: result.suppliers,
    offers: rankOffers(result.offers),
    warning:
      "Demonstração local: ainda não inicia sessão nem consulta os portais B2B em tempo real.",
  };
}
