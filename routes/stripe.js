const router = require("express").Router();
const stripe = require("stripe")(
  "sk_test_51LULmeCxYIepcDmTas7qBugk7jK3j5ZmNUTrSQuc1OZA24pxoTmqlBh0bbfoXapbXUdWVbqnF5KnC7r7HwMnwS3d00ksKoKrKG"
);

router.post("/payment", (req, res) => {
  stripe.charges.create(
    {
      source: req.body.tokenId,
      amount: req.body.amount,
      currency: "usd",
    },
    (stripeErr, stripeRes) => {
      if (stripeErr) {
        res.status(500).json(stripeErr);
      } else {
        res.status(200).json(stripeRes);
      }
    }
  );
});
module.exports = router;
