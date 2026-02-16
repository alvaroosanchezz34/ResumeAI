const plans = {
    free: {
        dailyLimit: 5,
        features: ['summary', 'flashcards']
    },
    go: {
        dailyLimit: 50,
        features: ['summary', 'flashcards', 'test', 'development']
    },
    premium: {
        dailyLimit: 200,
        features: ['summary', 'flashcards', 'test', 'development']
    },
    custom: {
        dailyLimit: 999999,
        features: ['summary', 'flashcards', 'test', 'development']
    },
    admin: {
        dailyLimit: Infinity,
        features: ['summary', 'flashcards', 'test', 'development']
    }
};

module.exports = plans;
