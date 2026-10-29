// sheet-loader.js — loader CSV Google Sheets yang tahan banting (v2)
// Pakai: const rows = await loadSheet(url, { headerMatch: /nama produk/i });

const PUB_BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQZeCJ9MWj6KpPPEM5A6AN8ZWKiYXkISBe_LDd2Rg9057sk8BM9dGOagzZxHFyVEO9FZZPnjpCX5rWl/pub";

// Tiap TAB punya gid sendiri. Link tanpa gid = tab pertama (kategori).
export const SHEET_URLS = {
  categories: `${PUB_BASE}?output=csv`,
  prices: `${PUB_BASE}?gid=19220526&single=true&output=csv`, // tab DIGIPLUS PRICE LIST
};

// CSV -> array of arrays (RFC 4180: koma/baris baru dalam kutip, BOM, CRLF)
export function parseCSVRows(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  return rows;
}

// Array of arrays -> array of objects.
// headerMatch (RegExp) = cari baris header pertama yang cocok, lewati baris judul di atasnya.
export function parseCSV(text, { headerMatch } = {}) {
  const rows = parseCSVRows(text);
  if (!rows.length) return [];
  let h = 0;
  if (headerMatch) {
    h = rows.findIndex((r) => headerMatch.test(r.join(",")));
    if (h < 0) throw new Error("Baris header tidak ditemukan (cek nama kolom).");
  }
  const headers = rows[h].map((x) => x.trim());
  return rows.slice(h + 1).map((r) =>
    Object.fromEntries(headers.map((k, i) => [k, (r[i] ?? "").trim()]))
  );
}

export async function loadSheet(url, opts = {}) {
  let res;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (err) {
    throw new Error("Gagal fetch (jaringan/CORS/URL salah): " + err.message);
  }
  if (!res.ok) throw new Error(`Spreadsheet merespons HTTP ${res.status}`);
  const text = await res.text();
  if (/^\s*<(!doctype|html)/i.test(text))
    throw new Error("Respons berupa HTML, bukan CSV. Cek 'Publish to web' & gid tab.");
  const data = parseCSV(text, opts);
  console.log(`[sheet] ${data.length} baris dimuat. Kolom:`, Object.keys(data[0] || {}));
  return data;
}
