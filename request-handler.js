const Blockchain = require('./blockchain');

class RequestHandler {
    getBlock(req, res) {
        Blockchain.getInstance()
            .then(instance => instance.getBlock(req.params.height))
            .then(block => res.json(block))
            .catch(err => res.send(err));
    }

    postBlock(req, res) {
        res.send('Hello world POST');
    }
}

module.exports = RequestHandler;