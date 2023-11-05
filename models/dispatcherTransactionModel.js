const mongoose = require('mongoose');

const DispatcherTransactionSchema = new mongoose.Schema(
  {
    transactionId: String,
    date: Date,
    advance: Number,
    closingStock: Number,
    sdw: String,
    quantity: Number,
    cummulative: Number,
    outstanding: Number,
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    dispatcher: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Dispatcher',
    },
    session: Number,
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

module.exports = mongoose.model(
  'DispatcherTransaction',
  DispatcherTransactionSchema
);
