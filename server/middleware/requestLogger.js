const requestLogger = (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    const logContext = {
        timestamp,
        method: req.method,
        url: req.originalUrl,
        query: req.query,
        params: req.params,
        bodyKeys: Object.keys(req.body || {}),
        headers: {
            authorization: req.headers.authorization ? "***present***" : "not provided",
            "content-type": req.headers["content-type"] || "not provided"
        },
        user: req.user || null
    };

    const logMsg = `[API_REQUEST_START] ${JSON.stringify(logContext, null, 2)}\n`;
    process.stdout.write(logMsg);
    console.log("[API_REQUEST_START]", JSON.stringify(logContext, null, 2));

    res.on("finish", () => {
        const durationMs = Date.now() - start;

        const endLog = `[API_REQUEST_END] ${JSON.stringify({
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            durationMs,
            user: req.user || null
        }, null, 2)}\n`;
        
        process.stdout.write(endLog);
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
