const createSlidingWindowRateLimiter = ({
  maxRequests = 10,
  windowMs = 60 * 1000,
} = {}) => {
  const hitsByIp = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const windowStart = now - windowMs;
    const hits = hitsByIp.get(ip) || [];
    const recentHits = hits.filter((timestamp) => timestamp > windowStart);

    if (recentHits.length >= maxRequests) {
      const retryAfterMs = recentHits[0] + windowMs - now;
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: `Too many requests. Try again in ${retryAfterSeconds} seconds.`,
        },
      });
    }

    recentHits.push(now);
    hitsByIp.set(ip, recentHits);

    next();
  };
};

module.exports = { createSlidingWindowRateLimiter };
