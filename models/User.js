const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Please Provide name"],
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    require: [true, "Please Provide email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please fill a valid email address",
    ],
    unique: true,
  },
  password: {
    type: String,
    require: [true, "Please Provide password"],
    minLength: 6,
  },
});

UserSchema.pre("save", async function (next) {
  const userSalt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, userSalt);
  next();
});

// user 모델에 instance method 를 사용해서 jwt 생성
UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
