const mongoose = require("mongoose");

const UserDetailSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    image: String,
    gender: String,
    profession: String,
  },
  {
    collection: "userInfo",
  }
);

mongoose.model("userInfo", UserDetailSchema);
