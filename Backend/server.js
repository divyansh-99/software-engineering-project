const app = require("./app");
const db = require("./config/db");

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  const connection = await db.promise().getConnection();
  connection.release();
  console.log("Connected to MySQL database");

  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

module.exports = startServer;
