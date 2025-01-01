// middleware/errorMiddleware.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error details to the console
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        success: false,
    });
};

module.exports = errorHandler;