import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function authenticateToken(req, res, next) {
  const token = req.cookies.accessToken;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

export function requireAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.sendStatus(403);
  }
}

// Reads the accessToken cookie if present and attaches req.user, but never
// blocks the request — used on routes that work for guests too (e.g. profile
// submission) but still want to record who submitted, if anyone was logged in.
export function optionalAuth(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    next();
  });
}