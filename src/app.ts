import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes"; // Import admin routes
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
mongoose
  .connect(`${process.env.MONGODB_URI}`)
  .then(() => {
    console.log(`databse connected successfully`);
    app.listen(PORT, () => {
      console.log(`server is running on port: ${PORT}`);
    })
  })
  .catch(() => {
    console.log("database connection Failed");
  });