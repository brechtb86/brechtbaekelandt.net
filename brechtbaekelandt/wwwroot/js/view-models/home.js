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
                self.getPosts(self.currentPage() + 1, true);
            }
        });

        self.categoryIdFilter = ko.observable();
        self.searchTermsFilterString = ko.observableArray();
        self.searchTermsFilter = ko.observableArray().subscribe(function(newValue) {
            self.searchTermsFilterString(searchTermsFilter.join(" "));
        });
        self.tagsFilter = ko.observableArray();

        ko.mapping.fromJS(serverViewModel, {}, self);

        self.categoryIdFilter.subscribeChanged(function (newValue, oldValue) {
            if ((newValue || oldValue) && (newValue !== oldValue)) {
                self.getPosts();
            }
        });

        self.tagsFilter.subscribe(function () {
            self.getPosts();
        });

        self.isLoading = ko.observable(false);
        self.isLoadingMore = ko.observable(false);

        self.showSubscribe = ko.observable(false);

        self.subscriber = {};
        self.subscriber.emailAddress = ko.observable();
        self.subscriber.categories = ko.observableArray();
    };

    HomeViewModel.prototype.getPosts = function (page = 1, getMore = false) {
        var self = this;

        self.isLoading(!getMore);
        self.isLoadingMore(getMore);

        self.isAddThisInitialized = ko.observable();

        $.getJSON("../api/blog/posts",
            {
                categoryId: self.categoryIdFilter(),
                searchTermsString: self.searchTermsFilterString() ? self.searchTermsFilterString().replace(" ", ",") : "",
                tagsString: self.tagsFilter() ? self.tagsFilter().join(",") : "",
                currentPage: page
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
            .always(function (data, textStatus, jqXHR) {
                self.currentPage(data.currentPage);
                self.totalPostCount(data.totalPostCount);
                self.postsPerPage(data.postsPerPage);
                self.isLoading(false);
                self.isLoadingMore(false);
            });
    };



    //BlogViewModel.prototype.loadPosts = function (index, count, categoryId) {
    //    var self = this;

    //    self.isLoading = ko.observable(true);

    //    $.getJSON("../api/Blog/GetPosts",
    //    {
    //        index: index,
    //        count: count,
    //        categoryId: categoryId
    //    }, function (result) {

    //        self.totalPostCount(result.totalPostCount);

    //        // add the dates
    //        ko.utils.arrayForEach(result.posts, function (value) {
    //            value.createdDate = new Date(value.created);
    //        });

    //        // add each new item to existing items.
    //        ko.utils.arrayForEach(result.posts, function (item) {

    //            var post = ko.mapping.fromJS(item);
    //            self.posts.push(post);
    //        });

    //        self.isLoading(false);
    //    }).fail(function (jqxhr, textStatus, error) {



    //    });
    //};

    //BlogViewModel.prototype.searchPosts = function (index, count, categoryId, searchTerm) {
    //    var self = this;

    //    self.isLoading(true);

    //    $.getJSON("../api/Blog/SearchPosts",
    //    {
    //        index: index,
    //        count: count,
    //        categoryId: categoryId,
    //        searchTerm: searchTerm
    //    }, function (result) {

    //        self.totalPostCount(result.totalPostCount);

    //        // add the dates
    //        ko.utils.arrayForEach(result.posts, function (value) {
    //            value.createdDate = new Date(value.created);
    //        });

    //        // add each new item to existing items.
    //        ko.utils.arrayForEach(result.posts, function (item) {

    //            var post = ko.mapping.fromJS(item);

    //            self.posts.push(post);
    //        });

    //        self.isLoading(false);
    //    });
    //};

    //BlogViewModel.prototype.search = function () {
    //    var self = this;

    //    self.isSearching(true);

    //    self.refreshPosts(true);
    //    history.pushState({ currentIndex: self.currentIndex(), selectedCategoryId: self.selectedCategoryId(), isSearching: self.isSearching(), searchTerm: self.searchTerm() }, "Blog Posts");
    //    self.searchPosts(self.currentIndex() * postsPerPage, postsPerPage, self.selectedCategoryId(), self.searchTerm());
    //    self.refreshPosts(false);
    //};

    //BlogViewModel.prototype.reset = function () {
    //    var self = this;

    //    self.isSearching(false);
    //    self.searchTerm(null);

    //    self.refreshPosts(true);
    //    history.pushState({ currentIndex: self.currentIndex(), selectedCategoryId: self.selectedCategoryId(), isSearching: self.isSearching(), searchTerm: self.searchTerm() }, "Blog Posts");
    //    self.loadPosts(self.currentIndex() * postsPerPage, postsPerPage, self.selectedCategoryId());
    //    self.refreshPosts(false);
    //};

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