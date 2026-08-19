const Redis = require("ioredis");

let redisClient = null;
let isConnected = false;
let redisMode = "in-memory"; // 'redis' or 'in-memory'

// In-memory fallback cache store
const memoryStore = new Map();
const cacheStats = {
  hits: 0,
  misses: 0,
  keysCount: 0,
  mode: "in-memory",
  lastAction: "Initialized",
};

function initRedis() {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    try {
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        retryStrategy(times) {
          if (times > 2) {
            return null; // Stop retrying after 2 attempts
          }
          return Math.min(times * 100, 1000);
        },
      });

      redisClient.on("connect", () => {
        isConnected = true;
        redisMode = "redis";
        cacheStats.mode = "redis";
        console.log("Redis Connected successfully.");
      });

      redisClient.on("error", (err) => {
        if (isConnected) {
          console.warn("Redis connection lost, switching to in-memory mode.");
        }
        isConnected = false;
        redisMode = "in-memory";
        cacheStats.mode = "in-memory (fallback)";
      });
    } catch (e) {
      console.warn("Failed to initialize Redis client, using in-memory cache.");
      isConnected = false;
      redisMode = "in-memory";
      cacheStats.mode = "in-memory";
    }
  } else {
    console.log("No REDIS_URL provided. Running in high-performance hybrid / in-memory Redis cache mode.");
    redisMode = "in-memory";
    cacheStats.mode = "in-memory";
  }
}

// Get value from cache
async function getCache(key) {
  try {
    if (isConnected && redisClient) {
      const data = await redisClient.get(key);
      if (data) {
        cacheStats.hits += 1;
        cacheStats.lastAction = `Hit: ${key}`;
        return JSON.parse(data);
      }
      cacheStats.misses += 1;
      cacheStats.lastAction = `Miss: ${key}`;
      return null;
    }

    // In-memory store logic
    const item = memoryStore.get(key);
    if (!item) {
      cacheStats.misses += 1;
      cacheStats.lastAction = `Miss: ${key}`;
      return null;
    }

    if (item.expiry && item.expiry < Date.now()) {
      memoryStore.delete(key);
      cacheStats.misses += 1;
      cacheStats.lastAction = `Expired: ${key}`;
      return null;
    }

    cacheStats.hits += 1;
    cacheStats.lastAction = `Hit: ${key}`;
    return item.value;
  } catch (err) {
    console.error(`Redis Get Error [${key}]:`, err.message);
    cacheStats.misses += 1;
    return null;
  }
}

// Set value in cache
async function setCache(key, value, ttlSeconds = 60) {
  try {
    const stringValue = JSON.stringify(value);
    if (isConnected && redisClient) {
      await redisClient.set(key, stringValue, "EX", ttlSeconds);
      cacheStats.lastAction = `Set: ${key} (TTL ${ttlSeconds}s)`;
      return true;
    }

    // In-memory store logic
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    memoryStore.set(key, { value, expiry });
    cacheStats.lastAction = `Set: ${key} (In-Memory TTL ${ttlSeconds}s)`;
    return true;
  } catch (err) {
    console.error(`Redis Set Error [${key}]:`, err.message);
    return false;
  }
}

// Delete key or pattern from cache
async function delCache(keyOrPattern) {
  try {
    if (isConnected && redisClient) {
      if (keyOrPattern.includes("*")) {
        const keys = await redisClient.keys(keyOrPattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      } else {
        await redisClient.del(keyOrPattern);
      }
      cacheStats.lastAction = `Cleared: ${keyOrPattern}`;
      return true;
    }

    // In-memory store logic
    if (keyOrPattern.includes("*")) {
      const regex = new RegExp("^" + keyOrPattern.replace(/\*/g, ".*") + "$");
      for (const k of memoryStore.keys()) {
        if (regex.test(k)) {
          memoryStore.delete(k);
        }
      }
    } else {
      memoryStore.delete(keyOrPattern);
    }
    cacheStats.lastAction = `Cleared: ${keyOrPattern}`;
    return true;
  } catch (err) {
    console.error(`Redis Del Error [${keyOrPattern}]:`, err.message);
    return false;
  }
}

// Flush all cache keys
async function flushCache() {
  try {
    if (isConnected && redisClient) {
      await redisClient.flushdb();
    }
    memoryStore.clear();
    cacheStats.hits = 0;
    cacheStats.misses = 0;
    cacheStats.lastAction = "Flushed all cache";
    return true;
  } catch (err) {
    console.error("Redis Flush Error:", err.message);
    return false;
  }
}

// Get cache stats
async function getCacheStats() {
  let keysCount = memoryStore.size;

  if (isConnected && redisClient) {
    try {
      const keys = await redisClient.keys("*");
      keysCount = keys.length;
    } catch (e) {
      // ignore
    }
  }

  return {
    ...cacheStats,
    mode: redisMode === "redis" ? "Redis Server" : "Hybrid / In-Memory Redis Mock",
    isConnected,
    keysCount,
    totalRequests: cacheStats.hits + cacheStats.misses,
    hitRatio:
      cacheStats.hits + cacheStats.misses > 0
        ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(1) + "%"
        : "0%",
  };
}

module.exports = {
  initRedis,
  getCache,
  setCache,
  delCache,
  flushCache,
  getCacheStats,
};
