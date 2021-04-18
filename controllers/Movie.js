const express = require("express");
const router = express.Router();
const productModel = require('../models/Product');

// All movies
router.get('/', (req, res) => {
  productModel.find({type: 'movie'}, function(err, items) {
    res.render('allProducts', {
      products: items,
      header: 'All Movies'
    });  
  })
})

// Single movie
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