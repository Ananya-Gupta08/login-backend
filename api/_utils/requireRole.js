export default function requireRole(...allowedRoles) {
  return (req, res, next) => {
    console.log("REQ.USER:", req.user);
    console.log("ALLOWED:", allowedRoles);
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden - Insufficient role" });
    }

    next();
  };
}