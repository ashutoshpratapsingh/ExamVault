const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token ❌" });
  }

  try {
    const decoded = jwt.verify(token, "secret");

    req.user = decoded;   // { id, role }

    next();
  } catch (err) {
    console.log("AUTH ERROR:", err);
    res.status(401).json({ msg: "Invalid token ❌" });
  }
};