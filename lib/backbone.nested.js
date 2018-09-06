(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            "require",
            "underscore",
            "backbone"
        ], function(require, _, Backbone) {
            return factory(root, require, _, Backbone);
        });
    } else {
        /* global _, Backbone */
        factory(root, require, _, Backbone);
    }
}(this, function(root, require, _, Backbone) {

    /*
    * NESTED COLLECTION
    *
    * A nested collection should be created by a nested model. Once that happens, any model
    * added to the collection (via add() or reset()) will be initialized to whatever instance
    * is specified by the Model attribute in its JSON. It will also be given a reference to
    * a parent.
    */
    /* eslint backbone/collection-model: 0, backbone/no-constructor: 0, backbone/model-defaults: 0 */
    Backbone.NestedCollection = Backbone.Collection.extend({

        // Listen for all of the "nested" events and propagate it up
        initialize: function(){
            this.on("all", function(){
                if (arguments[0].split(":")[0] === "nested") {
                    // if this is a nested collection, then bubble up the 'nested' event to it's parent's collection
                    if (this.parent && this.parent.collection) {
                        this.trigger.apply(this.parent.collection, arguments);
                    }
                }
            });
        },

        constructor: function() {
            Backbone.Collection.apply(this, arguments);
            // Trigger a global event to notify that this collection has been created.
            Backbone.trigger("register:collection", this);
        },

        // Override the collections _prepareModel method - this is what is internally called
        // by add(), and it should deal with both JSON and already created Models.
        _prepareModel: function(model, options) {
            options = options || { };
            options.parent = this.parent;

            if (!(model instanceof Backbone.Model)) {
                var attrs = model;
                var moduleName = attrs.module;
                var constructor = moduleName ? require(moduleName) : this.model;
                model = new constructor(attrs, options);
            }

            if (this.parent) {
                model.parent = this.parent;
            }

            model.collection = this;

            return model;
        },

        // Trigger a nested event as well as the regular event so that the nested event gets propagated
        _onModelEvent: function(event, model, collection) {
            Backbone.Collection.prototype._onModelEvent.apply(this, arguments);

            // We don't want nested:add/nested:remove to trigger for other collections
            if ((event === "add" || event === "remove") && (collection !== this)) {
                return;
            }
            var args = Array.prototype.slice.call(arguments);
            args[0] = "nested:" + event;
            this.trigger.apply(this, args);
        }
    });

    /*
    * NESTED MODEL
    *
    * Models that extend this "class" should call this initialize function. It will loop through attributes
    * and will convert arrays into collections (if the collections have already been created), and convert
    * objects into models (if the model JSON specifies a Model attribute).
    */
    Backbone.NestedModel = Backbone.Model.extend({

        initialize: function(attrs, options) {
            if (options && options.parent) {
                this.parent = options.parent;
            }

            /* eslint backbone/no-model-attributes: 0 */  //see note below
            for (var attrKey in this.attributes) {
                var attrValue = this.attributes[attrKey];
                if (_.isArray(attrValue) && this[attrKey]) {
                    var collection = this[attrKey];
                    collection.parent = this;
                    collection.name = attrKey;
                    collection.reset(attrValue);

                    // Set the attribute for the collection equal to the collection itself - this
                    // is necessary for serialization. Do this directly instead of through set, because
                    // set will kick off a lot of events that we don't want to happen, and it'll also
                    // add things to the previous attributes collection, which we don't want now.
                    this.attributes[attrKey] = collection;
                } else if (_.isObject(attrValue) && attrValue.module) {
                    this[attrKey] = new (require(attrValue.module))(attrValue, { parent: this });
                    this.attributes[attrKey] = this[attrKey];
                    this[attrKey].parent = this;
                }
            }
        },

        constructor: function(attrs) {
            // Don't want _viewModelAttributeTransfer property set as an attribute,
            // just store it directly on the model until MetaDataProvider removes it
            if (attrs && attrs._viewModelAttributeTransfer) {
                this._viewModelAttributeTransfer = attrs._viewModelAttributeTransfer;
                delete attrs._viewModelAttributeTransfer;
            }
            Backbone.Model.apply(this, arguments);
            Backbone.trigger("register:model", this);
        },

        reset: function(updatedJson) {
            // Automatically reset any nested collections we've defined. The _prepareModel override in backbone-extensions.js
            // ensures that everything gets hooked up correctly.
            _(updatedJson).each(
                function(value, key) {
                    if (this[key] instanceof Backbone.NestedCollection) {
                        this[key].reset(value, { silent: false });
                        delete updatedJson[key];
                    }
                },
                this);

            // This is silent so that we don't kick off another update just because the server sent back new values.
            this.set(updatedJson, { silent: false });
            this.trigger("reset", this);
        }
    });

}));
