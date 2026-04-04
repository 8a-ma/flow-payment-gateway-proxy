module.exports = (err, req, res, next) => {
    const statusCode = err.status || 500;

    console.log(`[Error]: ${err.message}`);

    res.status(statusCode).json({
        error: "Internal Server Error",
        message: err.message,
        path: req.path
    });
};