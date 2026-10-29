// price-loader.js (v2) — daftar harga DIGIPLUS -> digabung ke data HP
// Format tab: 3 baris judul di atas, header di baris ke-4:
// Brand | Kategori / Seri | Nama Produk | Harga Normal (Rp) | Harga Promo (Rp) | Status
// Satu baris = satu varian ("REDMI NOTE 14 5G 6/128GB"), jadi harus digrup per model dasar.
import { loadSheet, SHEET_URLS } from "./sheet-loader.js";

const norm = (s) => String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();

// "11.999.000" | "Rp 1,9 jt" | "TBA" -> angka atau null
export function parsePrice(raw) {
  let s = norm(raw);
  if (!s || /^(tba|-|n\/a|na|belum.*)$/.test(s)) return null;
  const juta = /(jt|juta)/.test(s);
  s = s.replace(/rp\.?|idr|jt|juta|\s/g, "");
  if (juta) {
    const n = parseFloat(s.replace(",", "."));
    return Number.isFinite(n) ? Math.round(n * 1_000_000) : null;
  }
  s = s.replace(/[.,](?=\d{3}(\D|$))/g, "");
  const n = parseInt(s.replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const formatRupiah = (n) =>
  n == null ? "Harga Belum Tersedia (TBA)" : "Rp " + n.toLocaleString("id-ID");

// Kata merek dibuang supaya "SAMSUNG Z FLIP" == "Galaxy Z Flip"
const NOISE = /\b(samsung|galaxy|xiaomi|huawei|infinix|oppo|motorola|amazfit)\b/gi;

export const modelKey = (s) =>
  String(s ?? "").replace(NOISE, " ").toLowerCase().replace(/[^a-z0-9]+/g, "");

// "REDMI NOTE 14 5G 6/128GB" -> { base: "REDMI NOTE 14 5G", variant: "6/128GB" }
export function splitVariant(name) {
  const m = String(name).match(/\b(\d{1,2})\s*\/\s*(\d{2,4})\s*(GB|TB)?\b/i);
  if (!m) return { base: name.trim(), variant: "" };
  const variant = `${m[1]}/${m[2]}${(m[3] || "GB").toUpperCase()}`;
  const base = name.replace(m[0], " ").replace(/\s+/g, " ").trim();
  return { base, variant };
}

// Hasil: { [modelKey]: [{ variant, normal, promo, price, status, name }] }
export async function loadPrices(url = SHEET_URLS.prices) {
  const rows = await loadSheet(url, { headerMatch: /nama produk/i });
  const map = {};
  let skipped = 0;
  for (const r of rows) {
    const name = r["Nama Produk"];
    const normal = parsePrice(r["Harga Normal (Rp)"]);
    const promo = parsePrice(r["Harga Promo (Rp)"]);
    if (!name || (normal == null && promo == null)) { skipped++; continue; }

    // Promo hanya dipakai jika lebih murah dari harga normal
    let price = normal ?? promo;
    if (promo != null && normal != null) {
      if (promo < normal) price = promo;
      else if (promo > normal) console.warn("[harga] promo > normal, cek sheet:", name);
    }
    const { base, variant } = splitVariant(name);
    (map[modelKey(base)] ??= []).push({
      name, variant, normal, promo, price,
      status: (r["Status"] || "").toUpperCase(),
    });
  }
  console.log(`[harga] ${Object.keys(map).length} model, ${skipped} baris dilewati`);
  return map;
}

// Pemakaian di modal detail (phone.name = "REDMI A7 PRO"):
//   const prices = await loadPrices();
//   const list = prices[modelKey(phone.name)] ?? [];
//   if (!list.length) console.warn("Harga tidak ada untuk:", phone.name, "->", modelKey(phone.name));
//   html = list.length
//     ? list.map(v => `<div>${v.variant} — ${formatRupiah(v.price)}
//         ${v.promo && v.promo < v.normal ? `<s>${formatRupiah(v.normal)}</s>` : ""}</div>`).join("")
//     : `<div>${formatRupiah(null)}</div>`;
