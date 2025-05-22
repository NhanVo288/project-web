module.exports = {
    mongoURI: process.env.MONGO_URI || 'mongodb+srv://vnhan2808:KeymC5UjVZGcydoI@ecommerce.larq3v4.mongodb.net/book',
    jwtSecret: process.env.JWT_SECRET || '12345678',
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development'
};

