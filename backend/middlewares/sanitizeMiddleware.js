const sanitizeObject = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;
  const clean = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    // skip keys that start with "$" or contain "."
    if (key.startsWith("$") || key.includes(".")) continue;
    clean[key] = typeof value === "object" ? sanitizeObject(value) : value;
  }
  return clean;
};

export const sanitizeRequest = (req, res, next) => {
  try {
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);
  } catch (err) {
    console.error("Sanitize error:", err);
  }
  next();
};