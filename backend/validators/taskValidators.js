import Joi from 'joi';

export const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'Task title is required',
    'string.max': 'Task title cannot exceed 200 characters',
  }),
  description: Joi.string().trim().max(2000).allow('').default(''),
  team: Joi.string().required().messages({
    'string.empty': 'Team ID is required',
    'any.required': 'Team ID is required',
  }),
  assignedTo: Joi.string().allow(null, '').default(null),
  status: Joi.string().valid('To Do', 'In Progress', 'Completed').default('To Do'),
  priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
  dueDate: Joi.date().iso().allow(null).default(null),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().max(2000).allow(''),
  assignedTo: Joi.string().allow(null, ''),
  status: Joi.string().valid('To Do', 'In Progress', 'Completed'),
  priority: Joi.string().valid('Low', 'Medium', 'High'),
  dueDate: Joi.date().iso().allow(null),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided to update the task',
  });

export const updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid('To Do', 'In Progress', 'Completed').required().messages({
    'any.only': 'Status must be one of: To Do, In Progress, or Completed',
    'any.required': 'Status is required',
  }),
});

// Query-string validation for GET /tasks. Rejects objects/arrays such as ?status[$ne]=x
const idParam = Joi.string()
  .trim()
  .max(64)
  .pattern(/^[A-Za-z0-9_-]+$/)
  .messages({ 'string.pattern.base': 'Invalid identifier format' });

export const taskQuerySchema = Joi.object({
  teamId: idParam,
  assigneeId: idParam,
  status: Joi.string().valid('To Do', 'In Progress', 'Completed'),
  priority: Joi.string().valid('Low', 'Medium', 'High'),
  search: Joi.string().trim().max(100).allow(''),
});
