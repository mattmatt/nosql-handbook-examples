(function() {
  var CoreMeta, Meta;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; }, __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; };

  CoreMeta = require('./meta');

  Meta = (function() {

    __extends(Meta, CoreMeta);

    function Meta() {
      this.loadResponse = __bind(this.loadResponse, this);
      Meta.__super__.constructor.apply(this, arguments);
    }

    Meta.prototype.load = function(options) {
      return Meta.__super__.load.call(this, options, Meta.riakProperties.concat(Meta.queryProperties), Meta.defaults, CoreMeta.defaults);
    };

    Meta.prototype.loadResponse = function(response) {
      var err, k, v, _ref;
      if (response != null ? response.content : void 0) {
        _ref = response.content[0];
        for (k in _ref) {
          v = _ref[k];
          if (__indexOf.call(CoreMeta.riakProperties, k) >= 0) {
            this[k] = v.toString();
          }
        }
        this.response = (function() {
          try {
            return this.decode(response.content[0].value);
          } catch (e) {
            return new Error("Cannot convert response into " + this.contentType + ": " + e.message + " -- Response: " + response.content.value);
          }
        }).call(this);
      } else {
        err = new Error('Not Found');
        err.notFound = true;
        this.response = void 0;
      }
      return this;
    };

    Meta.prototype.loadData = function() {
      if (this.data) {
        this.content = {
          value: this.encode(this.data),
          contentType: this.contentType,
          charset: this.charset,
          contentEncoding: this.contentEncoding,
          links: this.encodeLinks(this.links)
        };
        delete this.usermeta;
        return delete this.links;
      }
    };

    Meta.prototype.encodeLinks = function(links) {
      if (links) {
        if (!Array.isArray(links)) links = [links];
        return links;
      }
    };

    Meta.prototype.encodeUsermeta = function(data) {
      var key, value, _results;
      _results = [];
      for (key in data) {
        value = data[key];
        _results.push({
          key: key,
          value: value
        });
      }
      return _results;
    };

    return Meta;

  })();

  module.exports = Meta;

}).call(this);
