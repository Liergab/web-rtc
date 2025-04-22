import { IUser } from '../types';
import User from '../models/USER_MODEL';
import { GenericRepository } from './genericRepository'; 

class UserRepository extends GenericRepository<IUser> {
  constructor() {
    super('User', User.schema); 
  }

  async getEmail(email:string):Promise<IUser | null>{
    return await this.collection.findOne({email}).exec()
  }

}

export default new UserRepository();