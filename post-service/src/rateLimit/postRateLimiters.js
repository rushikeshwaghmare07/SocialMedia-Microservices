const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const Redis = require("ioredis");

const redisClient = new Redis(process.env.REDIS_URL);

// Create Post limiter
const createPostLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 posts per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip, // Per-user if logged in, else IP
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many posts created. Please slow down.",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// Like Post limiter
const likePostLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 likes per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many likes. Please slow down.",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// Public GET limiter (scraping prevention)
const publicGetLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, // 100 GETs per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP. Please slow down.",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

module.exports = {
  createPostLimiter,
  likePostLimiter,
  publicGetLimiter,
};
