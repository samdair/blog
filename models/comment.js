var mongoose = require("mongoose");
var Reply = require("./reply");
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	comment: String,
	image: String,
	author: String,
	email: String,
	currentUser: {
                type: Boolean,
                default: false
            },
	blogId: String,
	replies: [Reply.ReplySchema]
});
mongoose.model('Comment', CommentSchema);
var commentModel = mongoose.model('Comment');

module.exports = {
   CommentSchema,
   commentModel
}