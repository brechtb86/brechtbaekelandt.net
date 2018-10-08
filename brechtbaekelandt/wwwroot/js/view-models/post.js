/// <reference path="../addthis/addthis_widget.js" />
/// <reference path="../../lib/knockout-mapping/build/output/knockout.mapping-latest.debug.js" />

var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.post = (function ($, jQuery, ko, undefined) {
    "use strict";

    function PostViewModel(serverViewModel) {
        var self = this;

        ko.mapping.fromJS(serverViewModel, {}, self);

        self.likedPostsIds = $.cookie("likedPostsIds") ? ko.mapping.fromJSON($.cookie("likedPostsIds")) : ko.observableArray();

        self.post.liked = ko.observable(self.likedPostsIds().filter(function (postId) { return postId === self.post.id() }).length > 0);

        self.addStyledDescriptionToPost(self.post);
        self.addStyledContentToPost(self.post);

        self.newComment = {};
        self.newComment.title = ko.observable();
        self.newComment.content = ko.observable().extend({ required: { message: "you didn't fill in the comment!" } });
        self.newComment.name = ko.observable().extend({ required: { message: "you didn't fill in your name!" } });
        self.newComment.emailAddress = ko.observable().extend({ email: { message: "the email address is not valid!" } });

        self.isTyping = ko.observable();

        self.addCommentErrors = ko.validation.group(self.newComment);

        self.addCommentSucceededMessage = ko.observable();
        self.addCommentErrorMessage = ko.observable();
        self.deleteCommentSucceededMessage = ko.observable();
        self.deleteCommentErrorMessage = ko.observable();
        self.addCommentValidationMessages = ko.observableArray();
        self.captchaInvalidMessage = ko.observable();

        self.captchaAttemptedValue = ko.observable().extend({ required: { message: "you must fill in the captcha!" } });
        self.captchaImage = ko.observable();

        self.captchaError = ko.validation.group({ captchaAttemptedValue: self.captchaAttemptedValue });

        self.getCaptcha("commentCaptcha");

        self.initAddThis();
        self.initFancyBox();
        self.initPrettify();
    };

    PostViewModel.prototype.addComment = function (comment, postId) {
        var self = this;

        self.addCommentSucceededMessage("");
        self.addCommentErrorMessage("");
        self.addCommentValidationMessages([]);
        self.captchaInvalidMessage("");

        if (self.addCommentErrors().length > 0) {
            self.addCommentErrors.showAllMessages();
            return;
        }

        if (self.captchaError().length > 0) {
            self.captchaError.showAllMessages();
            return;
        }

        $.ajax({
            url: "../../api/blog/post/add-comment?postId=" + postId,
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            data: ko.toJSON(comment),
            headers: {
                "captchaAttemptedValue": self.captchaAttemptedValue()
            },
            dataType: "json",
            cache: false,
            processData: false,
            async: false,
            success: function (data, textStatus, jqXhr) { }
        })
            .done(function (data, textStatus, jqXhr) {
                self.addCommentSucceededMessage("the comment was added!");

                self.post.comments.unshift(ko.mapping.fromJS(data));

                self.newComment.title("");
                self.newComment.content("");
                self.newComment.name("");
                self.newComment.emailAddress("");

                self.addCommentErrors.showAllMessages(false);

                self.captchaAttemptedValue("");

                self.captchaError.showAllMessages(false);

                self.getCaptcha("commentCaptcha");
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                if (jqXhr.status === 400) {

                    var response = jqXhr.responseJSON;

                    if (response.error === "validation") {
                        ko.mapping.fromJS(response.validationErrors, self.addCommentValidationMessages);
                    };

                    if (response.error === "invalidCaptcha") {
                        self.captchaInvalidMessage(response.errorMessage);
                    };

                    if (response.error === "noCaptcha") {
                        self.captchaInvalidMessage("you didn't pass the captcha cookie!");
                    };
                } else {
                    self.addCommentErrorMessage("there was a problem submitting the comment, please try again");
                }
            })
            .always(function (data, textStatus, jqXhr) {

            });
    };

    PostViewModel.prototype.deleteComment = function (comment) {
        var self = this;

        self.deleteCommentSucceededMessage(null);
        self.deleteCommentErrorMessage(null);

        $.ajax({
            url: "../../api/blog/post/delete-comment?commentId=" + comment.id(),
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            cache: false,
            processData: false,
            async: false,
            success: function (data, textStatus, jqXhr) { }
        })
            .done(function (data, textStatus, jqXhr) {
                self.post.comments.splice(self.post.comments.indexOf(comment, 1));

                self.deleteCommentSucceededMessage("the comment was successfully deleted");
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.deleteCommentErrorMessage("there was a problem while deleting the comment.");
            })
            .always(function (data, textStatus, jqXhr) {

            });
    }

    PostViewModel.prototype.likePost = function (post) {
        var self = this;

        $.ajax({
            url: "../../api/blog/post/like?postId=" + post.id(),
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            cache: false,
            processData: false,
            async: false,
            success: function (data, textStatus, jqXhr) { }
        })
            .done(function (data, textStatus, jqXhr) {
                self.likedPostsIds.push(post.id());

                $.cookie("likedPostsIds", ko.toJSON(self.likedPostsIds()), { expires: 365, path: "/" });

                post.liked(true);

                post.likes(data);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {

            })
            .always(function (data, textStatus, jqXhr) {

            });
    }

    PostViewModel.prototype.unlikePost = function (post) {
        var self = this;

        $.ajax({
            url: "../../api/blog/post/unlike?postId=" + post.id(),
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            cache: false,
            processData: false,
            async: false,
            success: function (data, textStatus, jqXhr) { }
        })
            .done(function (data, textStatus, jqXhr) {
                self.likedPostsIds.splice(self.likedPostsIds.indexOf(post.id(), 1));

                $.cookie("likedPostsIds", ko.toJSON(self.likedPostsIds()), { expires: 365, path: "/" });

                post.liked(false);

                post.likes(data);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {

            })
            .always(function (data, textStatus, jqXhr) {

            });
    }

    PostViewModel.prototype.addStyledDescriptionToPost = function (post) {
        post.styledDescription = ko.computed(function () {
            var tempStyledDescription = post.description();

            if (post.pictureUrl()) {
                var afterFirstClosingTagIndex = post.description().indexOf(">") + 1;

                if (afterFirstClosingTagIndex > -1) {
                    tempStyledDescription = [post.description().slice(0, afterFirstClosingTagIndex), "<a href =\"" + post.pictureUrl() + "\" data-fancybox data-caption=\"" + post.title() + "\"><img src=\"" + post.pictureUrl() + "\" class=\"post-picture post-preview-picture img-thumbnail\" /></a>", post.description().slice(afterFirstClosingTagIndex)].join("");
                }
            }

            return tempStyledDescription;
        });
    };

    PostViewModel.prototype.addStyledContentToPost = function (post) {
        post.styledContent = ko.computed(function () {
            if (post.content()) {
                var tempStyledContent = post.content();

                var imgMatches = post.content().match(/(<img.*?src=[\"'](.+?)[\"'].*?>)/g);

                if (imgMatches) {
                    imgMatches.forEach(function (imgMatch) {
                        var imgTag = imgMatch;
                        var imgSrc = imgMatch.match(/src\s*=\s*"(.+?)"/)[1];

                        tempStyledContent = tempStyledContent.replace(imgTag,
                            "<a href=\"" + imgSrc + "\" data-fancybox>" + imgTag + "</a>");
                    });
                }

                return tempStyledContent;
            }

            return null;
        });
    };

    PostViewModel.prototype.getCaptcha = function (captchaName) {
        var self = this;

        self.captchaInvalidMessage("");

        $.ajax({
            url: "../../api/captcha/?captchaName=" + captchaName,
            type: "GET",
            success: function (data, textStatus, jqXhr) { },
            async: false
        })
            .done(function (data, textStatus, jqXhr) {
                self.captchaImage(data);

                self.captchaAttemptedValue("");

                self.captchaError.showAllMessages(false);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {

            })
            .always(function (data, textStatus, jqXhr) {

            });
    };

    PostViewModel.prototype.initFancyBox = function () {
        try {
            $("[data-fancybox]").fancybox({
                buttons: [
                    //'slideShow',
                    "fullScreen",
                    //'thumbs',
                    //'share',
                    "download",
                    "zoom",
                    "close"
                ]
            });
        } catch (e) {

        }
    }

    PostViewModel.prototype.initAddThis = function () {
        try {
            addthis.init();

            if (addthis.layers.refresh) {
                addthis.layers.refresh();
            }
        } catch (e) {

        }
    }

    PostViewModel.prototype.initPrettify = function () {
        try {
            PR.prettyPrint();
        } catch (e) {

        }
    }

    function init(serverViewModel) {
        var viewModel = new PostViewModel(serverViewModel);

        ko.applyBindings(viewModel);
    };

    return {
        PostViewModel: PostViewModel,
        init: init
    };

})($, jQuery, ko);