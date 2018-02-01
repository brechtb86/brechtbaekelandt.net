var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.home = (function ($, jQuery, ko, undefined) {
    "use strict";
    
    function HomeViewModel(serverViewModel) {
        var self = this;

        ko.mapping.fromJS(serverViewModel, {}, self);

        self.selectedCategoryFilter = ko.observable();
        self.searchFilter = ko.observable();

        //self.availableCategories.unshift({ id: null, name: "Any" });

        //self.posts = ko.observableArray();
        //self.totalPostCount = ko.observable();

        //self.isSearching = ko.observable(false);
        //self.searchTerm = ko.observable(null);

        //self.currentIndex = ko.observable(0);

        //self.refreshPosts = ko.observable(false);
        //self.refreshPosts.subscribe(function (newValue) {
        //    if (newValue === true) {
        //        self.currentIndex(0);
        //        self.posts.removeAll();
        //    }
        //});

        //self.selectedCategoryId = ko.observable();
        //self.selectedCategoryId.subscribe(function (newValue) {
        //    self.refreshPosts(true);
        //    history.pushState({ currentIndex: self.currentIndex(), selectedCategoryId: newValue, isSearching: self.isSearching(), searchTerm: self.searchTerm() }, "Blog Posts");
        //    if (self.isSearching()) {
        //        self.searchPosts(self.currentIndex() * postsPerPage, postsPerPage, newValue, self.searchTerm());
        //    } else {
        //        self.loadPosts(self.currentIndex() * postsPerPage, postsPerPage, newValue);
        //    }
        //    self.refreshPosts(false);
        //});

        //self.selectedCategoryName = ko.dependentObservable(function () {

        //    if (!self.selectedCategoryId()) {
        //        return "Any";
        //    }

        //    return self.availableCategories().filter(function (category) {

        //        if (ko.isObservable(category.id)) {
        //            return category.id() === self.selectedCategoryId();
        //        }
        //    })[0].name;
        //});

        self.isLoading = ko.observable(true);
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