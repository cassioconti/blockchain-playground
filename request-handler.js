const Blockchain = require('./blockchain');
const Block = require('./block');
const StarRegisterValidation = require('./star-register-validation');
const StarChainHandler = require('./star-chain-handler');
const Utils = require('./utils');

class RequestHandler {
    constructor() {
        this.starChainHandler = new StarChainHandler();
    }

    getBlock(req, res) {
        this.getBlockCore(req.params.height, res);
    }

    getBlockHash(req, res) {
        this.starChainHandler.getBlockByHash(req.params.hash)
            .then(block => block ? res.json(block) : this.getBlockCore(-1, res));
    }

    getBlockAddress(req, res) {
        this.starChainHandler.getBlocksByAddress(req.params.address)
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

                        StarRegisterValidation.getInstance().markAsUsed(req.body.address);
                    } else {
                        Utils.badRequest(res, 'You do not have a validated request or it expired');
                    }
                });
        } else {
            Utils.badRequest(res, 'Expected json containing "address" and "star" attributes.');
        }
    }

    getBlockCore(height, res) {
        this.starChainHandler.getBlockByHeight(height)
            .then(block => res.json(block))
            .catch(() => Utils.badRequest(res, 'Block not found.'));
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