const express = require("express");
const router = express.Router();
const productModel = require('../models/Product');

// All movies and shows page
router.get('/', (req, res) => {
  productModel.find({}, function(err, items) {
    res.render('allProducts', {
      products: items,
      header: 'All Movies and Shows'
    });  
  })
})

module.exports = router;