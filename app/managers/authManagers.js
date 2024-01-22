const accessControl = require('../db/models/revoked_tokens');

exports.checkRevoked = function (data) {
    return new Promise(async(resolve, reject) => {
        try {
            let revoked = await accessControl.findOne({ token: data?.token });
            if (revoked) resolve(true);
            resolve(false);
        }
        catch (error) {
            reject(error);
        }
    });
};