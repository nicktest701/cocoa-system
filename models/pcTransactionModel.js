const mongoose = require("mongoose");

const PCTransactionSchema = new mongoose.Schema(
  {
    transactionId: String,
    date: Date,
    advance: Number,
    advanceCummulative: Number,
    delivered: Number,
    deliveredCummulative: Number,
    outstanding: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PCTransaction", PCTransactionSchema);
