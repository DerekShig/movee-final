const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  type : {
    type: String,
    required: true
  },
  title : {
    type: String,
    required: true
  },
  year : {
    type: Number,
    required: true
  },
  run : {
    type: String,
    required: true
  },
  rating : {
    type: String,
    required: true
  },
  genre : {
    type: Array,
    required: true
  },
  desc : {
    type: String,
    required: true
  },
  rent : {
    type: Number,
    required: true
  },
  buy : {
    type: Number,
    required: true
  },
  feat : {
    type: Boolean,
    required: true
  },
  imgS : {
    type: String,
    required: true
  },
  imgB : {
    type: String,
    required: false
  },
});

const productModel = mongoose.model('Product', productSchema);

module.exports = productModel;