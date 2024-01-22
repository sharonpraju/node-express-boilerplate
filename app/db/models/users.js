const mongoose = require('mongoose');
var mongoose_delete = require('mongoose-delete');

const users = new mongoose.Schema({
  name: 'string',
  phone: 'string',
  password: 'string',
  email: 'string',
  commission: 'number',
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'user_types' },
  added_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
},
  { timestamps: true })

users.plugin(mongoose_delete, { deletedAt: true });

module.exports = mongoose.model('users', users);