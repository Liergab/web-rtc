import mongoose from "mongoose";
import { IUser } from "../types";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'vendor'],
        default: 'user'
    },
    address: {
        street: {
            type: String
        },
        barangay: {
            type: String
        },
        city: {
            type: String
        },
        municipality: {
            type: String
        },
        province: {
            type: String
        },
        postalCode: {
            type: String
        }
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date
}, { timestamps: true });

// Indexes for performance optimization
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ verificationToken: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function(this: any) {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
    }
    return this.firstName || this.lastName || '';
});

// Instance methods
userSchema.methods = {
    // Add any custom methods here
    isPasswordResetTokenValid: function(this: IUser): boolean {
        return (
            this.resetPasswordToken &&
            this.resetPasswordExpiresAt &&
            new Date() < this.resetPasswordExpiresAt
        );
    },
    
    isVerificationTokenValid: function(this: IUser): boolean {
        return !!(
            this.verificationToken &&
            this.verificationTokenExpiresAt &&
            new Date() < new Date(this.verificationTokenExpiresAt)
        );
    }
};

// Static methods
userSchema.statics = {
    // Add any static methods here
    findByEmail: function(email: string) {
        return this.findOne({ email: email.toLowerCase() });
    }
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;