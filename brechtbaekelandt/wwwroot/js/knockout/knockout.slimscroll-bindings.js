/// <reference path="../../lib/jquery/dist/jquery.js" />
/// <reference path="../../lib/jquery-slimscroll/jquery.slimscroll.js" />
/// <reference path="../../lib/knockout/dist/knockout.debug.js" />

ko.bindingHandlers.slimscroll = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = valueAccessor();
        var options = value.options || {};

        $(element).slimscroll(options);
    }
};