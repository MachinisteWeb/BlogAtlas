var website = {};

(function (publics) {
	"use strict";

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation,
			sessionID = params.request.sessionID,
			session = params.request.session;

		//console.log("preRender");
		//console.log(sessionID);
		//console.log(session);

		/*if (session.account) {
			console.log("Loggué !");
		} else {
			console.log("Non loggué !");
		}*/

		variation.session = session;

		mainCallback(variation);
	};

	publics.asynchrones = function (params) {
		var socketio = params.socketio,
			NA = params.NA;

		socketio.sockets.on('connection', function (socket) {
			var sessionID = socket.request.sessionID,
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

exports.preRender = website.preRender;
exports.asynchrones = website.asynchrones;