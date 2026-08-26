import "@testing-library/jest-dom/vitest";

if (typeof document !== "undefined" && typeof Range !== "undefined") {
  const emptyRects = document.body.getClientRects();
  Range.prototype.getClientRects = () => emptyRects;
  Range.prototype.getBoundingClientRect = () => new DOMRect();
}
