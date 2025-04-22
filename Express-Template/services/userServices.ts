import { comparePassword, hashPassword } from "../config/bcrypt";
import UserRepository from "../repository/userRepository";
import { IUser } from "../types/index";
import generateToken from "../util/generateToken";

class UserService {
  // Create a new user
  async createUser(
    userData: Partial<IUser>
  ): Promise<{ token: string; user: IUser }> {
    const userExists = await UserRepository.getEmail(userData.email!);
    if (userExists) {
      throw new Error("User already exists");
    }
    userData.password = await hashPassword(userData.password!);
    const newUser = await UserRepository.add(userData);
    const token = await generateToken(newUser._id);
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    return { user: userWithoutPassword, token };
  }

  async login(
    userData: Partial<IUser>
  ): Promise<{ token: string; user: IUser }> {
    const userExists = await UserRepository.getEmail(userData.email!);
    if (!userExists) {
      throw new Error("User does not exist");
    }
    const isValidPassword = await comparePassword(
      userData.password!,
      userExists.password!
    );
    if (!isValidPassword) {
      throw new Error("Invalid Password");
    }
    const token = await generateToken(userExists._id);
    const { password: _, ...userWithoutPassword } = userExists.toObject();
    return { user: userWithoutPassword, token };
  }

  async getUserById(id: string): Promise<IUser | null> {
    try {
      return await UserRepository.doc(id);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to retrieve user");
    }
  }

  async getUsers(params: any): Promise<{ users: IUser[]; pagination: any }> {
    if (!params) {
      throw new Error("Invalid parameters for getting all users");
    }

    try {
      const dbParams: any = { query: {}, options: {} };

      if (
        params.queryArray &&
        params.queryArray.length > 0 &&
        params.queryArrayType &&
        params.queryArrayType.length > 0
      ) {
        const queryArray = Array.isArray(params.queryArray)
          ? params.queryArray
          : [params.queryArray];
        const queryArrayType = Array.isArray(params.queryArrayType)
          ? params.queryArrayType
          : [params.queryArrayType];

        const queryConditions = queryArrayType.map((type: string | number) => {
          const trimmedType = String(type).trim();
          return { [trimmedType]: { $in: queryArray } };
        });

        interface QueryCondition {
          [key: string]: { $in: any[] };
        }

        queryConditions.forEach((condition: QueryCondition) => {
          dbParams.query = { ...dbParams.query, ...condition };
        });
      }

      if (params.populateArray) {
        dbParams.options.populateArray = params.populateArray.map(
          (item: any) => {
            if (typeof item === "string") {
              const [path, select] = item.split(":");
              return select
                ? { path, select: select.split(",").join(" ") }
                : { path };
            }
            return item;
          }
        );
      }

      if (params.sort) {
        dbParams.options.sort = params.sort;
      }
      if (params.limit) {
        dbParams.options.limit = params.limit;
      }
      if (params.select) {
        if (!Array.isArray(params.select)) {
          params.select = [params.select];
        }
        dbParams.options.select = params.select.join(" ");
      }
      if (params.lean !== undefined) {
        dbParams.options.lean = params.lean;
      }

      const page = params.page || 1;
      const limit = params.limit || 10;
      dbParams.options.skip = (page - 1) * limit;
      dbParams.options.limit = limit;

      const [users, totalItems] = await Promise.all([
        UserRepository.docs(dbParams),
        UserRepository.count(dbParams.query),
      ]);

      const totalPages = Math.ceil(totalItems / limit);
      const pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };

      return { users, pagination };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(String(error));
      }
    }
  }

  // Update user details by ID
  async updateUser(
    id: string,
    userData: Partial<IUser>
  ): Promise<IUser | null> {
    try {
      return await UserRepository.update(id, userData);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update user");
    }
  }

  // Delete a user by ID
  async deleteUser(id: string): Promise<IUser | null> {
    try {
      return await UserRepository.delete(id);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to delete user");
    }
  }

  // Search users with specific criteria
  async searchUsers(search: string): Promise<IUser[]> {
    try {
      const fields = ["name", "email"]; 
      return await UserRepository.search(search, fields);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to search users");
    }
  }

  async getUser(id: string, params: any): Promise<IUser | null> {
    if (!id) {
      throw new Error("User ID is required");
    }

    try {
      const dbParams: any = { query: {}, options: {} };
      if (params.populateArray) {
        dbParams.options.populateArray = params.populateArray.map(
          (item: any) => {
            if (typeof item === "string") {
              const [path, select] = item.split(":");
              return select
                ? { path, select: select.split(",").join(" ") }
                : { path };
            }
            return item;
          }
        );
      }

      if (params.queryArray) {
        const queryArrayObj: { [key: string]: any } = {};
        queryArrayObj[params.queryArrayType] = params.queryArray;
        dbParams.query = { ...dbParams.query, ...queryArrayObj };
      }

      if (params.select) {
        if (!Array.isArray(params.select)) {
          params.select = [params.select];
        }
        dbParams.options.select = params.select.join(" ");
      }
      if (params.lean !== undefined) {
        dbParams.options.lean = params.lean;
      }

      return await UserRepository.doc(id, dbParams);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(String(error));
      }
    }
  }
}

export default new UserService();
