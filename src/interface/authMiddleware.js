module.exports = (req, res, next) => {
    const apiKey = req.headers['x-api-key']
    const validApiKey = process.env.PROXY_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "Invalid or missing X-API-KEY header"
        });
    }

    next();
};