// PWA 아이콘 생성기 — 의존성 없이 PNG를 직접 인코딩한다.
// 파란 라운드 사각형 배경 + 흰색 상승 막대 3개 (적립 컨셉)
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "app", "public", "icons");
mkdirSync(outDir, { recursive: true });

const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc32 = (buf) => {
  let c = -1;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8bit RGBA
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++)
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const BG = [42, 120, 214]; // #2a78d6

function coverage(px, py, S) {
  // 3x3 슈퍼샘플링으로 안티앨리어싱
  let bg = 0, bar = 0;
  const r = S * 0.22;
  const w = S * 0.16, gap = S * 0.08;
  const startX = (S - (3 * w + 2 * gap)) / 2;
  const baseY = S * 0.76;
  const heights = [S * 0.24, S * 0.38, S * 0.54];
  for (let sy = 0; sy < 3; sy++) for (let sx = 0; sx < 3; sx++) {
    const x = px + (sx + 0.5) / 3;
    const y = py + (sy + 0.5) / 3;
    // 라운드 사각형 배경
    const cx = Math.max(r, Math.min(S - r, x));
    const cy = Math.max(r, Math.min(S - r, y));
    const inBg = (x - cx) ** 2 + (y - cy) ** 2 <= r * r || (x >= r && x <= S - r) || (y >= r && y <= S - r)
      ? ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) : false;
    if (!inBg) continue;
    bg++;
    // 막대 3개 (위쪽 라운드 캡)
    for (let i = 0; i < 3; i++) {
      const bx = startX + i * (w + gap);
      const topY = baseY - heights[i];
      const capR = w / 2;
      const inRect = x >= bx && x <= bx + w && y >= topY + capR && y <= baseY;
      const inCap = (x - (bx + capR)) ** 2 + (y - (topY + capR)) ** 2 <= capR * capR;
      if (inRect || inCap) { bar++; break; }
    }
  }
  return { bg: bg / 9, bar: bar / 9 };
}

function makeIcon(size, file) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const { bg, bar } = coverage(x, y, size);
    const i = (y * size + x) * 4;
    // 배경 위에 흰 막대 합성
    const rC = BG[0] + (255 - BG[0]) * (bar / Math.max(bg, 0.001));
    rgba[i] = Math.round(bg > 0 ? Math.min(255, rC) : 0);
    rgba[i + 1] = Math.round(bg > 0 ? Math.min(255, BG[1] + (255 - BG[1]) * (bar / Math.max(bg, 0.001))) : 0);
    rgba[i + 2] = Math.round(bg > 0 ? Math.min(255, BG[2] + (255 - BG[2]) * (bar / Math.max(bg, 0.001))) : 0);
    rgba[i + 3] = Math.round(bg * 255);
  }
  writeFileSync(join(outDir, file), encodePng(size, rgba));
  console.log("✓", file);
}

makeIcon(512, "icon-512.png");
makeIcon(192, "icon-192.png");
makeIcon(180, "icon-180.png");
