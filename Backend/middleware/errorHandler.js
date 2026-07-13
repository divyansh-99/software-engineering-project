function notFoundHandler(req, res) {
  return res.status(404).json({ message: "Route not found" });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON body" });
  }

  const status =
    Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
      ? error.status
      : 500;

  if (status >= 500) {
    console.error(`${req.method} ${req.originalUrl}`, error);
  }

  const message = status >= 500 ? "Internal server error" : error.message;

  return res.status(status).json({ message });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
