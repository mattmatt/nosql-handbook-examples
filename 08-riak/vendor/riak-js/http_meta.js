(function() {
  var CoreMeta, Meta, Utils, linkUtils;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  CoreMeta = require('./meta');

  Utils = require('./utils');

  Meta = (function() {

    __extends(Meta, CoreMeta);

    function Meta() {
      Meta.__super__.constructor.apply(this, arguments);
    }

    Meta.prototype.load = function(options) {
      return Meta.__super__.load.call(this, options, Meta.riakProperties.concat(Meta.queryProperties), Meta.defaults, CoreMeta.defaults);
    };

    Meta.prototype.responseMappings = {
      'content-type': 'contentType',
      'x-riak-vclock': 'vclock',
      'last-modified': 'lastMod',
      'content-range': 'contentRange',
      'accept-ranges': 'acceptRanges',
      'date': 'date'
    };

    Meta.prototype.loadResponse = function(response) {
      var $0, headers, k, u, v, _ref, _ref2;
      headers = response.headers;
      _ref = this.responseMappings;
      for (v in _ref) {
        k = _ref[v];
        this[k] = headers[v];
      }
      this.statusCode = response.statusCode;
      for (k in headers) {
        v = headers[k];
        u = k.match(/^X-Riak-Meta-(.*)/i);
        if (u) this.usermeta[u[1]] = v;
      }
      if (headers.link) this.links = linkUtils.stringToLinks(headers.link);
      if (headers.etag) this.etag = headers.etag.replace(/"/g, '');
      if (headers.location) {
        _ref2 = headers.location.match(/^\/([^\/]+)(?:\/([^\/]+))?\/([^\/]+)$/), $0 = _ref2[0], this.raw = _ref2[1], this.bucket = _ref2[2], this.key = _ref2[3];
      }
      delete this.method;
      return this;
    };

    Meta.prototype.requestMappings = {
      accept: 'Accept',
      host: 'Host',
      clientId: 'X-Riak-ClientId',
      vclock: 'X-Riak-Vclock',
      range: 'Range',
      connection: 'Connection'
    };

    Meta.prototype.toHeaders = function() {
      var headers, k, type, v, _ref, _ref2, _ref3;
      headers = {};
      if (this.vclock == null) delete this.requestMappings.clientId;
      _ref = this.requestMappings;
      for (k in _ref) {
        v = _ref[k];
        if (this[k]) headers[v] = this[k];
      }
      _ref2 = this.index;
      for (k in _ref2) {
        v = _ref2[k];
        type = typeof v === 'number' ? 'int' : 'bin';
        headers["X-Riak-index-" + k + "_" + type] = v;
      }
      _ref3 = this.usermeta;
      for (k in _ref3) {
        v = _ref3[k];
        headers["X-Riak-Meta-" + k] = String(v);
      }
      if (this.links.length > 0) {
        headers['Link'] = linkUtils.linksToString(this.links, this.raw);
      }
      if (this.data != null) {
        this.encodeData();
        headers['Content-Type'] = this.contentType;
        headers['Content-Length'] = this.data.length;
      }
      if (this.headers) {
        for (k in this.headers) {
          headers[k] = this.headers[k];
        }
        delete this.headers;
      }
      return headers;
    };

    Meta.prototype.doEncodeUri = function(component) {
      if (component == null) component = '';
      if (this.encodeUri) {
        return encodeURIComponent(component.replace(/\+/g, "%20"));
      } else {
        return component;
      }
    };

    return Meta;

  })();

  Meta.prototype.__defineGetter__('path', function() {
    var bq, kq, qs, queryString;
    queryString = this.stringifyQuery(this.queryProps);
    bq = this.bucket ? "/" + (this.doEncodeUri(this.bucket)) : '';
    kq = this.key ? "/" + (this.doEncodeUri(this.key)) : '';
    qs = queryString ? "?" + queryString : '';
    return "/" + this.raw + bq + kq + qs;
  });

  Meta.prototype.__defineGetter__('queryProps', function() {
    var queryProps;
    var _this = this;
    queryProps = {};
    Meta.queryProperties.forEach(function(prop) {
      if (_this[prop] != null) return queryProps[prop] = _this[prop];
    });
    return queryProps;
  });

  Meta.defaults = {
    host: 'localhost',
    port: 8098,
    accept: 'multipart/mixed, application/json;q=0.7, */*;q=0.5',
    responseEncoding: 'utf8',
    connection: 'close'
  };

  Meta.queryProperties = ['r', 'w', 'dw', 'rw', 'keys', 'props', 'vtag', 'returnbody', 'chunked', 'buckets', 'q', 'start', 'rows', 'wt', 'sort', 'presort', 'filter', 'fl'];

  Meta.riakProperties = ['statusCode', 'host', 'responseEncoding', 'noError404', 'index'];

  module.exports = Meta;

  linkUtils = {
    stringToLinks: function(links) {
      var result;
      result = [];
      if (links) {
        links.split(',').forEach(function(link) {
          var captures, i;
          captures = link.trim().match(/^<\/([^\/]+)\/([^\/]+)\/([^\/]+)>;\sriaktag="(.+)"$/);
          if (captures) {
            for (i in captures) {
              captures[i] = decodeURIComponent(captures[i]);
            }
            return result.push({
              bucket: captures[2],
              key: captures[3],
              tag: captures[4]
            });
          }
        });
      }
      return result;
    },
    linksToString: function(links, raw) {
      var _this = this;
      return links.map(function(link) {
        return "</" + raw + "/" + (encodeURIComponent(link.bucket)) + "/" + (encodeURIComponent(link.key)) + ">; riaktag=\"" + (encodeURIComponent(link.tag || "_")) + "\"";
      }).join(", ");
    }
  };

}).call(this);
