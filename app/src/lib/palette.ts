// 검증된 카테고리 팔레트 (dataviz 6-checks 통과, 고정 순서 — 순환 금지)
export const SERIES_LIGHT = [
  "#2a78d6", "#008300", "#e87ba4", "#eda100",
  "#1baf7a", "#eb6834", "#4a3aa7", "#e34948",
];
export const SERIES_DARK = [
  "#3987e5", "#008300", "#d55181", "#c98500",
  "#199e70", "#d95926", "#9085e9", "#e66767",
];

export function seriesColor(idx: number, dark: boolean): string {
  const arr = dark ? SERIES_DARK : SERIES_LIGHT;
  return arr[((idx % arr.length) + arr.length) % arr.length];
}
