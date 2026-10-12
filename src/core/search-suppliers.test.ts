import assert from "node:assert/strict";
import test from "node:test";
import type {
  SupplierConnector,
  SupplierSearchQuery,
} from "../connectors/supplier-connector.js";
import type { SupplierId, TyreOffer } from "../domain/tyre-offer.js";
import { searchAllSuppliers } from "./search-suppliers.js";

function offer(supplier: SupplierId, price: number): TyreOffer {
  return {
    supplier,
    brand: "Michelin",
    model: "Primacy 5",
    size: "205/55 R16",
    unitNetPrice: price,
    currency: "EUR",
  };
}

function fakeConnector(
  id: SupplierId,
  run: (query: SupplierSearchQuery) => Promise<TyreOffer[]>,
): SupplierConnector {
  return { id, searchTyres: run };
}

test("pesquisa fornecedores em paralelo e isola falhas", async () => {
  const connectors: SupplierConnector[] = [
    fakeConnector("rscontreras", async () => [offer("rscontreras", 68.95)]),
    fakeConnector("abtyres", async () => {
      throw new Error("sessão expirada");
    }),
    fakeConnector(
      "sjose",
      async () =>
        new Promise((resolve) =>
          setTimeout(() => resolve([offer("sjose", 70)]), 40),
        ),
    ),
  ];

  const result = await searchAllSuppliers(
    connectors,
    { size: "205/55 R16", brand: "Michelin", quantity: 4 },
    10,
  );

  assert.equal(result.offers.length, 1);
  assert.equal(result.offers[0]?.supplier, "rscontreras");

  const ab = result.suppliers.find((item) => item.supplier === "abtyres");
  assert.equal(ab?.error, "sessão expirada");

  const sjose = result.suppliers.find((item) => item.supplier === "sjose");
  assert.match(sjose?.error ?? "", /timeout/);
});
