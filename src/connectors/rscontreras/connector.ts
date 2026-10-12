import type {
  SupplierConnector,
  SupplierSearchQuery,
} from "../supplier-connector.js";
import type { TyreOffer } from "../../domain/tyre-offer.js";
import {
  buildRSContrerasSearchUrl,
  parseRSContrerasPage,
} from "./parser.js";

export interface RSContrerasHtmlClient {
  /**
   * Deve devolver o HTML já autenticado da conta B2B.
   * A implementação de login/sessão fica fora do parser e nunca deve
   * expor cookies, passwords ou tokens ao código do domínio.
   */
  get(url: string): Promise<string>;
}

export class RSContrerasConnector implements SupplierConnector {
  readonly id = "rscontreras" as const;

  constructor(private readonly client: RSContrerasHtmlClient) {}

  async searchTyres(query: SupplierSearchQuery): Promise<TyreOffer[]> {
    const url = buildRSContrerasSearchUrl(query.size);
    const html = await this.client.get(url);
    const offers = parseRSContrerasPage(html);

    if (!query.brand) return offers;

    const brand = query.brand.trim().toLowerCase();
    return offers.filter((offer) => offer.brand.toLowerCase() === brand);
  }
}
