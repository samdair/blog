var mongoose = require('mongoose');
var Blog = require('../models/blog');
var Reply = require('../models/reply');
var _ = require('underscore');
module.exports = function(app){

    function isAdmin(req, res, next) {
        if(req.user)
        if (req.user.admin)
            return next()
    }
    function isLoggedIn(req, res, next) {
        if (req.user) {
            next();
        } else {
            res.redirect('/');
        }
    }

    app.post('/reply',isLoggedIn, function(req,res) {
            var reply = new Reply.replyModel({
                reply: req.body.reply,
                author: req.session.user.username,
                email: req.session.user.email,
                image: req.session.user.photo,
            });
       Blog.findOne({ _id: req.body.blogId }, function(err, blog) {
           var comments = blog.comments;
           var comment = _.find(comments, function(item){ return item._id == req.body.commentId; })

                         comment.replies.push(reply);

                         Blog.update({_id: req.body.blogId},
                           { $set: { comments: comments }},
                           { safe: true, upsert: true },
                           function(err) {
                             console.log(err);
                           });
       });
            res.send(reply);
    });

};
