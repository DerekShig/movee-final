const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  dateRegistered: {
    type: Date,
    default: Date.now()
  },
  admin: {
    type: Boolean,
    default: false
  }
});

// Encrypt password when inserting new user to database
userSchema.pre('save', function(next) {
  bcrypt.genSalt(10)
  .then(salt => {
    bcrypt.hash(this.password, salt)
    .then(hashPass => {
      this.password = hashPass;
      next();
    })
  })
})

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;