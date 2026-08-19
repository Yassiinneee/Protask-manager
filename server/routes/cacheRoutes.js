const express = require("express");
const router = express.Router();
const {
  getCacheStats,
  flushCache,
  setCache,
  getCache,
} = require("../config/redis");

// GET /api/cache/stats
router.get("/stats", async (req, res, next) => {
  try {
    const stats = await getCacheStats();
    res.json({
      success: true,
      stats,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/cache/flush
router.post("/flush", async (req, res, next) => {
  try {
    await flushCache();
    const stats = await getCacheStats();
    res.json({
      success: true,
      message: "Redis cache successfully flushed",
      stats,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/cache/test
router.post("/test", async (req, res, next) => {
  try {
    const testKey = `test:${Date.now()}`;
    const testValue = { message: "Redis ping successful", timestamp: new Date() };

    await setCache(testKey, testValue, 30);
    const retrieved = await getCache(testKey);

    res.json({
      success: true,
      key: testKey,
      set: testValue,
      retrieved,
      match: JSON.stringify(testValue) === JSON.stringify(retrieved),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
