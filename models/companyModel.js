const db=require('../configurations/db')
const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    transactionId: String,
    companyName: String,
    telephone: String,
    address: {
      type: String,
      lowercase: true,
    },
    user:{
      type:mongoose.SchemaTypes.ObjectId,
      ref:'User'
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", CompanySchema);
