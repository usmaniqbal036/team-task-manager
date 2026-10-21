import Joi from 'joi';

export const createTeamSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Team name is required',
    'string.min': 'Team name must be at least 2 characters',
    'string.max': 'Team name cannot exceed 100 characters',
  }),
  description: Joi.string().trim().max(500).allow('').default(''),
});

export const updateTeamSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).messages({
    'string.min': 'Team name must be at least 2 characters',
    'string.max': 'Team name cannot exceed 100 characters',
  }),
  description: Joi.string().trim().max(500).allow(''),
})
  .min(1)
  .messages({
    'object.min': 'At least one field (name or description) must be provided for update',
  });

export const addMemberSchema = Joi.object({
  email: Joi.string().trim().email().messages({
    'string.email': 'Please provide a valid email address',
  }),
  userId: Joi.string().trim(),
})
  .or('email', 'userId')
  .messages({
    'object.missing': 'Either user email or user ID must be provided to add a member',
  });
