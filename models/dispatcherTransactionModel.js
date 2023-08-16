const mongoose = require("mongoose");

const DispatcherTransactionSchema = new mongoose.Schema(
  {
    transactionId: String,
    date: Date,
    advance: Number,
    closingStock: Number,
    quantity: Number,
    cummulative: Number,
    outstanding: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "DispatcherTransaction",
  DispatcherTransactionSchema
);
