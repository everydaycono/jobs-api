const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  // ๐ง์ฃผ์์ ํ ์ด์  mongoose middleware ๋ฅผ ์์ฑํ๊ธฐ ๋๋ฌธ.
  // ๐งUserSchema.pre("save")๋ฅผํตํด์ ๋ชจ๋ธ์ด ์์ฑ๋๊ธฐ์ ์ ๋ฏธ๋ค์จ์ด๋ฅผ ์คํ
  // const userSalt = await bcrypt.genSalt(10);
  // const hashedPassword = await bcrypt.hash(password, userSalt);
  // const newUser = { name, email, password: hashedPassword };

  // Error Handle
  if (!name || !email || !password) {
    throw new BadRequestError("Please Provide name, email, password");
  }

  const user = await User.create({ ...req.body });

  // user ๋ชจ๋ธ์ instance method ๋ฅผ ์ฌ์ฉํด์ jwt ์์ฑ
  const token = user.createJWT();
  // const token = jwt.sign({ userId: user._id, name: user.name }, "jwtSecren", {
  //   expiresIn: "7d",
  // });
  res
    .status(StatusCodes.CREATED)
    .json({ user: { name: user.name, email: user.email }, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("11");
  // error check
  if (!email || !password) {
    throw new BadRequestError("Please Provide name, email, password");
  }
  console.log("22");

  // User Check (DB ์ ์ ์ ๊ฐ ์๋์ง ํ์ธ ํ๋ ์์)
  const user = await User.findOne({ email });
  console.log("33");

  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  console.log("44");
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  // ๋ง๋ค์ด ๋์ user์ instance method ๋ฅผ ์คํ ์์ผ์ token ๋ฐ๊ธ
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({ user: { name: user.name }, token });
};

module.exports = {
  register,
  login,
};
