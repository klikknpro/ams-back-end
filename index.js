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
  if (!req.body) return res.status(400).json("Some error");

  const newFavorite = {
    id: req.body.id,
    title: req.body.title,
    url: req.body.url,
  };

  favorites.push(newFavorite);

  const newFavorites = JSON.stringify(favorites);
  fs.writeFile("./favorites.json", newFavorites);
  res.status(200).json("Favorite is added");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

/*
app.post("/api/signup", (req, res) => {
  if (!req.body.username || !req.body.password) return res.status(400).json("Missing input");
  const existingUser = users.some((user) => user.username === req.body.username);
  if (existingUser) return res.sendStatus(409);
  const newUser = {
    username: req.body.username,
    password: req.body.password,
    todos: [],
  };
  users.push(newUser);
  fs.writeFileSync("users.json", JSON.stringify(users));
  res.status(200).json("Signed up successfully");
});
*/
