var mongoose = require('mongoose');
var Blog = require('../models/blog');
var _ = require('underscore');
var Comment = require('../models/comment');
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
    app.post('/comment',isLoggedIn, function(req,res) {
        var comment = new Comment.commentModel({
            comment: req.body.comment,
            author: req.session.user.username,
            email: req.session.user.email,
            image: req.session.user.photo,
        });
     var query = { _id: req.body.blogId };
        Blog.findOneAndUpdate(query,
          { $push: { comments: comment }},
          { safe: true, upsert: true },
          function(err) {
            console.log(err);
            });
            res.send(comment);
    });
    app.put('/comment/:id', function(req,res) {
             console.log('delete comment called....');
             var commentId = req.params.id; //commentId
             var blogId = req.body.blogId; //blogId

                 /*Blog.findOneAndUpdate(
                     {_id: blogId},
                     {$pull: {comments: {_id: commentId}}},
                     function(err, data){
                        if(err) return err;
                        console.log(data);
                 });*/

        });

};
