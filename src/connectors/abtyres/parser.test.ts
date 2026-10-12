import assert from "node:assert/strict";
import test from "node:test";
import { parseABTyresPage } from "./parser.js";

test("extrai uma oferta AB Tyres de HTML sanitizado", () => {
  const html = `
    <form method="POST" name="formAddCart72">
      <input name="marca" type="hidden" value="Michelin">
      <input name="nome" type="hidden" value="205/55 R 16 - 91V - PRIMACY5 P">
      <input name="preco" type="hidden" value="71.5">
      <input name="eco" type="hidden" value="1.48">
      <input name="stock" type="hidden" value="140">
      <input name="codigo" type="hidden" value="CODIGO-TESTE">
      <input name="taxIva" type="hidden" value="23">
    </form>
    <a data-title="&lt;span&gt;EAN:3528708773189&lt;/span&gt;">etiqueta</a>
  `;

  assert.deepEqual(parseABTyresPage(html), [
    {
      supplier: "abtyres",
      brand: "Michelin",
      model: "PRIMACY5 P",
      size: "205/55 R16",
      loadIndex: "91",
      speedIndex: "V",
      ean: "3528708773189",
      supplierCode: "CODIGO-TESTE",
      stock: 140,
      unitNetPrice: 71.5,
      ecoValue: 1.48,
      vatRate: 23,
      currency: "EUR",
    },
  ]);
});
