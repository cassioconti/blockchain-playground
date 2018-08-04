const Blockchain = require('./blockchain');

Blockchain.getInstance()
    // Validate the chain
    .then(blockchain => blockchain.validateChain())

    // Uncomment the following line to print all the blocks in the chain.
    // .then(blockchain => blockchain.printAll());