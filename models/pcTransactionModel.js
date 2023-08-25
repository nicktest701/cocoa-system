const mongoose = require('mongoose');

const PCTransactionSchema = new mongoose.Schema(
  {
    transactionId: String,
    date: Date,
    advance: Number,
    advanceCummulative: Number,
    delivered: Number,
    deliveredCummulative: Number,
    outstanding: Number,
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    pc: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'PC',
    },
  },
  {
    timestamps: true,
    virtuals: {
      month: {
        get() {
          const date = new Date(this.date);
          return date.toLocaleString('default', { month: 'long' });
        },
      },
      year: {
        get() {
          const date = new Date(this.date);
          return date.getFullYear();
        },
      },
    },
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

module.exports = mongoose.model('PCTransaction', PCTransactionSchema);
