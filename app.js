const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

app.use(express.json());

const mongoUrl = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;


mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Database connected!");
  })
  .catch((e) => {
    console.log(e);
  });

require("./userDetails");
const User = mongoose.model("userInfo");

app.get("/", (req, res) => {
  res.send({ status: "started" });
});

//api for register------------------------------------>

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email: email });

  if (oldUser) {
    return res.send({ data: "User Already Exists!" });
  }

  const encryptedPassword = await bcrypt.hash(password, 10);

  try {
    await User.create({
      name: name,
      email: email,
      password: encryptedPassword,
    });
    res.send({ status: "ok", data: "User Created!" });
  } catch (error) {
    res.send({ status: "error", data: "error" });
  }
});

//api for login -------------------------------------------->

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const oldUser = await User.findOne({ email: email });

  if (!oldUser) {
    return res.send({ data: "User doesn't exists!" });
  }

  if (await bcrypt.compare(password, oldUser.password)) {
    const token = jwt.sign({ email: oldUser.email }, JWT_SECRET);

    if (res.status(201)) {
      return res.send({ status: "ok", data: token });
    } else {
      return res.send({ error: "error" });
    }
  }
});

//api for userData--------------------------------------------->

// app.post("/userdata", async (req, res) => {
//   const { token } = req.body;
//   try {
//     const user = jwt.verify(token, JWT_SECRET);
//     const userEmail = user.email;

//     user.findOne({ email: userEmail }).then((data) => {
//       return res.send({ status: "ok", data: data });
//     });
//   } catch (error) {
//     return res.send({ error: error });
//   }
// });

app.post("/userdata", async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // decoded payload
    const userEmail = decoded.email;

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });
    }

    return res.send({ status: "ok", data: user });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ status: "error", error: "Invalid token" });
  }
});

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log("Server is started on port 4001");
});
