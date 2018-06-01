/// <reference path="../knockout/knockout.extensions.js" />
/// <reference path="../addthis/addthis_widget.js" />
/// <reference path="../../lib/jquery/dist/jquery.js" />
/// <reference path="../../lib/knockout-mapping/build/output/knockout.mapping-latest.debug.js" />
/// <reference path="../helpers/helpers.js" />
/// <reference path="../../lib/fancybox/src/js/core.js" />

var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.home = (function ($, jQuery, ko, undefined) {
    "use strict";

    function HomeViewModel(serverViewModel) {
        var self = this;

        ko.mapping.fromJS(serverViewModel, {}, self);

        self.totalPageCount = ko.computed(function () {
            return Math.ceil(self.totalPostCount() / self.postsPerPage());
        });

        self.isLastPage = ko.observable(self.totalPostCount() === 0 || self.currentPage() === self.totalPageCount());

        document.addEventListener("scroll", function (event) {
            if (((window.innerHeight + window.scrollY) >= document.body.offsetHeight) && (self.currentPage() < self.totalPageCount())) {
                self.getPosts(true);
            }

            if (self.currentPage() === self.totalPageCount()) {
                self.isLastPage(true);
            }
        });

        self.likedPostsIds = $.cookie("likedPostsIds") ? ko.mapping.fromJSON($.cookie("likedPostsIds")) : ko.observableArray();

        if (self.posts) {
            self.posts().forEach(function (post) {
                post.liked = ko.observable(self.likedPostsIds().filter(function (postId) { return postId === post.id() }).length > 0);

                self.addStyledDescriptionToPost(post);
            });
        }

        self.categoryQueryString = ko.observable("");
        self.searchTermsQueryString = ko.observable("");
        self.tagsQueryString = ko.observable("");

        self.categoryIdFilter.subscribeChanged(function (newValue, oldValue) {
            if ((newValue || oldValue) && (newValue !== oldValue)) {

                var categoryQueryString = self.createCategoryIdQueryString(self.categoryIdFilter());

                self.categoryQueryString(categoryQueryString);

                self.currentPage(1);

                self.getPosts();
            }
        });

        self.searchTermsFilterString = ko.observable();
        self.searchTermsFilterString.subscribe(function (newValue) {
            self.searchTermsFilter(newValue.trim().split(" "));
        });


        self.isSearching = ko.observable();
        self.isSearching.subscribe(function (newValue) {
            self.getRequests().forEach(function (request) {
                request.abort();
            });

            self.getRequests([]);

            if (!newValue) {
                var searchTermsQueryString = self.createSearchTermsQueryString(self.searchTermsFilter());

                self.searchTermsQueryString(searchTermsQueryString);

                self.currentPage(1);

                self.getPosts();
            }
        });


        self.tagsFilter.subscribe(function () {
            self.currentPage(1);

            var tagsQueryString = self.createTagsQueryString(self.tagsFilter());

            self.tagsQueryString(tagsQueryString);

            self.currentPage(1);

            self.getPosts();
        });

        var searchTermsQueryString = self.createSearchTermsQueryString(self.searchTermsFilter());
        self.searchTermsQueryString(searchTermsQueryString);

        var tagsQueryString = self.createTagsQueryString(self.tagsFilter());
        self.tagsQueryString(tagsQueryString);

        var categoryQueryString = self.createCategoryIdQueryString(self.categoryIdFilter());
        self.categoryQueryString(categoryQueryString);

        self.isLoading = ko.observable(false);
        self.isLoadingMore = ko.observable(false);

        self.showSubscribe = ko.observable(false);

        self.subscriber = {};
        self.subscriber.emailAddress = ko.observable().extend({
            email: { message: "the email address is not valid!" },
            required: { message: "you must fill in your email address!" }
        });;
        self.subscriber.categories = ko.observableArray();

        self.subscriberErrors = ko.validation.group(self.subscriber);

        self.rssLink = ko.computed(function () {
            return "https://www.brechtbaekelandt.net/rss/?categories=" + self.subscriber.categories().map(c => c.name()).join();
        });

        self.hasSubscribed = ko.observable(false);
        self.atLeastOneCategoryMessage = ko.observable();

        self.getRequests = ko.observableArray();

        self.initAddThis();
        self.initFancyBox();
    };

    HomeViewModel.prototype.getPosts = function (getMore = false) {
        var self = this;

        self.isLoading(!getMore);
        self.isLoadingMore(getMore);

        var currentPage = getMore ? self.currentPage() + 1 : self.currentPage();
        self.currentPage(currentPage);

        var fullQueryString = self.createFullQueryString(true, true, self.currentPage());

        var request = $.ajax({
            url: "../api/blog/posts" + fullQueryString,
            type: "GET",
            success: function (data, textStatus, jqXhr) { },
            async: false
        })
            .done(function (data, textStatus, jqXhr) {
                if (!getMore) {
                    self.posts([]);
                }

                data.posts.forEach(function (plainPost) {
                    var post = ko.mapping.fromJS(plainPost);

                    self.addStyledDescriptionToPost(post);

                    self.posts.push(post);
                });


                //self.posts().forEach(function(post) {
                //    post.styledDescription = ko.computed(function () {
                //        var tempStyledDescription = post.description();

                //        if (post.pictureUrl()) {
                //            var afterFirstClosingTagIndex = post.description().indexOf(">") + 1;

                //            if (afterFirstClosingTagIndex > -1) {
                //                tempStyledDescription = [post.description().slice(0, afterFirstClosingTagIndex), "<a href =\"" + post.pictureUrl() + "\" data-fancybox data-caption=\"" + post.title() + "\"><img src=\"" + post.pictureUrl() + "\" class=\"post-picture post-preview-picture img-thumbnail\" /></a>", post.description().slice(afterFirstClosingTagIndex)].join("");
                //            }
                //        }

                //        return tempStyledDescription;
                //    });
                //});
            })
            .fail(function (jqXhr, textStatus, errorThrown) {

            })
            .always(function (data, textStatus, jqXhr) {
                self.currentPage(data.currentPage);
                self.totalPostCount(data.totalPostCount);
                self.postsPerPage(data.postsPerPage);

                self.posts().forEach(function (post) {
                    post.liked = ko.observable(self.likedPostsIds().filter(function (postId) { return postId === post.id() }).length > 0);
                });

                $.when.apply($, self.getRequests()).done(function () {
                    self.isLoading(false);
                    self.isLoadingMore(false);
                    if (self.currentPage() === self.totalPageCount()) {
                        self.isLastPage(true);
                    }
                });

                history.pushState(null, "", location.href.split("?")[0]);
            });

        self.getRequests.push(request);
    };

    HomeViewModel.prototype.likePost = function (post) {
        var self = this;

        $.ajax({
            url: "../api/blog/post/like?postId=" + post.id(),
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


    HomeViewModel.prototype.unlikePost = function (post) {
        var self = this;

        $.ajax({
            url: "../api/blog/post/unlike?postId=" + post.id(),
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

    HomeViewModel.prototype.addStyledDescriptionToPost = function (post) {
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

    HomeViewModel.prototype.copyRssLink = function () {
        var self = this;

        var clipboadHelper = new brechtbaekelandt.helpers.ClipboardHelper();

        clipboadHelper.copyToClipboard(self.rssLink());
    }

    HomeViewModel.prototype.subscribe = function (subscriber) {
        var self = this;

        self.atLeastOneCategoryMessage(null);

        if (self.subscriber.categories().length === 0) {
            self.atLeastOneCategoryMessage("you must select at least one category to subscribe.");
            return;
        }

        if (self.subscriberErrors().length > 0) {
            self.subscriberErrors.showAllMessages();
            return;
        }

        $.ajax({
            url: "../api/blog/subscribe",
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            data: ko.toJSON(subscriber),
            dataType: "json",
            cache: false,
            processData: false,
            async: false,
            success: function (data, textStatus, jqXhr) { }
        })
            .done(function (data, textStatus, jqXhr) {
                self.hasSubscribed(true);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {

            })
            .always(function (data, textStatus, jqXhr) {

            });
    };

    HomeViewModel.prototype.generateRssLink = function (categories) {

    };

    HomeViewModel.prototype.initAddThis = function () {
        addthis.init();

        if (addthis.layers.refresh) {
            addthis.layers.refresh();
        }
    }

    HomeViewModel.prototype.initFancyBox = function () {
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
    }

    HomeViewModel.prototype.createSearchTermsQueryString = function (searchTermsFilter) {
        var searchTermsQueryString = "";

        searchTermsFilter.forEach(function (searchTerm, index) {
            searchTermsQueryString += "searchTerms=" + searchTerm + "&";
        });

        return searchTermsQueryString;
    }

    HomeViewModel.prototype.createTagsQueryString = function (tagsFilter) {
        var tagsQueryString = "";

        tagsFilter.forEach(function (tag, index) {
            tagsQueryString += "tags=" + tag + "&";
        });

        return tagsQueryString;
    }

    HomeViewModel.prototype.createCategoryNameQueryString = function (categoryNameFilter) {
        return categoryNameFilter ? "categoryName=" + categoryNameFilter + "&" : "";
    }

    HomeViewModel.prototype.createCategoryIdQueryString = function (categoryIdFilter) {
        return categoryIdFilter ? "categoryId=" + categoryIdFilter + "&" : "";
    }

    HomeViewModel.prototype.createFullQueryString = function (includeCategoryQueryString = false, includeCurrentPage = false, currentPage = 1) {
        var self = this;

        var query = self.searchTermsQueryString() + self.tagsQueryString() + (includeCategoryQueryString ? self.categoryQueryString() : "") + (includeCurrentPage ? "currentPage=" + currentPage : "");

        return query ? "?" + query : "";
    }

    function init(serverViewModel) {

        var viewModel = new HomeViewModel(serverViewModel);

        ko.applyBindings(viewModel);
    };

    return {
        HomeViewModel: HomeViewModel,
        init: init
    };

})($, jQuery, ko);