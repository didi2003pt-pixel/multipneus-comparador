import type { TyreOffer } from "../../domain/tyre-offer.js";

function htmlText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&gt;/gi, ">")
    .replace(/&lt;/gi, "<")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function field(html: string, suffix: string, index: string): string | undefined {
  const match = html.match(
    new RegExp(
      `id=["'][^"']*${suffix}_${index}["'][^>]*>([\\s\\S]*?)<\\/span>`,
      "i",
    ),
  );
  return match ? htmlText(match[1]!) : undefined;
}

function money(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseFloat(
    value.replace(/\./g, "").replace(",", ".").replace(/[^0-9.-]/g, ""),
  );
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseDescription(value: string): {
  brand: string;
  size: string;
  loadIndex?: string;
  speedIndex?: string;
  model: string;
} {
  const normalized = value.replace(/\s+/g, " ").trim();
  const match = normalized.match(
    /^(.+?)\s+(\d{3})\/(\d{2})R(\d{2})\s+(\d{2,3})([A-Z])\s+(.+)$/i,
  );

  if (!match) {
    return {
      brand: normalized.split(" ")[0] ?? normalized,
      size: "",
      model: normalized,
    };
  }

  return {
    brand: match[1]!.trim(),
    size: `${match[2]}/${match[3]} R${match[4]}`,
    loadIndex: match[5],
    speedIndex: match[6]?.toUpperCase(),
    model: match[7]!.trim(),
  };
}

export function parseSJosePage(html: string): TyreOffer[] {
  const descriptions = [
    ...html.matchAll(
      /id=["'][^"']*lblDescription_(\d+)["'][^>]*>([\s\S]*?)<\/span>/gi,
    ),
  ];

  return descriptions.flatMap((descriptionMatch) => {
    const index = descriptionMatch[1]!;
    const description = htmlText(descriptionMatch[2]!);
    const price = money(field(html, "lblPrice", index));
    if (price === undefined) return [];

    const stockRaw = field(html, "lblQuantity", index);
    const exactStock =
      stockRaw && /^\d+$/.test(stockRaw)
        ? Number.parseInt(stockRaw, 10)
        : undefined;
    const ecoValue = money(field(html, "lblEco", index));
    const parsed = parseDescription(description);

    return [
      {
        supplier: "sjose" as const,
        brand: parsed.brand,
        model: parsed.model,
        size: parsed.size,
        loadIndex: parsed.loadIndex,
        speedIndex: parsed.speedIndex,
        stock: exactStock,
        stockLabel: exactStock === undefined ? stockRaw : undefined,
        unitNetPrice: price,
        ecoValue,
        currency: "EUR" as const,
      },
    ];
  });
}
