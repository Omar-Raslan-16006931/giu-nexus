const { verifyToken } = require("../services/jwtService");

exports.protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
   const error = new Error("No token, not authorized");
   error.statusCode = 401;
   return next(error);
  }

  try {
    const decoded = verifyToken(token);

    // attach user to request
    req.user = {
     id: decoded.id,
     role: decoded.role
    };

    console.log("User attached:", req.user);

    next();

  } catch (err) {
    const error = new Error("Token is not valid");
    error.statusCode = 401;
    return next(error);
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log("User role:", req.user.role);

    if (!roles.includes(req.user.role)) {
      const error = new Error("Forbidden");
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};