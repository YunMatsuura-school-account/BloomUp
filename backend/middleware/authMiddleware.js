const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: "Access Denied" });

  console.log(
    "JWT Secret exists in middleware:",
    !!process.env.ACCESS_TOKEN_SECRET
  );
  console.log("Token received:", token.substring(0, 20) + "...");

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET || "fallback_secret_key",
    (err, user) => {
      if (err) {
        console.error("JWT verification error:", err);
        return res.status(403).json({ message: "Invalid Token" });
      }
      console.log("JWT verified user:", user);
      req.user = user;
      next();
    }
  );
}

module.exports = verifyToken;
