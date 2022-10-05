const router = require("express").Router();

const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

// CREATE
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = new Product(req.body);

  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

// UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

// DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET PRODUCT
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  const qPage = req.query.page;
  const qSort = req.query.sort;
  console.log(qSort);
  try {
    let products;
    let sortRule;
    const LIMIT = 8;
    const startIndex = (Number(qPage) - 1) * LIMIT;
    const total = await Product.countDocuments({});
    const sort = async (s) => {
      switch (s) {
        case "desc":
          sortRule = { price: -1 };
          return;
        case "asc":
          sortRule = { price: 1 };
          return;
        default:
          sortRule = { createdAt: -1 };
          return;
      }
    };
    sort(qSort);
    if (qNew) {
      products = await Product.find().sort(sortRule).limit(8);
    } else if (qCategory) {
      products = await Product.find({ categories: { $in: [qCategory] } })
        .sort(sortRule)
        .limit(LIMIT)
        .skip(startIndex);
      console.log(products);
    } else {
      products = await Product.find()
        .sort(sortRule)
        .limit(LIMIT)
        .skip(startIndex);
    }
    res.status(200).json({
      data: products,
      currentPage: Number(qPage),
      numberOfPages: Math.ceil(products.length / LIMIT),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
