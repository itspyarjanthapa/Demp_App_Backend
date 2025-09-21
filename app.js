const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
app.use(express.json());

const mongoUrl =
  "mongodb+srv://pyarjanskillprompt_db_user:admin@demoapp.o5ldrem.mongodb.net/?retryWrites=true&w=majority&appName=DemoApp";

const JWT_SECRET =
  "SuwUNNO/vIUaiuBJV4iotDE5GbqpVyYdb1eH+Vsm1za3oZ1POeedq1L+uLhe/Z2sqD1vV2NiyoRAZeygZG2/Zg==";

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

app.post("/userdata", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    const userEmail = user.email;

    user.findOne({ email: userEmail }).then((data) => {
      return res.send({ status: "ok", data: data });
    });
  } catch (error) {
    return res.send({ error: error });
  }
});

app.listen(4001, () => {
  console.log("Server is started on port 4001");
});
