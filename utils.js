class Utils {
    static badRequest(res, details) {
        res.status(400).json({
            reason: 'Bad request.',
            details
        });
    }

    static createDecodedStory(block) {
        if (block.body.star && block.body.star.story) {
            block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString();
        }

        return block;
    }
}

module.exports = Utils;