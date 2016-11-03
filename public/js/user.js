var UserModule = (function(){
Backbone.Model.prototype.idAttribute = '_id';

// Backbone Model

var User = Backbone.Model.extend({
	defaults: {
		username: '',
		password: '',
		email: '',
		photo: '',
		currentUser:{
             type: Boolean,
             default: false
           },
        admin: {
            type: Boolean,
            default: false
         }
    }
});

// Backbone Collection
var Download = Backbone.Model.extend({
	url: 'http://localhost:3000/download'
});
var Users = Backbone.Collection.extend({
	url: 'http://localhost:3000/users'
});
var Logout = Backbone.Model.extend({
	url: 'http://localhost:3000/logout'
});
var Session = Backbone.Model.extend({
	url: 'http://localhost:3000/session'
});
var Login = Backbone.Model.extend({
	url: 'http://localhost:3000/login',
	username: '',
    password: ''

});
var userSession = {
    username: '',
    admin: ''
}
var users = new Users();

var session = new Session();
    session.save(null,{
            success: function(response){
             userSession.username = response.attributes.username;
             userSession.admin = response.attributes.admin;
    }
});
// Backbone View
var UserView = Backbone.View.extend({
    model: new User(),
    initialize: function(){
        if(userSession.admin){
           this.template = _.template($('.usersAdmin-list-template').html());
        }else if(this.model.attributes.username == userSession.username){
                this.model.attributes.currentUser = true;
                this.template = _.template($('.users-list-template').html());
             }else{
                this.model.attributes.currentUser = false;
                this.template = _.template($('.users-list-template').html());
             }
    },
    events: {
        'click .edit_user': 'edit_user',
        'click .update_user': 'update_user',
        'click .cancel': 'cancel',
        'click .delete_user': 'delete_user',
    },
    edit_user: function(){
        this.$('.edit_user').hide();
        this.$('.delete_user').hide();
        this.$('.update_user').show();
        this.$('.cancel').show();
        var username = this.$('.username').html();
        this.$('.username').html('<input type="text" class="form-control username_update" value="' + username + '">');
    },
    update_user: function() {
        this.model.set('username', $('.username_update').val());
        this.model.save(null, {
            success: function(response) {
                console.log('Successfully UPDATED user with _id: ' + response.toJSON()._id);
            },
            error: function(err) {
                console.log('Failed to update user!');
            }
        });
   },
   delete_user: function() {
   		this.model.destroy({
   			success: function(response) {
   				console.log('Successfully DELETED user with _id: ' + response.toJSON()._id);
   			},
   			error: function(err) {
   				console.log('Failed to delete user!');
   				$( ".login" ).trigger( "click" );
   			}
   		});
   	},
   	cancel: function() {
    		usersView.render();
    	},
    render: function(){

        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

var UsersView = Backbone.View.extend({
    model: users,
    el: $('.users-list'),
    initialize: function() {
		var self = this;
            self.render();
		this.model.on('add', function() {
                self.render();
        }, this);
		this.model.on('change', function() {
				self.render();
		},this);
		this.model.on('remove', this.render, this);

		this.model.fetch({
			success: function(response) {
			    console.log('users model........');
                console.log(response.toJSON());
				_.each(response.toJSON(), function(item) {
					//console.log('Successfully GOT user with _id: ' + item._id);
				})
			},
			error: function() {
				console.log('Failed to get users!');
			}
		});
	},
	render: function() {

		var self = this;
		this.$el.html('');
		_.each(this.model.toArray(), function(user) {
			self.$el.append((new UserView({model: user})).render().$el);
		});
		return this;
	}
});
 var usersView = new UsersView();

var init = function() {

    //var mail = new Mail();
    //mail.save();
    //var deleteFile = new DeleteFile();
    //deleteFile.save();
    //console.log(validator.isEmail('foo@bar.com')); //=> true
    $("form[name='login']").submit(function(e) {
        e.preventDefault();
    });
    $("form[name='login']").validate({
        rules:{
            username:{
                required:true,
            },
            password:{
            required:true,
            }
        },
        messages:{
            username:{
                required:"username is required"
            },
            password:{
            required: "password is required",
            }
        }
    });

    $("form[name='signup']").submit(function(e) {
            e.preventDefault();
        });
        $("form[name='signup']").validate({
            rules:{
                username:{
                    required:true,
                },
                password:{
                required:true,
                },
                email:{
                required:true,
                }
            },
            messages:{
                username:{
                    required:"username is required"
                },
                password:{
                required: "password is required",
                },
                email:{
                required: "email is required",
                }
            }
        });

    $('#loginModal').on('shown.bs.modal', function () {
      $('#username_login').focus()
    })

    $('#signupModal').on('shown.bs.modal', function () {
        $('#username_signup').focus()
    })


    $('#login').on('click', function(e) {

    		var login = new Login({
    			username: $('#username_login').val(),
    			password: $('#password_login').val()
    		});

    		login.save(null, {
    			success: function(response) {
    				console.log('Successfully loggedIn');
    				$('#loginModal').modal('hide');
    				userSession.username = response.attributes.username;
    				userSession.admin = response.attributes.admin;
    				 var users = new Users();
    			     var usersView = new UsersView();
                        usersView.render();
                        var blogsView = new BlogModule.BlogsView();
                        blogsView.render();
    			},
    			error: function(req, status, err) {
                    console.log('failed to login');
                    $('.message').html(status.statusText);
                }
    		    });
    	});

    	$('#signup').on('click', function() {
    	    var fileInput = $('.photo');
                    var file = fileInput[0].files[0];
                    var formData = new FormData();
                    formData.append('photo',file);
                    $.ajax({
                        url: '/uploadPhoto',
                        data: formData,
                        type: 'POST',
                        contentType: false,
                        processData: false,
                     success : function(data) {
                        var user = new User({
                            username: $('#username_signup').val(),
                            password: $('#password_signup').val(),
                            email: $('#email_signup').val(),
                            admin: $('#role_signup').val(),
                            photo: (data.filename)? data.filename : null
                        });

                        users.add(user);
                        user.save(null, {
                            success: function(response) {
                                console.log('Successfully Registered');
                                usersView.render();
                            },
                            error: function(req, status, err) {
                                console.log('Failed to Register!');
                                console.log(status.responseText)
                                $('.message').html(status.responseText);
                            }
                        });
                     },
                     error : function() {
                          console.log('failed to upload photo');

                      }
                    })

            	});

        $('#logout').on('click', function() {
            var logout = new Logout();
            logout.save(null, {
                success: function(response) {
                    console.log('Successfully Logged out');
                    userSession.username = null;
                    userSession.admin = false;
                    var blogsView = new BlogModule.BlogsView();
                    blogsView.render();
                    usersView.render();
                },
                error: function() {
                    console.log('Failed to log out!');
                }
            });
        });
};

return {
    init: init,
    userSession: userSession,
    UserView : UserView,
    UsersView: UsersView,
};
})();
$(function(){
   UserModule.init();
});

