import type { RankedOffer, TyreOffer } from "../domain/tyre-offer.js";

export function rankOffers(offers: TyreOffer[]): RankedOffer[] {
  return offers
    .map((offer) => {
      const eco = offer.ecoValue ?? 0;
      const shipping = offer.shippingPerTyre ?? 0;

      return {
        ...offer,
        knownNetCostPerTyre: offer.unitNetPrice + eco + shipping,
        costIsComplete:
          offer.ecoValue !== undefined && offer.shippingPerTyre !== undefined,
      };
    })
    .sort((a, b) => a.knownNetCostPerTyre - b.knownNetCostPerTyre);
}
