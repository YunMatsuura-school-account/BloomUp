const jwt = require("jsonwebtoken");

function extractToken(req) {
  // 1) Standard Authorization header: Bearer <token>
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  // 2) x-access-token header fallback
  const xAccess = req.headers["x-access-token"];
  if (xAccess) return xAccess;

  // 3) Cookie fallback (no cookie-parser required)
  const cookieHeader = req.headers["cookie"];
  if (cookieHeader) {
    const parts = cookieHeader.split(";").map((p) => p.trim());
    for (const p of parts) {
      if (p.startsWith("token=")) return decodeURIComponent(p.slice(6));
      if (p.startsWith("access_token=")) return decodeURIComponent(p.slice(13));
      if (p.startsWith("jwt=")) return decodeURIComponent(p.slice(4));
    }
  }

  return null;
}

function verifyToken(req, res, next) {
  const token = extractToken(req);

  if (!token) return res.status(401).json({ message: "Access Denied" });

  jwt.verify(
    token, process.env.ACCESS_TOKEN_SECRET || "fallback_secret_key",
    (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid Token" });
      }

      console.log("JWT verified user:", user);

      // if (user.userId && !user._id) {
      //   user._id = user.userId;
      // }

      if (user.id && !user._id) {
        user._id = user.id;
      }
      if (user._id && !user.id) {
        user.id = user._id;
      }


      req.user = user;
      next();
    }
  );
}

module.exports = verifyToken;
