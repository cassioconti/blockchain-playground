const level = require('level');
const chainDB = './registerdata';
const db = level(chainDB);

class StarRegisterValidation {
    static getInstance() {
        if (!StarRegisterValidation.instance) {
            StarRegisterValidation.instance = new StarRegisterValidation();
        }

        return StarRegisterValidation.instance;
    }

    requestValidation(walletAddress) {
        const timestamp = Date.now();
        const dbValue = {
            address: walletAddress,
            requestTimeStamp: timestamp,
            message: `${walletAddress}:${timestamp}:starRegistry`,
            validationWindow: 300
        };

        return db.put(walletAddress, JSON.stringify(dbValue))
            .then(() => dbValue);
    }

    printAll() {
        db.createReadStream()
            .on('data', function (data) {
                console.log(data.key, '=', data.value);
            })
            .on('error', function (err) {
                console.log('Oh my!', err);
            })
            .on('close', function () {
                console.log('Stream closed');
            })
            .on('end', function () {
                console.log('Stream ended');
            });
    }
}

module.exports = StarRegisterValidation;