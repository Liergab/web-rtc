import { NextFunction, Request, Response } from "express";
import UserService from "../services/userServices";
import mongoose from "mongoose";
import { ValidationSchemas } from "../util/validationSchema";
import { handleZodError } from "../middleware/zodErrorHandler";

// Create a user
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData = req.body;
    const { user, token } = await UserService.createUser(userData);

    res.cookie("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(201).json({ user, token });
  } catch (error: any) {
    if (error?.message === "User already exists") {
      res.status(409);
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData = req.body;
    const { user, token } = await UserService.login(userData);
    res.cookie("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.status(200).json({ user, token });
  } catch (error: any) {
    next(error);
  }
};

// Get a user by ID
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400);
      throw new Error("Invalid user ID format");
    }
    const user = await UserService.getUserById(userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

// Get all users
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const params = ValidationSchemas.getQueriesParams.parse({
      query: req.query.query || {},
      queryArray: req.query.queryArray
        ? Array.isArray(req.query.queryArray)
          ? req.query.queryArray
          : String(req.query.queryArray)
              .split(",")
              .map((item) => item.trim())
        : [],
      queryArrayType: req.query.queryArrayType
        ? Array.isArray(req.query.queryArrayType)
          ? req.query.queryArrayType.map(String)
          : String(req.query.queryArrayType).split(",")
        : [],
      populateArray: req.query.populateArray
        ? req.query.populateArray
            .toString()
            .split(" ")
            .map((path, index) => ({
              path,
              select:
                req.query.populateSelect
                  ?.toString()
                  .split(",")
                  [index]?.trim() || "",
            }))
        : [],
      sort: req.query.sort,
      limit: req.query.limit,
      select: Array.isArray(req.query.select)
        ? req.query.select
        : [req.query.select].filter(Boolean),
      lean: req.query.lean,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    });

    if (!params.query) params.query = {};

    const { users, pagination } = await UserService.getUsers(params);

    res.status(200).send({
      message: "Users retrieved successfully",
      data: users,
      pagination,
    });
  } catch (error) {
    console.error("Error in getAllUsers controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
    });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = ValidationSchemas.idParam.parse({ id: req.params.id });
    const params = ValidationSchemas.getQueryParams.parse({
      populateArray: req.query.populateArray
        ? req.query.populateArray
            .toString()
            .split(" ")
            .map((path, index) => ({
              path,
              select:
                req.query.populateSelect
                  ?.toString()
                  .split(",")
                  [index]?.trim() || "",
            }))
        : [],
      select: Array.isArray(req.query.select)
        ? req.query.select
        : [req.query.select].filter(Boolean),
      lean: req.query.lean,
    });

    const user = await UserService.getUser(id, params);
    res
      .status(200)
      .send({ message: "User retrieved successfully", data: user });
  } catch (error) {
    handleZodError(error, res);
  }
};

// Update a user by ID
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    const updatedUser = await UserService.updateUser(userId, userData);
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error: any) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id;
    const deletedUser = await UserService.deleteUser(userId);
    if (deletedUser) {
      res.status(200).json({ message: "User deleted" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export const searchUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search as string;

    const users = await UserService.searchUsers(search);

    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: "Failed to search users" });
  }
};
