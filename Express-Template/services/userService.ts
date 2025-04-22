import { Types } from 'mongoose';
import User from '../models/USER_MODEL';
import { 
  CreateUserInput, 
  UpdateUserInput, 
  LoginUserInput, 
  PasswordResetRequestInput,
  PasswordResetInput,
  createUserSchema,
  updateUserSchema,
  loginUserSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  verifyEmailSchema
} from '../validations/userValidation';
import { IUser } from '../types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class UserService {
  // Create a new user with validation
  async createUser(userData: CreateUserInput): Promise<IUser> {
    // Validate input data
    const validatedData = createUserSchema.parse(userData);
    
    // Check if user already exists
    const existingUser = await User.findByEmail(validatedData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create user
    const newUser = await User.create({
      ...validatedData,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt
    });
    
    return newUser;
  }
  
  // Update user with validation
  async updateUser(userId: string, updateData: UpdateUserInput): Promise<IUser | null> {
    // Validate input data
    const validatedData = updateUserSchema.parse(updateData);
    
    // If password is included, hash it
    if (validatedData.password) {
      validatedData.password = await bcrypt.hash(validatedData.password, 10);
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: validatedData },
      { new: true, runValidators: true }
    );
    
    return updatedUser;
  }
  
  // User login with validation
  async loginUser(loginData: LoginUserInput): Promise<{ user: IUser; token: string }> {
    // Validate input data
    const validatedData = loginUserSchema.parse(loginData);
    
    // Find user
    const user = await User.findByEmail(validatedData.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-fallback-secret',
      { expiresIn: '1d' }
    );
    
    return { user, token };
  }
  
  // Request password reset
  async requestPasswordReset(requestData: PasswordResetRequestInput): Promise<{ message: string }> {
    // Validate input data
    const validatedData = passwordResetRequestSchema.parse(requestData);
    
    // Find user
    const user = await User.findByEmail(validatedData.email);
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return { message: 'If your email is registered, you will receive a password reset link' };
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    
    // Save reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();
    
    // In a real application, send email with reset link here
    
    return { message: 'If your email is registered, you will receive a password reset link' };
  }
  
  // Reset password with token
  async resetPassword(resetData: PasswordResetInput): Promise<{ message: string }> {
    // Validate input data
    const validatedData = passwordResetSchema.parse(resetData);
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: validatedData.token,
      resetPasswordExpiresAt: { $gt: new Date() }
    });
    
    if (!user) {
      throw new Error('Invalid or expired password reset token');
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Update user
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    
    return { message: 'Password has been reset successfully' };
  }
  
  // Verify email
  async verifyEmail(verifyData: { token: string }): Promise<{ message: string }> {
    // Validate input data
    const validatedData = verifyEmailSchema.parse(verifyData);
    
    // Find user with valid token
    const user = await User.findOne({
      verificationToken: validatedData.token,
      verificationTokenExpiresAt: { $gt: new Date() }
    });
    
    if (!user) {
      throw new Error('Invalid or expired verification token');
    }
    
    // Update user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    
    return { message: 'Email has been verified successfully' };
  }
  
  // Get user by ID
  async getUserById(userId: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }
    
    return User.findById(userId);
  }
  
  // Delete user
  async deleteUser(userId: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }
    
    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      throw new Error('User not found');
    }
    
    return { message: 'User deleted successfully' };
  }
}

export default new UserService(); 