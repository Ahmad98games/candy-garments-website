const Joi = require('joi');

const registerSchema = Joi.object({
    firstName: Joi.string().min(2).max(30).required(),
    lastName: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^[0-9+\-() ]+$/).min(10).max(15).optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

module.exports = {
    validateRegister: validateRequest(registerSchema),
    validateLogin: validateRequest(loginSchema)
};
