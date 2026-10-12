import type {
  SupplierConnector,
  SupplierSearchQuery,
} from "../connectors/supplier-connector.js";
import type { TyreOffer } from "../domain/tyre-offer.js";

const RS_SAMPLE: TyreOffer = {
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
};

const AB_SAMPLE: TyreOffer = {
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
};

function normalizedSize(size: string): string {
  return size.toUpperCase().replace(/\s+/g, "");
}

function matches(offer: TyreOffer, query: SupplierSearchQuery): boolean {
  const sizeMatches =
    normalizedSize(offer.size) === normalizedSize(query.size).replace("R", "R");
  const brandMatches =
    !query.brand ||
    offer.brand.toLowerCase() === query.brand.trim().toLowerCase();

  return sizeMatches && brandMatches;
}

class StaticDemoConnector implements SupplierConnector {
  readonly id: "rscontreras" | "abtyres";

  constructor(
    id: "rscontreras" | "abtyres",
    private readonly offers: TyreOffer[],
  ) {
    this.id = id;
  }

  async searchTyres(query: SupplierSearchQuery): Promise<TyreOffer[]> {
    return this.offers.filter((offer) => matches(offer, query));
  }
}

class PendingSJoseConnector implements SupplierConnector {
  readonly id = "sjose" as const;

  async searchTyres(): Promise<TyreOffer[]> {
    throw new Error("autenticação ainda não ligada");
  }
}

export const demoConnectors: SupplierConnector[] = [
  new StaticDemoConnector("rscontreras", [RS_SAMPLE]),
  new StaticDemoConnector("abtyres", [AB_SAMPLE]),
  new PendingSJoseConnector(),
];
