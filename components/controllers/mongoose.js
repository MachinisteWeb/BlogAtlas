var website = {};

(function (publics) {
    "use strict";

    publics.initialisation = function (mongoose, address, callback) {
        mongoose.connect(address, function (error) {
            if (error) {
                console.log("La base '" + address + "' n'est pas accessible.");
                process.kill(process.pid);
            };

            callback(mongoose);
        });
        
        mongoose.connection.on('error', function (error) {
            console.log('Erreur pour la connexion par défaut à Mongoose: ' + error);
        });

        mongoose.connection.on('disconnected', function () {
            console.log('Connexion par défaut à Mongoose déconnectée.');
        });

        process.on('SIGINT', function (error) {
            mongoose.connection.close(function () {
                console.log('Connexion par défaut à Mongoose déconnectée en raison de l\'arrêt de l\'app termination');
                process.exit(0);
            });
        });
    };

}(website));

exports.initialisation = website.initialisation;