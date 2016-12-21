/* jslint node: true */
var website = {};

(function (publics) {
	"use strict";

	publics.changeVariations = function (params, next) {
		var variations = params.variations,
			/*sessionID = params.request.sessionID,*/
			session = params.request.session;

		//console.log("changeVariations");
		//console.log(sessionID);
		//console.log(session);

		/*if (session.account) {
			console.log("Loggué !");
		} else {
			console.log("Non loggué !");
		}*/

		variations.session = session;

		next(variations);
	};

	publics.setSockets = function () {
		var NA = this,
			io = NA.io;

		io.sockets.on('connection', function (socket) {
			var /*sessionID = socket.request.sessionID,*/
				session = socket.request.session;

			socket.on('account-login', function (data) {
				var dataResponse = {};

				if (!session.account) {
					if (data.email === NA.webconfig._emailAccountAuth &&
						data.password === NA.webconfig._passwordAccountAuth)
					{
						session.account = {};
						session.touch().save();

						dataResponse.authSuccess = true;
					} else {
						dataResponse.authSuccess = false;
					}

					socket.emit('account-login', dataResponse);
				}
			});

			socket.on('account-logout', function (data) {
				if (session.account) {
					session.account = undefined;
					session.touch().save();

					socket.emit('account-logout', data);
				}
			});
  		});
	};

}(website));

exports.setSockets = website.setSockets;
exports.changeVariations = website.changeVariations;
exports.asynchrones = website.asynchrones;