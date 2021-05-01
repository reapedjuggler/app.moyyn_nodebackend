var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// mongoose.connect('mongodb+srv://luigi:mOy9q3CzQdUZEH9N6CJyn@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false', { useUnifiedTopology: true }, { useNewUrlParser: true });
var tunnel = require('tunnel-ssh');
var fs = require('fs');

var config = {
  username: 'testing_match',
  password: 'matchmaker',
  host: '161.35.147.227',
  port: 22,
  dstPort: 27017,
};
var db = mongoose.connection;
var server = tunnel(config, function (error, server) {
  if (error) {
      console.log("SSH connection error: " + error);
  }
  console.log('SSH ok');
  mongoose.connect('mongodb://luigi:mOy9q3CzQdUZEH9N6CJyn@localhost:27017/moyyn?authSource=admin&readPreference=primary&ssl=false', {
      auth: {
          user: 'luigi',
          password: 'mOy9q3CzQdUZEH9N6CJyn',
          roles: [ { role: 'root', db: 'moyyn' } ]
      }
  });
  console.log('Connect ok');
  db.on('error', console.error.bind(console, 'DB connection error:'));
  db.once('open', function () {
      // we're connected!
      console.log("DB connection successful");
      // console.log(server);
  });
  //   .then(() => console.log('DB connection successful'))
  //   .catch((error) => console.error.bind(console, 'DB connection error:'));
});


// User Schema
var CandidateSchema = mongoose.Schema({
	password: {
		type: String
	},
	email: {
		type: String
	},
	firstName: {
		type: String
	},
	lastName: {
		type: String
	},
	activeJobSeeking: {
		type: Boolean
	},
	termsAndPrivacyFlag: {
		type: Boolean
	},
	cvEnglish: {
		type: String
	},
	cvGerman: {
		type: String
	},
	country: {
		type: String
	},
	city: {
		type: String
	},
	visaType: {
		type: String
	},
	currentlyEmployedFlag: {
		type: Boolean
	},
	drivingPermitFlag: {
		type: Boolean
	},
	noticePeriod: {
		type: Number
	},
	contactNumber: {
		type: String
	},
	earliestJoiningDate: {
		type: Date
	},
	relocationWillingnessFlag: {
		type: Boolean
	},
	countryPreferences: {
		type: Array
	},
	cityPreferences: {
		type: Array
	},
	desiredEmployment: {
		type: Object
	},
	onlineProfiles: {
		type: Object
	},
	desiredPositions: {
		type: Array
	},
	languages: {
		type: Array
	},
	skills: {
		type: Array
	},
	industries:{
		type: Array
	},
	workExperience:{
		type: Array
	},
	careerLevel:{
		type: String
	},
	createdAt:{
		type: Date
	},
	jobStatistics:{
		type: Object
	},
	jobComments:{
		type: Array
	},
	profileSecurity:{
		type: Object
	},
	helperInformation:{
		type: Object
	}	
});

var User = module.exports = mongoose.model('moyyn', CandidateSchema, 'Candidates_C1_DEV');

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.getUserByEmail = function(email, callback){
	var query = {email: email};
	User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	callback(null, isMatch);
	});
}

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
    	bcrypt.hash(newUser.password, salt, function(err, hash) {
   			newUser.password = hash;
   			newUser.save(callback);
    	});
	});
}