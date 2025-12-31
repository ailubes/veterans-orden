/**
 * Validation library - central exports
 *
 * Import validation utilities and schemas from this single entry point:
 *
 * @example
 * import { validateBody, signInSchema } from '@/lib/validation';
 */

// Validation utilities
export {
  validateBody,
  validateQuery,
  validateParams,
  validateFormData,
  validateRequest,
  type ValidationResult,
} from './validate';

// All validation schemas
export * from './schemas';
