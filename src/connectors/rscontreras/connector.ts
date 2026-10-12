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

export class RSContrerasConnector {
  constructor(private readonly client: RSContrerasHtmlClient) {}

  async searchTyres(dimension: string): Promise<TyreOffer[]> {
    const url = buildRSContrerasSearchUrl(dimension);
    const html = await this.client.get(url);
    return parseRSContrerasPage(html);
  }
}
