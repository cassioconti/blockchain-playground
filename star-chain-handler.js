const Blockchain = require('./blockchain');
const Utils = require('./utils');

class StarChainHandler {
    getBlockByHeight(height) {
        return Blockchain.getInstance()
            .then(instance => instance.getBlock(height))
            .then(block => Utils.createDecodedStory(block));
    }

    getBlockByHash(hash) {
        var recursiveFunc = function (key, self) {
            return self.getBlockByHeight(key)
                .then(block => {
                    if (block.hash === hash) {
                        return block;
                    }

                    return recursiveFunc(key + 1, self);
                })
                .catch(() => undefined);
        };

        return recursiveFunc(0, this);
    }

    getBlocksByAddress(address) {
        const blocks = [];
        var recursiveFunc = function (key, self) {
            return self.getBlockByHeight(key)
                .then(block => {
                    if (block.body.address === address) {
                        blocks.push(block);
                    }

                    return recursiveFunc(key + 1, self);
                })
                .catch(() => blocks);
        };

        return recursiveFunc(0, this);
    }
}

module.exports = StarChainHandler;