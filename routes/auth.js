const User = require("../models/User");

const router = require("express").Router();

const CryptoJS = require("crypto-js");

const jwt = require("jsonwebtoken");
const { json } = require("express");
const { verifyTokenAndAuthorization } = require("./verifyToken");
const VerifyCode = require("../models/VerifyCode");

// Register
router.post("/register", async (req, res) => {
  if (req.body.password !== req.body.confirmPassword)
    return res
      .status(500)
      .json("The confirm password is not the same with the password");
  const newUser = new User({
    name: req.body.firstname + " " + req.body.lastname,
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });
  try {
    const savedUser = await newUser.save();
    const accessToken = jwt.sign(
      {
        id: savedUser._id,
        isAdmin: savedUser.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password, ...others } = savedUser._doc;
    res.status(201).json({ ...others, accessToken });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Login
router.post("/login", async (req, res) => {
  if (!req.body.username || !req.body.password)
    return res.status(404).json("Empty username or password");
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json("Wrong credentials");
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    originalPassword !== req.body.password &&
      res.status(401).json("Wrong credentials");

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Certification uuid and verifyCode pair
router.post("/uuid", async (req, res) => {
  console.log(`uuid:${req.body.uuid} verifyCode:${req.body.verifyCode}`);
  if (!req.body.uuid || !req.body.verifyCode)
    return res.status(404).json("Empty uuid or verifyCode");
  try {
    const keyValuePair = await VerifyCode.findOne({ uuid: req.body.uuid });
    (!keyValuePair || keyValuePair.verifyCode !== req.body.verifyCode) &&
      res.status(404).json("Wrong credentials");

    res.status(200).json("You can reset your password now");
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
