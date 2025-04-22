import express from "express";
import config from "../config/endpoint";
const userRouter = express.Router();
import * as controller from "../controllers/userController";

// Define routes
userRouter.post(config.USER_ENDPOINT.CREATE_USER, controller.createUser);
userRouter.get(config.USER_ENDPOINT.GET_ALL_USERS, controller.getAllUsers);
userRouter.get(config.USER_ENDPOINT.SEARCH_USERS, controller.searchUsers);
userRouter.get(config.USER_ENDPOINT.GET_USER_BY_ID, controller.getUser);
userRouter.put(config.USER_ENDPOINT.UPDATE_USER_BY_ID, controller.updateUser);
userRouter.delete(
  config.USER_ENDPOINT.DELETE_USER_BY_ID,
  controller.deleteUser
);
userRouter.post(config.USER_ENDPOINT.LOGIN_USER, controller.login);

export default userRouter;
