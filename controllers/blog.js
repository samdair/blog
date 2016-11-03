var mongoose = require('mongoose');
var Blog = require('../models/blog');
var _ = require('underscore');

module.exports = function(app){

    function isAdmin(req, res, next) {
        if(req.user){
        if (req.user.admin)
            return next();
        }else{
        res.redirect('/')
        }
    }
    function isLoggedIn(req, res, next) {
        if (req.user) {
            next();
        } else {
            res.send(401);
        }
    }

    app.get('/blogs', function(req, res) {
    	Blog.find(function(err, docs) {
    		docs.forEach(function(item) {
    			console.log("Received a BLOG GET request for id: " + item.id);
    		})
    		res.send(docs);
    	});
    });

    app.post('/blogs',isLoggedIn, function(req, res) {
            console.log('Received a BLOG POST request:')
            for (var key in req.body) {
                console.log(key + ': ' + req.body[key]);
            }
            var blog = new Blog(req.body);
            blog.author = req.session.user.username;
            blog.email = req.session.user.email;
            blog.save(function(err, doc) {
                res.send(doc);
            });
    });

    app.delete('/blogs/:id', function(req, res) {
    	console.log('Received a DELETE request for _id: ' + req.params.id);
    	Blog.remove({_id: req.params.id}, function(err, doc) {
    		res.send({_id: req.params.id});
    	});
    });

    app.put('/blogs/:id',isLoggedIn, function(req, res) {
    	console.log('Received an UPDATE request for _id: ' + req.params.id);
                Blog.update({_id: req.params.id},  req.body, function(err) {
                   res.send({_id: req.params.id});
                });
    });

};
