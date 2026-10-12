import { rankOffers } from "./core/rank-offers.js";
import type { TyreOffer } from "./domain/tyre-offer.js";

const sample: TyreOffer[] = [
  {
    supplier: "rscontreras",
    brand: "Michelin",
    model: "Primacy 5",
    size: "205/55 R16",
    loadIndex: "91",
    speedIndex: "V",
    ean: "3528708773189",
    stock: 274,
    unitNetPrice: 68.95,
    ecoValue: 1.48,
    currency: "EUR",
  },
  {
    supplier: "abtyres",
    brand: "Michelin",
    model: "Primacy 5",
    size: "205/55 R16",
    loadIndex: "91",
    speedIndex: "V",
    ean: "3528708773189",
    stock: 140,
    unitNetPrice: 71.5,
    ecoValue: 1.48,
    vatRate: 23,
    currency: "EUR",
  },
];

console.table(
  rankOffers(sample).map((offer) => ({
    fornecedor: offer.supplier,
    pneu: `${offer.brand} ${offer.model} ${offer.size} ${offer.loadIndex ?? ""}${offer.speedIndex ?? ""}`,
    ean: offer.ean,
    stock: offer.stock ?? offer.stockLabel,
    precoLiquido: offer.unitNetPrice.toFixed(2),
    eco: offer.ecoValue?.toFixed(2) ?? "?",
    custoConhecido: offer.knownNetCostPerTyre.toFixed(2),
    custoCompleto: offer.costIsComplete ? "sim" : "não (faltam portes/encargos)",
  }))
);
