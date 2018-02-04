/// <reference path="../knockout/knockout.extensions.js" />
/// <reference path="../addthis/addthis_widget.js" />
/// <reference path="../../lib/jquery/dist/jquery.js" />
/// <reference path="../../lib/knockout-mapping/build/output/knockout.mapping-latest.debug.js" />
/// <reference path="../../lib/fancybox/src/js/core.js" />

var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.home = (function ($, jQuery, ko, undefined) {
    "use strict";

    function HomeViewModel(serverViewModel) {
        var self = this;

        document.addEventListener("scroll", function (event) {
            if (((window.innerHeight + window.scrollY) >= document.body.offsetHeight) && (self.totalPostCount() > self.posts().length)) {
                self.getPosts(true);
            }
        });

        ko.mapping.fromJS(serverViewModel, {}, self);

        self.categoryQueryString = ko.observable();

        self.categoryIdFilter.subscribeChanged(function (newValue, oldValue) {
            if ((newValue || oldValue) && (newValue !== oldValue)) {

                var categoryQueryString = self.categoryIdFilter() ? "categoryId=" + self.categoryIdFilter() + "&" : "";

                self.categoryQueryString(categoryQueryString);

                self.currentPage(1);

                self.getPosts();
            }
        });

        self.searchTermsFilterString = ko.observable();
        self.searchTermsFilterString.subscribe(function (newValue) {
            self.searchTermsFilter(newValue.trim().split(" "));
        });

        self.searchTermsQueryString = ko.observable("");

        self.searchTermsFilter.subscribe(function () {
            self.getRequests().forEach(function (request) {
                request.abort();
            });

            self.getRequests([]);

            var searchTermsQueryString = "";

            self.searchTermsFilter().forEach(function (searchTerm, index) {
                searchTermsQueryString += "searchTerms=" + searchTerm + "&";
            });

            self.searchTermsQueryString(searchTermsQueryString);

            self.currentPage(1);

            self.getPosts();
        });

        self.tagsQueryString = ko.observable("");

        self.tagsFilter.subscribe(function () {
            self.currentPage(1);

            var tagsQueryString = "";

            self.tagsFilter().forEach(function (tag, index) {
                tagsQueryString += "tags=" + tag + "&";
            });

            self.tagsQueryString(tagsQueryString);

            self.currentPage(1);

            self.getPosts();
        });

        self.isLoading = ko.observable(false);
        self.isLoadingMore = ko.observable(false);

        self.showSubscribe = ko.observable(false);

        self.subscriber = {};
        self.subscriber.emailAddress = ko.observable();
        self.subscriber.categories = ko.observableArray();

        self.getRequests = ko.observableArray();
    };

    HomeViewModel.prototype.getPosts = function (getMore = false) {
        var self = this;

        self.isLoading(!getMore);
        self.isLoadingMore(getMore);

        var currentPageQuerystring = "currentPage=" + (getMore ? self.currentPage() + 1 : self.currentPage());

        var request = $.ajax({
            url: "../api/blog/posts?" + self.searchTermsQueryString() + self.tagsQueryString() + self.categoryQueryString() + currentPageQuerystring,
            type: "GET",
            success: function (data, textStatus, jqXhr) { },
            async: false
        })
            .done(function (data, textStatus, jqXhr) {
                if (!getMore) {
                    ko.mapping.fromJS(data.posts, {}, self.posts);
                } else {
                    data.posts.forEach(function (post) {
                        self.posts.push(ko.mapping.fromJS(post));
                    });
                }
            })
            .fail(function (jqXhr, textStatus, errorThrown) {

            })
            .always(function (data, textStatus, jqXhr) {
                self.currentPage(data.currentPage);
                self.totalPostCount(data.totalPostCount);
                self.postsPerPage(data.postsPerPage);

                $.when.apply($, self.getRequests()).done(function () {
                    self.isLoading(false);
                    self.isLoadingMore(false);
                });

                history.pushState(null, "", location.href.split("?")[0]);
            });

        self.getRequests.push(request);
    };

    HomeViewModel.prototype.subscribe = function (subscriber) {

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

    //HomeViewModel.prototype.highlightSearchTermResult = function (text, searchResultTerm, allowSpecialCharacters = false) {

    //    return searchResultTerm === "" ? text : text.replace(/(>[^<]+)/igm, function (newText) {

    //        if (!allowSpecialCharacters) {
    //            searchResultTerm = searchResultTerm.replace(/([{}()[\]\\.?*+^$|=!:~-])/g, "\\$1");
    //        }

    //        return newText.replace(new RegExp("(" + searchResultTerm + ")", "igm"), "<span class='heighLightedSearchTermResult'>$1</span>");
    //    });
    //}

    function init(serverViewModel) {

        var viewModel = new HomeViewModel(serverViewModel);

        //var currentHistoryState = history.state;
        //if (currentHistoryState) {
        //    viewModel.currentIndex(currentHistoryState.currentIndex);
        //    viewModel.isSearching(currentHistoryState.isSearching);
        //    viewModel.searchTerm(currentHistoryState.searchTerm);
        //    viewModel.selectedCategoryId(currentHistoryState.selectedCategoryId);
        //}

        ko.applyBindings(viewModel);
    };

    return {
        BlogViewModel: HomeViewModel,
        init: init
    };

})($, jQuery, ko);