Backbone.Model.prototype.idAttribute = '_id';

// Backbone Model

var Blog = Backbone.Model.extend({
	defaults: {
		title: '',
		description: '',
		img: '',
		comments: []
    }
});

// Backbone Collection

var Blogs = Backbone.Collection.extend({
	url: 'http://localhost:3000/blogs'
});


// instantiate a Collection

var blogs = new Blogs();

// Backbone View for one blog
var ChartView = Backbone.View.extend({
    model: blogs,
    el: $('#myDiv'),

    render: function(){
      var blogs = [];
      var comments = [];
      var replies = [];
        this.model.fetch({
            success: function(response) {
                model = response.models;

                _.each(model, function(item) {
                   var blogValue = item.attributes.title;
                   var commentValue = item.attributes.comments.length;
                   var replyValue = 0;
                   blogs.push(blogValue);
                   comments.push(commentValue);
                   var arrayComment = item.attributes.comments;

                   _.each(arrayComment, function(x){
                        replyValue+= x.replies.length;

                   })
                   replies.push(replyValue);
                })
                var comment = {
                    x: blogs,
                    y: comments,
                    name: 'comment',
                    type: 'bar'
                    };

                var reply = {
                    x: blogs,
                    y: replies,
                    name: 'reply',
                    type: 'bar'
                    };
                var layout = {
                    margin: {
                    l: 30,
                    r: 0,
                    t: 0,
                    b: 30
                    }
                }

                 var data = [comment, reply];

                Plotly.newPlot('myDiv', data, layout, {displayModeBar: false});
            },
            error: function() {
                console.log('Failed to get blogs!');
            }
        });
    }
})
var chartView = new ChartView();
    chartView.render();
var GridView = Backbone.View.extend({
    model: blogs,
    el: $('#Grid'),

    render: function(){
      var blogs = [];
      var comments = [];
      var replies = [];
        this.model.fetch({
            success: function(response) {
                model = response.models;

                _.each(model, function(item) {
                   var blogValue = item.attributes.title;
                   var commentValue = item.attributes.comments.length;
                   var replyValue = 0;
                   blogs.push(blogValue);
                   comments.push(commentValue);
                   var arrayComment = item.attributes.comments;

                   _.each(arrayComment, function(x){
                        replyValue+= x.replies.length;

                   })
                   replies.push(replyValue);
                })
                var grid;
                  var columns = [
                    {id: "blog", name: "Blog", field: "blog"},
                    {id: "comment", name: "Comment", field: "comment"},
                    {id: "reply", name: "Reply", field: "reply"}
                  ];
                  var options = {
                    enableCellNavigation: true,
                    enableColumnReorder: false
                  };

                    var data = [];
                    for (var i = 0; i < blogs.length; i++) {
                      data[i] = {
                        blog: blogs[i],
                        comment: comments[i],
                        reply: replies[i],

                      };
                    }
                    grid = new Slick.Grid("#myGrid", data, columns, options);
            },
            error: function() {
                console.log('Failed to get blogs!');
            }
        });
    }
})
var gridView = new GridView();
     gridView.render();

