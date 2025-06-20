const users = require('../db/models/users');
var mongoose = require('mongoose');

exports.fetchUser = function (user_data) {
    return new Promise(async (resolve, reject) => {
        try {
            if (user_data) {
                let user = await users.findOne({ $and: [{ _id: new mongoose.Types.ObjectId(user_data?.id) }, { deleted: { $ne: true } }] }, '-secrets')
                    .populate('type')
                    .populate({
                        path: 'added_by', select: '_id name type',
                        populate: { path: 'type', select: '_id title' }
                    });
                resolve(user);
            }
            else reject(null);
        }
        catch (error) {
            reject(error);
        }
    });
};