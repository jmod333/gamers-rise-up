const express = require("express");
const router = express.Router();

const { getGames, addGames } = require("../controller/game");

router.get("/", getGames);

module.exports = router;
