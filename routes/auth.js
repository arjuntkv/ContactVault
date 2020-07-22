const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

const User = require("../models/User");

//route   GET  /auth
//desc    get logged in user
//access  Private
router.get("/", auth, async (req, res) => {
  //if "auth" function is executed successfully then user is authorized
  //req.user has id object ==> req.user.id
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

//route   POST  /auth
//desc    Login and Auth user and get Token
//access  Public
router.post(
  "/",
  [
    check("email", "Enter a valid email").isEmail(),
    check("password", "password is required").exists(),
  ],
  async (req, res) => {
    //checking for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      //checking user
      //if user not exists
      if (!user) {
        return res.status(400).json({ msg: "invalid credentials" });
      }

      //checking password
      const isMatch = await bcrypt.compare(password, user.password);

      //if password do not match
      if (!isMatch) {
        return res.status(400).json({ msg: "invalid credentials" });
      }

      //if both email and passwords match with db, then
      //generating json web Token and sending as response

      //user.id === _id (in mongodb)
      const payload = {
        user: {
          id: user.id,
        },
      };

      //"expiresin" option is optional
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
