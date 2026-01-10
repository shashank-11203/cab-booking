const sanitizeObject = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;
  const clean = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$") || key.includes(".")) continue;
    clean[key] = typeof value === "object" ? sanitizeObject(value) : value;
  }
  return clean;
};

export const sanitizeRequest = (req, res, next) => {
  try {
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.params) req.params = sanitizeObject(req.params);

    if (req.query && typeof req.query === "object") {
      for (const key in req.query) {
        if (key.startsWith("$") || key.includes(".")) {
          delete req.query[key];
        }
      }
    }
  } catch (err) {
    console.error("Sanitize error:", err);
  }
  next();
};