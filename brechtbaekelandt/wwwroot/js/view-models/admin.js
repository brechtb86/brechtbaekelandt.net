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
        self.newPost.Title = ko.observable().extend({ required: { message: "you didn't fill in the title!" } });
        self.newPost.description = ko.observable().extend({ required: { message: "you didn't fill in the description!" } });
        self.newPost.content = ko.observable();
        self.newPost.categories = ko.observableArray().extend({ minimumItemsInArray: { params: { minimum: 1 }, message: "you didn't select a category!" } });
        self.newPost.tags = ko.observableArray();

        self.isUploadingPicture = ko.observable(false);
        self.isUploadingPictureFinished = ko.observable(false);

        self.pictureToUpload = ko.observable();
        self.pictureUploadProgress = ko.observable(0);

        self.pictureUploadAbortedMessage = ko.observable();
        self.pictureUploadErrorMessage = ko.observable();
        self.pictureUploadRequest = ko.observable();

        self.createErrorMessage = ko.observable();
        self.createSucceededMessage = ko.observable();

        self.createErrors = ko.validation.group(self.newPost);

        self.categoryToAdd = ko.observable();
        self.tagToAdd = ko.observable();

        self.isLoading = ko.observable(true);

        self.isPosted = ko.observable(false);

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

    AdminViewModel.prototype.uploadPicture = function () {
        var self = this;

        self.isUploadingPictureFinished(false);

        self.pictureUploadErrorMessage("");
        self.pictureUploadAbortedMessage("");

        self.pictureUploadProgress(0);

        self.isUploadingPicture(true);

        var formData = new FormData();
        formData.append("files", self.pictureToUpload());

        var jqxhr = $.ajax({
            url: "../api/blog/upload-picture",
            dataType: "json",
            type: "post",
            contentType: false,
            data: formData,
            cache: false,
            processData: false,
            xhr: function () {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var progress = Math.round((evt.loaded / evt.total) * 100);
                        self.progress(progress);
                    }
                }, false);
                return xhr;
            }
        })
            .done(function (data, textStatus, jqXhr) {
                if (data.state === 0) {
                    self.isUploadingPictureFinished(true);

                    self.pictureToUpload(null);

                    $("input:file").each(function () {
                        $(this).val("");
                    });
                }
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                if (errorThrown === "abort") {
                    self.pictureUploadAbortedMessage("you have aborted the upload...");
                }
                else {
                    self.pictureUploadErrorMessage("there was an error while uploading the file, please try again.");
                }
            })
            .always(function () {
                self.isUploadingPicture(false);

                self.pictureUploadProgress(0);
            });

        self.pictureUploadRequest(jqxhr);
    };

    AdminViewModel.prototype.abortPictureUpload = function () {
        var self = this;

        self.pictureUploadRequest().abort();

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

        $.ajax({
            url: "../api/blog/post/add",
            type: "POST",
            data: ko.toJSON(post),
            contentType: "application/json; charset=UTF-8",
            success: function (data, textStatus, jqXhr) { },
            async: false
        })
            .done(function (data, textStatus, jqXhr) {
                self.createSucceededMessage("the post was successfully created!");
                self.isPosted(true);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.createErrorMessage(errorThrown);
            })
            .always(function (data, textStatus, jqXhr) {

            });
    };

    AdminViewModel.prototype.resetNewPost = function (newPost) {
        var self = this;

        newPost.Title("");
        newPost.description("");
        newPost.content("");
        newPost.categories([]);
        newPost.tags([]);

        self.categories.forEach(function (category) { category.isSelected(false); })

        self.createErrors.showAllMessages(false);
    }

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