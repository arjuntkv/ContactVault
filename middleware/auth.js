const jwt = require("jsonwebtoken");
const config = require("config");

//next is used to move to next function after this function gets completed
module.exports = function (req, res, next) {
  //get token from header
  const token = req.header("x-auth-token");

  //check if not token
  if (!token) {
    return res.status(401).json({ msg: "No token,authorization denied" });
  }

  //if token exists
  try {
    //verify token and stores the payload data in decoded variable
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
