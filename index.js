const express = require('express');
const bodyParser = require("body-parser");
const RequestHandler = require('./request-handler');

const app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

const requestHandler = new RequestHandler();

app.get('/block/:height', (req, res) => requestHandler.getBlock(req, res));
app.post('/block', (req, res) => requestHandler.postBlock(req, res));

const port = 8000;
app.listen(port, () => console.log(`App listening on port ${port}!`));