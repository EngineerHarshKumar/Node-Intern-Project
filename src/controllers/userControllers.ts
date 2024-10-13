import { Request, Response } from "express";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";



const createUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { username, email, first_name, last_name, password, phone } = req.body;
  try {
    const createdUser = await User.create({ username, email, first_name, last_name, password, phone});
  
    return res
            .status(200)
            .json({
              message: "user created successfully",
              data: createdUser
            });

  } catch (error) {
    return res.status(500).json({ error: "Failed to create Users" });
  }
};

const getAllUsers = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { search, sortBy, order = "asc", page = 1, limit = 10 } = req.query;
    const query: any = {};
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { first_name: searchRegex },
        { last_name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const sortOptions: any = {};
    if (sortBy) {
      sortOptions[sortBy as string] = order === "desc" ? -1 : 1;
    }

    const currentPage = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (currentPage - 1) * pageSize;

    const users = await User.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const totalAdmins = await User.countDocuments(query);

    return res.status(200).json({
      users,
      pagination: {
        total: totalAdmins,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(totalAdmins / pageSize),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

const getUserById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    console.log(`id: ${req.params.id}`);
    const admin = await User.findById(req.params.id);
    if (!admin) {
      return res.status(400).json({ error: "user not found" });
    }
    return res.status(200).json(admin);
  } catch (error) {
    return res.status(400).json({ error: "Failed to fetch user" });
  }
};

const updateUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { first_name, last_name, email, phone } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { first_name, last_name, email, phone },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(400).json({ error: "user not found" });
    }
    return res
      .status(200)
      .json({ message: "User updated successfully", user });
  } catch (error) {
    return res.status(400).json({ error: "Failed to update user" });
  }
};

const deleteUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(400).json({ error: "user not found" });
    }
    return res.status(200).json({ message: "user deleted successfully" });
  } catch (error) {
    return res.status(400).json({ error: "Failed to delete user" });
  }
};


const loginUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: "Login failed" });
  }
};


export {
  createUser,
  loginUser,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser
};