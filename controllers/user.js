const express = require("express");
const router = express.Router();
const authentication = require('../middleware/authentication');
const userService = require('../services/userService');

// ***** LOGIN ***** //

router.get('/login', userService.getLogin);

router.post('/login', userService.postLogin);

// ***** REGISTER ***** //

router.get('/register', userService.getRegister);

router.post('/register', userService.postRegister);

// ***** LOGOUT ***** //

router.get('/logout', userService.getLogout);

// ***** USER DASHBOARD ***** //

router.get('/dashboard', authentication.isLoggedIn, userService.getUserDashboard);

// ***** ADMIN DASHBOARD ***** //

router.get('/admin', authentication.isLoggedIn, authentication.isAdmin, userService.getAdminDashboard);

// ***** DELETE PRODUCT ***** //

router.delete('/delete/:id', authentication.isLoggedIn, authentication.isAdmin, userService.deleteProduct);

// ***** ADD PRODUCT ***** //

router.get('/add', authentication.isLoggedIn, authentication.isAdmin, userService.addProductForm);

router.post('/add', authentication.isLoggedIn, authentication.isAdmin, userService.addProduct);

// ***** UPDATE PRODUCT ***** //

router.get('/update/:id', authentication.isLoggedIn, authentication.isAdmin, userService.updateProductForm);

router.put('/update/:id', authentication.isLoggedIn, authentication.isAdmin, userService.updateProduct);

// ***** USER ADD TO CART ***** //

router.post('/addCart/:type/:price/:id', authentication.isLoggedIn, userService.addToCart);

// ***** USER REMOVE FROM CART ***** //

router.delete('/removeFromCart/:id', authentication.isLoggedIn, userService.removeFromCart);

// ***** USER CHECKOUT ***** //

router.post('/checkout', authentication.isLoggedIn, userService.checkout);

module.exports = router;