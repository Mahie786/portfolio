const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const User = require("./models/User");
const Content = require("./models/Content");
const Follow = require("./models/Follow");

const app = express();
const PORT = process.env.PORT || 8080;

// Setting up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/RecipeNetwork", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    mongoose.model("User").createIndexes(); // This will ensure indexes are created for unique fields
    console.log("MongoDB connected and indexes ensured...");
  });

// Use the student ID directly in routes
const studentId = "M00804091";
const baseRoute = `/${studentId}`;

//serve the HTML page
app.get(`${baseRoute}/`, (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Registration Endpoint
app.post(`${baseRoute}/register`, async (req, res) => {
  const { username, password, email } = req.body;

  if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long." });
  }

  try {
    const newUser = new User({ username, password, email });
    await newUser.save();
    res.json({ message: "User registered successfully!" });
  } catch (error) {
    if (error.code === 11000) {
  
      if (error.message.includes("username")) {
        return res.status(400).json({ error: "Username already exists." });
      }
      if (error.message.includes("email")) {
        return res.status(400).json({ error: "Email already exists." });
      }
    }
    res.status(500).json({ error: "Error registering user", details: error });
  }
});

// Login Endpoint
app.post(`${baseRoute}/login`, async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    res.json({
      isLoggedIn: true,
      userId: user._id,
      message: "Logged in successfully!",
    });
  } else {
    res.status(401).json({ isLoggedIn: false, error: "Invalid credentials" });
  }
});

// Upload Content Endpoint
app.post(`${baseRoute}/upload`, upload.single("image"), async (req, res) => {
  const { title, ingredients, instructions } = req.body;
  const userId = req.body.userId; 
  const imagePath = req.file.filename;

  if (!title || !ingredients || !instructions || !userId) {
    return res
      .status(400)
      .json({ message: "Missing one or more required fields." });
  }

  try {
    const newContent = new Content({
      userId,
      title,
      ingredients: ingredients.split(","), 
      instructions,
      imagePath,
    });
    await newContent.save();
    res.json({ message: "Content uploaded successfully!" });
  } catch (error) {
    console.error("Error uploading content:", error);
    res.status(500).json({ error: "Failed to upload content" });
  }
});


// Fetch all recipes, including any comments or reviews they might have
app.get(`${baseRoute}/recipes`, async (req, res) => {
  try {
    const recipes = await Content.find().populate("user", "username"); 
    res.json(
      recipes.map((recipe) => {
        recipe.comments = recipe.comments || [];
        recipe.reviews = recipe.reviews || [];
        return recipe;
      })
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recipes", details: error });
  }
});

// Routes for other functionalities
app.get(`${baseRoute}/users`, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Follow User Endpoint
app.post(`${baseRoute}/follow`, async (req, res) => {
  const { followerId, followedId } = req.body;
  try {
    const follow = new Follow({ followerId, followedId });
    await follow.save();
    res.json({ message: "Followed successfully!" });
  } catch (error) {
    res.status(400).json({ error: "Failed to follow user" });
  }
});

// // Search Endpoint for users or recipes
app.get(`${baseRoute}/search`, async (req, res) => {
  const { searchTerm } = req.query;

  try {
    // Attempt to find users first
    const users = await User.find({
      username: { $regex: searchTerm, $options: "i" },
    });
    if (users.length > 0) {
      return res.json({ type: "users", data: users });
    }

    // If no users found, search for recipes
    const recipes = await Content.find({
      title: { $regex: searchTerm, $options: "i" },
    });
    if (recipes.length > 0) {
      return res.json({ type: "recipes", data: recipes });
    }

    // If nothing found
    res.status(404).json({ message: "No matches found" });
  } catch (error) {
    res.status(500).json({ error: "Search failed", details: error });
  }
});

// Fetch recipes of users followed by a specific user
app.get(`${baseRoute}/followedRecipes/:userId`, async (req, res) => {
  const { userId } = req.params; // Retrieve the userId from URL parameters

  try {
    const followedUsers = await Follow.find({ followerId: userId });
    const followedIds = followedUsers.map((follow) => follow.followedId);

    const recipes = await Content.find({ userId: { $in: followedIds } });
    res.json(recipes);
  } catch (error) {
    console.error("Failed to fetch followed recipes:", error);
    res.status(500).json({ message: "Failed to fetch recipes", error: error });
  }
});

// Post a comment to a recipe
app.post(`${baseRoute}/recipes/:recipeId/comments`, async (req, res) => {
  const { userId, text } = req.body;
  try {
    const recipe = await Content.findById(req.params.recipeId);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    recipe.comments.push({ userId, text });
    await recipe.save();
    res.json({
      message: "Comment added successfully!",
      comments: recipe.comments,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment", details: error });
  }
});

// Post a review to a recipe
app.post(`${baseRoute}/recipes/:recipeId/reviews`, async (req, res) => {
  const { userId, rating } = req.body;
  try {
    const recipe = await Content.findById(req.params.recipeId);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    recipe.reviews.push({ userId, rating });
    await recipe.save();
    res.json({
      message: "Review added successfully!",
      reviews: recipe.reviews,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add review", details: error });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
