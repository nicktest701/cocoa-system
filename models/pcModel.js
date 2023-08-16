const mongoose = require('mongoose');

const PCSchema = new mongoose.Schema(
  {
    transactionId: String,

    profile: String,
    firstName: {
      type: String,
      lowercase: true,
    },
    lastName: {
      type: String,
      lowercase: true,
    },
    telephone: String,
    societyNo: String,

    society: {
      type: String,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PC', PCSchema);
