// server.js (Modified)
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT generation
const app = express();
const PORT = process.env.PORT || 5800;

// ... (MongoDB connection and Product schema remain the same)

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

const User = mongoose.model('User', userSchema);

// Routes
app.use(express.json()); // Important for parsing JSON requests

// Registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' }); // Replace with a strong secret

    res.json({ token }); // Send token to the client
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// ... (Product API endpoint - protect it later using middleware)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));