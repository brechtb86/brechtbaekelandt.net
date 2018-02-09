﻿var brechtbaekelandt = brechtbaekelandt || {};

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
        self.showEdit = ko.observable();

        self.newPost = {};
        self.newPost.title = ko.observable().extend({ required: { message: "you didn't fill in the title!" } });
        self.newPost.description = ko.observable().extend({ required: { message: "you didn't fill in the description!" } });
        self.newPost.content = ko.observable();
        self.newPost.categories = ko.observableArray().extend({ minimumItemsInArray: { params: { minimum: 1 }, message: "you didn't select a category!" } });
        self.newPost.tags = ko.observableArray();
        self.newPost.pictureUrl = ko.observable();
        self.newPost.attachments = ko.observableArray();
        self.newPost.isPostVisible = ko.observable(false);
        self.newPost.url = ko.observable();

        self.selectedPost = ko.observable();
        self.selectedPost.subscribe(function (newValue) {
            if (newValue) {
                self.categories().forEach(function(category) {
                    category.isSelected(newValue.categories().filter(function(c) { return category.id() === c.id() })
                        .length >
                        0);
                });
            } else {
                self.categories().forEach(function(category) {
                    category.isSelected(false);
                });
            }


        });

        self.pictureToUpload = ko.observable();
        self.pictureToUpload.subscribe(function (newValue) {
            if (newValue) {
                self.uploadPicture(newValue);
            }
        });

        self.attachmentsToUpload = ko.observableArray();
        self.attachmentsUploadRequest = ko.observable();

        self.isAttachmentsUploading = ko.observable(false);
        self.isAttachmentsUploadingFinished = ko.observable(false);

        self.attachmentsUploadProgress = ko.observable(0);

        self.pictureUploadErrorMessage = ko.observable();
        self.pictureDeleteErrorMessage = ko.observable();
        self.attachmentsUploadErrorMessage = ko.observable();
        self.attachmentsUploadAbortedMessage = ko.observable();
        self.attachmentDeleteErrorMessage = ko.observable();
        self.createErrorMessage = ko.observable();
        self.createSucceededMessage = ko.observable();
        self.updateErrorMessage = ko.observable();
        self.updateSucceededMessage = ko.observable();

        self.createErrors = ko.validation.group(self.newPost);
        //self.updateErrors = ko.validation.group(self.selectedPost);

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
                    "quote",
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
                    "quote",
                    "|",
                    "insertC#",
                    "insertHtml",
                    "insertJavascript",
                    "insertCss",
                    "insertXml",
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

    AdminViewModel.prototype.uploadPicture = function (picture) {
        var self = this;

        self.pictureUploadErrorMessage("");

        var formData = new FormData();
        formData.append("picture", picture);

        $.ajax({
            url: "../api/blog/upload-picture",
            type: "POST",
            contentType: false,
            data: formData,
            dataType: "json",
            cache: false,
            processData: false,
            async: false,
            xhr: function () {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var progress = Math.round((evt.loaded / evt.total) * 100);
                    }
                }, false);
                return xhr;
            }
        })
            .done(function (data, textStatus, jqXhr) {
                self.pictureToUpload(null);
                self.newPost.pictureUrl(data);

                $(".picture-drop-zone input:file").val();
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.pictureUploadErrorMessage("there was an error while uploading the file, please try again.");
            })
            .always(function (jqXhr, textStatus, errorThrown) {
            });
    };

    AdminViewModel.prototype.deletePicture = function (pictureUrl) {
        var self = this;

        self.pictureDeleteErrorMessage("");

        $.ajax({
            url: "../api/blog/delete-picture?picture=" + pictureUrl(),
            type: "POST",
            success: function (data, textStatus, jqXhr) { },
            async: false
        })
            .done(function (data, textStatus, jqXhr) {
                self.newPost.pictureUrl(null);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.pictureDeleteErrorMessage("there was an error while deleting the file, please try again.");
            })
            .always(function (data, textStatus, jqXhr) {

            });
    }

    AdminViewModel.prototype.uploadAttachments = function (attachments) {
        var self = this;

        self.isAttachmentsUploadingFinished(false);

        var formData = new FormData();

        attachments().forEach(function (attachment) {
            formData.append("attachments", attachment);
        });

        self.attachmentsUploadProgress(0);

        self.attachmentsUploadErrorMessage("");

        self.attachmentsUploadAbortedMessage("");

        self.isAttachmentsUploading(true);

        var jqxhr = $.ajax({
            url: "../api/blog/upload-attachments",
            type: "POST",
            contentType: false,
            data: formData,
            dataType: "json",
            cache: false,
            processData: false,
            async: false,
            xhr: function () {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress",
                    function (evt) {
                        if (evt.lengthComputable) {
                            var progress = Math.round((evt.loaded / evt.total) * 100);
                            self.attachmentsUploadProgress(progress);
                        }
                    },
                    false);
                return xhr;
            }
        })
            .done(function (data, textStatus, jqXhr) {
                self.isAttachmentsUploadingFinished(true);

                data.forEach(function (attachment) {
                    self.newPost.attachments.push(attachment);
                });

                self.attachmentsToUpload([]);

                $(".attachments-drop-zone input:file").val();
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                if (errorThrown === "abort") {
                    self.attachmentsUploadAbortedMessage("you have aborted the upload...");
                }
                else {
                    self.attachmentsUploadErrorMessage("there was an error while uploading the file, please try again.");
                }
            })
            .always(function (data, textStatus, jqXhr) {
                self.isAttachmentsUploading(false);

                self.attachmentsUploadProgress(0);
            });

        self.attachmentsUploadRequest(jqxhr);
    };

    AdminViewModel.prototype.abortAttachmentUpload = function () {
        var self = this;

        var xhr = self.attachmentsUploadRequest();
        xhr.abort();
    };

    AdminViewModel.prototype.deleteSelectedAttachmentToUpload = function (item) {
        var self = this;

        self.attachmentsToUpload.remove(item);

        $(".attachments-drop-zone input:file").val();
    };

    AdminViewModel.prototype.deleteUploadedAttachment = function (attachment) {
        var self = this;

        self.attachmentDeleteErrorMessage("");

        $.ajax({
            url: "../api/blog/delete-attachment",
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            data: ko.toJSON(attachment),
            dataType: "json",
            cache: false,
            processData: false,
            async: false,
            success: function (data, textStatus, jqXhr) { }
        })
            .done(function (data, textStatus, jqXhr) {
                ko.mapping.fromJS(self.newPost.attachments().filter(function (a) {
                    return a.id !== data.id;
                }), {}, self.newPost.attachments);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.attachmentDeleteErrorMessage("there was an error while deleting the file, please try again.");
            })
            .always(function (data, textStatus, jqXhr) {

            });
    }

    AdminViewModel.prototype.createPost = function (post) {
        var self = this;

        self.createSucceededMessage(null);
        self.createErrorMessage(null);

        self.isPosted(false);

        if (self.createErrors().length > 0) {
            self.createErrors.showAllMessages();
            return;
        }

        $.ajax({
            url: "../api/blog/post/add",
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            data: ko.toJSON(post),
            dataType: "json",
            cache: false,
            processData: false,
            async: false,
            success: function (data, textStatus, jqXhr) { }
        })
            .done(function (data, textStatus, jqXhr) {
                self.createSucceededMessage("the post was successfully created!");

                ko.mapping.fromJS(data, {}, self.newPost);

                self.isPosted(true);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.createErrorMessage(errorThrown);
            })
            .always(function (data, textStatus, jqXhr) {

            });
    };

    AdminViewModel.prototype.updatePost = function (post) {
        var self = this;

        self.updateSucceededMessage(null);
        self.updateErrorMessage(null);

        // TODO
        //if (self.createErrors().length > 0) {
        //    self.createErrors.showAllMessages();
        //    return;
        //}

        $.ajax({
            url: "../api/blog/post/update",
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            data: ko.toJSON(post),
            dataType: "json",
            cache: false,
            processData: false,
            async: false,
            success: function (data, textStatus, jqXhr) { }
        })
            .done(function (data, textStatus, jqXhr) {
                self.updateSucceededMessage("the post was successfully updated!");
                self.selectedPost(ko.mapping.fromJS(data));
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.createErrorMessage(errorThrown);
            })
            .always(function (data, textStatus, jqXhr) {

            });
    };

    AdminViewModel.prototype.resetNewPost = function (newPost) {
        var self = this;

        newPost.title("");
        newPost.description("");
        newPost.content("");
        newPost.categories([]);
        newPost.tags([]);
        newPost.pictureUrl("");
        newPost.attachments([]);

        self.categories.forEach(function (category) { category.isSelected(false); });

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