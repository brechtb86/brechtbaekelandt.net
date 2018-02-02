var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.admin = (function ($, jQuery, ko, undefined) {
    "use strict";

    function AdminViewModel(serverViewModel) {
        var self = this;

        ko.mapping.fromJS(serverViewModel, {}, self);

        if (serverViewModel.categories) {
            for (var i = 0; i < self.categories().length; i++) {
                self.categories()[i].isSelected = ko.observable();
            }
        }
        
        self.selectedCategoryFilter = ko.observable();
        self.searchFilter = ko.observable();

        self.showCreate = ko.observable();

        self.newPost = {};
        self.newPost.title = ko.observable().extend({ required: { message: "you didn't fill in the title!" } });
        self.newPost.description = ko.observable().extend({ required: { message: "you didn't fill in the description!" } });
        self.newPost.content = ko.observable().extend({ required: { message: "you didn't fill in content!" } });
        self.newPost.categories = ko.observableArray().extend({ minimumItemsInArray: { params: { minimum: 1 }, message: "you didn't select a category!" } });
        self.newPost.keywords = ko.observableArray();

        self.createErrorMessage = ko.observable();
        self.createSucceededMessage = ko.observable();

        self.createErrors = ko.validation.group(self.newPost);

        self.categoryToAdd = ko.observable();
        self.keywordToAdd = ko.observable();

        self.isLoading = ko.observable(true);

        self.descriptionFroalaOptions = ko.observable(
            {
                key: "lgtbkaB-9imhejB-13pC-11wh1D1xrl==",
                height: "200",
                charCounterCount: false,
                theme: "brechtbaekelandt",
                placeholderText: "write a short description",
                toolbarButtons:
                [
                    "bold",
                    "italic",
                    "underline",
                    "strikeThrough",
                    "subscript",
                    "superscript",
                    "|",
                    "color",
                    "|",
                    "paragraphFormat",
                    "align",
                    "formatOL",
                    "formatUL",
                    "outdent",
                    "indent",
                    "|",
                    "insertLink",
                    "-",
                    "undo",
                    "redo",
                    "clearFormatting",
                    "selectAll"
                ]
            });
        self.contentFroalaOptions = ko.observable(
            {
                key: "lgtbkaB-9imhejB-13pC-11wh1D1xrl==",
                height: "350",
                charCounterCount: false,
                theme: "brechtbaekelandt",
                placeholderText: "write your content",
                toolbarButtons:
                [
                    "bold",
                    "italic",
                    "underline",
                    "strikeThrough",
                    "subscript",
                    "superscript",
                    "|",
                    "color",
                    "|",
                    "paragraphFormat",
                    "align",
                    "formatOL",
                    "formatUL",
                    "outdent",
                    "indent",
                    "|",
                    "insertC#",
                    "insertHtml",
                    "insertJavascript",
                    "insertCss",
                    "|",
                    "insertLink",
                    "insertImage",
                    "insertFile",
                    "insertTable",
                    "insertHR",
                    "-",
                    "undo",
                    "redo",
                    "clearFormatting",
                    "selectAll",
                    "html"
                ]
            });
    };

    AdminViewModel.prototype.createPost = function (post) {
        var self = this;

        self.createSucceededMessage(null);
        self.createErrorMessage(null);

        //if (self.errors().length > 0) {
        //    self.errors.showAllMessages();
        //    return;
        //}

        //var postData = ko.mapping.toJSON(self.newPost);

        $.ajax({
            type: "POST",
            url: "../api/blog/post/add",
            contentType: "application/json",
            dataType: "json",
            data: ko.toJSON(post)
        })
            .done(function (data, textStatus, jqXhr) {

                self.createSucceededMessage("the post was successfully created!");
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.createErrorMessage(errorThrown);
            })
            .always(function () {

            });
    };

    AdminViewModel.prototype.addCategory = function (category) {
        var self = this;

        if (!self.categories().some(function (e) { return e.name().toLowerCase() === category().toLowerCase(); })) {
            var newCategory = ko.mapping.fromJS({ name: category(), id: "00000000-0000-0000-0000-000000000000", isSelected: true });

            self.categories.push(newCategory);
        }

        category(null);
    };

    AdminViewModel.prototype.toggleSelectedCategory = function (category, categories) {
        var self = this;

        if (category.isSelected()) {
            categories.pop(category);
            category.isSelected(false);
        }
        else {
            categories.push(category);
            category.isSelected(true);
        }
    };

    AdminViewModel.prototype.addKeyword = function (keyword, targetKeywordList) {
        var self = this;

        targetKeywordList.push(keyword().toLowerCase());

        keyword(null);
    };
    
    AdminViewModel.prototype.removeKeyword = function (keyword, keywords) {
        var self = this;

        if (keywords.indexOf(keyword) > -1) {
            keywords.pop(keyword);
        }
    };

    function init(serverViewModel) {

        var viewModel = new AdminViewModel(serverViewModel);

        ko.applyBindings(viewModel);
    };

    return {
        AdminViewModel: AdminViewModel,
        init: init
    };

})($, jQuery, ko);