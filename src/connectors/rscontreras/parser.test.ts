import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRSContrerasSearchUrl,
  normalizeRSContrerasDimension,
  parseRSContrerasPage,
} from "./parser.js";

test("normaliza 205/55 R16 para o formato do portal", () => {
  assert.equal(normalizeRSContrerasDimension("205/55 R16"), "2055516");
  assert.equal(normalizeRSContrerasDimension("205/55R16"), "2055516");
  assert.equal(normalizeRSContrerasDimension("2055516"), "2055516");
});

test("constrói o URL de pesquisa", () => {
  assert.equal(
    buildRSContrerasSearchUrl("205/55 R16"),
    "https://areacliente.rscontreras.pt/pesquisa?dimension=2055516",
  );
});

test("extrai ofertas do payload Next.js sem guardar a resposta B2B real", () => {
  const products = [
    {
      id: "produto-teste-1",
      price: "68.95",
      brand: "michelin",
      code: "CODIGO-TESTE",
      tread: "Primacy 5",
      stock: 274,
      ic: "91",
      iv: "V",
      ean: "3528708773189",
      ecotax: "1.48",
      measure: "205/55R16",
    },
  ];

  const chunk = `29:${JSON.stringify(products)}\\n`;
  const html = `<script>self.__next_f.push([1, ${JSON.stringify(chunk)}])</script>`;

  assert.deepEqual(parseRSContrerasPage(html), [
    {
      supplier: "rscontreras",
      brand: "Michelin",
      model: "Primacy 5",
      size: "205/55 R16",
      loadIndex: "91",
      speedIndex: "V",
      ean: "3528708773189",
      supplierCode: "CODIGO-TESTE",
      stock: 274,
      unitNetPrice: 68.95,
      ecoValue: 1.48,
      currency: "EUR",
    },
  ]);
});
