const RedisService = require('./db/redis');
const crypto = require('node:crypto');


const container = {
    redis: new RedisService({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        user: process.env.REDIS_USER,
        db: process.env.REDIS_DB
    }),
    flow: {
        apiKey: process.env.FLOW_API_KEY,
        secretKey: process.env.FLOW_SECRET_KEY,
        apiUrl: process.env.FLOW_API_URL
    },
    crypto: {
        sign: (toSign, secret) => crypto.createHmac("sha256", secret).update(toSign).digest("hex")
    }
}

module.exports = container;