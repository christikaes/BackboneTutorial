// Item Model
var Item = Backbone.Model.extend({});

// Items Collection
var Items = Backbone.Collection.extend({});

// App View
var AppView = Backbone.View.extend({
    // el - stands for element. Every view has an element associated with HTML content, will be rendered. 
    el: "#root",

    // It's the first function called when this view is instantiated.
    initialize: function() {
        var item1 = new Item({ content: "I am item 1!"});
        var item2 = new Item({ content: "I am item 2!"});
        var item3 = new Item({ content: "I am item 3!"});

        var items = new Items([item1, item2, item3]);

        this.render(items);
    },

    // $el - it's a cached jQuery object (el), in which you can use jQuery functions to push content.
    render: function(items) {
        var list = "<ol>";
        items.forEach((item) => {
            list += `<li> ${item.get("content")} </li>`;
        })
        list += "</ol>";
        this.$el.html(list);
    }
 });
 var appView = new AppView();