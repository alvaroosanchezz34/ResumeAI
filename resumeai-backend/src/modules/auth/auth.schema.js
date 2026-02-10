const registerSchema = {
    email: {
        isEmail: true,
        errorMessage: 'Invalid email'
    },
    password: {
        isLength: {
            options: { min: 6 }
        },
        errorMessage: 'Password must be at least 6 chars'
    }
};

module.exports = { registerSchema };
