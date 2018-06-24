const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(data) {
        this.hash = "";
        this.height = 0;
        this.body = data;
        this.time = 0;
        this.previousBlockHash = "";
    }
}

class BlockChain {
    constructor() {
        this.chain = [];
        const firstBlock = new Block('First block in the chain - Genesis block');
        this.addBlock(firstBlock);
    }

    getLastBlock() {
        if (this.chain.length === 0) {
            return null;
        }

        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        const lastBlock = this.getLastBlock();
        if (lastBlock) {
            newBlock.previousBlockHash = lastBlock.hash;
        }

        newBlock.height = this.chain.length;
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        this.chain.push(newBlock);
    }
}

blockChain = new BlockChain();
block1 = new Block("Some data1");
block2 = new Block("Some data2");
blockChain.addBlock(block1);
blockChain.addBlock(block2);
console.log(blockChain);