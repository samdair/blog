var BlogModule = (function(){
Backbone.Model.prototype.idAttribute = '_id';

// Backbone Model

var Blog = Backbone.Model.extend({
	defaults: {
		title: '',
		image: '',
		email: '',
		author: '',
		currentUser: {
           type: Boolean,
           default: false
        },
		description: '',
		comments: []
    }
});
var Comment = Backbone.Model.extend({
    url: 'http://localhost:3000/comment',
});

var Reply = Backbone.Model.extend({
    url: 'http://localhost:3000/reply',
});
// Backbone Collection
var Blogs = Backbone.Collection.extend({
	url: 'http://localhost:3000/blogs'
});

// instantiate a Collection


var blogs = new Blogs();
var userSession = UserModule.userSession;
// Backbone View for one blog


var BlogView = Backbone.View.extend({
	model: new Blog(),
	initialize: function() {
	    this.model.comments = new Comment(this.model.get('comments'));
        this.model.comments.bind('change', this.model.save);
        this.model.comments.bind('add', this.model.save);
        //blog model
        if(this.model.attributes.author == userSession.username){
           this.model.attributes.currentUser = true;
        }
        //comment model
        var comments = this.model.comments.toJSON();
        for(var i in comments){
            var replies = comments[i].replies;
            for(var index in replies){
                if(replies[index].author == userSession.username){
                    replies[index].currentUser = true;
                }
            }
            if(comments[i].author == userSession.username){
            comments[i].currentUser = true;
            }
        }
         this.template = _.template($('.blogs-list-template').html());
	},
	events: {
		'click .edit_blog': 'edit_blog',
		'click .update_blog': 'update_blog',
		'click .cancel': 'cancel',
		'click .delete_blog': 'delete_blog',
		'click .add_blog': 'add_blog',
		'click .edit_comment': 'edit_comment',
        'click .update_comment': 'update_comment',
        'click .delete_comment': 'delete_comment',
		'click .add_comment': 'add_comment',
		'click .add_reply': 'add_reply',
		'click .edit_reply': 'edit_reply',
        'click .update_reply': 'update_reply',
        'click .delete_reply': 'delete_reply',
	},
	edit_blog: function() {
		this.$('.edit_blog').hide();
		this.$('.delete_blog').hide();
		this.$('.update_blog').show();
		this.$('.cancel').show();

		var title = this.$('.title').html();
		var description = this.$('.description').html();


		this.$('.title').html('<input type="text" class="form-control title_update" value="' + title + '">');
		this.$('.description').html('<input type="text" class="form-control description_update" value="' + description + '">');
	    },
    edit_comment: function(e) {
        var id = e.currentTarget.id;
        id = id.slice(13, id.length);
        var comments = this.model.get('comments');
        var comment = _.find(comments, function(item){ return item._id == id; });
        $('#edit_comment_'+id).hide();
        $('#delete_comment_'+id).hide();
        $('#update_comment_'+id).show();
        this.$('#cancel_comment_'+id).show();
        var comment = $('#comment_'+id).html();
        $('#comment_'+id).html('<input type="text" class="form-control comment_update" value="' + comment + '">');
        },
    update_comment: function(e) {
            var id = e.currentTarget.id;
            id = id.slice(15, id.length);
    		var comments = this.model.get('comments');
            var comment = _.find(comments, function(item){ return item._id == id; });
    		comment.comment = $('.comment_update').val();

            this.model.set({
                'comments' : comments
            });
            var data = this.model.toJSON();
            data.commentAuthor = comment.author;

    		this.model.save(data, {
    			success: function(response) {
    				console.log('Successfully UPDATED blog with _id: ' + response.toJSON()._id);
    				blogsView.render();

    			},
    			error: function(err) {
    				console.log('Failed to update blog!');
    				$( ".login" ).trigger( "click" );
    			}
    		});
    	   },
	update_blog: function() {
		this.model.set('title', $('.title_update').val());
		this.model.set('description', $('.description_update').val());

		this.model.save(null, {
			success: function(response) {
				console.log('Successfully UPDATED blog with _id: ' + response.toJSON()._id);
			},
			error: function(err) {
				console.log('Failed to update blog!');
				$( ".login" ).trigger( "click" );
			}
		});
	   },
	add_comment: function() {
        var comment = new Comment({
             comment: this.$('.comment_input').val(),
             blogId: this.model.id,
        });

        comment.save(null, {
            success: function(response) {
                console.log('Successfully added comment');
                blogs.fetch();
                blogsView.render();
            },
            error: function(err) {
                console.log('Failed to add comment!');
                $( ".login" ).trigger( "click" );
            }
          });
       },
    add_reply: function(e) {
        var id = e.currentTarget.id;
        id = id.slice(10,id.length);
        var reply = new Reply({
             reply: this.$('#reply_input_'+id).val(),
             commentId: id,
             blogId: this.model.id
        });

        reply.save(null, {
            success: function(response) {
                console.log('Successfully added reply');
                blogs.fetch();
                   blogsView.render();
            },
            error: function(err) {
                console.log('Failed to add reply!');
                $( ".login" ).trigger( "click" );
            }
        });

        },
    edit_reply: function(e) {
            var id = e.currentTarget.id;
            id = id.slice(11,id.length);
            $('#edit_reply_'+id).hide();
            $('#delete_reply_'+id).hide();
            $('#update_reply_'+id).show();
            this.$('#cancel_reply_'+id).show();
            var reply = $('#reply_'+id).html();
            $('#reply_'+id).html('<input type="text" class="form-control reply_update" value="' + reply + '">');
            },
    update_reply: function(e) {
            var id = e.currentTarget.id;
            id = id.slice(13,id.length);
            console.log(id);
            var comments = this.model.get('comments');
            var reply;
            _.each(comments, function(comment) {
               if(_.find(comment.replies, function(item){ return item._id == id; })){
                   reply = _.find(comment.replies, function(item){ return item._id == id; });
                   return;
               }
            })
            reply.reply = $('.reply_update').val();

            this.model.save(null, {
                success: function(response) {
                    console.log('Successfully UPDATED blog with _id: ' + response.toJSON()._id);
                    blogsView.render();
                },
                error: function(err) {
                    console.log('Failed to update blog!');
                    $( ".login" ).trigger( "click" );
                }
            });
           },
    delete_reply: function(e) {
            var id = e.currentTarget.id;
            id = id.slice(13,id.length);
            var comments = this.model.get('comments');
            var reply;
            _.each(comments, function(comment) {
               if(_.find(comment.replies, function(item){ return item._id == id; })){
                   comment.replies = _.reject(comment.replies, function(item){ return item._id == id; });
                   return;
               }
            })
            this.model.set({
                           'comments' : comments
                       });
            this.model.save(null, {
                   success: function(response) {
                       console.log('Successfully UPDATED blog with _id: ' + response.toJSON()._id);
                       blogsView.render();
                   },
                   error: function(err) {
                       console.log('Failed to update blog!');
                       $( ".login" ).trigger( "click" );
                   }
               });
        },
	cancel: function() {
		blogsView.render();
	},
	delete_comment: function(e) {
	        var id = e.currentTarget.id;
	        id = id.slice(15,id.length);
            var comments = this.model.comments.toJSON();
	        comments = _.reject(comments, function(item){ return item._id == id; });
	        this.model.set({
                'comments' : comments
            });
    		this.model.save(null, {
                success: function(response) {
                    console.log('Successfully UPDATED blog with _id: ' + response.toJSON()._id);
                    blogsView.render();
                },
                error: function(err) {
                    console.log('Failed to update blog!');
                    $( ".login" ).trigger( "click" );
                }
            });
    	},
	delete_blog: function() {
		this.model.destroy({
			success: function(response) {
				console.log('Successfully DELETED blog with _id: ' + response.toJSON()._id);
			},
			error: function(err) {
				console.log('Failed to delete blog!');
				$( ".login" ).trigger( "click" );
			}
		});
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

// Backbone View for all blogs
var BlogsView = Backbone.View.extend({
	model: blogs,
	el: $('.blogs-list'),
	initialize: function() {
		var self = this;
            self.render();
        this.model.on('remove', this.render, this);
		this.model.on('add', function() {
                self.render();
        }, this);
		this.model.on('change', function() {
				self.render();
		},this);
		this.model.fetch({
			success: function(response) {
			    console.log('blogs model........');
                console.log(response.toJSON());
				_.each(response.toJSON(), function(item) {
					//console.log('Successfully GOT blog with _id: ' + item._id);
				})
			},
			error: function() {
				console.log('Failed to get blogs!');
			}
		});
	},
	render: function() {
		var self = this;
		this.$el.html('');
		_.each(this.model.toArray(), function(blog) {
			self.$el.append((new BlogView({model: blog})).render().$el);
		});
		return this;
	}
});
var blogsView = new BlogsView();

var init = function() {

    $('.sign_up').on('click', function() {
        $( ".signup" ).trigger( "click" );
    });

	$('.add_blog').on('click', function() {

	     $("form[name='add_blog']").submit(function(e) {
                     e.preventDefault();
                 });
                 $("form[name='add_blog']").validate({
                     rules:{
                         title:{
                             required:true,
                         },
                         description:{
                         required:true,
                         }
                     },
                     messages:{
                         title:{
                             required:"title is required"
                         },
                         description:{
                         required: "description is required",
                         }
                     }
                 });

                var fileInput = $('.file');
                var file = fileInput[0].files[0];
                var formData = new FormData();
                formData.append('image',file);

                $.ajax({
                    url: '/uploadImage',
                    data: formData,
                    type: 'POST',
                    contentType: false,
                    processData: false,
                 success : function(data) {
                    var blog = new Blog({
                        title: $('.title_input').val(),
                        description: $('.description_input').val(),
                        image: (data)? data.filename : null
                    });
                    $('.title_input').val('');
                    $('.description_input').val('');

                    blogs.add(blog);
                    blog.save(null, {
                        success: function(response) {
                            console.log('Successfully SAVED blog with _id: ' + response.toJSON()._id);
                            blogsView.render();
                        },
                        error: function() {
                            console.log('Failed to save blog!');
                            $( ".login" ).trigger( "click" );
                        }
                    });
                 },
                 error : function() {
                      console.log('failed add blog');
                      $( ".login" ).trigger( "click" );
                  }
                })
            });
   }

return {
    init: init,
    BlogView: BlogView,
    BlogsView: BlogsView
};
})();
$(function(){
   BlogModule.init();
});


