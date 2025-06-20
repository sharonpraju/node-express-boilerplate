const mongoose = require('mongoose');
var mongoose_delete = require('mongoose-delete');

const chat_messages = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: "chat_rooms", required: true },
  source: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  message: 'string',
  attachment: {
    name: 'string',
    path: 'string',
    mime_type: 'string',
    size: 'number'
  },
  seen_by: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  timestamp: { type: Date, default: Date.now },
},
  { timestamps: true })

chat_messages.plugin(mongoose_delete, { deletedAt: true });

module.exports = mongoose.model('chat_messages', chat_messages);