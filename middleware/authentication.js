module.exports = {

  // Checks if user logged in.  If yes, proceed. If not, redirect to login.
  isLoggedIn : function (req, res, next) {
    if (req.session.user) {
      next();
    } 
    else {
      res.redirect('/user/login');
    }
  },

  // Checks if user is admin. If yes, redirect to admin dashboard, else user dashboard
  isAdmin : function (req, res, next) {
    if (req.session.user.admin) {
      next();
    } 
    else {
      res.redirect('dashboard');
    }
  },

  // Basic syntax check for login form. Email is in email format and not null. Password is not null.
  loginErrors : function (req) {
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
    return errors;
  },

  // Checks if user exists. If yes, redirect to either user or admin dashboard. Else, render login page with errors.
  userAuthentication : function (req, res) {
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
  },

  // Register form syntax errors. Example: Null fields, invaid email syntax.
  registerErrors : function (req) {
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
    return errors;    
  },

  // Checks if email already in database. If not, save to database and redirect to login. Else, throw error.
  registerAuthentication : function (req, res) {
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
  },

  // Checks if value is number
  isNumeric: function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  },

  // Add / Update Form Authentication
  addUpdateAuth : function (req, picture) {
    let errors = {
      cnt: 0
    }
    if (req.body.title == '') {
      errors.cnt++;
      errors.title = 'is-invalid';
    }
    else {
      errors.title = 'is-valid';
    }
    if (req.body.year == '' || !this.isNumeric(req.body.year)) {
      errors.cnt++;
      errors.year = 'is-invalid';
    }
    else {
      errors.year = 'is-valid';
    }
    if (req.body.run == '') {
      errors.cnt++;
      errors.run = 'is-invalid';
    }
    else {
      errors.run = 'is-valid';
    }
    if (req.body.rating == '') {
      errors.cnt++;
      errors.rating = 'is-invalid';
    }
    else {
      errors.rating = 'is-valid';
    }
    if (req.body.genre == '') {
      errors.cnt++;
      errors.genre = 'is-invalid';
    }
    else {
      errors.genre = 'is-valid';
    }
    if (req.body.rent == '' || !this.isNumeric(req.body.rent)) {
      errors.cnt++;
      errors.rent = 'is-invalid';
    }
    else {
      errors.rent = 'is-valid';
    }
    if (req.body.buy == '' || !this.isNumeric(req.body.buy)) {
      errors.cnt++;
      errors.buy = 'is-invalid';
    }
    else {
      errors.buy = 'is-valid';
    }
    if (req.body.desc == '') {
      errors.cnt++;
      errors.desc = 'is-invalid';
    }
    else {
      errors.desc = 'is-valid';
    }
    // if (picture) {
    //   if (req.files) {
    //     let images = Object.keys(req.files);
    //     if (images[0] != 'imageSmall') {
    //       errors.cnt++;
    //       errors.imageSmall = 'is-invalid';
    //     }
    //     for (let i = 0; i < images.length; i++) {
    //       if (req.files[images[i]] && req.files[images[i]].mimetype.slice(0, 5) != 'image') {
    //         errors.cnt++;
    //         errors[images[i]] = 'is-invalid';
    //       }
    //     }
    //   } 
    //   else {
    //     errors.cnt++;
    //     errors.imageSmall = 'is-invalid';
    //   }
    // }

    if (req.files) {
      let images = Object.keys(req.files);
      if (picture && images[0] != 'imageSmall') {
        errors.cnt++;
        errors.imageSmall = 'is-invalid';
      }
      for (let i = 0; i < images.length; i++) {
        if (req.files[images[i]] && req.files[images[i]].mimetype.slice(0, 5) != 'image') {
          errors.cnt++;
          errors[images[i]] = 'is-invalid';
        }
      }
    } 
    else {
      if (picture) {
        errors.cnt++;
        errors.imageSmall = 'is-invalid';
      }
    }
  
    return errors;
  }
  
}