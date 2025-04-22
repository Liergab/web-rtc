import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import env from'../util/validate'
import User from '../models/USER_MODEL'
import { IUser } from '../types'


declare global{
    namespace Express{
        interface Request{
            user?:Omit<IUser , 'password'> | null
        }
    }
}

export const authMiddleware =  async (req:Request, res:Response, next:NextFunction) => {
    try {
        let token = req.cookies['auth-token']

        if(token){
            try {
                const decode = jwt.verify(token,env.SECRET_KEY ) as JwtPayload & {id:string};

                const user  = await User.findById(decode.id).select('-password')

                req.user = user
                next()
            } catch (error) {
                console.error('JWT Verification Error:', error);
                res.status(401).json({ message: 'Not Authorized, Invalid Token' });
            }
        }else{
            res.status(401).json({ message: 'Not Authorized, No token' });
        }
    } catch (error) {
        next(error)
    }
}