const mongoose = require("mongoose");

const CompanyTransactionSchema = new mongoose.Schema(
  {
    transactionId: String,
    date: Date,
    advance: Number,
    advanceCummulative: Number,
    grns: Number,
    grnsCummulative: Number,
    outstanding: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CompanyTransaction", CompanyTransactionSchema);
