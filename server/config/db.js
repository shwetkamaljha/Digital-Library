const knex = require("knex");

const DB_DIALECT = (process.env.DB_DIALECT || "postgres").toLowerCase();
const isPostgres = DB_DIALECT === "postgres" || DB_DIALECT === "pg";

const db = knex({
    client: isPostgres ? "pg" : "mysql2",
    connection: isPostgres
        ? {
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "postgres",
            password: process.env.DB_PASSWORD || "postgres",
            database: process.env.DB_NAME || "digital_library",
            port: Number(process.env.DB_PORT || 5432),
            ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false }
        }
        : {
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "",
            database: process.env.DB_NAME || "digital_library",
            port: Number(process.env.DB_PORT || 3306)
        },
    pool: {
        min: 0,
        max: 10,
        afterCreate(conn, done) {
            if (isPostgres) {
                conn.query("SET timezone = 'UTC'", (err) => done(err, conn));
            } else {
                done(null, conn);
            }
        }
    },
    acquireConnectionTimeout: 10000
});

const normalizeSqlForDialect = (sql, params) => {
    if (!sql || !Array.isArray(params) || params.length === 0) {
        return { sql, params };
    }

    if (!isPostgres) {
        return { sql, params };
    }

    let index = 0;
    const normalizedSql = sql.replace(/\?/g, () => {
        index += 1;
        return `$${index}`;
    });

    return { sql: normalizedSql, params };
};

const normalizeMutationResult = (result, sql) => {
    if (result && Array.isArray(result.rows)) {
        const rows = result.rows || [];
        const insertedId = rows.length > 0 && rows[0] && typeof rows[0].id !== "undefined"
            ? rows[0].id
            : undefined;

        return {
            affectedRows: typeof result.rowCount === "number" ? result.rowCount : rows.length,
            insertId: insertedId,
            rowCount: typeof result.rowCount === "number" ? result.rowCount : rows.length,
            rows,
            sql
        };
    }

    if (Array.isArray(result) && result.length > 0) {
        const first = result[0];

        if (first && typeof first === "object" && !Array.isArray(first)) {
            return {
                affectedRows: Number(first.affectedRows || first.rowCount || 0),
                insertId: first.insertId,
                rowCount: Number(first.affectedRows || first.rowCount || 0),
                sql
            };
        }

        if (Array.isArray(first)) {
            return {
                rows: first,
                affectedRows: first.length,
                insertId: undefined,
                rowCount: first.length,
                sql
            };
        }
    }

    return result;
};

const normalizeSelectResult = (result, sql) => {
    if (result && Array.isArray(result.rows)) {
        return result.rows;
    }

    if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
        return result[0];
    }

    if (Array.isArray(result)) {
        return result;
    }

    return result;
};

const parseSqlType = (sql) => {
    const match = String(sql || "").trim().match(/^([A-Z]+)/i);
    return match ? match[1].toUpperCase() : "";
};

db.query = (sql, params, callback) => {
    if (typeof params === "function") {
        callback = params;
        params = [];
    }

    const safeParams = Array.isArray(params)
        ? params
        : params === undefined || params === null
            ? []
            : [params];

    const { sql: preparedSql, params: boundParams } = normalizeSqlForDialect(sql, safeParams);
    const sqlType = parseSqlType(preparedSql);

    console.log("[DB_QUERY]", JSON.stringify({
        sqlType,
        sql: preparedSql.substring(0, 100),
        paramCount: boundParams.length
    }, null, 2));

    return db.raw(preparedSql, boundParams)
        .then((result) => {
            const finalResult = ["SELECT", "WITH", "SHOW", "DESC", "DESCRIBE", "EXPLAIN"].includes(sqlType)
                ? normalizeSelectResult(result, preparedSql)
                : normalizeMutationResult(result, preparedSql);

            console.log("[DB_QUERY_SUCCESS]", JSON.stringify({
                sqlType,
                resultType: Array.isArray(finalResult) ? "array" : typeof finalResult,
                resultLength: Array.isArray(finalResult) ? finalResult.length : "n/a"
            }, null, 2));

            if (typeof callback === "function") {
                try {
                    callback(null, finalResult);
                } catch (cbErr) {
                    console.error("[DB_QUERY_CALLBACK_ERROR]", JSON.stringify({
                        error: cbErr && cbErr.message,
                        stack: cbErr && cbErr.stack
                    }, null, 2));
                }
            }

            return finalResult;
        })
        .catch((err) => {
            console.error("[DB_QUERY_ERROR]", JSON.stringify({
                sqlType,
                errorCode: err && err.code,
                errorMessage: err && err.message,
                errorName: err && err.name,
                stack: err && err.stack
            }, null, 2));

            if (typeof callback === "function") {
                try {
                    callback(err, null);
                } catch (cbErr) {
                    console.error("[DB_QUERY_ERROR_CALLBACK_ERROR]", JSON.stringify({
                        error: cbErr && cbErr.message,
                        stack: cbErr && cbErr.stack
                    }, null, 2));
                }
                return null;
            }
            throw err;
        });
};

const testConnection = async () => {
    try {
        await db.raw("SELECT 1");
        console.log("Database Connected Successfully");
    } catch (error) {
        console.error("Database Connection Failed");
        console.error(error.message || error);
    }
};

testConnection();

module.exports = db;