import type { TyreOffer } from "../../domain/tyre-offer.js";

interface RSContrerasProduct {
  id?: string;
  price?: string | number;
  brand?: string;
  code?: string;
  tread?: string;
  stock?: number;
  ic?: string;
  iv?: string;
  info?: string;
  ean?: string;
  ecotax?: string | number;
  measure?: string;
}

const NEXT_DATA_RE =
  /self\.__next_f\.push\(\[1,\s*("(?:\\.|[^"\\])*")\]\)/g;

function parseNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseFloat(value.replace(",", ".").trim());

  return Number.isFinite(parsed) ? parsed : undefined;
}

function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((part) =>
      part.length <= 3
        ? part.toUpperCase()
        : part[0]!.toUpperCase() + part.slice(1).toLowerCase(),
    )
    .join(" ");
}

export function normalizeRSContrerasDimension(input: string): string {
  const compact = input.toUpperCase().replace(/\s+/g, "").replace(/[\/R]/g, "");

  if (!/^\d{7}$/.test(compact)) {
    throw new Error(
      `Medida inválida para RS Contreras: "${input}". Exemplo aceite: 205/55 R16.`,
    );
  }

  return compact;
}

export function formatTyreMeasure(input: string): string {
  const match = input.toUpperCase().replace(/\s+/g, "").match(/^(\d{3})\/(\d{2})R(\d{2})$/);

  if (!match) return input.trim();

  return `${match[1]}/${match[2]} R${match[3]}`;
}

export function buildRSContrerasSearchUrl(
  dimension: string,
  baseUrl = "https://areacliente.rscontreras.pt",
): string {
  const url = new URL("/pesquisa", baseUrl);
  url.searchParams.set("dimension", normalizeRSContrerasDimension(dimension));
  return url.toString();
}

function isProduct(value: unknown): value is RSContrerasProduct {
  if (!value || typeof value !== "object") return false;
  const product = value as RSContrerasProduct;

  return (
    typeof product.brand === "string" &&
    typeof product.tread === "string" &&
    product.price !== undefined &&
    typeof product.measure === "string"
  );
}

function decodeNextChunks(html: string): string[] {
  const chunks: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = NEXT_DATA_RE.exec(html)) !== null) {
    try {
      chunks.push(JSON.parse(match[1]!) as string);
    } catch {
      // Um chunk inválido não deve impedir a leitura dos restantes.
    }
  }

  return chunks;
}

function extractProducts(html: string): RSContrerasProduct[] {
  const byId = new Map<string, RSContrerasProduct>();
  let fallbackId = 0;

  for (const chunk of decodeNextChunks(html)) {
    const separator = chunk.indexOf(":");
    if (separator === -1) continue;

    const payload = chunk.slice(separator + 1).trim();
    if (!payload.startsWith("[")) continue;

    try {
      const parsed = JSON.parse(payload) as unknown;
      if (!Array.isArray(parsed)) continue;

      for (const item of parsed) {
        if (!isProduct(item)) continue;
        const key = item.id ?? `fallback-${fallbackId++}`;
        byId.set(key, item);
      }
    } catch {
      // Há muitos chunks Next.js que não são JSON de produtos.
    }
  }

  return [...byId.values()];
}

export function parseRSContrerasPage(html: string): TyreOffer[] {
  return extractProducts(html).flatMap((product) => {
    const unitNetPrice = parseNumber(product.price);
    if (unitNetPrice === undefined) return [];

    const ecoValue = parseNumber(product.ecotax);
    const stock =
      typeof product.stock === "number" && product.stock >= 0
        ? product.stock
        : undefined;

    return [
      {
        supplier: "rscontreras" as const,
        brand: titleCase(product.brand!),
        model: product.tread!.trim(),
        size: formatTyreMeasure(product.measure!),
        loadIndex: product.ic?.trim() || undefined,
        speedIndex: product.iv?.trim() || undefined,
        ean: product.ean?.trim() || undefined,
        supplierCode: product.code?.trim() || undefined,
        stock,
        unitNetPrice,
        ecoValue,
        currency: "EUR" as const,
      },
    ];
  });
}
