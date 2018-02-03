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

        self.showCreate = ko.observable();

        self.newPost = {};
        self.newPost.title = ko.observable().extend({ required: { message: "you didn't fill in the title!" } });
        self.newPost.description = ko.observable().extend({ required: { message: "you didn't fill in the description!" } });
        self.newPost.content = ko.observable();
        self.newPost.categories = ko.observableArray().extend({ minimumItemsInArray: { params: { minimum: 1 }, message: "you didn't select a category!" } });
        self.newPost.tags = ko.observableArray();

        self.createErrorMessage = ko.observable();
        self.createSucceededMessage = ko.observable();

        self.createErrors = ko.validation.group(self.newPost);

        self.categoryToAdd = ko.observable();
        self.tagToAdd = ko.observable();

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

        if (self.createErrors().length > 0) {
            self.createErrors.showAllMessages();
            return;
        }

        //var postData = ko.mapping.toJSON(self.newPost);

        $.post("../api/blog/post/add", ko.toJSON(post))
            .done(function (data, textStatus, jqXhr) {
                self.createSucceededMessage("the post was successfully created!");
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.createErrorMessage(errorThrown);
            })
            .always(function (data, textStatus, jqXhr) {

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

    AdminViewModel.prototype.addTag = function (tag, targetTagList) {
        var self = this;

        targetTagList.push(tag().toLowerCase());

        tag(null);
    };

    AdminViewModel.prototype.removeTag = function (tag, tags) {
        var self = this;

        if (tags.indexOf(tag) > -1) {
            tags.pop(tag);
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