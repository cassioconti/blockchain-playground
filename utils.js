class Utils {
    static badRequest(res, details) {
        res.status(400).json({
            reason: 'Bad request.',
            details
        });
    }
}

module.exports = Utils;