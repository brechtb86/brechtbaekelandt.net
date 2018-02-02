/// <reference path="../knockout/knockout.extensions.js" />

var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.home = (function ($, jQuery, ko, undefined) {
    "use strict";

    function HomeViewModel(serverViewModel) {
        var self = this;

        ko.mapping.fromJS(serverViewModel, {}, self);

        self.selectedCategoryFilter = ko.observable();
        self.selectedCategoryFilter.subscribeChanged(function (newValue, oldValue) {
            if (newValue !== oldValue) {
                self.filter();
            }
        });

        self.searchFilter = ko.observable();

        self.keywordsFilter = ko.observableArray();
        self.keywordsFilter.subscribe(function () {
            self.filter();
        });

        self.isLoading = ko.observable(false);
    };

    HomeViewModel.prototype.filter = function () {
        var self = this;
        
        self.isLoading(true);

        $.getJSON("../api/blog/posts/filter",
            {
                searchFilterString: self.searchFilter() ? self.searchFilter().replace("", ",") : "",
                categoryName: self.selectedCategoryFilter() ? self.selectedCategoryFilter().name : "",
                keywordsString: self.keywordsFilter() ? self.keywordsFilter().join(",") : ""
            })
            .done(function (data, textStatus, jqXhr) {
                self.posts(ko.mapping.fromJS(data));
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