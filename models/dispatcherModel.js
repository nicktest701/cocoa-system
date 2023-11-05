const mongoose = require("mongoose");

const DispatcherSchema = new mongoose.Schema(
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
    transporter: {
      type: String,
      lowercase: true,
    },
    user:{
      type:mongoose.SchemaTypes.ObjectId,
      ref:'User'
    },
    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Dispatcher", DispatcherSchema);
