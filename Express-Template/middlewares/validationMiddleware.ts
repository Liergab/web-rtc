import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

// Middleware to validate request body against a Zod schema
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      
      // Handle other errors
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };
};

// Middleware to validate request params against a Zod schema
export const validateParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request params against schema
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      
      // Handle other errors
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };
};

// Middleware to validate request query against a Zod schema
export const validateQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request query against schema
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      
      // Handle other errors
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };
}; 