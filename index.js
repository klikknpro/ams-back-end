const cors = require("cors");
const express = require("express");
const fs = require("fs");
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const favorites = fs.readFile("./favorites.json");

app.post("/api/favorites", (req, res) => {
  if (!req.body) return res.status(400).json("Some error");

  const newFavorite = req.body;

  favorites.push(newFavorite);

  fs.writeFileSync("./favorites.json", JSON.stringify(users, null, 4));
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
