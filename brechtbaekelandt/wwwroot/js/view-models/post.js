var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.post = (function ($, jQuery, ko, undefined) {
    "use strict";

    function findIndexByKeyValue(arr, key, value) {
        for (var i = 0; i < arr.length; i++) {

            var currentValue;

            if (ko.isObservable(arr[i][key])) {
                currentValue = arr[i][key]();
            }
            else {
                currentValue = arr[i][key];
            }
            if (currentValue === value) {
                return i;
            }
        }
        return null;
    }

    function PostViewModel(serverViewModel) {
        var self = this;

        ko.mapping.fromJS(serverViewModel, {}, self);

        if (serverViewModel.availableCategories) {
            for (var i = 0; i < self.availableCategories().length; i++) {
                self.availableCategories()[i].isSelected = ko.observable();
            }
        }

        self.descriptionFroalaOptions = ko.observable(
            {
                height: "200",
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
                        "-",
                        "undo",
                        "redo",
                        "clearFormatting",
                        "selectAll"
                    ]
            });
        self.contentFroalaOptions = ko.observable(
            {
                height: "350",
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

        self.showErrors = ko.observable();
        self.errorMessage = ko.observable();
        self.isSucceeded = ko.observable();
        self.succeededMessage = ko.observable();


        self.categoryToAdd = ko.observable();

        if (serverViewModel.post) {
            self.post.createdDate = ko.observable(new Date(serverViewModel.post.created));
            self.post.title.extend({ required: { message: "you didn't fill in the title!" } });
            self.post.description.extend({ required: { message: "you didn't fill in the description!" } });
            self.post.content.extend({ required: { message: "you didn't fill in content!" } });
            self.post.categories.extend({ minimumItemsInArray: { params: { minimum: 1 }, message: "you didn't select a category!" } });

            if (serverViewModel.availableCategories) {
                for (var i = 0; i < self.post.categories().length; i++) {
                    var index = findIndexByKeyValue(self.availableCategories(), "id", self.post.categories()[i].id());

                    if (index !== null) {
                        self.availableCategories()[index].isSelected(true);
                    }
                }
            }
        }
        else {
            self.newPost = {};
            self.newPost.title = ko.observable().extend({ required: { message: "you didn't fill in the title!" } });
            self.newPost.description = ko.observable().extend({ required: { message: "you didn't fill in the description!" } });
            self.newPost.content = ko.observable().extend({ required: { message: "you didn't fill in content!" } });
            self.newPost.categories = ko.observableArray().extend({ minimumItemsInArray: { params: { minimum: 1 }, message: "you didn't select a category!" } });
        }

        self.errors = ko.validation.group(self);
    };

    PostViewModel.prototype.toggleSelected = function (category) {
        var self = this;


        // todo: something wrong with this
        debugger;


        if (category.isSelected()) {

            if (self.post.categories) {
                self.post.categories.pop(category);
            }

            if (self.newPost) {
                self.newPost.categories.pop(category);
            }

            category.isSelected(false);
        }
        else {
            if (self.post.categories) {
                self.post.categories.push(category);
            }

            if (self.newPost) {
                self.newPost.categories.push(category);
            }

            category.isSelected(true);
        }
    };

    PostViewModel.prototype.addCategory = function () {
        var self = this;

        if (self.categoryToAdd()) {

            if (!self.availableCategories().some(function (e) { return e.name().toLowerCase() === self.categoryToAdd().toLowerCase(); })) {
                var newCategory = ko.mapping.fromJS({ name: self.categoryToAdd().capitalizeFirstLetter(), id: "00000000-0000-0000-0000-000000000000", isSelected: false });

                self.availableCategories.push(newCategory);
            }

            self.categoryToAdd(null);
        }
    };

    PostViewModel.prototype.addPost = function () {
        var self = this;

        self.isSucceeded(false);
        self.succeededMessage(null);

        self.showErrors(false);
        self.errorMessage(null);

        if (self.errors().length > 0) {
            self.errors.showAllMessages();
            return;
        }

        var data = ko.mapping.toJSON(self.newPost);

        $.ajax({
            type: "POST",
            url: "../api/Blog/Create",
            contentType: "application/json",
            dataType: "json",
            success: function () {
                self.isSucceeded(true);
                self.succeededMessage("The post was successfully created!");
            },
            error: function (jqXhr, textStatus, errorThrown) {
                self.showErrors(true);
                self.errorMessage(errorThrown);
            },
            data: data,
            accept: "application/json"
        });
    };

    PostViewModel.prototype.editPost = function () {
        var self = this;

        self.isSucceeded(false);
        self.succeededMessage(null);

        self.showErrors(false);
        self.errorMessage(null);

        if (self.errors().length > 0) {
            self.errors.showAllMessages();
            return;
        }

        var data = ko.mapping.toJSON(self.post);

        $.ajax({
            type: "POST",
            url: "/api/Blog/Edit",
            contentType: "application/json",
            dataType: "json",
            success: function () {
                self.isSucceeded(true);
                self.succeededMessage("The post was successfully edited!");
            },
            error: function (jqXhr, textStatus, errorThrown) {
                self.showErrors(true);
                self.errorMessage(errorThrown);
            },
            data: data,
            accept: "application/json"
        });
    };

    function init(serverViewModel) {
        var viewModel = new PostViewModel(serverViewModel);

        ko.applyBindings(viewModel);
    }

    return {
        PostViewModel: PostViewModel,
        init: init
    };

})($, jQuery, ko);