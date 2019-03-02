﻿/// <reference path="../knockout/knockout.extensions.js" />
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

        var postAnchors = [];

        for (var postNumber = 1; postNumber <= self.totalPostCount(); postNumber += self.postsPerPage()) {
            postAnchors.push("a[href='#post" + postNumber + "']");
        };

        self.isLoading = ko.observable(false);
        self.isLoadingMore = ko.observable(self.currentPage() < self.totalPageCount() && self.totalPostCount() !== 0);
        self.isLastPage = ko.observable(self.currentPage() >= self.totalPageCount() || self.totalPostCount() === 0);

        var lastScrollTop = 0;

        document.addEventListener("scroll", function (event) {

            var scrollTop = $(window).scrollTop();
            var windowHeight = $(window).height();
            var documentHeight = $(document).height();
            var documentBottom = scrollTop + windowHeight;
            
            if (scrollTop > lastScrollTop && (((window.innerHeight + window.scrollY) >= document.body.offsetHeight || (scrollTop + 10 >= documentHeight - windowHeight))) && !self.isLastPage()) {
                self.getPosts(true);
            }

            lastScrollTop = scrollTop;

            function changeCurrentPage() {
                for (var i = 0; i < postAnchors.length; i++) {
                    var anchor = postAnchors[i];

                    var elementTop = $(anchor).offset().top;
                    var elementBottom = elementTop + $(anchor).height();

                    if (((elementBottom <= documentBottom) && (elementTop >= scrollTop))) {
                        self.currentPage(i + 1);

                        history.pushState(null, "", location.href.split("?")[0] + self.createFullQueryString(true, true, newValue));
                    }
                }
            }

            debounce(changeCurrentPage(), 500);
        });

        self.likedPostsIds = $.cookie("likedPostsIds") ? ko.mapping.fromJSON($.cookie("likedPostsIds")) : ko.observableArray();

        if (self.posts) {
            self.posts().forEach(function (post) {
                post.liked = ko.observable(self.likedPostsIds().filter(function (postId) {
                    return postId === post.id();
                }).length > 0);

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

        self.searchTermsFilterString = ko.observable(self.searchTermsFilter());
        self.searchTermsFilterString.subscribe(function (newValue) {
            self.searchTermsFilter(newValue.trim().split(" "));
        });

        self.isSearching = ko.observable();
        self.isSearching.subscribe(function (newValue) {
            self.busySearching(true);

            self.getRequests().forEach(function (request) {
                request.abort();
            });

            self.getRequests([]);

            function startSearching() {
                if (!newValue) {
                    var searchTermsQueryString = self.createSearchTermsQueryString(self.searchTermsFilter());

                    self.searchTermsQueryString(searchTermsQueryString);

                    self.currentPage(1);
                    self.isLastPage(false);

                    self.getPosts();
                }
            }

            throttle(startSearching(), 350);
        });

        self.busySearching = ko.observable();
        
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

        self.currentPage(getMore ? self.currentPage() + 1 : self.currentPage());

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
            })
            .fail(function (jqXhr, textStatus, errorThrown) {

            })
            .always(function (data, textStatus, jqXhr) {
                self.currentPage(data.currentPage);
                self.totalPostCount(data.totalPostCount);
                self.postsPerPage(data.postsPerPage);
                self.isLoading(false);
                self.isLoadingMore(self.currentPage() < self.totalPageCount() && self.totalPostCount() !== 0);
                self.isLastPage(self.currentPage() >= self.totalPageCount() || self.totalPostCount() === 0);
                self.busySearching(false);
            
                self.posts().forEach(function (post) {
                    post.liked = ko.observable(self.likedPostsIds().filter(function (postId) {
                        return postId === post.id();
                    }).length > 0);
                });

                $.when.apply($, self.getRequests()).done(function () {
                    self.isLoading(false);
                    self.isLoadingMore(self.currentPage() < self.totalPageCount() && self.totalPostCount() !== 0);
                    self.isLastPage(self.currentPage() >= self.totalPageCount() || self.totalPostCount() === 0);
                });

                //history.pushState(null, "", location.href.split("?")[0]);

                history.pushState(null, "", location.href.split("?")[0] + fullQueryString);
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
        try {
            addthis.init();

            if (addthis.layers.refresh) {
                addthis.layers.refresh();
            }
        } catch (e) {
            console.log("AddThis failed to load.");
        }
    }

    HomeViewModel.prototype.initFancyBox = function () {
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
            console.log("FancyBox failed to load.");
        }
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

    function throttle(func, wait, scope) {
        wait || (wait = 250);
        var last,
            deferTimer;
        return function () {
            var context = scope || this;

            var now = +new Date,
                args = arguments;
            if (last && now < last + wait) {
                // hold on to it
                clearTimeout(deferTimer);
                deferTimer = setTimeout(function () {
                    last = now;
                    func.apply(context, args);
                }, wait);
            } else {
                last = now;
                func.apply(context, args);
            }
        };
    }

    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };
  
    function init(serverViewModel) {

        var viewModel = new HomeViewModel(serverViewModel);

        ko.applyBindings(viewModel);
    };

    return {
        HomeViewModel: HomeViewModel,
        init: init
    };

})($, jQuery, ko);