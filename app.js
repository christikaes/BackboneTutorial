// Item Model
var Item = Backbone.Model.extend({});

// Items Collection
var Items = Backbone.Collection.extend({});

// App View
var AppView = Backbone.View.extend({
    // el - stands for element. Every view has an element associated with HTML content, will be rendered. 
    el: "#root",

    // Events
    events: {
        'click #add': 'onAdd'
    },
    
    onAdd: function() {
        this.items.add(new Item({content: "I am a new Item!"}));
        this.render();
    },

    // It's the first function called when this view is instantiated.
    initialize: function() {
        var item1 = new Item({ content: "I am item 1!"});
        var item2 = new Item({ content: "I am item 2!"});
        var item3 = new Item({ content: "I am item 3!"});

        var items = new Items([item1, item2, item3]);
        this.items = items;

        this.render(items);
    },

    // $el - it's a cached jQuery object (el), in which you can use jQuery functions to push content.
    render: function() {
        var list = "<ol id='items'>";
        this.items.forEach((item) => {
            list += `<li> ${item.get("content")} </li>`;
        })
        list += "</ol>";
        var button = "<button id='add'>Add Item!</button>"
        this.$el.html(list + button);
    }
 });
 var appView = new AppView();