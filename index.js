const express = require('express');
const app = express();
var methodOverride = require('method-override');
app.use(methodOverride('_method'));
const mongoose = require('mongoose');
var flash = require('express-flash-messages')
app.use(flash())

var exphbs = require('express-handlebars');
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
var bodyParser = require('body-parser');
const session = require('express-session');
 
const fileUpload = require('express-fileupload');
app.use(fileUpload());

require('dotenv').config({ path: './config/keys.env' });

const isEqualHelperHandlerbar = function(a, b, opts) {
  if (a == b) {
      return opts.fn(this) 
  } else { 
      return opts.inverse(this) 
  } 
}

// Handlebars
app.engine('handlebars', exphbs({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers : {
    ifEq : isEqualHelperHandlerbar
}
}));
app.set('view engine', 'handlebars');

// Static files
app.use(express.static('public'));

// Body Parser
app.use(express.urlencoded({ extended: false }));

// Session
app.use(session({
  secret: `${process.env.SECRET_KEY}`,
  resave: false,
  saveUninitialized: true
}))

// Global session user variable
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
})

// ************************** ROUTES ******************************* //

const generalController = require("./controllers/General.js");
const userControlla = require("./controllers/user.js");
const showController = require("./controllers/Show.js");
const movieController = require("./controllers/Movie.js");
const allController = require("./controllers/All.js");

app.use("/", generalController);
app.use("/user", userControlla);
app.use("/show", showController);
app.use("/movie", movieController);
app.use("/all", allController);

// 404
app.get('*', function(req, res){
  res.render('404');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
  // Connect to mongoDB
  mongoose.connect(process.env.MONGODB_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(()=>{
      console.log(`Connected to MongoDB`)
  })
  .catch(err=>console.log(`Error :${err}`));
})