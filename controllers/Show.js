const express = require("express");
const router = express.Router();
const productModel = require('../models/Product');

// All shows
router.get('/', (req, res) => {
  productModel.find({type: 'show'}, function(err, items) {
    res.render('allProducts', {
      products: items,
      header: 'All Shows'
    });  
  })
})

// Single show
router.get('/:id', (req, res) => {
  productModel.findOne({_id: req.params.id}, function(err, item) {
    if (item == null) {
      res.render('404');
    } else {
      res.render('desc',{
        products: item
      });
    }
  })
})

module.exports = router;