const Blockchain = require('./blockchain');
const Block = require('./block');
const StarRegisterValidation = require('./star-register-validation');
const Utils = require('./utils');

class RequestHandler {
    getBlock(req, res) {
        this.getBlockCore(req.params.height, res);
    }

    postBlock(req, res) {
        if (req.body.address && req.body.star) {
            StarRegisterValidation.getInstance()
                .isAuthorized(req.body.address)
                .then(isAuthorized => {
                    if (isAuthorized) {
                        const newBlock = new Block(req.body);
                        const truncatedStory = newBlock.body.star.story.substring(0, 500);
                        newBlock.body.star.story = new Buffer(truncatedStory).toString('hex');
                        Blockchain.getInstance()
                            .then(instance => instance.addBlock(newBlock))
                            .then(instance => instance.getBlockHeight())
                            .then(height => this.getBlockCore(height - 1, res));
                    } else {
                        Utils.badRequest(res, 'You do not have a validated request or it expired');
                    }
                });
        } else {
            Utils.badRequest(res, 'Expected json containing "address" and "star" attributes.');
        }
    }

    getBlockCore(height, res) {
        Blockchain.getInstance()
            .then(instance => instance.getBlock(height))
            .then(block => {
                if (block.body.star && block.body.star.story) {
                    block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString();
                }
                res.json(block);
            })
            .catch(() => Utils.badRequest(res, 'Block not found.'));
    }
}

postRequestValidation(req, res) {
    if (req.body.address) {
        StarRegisterValidation.getInstance()
            .requestValidation(req.body.address)
            .then(response => res.json(response));
    } else {
        Utils.badRequest(res, 'Expected json containing "address" attribute.');
    }
}

postValidateSignature(req, res) {
    if (req.body.address && req.body.signature) {
        StarRegisterValidation.getInstance()
            .validateSignature(req.body.address, req.body.signature)
            .then(response => res.json(response))
            .catch(err => Utils.badRequest(res, `Validation process for ${req.body.address} was not started.`));
    } else {
        Utils.badRequest(res, 'Expected json containing "address" and "signature" attributes.');
    }
}

module.exports = RequestHandler;