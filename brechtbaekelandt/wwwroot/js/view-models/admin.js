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
                post.categories.extend({
                    minimumItemsInArray: { params: { minimum: 1 }, message: "you didn't select a category!" }
                });
            });
        }

        self.showPostCreate = ko.observable();
        self.showPostCreate.subscribe(function(newValue) {
            function eventHandler(event) {
                if (event.which === 83 && event.ctrlKey) {
                    event.preventDefault();

                    self.createPost(self.newPost);

                    return false;
                };

                return true;
            }

            if (newValue) {
                $(document).bind("keydown", eventHandler);

            } else {
                $(document).unbind("keydown", eventHandler);
            }
        });

        self.showPostEdit = ko.observable();
        self.showPostEdit.subscribe(function(newValue) {
            function eventHandler(event) {
                if (event.which === 83 && event.ctrlKey) {
                    event.preventDefault();

                    self.updatePost(self.selectedPost);

                    return false;
                };

                return true;
            }

            if (newValue) {
                $(document).bind("keydown", eventHandler);

            } else {
                $(document).unbind("keydown", eventHandler);
            }
        });

        self.showUserCreate = ko.observable();
        self.showUserCreate.subscribe(function(newValue) {
            function eventHandler(event) {
                if (event.which === 83 && event.ctrlKey) {
                    event.preventDefault();

                    self.createUser(self.newUser);

                    return false;
                };

                return true;
            }

            if (newValue) {
                $(document).bind("keydown", eventHandler);

            } else {
                $(document).unbind("keydown", eventHandler);
            }
        });

        self.showUserEdit = ko.observable();
        self.showUserEdit.subscribe(function(newValue) {
            function eventHandler(event) {
                if (event.which === 83 && event.ctrlKey) {
                    event.preventDefault();

                    self.updateUser(self.selectedUser);

                    return false;
                };

                return true;
            }

            if (newValue) {
                $(document).bind("keydown", eventHandler);

            } else {
                $(document).unbind("keydown", eventHandler);
            }
        });

        self.newPost = {};
        self.newPost.id = ko.observable();
        self.newPost.title = ko.observable().extend({ required: { message: "you didn't fill in the title!" } });
        self.newPost.description = ko.observable().extend({ required: { message: "you didn't fill in the description!" } });
        self.newPost.content = ko.observable();
        self.newPost.categories = ko.observableArray().extend({ minimumItemsInArray: { params: { minimum: 1 }, message: "you didn't select a category!" } });
        self.newPost.tags = ko.observableArray();
        self.newPost.pictureUrl = ko.observable();
        self.newPost.attachments = ko.observableArray();
        self.newPost.isPostVisible = ko.observable(false);
        self.newPost.isPostPinned = ko.observable(false);
        self.newPost.url = ko.observable();
        self.newPost.pictureToUpload = ko.observable();
        self.newPost.pictureToUpload.subscribe(function (picture) {
            if (picture) {
                self.uploadPicture(self.newPost, picture);
            }
        });

        self.selectedPost = ko.observable();
        self.selectedPost.subscribe(function (post) {
            if (post) {
                self.categories().forEach(function (category) {
                    category.isSelected(post.categories().filter(function (c) { return category.id() === c.id() })
                        .length >
                        0);
                });

                post.pictureToUpload = ko.observable();
                post.pictureToUpload.subscribe(function (picture) {
                    if (picture) {
                        self.uploadPicture(post, picture);
                    }
                });

                self.updatePostErrors = ko.validation.group(post);

            } else {
                self.categories().forEach(function (category) {
                    category.isSelected(false);
                });
            }
        });

        self.newUser = {};
        self.newUser.userName = ko.observable().extend({
            required: { message: "you didn't fill in a user name!" },
            pattern: {
                message: "the username cannot contain any spaces or special characters.",
                params: "^[a-zA-Z0-9]*$"
            }
        });
        self.newUser.firstName = ko.observable().extend({ required: { message: "you didn't fill in a first name!" } });
        self.newUser.lastName = ko.observable().extend({ required: { message: "you didn't fill in a last name!" } });
        self.newUser.fullName = ko.computed(function () {
            return self.newUser.firstName() + " " + self.newUser.lastName();
        });
        self.newUser.emailAddress = ko.observable().extend({
            required: { message: "you didn't fill in an email address!" },
            email: { message: "the email address is not valid!" }
        });
        self.newUser.password = ko.observable().extend({
            required: {
                message: "you didn't fill in a password!"
            },
            pattern: {
                message: "the password must contain at least one digit, one special character and must be minimum 6 characters long.",
                params: "^(?=.*[a-z])(?=.*\\d)(?=.*[#$^+=!*()@%&]).{8,255}$"
            }
        });
        self.newUser.isAdmin = ko.observable();

        self.selectedUser = ko.observable();
        self.selectedUser.subscribe(function (newValue) {
            if (newValue) {
                newValue.userName.extend({ required: { message: "you didn't fill in a user name!" } });
                newValue.firstName.extend({ required: { message: "you didn't fill in a first name!" } });
                newValue.lastName.extend({ required: { message: "you didn't fill in a last name!" } });
                newValue.emailAddress.extend({
                    required: { message: "you didn't fill in an email address!" },
                    email: { message: "the email address is not valid!" }
                });
                newValue.email = ko.computed(() => { return newValue.emailAddress() });

                self.updateUserErrors = ko.validation.group(newValue);
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
        self.createUserErrorMessage = ko.observable();
        self.createUserSucceededMessage = ko.observable();
        self.updateUserErrorMessage = ko.observable();
        self.updateUserSucceededMessage = ko.observable();
        self.deleteUserErrorMessage = ko.observable();
        self.deleteUserSucceededMessage = ko.observable();

        self.createPostErrors = ko.validation.group(self.newPost);
        self.updatePostErrors = {};
        self.createUserErrors = ko.validation.group(self.newUser);
        self.updateUserErrors = {};

        self.categoryToAdd = ko.observable();
        self.tagToAdd = ko.observable();

        self.isLoading = ko.observable(true);
        self.isPosted = ko.observable(false);
        self.isUserCreated = ko.observable(false);

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
                        "insertImage",
                        "|",
                        "clearFormatting",
                        "selectAll",
                        "|",
                        "html"
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
                        "|",
                        "clearFormatting",
                        "selectAll",
                        "|",
                        "html"
                    ],
                imageUploadParam: "picture",
                imageUploadURL: "../api/blog/upload-picture",
                imageUploadMethod: "POST"
            });
    }

    AdminViewModel.prototype.uploadPicture = function (post, picture) {
        var self = this;

        self.pictureUploadErrorMessage(null);

        const formData = new FormData();
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
                const xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        const progress = Math.round((evt.loaded / evt.total) * 100);
                    }
                }, false);
                return xhr;
            }
        })
            .done(function (data, textStatus, jqXhr) {
                post.pictureToUpload(null);
                post.pictureUrl(data.link);

                $(".picture-drop-zone input:file").val();
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.pictureUploadErrorMessage("there was an error while uploading the file, please try again.");
            })
            .always(function (jqXhr, textStatus, errorThrown) {
            });
    };

    AdminViewModel.prototype.deletePicture = function(post) {
        var self = this;

        self.pictureDeleteErrorMessage(null);

        if (!post.id()) {
            post.pictureUrl(null);

            return;
        }

        $.ajax({
                url: "../api/blog/delete-picture?picture=" + post.pictureUrl(),
                type: "POST",
                success: function(data, textStatus, jqXhr) {},
                async: false
            })
            .done(function(data, textStatus, jqXhr) {
                post.pictureUrl(null);
            })
            .fail(function(jqXhr, textStatus, errorThrown) {
                self.pictureDeleteErrorMessage("there was an error while deleting the file, please try again.");
            })
            .always(function(data, textStatus, jqXhr) {

            });
    };

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

        const jqxhr = $.ajax({
                url: "../api/blog/upload-attachments",
                type: "POST",
                contentType: false,
                data: formData,
                dataType: "json",
                cache: false,
                processData: false,
                async: false,
                xhr: function () {
                    const xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress",
                        function (evt) {
                            if (evt.lengthComputable) {
                                const progress = Math.round((evt.loaded / evt.total) * 100);
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
        const self = this;

        const xhr = self.attachmentsUploadRequest();
        xhr.abort();
    };

    AdminViewModel.prototype.deleteSelectedAttachmentToUpload = function (item) {
        const self = this;

        self.attachmentsToUpload.remove(item);

        $(".attachments-drop-zone input:file").val();
    };

    AdminViewModel.prototype.deleteUploadedAttachment = function(post, attachment) {
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
                success: function(data, textStatus, jqXhr) {}
            })
            .done(function(data, textStatus, jqXhr) {
                ko.mapping.fromJS(self.post.attachments().filter(function(a) {
                        return a.id !== data.id;
                    }),
                    {},
                    self.post.attachments);
            })
            .fail(function(jqXhr, textStatus, errorThrown) {
                self.attachmentDeleteErrorMessage("there was an error while deleting the file, please try again.");
            })
            .always(function(data, textStatus, jqXhr) {

            });
    };

    AdminViewModel.prototype.createPost = function (post) {
        var self = this;

        self.resetMessages();

        self.isPosted(false);

        if (self.createPostErrors().length > 0) {
            self.createPostErrors.showAllMessages();
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

                self.posts.unshift(self.clone(post));

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

        self.updatePostErrors = ko.validation.group(post);

        self.resetMessages();

        if (self.updatePostErrors().length > 0) {
            self.updatePostErrors.showAllMessages();
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

                const originalPost = self.posts().find((p) => p.id() === (ko.isObservable(post) ? post().id() : post.id()));

                ko.mapping.fromJS(data, {}, originalPost);
                ko.mapping.fromJS(data, {}, post);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.updatePostErrorMessage(errorThrown);
            })
            .always(function (data, textStatus, jqXhr) {

            });

    };

    AdminViewModel.prototype.deletePost = function (post) {
        var self = this;

        const sure = confirm("are you sure you want to delete this post?");

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

                self.deletePostSucceededMessage("the post was successfully deleted.");
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.deletePostErrorMessage("there was an error while deleting the post, please try again.");
            })
            .always(function (data, textStatus, jqXhr) {

            });
    };

    AdminViewModel.prototype.createUser = function (user) {
        var self = this;

        self.resetMessages();

        self.isUserCreated(false);

        if (self.createUserErrors().length > 0) {
            self.createUserErrors.showAllMessages();
            return;
        }

        $.ajax({
            url: "../api/account/add",
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            data: ko.toJSON(user),
            dataType: "json",
            cache: false,
            processData: false,
            async: false,
            success: function (data, textStatus, jqXhr) { }
        })
            .done(function (data, textStatus, jqXhr) {
                self.createUserSucceededMessage("the user was successfully created!");

                ko.mapping.fromJS(data.user, {}, user);

                self.users.unshift(self.clone(user));

                self.isUserCreated(true);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.createUserErrorMessage(errorThrown);
            })
            .always(function (data, textStatus, jqXhr) {

            });
    };

    AdminViewModel.prototype.updateUser = function (user) {
        var self = this;

        self.resetMessages();

        if (self.updateUserErrors().length > 0) {
            self.updateUserErrors.showAllMessages();
            return;
        }

        $.ajax({
            url: "../api/account/update",
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            data: ko.toJSON(user),
            dataType: "json",
            cache: false,
            processData: false,
            async: false,
            success: function (data, textStatus, jqXhr) { }
        })
            .done(function (data, textStatus, jqXhr) {
                self.updateUserSucceededMessage("the user was successfully updated!");

                const originalUser = self.users().find((u) => u.id() === (ko.isObservable(user) ? user().id() : user.id()));

                ko.mapping.fromJS(data.user, {}, originalUser);
                ko.mapping.fromJS(data.user, {}, user);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.updateUserErrorMessage(errorThrown);
            })
            .always(function (data, textStatus, jqXhr) {

            });
    };

    AdminViewModel.prototype.deleteUser = function (user) {
        var self = this;

        const sure = confirm("are you sure you want to delete this user? all posts will be deleted too!");

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

                self.deleteUserSucceededMessage("the user was successfully deleted.");
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                self.deleteUserErrorMessage("there was an error while deleting the user, please try again.");
            })
            .always(function (data, textStatus, jqXhr) {

            });
    };

    AdminViewModel.prototype.resetNewPost = function(newPost) {
        const self = this;

        newPost.title("");
        newPost.description("");
        newPost.content("");
        newPost.categories([]);
        newPost.tags([]);
        newPost.pictureUrl("");
        newPost.attachments([]);

        self.categories().forEach(function(category) { category.isSelected(false); });

        self.createPostErrors.showAllMessages(false);
    };

    AdminViewModel.prototype.resetNewUser = function(newUser) {
        const self = this;

        newUser.userName("");
        newUser.firstName("");
        newUser.lastName("");
        newUser.emailAddress("");
        newUser.password("");

        self.createUserErrors.showAllMessages(false);
    };

    AdminViewModel.prototype.resetMessages = function() {
        const self = this;

        self.createPostErrorMessage(null);
        self.createPostSucceededMessage(null);
        self.updatePostErrorMessage(null);
        self.updatePostSucceededMessage(null);
        self.deletePostErrorMessage(null);
        self.deletePostSucceededMessage(null);
        self.createUserErrorMessage(null);
        self.createUserSucceededMessage(null);
        self.updateUserErrorMessage(null);
        self.updateUserSucceededMessage(null);
        self.deleteUserErrorMessage(null);
        self.deleteUserSucceededMessage(null);
    };

    AdminViewModel.prototype.addCategory = function (category, categories) {
        const self = this;

        if (!self.categories().some(function (e) { return e.name().toLowerCase() === category().toLowerCase(); })) {
            const newCategory = ko.mapping.fromJS({ name: category(), id: "00000000-0000-0000-0000-000000000000", isSelected: true });

            self.categories.push(newCategory);
            categories.push(newCategory);
        }

        category(null);
    };

    AdminViewModel.prototype.toggleSelectedCategory = function (category, categories) {
        const self = this;

        if (category.isSelected()) {
            
            categories = categories.splice(categories.indexOf(category), 1);

            category.isSelected(false);
        }
        else {
            categories.push(category);
            category.isSelected(true);
        }
    };

    AdminViewModel.prototype.addTag = function (tag, targetTagList) {
        const self = this;

        targetTagList.push(tag().toLowerCase());

        tag(null);
    };

    AdminViewModel.prototype.removeTag = function (tag, tags) {
        const self = this;

        if (tags.indexOf(tag) > -1) {
            tags = tags.splice(tags.indexOf(tag), 1);
        }
    };

    AdminViewModel.prototype.clone = function(object) {
        return ko.mapping.fromJS(ko.toJS(object));
    };

    function init(serverViewModel) {

        const viewModel = new AdminViewModel(serverViewModel);

        ko.applyBindings(viewModel);
    }

    return {
        AdminViewModel: AdminViewModel,
        init: init
    };

})($, jQuery, ko);