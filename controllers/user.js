var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var _ = require('underscore');

module.exports = function(app){

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    function isAuthenticated(req, res, next) {
            if (req.isAuthenticated())
                return next()
    }
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
                res.redirect('/');
            }
    }

    app.post('/session', function(req, res) {
            res.json(req.session.user);
    });

    app.get('/users',isLoggedIn, function(req, res) {
        if(req.user.admin){
            User.find(function(err, docs) {
                docs.forEach(function(item) {
                    console.log("Received a USER GET request for id: " + item.id);
                })
                res.send(docs);
            });
        }else{
            res.send(req.user);
        };
    });

    app.post('/users', function(req, res) {

        User.findOne({ username: req.body.username }, function(err, user) {
              if (user) {
                // username exists
                return res.status(401).json('User Name already taken');
              }

        User.register(new User({ username : req.body.username, email: req.body.email, admin: req.body.admin, photo: req.body.photo }),
          req.body.password, function(err, user) {
            if (err) {
                return res.status(401).json('Can not register');
            }
            passport.authenticate('local')(req, res, function () {
                return res.status(200).json({status: 'Registration Successful!'});
            });
        });
        });
    });
    app.put('/users/:id', function(req, res) {
        	console.log('Received an UPDATE request for _id: ' + req.params.id);
        	User.update({_id: req.params.id}, req.body, function(err) {
        		res.send({_id: req.params.id});
        	});
    });
    app.delete('/users/:id',isAdmin, function(req, res) {
        	console.log('Received a DELETE request for _id: ' + req.params.id);
        	User.remove({_id: req.params.id}, function(err, doc) {
        		res.send({_id: req.params.id});
        	});
    });
    app.post('/login', function(req, res, next) {
      passport.authenticate('local',function(err, user, info) {
        if (err) {
          return next(err);
        }
        if (!user) {
          console.log('You are not Authorized!')
          return res.status(401).json({
            err: info
          });
        }
        req.logIn(user, function(err) {
          if (err) {
            console.log('Could not log in user');
            return res.status(500).json({
              err: 'Could not log in user'
            });
          }else{
           req.session.user = user;
           return res.send(user);
          }
        });
      })(req,res,next);
    });

    app.post('/logout', function(req, res) {
        req.logout();
        req.session.destroy();
        console.log('logout session ....');
        console.log(req.session)
      res.status(200).json({
        status: 'Bye!'
      });
    });




};

/*User.findOne({ username: username }, function(err, user) {
      if (err) {
        // user not found
        return res.send(401);
      }

      if (!user) {
        // incorrect username
        return res.send(401);
      }

      if (!user.validPassword(password)) {
        // incorrect password
        return res.send(401);
      }

      // User has authenticated OK
      res.send(200);
    });*/