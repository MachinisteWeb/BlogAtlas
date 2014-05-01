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

var website = website || {},
    $window = $(window),
    $body = $("body"),
    $base = $("base");


/*------------------------------------*\
    $%COMMON
\*------------------------------------*/

(function (publics) {
    "use strict";

    var privates = {};

    publics.jQueryUiLoading = function (callback) {
        Modernizr.load({
            test: $('script[src="javascript/jquery/jquery-ui.js"]').length === 0,
            yep: [
                'stylesheets/jquery/jquery-ui.css',
                'javascript/jquery/jquery-ui.js',
                'javascript/jquery/jquery.timepicker.js'
            ],
            complete: function () {
                if (typeof callback === 'function') {
                    callback();
                }
            }
        });
    };

     publics.prettifyLoad = function () {
        prettyPrint();
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

    publics.disqusLoading = function () {
        var disqus_shortname = 'lesieur',
            disqus_identifier = $("article.article").data("urn"),
            disqus_url = $(".permalink span").text().split("?")[0];

        Modernizr.load({
            test: $('script[src="//' + disqus_shortname + '.disqus.com/embed.js"]').length === 0,
            yep: '//' + disqus_shortname + '.disqus.com/embed.js',
            complete: function () {
                DISQUS.reset({
                  reload: true,
                  config: function () {
                    this.page.identifier = disqus_identifier;
                    this.page.url = disqus_url;
                  }
                });
            }
        });
    };

    publics.init = function () {

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
        var $title = $(".content h1"),
            $content = $(".text"),
            $date = $(".published a"),
            $article = $("article.article"),
            $fieldPublished,
            $fieldMarkdown;

        socket.on('update-article-load-content', function (data) {
            // Title part.
            $title.after(
                $('<input type="text" class="field-title like-h1">').val($title.html())
            ).css("display", "none");

            // Published part.
            $content.after('<span class="field-published"><input type="checkbox"> Visible ?</span>');
            $fieldPublished = $(".field-published input");
            $fieldPublished.attr('checked', ($article.attr("data-published") === "true"));

            // Markdown part.
            $content.after('<span class="field-markdown"><input type="checkbox"> Markdown ?</span>');
            $fieldMarkdown = $(".field-markdown input");
            $fieldMarkdown.attr('checked', ($article.attr("data-markdown") === "true"));

            // Text part.
            $content.after(
                $('<textarea class="field-content" cols="30" rows="10"></textarea>').val(data.content)
            ).css("display", "none");

            // Date part.
            website.jQueryUiLoading(function () {
                $date.after(
                    $('<input type="text" class="field-date">').val($date.find("time").attr("datetime").replace("T"," ").replace(".000", ""))
                ).css("display", "none");

                $(".field-date").datetimepicker({
                    dateFormat: "yy-mm-dd",
                    timeFormat: "HH:mm:00",
                    changeMonth: true,
                    changeYear: true
                });
            });
        });

        $(".update-article-button").click(function () {
            var $this = $(this),
                $fieldTitle,
                $fieldContent,
                $fieldDate;

            if (!$this.data("state")) {
                $this.data("state", true);

                socket.emit('update-article-load-content', {
                    urn: $article.data("urn")
                });
            } else {
                $fieldTitle = $(".field-title");
                $fieldContent = $(".field-content");
                $fieldDate = $(".field-date");

                socket.emit('update-article-button', {
                    urn: $article.data("urn"),
                    title: $fieldTitle.val(),
                    content: $fieldContent.val(),
                    publishedDate: $fieldDate.val(),
                    published: $fieldPublished.prop("checked"),
                    markdown: $fieldMarkdown.prop("checked")
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
        var $title = $(".content h1"),
            $titlePage = $("title"),
            $content = $(".text"),
            $article = $("article.article"),
            $date = $(".published a");

        socket.on('update-article-button-broadcast', function (data) {
            var date = new Date(data.publishedDate.replace(/ /g, "T") + ".000+01:00"),
                formatDate = website.module.extendedFormatDate(date, data.variation.dates),
                month = date.getMonth() + 1,
                newDateTitle = data.variation.listDate.linkMonth.title.replace(/%year%/g, date.getFullYear()).replace(/%month%/g, data.variation.dates.months[date.getMonth()]),
                newDateHref;


            console.log(date);

            month = ((month.toString().length > 1) ? '' : '0') + month;
            newDateHref = data.variation.listDate.linkMonth.href.replace(/%year%/g, date.getFullYear()).replace(/%month%/g, month);

            $titlePage.text(data.title.replace(/<\/?span>/g, ""));
            $title.html(data.title);
            $content.html(data.content);
            $date.find("time").html(formatDate.string);
            $date.find("time").attr("datetime", formatDate.time);
            $date.attr("title", newDateTitle);
            $date.attr("href", newDateHref);
            $article.attr("data-markdown", data.markdown);

            website.prettifyLoad();
        });

        socket.on('update-article-button', function () {
            var $fieldTitle = $(".field-title"),
                $fieldContent = $(".field-content"),
                $fieldDate = $(".field-date"),
                $fieldMarkdown = $(".field-markdown"),
                $fieldPublished = $(".field-published");

            $title.css("display", "");
            $content.css("display", "");
            $date.css("display", "");
            $fieldTitle.remove();
            $fieldContent.remove();
            $fieldDate.remove();
            $fieldPublished.remove();
            $fieldMarkdown.remove();
        });
    };

    privates.initDisqus = function () {

    };

    publics.init = function () {
        privates.createArticle();
        privates.listeningCreateArticle();
        privates.updateArticle();
        privates.listeningUpdateArticle();
        //privates.uploadImage();

        website.disqusLoading();
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
        //console.log('No JavaScript for ' + specific);
    }
});