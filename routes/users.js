var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './cvData' });
var expressValidator = require('express-validator');
var bcrypt = require('bcryptjs');
var fs = require('fs');
const base64 = require('js-base64');
router.use(expressValidator());

var User = require('../models/userModel');

var userData;

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('Candidates Home page');
});

router.get('/register', function (req, res, next) {
  res.send("This is GET register page, (send a POST request for registering user.)");
});

router.get('/login', function (req, res, next) {
  res.send("This is the GET login page");
});

router.post('/login', function (req, res) {

  var email = req.body.email;
  var password = req.body.password;

  User.getUserByEmail(email, function (err, user) {
    if (err) throw err;
    if (!user) {
      res.send({
        success: false,
        msg: "Login Unsuccessful."
      });
    } else {
      User.comparePassword(password, user.password, function (err, isMatch) {
        if (err) return done(err);
        if (isMatch) {
          console.log('You are now logged in Succesfully!');
          userData = user;
          res.send({
            success: true,
            msg: "Logged in",
            candidate_id: user._id,
            email: user.email,
            name: user.firstName + " " + user.lastName
          })
        } else {
          res.send({
            success: false,
            msg: "Error in Logging in",
          });
        }
      });
    }
  });
});

router.post('/resetpassword', function (req, res) {

  var candidate_id = req.body.candidate_id;
  var newpassword = req.body.newpassword;

  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newpassword, salt, function (err, hash) {
      // console.log(hash);
      User.updateOne({ _id: candidate_id }, { password: hash }, function (err, user) {
        if (err) throw err;
        if (user.nModified == 0) {
          res.send({
            success: false,
            msg: "Unknown User"
          });
        } else {
          res.send({
            success: true,
            msg: "Updated Password"
          });
        }
      });
    });
  });


});

router.post('/delete', async function (req, res) {

  var candidate_id = req.body.candidate_id;

  await User.findByIdAndDelete(candidate_id, function (err, docs) {
    if (err) {
      res.send({
        success: false,
        error: err
      })
    }
    else {
      res.send({
        success: true,
        msg: "Deleted Successfully."
      })
    }
  });


});

router.post('/getuser', async function (req, res) {

  var candidate_id = req.body.candidate_id;

  User.findOne({ _id: candidate_id }, function (err, user) {
    if (err) throw err;

    res.send(user);
  })
});



router.post('/editprofile',  async function (req, res) {

  var candidate_id = req.body.candidate_id;

  try {
    var data = req.body;
    var cvEnglish = data[1].cvEnglish;
    var cvGerman = data[1].cvGerman;

    let decodedBase64English = "";
    let decodedBase64German = "";

    if (cvEnglish.data !== null) decodedBase64English = base64.atob(cvEnglish.data);
    if (cvGerman.data !== null) decodedBase64German = base64.atob(cvGerman.data);

    if (cvEnglish.data !== null) {
      fs.writeFile("cvData/English_CV/" + cvEnglish.fileName, decodedBase64English, 'binary', function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("English pdf saved!");
      });
    }

    if (cvGerman.data !== null) {
      fs.writeFile("cvData/German_CV/" + cvGerman.fileName, decodedBase64German, 'binary', function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("German pdf saved!");
      });
    }

    var desiredPositions = data[1].desiredPositions;
    var relocationWillingnessFlag = data[3].relocationWillingnes;
    var country = data[2].country;
    var city = data[2].city;
    var visaType = data[2].visaType;
    var earliestJoiningDate = data[2].earliestJoiningDate;
    var currentlyEmployedFlag = data[2].currentlyEmployedFlag || false;
    var drivingPermitFlag = data[2].drivingPermitFlag;
    var contactNumber = data[2].contactNumber;
    var noticePeriod = data[2].noticePeriod;
    var desiredEmployment = data[3].desiredEmployment;
    var careerLevel = data[4].careerLevel;
    var industries = data[4].industries;
    var skills = data[4].skills;
    var workExperience = data[4].workExperience;
    var languages = data[4].languages;
    var onlineProfiles = data[3].onlineProfiles;
    var cityPreferences = data[3].cityPreferences;
    var countryPreferences = data[3].countryPreferences;

    var userData = {};

    userData.firstName = firstName;
    userData.lastName = lastName;
    userData.email = email;
    userData.activeJobSeeking = activeJobSeeking;
    userData.termsAndPrivacyFlag = termsAndPrivacyFlag;
    userData.password = password
    userData.cvEnglish = cvEnglish.fileName;
    userData.cvGerman = cvGerman.fileName;
    userData.desiredPositions = desiredPositions;
    userData.relocationWillingnessFlag = relocationWillingnessFlag;
    userData.desiredEmployment = desiredEmployment;
    userData.onlineProfiles = onlineProfiles;  //array of objects
    userData.country = country;
    userData.city = city;
    userData.visaType = visaType;
    userData.earliestJoiningDate = earliestJoiningDate;
    userData.currentlyEmployedFlag = currentlyEmployedFlag;
    userData.drivingPermitFlag = drivingPermitFlag;
    userData.cityPreferences = cityPreferences;
    userData.countryPreferences = countryPreferences;
    userData.contactNumber = contactNumber;
    userData.noticePeriod = noticePeriod;
    userData.careerLevel = careerLevel;
    userData.industries = industries;
    userData.skills = skills;
    userData.workExperience = workExperience;
    userData.languages = languages;

    await User.updateOne({ _id: candidate_id }, { $set: userData }, function (err, user) {
        res.send({
          success: true,
          msg: "Updated Successfully"
        })
    });


  }catch(err){
    res.send({
      success: false,
      msg: err
    })
  }

});

router.post('/application', function (req, res, next) {
  var email = req.body.email;

  User.getUserByEmail(email, function (err, user) {
    if (err) throw err;
    console.log(user);
    if (user == null) {
      res.send({
        success: true,
        msg: "Account not found"
      });
    } else {
      res.send({
        success: false,
        msg: "Account found"
      });
    }
  });


  // Check Errors
  var errors = req.validationErrors();

  if (errors) {
    res.send({
      success: false,
      error: errors
    });
  } else {
  }

});

router.post('/register', function (req, res, next) {
  try {
    var data = req.body;
    // console.log(data[0].firstname);
    var firstName = data[0].firstname;
    var lastName = data[0].lastname;
    var email = data[0].email;
    var activeJobSeeking = data[0].activeJobSeeking || false;
    var termsAndPrivacyFlag = data[0].termsAndPrivacyFlag;
    var password = data[0].password;

    var cvEnglish = data[1].cvEnglish;
    var cvGerman = data[1].cvGerman;

    let decodedBase64English = "";
    let decodedBase64German = "";

    if (cvEnglish.data !== null) decodedBase64English = base64.atob(cvEnglish.data);
    if (cvGerman.data !== null) decodedBase64German = base64.atob(cvGerman.data);

    if (cvEnglish.data !== null) {
      fs.writeFile("cvData/English_CV/" + cvEnglish.fileName, decodedBase64English, 'binary', function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("English pdf saved!");
      });
    }

    if (cvGerman.data !== null) {
      fs.writeFile("cvData/German_CV/" + cvGerman.fileName, decodedBase64German, 'binary', function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("German pdf saved!");
      });
    }

    var desiredPositions = data[1].desiredPositions;
    var relocationWillingnessFlag = data[3].relocationWillingnes;
    var country = data[2].country;
    var city = data[2].city;
    var visaType = data[2].visaType;
    var earliestJoiningDate = data[2].earliestJoiningDate;
    var currentlyEmployedFlag = data[2].currentlyEmployedFlag || false;
    var drivingPermitFlag = data[2].drivingPermitFlag;
    var contactNumber = data[2].contactNumber;
    var noticePeriod = data[2].noticePeriod;
    var desiredEmployment = data[3].desiredEmployment;
    var careerLevel = data[4].careerLevel;
    var industries = data[4].industries;
    var skills = data[4].skills;
    var workExperience = data[4].workExperience;
    var languages = data[4].languages;
    var onlineProfiles = data[3].onlineProfiles;
    var cityPreferences = data[3].cityPreferences;
    var countryPreferences = data[3].countryPreferences;


    // Form Validator
    // req.checkBody('data','No data input').notEmpty();
    // req.checkBody('firstName','First Name field is required').notEmpty();
    // req.checkBody('lastname','Last Name field is required').notEmpty();
    // req.checkBody('email','Email field is required').notEmpty();
    // req.checkBody('email','Email is not valid').isEmail();
    // req.checkBody('password','Password field is required').notEmpty();
    // req.checkBody('cvEnglish','English CV is required').notEmpty();
    // req.checkBody('country','Country field is required').notEmpty();
    // req.checkBody('city','City field is required').notEmpty();
    // req.checkBody('visaType','Visa field is required').notEmpty();
    // req.checkBody('earliestJoiningDate','Joining Date is required').notEmpty();
    // req.checkBody('contactNumber','Contact Number is required').notEmpty();
    // req.checkBody('cvEnglish','English CV is required').notEmpty();
    // req.checkBody('password2','Passwords do not match').equals(req.body.password);

    // Check Errors
    // var errors = req.validationErrors();


    var userData = {};

    userData.firstName = firstName;
    userData.lastName = lastName;
    userData.email = email;
    userData.activeJobSeeking = activeJobSeeking;
    userData.termsAndPrivacyFlag = termsAndPrivacyFlag;
    userData.password = password
    userData.cvEnglish = cvEnglish.fileName;
    userData.cvGerman = cvGerman.fileName;
    userData.desiredPositions = desiredPositions;
    userData.relocationWillingnessFlag = relocationWillingnessFlag;
    userData.desiredEmployment = desiredEmployment;
    userData.onlineProfiles = onlineProfiles;  //array of objects
    userData.country = country;
    userData.city = city;
    userData.visaType = visaType;
    userData.earliestJoiningDate = earliestJoiningDate;
    userData.currentlyEmployedFlag = currentlyEmployedFlag;
    userData.drivingPermitFlag = drivingPermitFlag;
    userData.cityPreferences = cityPreferences;
    userData.countryPreferences = countryPreferences;
    userData.contactNumber = contactNumber;
    userData.noticePeriod = noticePeriod;
    userData.careerLevel = careerLevel;
    userData.industries = industries;
    userData.skills = skills;
    userData.workExperience = workExperience;
    userData.languages = languages;
    
    var newUser = new User(userData);
    User.createUser(newUser, function(err, user){
      if(err) throw err;
      userData = user;
      res.send({
        success:true,
        candidate_id:user._id,
      });
    });
  } catch (err) {
    res.send({
      success: false,
      errors: err,
    })
  }
});

module.exports = router;