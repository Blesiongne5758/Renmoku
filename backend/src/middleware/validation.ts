import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import logger from '../utils/logger';

// Validate request body
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('Validation error', { errors, body: req.body });

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
        return;
      }

      next(error);
    }
  };
};

// Validate request params
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('Params validation error', { errors, params: req.params });

        res.status(400).json({
          success: false,
          error: 'Invalid parameters',
          details: errors,
        });
        return;
      }

      next(error);
    }
  };
};

// Validate request query
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('Query validation error', { errors, query: req.query });

        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: errors,
        });
        return;
      }

      next(error);
    }
  };
};
