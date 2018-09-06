// Item Model
var Item = Backbone.Model.extend({});

// App View
var AppView = Backbone.View.extend({
    // el - stands for element. Every view has an element associated with HTML content, will be rendered. 
    el: "#root",

    // It's the first function called when this view is instantiated.
    initialize: function() {
        var itemModel = new Item({ content: "I am an item!"});

        this.render(itemModel);
    },

    // $el - it's a cached jQuery object (el), in which you can use jQuery functions to push content.
    render: function(itemModel) {
       this.$el.html(itemModel.get("content"));
    }
 });
 var appView = new AppView();