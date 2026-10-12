import { createServer } from "node:http";
import { URL } from "node:url";
import { renderHomePage } from "./page.js";
import { searchDemo } from "./demo-search.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);

function json(response: import("node:http").ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && url.pathname === "/") {
    response.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    });
    response.end(renderHomePage());
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    json(response, 200, { ok: true, mode: "demo" });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/search") {
    const size = url.searchParams.get("size")?.trim();
    const brand = url.searchParams.get("brand")?.trim() || undefined;
    const quantityRaw = url.searchParams.get("quantity");
    const quantity = quantityRaw ? Number.parseInt(quantityRaw, 10) : 1;

    if (!size) {
      json(response, 400, { error: "A medida é obrigatória." });
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
      json(response, 400, { error: "Quantidade inválida." });
      return;
    }

    try {
      json(response, 200, await searchDemo({ size, brand, quantity }));
    } catch (error) {
      json(response, 500, {
        error: error instanceof Error ? error.message : "Erro inesperado.",
      });
    }
    return;
  }

  json(response, 404, { error: "Não encontrado." });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Multipneus Comparador disponível em http://localhost:${port}`);
});
