// tickers.json의 종목코드로 네이버 금융 시세를 받아 prices.json으로 저장한다.
// GitHub Actions(prices.yml)가 장중 30분마다 실행. 로컬 실행: node tools/fetch-prices.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { codes } = JSON.parse(readFileSync(join(root, "tickers.json"), "utf8"));

const items = [];
for (const code of codes) {
  try {
    const res = await fetch(`https://m.stock.naver.com/api/stock/${code}/basic`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();
    const price = Number(String(d.closePrice).replaceAll(",", ""));
    if (!d.stockName || !price) throw new Error("빈 응답");
    items.push({ code, name: d.stockName, price });
    console.log(`✓ ${code} ${d.stockName} ${price.toLocaleString()}원`);
  } catch (e) {
    console.error(`✗ ${code}: ${e.message}`);
  }
}

if (items.length === 0) {
  console.error("시세를 하나도 못 받아서 저장하지 않음");
  process.exit(1);
}

writeFileSync(
  join(root, "prices.json"),
  JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2),
);
console.log(`→ prices.json 저장 (${items.length}종목)`);
