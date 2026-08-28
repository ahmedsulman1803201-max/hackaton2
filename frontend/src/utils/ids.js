export const entityId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value.id || value._id || "");
};

export const sameId = (left, right) => entityId(left) === entityId(right);
