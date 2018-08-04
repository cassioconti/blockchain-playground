const StarRegisterValidation = require('./star-register-validation');

StarRegisterValidation.getInstance().printAll();

const myString = "This is my string to be encoded/decoded";
const encoded = new Buffer(myString).toString('hex'); // encoded === 54686973206973206d7920737472696e6720746f20626520656e636f6465642f6465636f646564
const decoded = new Buffer(encoded, 'hex').toString(); // decoded === "This is my string to be encoded/decoded"
console.log('encoded', encoded);
console.log('decoded', decoded);