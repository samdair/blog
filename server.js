var express = require('express');
var http = require('http');
var fs = require('fs');
var path = require('path');
var progress = require('request-progress');
var request = require('request');
var nodemailer = require('nodemailer');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var multer  = require('multer');

mongoose.connect('mongodb://localhost:/mydb',
 function(err) { 
 	if (err){
 	  console.log(err);
 	} else{
 	  console.log('connected......');
 	}
 });

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(session({resave: true, saveUninitialized: true, secret: 'kjksjdfkjdfkkj'}));

function isLoggedIn(req, res, next) {
            if (req.user) {
                next();
            } else {
                res.redirect('/');
            }
    }
/*app.use(function(req, res, next){
    res.locals.user = req.user;
    next();
});*/
// ROUTES
var userRouter = require('./controllers/user')(app);
var blogRouter = require('./controllers/blog')(app);
var commentRouter = require('./controllers/comment')(app);
var replyRouter = require('./controllers/reply')(app);

var upload = multer({ dest: 'public/uploads/' })

app.post('/uploadPhoto',isLoggedIn, upload.single('photo'), function (req, res, next) {
   console.log("success");
   console.log(req.file);
   res.send(req.file);
   res.status(204).end();
});
app.post('/deleteImage', function(req, res) {
      var filenames = fs.readdirSync('public/uploads');
        filenames.forEach(function(file) {
        fs.unlinkSync('public/uploads/' + file);
      });
 });

 app.post('/uploadImage',isLoggedIn, upload.single('image'), function (req, res, next) {
         res.send(req.file);
         res.status(204).end();
  });
 app.post('/download', function(req, res){
        var file = 'sam.png';
        var filePath = 'public/uploads/';
        var thisPath = path.resolve(filePath + file);
        res.download(thisPath);
 });
 var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'samueldair@gmail.com', // Your email id
                pass: 'test123' // Your password
            }
    });

  app.post('/sendMail', function(req, res) {
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: '<samueldair@gmail.com>', // sender address
            to: 'samueldair@gmail.com, samdair@yahoo.com', // list of receivers
            subject: 'Hello ', // Subject line
            //text: 'Hello from Node.js world ', // plaintext body
            html: '<b>Hello from Node.js world</b>', // html body
            attachments: [
                        {   // file on disk as an attachment
                            contentType: 'image/png',
                            filename: 'sam.png',
                            content: fs.createReadStream('public/uploads/sam.png')
                        }
                        ]

        };
        // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
                res.status(204).end();
            });
     });



var port = 3000;

app.listen(port);
console.log('server listening on port ' + port);
