const Blockchain = require('./blockchain');
const Block = require('./block');
const StarRegisterValidation = require('./star-register-validation');

class RequestHandler {
    getBlock(req, res) {
        this.getBlockCore(req.params.height, res);
    }

    postBlock(req, res) {
        if (req.body.data) {
            const newBlock = new Block(req.body.data);
            Blockchain.getInstance()
                .then(instance => instance.addBlock(newBlock))
                .then(instance => instance.getBlockHeight())
                .then(height => this.getBlockCore(height - 1, res));
        } else {
            res.status(400).json({
                reason: 'Bad request.',
                details: 'Expected json containing "data" attribute.'
            });
        }
    }

    getBlockCore(height, res) {
        Blockchain.getInstance()
            .then(instance => instance.getBlock(height))
            .then(block => res.json(block))
            .catch(err => res.send(err));
    }

    postRequestValidation(req, res) {
        if (req.body.address) {
            StarRegisterValidation.getInstance()
                .requestValidation(req.body.address)
                .then(response => res.json(response));
        } else {
            res.status(400).json({
                reason: 'Bad request.',
                details: 'Expected json containing "address" attribute.'
            });
        }
    }

    postValidateSignature(req, res) {
        if (req.body.address && req.body.signature) {
            StarRegisterValidation.getInstance()
                .validateSignature(req.body.address, req.body.signature)
                .then(response => res.json(response))
                .catch(err => {
                    console.log(err); // TODO: Remove when project is complete
                    res.status(400).json({
                        reason: 'Bad request.',
                        details: `Validation process for ${req.body.address} was not started.`
                    });
                });
        } else {
            res.status(400).json({
                reason: 'Bad request.',
                details: 'Expected json containing "address" and "signature" attributes.'
            });
        }
    }
}

module.exports = RequestHandler;