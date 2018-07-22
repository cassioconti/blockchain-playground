# Blockchain

## How to run

Install the dependencies with `npm install`

Run the web server with `npm start`

## Interact

1. Get a block from the chain `GET localhost:8000/block/<height>`

Where `<height>` is the position of the block in the chain, for instance: `GET localhost:8000/block/0` will retrieve the genesis block.

2. Add a block to the chain `POST localhost:8000/block` with a body:

```json
{
  "data": "My block message"
}
```

The parameter `data` needs to be specified in the body. The message can be any string.

## Verify

Validate the whole chain and print all blocks with `npm run validate`

Please check the end of the `simpleChain.js` file to see how data can be manually added skipping the web server.
