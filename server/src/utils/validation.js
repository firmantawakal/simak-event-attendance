const Joi = require('joi');

// Event validation schemas
const eventSchemas = {
  create: Joi.object({
    name: Joi.string().required().min(3).max(255).trim(),
    slug: Joi.string().required().min(3).max(255).trim().pattern(/^[a-z0-9-]+$/),
    description: Joi.string().optional().max(1000).trim(),
    date: Joi.date().required().iso(),
    location: Joi.string().optional().max(255).trim()
  }),

  update: Joi.object({
    name: Joi.string().optional().min(3).max(255).trim(),
    slug: Joi.string().optional().min(3).max(255).trim().pattern(/^[a-z0-9-]+$/),
    description: Joi.string().optional().max(1000).trim(),
    date: Joi.date().optional().iso(),
    location: Joi.string().optional().max(255).trim()
  }),

  id: Joi.object({
    id: Joi.number().integer().positive().required()
  })
};

// Attendance validation schemas
const attendanceSchemas = {
  create: Joi.object({
    eventSlug: Joi.string().required().min(3).max(255).trim(),
    guestName: Joi.string().required().min(2).max(255).trim(),
    institution: Joi.string().required().min(2).max(255).trim(),
    position: Joi.string().optional().max(255).trim(),
    phone: Joi.string().optional().max(20).trim(),
    email: Joi.string().optional().email().max(255).trim(),
    representativeCount: Joi.number().integer().min(1).max(100).default(1),
    category: Joi.string().optional().valid('official_invitation', 'sponsor', 'guest', 'other').trim()
  }),

  getAttendance: Joi.object({
    eventId: Joi.number().integer().positive().required(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(20),
    institution: Joi.string().optional().trim(),
    search: Joi.string().optional().trim()
  })
};

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      error.isJoi = true;
      return next(error);
    }

    req[property] = value;
    next();
  };
};

module.exports = {
  eventSchemas,
  attendanceSchemas,
  validate
};