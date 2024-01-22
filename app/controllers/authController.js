const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('../db/models/users');
const accessControl = require('../db/models/revoked_tokens');
const success_function = require('../utils/response-handler').success_function;
const error_function = require('../utils/response-handler').error_function;

exports.login = async function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    try {
        let user = await users.findOne({ $and: [{ email: email }, { deleted: { $ne: true } }] });
        if (user) {
            bcrypt.compare(password, user.password, async (error, auth) => {
                if (auth === true) {
                    //valid credentials
                    let access_token = jwt.sign({ "id": user._id }, process.env.PRIVATE_KEY, { expiresIn: '10d' });
                    let response = success_function({ "status": 200, "data": access_token, "message": "Login successful" });
                    res.status(200).send(response);
                }
                else {
                    let response = error_function({ "status": 401, "message": "Invalid credentials" });
                    res.status(401).send(response);
                }
            });
        }
        else {
            let response = error_function({ "status": 401, "message": "Invalid credentials" });
            res.status(401).send(response);
        }
    }
    catch (error) {
        if (process.env.ENVIRONMENT == "production") {
            let response = error_function({ "status": 400, "message": error ? (error.message ? error.message : error) : "Something went wrong" });
            res.status(400).send(response);
        }
        else {
            let response = error_function({ "status": 400, "message": error });
            res.status(400).send(response);
        }
    }
}

exports.logout = function (req, res) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];

        if (token == null || token == "null" || token == "" || token == "undefined") {
            let response = error_function({ "status": 400, "message": "Invalid access token" });
            res.status(400).send(response);
        }
        else {
            accessControl.findOneAndUpdate({ token: token }, { token: token }, { upsert: true })
                .then((data) => {
                    let response = success_function({ "status": 200, "message": "Logout successful" });
                    res.status(200).send(response);
                }).catch((error) => {
                    let response = error_function({ "status": 400, "message": "Logout failed" });
                    res.status(400).send(response);
                })
        }
    }
    catch (error) {
        if (process.env.ENVIRONMENT == "production") {
            let response = error_function({ "status": 400, "message": error ? (error.message ? error.message : error) : "Something went wrong" });
            res.status(400).send(response);
        }
        else {
            let response = error_function({ "status": 400, "message": error });
            res.status(400).send(response);
        }
    }
}

exports.checkRevoked = function (data) {
    return new Promise(async (resolve, reject) => {
        try {
            let revoked = await accessControl.findOne({ token: data.token });
            if (revoked) resolve(true);
            resolve(false);
        }
        catch (error) {
            reject(error);
        }
    })
};