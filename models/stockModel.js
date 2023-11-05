const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema(
  {
    total: Number,
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    session: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Stock', StockSchema);
