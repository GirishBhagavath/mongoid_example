//= require jquery
//= require jquery_ujs
//= require underscore-min
//= require underscore-config
//= require backbone-min
//= require_tree .



// Bootstrapping Backbone.js Application

$(function() { 
  App.start(); 
});

App = {
  start: function() {
    App.router = new App.Router();
    Backbone.history.start();
  }
};



// Router/Controller

App.Router = Backbone.Router.extend({
  routes: {
    'search/:term' : 'search'
  },

  initialize: function() {
    new App.SearchView();
    new App.SearchResultsView();
    new App.FavoritesView();
  },

  search: function(term) {
    App.SearchController.search(term);
  }
});

App.SearchController = {
  search: function(term) {
    App.searchResults.fetch(term);    
  }
};



// Views

App.SearchView = Backbone.View.extend({
  el: '#search',
  events: {
    'keypress' : 'handleEnter'
  },

  initialize: function() {
    $(this.el).focus();
  },

  handleEnter: function(e) {
    if (e.keyCode === 13) {
      App.router.navigate('search/' + $(this.el).val(), true);
      e.preventDefault();
    }
  }
})

App.SearchResultsView = Backbone.View.extend({
  el: '#search-results',
  initialize: function() {
    App.searchResults.bind('reset', this.render, this);
  },
  render: function(collection) {
    collection.each(function(model) {
      var view = new App.SearchResultView({model: model});
      var result = view.render(); // li
      this.$('ul').append(result);
    }, this)
  }
});

App.SearchResultView = Backbone.View.extend({
  tagName: 'li',
  events: {
    'click input' : 'addFavorite'
  },
  
  initialize: function() {
    _.bind(this, 'render');
    this.template = _.template($('#image-template').html());
  },

  render: function() {
    var html = this.template({button_text: '+', model: this.model.toJSON()});
    $(this.el).append(html);

    return this.el;
  },

  addFavorite: function() {
    App.favorites.create({url: this.model.get('url')});  
  }
});

App.FavoritesView = Backbone.View.extend({
  el: '#favorites',
  initialize: function() {
    App.favorites.bind('add', this.renderItem, this);
    App.favorites.bind('reset', this.render, this);
  },
  render: function() {
    this.$('ul').empty();
    App.favorites.each(function(model) {
      this.renderItem(model);
    }, this);
  },
  renderItem: function(model) {
    var view = new App.FavoriteView({model: model});
    var result = view.render();
    this.$('ul').append(result); 
  }
});

App.FavoriteView = Backbone.View.extend({
  tagName: 'li',
  events: {
    'click input' : 'removeFavorite'
  },

  initialize: function() {
    _.bindAll(this, 'render');
    this.template = _.template($('#image-template').html());
    this.model.bind('destroy', function() { $(this.el).remove() }, this)
  },

  render: function() {
    var html = this.template({button_text: '-', model: this.model.toJSON()});
    $(this.el).append(html);

    return this.el;
  },

  removeFavorite: function() {
    this.model.destroy();
  }
});



// Models/Collections

App.SearchResult = Backbone.Model.extend({ idAttribute: '_id' });
App.SearchResultList = Backbone.Collection.extend({
  model: App.SearchResult,
  url: function() {
    return '/search/' + this.term;
  },
  fetch: function(term) {
    this.term = term;
    Backbone.Collection.prototype.fetch.call(this);
  }
});
App.searchResults = new App.SearchResultList();

App.Favorite = Backbone.Model.extend({ idAttribute: '_id' });
App.FavoriteList = Backbone.Collection.extend({
  model: App.Favorite,
  url: '/favorites'
});
App.favorites = new App.FavoriteList();
