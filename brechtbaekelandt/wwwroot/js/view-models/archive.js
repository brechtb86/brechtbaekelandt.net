/// <reference path="../knockout/knockout.extensions.js" />
/// <reference path="../addthis/addthis_widget.js" />
/// <reference path="../../lib/jquery/dist/jquery.js" />
/// <reference path="../../lib/knockout-mapping/build/output/knockout.mapping-latest.debug.js" />
/// <reference path="../helpers/helpers.js" />
/// <reference path="../../lib/fancybox/src/js/core.js" />

var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.archive = (function ($, jQuery, ko, undefined) {
    "use strict";

    function ArchiveViewModel(serverViewModel) {
        const self = this;

        ko.mapping.fromJS(serverViewModel, {}, self);
    }
  
    function init(serverViewModel) {

        var viewModel = new ArchiveViewModel(serverViewModel);

        ko.applyBindings(viewModel);
    }

    return {
        ArchiveViewModel: ArchiveViewModel,
        init: init
    };

})($, jQuery, ko);