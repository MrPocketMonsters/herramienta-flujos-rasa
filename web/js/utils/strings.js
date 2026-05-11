export function slugify(value) {
  return String(value || "campo")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "campo";
}

export function capitalize(word) {
  var value = String(word || "");
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function applyCountTemplate(title, count) {
  return String(title || "Registros ({count})").replace("{count}", String(count));
}
