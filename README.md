# Blockchain

## How to run

Install the dependencies with `npm install`

Run the web server with `npm start`

This project uses Express.js as the framework to serve the application.

### Development

You can run the webserver in development mode, which watch for file changes and reloads the app when necessary, by running `npm run nodemon`.

## Interact

### Get a block from the chain

There are three ways to get blocks from the chain:

1. By their height in the chain.
1. By their computed hash.
1. By the wallet address of the user who added the block.

#### Get a block from the chain by its height

`GET localhost:8000/block/<height>`

Where `<height>` is the position of the block in the chain, for instance: `GET localhost:8000/block/0` will retrieve the genesis block.

#### Get a block from the chain by its hash

`GET localhost:8000/stars/hash:<hash>`

Where `<hash>` is the computed SHA256 hash of the block in the chain, for instance: `GET localhost:8000/stars/hash:1234` will retrieve the block where the computed hash when the block was created is 1234.

#### Get blocks from the chain by their wallet addresses

`GET localhost:8000/stars/address:<address>`

Where `<address>` is the wallet address of the user who added the block in the chain, for instance: `GET localhost:8000/stars/address:5678` will retrieve a list of blocks whose the provided wallet address was 5678 when the blocks were created.

### Add a block to the chain

To add a block to the chain, it is required to first authenticate that the wallet address belongs to you. Adding a block is a three steps process:

1. Request validation
1. Validate signature
1. Add the block

#### Request validation

`POST localhost:8000/requestValidation` with a body:

```json
{
  "address": "myWalletAddress"
}
```

The parameter `address` is required and it is the wallet address of the user intending to post a block to the chain. The response of the server will contain the message that the user needs to sign with his/her address using his/her wallet management tool (like Electrum, etc.). The validation needs to happen within the time window of 5 minutes (300 seconds). Response example:

```json
{
    "address": "myWalletAddress",
    "requestTimeStamp": 1533388009410,
    "message": "myWalletAddress:1533388009410:starRegistry",
    "validationWindow": 300
}
```

#### Validate the signature

`POST localhost:8000/message-signature/validate` with a body:

```json
{
  "address": "myWalletAddress",
  "signature": "mySignedMessage"
}
```

The parameter `signature` is the message returned in the previous endpoint, signed with the walled address keys. More details on how to sign a message can be found [here](https://blog.brickblock.io/how-to-sign-a-transaction-using-the-electrum-wallet-3da2c8739839). The response will contain a reason saying if the validation was `valid`, `5 minutes timeout expired`, or `invalid signature`. The response will also show the remaining time in seconds for the `validationWindow` until the authorization expires:

```json
{
    "registerStar": true,
    "status": {
        "address": "myWalletAddress",
        "requestTimeStamp": 1533388009410,
        "message": "myWalledAddress:1533388009410:starRegistry",
        "validationWindow": 266,
        "messageSignature": "valid"
    }
}
```

#### Add the block

`POST localhost:8000/block` with a body:

```json
{
    "address": "myWalletAddress",
    "star": {
        "dec": "-26° 29' 24.9\"",
        "ra": "16h 29m 1.0s",
        "story": "Found star using https://www.google.com/sky/"
    }
}
```

The parameter `address` will be verified to check if the previous `validationWindow` is still vaid. If it is valid, the block will be added to the chain. The payload also requires the `star` to exist with the details and a `story`, which will be truncated to a maximum of 500 bytes. The response will contain the encoded and decode versions of the story, but only the encoded version is stored in the block.

```json
{
    "hash": "5678",
    "height": 5,
    "body": {
        "address": "myWalletAddress",
        "star": {
            "dec": "-26° 29' 24.9\"",
            "ra": "16h 29m 1.0s",
            "story": "756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1533388061",
    "previousBlockHash": "1234"
}
```

## Verify

Validate the whole chain and (optional) print all blocks with `npm run validate`. Please check the end of the `blockchain-test.js` file.