const Blockchain = require('./blockchain');
const Block = require('./block');
const StarRegisterValidation = require('./star-register-validation');
const Utils = require('./utils');

class RequestHandler {
    getBlock(req, res) {
        this.getBlockCore(req.params.height, res);
    }

    getBlockHash(req, res) {
        this.getBlockByHash(req.params.hash)
            .then(block => block ? block : this.getBlockCore(-1, res))
            .then(block => res.json(block));
    }

    getBlockAddress(req, res) {
        this.getBlocksByAddress(req.params.address)
            .then(blocks => res.json(blocks));
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
                block = Utils.createDecodeStory(block);
                res.json(block);
            })
            .catch(() => Utils.badRequest(res, 'Block not found.'));
    }

    getBlockByHash(hash) {
        var recursiveFunc = function (key) {
            return Blockchain.getInstance()
                .then(instance => instance.getBlock(key))
                .then(block => {
                    if (block.hash === hash) {
                        return Utils.createDecodeStory(block);
                    }

                    return recursiveFunc(key + 1);
                })
                .catch(() => undefined);
        };

        return recursiveFunc(0);
    }

    getBlocksByAddress(address) {
        const blocks = [];
        var recursiveFunc = function (key) {
            return Blockchain.getInstance()
                .then(instance => instance.getBlock(key))
                .then(block => {
                    if (block.body.address === address) {
                        block = Utils.createDecodeStory(block);
                        blocks.push(block);
                    }

                    return recursiveFunc(key + 1);
                })
                .catch(() => blocks);
        };

        return recursiveFunc(0);
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
                .catch(() => Utils.badRequest(res, `Validation process for ${req.body.address} was not started.`));
        } else {
            Utils.badRequest(res, 'Expected json containing "address" and "signature" attributes.');
        }
    }
}

module.exports = RequestHandler;