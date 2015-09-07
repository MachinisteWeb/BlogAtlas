/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.socketio = require('../components/controllers/socket-io');
	website.components.mongoose = require('../components/controllers/mongoose');

	publics.loadModules = function () {
		var NA = this,
			path = NA.modules.path;

		NA.modules.cookie = require('cookie');
		NA.modules.socketio = require('socket.io');
		NA.modules.marked = require('marked');
		NA.modules.mongoose = require('mongoose');
		NA.modules.RedisStore = require('connect-redis');
		NA.modules.rss = require('rss');
		NA.modules.common = require(path.join(NA.websitePhysicalPath, NA.webconfig.variationsRelativePath, 'common.json'));
	};

	publics.setConfigurations = function (next) {
		var NA = this,
			mongoose = NA.modules.mongoose,
			socketio = NA.modules.socketio,
			params = {};

		website.components.mongoose.initialisation(mongoose, 'mongodb://127.0.0.1:27017/blog', function (mongoose) {

			publics.mongooseSchemas(mongoose);

			website.components.socketio.initialisation.call(NA, socketio, function (socketio) {
				params.socketio = socketio;
				website.asynchrones.call(NA, params);
				require('./article').asynchrones.call(NA, params);
				require('./login').asynchrones.call(NA, params);
				next();
			});
		});

	};

	publics.mongooseSchemas = function (mongoose) {
		publics.schemas = {};

		publics.schemas.article = require('../models/Article');
		publics.schemas.category = require('../models/Category');

		mongoose.model('article', website.schemas.article, 'article');
		mongoose.model('category', website.schemas.category, 'category');
	};

	publics.setSessions = function (callback) {
        var NA = this,
        	session = NA.modules.session,
        	RedisStore = NA.modules.RedisStore(session);

        NA.sessionStore = new RedisStore();

		callback();
	};

	publics.asynchrones = function (params) {
		var socketio = params.socketio;

		socketio.sockets.on('connection', function (socket) {
			/* var sessionID = socket.request.sessionID,
				session = socket.request.session; */

			socket.on('update-comment-number', function (options) {
				var http = require('http'),
					request;

				request = http.request(options, function (response) {
				    var data = '';

				    response.on('data', function (chunk) {
				        data += chunk;
				    });

				    response.on('end', function () {
				    	var interestingPart = data.match(/\"counts\":\[(.+)\]/g),
				    		json;

				    	if (interestingPart && interestingPart[0]) {
							json = JSON.parse("{" + interestingPart[0] + "}");
				        	socket.emit('update-comment-number', json);
				    	}
				    });
				});

				request.on('error', function (e) {
				    console.log(e.message);
				});

				request.end();
			});

		});
	};

	publics.changeVariation = function (params, mainCallback) {
		var variation = params.variation,
			session = params.request.session;

		variation.edit = false;
		variation.fs = false;
		variation.fc = false;
		if (session.account) {
			variation.edit = variation.currentRouteParameters.variation;
			variation.fs = variation.edit;
			variation.fc = variation.webconfig.commonVariation;
		}

		mainCallback(variation);
	};

}(website));



exports.loadModules = website.loadModules;
exports.setSessions = website.setSessions;
exports.setConfigurations = website.setConfigurations;
exports.changeVariation = website.changeVariation;