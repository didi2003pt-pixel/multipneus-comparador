export function renderHomePage(): string {
  return String.raw`<!doctype html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Multipneus Comparador</title>
  <style>
    :root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#16202a;background:#f4f6f8}
    *{box-sizing:border-box}
    body{margin:0;background:linear-gradient(180deg,#eef4f7 0,#f7f8fa 42%);min-height:100vh}
    .wrap{max-width:1180px;margin:0 auto;padding:32px 22px 60px}
    header{display:flex;justify-content:space-between;gap:18px;align-items:center;margin-bottom:24px}
    h1{font-size:28px;margin:0;letter-spacing:-.02em}
    .sub{color:#63707b;margin-top:5px}
    .badge{display:inline-flex;align-items:center;border-radius:999px;padding:8px 12px;background:#fff3cd;color:#755b00;font-weight:700;font-size:12px;border:1px solid #f0df9b}
    .panel{background:#fff;border:1px solid #dce3e8;border-radius:18px;box-shadow:0 14px 40px rgba(30,48,60,.08);padding:22px}
    form{display:grid;grid-template-columns:1.25fr 1fr .55fr auto;gap:12px;align-items:end}
    label{display:block;font-size:12px;font-weight:800;color:#52606c;margin:0 0 7px;text-transform:uppercase;letter-spacing:.05em}
    input{width:100%;height:48px;border:1px solid #ccd5dc;border-radius:11px;padding:0 13px;font-size:16px;outline:none;background:#fff}
    input:focus{border-color:#1e6f8d;box-shadow:0 0 0 3px rgba(30,111,141,.12)}
    button{height:48px;border:0;border-radius:11px;padding:0 22px;background:#176b87;color:#fff;font-size:15px;font-weight:800;cursor:pointer}
    button:disabled{opacity:.6;cursor:wait}
    .hint{font-size:12px;color:#7b8790;margin-top:12px}
    .status{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0}
    .supplier{background:#fff;border:1px solid #dce3e8;border-radius:14px;padding:14px 16px}
    .supplier strong{display:block;font-size:14px}
    .supplier small{display:block;margin-top:5px;color:#6c7881}
    .dot{width:9px;height:9px;border-radius:50%;display:inline-block;margin-right:7px;background:#93a1aa}
    .dot.ok{background:#2d9b64}.dot.err{background:#d27b37}
    .results{margin-top:18px;overflow:hidden}
    .empty{padding:34px 14px;text-align:center;color:#72808a}
    table{width:100%;border-collapse:collapse}
    th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6c7881;padding:12px;border-bottom:1px solid #e2e7eb}
    td{padding:14px 12px;border-bottom:1px solid #edf0f2;vertical-align:middle}
    tbody tr:first-child{background:#f3faf6}
    .best{display:inline-block;background:#dff3e7;color:#246b46;border-radius:999px;padding:5px 8px;font-size:11px;font-weight:800;margin-left:7px}
    .money{font-weight:850;font-variant-numeric:tabular-nums;white-space:nowrap}
    .muted{color:#72808a;font-size:12px}
    .warning{display:none;margin-top:16px;padding:12px 14px;border-radius:10px;background:#fff8df;color:#6f5b14;border:1px solid #eee0a5;font-size:13px}
    @media(max-width:820px){form{grid-template-columns:1fr 1fr}.status{grid-template-columns:1fr}button{width:100%}}
    @media(max-width:560px){form{grid-template-columns:1fr}header{align-items:flex-start;flex-direction:column}.panel{padding:16px}.wrap{padding:20px 12px 40px}th:nth-child(4),td:nth-child(4),th:nth-child(6),td:nth-child(6){display:none}}
  </style>
</head>
<body>
  <main class="wrap">
    <header>
      <div>
        <h1>Multipneus Comparador</h1>
        <div class="sub">Pesquisa interna de preços e stock B2B</div>
      </div>
      <div class="badge">MODO DEMO · sem login automático</div>
    </header>

    <section class="panel">
      <form id="searchForm">
        <div>
          <label for="size">Medida</label>
          <input id="size" name="size" value="205/55 R16" autocomplete="off" required>
        </div>
        <div>
          <label for="brand">Marca</label>
          <input id="brand" name="brand" value="Michelin" autocomplete="off">
        </div>
        <div>
          <label for="quantity">Qtd.</label>
          <input id="quantity" name="quantity" type="number" min="1" max="20" value="4">
        </div>
        <button id="submitBtn" type="submit">Pesquisar</button>
      </form>
      <div class="hint">Nesta fase a página usa os dados reais que já validámos para o exemplo Michelin Primacy 5 205/55 R16. A ligação aos logins B2B vem a seguir.</div>
      <div id="warning" class="warning"></div>
    </section>

    <section id="supplierStatus" class="status"></section>

    <section class="panel results">
      <div id="results"><div class="empty">Carrega em <strong>Pesquisar</strong> para testar o fluxo.</div></div>
    </section>
  </main>

  <script>
    const supplierNames = {
      rscontreras: "RS Contreras",
      abtyres: "AB Tyres",
      sjose: "S. José Pneus"
    };

    const euro = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });

    function escapeHtml(value) {
      return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
      }[char]));
    }

    function renderSuppliers(suppliers) {
      const root = document.getElementById("supplierStatus");
      root.innerHTML = suppliers.map(item => {
        const ok = !item.error;
        const detail = item.error
          ? escapeHtml(item.error)
          : item.offers.length + " oferta(s) · " + item.elapsedMs + " ms";
        return '<div class="supplier"><strong><span class="dot ' + (ok ? 'ok' : 'err') + '"></span>' +
          escapeHtml(supplierNames[item.supplier] || item.supplier) +
          '</strong><small>' + detail + '</small></div>';
      }).join("");
    }

    function renderOffers(offers) {
      const root = document.getElementById("results");
      if (!offers.length) {
        root.innerHTML = '<div class="empty">Sem ofertas para esta pesquisa no modo demo.</div>';
        return;
      }

      root.innerHTML = '<table><thead><tr>' +
        '<th>Fornecedor</th><th>Pneu</th><th>Stock</th><th>Preço</th><th>Eco</th><th>Custo conhecido</th>' +
        '</tr></thead><tbody>' +
        offers.map((offer, index) => {
          const tyre = [offer.brand, offer.model, offer.size, (offer.loadIndex || "") + (offer.speedIndex || "")].filter(Boolean).join(" ");
          const stock = offer.stock ?? offer.stockLabel ?? "—";
          return '<tr><td><strong>' + escapeHtml(supplierNames[offer.supplier] || offer.supplier) + '</strong>' +
            (index === 0 ? '<span class="best">Mais barato conhecido</span>' : '') +
            '</td><td>' + escapeHtml(tyre) + '<div class="muted">EAN ' + escapeHtml(offer.ean || "—") + '</div></td>' +
            '<td>' + escapeHtml(stock) + '</td>' +
            '<td class="money">' + euro.format(offer.unitNetPrice) + '</td>' +
            '<td class="money">' + (offer.ecoValue == null ? "—" : euro.format(offer.ecoValue)) + '</td>' +
            '<td class="money">' + euro.format(offer.knownNetCostPerTyre) + '<div class="muted">' +
            (offer.costIsComplete ? "comparação completa" : "portes ainda não incluídos") +
            '</div></td></tr>';
        }).join("") +
        '</tbody></table>';
    }

    document.getElementById("searchForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = document.getElementById("submitBtn");
      button.disabled = true;
      button.textContent = "A pesquisar…";

      const params = new URLSearchParams({
        size: document.getElementById("size").value,
        brand: document.getElementById("brand").value,
        quantity: document.getElementById("quantity").value
      });

      try {
        const response = await fetch("/api/search?" + params.toString());
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro na pesquisa");

        renderSuppliers(data.suppliers);
        renderOffers(data.offers);
        const warning = document.getElementById("warning");
        warning.textContent = data.warning;
        warning.style.display = "block";
      } catch (error) {
        document.getElementById("results").innerHTML =
          '<div class="empty">Erro: ' + escapeHtml(error.message || error) + '</div>';
      } finally {
        button.disabled = false;
        button.textContent = "Pesquisar";
      }
    });
  </script>
</body>
</html>`;
}
