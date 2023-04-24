const mongoose = require("mongoose");
const Game = require("../models/game");
const multer = require("multer");
const fs = require("fs");

exports.getGames = (req, res) => {
  Game.find()
    .then((games) =>
      res.status(200).json({
        count: games.length,
        games: games,
      })
    )
    .catch((err) => res.status(500).json({ error: err }));
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads/");
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("image");

exports.addMovie = (req, res) => {
  upload(req, res, (err) => {
    if (err) res.status(500).json(err);
    else {
      fs.readFile(req.file.path, function (err, data) {
        if (err) throw err;
        else {
          const contentType = req.file.mimetype;
          const newGame = new Movie({
            _id: mongoose.Types.ObjectId(),
            title: req.body.title,
            numberInStock: req.body.numberInStock,
            genre: req.body.genre,
            image: { data, contentType },
            rate: 0,
          });

          newGame.save((err, game) => {
            if (err) res.status(500).json({ error: err });
            else {
              res.status(201).json({
                message: "A new game has been added.",
                game: game,
              });
            }
          });
        }
      });
    }
  });
};
