/// <reference path="../knockout/knockout.extensions.js" />
/// <reference path="../references/addthis_widget.js" />
/// <reference path="../../lib/jquery/dist/jquery.js" />
/// <reference path="../../lib/knockout-mapping/build/output/knockout.mapping-latest.debug.js" />

var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.home = (function ($, jQuery, ko, undefined) {
    "use strict";

    function HomeViewModel(serverViewModel) {
        var self = this;

        self.searchTermsFilter = ko.observable();
        self.categoryIdFilter = ko.observable();
        self.tagsFilter = ko.observableArray();

        ko.mapping.fromJS(serverViewModel, {}, self);

        self.categoryIdFilter.subscribeChanged(function (newValue, oldValue) {
            if (newValue !== oldValue) {
                self.getPosts();
            }
        });

        self.tagsFilter.subscribe(function () {
            self.getPosts();
        });

        self.isLoading = ko.observable(false);

        self.initAddThis();
    };

    HomeViewModel.prototype.getPosts = function () {
        var self = this;

        self.isLoading(true);

        $.getJSON("../api/blog/posts",
            {
                searchTermsString: self.searchTermsFilter() ? self.searchTermsFilter().replace("", ",") : "",
                categoryId: self.categoryIdFilter(),
                tagsString: self.tagsFilter() ? self.tagsFilter().join(",") : ""
            })
            .done(function (data, textStatus, jqXhr) {
                ko.mapping.fromJS(data, {}, self.posts);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {

            })
            .always(function () {
                self.isLoading(false);
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

    HomeViewModel.prototype.initAddThis = function() {
        addthis.init();
    }

    HomeViewModel.prototype.refreshAddThis = function () {
        addthis.layers.refresh();
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