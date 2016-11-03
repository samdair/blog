var mongoose = require("mongoose");
var Schema = mongoose.Schema;
//reply
var ReplySchema = new Schema({
    commentId: String,
	reply: String,
	image: String,
	author: String,
	email: String,
	currentUser:{
             type: Boolean,
             default: false
           }
});

mongoose.model('Reply', ReplySchema);
var replyModel = mongoose.model('Reply');

module.exports = {
   ReplySchema,
   replyModel

}