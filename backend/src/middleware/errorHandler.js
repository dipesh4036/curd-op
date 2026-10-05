/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("[Server Error]:", err);

  // Prisma unique constraint error
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A record with this unique field already exists.",
    });
  }

  // Prisma record not found error
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Requested record not found in database.",
    });
  }

  // Fallback internal server error
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
