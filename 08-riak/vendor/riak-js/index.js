
  module.exports = {
    http: function(options) {
      return new this.HttpClient(options);
    },
    https: function(options) {
      return new this.HttpsClient(options);
    },
    protobuf: function(options) {
      var cli, pool;
      options || (options = {});
      pool = options.pool;
      delete options.pool;
      pool || (pool = new this.ProtobufPool(options));
      cli = new this.ProtobufClient(options);
      cli.pool = pool;
      return cli;
    },
    defaults: {
      api: 'http'
    },
    getClient: function(options) {
      options || (options = {});
      options.api || (options.api = module.exports.defaults.api);
      return module.exports[options.api](options);
    }
  };

  module.exports.__defineGetter__('HttpClient', function() {
    return this._httpClient || (this._httpClient = require('./http_client'));
  });

  module.exports.__defineGetter__('HttpsClient', function() {
    return this._httpsClient || (this._httpsClient = require('./https_client'));
  });

  module.exports.__defineGetter__('ProtobufClient', function() {
    return this._pbcClient || (this._pbcClient = require('./protobuf_client'));
  });

  module.exports.__defineGetter__('ProtobufPool', function() {
    return this._pbcPool || (this._pbcPool = require('./protobuf'));
  });

  module.exports.__defineGetter__('TestServer', function() {
    return this._testServer || (this._testServer = require('./test_server'));
  });
