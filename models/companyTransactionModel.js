const mongoose = require('mongoose');

const CompanyTransactionSchema = new mongoose.Schema(
  {
    transactionId: String,
    date: Date,
    advance: Number,
    advanceCummulative: Number,
    grns: Number,
    grnsCummulative: Number,
    outstanding: Number,
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    company: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Company',
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

module.exports = mongoose.model('CompanyTransaction', CompanyTransactionSchema);
