const mongoose = require('mongoose');
var mongoose_delete = require('mongoose-delete');

const users = new mongoose.Schema({
  name: 'string',
  phone: 'string',
  email: 'string',
  email_verified: { type: 'boolean', default: false },
  phone_verified: { type: 'boolean', default: false },
  secrets: {
    password: 'string',
    password_otp: { // This is used for password reset
      code: 'number',
      expires_at: 'date'
    },
    email_otp: { // This is used for email verification
      code: 'number',
      expires_at: 'date'
    },
    phone_otp: { // This is used for phone verification
      code: 'number',
      expires_at: 'date'
    },
  },
  last_active: 'date',
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'user_types' },
  status: { type: 'string', default: 'active', enum: ['active', 'blocked', 'inactive'] },
  added_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  deleted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
},
  { timestamps: true })

users.plugin(mongoose_delete, { deletedAt: true });

module.exports = mongoose.model('users', users);