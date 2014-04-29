/*------------------------------------*\
    $%SUMMARY
\*------------------------------------*/

/**
 * SUMMARY.............It's me !
 * GLOBAL..............Define global variables.
 * COMMON..............This functions are used on more one page, and execute on each pages.
 * ARTICLE.............This functions are used only on associate template.
 * LOGIN.............This functions are used only on associate template.
 * START PROCESS.......Run all JavaScript common / specific.
 */





/*------------------------------------*\
    $%GLOBAL
\*------------------------------------*/

var website = {},
    $window = $(window),
    $body = $("body"),
    $base = $("base");


/*------------------------------------*\
    $%COMMON
\*------------------------------------*/

(function (publics) {
    "use strict";

    var privates = {};

    publics.init = function () {
        if (!Modernizr.touch) {
            var $sh = $(".prettyprint").css("overflow","hidden");
            $sh.mousedown(function (e) {
                $.data(this, "draggable", true);
                $.data(this, "offset", e.pageX);
            }).mouseup(function () {
                $.data(this, "draggable", false);
                $.data(this, "offset", 0);
            }).mouseleave(function () {
                $.data(this, "draggable", false);
                $.data(this, "offset", 0);
            }).mousemove(function (e) {
                if ($(this).data("draggable")) {
                    $(this).scrollLeft(parseInt($(this).scrollLeft() + ($(this).data("offset") - e.pageX), 10));
                    $.data(this, "offset", e.pageX);
                }
            }).data("draggable", false).data("offset", 0);
        }
    };
}(website));





/*------------------------------------*\
    $%ARTICLE
\*------------------------------------*/

(function (publics) {
    "use strict";

    var privates = {},
        socket = io.connect();

    privates.uploadImage = function () {
        var $formAvatar = $(".form-upload-avatar"),
            $imageAvatar = $(".image-upload-avatar"),
            $fileAvatar = $(".file-upload-avatar"),
            $buttonAvatar = $(".button-upload-avatar");

        $buttonAvatar.click(function () {
            if ($fileAvatar !== '') {
                $formAvatar.submit();
            }
        });
 
        $formAvatar.submit(function (event) {
            event.preventDefault();

            $(this).ajaxSubmit({
                error: function (xhr) {
                    console.log('Error: ' + xhr.status);
                },
                success: function(response) {
                    $imageAvatar.attr("src", $base.attr("href") + response.url);
                    $fileAvatar.attr("data-url", response.url);
                }
            });    
         });
    };
    privates.createArticle = function () {
        $(".create-article-button").click(function () {
            var $this = $(this);

            socket.emit('create-article-button', {
                title: $("#create-article-title").val(),
                urn: $(".no-article").data("urn")
            });
        });
    };


    privates.updateArticle = function () {
        var $title = $("h1"),
            $content = $(".text"),
            $article = $("article.article");

        socket.on('update-article-load-content', function (data) {
            // Title part.
            $title.after(
                $('<input type="text" class="field-title like-h1">').val($title.html())
            ).css("display", "none");

            // Text part.
            $content.after(
                $('<textarea class="field-content" cols="30" rows="10"></textarea>').val(data.content)
            ).css("display", "none");
        });

        $(".update-article-button").click(function () {
            var $this = $(this),
                $fieldTitle,
                $fieldContent;

            if (!$this.data("state")) {
                $this.data("state", true);

                socket.emit('update-article-load-content', {
                    urn: $article.data("urn")
                });
            } else {
                $fieldTitle = $(".field-title");
                $fieldContent = $(".field-content");

                socket.emit('update-article-button', {
                    urn: $article.data("urn"),
                    title: $fieldTitle.val(),
                    content: $fieldContent.val(),
                    publishedDate: $("time").attr("datetime"),
                    markdown: $article.data("markdown")
                });

                $this.data("state", false);
            }
        });
    };

    privates.listeningCreateArticle = function () {
        socket.on('create-article-button', function (data) {
            location.href = $base.attr("href") + data.urn + "/";
        });
    };

    privates.listeningUpdateArticle = function () {
        var $title = $("h1"),
            $content = $(".text");

        socket.on('update-article-button-broadcast', function (data) {
            var $fieldTitle = $(".field-title"),
                $fieldContent = $(".field-content");
                
            $title.html(data.title);
            $content.html(data.content);
        });

        socket.on('update-article-button', function () {
            var $fieldTitle = $(".field-title"),
                $fieldContent = $(".field-content");

            $title.css("display", "");
            $content.css("display", "");
            $fieldTitle.remove();
            $fieldContent.remove();
        });
    };

    publics.init = function () {
        privates.createArticle();
        privates.listeningCreateArticle();
        privates.updateArticle();
        privates.listeningUpdateArticle();
        //privates.uploadImage();
    };
}(website.article = {}));





/*------------------------------------*\
    $%LOGIN
\*------------------------------------*/

(function (publics) {
    "use strict";

    var privates = {},
        socket = io.connect();

    privates.accountLogin = function () {
        $(".account-login-button").click(function () {
            var data = {
                email: $("#account-login-email").val(),
                password: $("#account-login-password").val()
            }

            socket.emit('account-login', data);
        });
    };

    privates.listeningAccountLogin = function () {
        socket.on('account-login', function (data) {
            if (data.authSuccess) {
                location.reload();
            } else {
                $(".submit .errors ").show();
            }
        });
    };

    privates.accountLogout = function () {
        $(".account-logout-button").click(function () {
            socket.emit('account-logout', {});
        });
    };

    privates.listeningAccountLogout = function () {
        socket.on('account-logout', function (data) {
            location.reload();
        });
    };

    publics.init = function () {
        privates.accountLogin();
        privates.listeningAccountLogin();
        privates.accountLogout();
        privates.listeningAccountLogout();
    };
}(website.login = {}));





/*------------------------------------*\
    $%START PROCESS
\*------------------------------------*/

$(function () {
    "use strict";

    var specific = $body.attr("class").split(" ")[0].replace(/-/g, '');

    // Launch Common JavaScript.
    website.init();

    // Launch Specific JavaScript.
    if (website[specific] !== undefined) {
        website[specific].init();
    } else {
        console.log('No JavaScript for ' + specific);
    }
});