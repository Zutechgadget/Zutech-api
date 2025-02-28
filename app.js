import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './lib/ConnectDB.js';

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB Atlas (or your local DB, depending on env variables)
connectDB();

app.use(cors());
// Allow requests from specific origins (your frontend)
app.use(cors({
  origin: ["http://localhost:3000", "https://apple-nx.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"]
}));

// Middleware
app.use(express.json());

// Import routes
import customerRoute from './routes/customers.js';
import userRoute from './routes/users.js';
import categoryRoute from './routes/categorys.js';
import productRoute from './routes/products.js';
import authRoute from './routes/auth.js';

// Routes
app.use('/api/customers', customerRoute);
app.use('/api/users', userRoute);
app.use('/api/category', categoryRoute);
app.use('/api/products', productRoute);
app.use('/api/auth', authRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong! Please try again later.');
});

app.get("/api/category", (req, res) => {
  res.json({ message: "Categories endpoint is working!" });
});



// Start the server
const port = process.env.PORT || 4400;
app.listen(port, () => console.log(`Listening on port ${port}`));
