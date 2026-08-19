const xss = require("xss");

// Recursive function to sanitize objects, arrays, and strings
function sanitize(value) {
  if (typeof value === "string") {
    return xss(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }
  if (value !== null && typeof value === "object") {
    const cleanObj = {};
    for (const key of Object.keys(value)) {
      cleanObj[key] = sanitize(value[key]);
    }
    return cleanObj;
  }
  return value;
}

// Middleware to clean req.body, req.query, and req.params
const xssClean = (req, res, next) => {
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  next();
};

module.exports = { xssClean, sanitize };
