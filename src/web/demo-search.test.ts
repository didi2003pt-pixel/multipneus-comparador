import assert from "node:assert/strict";
import test from "node:test";
import { searchDemo } from "./demo-search.js";

test("modo demo compara RS Contreras e AB Tyres sem fingir ligação à S. José", async () => {
  const result = await searchDemo({
    size: "205/55 R16",
    brand: "Michelin",
    quantity: 4,
  });

  assert.equal(result.mode, "demo");
  assert.equal(result.offers.length, 2);
  assert.equal(result.offers[0]?.supplier, "rscontreras");
  assert.equal(result.offers[0]?.ean, "3528708773189");

  const sjose = result.suppliers.find((supplier) => supplier.supplier === "sjose");
  assert.equal(sjose?.error, "autenticação ainda não ligada");
});
