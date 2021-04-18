const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id : {
    type: String,
    required: true
  },
  product: {
    type: Array,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now()
  }
});

const orderModel = mongoose.model('Order', orderSchema);

module.exports = orderModel;