import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import logger from './logger';

const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (e: any) {
    logger.error(`Validation Error: ${e.errors.map((err: any) => err.message).join(', ')}`);
    return res.status(400).send(e.errors);
  }
};

export default validate; 