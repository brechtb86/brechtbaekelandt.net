/// <reference path="../addthis/addthis_widget.js" />
/// <reference path="../../lib/knockout-mapping/build/output/knockout.mapping-latest.debug.js" />

var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.post = (function ($, jQuery, ko, undefined) {
    "use strict";

    function PostViewModel(serverViewModel) {
        var self = this;

        ko.mapping.fromJS(serverViewModel, {}, self);

        self.isUploadingPicture = ko.observable(false);
        self.isUploadingPictureFinished = ko.observable(false);

        self.pictureToUpload = ko.observable();
        self.pictureUploadProgress = ko.observable(0);

        self.pictureUploadAbortedMessage = ko.observable();
        self.pictureUploadErrorMessage = ko.observable();
        self.pictureUploadRequest = ko.observable();
    };

   

    PostViewModel.prototype.uploadPicture = function () {
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

    PostViewModel.prototype.abortPictureUpload = function () {
        var self = this;

        self.pictureUploadRequest().abort();

    };

    PostViewModel.prototype.initFancyBox = function () {
        $("[data-fancybox]").fancybox({
            buttons: [
                //'slideShow',
                "fullScreen",
                //'thumbs',
                //'share',
                "download",
                "zoom",
                "close"
            ]
        });
    }

    PostViewModel.prototype.initAddThis = function () {
        addthis.init();

        if (addthis.layers.refresh) {
            addthis.layers.refresh();
        }
    }

    function init(serverViewModel) {
        var viewModel = new PostViewModel(serverViewModel);

        ko.applyBindings(viewModel);
    }

    return {
        PostViewModel: PostViewModel,
        init: init
    };

})($, jQuery, ko);