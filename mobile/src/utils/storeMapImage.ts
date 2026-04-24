export function getStoreMapImage(storeName?: string) {
  if (!storeName) return null;

  const normalized = storeName.toLowerCase().trim();

  if (normalized.includes("ica")) {
    return require("../../assets/maps/ica-maxi.png");
  }

  if (normalized.includes("bygghallen")) {
    return require("../../assets/maps/bygghallen.png");
  }

  return null;
}