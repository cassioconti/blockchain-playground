const level = require('level');
const chainDB = './registerdata';
const db = level(chainDB);
const bitcoinMessage = require('bitcoinjs-message');

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

    validateSignature(walletAddress, messageSignature) {
        return db.get(walletAddress)
            .then(dbValueString => {
                const dbValue = JSON.parse(dbValueString);
                const response = {};
                const fiveMinutesInThePast = Date.now() - (5 * 60 * 1000);
                const isExpired = dbValue.requestTimeStamp < fiveMinutesInThePast;
                let isValid = false;
                if (isExpired) {
                    dbValue.validationWindow = 0;
                    dbValue.messageSignature = "5 minutes timeout expired";
                } else {
                    dbValue.validationWindow = Math.floor((dbValue.requestTimeStamp - fiveMinutesInThePast) / 1000); // In seconds
                    isValid = bitcoinMessage.verify(dbValue.message, walletAddress, messageSignature);
                    if (isValid) {
                        dbValue.messageSignature = "valid";
                    } else {
                        dbValue.messageSignature = "invalid signature";
                    }
                }

                db.put(walletAddress, JSON.stringify(dbValue));
                response.registerStar = !isExpired && isValid;
                response.status = dbValue;
                return response;
            });
    }

    isAuthorized(walletAddress) {
        return db.get(walletAddress)
            .then(dbValueString => {
                const dbValue = JSON.parse(dbValueString);
                const fiveMinutesInThePast = Date.now() - (5 * 60 * 1000);
                const isExpired = dbValue.requestTimeStamp < fiveMinutesInThePast;
                const isSignatureValidated = dbValue.messageSignature === 'valid';
                return !isExpired && isSignatureValidated;
            });
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