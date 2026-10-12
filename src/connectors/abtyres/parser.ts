import type { TyreOffer } from "../../domain/tyre-offer.js";

function numberValue(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseFloat(
    value.replace(",", ".").replace(/[^0-9.-]/g, ""),
  );
  return Number.isFinite(parsed) ? parsed : undefined;
}

function inputValue(html: string, name: string): string | undefined {
  const match = html.match(
    new RegExp(
      `<input[^>]+name=["']${name}["'][^>]*value=["']([^"']*)["'][^>]*>`,
      "i",
    ),
  );
  return match?.[1];
}

function parseName(value: string): {
  size: string;
  loadIndex?: string;
  speedIndex?: string;
  model: string;
} {
  const normalized = value.replace(/\s+/g, " ").trim();
  const match = normalized.match(
    /^(\d{3})\/(\d{2})\s*R\s*(\d{2})\s*-\s*(\d{2,3})([A-Z])\s*-\s*(.+)$/i,
  );

  if (!match) {
    return { size: normalized, model: normalized };
  }

  return {
    size: `${match[1]}/${match[2]} R${match[3]}`,
    loadIndex: match[4],
    speedIndex: match[5]?.toUpperCase(),
    model: match[6]!.trim(),
  };
}

export function parseABTyresPage(html: string): TyreOffer[] {
  const forms = [
    ...html.matchAll(
      /<form[^>]+name=["']formAddCart\d+["'][\s\S]*?<\/form>/gi,
    ),
  ];
  const offers: TyreOffer[] = [];

  for (let i = 0; i < forms.length; i += 1) {
    const form = forms[i]!;
    const formHtml = form[0];
    const brand = inputValue(formHtml, "marca");
    const name = inputValue(formHtml, "nome");
    const price = numberValue(inputValue(formHtml, "preco"));

    if (!brand || !name || price === undefined) continue;

    const parsedName = parseName(name);
    const stock = numberValue(inputValue(formHtml, "stock"));
    const ecoValue = numberValue(inputValue(formHtml, "eco"));
    const vatRate = numberValue(inputValue(formHtml, "taxIva"));
    const supplierCode = inputValue(formHtml, "codigo");

    const start = (form.index ?? 0) + formHtml.length;
    const end =
      i + 1 < forms.length
        ? (forms[i + 1]!.index ?? html.length)
        : Math.min(html.length, start + 5000);
    const trailing = html.slice(start, end);
    const ean = trailing.match(/EAN:(\d{8,14})/i)?.[1];

    offers.push({
      supplier: "abtyres",
      brand: brand.trim(),
      model: parsedName.model,
      size: parsedName.size,
      loadIndex: parsedName.loadIndex,
      speedIndex: parsedName.speedIndex,
      ean,
      supplierCode: supplierCode?.trim() || undefined,
      stock,
      unitNetPrice: price,
      ecoValue,
      vatRate,
      currency: "EUR",
    });
  }

  return offers;
}
