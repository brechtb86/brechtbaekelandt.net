/// <reference path="../addthis/addthis_widget.js" />
/// <reference path="../../lib/knockout-mapping/build/output/knockout.mapping-latest.debug.js" />

var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.post = (function ($, jQuery, ko, undefined) {
    "use strict";

    function PostViewModel(serverViewModel) {
        var self = this;

        ko.mapping.fromJS(serverViewModel, {}, self);
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