const cors = require("cors");
const express = require("express");
const fs = require("fs/promises");
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let favorites;
(async () => {
  const result = await fs.readFile("./favorites.json");
  favorites = await JSON.parse(result);
})();

app.post("/api/favorites", (req, res) => {
  if (!req.body) return res.sendStatus(400);

  const newFavorite = {
    id: req.body.id,
    title: req.body.title,
    url: req.body.url,
    note: req.body.note,
    tags: req.body.tags,
  };

  favorites.push(newFavorite);

  const newFavorites = JSON.stringify(favorites);
  fs.writeFile("./favorites.json", newFavorites);
  res.status(200).json("Favorite is added");
});

app.get("/api/favorites", (req, res) => {
  //
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
