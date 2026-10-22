import Joi from 'joi';

export const userSearchQuerySchema = Joi.object({
  q: Joi.string().trim().max(100).allow('').default(''),
});
