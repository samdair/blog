var mongoose = require("mongoose");
var Comment = require("./comment");
var Schema = mongoose.Schema;

//blog
var BlogSchema = new Schema({
	title: String,
	author: String,
	email: String,
	currentUser:{
                type: Boolean,
                default: false
            },
	image: String,
	description: String,
	comments: [Comment.CommentSchema]
});
mongoose.model('Blog', BlogSchema);
var Blog = mongoose.model('Blog');

module.exports = Blog;
