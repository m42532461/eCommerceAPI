const SubscribeList = require("../models/SubscribeList");
const User = require("../models/User");
const VerifyCode = require("../models/VerifyCode");

const router = require("express").Router();
const generateCode = require("../test");

const { verifyTokenAndAuthorization } = require("./verifyToken");

router.post("/certification", async (req, res) => {
  const username = req.body.username;
  console.log(username);
  try {
    const user = await User.findOne({ username });
    !user && res.status(404).json("User not found!");
    console.log(user);
    const verifyCode = generateCode();
    console.log(
      `uuid:${req.body.uuid}, verifyCode:${verifyCode}, username:${user.username}`
    );
    const idCodePair = new VerifyCode({
      uuid: req.body.uuid,
      verifyCode,
      username,
    });
    const savedIdCodePair = await idCodePair.save();
    console.log(savedIdCodePair);
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
        to: ["m42532461@gmail.com", user.email],
        subject: "Certified Mail",
        html: `This is a certified mail from nodejs. Your verify code is ${verifyCode}`,
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
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/subscribe", async (req, res) => {
  const email = req.body.email;
  if (!email || !email.includes("@"))
    return res.status(500).json("Wrong email format");
  try {
    const list = new SubscribeList({ email });
    const savedSubscriber = await list.save();
    res.status(200).json(savedSubscriber);
  } catch (error) {
    res.status(500).json(error);
  }
});
module.exports = router;
