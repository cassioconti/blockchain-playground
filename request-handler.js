class RequestHandler {
    getBlock(req, res) {
        res.send('Hello world GET');
    }

    postBlock(req, res) {
        res.send('Hello world POST');
    }
}

module.exports = RequestHandler;