const mongoose = require('mongoose');
var mongoose_delete = require('mongoose-delete');

const user_types = new mongoose.Schema({
  title: { type: 'string', required: true, unique: true },
  type_id: { type: 'number', required: true, unique: true },
  added_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
},
  { timestamps: true })

user_types.plugin(mongoose_delete, { deletedAt: true });

module.exports = mongoose.model('user_types', user_types);