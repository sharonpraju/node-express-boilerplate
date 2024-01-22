const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const users = require('../db/models/users');
const user_types = require('../db/models/user_types');
const userManagers = require('../managers/userManagers');
const success_function = require('../utils/response-handler').success_function;
const error_function = require('../utils/response-handler').error_function;

exports.fetchUser = async function (req, res) {
    try {
        let id = req.params.id;
        let user = await userManagers.fetchUser({id: id});
        if (user) {
            let response = success_function({ "status": 200, data: user });
            res.status(200).send(response);
        }
        else {
            let response = error_function({ "status": 404, "message": "User not found" });
            res.status(404).send(response);
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

exports.fetchUsers = async function (req, res) {
    try {
        let page = req.query.page;
        let limit = req.query.limit;
        let keyword = req.query.keyword;

        let filters = [{ deleted: { $ne: true } }];

        if (keyword) filters.push({ title: new RegExp(keyword, 'i') });

        let user_array = await users.find(filters.length > 0 ? { $and: filters } : null, '-password')
            .populate('type')
            .populate({
                path: 'added_by', select: '_id name phone email type',
                populate: { path: 'type', select: '_id title' }
            })
            .skip((page - 1) * limit).limit(limit);
        let count = await users.count(filters.length > 0 ? { $and: filters } : null, '-password');
        let users_data = {
            count: count,
            users: user_array
        }
        let response = success_function({ "status": 200, data: users_data });
        res.status(200).send(response);
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

exports.fetchProfile = async function (req, res) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        let decoded = jwt.decode(token);
        let user = await userManagers.fetchUser({id: decoded.id});
        if (user) {
            let response = success_function({ "status": 200, data: user });
            res.status(200).send(response);
        }
        else {
            let response = error_function({ "status": 404, "message": "User not found" });
            res.status(404).send(response);
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

exports.addUser = async function (req, res) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        let name = req.body.name;
        let email = req.body.email;
        let phone = req.body.phone;
        let password = req.body.password;
        let type = req.body.type;

        //checking if user email already exist
        let user_count = await users.count({ $and: [{ $or: [{ email: email }, { phone: phone }] }, { deleted: { $ne: true } }] });
        if (!user_count) {
            let decoded = jwt.decode(token);
            let salt = bcrypt.genSaltSync(10);
            let password_hash = bcrypt.hashSync(password, salt);
            let user = users({
                name: name,
                email: email,
                phone: phone,
                password: password_hash,
                type: type,
                added_by: decoded.id
            });
            await user.save();
            let response = success_function({ "status": 200, "message": "User added" });
            res.status(200).send(response);
        }
        else {
            let response = error_function({ "status": 403, "message": "User already exist" });
            res.status(400).send(response);
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

exports.updateUser = async function (req, res) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];

        let id = req.params.id;
        let name = req.body.name;
        let email = req.body.email;
        let phone = req.body.phone;
        let password = req.body.password;
        let type = req.body.type;

        //checking if email already exist
        let user_count = await users.count({ $and: [{ $or: [{ email: email }, { phone: phone }] }, { _id: { $ne: id } }, { deleted: { $ne: true } }] });
        if (!user_count) {
            let decoded = jwt.decode(token);
            let salt = bcrypt.genSaltSync(10);
            let password_hash = bcrypt.hashSync(password, salt);

            let user_data = {
                id: id,
                name: name,
                email: email,
                phone: phone,
                password: password_hash,
                type: type,
                updated_by: decoded.id
            };

            let data = await users.updateOne({ _id: id }, { $set: user_data });
            if (data.matchedCount === 1 && data.modifiedCount == 1) {
                let response = success_function({ "status": 200, "message": "User updated" });
                res.status(200).send(response);
            }
            else if (data.matchedCount === 0) {
                let response = error_function({ "status": 404, "message": "User not found" });
                res.status(404).send(response);
            }
            else {
                let response = error_function({ "status": 400, "message": "User updating failed" });
                res.status(400).send(response);
            }
        }
        else {
            let response = error_function({ "status": 403, "message": "User already exist" });
            res.status(400).send(response);
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

exports.deleteUser = async function (req, res) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        let decoded = jwt.decode(token);
        let id = req.params.id;
        await users.deleteById(id);
        let data = await users.updateOne({ _id: id }, { $set: { deleted_by: decoded.id } });
        if (data.matchedCount === 1 && data.modifiedCount == 1) {
            let response = success_function({ "status": 200, "message": "User deleted" });
            res.status(200).send(response);
        }
        else if (data.matchedCount === 0) {
            let response = error_function({ "status": 404, "message": "User not found" });
            res.status(404).send(response);
        }
        else {
            let response = error_function({ "status": 400, "message": "User deleting failed" });
            res.status(400).send(response);
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

exports.fetchType = async function (req, res) {
    try {
        let id = req.params.id;
        let type = await user_types.findOne({ $and: [{ _id: id }, { deleted: { $ne: true } }] });
        if (type) {
            let response = success_function({ "status": 200, data: type });
            res.status(200).send(response);
        }
        else {
            let response = error_function({ "status": 404, "message": "Type not found" });
            res.status(404).send(response);
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

exports.fetchTypes = async function (req, res) {
    try {
        let page = req.query.page;
        let limit = req.query.limit;
        let types_array = await user_types.find({ deleted: { $ne: true } }).skip((page - 1) * limit).limit(limit);
        let response = success_function({ "status": 200, data: types_array });
        res.status(200).send(response);
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

exports.addType = async function (req, res) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        let title = req.body.title;
        let type_id = req.body.type_id;

        //checking if user type already exist
        let types_count = await user_types.count({ $or: [{ title: title }, { type_id: type_id }] });
        if (!types_count) {
            let decoded = jwt.decode(token);

            let type = user_types({
                title: title,
                type_id: type_id,
                added_by: decoded.id
            });
            await type.save();

            let response = success_function({ "status": 200, "message": "Type added" });
            res.status(200).send(response);
        }
        else {
            let response = error_function({ "status": 403, "message": "Type already exist" });
            res.status(400).send(response);
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

exports.updateType = async function (req, res) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        let id = req.params.id;
        let title = req.body.title;
        let type_id = req.body.type_id;

        //checking if user type already exist
        let type_count = await user_types.count({ $and: [{ $or: [{ title: title }, { type_id: type_id }] }, { _id: { $ne: id } }] });
        if (!type_count) {
            let decoded = jwt.decode(token);

            let type_data = {
                title: title,
                type_id: type_id,
                updated_by: decoded.id
            };

            await user_types.updateOne({ _id: id }, { $set: type_data });
            if (data.matchedCount === 1 && data.modifiedCount == 1) {
                let response = success_function({ "status": 200, "message": "Type updated" });
                res.status(200).send(response);
            }
            else if (data.matchedCount === 0) {
                let response = error_function({ "status": 404, "message": "Type not found" });
                res.status(404).send(response);
            }
            else {
                let response = error_function({ "status": 400, "message": "Type updating failed" });
                res.status(400).send(response);
            }
        }
        else {
            let response = error_function({ "status": 403, "message": "Type already exist" });
            res.status(400).send(response);
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

exports.deleteType = async function (req, res) {
    try {
        let id = req.params.id;
        await user_types.deleteById(id);
        let response = success_function({ "status": 200, "message": "Type deleted" });
        res.status(200).send(response);
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
