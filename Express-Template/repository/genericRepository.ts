import mongoose, { Model, Document, Schema } from "mongoose";

interface DbParams {
  query?: any;
  options?: {
    populateArray?: any[];
    select?: string;
    lean?: boolean;
    sort?: any;
    limit?: number;
    skip?: number;
  };
}

export class GenericRepository<T extends Document> {
  protected collection: Model<T>;

  constructor(collectionName: string, schema: Schema) {
    this.collection = mongoose.model<T>(collectionName, schema);
  }

  async docs(dbParams: DbParams): Promise<T[]> {
    try {
      let query = this.collection.find(dbParams.query);

      (dbParams.options?.populateArray || []).forEach(
        (populate: string | { path: string; select: string }) => {
          if (typeof populate === "string") {
            query.populate(populate);
          } else {
            query.populate(populate.path, populate.select);
          }
        }
      );

      const options = {
        sort: dbParams.options?.sort || {},
        limit: dbParams.options?.limit || 10,
        select: dbParams.options?.select || "_id",
        lean: dbParams.options?.lean || true,
        skip: dbParams.options?.skip || 0,
      };

      query = query
        .sort(options.sort)
        .limit(options.limit)
        .select(options.select)
        .lean(options.lean)
        .skip(options.skip) as any;

      return await query.exec();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async add(options: Partial<T>): Promise<T> {
    try {
      const modelObj = new this.collection(options);
      return await modelObj.save();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(_id: string, options: Partial<T>): Promise<T | null> {
    try {
      return await this.collection.findByIdAndUpdate(
        _id,
        { $set: options },
        { new: true }
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async delete(_id: string): Promise<T | null> {
    try {
      return await this.collection.findByIdAndDelete(_id);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async search(search: string, fields: string[]): Promise<T[]> {
    try {
      const searchQuery = {
        $or: fields.map((field) => ({
          [field]: new RegExp(search, "i"),
        })),
      };

      const filterQuery: Record<string, any> = searchQuery;

      const result = await this.collection.find(filterQuery).lean().exec();

      return result as T[]; 
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async doc(id: string, dbParams: DbParams = {}): Promise<T | null> {
    let query = this.collection.findById(id);

    (dbParams.options?.populateArray || []).forEach(
      (populate: string | { path: string; select: string }) => {
        if (typeof populate === "string") {
          query.populate(populate);
        } else {
          query.populate(populate.path, populate.select);
        }
      }
    );

    const options = {
      select: dbParams.options?.select || "_id",
      lean: dbParams.options?.lean || true,
    };

    query = query.select(options.select).lean(options.lean) as any;

    return query.exec();
  }

  async count(query: Record<string, any> = {}): Promise<number> {
    try {
      return await this.collection.countDocuments(query);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
