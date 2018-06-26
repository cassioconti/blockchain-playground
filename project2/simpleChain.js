/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
  constructor(data) {
    this.hash = "",
      this.height = 0,
      this.body = data,
      this.time = 0,
      this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
  constructor() {
    this.addBlock(new Block("First block in the chain - Genesis block"), true);
  }

  // Add new block
  addBlock(newBlock, canSkip) {
    let i = 0;
    db.createReadStream().on('data', function (data) {
      i++;
    }).on('error', function (err) {
      return console.log('Unable to read data stream!', err)
    }).on('close', () => {
      if (canSkip && i > 0) {
        return;
      }

      console.log('Block #' + i);
      // Block height
      newBlock.height = i;
      // UTC timestamp
      newBlock.time = new Date().getTime().toString().slice(0, -3);
      // previous block hash
      let promise;
      if (i > 0) {
        promise = this.getBlock(i - 1)
          .then(prevBlock => {
            newBlock.previousBlockHash = prevBlock.hash
          });
      }

      Promise.all([promise]).then(() => {
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        // Adding block object to chain
        console.log(newBlock);
        db.put(i, JSON.stringify(newBlock), function (err) {
          if (err) return console.log('Block ' + i + ' submission failed', err);
        })
        this.height = i + 1;
      });
    });
  }

  // Get block height
  getBlockHeight() {
    return this.height;
  }

  // get block
  getBlock(blockHeight) {
    // return object as a single string
    return db.get(blockHeight)
      .then(value => JSON.parse(value));
  }

  // validate block
  validateBlock(blockHeight) {
    // get block object
    return this.getBlock(blockHeight).then(block => {
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash === validBlockHash) {
        console.log('Block #' + blockHeight + ' is valid\n');
        return true;
      } else {
        console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
        return false;
      }
    });
  }

  // Validate blockchain
  validateChain() {
    let errorLog = [];
    let promises = [];
    for (var i = 0; i < this.getBlockHeight() - 1; i++) {
      // validate block
      promises.push(this.validateChainCore(i, errorLog));
    }

    Promise.all(promises).then(() => {
      if (errorLog.length > 0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: ' + errorLog);
      } else {
        console.log('No errors detected');
      }
    });
  }

  validateChainCore(i, errorLog) {
    return this.validateBlock(i).then(isValid => {
      if (!isValid) errorLog.push(i);
      // compare blocks hash link
      return this.getBlock(i).then(block => {
        let blockHash = block.hash;
        return this.getBlock(i + 1).then(nextBlock => {
          let previousHash = nextBlock.previousBlockHash;
          if (blockHash !== previousHash) {
            errorLog.push(i);
          }
        });
      });
    })
  }
}

// Due to its async properties, I run each command with a 100 ms interval between
function loop(i) {
  if (!i) {
    // Last run before it stops
    //setTimeout(() => console.log(blockchain), 100);
    //setTimeout(() => blockchain.validateBlock(2), 100);
    setTimeout(() => blockchain.validateChain(), 100);
    return;
  }

  setTimeout(() => {
    const block = new Block("Some data");
    blockchain.addBlock(block);
    loop(i - 1);
  }, 100);
}

// Run (add) 3 times
blockchain = new Blockchain()
loop(3);