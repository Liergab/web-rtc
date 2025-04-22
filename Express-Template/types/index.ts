import { Document } from "mongoose";

export interface IUser extends Document  {
    _id       : string;
    email     : string;
    password  : string;
    firstName? : string;
    lastName?  : string;
    role: 'user' | 'admin' | 'vendor';
    address?  : addressType;
    lastLogin : Date;
    isVerified: Boolean;
    resetPasswordToken: String;
    resetPasswordExpiresAt: Date;
	verificationToken?: String;
	verificationTokenExpiresAt?: Date;

}


type addressType = {
    street?   : string;
    barangay? : string;
    city?     : string
    municipality? : string;
    province? : string;
    postalCode? :string
}