const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  // 🚧주석을 한 이유 mongoose middleware 를 작성했기 때문.
  // 🚧UserSchema.pre("save")를통해서 모델이 생성되기전에 미들웨어를 실행
  // const userSalt = await bcrypt.genSalt(10);
  // const hashedPassword = await bcrypt.hash(password, userSalt);
  // const newUser = { name, email, password: hashedPassword };

  // Error Handle
  if (!name || !email || !password) {
    throw new BadRequestError("Please Provide name, email, password");
  }

  const user = await User.create({ ...req.body });

  // user 모델에 instance method 를 사용해서 jwt 생성
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

  // User Check (DB 에 유저가 있는지 확인 하는 작업)
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

  // 만들어 놓은 user에 instance method 를 실행 시켜서 token 발급
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({ user: { name: user.name }, token });
};

module.exports = {
  register,
  login,
};
