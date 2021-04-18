const express = require("express");
const router = express.Router();
const productModel = require('../models/Product');

router.get("/", (req, res) => {
  productModel.find({}, function(err, items) {
    res.render('home', {
      movies: items.filter(prod => {
        return prod.type == 'movie' && prod.feat == true;
      }),
      shows: items.filter(prod => {
        return prod.type == 'show' && prod.feat == true;
      })
    });  
  })
})

module.exports = router;