require("dotenv").config();
const mysql = require("mysql2");

if (!process.env.MYSQL_PASSWORD) {
    console.warn(
        "MYSQL_PASSWORD is not set. Configure it in your environment (.env) before connecting to the database."
    );
}

const db = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "placement_system",
    port: Number(process.env.MYSQL_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database");
        connection.release();
    }
});

module.exports = db;
