const mongoose = require('mongoose');

const accessControl = new mongoose.Schema({
    token: 'string'
});

module.exports = mongoose.model('revoked_tokens', accessControl);