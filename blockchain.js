const SHA256 = require('crypto-js/sha256');
const level = require('level');
const Block = require('./block');

const chainDB = './chaindata';
const db = level(chainDB);

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/


class Blockchain {

    // Get a static instance of the Blockchain class as a promise
    static getInstance() {
        if (!Blockchain.instance) {
            Blockchain.instance = new Blockchain();
            return Blockchain.instance.getBlockHeight()
                .then(height => {
                    if (height === 0) {
                        return Blockchain.instance.addBlock(new Block("First block in the chain - Genesis block"));
                    }
                })
                .then(() => Blockchain.instance);
        } else {
            return Promise.resolve(Blockchain.instance);
        }
    }

    // Add the new block and return a promise to the blockchain instance
    addBlock(newBlock) {
        return this.getBlockHeight()
            .then(height => {
                newBlock.height = height;
                newBlock.time = new Date().getTime().toString().slice(0, -3);
                var promisePrevBlock;
                if (height > 0) {
                    promisePrevBlock = this.getBlock(height - 1)
                        .then(prevBlock => {
                            newBlock.previousBlockHash = prevBlock.hash;
                        });
                }

                return Promise.all([promisePrevBlock])
                    .then(() => {
                        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                        return db.put(height, JSON.stringify(newBlock));
                    });
            })
            .then(() => Blockchain.instance);
    }

    // Get a promise to the block height
    getBlockHeight() {
        var recursiveFunc = function (key) {
            return db.get(key)
                .then(() => recursiveFunc(key + 1))
                .catch(() => key);
        };

        return recursiveFunc(0);
    }

    // Get a promise to the requested block
    getBlock(blockHeight) {
        // return object as a single string
        return db.get(blockHeight)
            .then(value => JSON.parse(value));
    }

    // Print all the blocks in the chain and return a promise to the blockchain instance
    printAll() {
        var recursiveFunc = function (key) {
            return db.get(key)
                .then(block => {
                    console.log(key, block);
                    return recursiveFunc(key + 1);
                })
                .catch(() => console.log(`... total number of blocks: ${key}. Done!`));
        };

        console.log('Printing all blocks...');
        return recursiveFunc(0)
            .then(() => Blockchain.instance);
    }

    // Returns a Promise to a boolean indicating if the block is valid
    validateBlock(blockHeight) {
        // get block object
        return this.getBlock(blockHeight)
            .then(block => {
                // get block hash
                let blockHash = block.hash;
                // remove block hash to test block integrity
                block.hash = '';
                // generate block hash
                let validBlockHash = SHA256(JSON.stringify(block)).toString();
                // Compare
                if (blockHash === validBlockHash) {
                    console.log('Block #' + blockHeight + ' is valid');
                    return true;
                } else {
                    console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
                    return false;
                }
            });
    }

    // Validate the whole blockchain and returns a promise to the blockchain instance
    validateChain() {
        let errorLog = [];
        return this.getBlockHeight()
            .then(height => {
                let promises = [];
                for (var i = 0; i < height - 1; i++) {
                    // validate block
                    promises.push(this.validateChainCore(i, errorLog));
                }

                // validate last block
                promises.push(this.validateBlock(height - 1, errorLog));

                return Promise.all(promises);
            })
            .then(() => {
                if (errorLog.length > 0) {
                    console.log('Block errors = ' + errorLog.length);
                    console.log('Blocks: ' + errorLog);
                    return false;
                }

                console.log('No errors detected');
                return true;
            })
            .then(() => Blockchain.instance);
    }

    // Validate the link between a block and the next
    validateChainCore(i, errorLog) {
        return this.validateBlock(i)
            .then(isValid => {
                if (!isValid) {
                    errorLog.push(i);
                } else {
                    // compare blocks hash link
                    return this.getBlock(i)
                        .then(block => {
                            let blockHash = block.hash;
                            return this.getBlock(i + 1)
                                .then(nextBlock => {
                                    let previousHash = nextBlock.previousBlockHash;
                                    if (blockHash !== previousHash) {
                                        errorLog.push(i);
                                    }
                                });
                        });
                }
            });
    }
}

module.exports = Blockchain;