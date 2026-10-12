import type {
  SupplierConnector,
  SupplierSearchQuery,
} from "../connectors/supplier-connector.js";
import type { SupplierId, TyreOffer } from "../domain/tyre-offer.js";

export interface SupplierSearchResult {
  supplier: SupplierId;
  offers: TyreOffer[];
  elapsedMs: number;
  error?: string;
}

export interface SearchAllResult {
  query: SupplierSearchQuery;
  suppliers: SupplierSearchResult[];
  offers: TyreOffer[];
}

function timeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timeout após ${timeoutMs} ms`)),
      timeoutMs,
    );

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : "erro desconhecido";
}

export async function searchAllSuppliers(
  connectors: SupplierConnector[],
  query: SupplierSearchQuery,
  timeoutMs = 8_000,
): Promise<SearchAllResult> {
  const suppliers = await Promise.all(
    connectors.map(async (connector): Promise<SupplierSearchResult> => {
      const startedAt = Date.now();

      try {
        const offers = await timeout(connector.searchTyres(query), timeoutMs);

        return {
          supplier: connector.id,
          offers,
          elapsedMs: Date.now() - startedAt,
        };
      } catch (error) {
        return {
          supplier: connector.id,
          offers: [],
          elapsedMs: Date.now() - startedAt,
          error: messageFrom(error),
        };
      }
    }),
  );

  return {
    query,
    suppliers,
    offers: suppliers.flatMap((supplier) => supplier.offers),
  };
}
