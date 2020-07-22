const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const User = require("../models/User");

//route   POST  /users
//desc    Register user
//access  Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Include Valid email").isEmail(),
    check("password", "Enter a password with 6 or more characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    //checking for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //else perform other operation
    //req.body contains name,password,email
    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email: email });

      //checking if user already exisits
      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      user = new User({ name: name, email: email, password: password });

      //hashing password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      //saving user to db
      await user.save();
      //========================================
      //generating json web Token  and sending as response

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
