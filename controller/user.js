const User = require("../models/user");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.signUp = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }).then((user) => {
    if (user)
      res.status(409).json({ error: "The entered email already exists" });
    else {
      bcrypt.hash(password, 10, (error, hash) => {
        if (error) res.status(500).json({ error });
        else {
          const userData = new User({
            _id: mongoose.Types.ObjectId(),
            email: email,
            password: hash,
            favoriteGames: [],
          });
          userData
            .save()
            .then(() => {
              let transporter = nodemailer.createTransport({
                service: "gmail",
                port: 587,
                secure: false,
                auth: {
                  user: process.env.SENDER_EMAIL,
                  pass: process.env.EMAIL_PASSWORD,
                },
              });

              transporter
                .sendMail({
                  from: process.env.SENDER_EMAIL,
                  to: `${email}`,
                  subject: "Rise, gamer.",
                  text: `Hello Dear ${email}`,
                  html: `<b>Greetings gamer, welcome aboard.</b>`,
                })
                .then((info) => console.log("Email has been sent!"))
                .catch((err) => console.log(err));
              res.status(201).json({
                message: "The gamer has been signed up successfully!",
                userData,
                favoriteGames: [],
              });
            })
            .catch((error) => res.status(500).json({ error }));
        }
      });
    }
  });
};

exports.signIn = (req, res, next) => {
  const { password, email } = req.body;
  User.find({ email: email }, (err, user) => {
    if (err || user.length === 0)
      res
        .status(404)
        .json({ error: "We couldn't find a gamer with this email." });
    else if (user.length > 0) {
      bcrypt.compare(password, user[0].password, (_err, result) => {
        if (_err) res.status(401).json({ error: "Authentication has failed!" });
        else if (result) {
          const UserData = {
            email: user[0].email,
            ID: user[0]._id,
            favoriteGames: user[0].favoriteGames,
          };
          const token = jwt.sign(userData, "MONGO_SECRET", { expiresIn: "1h" });
          res.status(200).json({
            message: "Authentication has been successful",
            token: token,
            userData,
          });
        } else
          res.status(401).json({ error: "The password entered is incorrect!" });
      });
    }
  }).catch((err) => res.status(500).json({ error: err }));
};

exports.updateUser = (req, res, next) => {
  const userID = req.params.userID;

  User.updateMany({ _id: userID }, { $set: req.body })
    .then((result) => result.state(200).json(result))
    .catch((error) => res.status(409).json(error));
};

exports.deleteUser = (req, res, next) => {
  User.remove({ _id: req.params.userID })
    .then((result) => {
      if (result.length > 0)
        res.status(200).json({ message: "Gamer has been deleted" });
      else res.status(404).json({ message: "No gamer was found with this ID" });
    })
    .catch((error) => res.status(200).json(error));
};
