// Models
const userModel = require('../models/User');
const productModel = require('../models/Product');
const orderModel = require('../models/Order');

// Authentication
const authentication = require('../middleware/authentication');
const bcrypt = require('bcrypt');

// Register email
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// To delete images when new one uploaded or when product deleted

module.exports = {

  // ***** LOGIN ***** //

  // GET /login
  getLogin : function(req, res) {
    res.render('login');
  },

  // POST /login
  postLogin : function(req, res) {
    // Basic form error checking
    let errors = {
      cnt: 0,
      email: '',
      password: '',
      validation: ''
    };
    if (req.body.email.trim() === '' || !(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/).test(req.body.email.trim())) {
      errors.email = 'is-invalid';
      errors.cnt++;
    } else {
      errors.email = 'is-valid';
    }
    if (req.body.password.trim() === '') {
      errors.password = 'is-invalid';
      errors.cnt++;
    }
    // If no basic syntax errors
    if (errors.cnt == 0) {
      userModel.findOne({email: req.body.email}, function(err, user) {
        if (err) { console.log(err); }
        // User does not exist.
        if (user == null) {
          errors = {};
          errors.nullEmail = 'No user with the email / password combination exists. Please enter the correct information.';
          res.render('login', {
            error: errors,
            email: req.body.email
          });
        // User exists. Check if password correct
        } else {
          bcrypt.compare(req.body.password, user.password, function(err, result) {
            // Password matches, check if admin or user
            if (result && !user.admin) {
              req.session.user = user;
              req.session.cart = {
                id: 0,
                items: [],
                total: 0
              };
              req.session.cart.id = req.session.user._id;
              res.redirect('/user/dashboard');
            }
            else if (result && user.admin) {
              req.session.user = user;
              res.redirect('/user/admin');
            }
            // Password does not match
            else {
              errors = {};
              errors.nullEmail = 'No user with the email / password combination exists. Please enter the correct information.';
              res.render('login', {
                error: errors,
                email: req.body.email
              });
            }
          });
        }
      })      
    } 
    else {
      res.render('login', {
        error: errors,
        email: req.body.email 
      });
    }
  },

  // ***** REGISTER ***** //

  // GET /register
  getRegister : function (req, res) {
    res.render('register');
  },

  // POST /register
  postRegister : function (req, res) {
    let errors = {
      cnt: 0,
      firstName: '',
      lastName: '',
      email: '',
      emailMsg: '',
      password: ''
    };
    if (req.body.firstName.trim() === '') {
      errors.firstName = 'is-invalid';
      errors.cnt++;
    } else {
      errors.firstName = 'is-valid';
    }
    if (req.body.lastName.trim() === '') {
      errors.lastName = 'is-invalid';
      errors.cnt++;
    } else {
      errors.lastName = 'is-valid';
    }
    if (req.body.email.trim() === '' || !(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/).test(req.body.email.trim())) {
      errors.email = 'is-invalid';
      errors.emailMsg = 'Please enter a valid email address';
      errors.cnt++;
    } else {
      errors.email = 'is-valid';
    }
    if (req.body.password.trim() === '' || !(/(?=.*[0-9])(?=.*[A-Z])(?=.{5,})/).test(req.body.password.trim())) {
      errors.password = 'is-invalid';
      errors.cnt++;
    }
    // If no errors, go to dashboard page, else go back to register page with errors.
    if (errors.cnt == 0) {
// const msg = {
      //   to: req.body.email, // Change to your recipient
      //   from: 'derekshigetomi.dgs@gmail.com', // Change to your verified sender
      //   subject: 'Welcome to movee!',
      //   text: 'Check out our huge library of movies and shows.',
      //   html: `Hi ${req.body.firstName}!<br><p>Thank you for signing up for movee. You now have access to <strong>thousands</strong> of popular movies and shows 
      //   at your fingertips. Visit our website and start watching now!</p><p>From the movee team</p>`,
      // }
      // sgMail
      //   .send(msg)
      //   .then(() => {
      //     console.log('Email sent')
      //   })
      //   .catch((error) => {
      //     console.error(error)
      //   })
      const user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
      };
      const userRegister = new userModel(user);
      userModel.findOne({email: req.body.email}, function(err, person) {
        if (err) {
          console.log(err);
        }
        // If email not in database, save. Else, throw error.
        if (person == null) {
          userRegister.save().catch(err => { console.log(err); })
          res.redirect('/user/login');
        } 
        else {
          res.render('register', {
            error: {email: "is-invalid", emailMsg: 'This email is already in use.'},
            email: req.body.email,
            first: req.body.firstName,
            last: req.body.lastName
          });
        }
      })  
    } else {
      res.render('register', {
        error: errors,
        email: req.body.email,
        first: req.body.firstName,
        last: req.body.lastName
      });
    }    
  },

  // ***** LOGOUT ***** //

  // GET /logout
  getLogout : function (req, res) {
    req.session.destroy();
    res.redirect('/user/login');
  },

  // ***** USER DASHBOARD ***** //

  getUserDashboard : function (req, res) {
    res.render('dashboard', {
      cart: req.session.cart
    });
  },

  // ***** USER ADD TO CART ***** //  

  addToCart : function (req, res) {
    productModel.findOne({_id: req.params.id}, function(err, prod) {
      let success = 'notAdded';
      let message = 'Sorry, that item is already in your cart';
      // Only add to cart if not already in cart
      if (!req.session.cart.items.find(movie => movie._id == req.params.id)) {
        req.session.cart.items.push(prod);
        message = 'Item added to cart!';
        success = 'added';
        req.session.cart.total += parseFloat(req.params.price);
        req.session.cart.total = Math.round(req.session.cart.total * 100) / 100;
        for (let i = 0; i < req.session.cart.items.length; i++) {
          if (req.session.cart.items[i]._id == req.params.id) {
            req.session.cart.items[i].year = req.params.price;
          }
        }
      }
      req.session.success = success;
      req.session.message = message;
      res.redirect('/user/dashboard');
      //res.redirect(`/${req.params.type}/${req.params.id}`);
    })
  },

  // ***** USER REMOVE FROM CART ***** //

  removeFromCart : function (req, res) {
    for (let i = 0; i < req.session.cart.items.length; i++) {
      if (req.session.cart.items[i]._id == req.params.id) {
        req.session.cart.total -= parseFloat(req.session.cart.items[i].year);
        req.session.cart.total = Math.round(req.session.cart.total * 100) / 100;
        req.session.cart.items.splice(i, 1);
      }
    }
    res.redirect('/user/dashboard');
  },

  // ***** USER CHECKOUT ***** //  

  checkout : function (req, res) {
    let products = [];
    let temp = {};
    for (let i = 0; i < req.session.cart.items.length; i++) {
      temp = {};
      temp.id = req.session.cart.items[i]._id;
      temp.price = req.session.cart.items[i].year;
      products.push(temp);
    }
    let order = {
      id: req.session.user._id,
      product: products
    }
    const orderRegister = new orderModel(order);
    orderRegister.save().catch(err => {console.log(err);})
    let receipt = [];
    let tempss = {};
    for (let i = 0; i < req.session.cart.items.length; i++) {
      tempss = {};
      tempss.id = req.session.cart.items[i].title;
      tempss.price = req.session.cart.items[i].year;
      receipt.push(tempss);
    }
    let message = '';
    for (let j = 0; j < receipt.length; j++) {
      message += receipt[j].id + ': ' + receipt[j].price + '<br>';
    }
    message += 'Total: ' + req.session.cart.total + '<br>';
    message += 'Thank you again for using movee!';
    const msg = {
      to: req.session.user.email, // Change to your recipient
      from: 'derekshigetomi.dgs@gmail.com', // Change to your verified sender
      subject: 'Thank you for your movee pruchase!',
      html: `Hi ${req.session.user.firstName}!<br><br>
      <p>Here is your recipt for today's purchase from movee</p><br>
      ${message}
      `,
    }
    sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    }) 



    delete req.session.cart;
    req.session.cart = {
      id: 0,
      items: [],
      total: 0
    };
    req.session.cart.id = req.session.user._id;   
    res.redirect('/user/admin')
  },    

  // ***** ADMIN DASHBOARD ***** //

  getAdminDashboard : function (req, res) {
    productModel.find({}, function(err, prods) {
      res.render('admin', {
        products: prods
      });
    })
  },
  
  // ***** DELETE PRODUCT ***** //

  deleteProduct : function (req, res) {
    productModel.findOneAndDelete({_id: req.params.id}, function(err, prod) {
      res.redirect('/user/admin');
    })
  },

  // ***** ADD PRODUCT ***** //

  addProductForm : function (req, res) {
    res.render('addForm');
  },
  
  addProduct : function (req, res) {
    let errors = authentication.addUpdateAuth(req, true);
    // No errors. Add product to database. Also move uploaded files to assets folder.
    if (errors.cnt == 0) {
      let banner = (Object.keys(req.files).length == 2) ? '/assets/desc-banners/' + req.session.user._id + req.files['imageBig'].name : '';
      let prod = {
        type: req.body.type,
        title: req.body.title,
        year: parseInt(req.body.year, 10),
        run: req.body.run,
        rating: req.body.rating,
        genre: req.body.genre.split(','),
        desc: req.body.desc,
        rent: parseFloat(req.body.rent),
        buy: parseFloat(req.body.buy),
        feat: req.body.featured == 'on',
        imgS: '/assets/product-images/' + req.session.user._id + req.files['imageSmall'].name,
        imgB: banner
      }
      const addProduct = new productModel(prod);
      addProduct.save().catch(err => { console.log(err); });
      req.files['imageSmall'].mv('public/assets/product-images/' + req.session.user._id + req.files['imageSmall'].name);
      if (Object.keys(req.files).length == 2) {
        req.files['imageBig'].mv('public/' + banner);
      }
      res.redirect('/user/admin');
    } else {
      res.render('addForm', {
        error: errors,
        title: req.body.title,
        year: req.body.year,
        run: req.body.run,
        rating: req.body.rating,
        checked: req.body.type,
        genre: req.body.genre,
        rent: req.body.rent,
        buy: req.body.buy,
        desc: req.body.desc
      });
    }
  },
  
  // GET update form
  updateProductForm : function(req, res) {
    productModel.findOne({_id: req.params.id}, function(err, prod) {
      res.render('updateform', {
        id: req.params.id,        
        type: prod.type,
        title: prod.title,
        year: prod.year,
        run: prod.run,
        rating: prod.rating,
        genre: prod.genre,
        desc: prod.desc,
        rent: prod.rent,
        buy: prod.buy,
        feat: prod.feat,
        imgS: prod.imgS,
        imgB: prod.imgB
      })
    })
  },

  // PUT update form
  updateProduct : function(req, res) {
    let errors = authentication.addUpdateAuth(req, false);
    let imageS = '';
    let imageB = '';    
    if (errors.cnt == 0) {
      if (req.files) {
        let images = Object.keys(req.files);
        for (let i = 0; i < images.length; i++) {
          if (images[i] == 'imageSmall') {
            req.files['imageSmall'].mv('public/assets/product-images/' + req.session.user._id + req.files['imageSmall'].name);
            imageS = '/assets/product-images/' + req.session.user._id + req.files['imageSmall'].name;
          }
          else if (images[i] == 'imageBig') {
            req.files['imageBig'].mv('public/assets/desc-banners/' + req.session.user._id + req.files['imageBig'].name);
            imageB = '/assets/desc-banners/' + req.session.user._id + req.files['imageBig'].name;
          }
        }
      }
      let prod = {
        title: req.body.title,
        year: parseInt(req.body.year, 10),
        type: req.body.type,
        run: req.body.run,
        rating: req.body.rating,
        genre: req.body.genre.split(','),
        rent: parseFloat(req.body.rent),
        buy: parseFloat(req.body.buy),
        desc: req.body.desc,
        feat: req.body.featured == 'on',
        imgS: (imageS == '') ? req.body.imgS : imageS,
        imgB: (imageB == '') ? req.body.imgB : imageB
      }
      productModel.findOneAndUpdate({_id: req.params.id}, prod, function(err, prods) {
        res.redirect('/user/admin');
      })
    }
    else {
      res.render('updateform', {
        id: req.params.id,
        error: errors,
        title: req.body.title,
        year: req.body.year,
        run: req.body.run,
        rating: req.body.rating,
        checked: req.body.type,
        genre: req.body.genre,
        rent: req.body.rent,
        buy: req.body.buy,
        feat: req.body.featured == 'on',
        desc: req.body.desc,
        type: req.body.type,
        imgS: (imageS == '') ? req.body.imgS : imageS,
        imgB: (imageB == '') ? req.body.imgB : imageB
      });
    }
  }  

}