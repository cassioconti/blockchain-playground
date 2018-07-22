const Blockchain = require('./blockchain');
const Block = require('./block');

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
}

module.exports = RequestHandler;