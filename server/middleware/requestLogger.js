const requestLogger = (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    const logContext = {
        timestamp,
        method: req.method,
        url: req.originalUrl,
        query: req.query,
        params: req.params,
        body: req.body,
        headers: {
            authorization: req.headers.authorization || "not provided",
            "content-type": req.headers["content-type"] || "not provided"
        },
        user: req.user || null
    };

    console.log("[API_REQUEST_START]", JSON.stringify(logContext, null, 2));

    res.on("finish", () => {
        const durationMs = Date.now() - start;

        console.log("[API_REQUEST_END]", JSON.stringify({
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            durationMs,
            user: req.user || null
        }, null, 2));
    });

    next();
};

module.exports = requestLogger;
