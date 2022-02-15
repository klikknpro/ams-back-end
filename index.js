const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const port = 3000;

app.use(express.json());
app.use(cors());


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
