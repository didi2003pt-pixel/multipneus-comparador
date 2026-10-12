import assert from "node:assert/strict";
import test from "node:test";
import { parseSJosePage } from "./parser.js";

test("extrai oferta S. José sem inventar stock acima de 20", () => {
  const html = `
    <span id="ContentPlaceHolder1_gvArticles_lblDescription_1">MICHELIN 205/55R17 91V PRIMACY 5</span>
    <span id="ContentPlaceHolder1_gvArticles_lblPrice_1">100,22 €</span>
    <span id="ContentPlaceHolder1_gvArticles_lblQuantity_1">&gt;20</span>
    <span id="ContentPlaceHolder1_gvArticles_lblEco_1">1,48€</span>
  `;

  assert.deepEqual(parseSJosePage(html), [
    {
      supplier: "sjose",
      brand: "MICHELIN",
      model: "PRIMACY 5",
      size: "205/55 R17",
      loadIndex: "91",
      speedIndex: "V",
      stock: undefined,
      stockLabel: ">20",
      unitNetPrice: 100.22,
      ecoValue: 1.48,
      currency: "EUR",
    },
  ]);
});
