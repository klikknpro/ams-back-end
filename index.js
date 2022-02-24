const cors = require("cors");
const express = require("express");
const fsp = require("fs/promises");
const fs = require("fs");
const bcrypt = require('bcrypt');
const btoa = require('btoa');
const app = express();
const port = 3001;

// app.post api/todo kell
app.use(cors());
app.use(express.json());

const users = require('./users.json');
const base64 = require('./base64.json');
const collection = require('./favoriteCollection.json');
const { sendStatus } = require("express/lib/response");

let mySessionStorage = {};

let favorites;
(async () => {
  const result = await fsp.readFile("./favorites.json");
  favorites = await JSON.parse(result);
})();

// (async () => {
//   const result = await fs.readFile("./users.json");
//   users = await JSON.parse(result);
// })();

// console.log(users)

// add favorite
// app.post("/api/favorites", (req, res) => {
//   if (!req.body) return res.sendStatus(400);

//   const newFavorite = {
//     id: req.body.id,
//     title: req.body.title,
//     url: req.body.url,
//     note: req.body.note,
//     tags: req.body.tags,
//   };

//   favorites.push(newFavorite);
//   // users.push(newFavorite)

//   const newFavorites = JSON.stringify(favorites);
//   fsp.writeFile("./favorites.json", newFavorites);
//   res.status(200).json("Favorite is added");
// });

// app.post("/api/favorites", (req, res) => {
//   const sessionId = req.header("authorization");
//   if (!sessionId) return sendStatus(401);
//   const user = mySessionStorage[sessionId];
//   if (!user) return res.sendStatus(401);
//   if (!req.body.url) return res.sendStatus(400);
//   const fav = req.body.url;
//   user.favorites.push(fav)
//   fs.writeFileSync("./users.json", JSON.stringify(users, null, 4));
//   res.sendStatus(200)
// })
app.post("/api/favorites", (req, res) => {
  const sessionId = req.header("authorization");
  if (!sessionId) return sendStatus(401);
  const user = mySessionStorage[sessionId];
  if (!user) return res.sendStatus(401);
  if (!req.body.url) return res.sendStatus(400);
  // const base64 = req.body.url
  const fav = {
    id: req.body.id,
    title: req.body.title,
    url: req.body.url,
    note: req.body.note,
    tags: req.body.tags,
    base64: btoa(req.body.url)
  };
  user.favorites.push(fav)
  fs.writeFileSync("./users.json", JSON.stringify(users, null, 4));
  res.sendStatus(200)
})

app.post("/api/collection", (req, res) => {
  const sessionId = req.header("authorization");
  if (!sessionId) return sendStatus(401);
  if (!req.body.url) return res.sendStatus(400);
  const favUrl = collection;
  favUrl.push(req.body.url)
  fs.writeFileSync('./favoriteCollection.json', JSON.stringify(favUrl, null, 4))
  res.sendStatus(200)
})

app.post("/api/base64", (req, res) => {
  const sessionId = req.header("authorization");
  if (!sessionId) return sendStatus(401);
  if (!req.body.url) return res.sendStatus(400);
  const favBase64 = base64;
  favBase64.push(btoa(req.body.url))
  fs.writeFileSync('./base64.json', JSON.stringify(favBase64, null, 4))
  res.sendStatus(200)
})

// app.get("/api/myfavorites", (req, res) => {
//   const sessionId = req.header("authorization");
//   if (!sessionId) return sendStatus(401);
//   const user = mySessionStorage[sessionId].user;
//   if (!user) return res.sendStatus(401);

//   res.send("user")
//   res.status(200)
// })

// SignUp
// hash
const generateHash = (password) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash
}

const compareHash = (password, hashed) => {
  return bcrypt.compareSync(password, hashed) // returns a boolean
}

app.post('/api/signup', (req, res) => {
  if (!req.body.name || !req.body.password) {
    return res.status(400).json('Missing credentials')
  }
  const userExists = users.some(user => user.name === req.body.name)
  if (userExists) {
    return res.json("User already exists!").status(409)
  }

  // console.log(generateHash('123asd'))

  const newUser = {
    name: req.body.name,
    password: generateHash(req.body.password),
    favorites: []
  }
  users.push(newUser)

  fs.writeFileSync('users.json', JSON.stringify(users, null, 4))
  res.sendStatus(200)
})

// login
// app.post('/api/login', (req, res) => {
//   const autoHead = req.header('authorization')
//   if (!autoHead) return res.sendStatus(401)

//   const username = autoHead.split(':::')[0]
//   const password = autoHead.split(':::')[1]
//   const hashedInput = generateHash(password)
//   console.log(password)
//   // console.log(hashed)

//   const hashed = users.find(user => user.name === username).password
//   console.log(hashed)

//   const goodPassword = compareHash(password, hashedInput)
//   console.log(compareHash(password, hashed))

//   // const user = users.find(user => user.name === username && user.password === hashed)
//   const user = users.find(user => user.name === username && hashedInput === hashed)
//   console.log(user)

//   if (!user) return res.sendStatus(401);

//   // alert('Successful login')
//   console.log(users.find(user => user.name === username && hashedInput === hashed))
//   user.push("asd123")
//   res.sendStatus(200)
// })

// console.log("Samuel0220:", users.find(user => user.name === "Samuel0220").password)

let username;
app.post('/api/login', (req, res) => {
  const autoHead = req.header('authorization')
  if (!autoHead) return res.sendStatus(401)

  username = autoHead.split(':::')[0]
  const password = autoHead.split(':::')[1]
  const hashed = users.find(user => user.name === username).password
  const isTrue = bcrypt.compareSync(password, hashed)
  // const user = users.find(user => user.name === username && user.password ===)

  // const user = users.find(user => user.name === username && user.password === password)

  if (!isTrue) return res.sendStatus(401);
  const user = users.find(user => user.name === username)
  const sessionId = Math.random().toString();
  mySessionStorage[sessionId] = user;

  // setTimeout(() => {
  //   console.log("Session ended!")
  //   delete mySessionStorage[sessionId]
  // }, 30 * 60 * 1000)
  // res.json(hashed)
  res.json(sessionId).status(200)
})

app.get('/api/login', (req, res) => {
  const hashed = users.find(user => user.name === username).password
  res.json(hashed)
  res.status(200)
})

app.delete("/api/logout", (req, res) => {
  // console.log("header:", req.headers)
  const sessionId = req.header('authorization')
  // console.log("my sessionid:", sessionId)
  if (!sessionId) return res.sendStatus(401)
  delete mySessionStorage[sessionId]
  // console.log("my session storage:", mySessionStorage)
  res.sendStatus(200)
})

app.get("/api/favorites", (req, res) => {
  const sessionId = req.header('authorization')
  if (!sessionId) return sendStatus(401)

  const user = mySessionStorage[sessionId];
  if (!user) return res.sendStatus(401);
  res.json(user.favorites)
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
