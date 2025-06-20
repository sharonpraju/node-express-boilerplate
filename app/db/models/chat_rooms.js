const mongoose = require('mongoose');
var mongoose_delete = require('mongoose-delete');

const chat_rooms = new mongoose.Schema({
  title: 'string', //optional
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  type: { type: 'string', enum: ['private', 'group'], default: 'private' },
  status: { type: 'string', enum: ['active', 'inactive'], default: 'active' },
  archived_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  last_active: { type: Date, default: Date.now },
  last_message: { type: mongoose.Schema.Types.ObjectId, ref: 'chat_messages' },
  added_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
},
  { timestamps: true })

chat_rooms.plugin(mongoose_delete, { deletedAt: true });

module.exports = mongoose.model('chat_rooms', chat_rooms);