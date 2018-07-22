const express = require('express');
const app = express();
const RequestHandler = require('./request-handler');

const requestHandler = new RequestHandler();

app.get('/block/:height', requestHandler.getBlock);
app.post('/', requestHandler.postBlock);

const port = 8000;
app.listen(port, () => console.log(`App listening on port ${port}!`));
