var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var UserSchema = new Schema({
	username: String,
	password: String,
	photo: String,
	email: String,
	currentUser: {
           type: Boolean,
           default: false
               },
	admin:   {
            type: Boolean,
            default: false
        }
});
UserSchema.plugin(passportLocalMongoose);
var User = mongoose.model('User', UserSchema);

module.exports = User;

