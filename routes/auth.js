const User = require("../models/User");

const router = require("express").Router();

const CryptoJS = require("crypto-js");

const jwt = require("jsonwebtoken");
const { json } = require("express");
const { verifyTokenAndAuthorization } = require("./verifyToken");

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

router.post("/sendmail/:id", verifyTokenAndAuthorization, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);

    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: "m42532461@gmail.com",
        pass: "pfljiqdmfaimkdfq",
      },
    });

    transporter
      .sendMail({
        from: "m42532461@gmail.com",
        to: [user.email, "m42532461@gmail.com"],
        subject: "Certified Mail",
        html: "This is a certified mail from nodejs. Please check this http://127.0.0.1:5174/ to certify your account",
      })
      .then((info) => {
        console.log({ info });
        res.status(200).json("send success");
      })
      .catch((error) => {
        console.error;
        res.status(500).json(error);
      });
  } catch (error) {
    res.status(500).json(error);
  }

  // if (!req.body.username || !req.body.password)
  //   return res.status(404).json("Empty username or password");
  // try {
  //   const user = await User.findOne({ username: req.body.username });
  //   !user && res.status(401).json("Wrong credentials");
  //   const hashedPassword = CryptoJS.AES.decrypt(
  //     user.password,
  //     process.env.PASS_SEC
  //   );
  //   const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
  //   originalPassword !== req.body.password &&
  //     res.status(401).json("Wrong credentials");

  //   const accessToken = jwt.sign(
  //     {
  //       id: user._id,
  //       isAdmin: user.isAdmin,
  //     },
  //     process.env.JWT_SEC,
  //     { expiresIn: "3d" }
  //   );

  //   const { password, ...others } = user._doc;
  //   res.status(200).json({ ...others, accessToken });
  // } catch (error) {
  //   res.status(500).json(error);
  // }
});

module.exports = router;
