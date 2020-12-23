const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const user = new User({ email, password: hashedPw, name });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "New User Created",
        userId: result._id,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        const error = new Error("user not found");
        error.statusCode = 404;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong Password");
        error.statusCode = 401;
        throw error;
      }
      // generate jwt tokens
      // is the underscore syntax really necessary, => not anymore!
      // console.log(loadedUser.id);
      // console.log(loadedUser._id);
      // console.log(loadedUser._id.toString());
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser.id,
          // userId: loadedUser._id.toString();
        },
        "supersecret",
        { expiresIn: "1h" }
      );
      // console.log(token);
      res.status(200).json({ token, userId: loadedUser.id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
