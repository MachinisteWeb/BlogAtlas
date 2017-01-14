////////////////////////////////////////////
// Jeu du Taquin en jQuery sur vos sites. //
//////////////////////////////////////////////
// Auteur : Bruno Lesieur - www.haeresis.fr //
//////////////////////////////////////////////
(function ($) {
    "use strict";

    // ==Description==
    // Pour chaque Ã©lÃ©ment 'fn' :
    // CrÃ©Ã© un nouvel Ã©lÃ©ment juste aprÃ¨s l'image cible composÃ©e de <div> en absolute. 
    // Un clique permet de mÃ©langer le jeu.
    // La rÃ©solution du tableau remet les Ã©lÃ©ments aux Ã©tats initiaux.

    // ==image==
    // Ceci rÃ©prÃ©sente l'adresse de l'image qui sera fractionnÃ©e pour Ãªtre jouÃ©e.

    // ==params==
    // width : Indique la taille que fait l'image en largeur. Si rien ou zÃ©ro est prÃ©cisÃ©, la taille par dÃ©faut est celle de l'image.
    // height : Indique la taille que fait l'image en hauteur. Si rien ou zÃ©ro est prÃ©cisÃ©, la taille par dÃ©faut est celle de l'image.
    // division : Indique le nombre de carrÃ© en largeur/hauteur qui compose le taquin.
    // hidePart : Indique quelle partie du carrÃ© est masquÃ©e pour faire office de trou pour les dÃ©placements. Les valeurs possibles sont Haut Gauche "tl", Haut droite "tr", Bas gauche "bl", Bas droite "br" (par dÃ©faut).
    // mixing : Indique le nombre de dÃ©placement fait alÃ©atoirement pour simuler un mÃ©lange Ã  la main du taquin.
    // success : Si Ã©crasÃ© par une fonction, exÃ©cute cette fonction en cas de complÃ©tion du taquin. Sinon, renvoi sous chaine de caractÃ¨re le message passÃ© dans un "alert()".

    $.fn.gameTaquin = function (image, params, success) {

        // ParamÃ¨tres initiaux Ã©crasÃ©s s'ils sont passÃ©s en paramÃ¨tres d'entrÃ©es.
        params = $.extend({
            width: 0,
            height: 0,
            division: 4,
            hidePart: "br",
            mixing: 200,
            success: "Complete"
        }, params);

        // Si la division est infÃ©rieur Ã  2, la valeur est 2.
        if (params.division < 2) { params.division = 2; }

        // Fonction Ã©xÃ©cutÃ©e par dÃ©faut en cas de succÃ¨s.
        if (!$.isFunction(params.success)) {
            var temp = params.success;
            params.success = function () {
                alert(temp);
            };
        }

        /***********************************************/
        /** Initialisation des variables et fonctions **/
        /***********************************************/

        var clickFunction,
            gameStart,
            gameState,
            squareWidth = 0,
            squareHeight = 0;

        // CrÃ©er les Ã©tats de jeu.
        function initialiseGameVar(gameDivision) {
            var game = [],
                gameRow,
                gameDiv,
                xi = 0,
                yi = 0,
                currentDisplay;

            for (xi = 0; xi < gameDivision; xi += 1) {
                gameRow = [];
                for (yi = 0; yi < gameDivision; yi += 1) {
                    gameDiv = [];

                    currentDisplay = true;
                    if ((xi === 0) && (yi === 0) && (params.hidePart === "tl")) { currentDisplay = false; }
                    if ((xi === (gameDivision - 1)) && (yi === 0) && (params.hidePart === "tr")) { currentDisplay = false; }
                    if ((xi === 0) && (yi === (gameDivision - 1)) && (params.hidePart === "bl")) { currentDisplay = false; }
                    if ((xi === (gameDivision - 1)) && (yi === (gameDivision - 1)) && (params.hidePart === "br")) { currentDisplay = false; }

                    gameDiv[0] = currentDisplay;
                    gameDiv[1] = "taquin-" + xi + "-" + yi;
                    gameRow[yi] = gameDiv;
                }
                game[xi] = gameRow;
            }

            return game;
        }

        // RepÃ©rÃ© la case dans le jeu.
        function getId(taquin) {
            var classList = taquin.attr("class").split(/\s+/),
                result = "";

            $.each(classList, function (index, item) {
                if (index === 0) {
                    result = item;
                }
            });

            return result;
        }

        function getCoord(id) {
            var coord = [],
                xi = 0,
                yi = 0;

            for (xi = 0; xi < gameStart.length; xi += 1) {
                for (yi = 0; yi < gameStart[0].length; yi += 1) {
                    if (gameState[xi][yi][1] === id) {
                        coord[0] = xi;
                        coord[1] = yi;
                    }
                }
            }

            return coord;
        }

        // RepÃ©rÃ© l'Ã©lÃ©ment vide.
        function getEmpty() {
            var empty = [],
                xi = 0,
                yi = 0;

            for (xi = 0; xi < gameStart.length; xi += 1) {
                for (yi = 0; yi < gameStart[0].length; yi += 1) {
                    if (gameState[xi][yi][0] === false) {
                        empty[0] = xi;
                        empty[1] = yi;
                        empty[2] = gameState[xi][yi][1];
                    }
                }
            }

            return empty;
        }

        // vÃ©rifier si un Ã©lÃ©ment peut Ãªtre bougÃ©.
        function getIsMovable(x, y) {
            var isMovable = false;

            try {
                if (gameState[x][y - 1][0] === false) { isMovable = true; }
            } catch (err1) {}
            try {
                if (gameState[x + 1][y][0] === false) { isMovable = true; }
            } catch (err2) {}
            try {
                if (gameState[x][y + 1][0] === false) { isMovable = true; }
            } catch (err3) {}
            try {
                if (gameState[x - 1][y][0] === false) { isMovable = true; }
            } catch (err4) {}

            return isMovable;
        }

        // MÃ©lange piÃ¨ce.
        function randomGame(mixing) {
            var empty,
                possibleMove,
                temp,
                i = 0,
                j = 0,
                xi = 0,
                yi = 0,
                xj = 0,
                yj = 0,
                rand = 0,
                newPosTop = 0,
                newPosLeft = 0;

            for (j = 0; j < mixing; j += 1) {
                empty = getEmpty();
                possibleMove = [];
                i = 0;

                // On cherche les voisins dÃ©plaÃ§able.
                try { if (gameState[empty[0]][empty[1] - 1][0] === true) {
                    possibleMove[i] = [];
                    possibleMove[i][0] = empty[0];
                    possibleMove[i][1] = empty[1] - 1;
                    i += 1;
                } } catch (err1) {}
                try { if (gameState[empty[0] + 1][empty[1]][0] === true) {
                    possibleMove[i] = [];
                    possibleMove[i][0] = empty[0] + 1;
                    possibleMove[i][1] = empty[1];
                    i += 1;
                } } catch (err2) {}
                try { if (gameState[empty[0]][empty[1] + 1][0] === true) {
                    possibleMove[i] = [];
                    possibleMove[i][0] = empty[0];
                    possibleMove[i][1] = empty[1] + 1;
                    i += 1;
                } } catch (err3) {}
                try { if (gameState[empty[0] - 1][empty[1]][0] === true) {
                    possibleMove[i] = [];
                    possibleMove[i][0] = empty[0] - 1;
                    possibleMove[i][1] = empty[1];
                    i += 1;
                } } catch (err4) {}

                // On choisit au hasard le voisin Ã  interchanger.
                rand = Math.floor(Math.random() * possibleMove.length);

                // On l'interchange dans l'Ã©tat de jeu.
                temp = gameState[empty[0]][empty[1]];
                gameState[empty[0]][empty[1]] = gameState[possibleMove[rand][0]][possibleMove[rand][1]];
                gameState[possibleMove[rand][0]][possibleMove[rand][1]] = temp;
            }

            // On trouve les dÃ©placements pour l'animation.
            // Pour chaque Ã©lÃ©ment positionnÃ© au dÃ©part.
            for (xi = 0; xi < gameStart.length; xi += 1) {
                for (yi = 0; yi < gameStart[0].length; yi += 1) {
                    // On cherche sa nouvelle position
                    for (xj = 0; xj < gameState.length; xj += 1) {
                        for (yj = 0; yj < gameState[0].length; yj += 1) {
                            // On trouve la nouvelle position.
                            if (gameStart[xi][yi][1] === gameState[xj][yj][1]) {
                                // On rÃ©cupÃ¨re les coordonnÃ©es de la nouvelle position.
                                if (gameStart[xi][yi][0] === true) {
                                    newPosTop = parseInt((squareHeight * yj) - $(".taquin-" + xi + "-" + yi).position().top, 10) + "px";
                                    newPosLeft = parseInt((squareWidth * xj) - $(".taquin-" + xi + "-" + yi).position().left, 10) + "px";

                                    $(".taquin-" + xi + "-" + yi).animate({
                                        top: "+=" + newPosTop,
                                        left: "+=" + newPosLeft
                                    });
                                } else {
                                    $(".taquin-" + xi + "-" + yi).css({
                                        "top": (squareHeight * yj),
                                        "left": (squareWidth * xj)
                                    });
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        // DÃ©marrer le jeu
        function launcher(generate) {
            // On enlÃ¨ve l'intialisation de jeu.
            generate.find(".taquin-part").unbind("click");

            // On cherche l'Ã©lÃ©ment vide.
            var empty = getEmpty();

            $("." + empty[2]).animate({ opacity: "0" }, function () {
                // On le cache.
                $(this).hide();

                // On mÃ©lange le jeu.
                randomGame(params.mixing);

                // Annules toutes les animations s'il y en a de pas finie.
                generate.find(".taquin-part").clearQueue();

                // Permettre le dÃ©placement des piÃ¨ces, jeu jouable !
                generate.find(".taquin-part").bind("click", function () {
                    clickFunction(generate, $(this));
                });
            });
        }

        // Quand on clique sur une partie aprÃ¨s le lancement du jeu.
        clickFunction = function (generate, source) { // rempli ici mais dÃ©fini plus haut car appelÃ© dans la fonction d'au dessus.
            var empty,
                moveTop = 0,
                moveLeft = 0,
                tempTop = 0,
                tempLeft = 0,
                temp,

            // Identifier l'Ã©lÃ©ment.
                id = getId(source),

            // Trouver sa position dans le jeu.
                coord = getCoord(id),

            // VÃ©rifier si il est dÃ©plaÃ§able.
                isMovable = getIsMovable(coord[0], coord[1]);

            // Si il est dÃ©plaÃ§able, interchanger les positions.
            if (isMovable) {
                // Trouver l'Ã©lÃ©ment vide.
                empty = getEmpty();

                // On trouve les dÃ©placements pour l'animation.
                generate.find("." + empty[2]).show();
                moveTop = generate.find("." + id).position().top - generate.find("." + empty[2]).position().top;
                moveLeft = generate.find("." + id).position().left - generate.find("." + empty[2]).position().left;
                generate.find("." + empty[2]).hide();

                //On met les variable en temporaire pour l'interchangement.
                tempTop = source.position().top;
                tempLeft = source.position().left;

                // On inverse les positions de l'Ã©lÃ©ments vide.
                temp = gameState[coord[0]][coord[1]];
                gameState[coord[0]][coord[1]] = gameState[empty[0]][empty[1]];
                gameState[empty[0]][empty[1]] = temp;

                // On anime le changement.
                source.unbind("click").animate({
                    top: "-=" + moveTop,
                    left: "-=" + moveLeft
                }, function () {
                    source.bind("click", function () {
                        clickFunction(generate, source);
                    });

                    // Si l'Ã©tat initial aprÃ¨s animation est le mÃªme que l'Ã©tat actuel, on a fini le jeu.
                    if (gameState.toString() === gameStart.toString()) {
                        // On enlÃ¨ve les fonctions de dÃ©placement.
                        generate.find(".taquin-part").unbind("click");

                        // On cherche l'Ã©lÃ©ment vide pour le rÃ©-afficher.
                        var empty = getEmpty();
                        $("." + empty[2]).show().animate({ opacity: "1" }, function () {
                            // On replace le mÃ©canisme de dÃ©marrage du jeu.
                            generate.find(".taquin-part").bind("click", function () {
                                launcher(generate);
                            });
                            // On exÃ©cute la fonction de rÃ©ussite.
                            params.success();
                        });
                    }
                });

                generate.find("." + empty[2]).css({
                    "top": tempTop + "px",
                    "left": tempLeft + "px"
                });
            }
        };

        // Fonction exÃ©cutÃ©e sur chaque Ã©lÃ©ment sÃ©lectionnÃ© comme model pour devenir un taquin.
        function taquin(generate, imageOriginalSize) {
            var gameDivision = params.division,
                imageWidth = 0,
                imageHeight = 0,
                xi = 0,
                yi = 0,
                backgroundSizeString;

            // RÃ©cupÃ¨re la largeur et hauteur des partis du taquin.
            if (parseInt(params.width, 10) !== 0) { imageWidth = params.width; } else { imageWidth = imageOriginalSize[0]; }
            if (parseInt(params.height, 10) !== 0) { imageHeight = params.height; } else { imageHeight = imageOriginalSize[1]; }
            squareWidth = Math.round(imageWidth / gameDivision);
            squareHeight = Math.round(imageHeight / gameDivision);

            // Initialise l'Ã©tat initial et actuelle du jeu.
            gameStart = initialiseGameVar(gameDivision);
            gameState = initialiseGameVar(gameDivision);

            generate.css({
                "position": "relative",
                "width": imageWidth + "px",
                "height": imageHeight + "px"
            });

            // GÃ©nÃ©rer les partis du taquin.
            for (xi = 0; xi < gameStart.length; xi += 1) {
                for (yi = 0; yi < gameStart[0].length; yi += 1) {
                    backgroundSizeString = ((params.width != 0) ? params.width : imageOriginalSize[0]) + "px " + ((params.height != 0) ? params.height : imageOriginalSize[1]) + "px";
                    $("<div>", {
                        css: {
                            cursor: "pointer",
                            backgroundImage: "url('" + image + "')",
                            backgroundPosition : "-" + parseInt(squareWidth * xi, 10) + "px -" + parseInt(squareHeight * yi, 10) + "px",
                            "background-size" : backgroundSizeString,
                            position: "absolute",
                            top: parseInt(squareHeight * yi, 10) + "px",
                            left: parseInt(squareWidth * xi, 10) + "px",
                            width: squareWidth + "px",
                            height: squareHeight + "px"
                        }
                    }).appendTo(generate).addClass(gameStart[xi][yi][1]).addClass("taquin-part");
                }
            }

            // Permettre de dÃ©marrer le jeu.
            generate.find(".taquin-part").bind("click", function () {
                launcher(generate);
            });
        }

        // S'execute pour chaque Ã©lÃ©ment 'fn' trouvÃ©.
        return this.each(function () {

            // Information sur l'image.
            var waitForImageSize,
                forImage = new Image(),
                element = $(this),
                imageSize = [];

            forImage.src = image;

            // Quand on obtient une taille pour l'image, on execute le mÃ©canisme.
            waitForImageSize = setInterval(function () {
                if (forImage.width !== 0) {
                    imageSize[0] = forImage.width;
                    imageSize[1] = forImage.height;

                    // GÃ©nÃ¨re l'Ã©lÃ©ment qui contiendra les partis du taquin.
                    var generate = $("<div>").addClass("taquin-generate");
                    if (element.next().hasClass("taquin-generate")) {
                        element.next().remove();
                    }
                    element.after(generate);

                    taquin(generate, imageSize);
                    clearInterval(waitForImageSize);
                }
            }, 50);
        });
    };
}(jQuery));