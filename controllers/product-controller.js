const Product = require("../model/product");

const getProducts = async (req, res) => {
  const product = await Product.find({});
  res.send(product);
};

const addProduct = async (req, res) => {
  const { product } = req.body;

  console.log(product);
  if (!product) {
    return res.status(400).send("Product data is required");
  }
  try {
    const Createdproduct = new Product({
      name: product.name,
      desc: product.desc,
      img: product.img,
      price: product.price,
    });
    await Createdproduct.save();
    res
      .status(200)
      .json({ message: "Product created", Createdproduct: Createdproduct });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.aggregate([
      { $sample: { size: 4 } },
    ]);

    res
      .status(200)
      .json({ message: "Featured products found", products: featuredProducts });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id).populate({
      path: "reviews",
      populate: {
        path: "user", // populate the 'user' field inside each review
      },
    });
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.status(200).json({ message: "Product found", product: product });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(id, product, {
      new: true,
    });
    if (!updatedProduct) {
      return res.status(404).send("Product not found");
    }
    res
      .status(200)
      .json({ message: "Product updated", updatedProduct: updatedProduct });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).send("Product not found");
    }
    res
      .status(200)
      .json({ message: "Product deleted", deletedProduct: deletedProduct });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getSuggested = async (req, res) => {
  const { productId, category, name } = req.query;

  try {
    let product = null;
    let suggestedProducts = [];

    // Fetch the product by ID if provided to get its details
    if (productId) {
      product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
    }

    // Build query filters for primary matching
    let filters = {};

    // Apply category filter from query or product's category
    if (category) {
      filters.category = category;
    } else if (product) {
      filters.category = product.category;
    }

    // Exclude the current product if productId is provided
    if (productId) {
      filters._id = { $ne: productId };
    }

    // Fetch all possible matches first
    const allProducts = await Product.find(filters);

    // Helper function to calculate cross-field relevance
    const calculateRelevance = (targetProduct, queryProduct) => {
      let score = 0;

      // 1. Name matching (weighted high)
      if (queryProduct.name) {
        const nameRegex = new RegExp(
          queryProduct.name.split(" ").join("|"),
          "i"
        );
        if (nameRegex.test(targetProduct.name)) {
          score += 40; // High weight for name match
        }
      }

      // 2. Category matching with name (medium weight)
      if (queryProduct.category) {
        const categoryRegex = new RegExp(
          queryProduct.category.split(" ").join("|"),
          "i"
        );
        if (categoryRegex.test(targetProduct.name)) {
          score += 30; // Match category to name
        }
        if (categoryRegex.test(targetProduct.features.join(" "))) {
          score += 15; // Match category to features
        }
      }

      // 3. Name matching to highlights or features (cross-field match)
      if (queryProduct.name) {
        const featureHighlightRegex = new RegExp(
          queryProduct.name.split(" ").join("|"),
          "i"
        );

        // Match name to highlights
        if (featureHighlightRegex.test(targetProduct.highlights.join(" "))) {
          score += 20; // Name to highlights match
        }

        // Match name to features
        if (featureHighlightRegex.test(targetProduct.features.join(" "))) {
          score += 20; // Name to features match
        }
      }

      // 4. Highlight and feature matching (within-field match)
      if (queryProduct.highlights && targetProduct.highlights) {
        const matchingHighlights = queryProduct.highlights.filter((highlight) =>
          targetProduct.highlights.includes(highlight)
        ).length;
        score += matchingHighlights * 10; // Each matching highlight adds points
      }

      if (queryProduct.features && targetProduct.features) {
        const matchingFeatures = queryProduct.features.filter((feature) =>
          targetProduct.features.includes(feature)
        ).length;
        score += matchingFeatures * 10; // Each matching feature adds points
      }

      return score;
    };

    // Build query data from either provided name, category, or fetched product
    let queryProduct = {
      name: name || (product && product.name),
      category: category || (product && product.category),
      highlights: product ? product.highlights : [],
      features: product ? product.features : [],
    };

    // Calculate relevance score for all products
    suggestedProducts = allProducts.map((targetProduct) => ({
      product: targetProduct,
      relevance: calculateRelevance(targetProduct, queryProduct),
    }));

    // Sort by relevance score in descending order
    suggestedProducts = suggestedProducts
      .filter((item) => item.relevance > 0) // Keep only relevant products
      .sort((a, b) => b.relevance - a.relevance) // Sort by relevance
      .slice(0, 10) // Limit to top 10 suggestions
      .map((item) => item.product); // Extract only the product data

    // Track product IDs to prevent duplicates
    const productIds = new Set(suggestedProducts.map((prod) => prod._id));

    // Fallback if suggested products are fewer than 8
    if (suggestedProducts.length < 8) {
      // Fallback: Find additional similar products based on broader criteria
      const additionalFilters = {
        _id: { $nin: Array.from(productIds) }, // Exclude already suggested products
        $or: [
          { category: queryProduct.category }, // Similar category
          {
            price: {
              $gte: product ? product.price * 0.8 : 0,
              $lte: product ? product.price * 1.2 : 100000,
            },
          }, // Near price range
        ],
      };

      // Fetch additional fallback products
      const additionalProducts = await Product.find(additionalFilters)
        .limit(8 - suggestedProducts.length) // Get enough products to make up 8 total
        .exec();

      // Add new products to suggested products and track their IDs
      additionalProducts.forEach((prod) => {
        if (!productIds.has(prod._id.toString())) {
          suggestedProducts.push(prod);
          productIds.add(prod._id.toString()); // Add new product ID to the set
        }
      });
    }

    // If still fewer than 8 products, add random products to complete 8
    if (suggestedProducts.length < 8) {
      const remainingCount = 8 - suggestedProducts.length;
      const randomProducts = await Product.aggregate([
        { $sample: { size: remainingCount } },
      ]); // Random products

      // Add random products to suggested products, ensuring no duplicates
      randomProducts.forEach((prod) => {
        if (!productIds.has(prod._id.toString())) {
          suggestedProducts.push(prod);
          productIds.add(prod._id.toString()); // Add new product ID to the set
        }
      });
    }

    // Return the combined suggested products ensuring at least 8 products
    res.json({ suggestedProducts: suggestedProducts.slice(0, 8) }); // Ensure we only return the first 8 if more
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getProducts,
  addProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getSuggested,
  getFeaturedProducts,
};
