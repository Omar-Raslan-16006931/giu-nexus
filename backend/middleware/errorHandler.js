exports.errorHandler = (err, req, res, next) => {
  console.log("ERROR:", err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  // ✅ Handle invalid ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};