const Block = require('./block');
const Blockchain = require('./blockchain');

// Method used to generate multiple blocks
var generateBlocks = function (instance, n) {
    if (n <= 0) {
        return instance;
    }

    return instance.addBlock(new Block("Some data"))
        .then(() => generateBlocks(instance, n - 1));
};

Blockchain.getInstance()
    // Uncomment the following line as an example to add blocks to the chain.
    // .then(blockchain => generateBlocks(blockchain, 5))

    .then(blockchain => blockchain.validateChain())

    // Uncomment the following line to print all the block in the chain.
    .then(blockchain => blockchain.printAll());