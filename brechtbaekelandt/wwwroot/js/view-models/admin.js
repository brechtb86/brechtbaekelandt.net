var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.admin = (function ($, jQuery, ko, undefined) {
    "use strict";

    function AdminViewModel(serverViewModel) {
        var self = this;

        ko.mapping.fromJS(serverViewModel, {}, self);

        if (self.categories) {
            self.categories().forEach(function (category) {
                category.isSelected = ko.observable();
            });
        }


        if (self.posts) {
            self.posts().forEach(function (post) {
                post.title.extend({ required: { message: "you didn't fill in the title!" } });
                post.description.extend({ required: { message: "you didn't fill in the description!" } });
                post.categories.extend({ minimumItemsInArray: { params: { minimum: 1 }, message: "you didn't select a category!" }
                });
            });
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
                self.categories().forEach(function (category) {
                    category.isSelected(newValue.categories().filter(function (c) { return category.id() === c.id() })
                        .length >
                        0);
                });

                self.updateErrors = ko.validation.group(newValue);

            } else {
                self.categories().forEach(function (category) {
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
        self.createPostErrorMessage = ko.observable();
        self.createPostSucceededMessage = ko.observable();
        self.updatePostErrorMessage = ko.observable();
        self.updatePostSucceededMessage = ko.observable();
        self.deletePostErrorMessage = ko.observable();
        self.deletePostSucceededMessage = ko.observable();
        self.deleteUserErrorMessage = ko.observable();
        self.deleteUserSucceededMessage = ko.observable();

        self.createErrors = ko.validation.group(self.newPost);
        self.updateErrors = {};

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
                    "insertJson",
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
                ],
                imageUploadParam: "picture",
                imageUploadURL: "../api/blog/upload-picture",
                imageUploadMethod: "POST",
            });
    };

    AdminViewModel.prototype.uploadPicture = function (picture) {
        var self = this;

        self.pictureUploadErrorMessage(null);

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
                self.newPost.pictureUrl(data.link);

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

        self.pictureDeleteErrorMessage(null);

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

        self.attachmentsUploadErrorMessage(null);

        self.attachmentsUploadAbortedMessage(null);

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

                data.attachments.forEach(function (attachment) {
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

        self.attachmentDeleteErrorMessage(null);

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

        self.resetMessages();

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
                self.createPostSucceededMessage("the post was successfully created!");

                ko.mapping.fromJS(data, {}, post);

                self.posts.unshift(post);

                self.isPosted(true);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.createPostErrorMessage(errorThrown);
            })
            .always(function (data, textStatus, jqXhr) {

            });
    };

    AdminViewModel.prototype.updatePost = function (post) {
        var self = this;

        self.updateErrors = ko.validation.group(post);

        self.resetMessages();
                
        if (self.updateErrors().length > 0) {
            self.updateErrors.showAllMessages();
            return;
        }

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
                self.updatePostSucceededMessage("the post was successfully updated!");

                ko.mapping.fromJS(data, {}, post);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.createPostErrorMessage(errorThrown);
            })
            .always(function (data, textStatus, jqXhr) {

            });

    };

    AdminViewModel.prototype.deletePost = function (post) {
        var self = this;

        var sure = confirm("are you sure you want to delete this post?");

        if (!sure) {
            return;
        }

        self.resetMessages();

        $.ajax({
            url: "../api/blog/post/delete?postId=" + post.id(),
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            cache: false,
            processData: false,
            async: false,
            success: function (data, textStatus, jqXhr) { }
        })
            .done(function (data, textStatus, jqXhr) {
                self.posts.splice(self.posts.indexOf(post), 1);

                self.deletePostSucceededMessage("the post was sucessfully deleted.");
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.deletePostErrorMessage("there was an error while deleting the post, please try again.");
            })
            .always(function (data, textStatus, jqXhr) {

            });
    };

    AdminViewModel.prototype.deleteUser = function (user) {
        var self = this;

        var sure = confirm("are you sure you want to delete this user? all posts will be deleted too!");

        if (!sure) {
            return;
        }

        self.resetMessages();

        $.ajax({
            url: "../api/account/delete?userId=" + user.id(),
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            cache: false,
            processData: false,
            async: false,
            success: function (data, textStatus, jqXhr) { }
        })
            .done(function (data, textStatus, jqXhr) {
                self.users.splice(self.users.indexOf(user), 1);

                self.deleteUserSucceededMessage("the user was sucessfully deleted.");
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.deleteUserErrorMessage("there was an error while deleting the user, please try again.");
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

        self.categories().forEach(function (category) { category.isSelected(false); });

        self.createErrors.showAllMessages(false);
    }

    AdminViewModel.prototype.resetMessages = function () {
        var self = this;

        self.createPostErrorMessage(null);
        self.createPostSucceededMessage(null);
        self.updatePostErrorMessage(null);
        self.updatePostSucceededMessage(null);
        self.deletePostErrorMessage(null);
        self.deletePostSucceededMessage(null);
        self.deleteUserErrorMessage(null);
        self.deleteUserSucceededMessage(null);
    }

    AdminViewModel.prototype.addCategory = function (category, categories) {
        var self = this;

        if (!self.categories().some(function (e) { return e.name().toLowerCase() === category().toLowerCase(); })) {
            var newCategory = ko.mapping.fromJS({ name: category(), id: "00000000-0000-0000-0000-000000000000", isSelected: true });

            self.categories.push(newCategory);
            categories.push(newCategory);
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