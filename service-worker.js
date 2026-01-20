<script>
/***********************
 * KIOSK – FINAL LOGIC
 ***********************/

/* ===== STATE ===== */
let cart = [];
let sales = [];
let expenses = [];
let products = JSON.parse(localStorage.getItem("products")) || [];

/* ===== HELPERS ===== */
function euro(n) {
  return Number(n).toFixed(2);
}

function now() {
  return new Date().toLocaleString();
}

/* ===== WARENKORB ===== */
function renderCart() {
  const ul = document.getElementById("cart");
  const totalEl = document.getElementById("cartTotal");

  ul.innerHTML = "";
  let sum = 0;

  cart.forEach(item => {
    sum += item.price;
    const li = document.createElement("li");
    li.textContent = `${item.name} – ${euro(item.price)} €`;
    ul.appendChild(li);
  });

  totalEl.textContent = euro(sum);
}

/* ===== FESTE PRODUKTE ===== */
document.querySelectorAll("button[data-price]").forEach(btn => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.name;
    const price = Number(btn.dataset.price);
    if (isNaN(price)) return;
    cart.push({ name, price });
    renderCart();
  });
});

/* ===== SONSTIGES ===== */
document.querySelector(".addMiscBtn").addEventListener("click", () => {
  const box = document.querySelector(".category.misc");
  const name = box.querySelector(".miscName").value || "Sonstiges";
  const price = Number(box.querySelector(".miscPrice").value);

  if (isNaN(price) || price <= 0) {
    alert("Bitte gültigen Preis eingeben");
    return;
  }

  cart.push({ name, price });
  box.querySelector(".miscPrice").value = "";
  renderCart();
});

/* ===== PRODUKTE RENDERN (DYNAMISCH) ===== */
function renderDynamicProducts() {
  products.forEach(p => {
    const box = document.querySelector(`.category.${p.category}`);
    if (!box) return;

    // doppelte verhindern
    if (box.querySelector(`[data-dynamic="${p.name}"]`)) return;

    const btn = document.createElement("button");
    btn.textContent = `${p.name} ${euro(p.price)} €`;
    btn.dataset.dynamic = p.name;

    btn.addEventListener("click", () => {
      cart.push({ name: p.name, price: p.price });
      renderCart();
    });

    box.appendChild(btn);
  });
}

/* ===== PRODUKT HINZUFÜGEN ===== */
document.getElementById("addProductBtn").addEventListener("click", () => {
  const name = document.getElementById("newProductName").value.trim();
  const price = Number(document.getElementById("newProductPrice").value);
  const category = document.getElementById("newProductCategory").value;

  if (!name || isNaN(price) || price <= 0 || !category) {
    alert("Bitte Name, Preis und Kategorie angeben");
    return;
  }

  products.push({ name, price, category });
  localStorage.setItem("products", JSON.stringify(products));

  renderDynamicProducts();

  document.getElementById("newProductName").value = "";
  document.getElementById("newProductPrice").value = "";
  document.getElementById("newProductCategory").value = "";
});

/* ===== CHECKOUT ===== */
document.getElementById("checkout").addEventListener("click", () => {
  if (cart.length === 0) return;

  sales.push({
    time: now(),
    items: [...cart]
  });

  cart = [];
  renderCart();
  updateTotals();
});

/* ===== AUSGABEN ===== */
document.getElementById("addExpense").addEventListener("click", () => {
  const name = expenseName.value || "Ausgabe";
  const price = Number(expensePrice.value);
  if (isNaN(price) || price <= 0) return;

  expenses.push({
    time: now(),
    name,
    price
  });

  expenseName.value = "";
  expensePrice.value = "";
  updateTotals();
});

/* ===== TAGESABSCHLUSS ===== */
function updateTotals() {
  const revenue = sales.reduce(
    (sum, sale) => sum + sale.items.reduce((a, b) => a + b.price, 0),
    0
  );

  const expenseSum = expenses.reduce(
    (sum, e) => sum + e.price,
    0
  );

  document.getElementById("rev").textContent = euro(revenue);
  document.getElementById("exp").textContent = euro(expenseSum);
  document.getElementById("gain").textContent = euro(revenue - expenseSum);
}

/* ===== CSV ===== */
function downloadCSV(name, rows) {
  const blob = new Blob(
    ["\uFEFF" + rows.join("\n")],
    { type: "text/csv;charset=utf-8;" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

document.getElementById("exportDay").onclick = () => {
  let rows = ["Datum/Uhrzeit;Artikel;Preis;Typ"];

  sales.forEach(s =>
    s.items.forEach(i =>
      rows.push(`"${s.time}";"${i.name}";"${euro(i.price).replace(".", ",")}";"Einnahme"`)
    )
  );

  expenses.forEach(e =>
    rows.push(`"${e.time}";"${e.name}";"${euro(e.price).replace(".", ",")}";"Ausgabe"`)
  );

  downloadCSV("tagesabschluss.csv", rows);
};

document.getElementById("exportTotal").onclick = () => {
  let rows = ["Datum/Uhrzeit;Artikel;Preis;Typ"];

  sales.forEach(s =>
    s.items.forEach(i =>
      rows.push(`"${s.time}";"${i.name}";"${euro(i.price).replace(".", ",")}";"Einnahme"`)
    )
  );

  expenses.forEach(e =>
    rows.push(`"${e.time}";"${e.name}";"${euro(e.price).replace(".", ",")}";"Ausgabe"`)
  );

  downloadCSV("gesamteinnahmen.csv", rows);
};

/* ===== INIT ===== */
renderDynamicProducts();

/* ===== SERVICE WORKER ===== */
if (location.protocol !== "file:" && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
</script>
