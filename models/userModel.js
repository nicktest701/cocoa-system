const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    profile: String,
    firstName: {
      type: String,
      lowercase: true,
    },
    lastName: {
      type: String,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    phone: String,

    password: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.statics.findByUsername = function (username) {
  return this.find({ username });
};

module.exports = mongoose.model('User', UserSchema);
