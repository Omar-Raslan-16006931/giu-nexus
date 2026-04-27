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
    return res.status(401).json({ message: "No token, not authorized" });
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
    return res.status(401).json({ message: "Token is not valid" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log("User role:", req.user.role);

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};