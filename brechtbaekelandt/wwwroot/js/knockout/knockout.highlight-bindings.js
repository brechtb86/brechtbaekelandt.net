/// <reference path="../../lib/jquery/dist/jquery.js" />
/// <reference path="../../lib/knockout/dist/knockout.debug.js" />

ko.bindingHandlers.highlight = {

    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

        var value = valueAccessor();
        var text = value.text || "";
        var keywords = value.keywords || [0];

        var highLightedText = ko.bindingHandlers.highlight.doHighLight(text, keywords);

        $(element).html(highLightedText);

    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

        var value = valueAccessor();
        var text = value.text || "";
        var keywords = value.keywords || [0];

        var highLightedText = ko.bindingHandlers.highlight.doHighLight(text, keywords);

        $(element).html(highLightedText);
    },
    doHighLight: function (text, keywords) {
        var newText = text;

        if (text && keywords && keywords.length > 0) {
            keywords.forEach(function (keyword) {
                if (keyword) {
                    newText = (!newText.startsWith("<") ? "<p>" + newText + "</p>" : newText).replace(/(>[^<]+)/igm,
                        function (result) {
                            return result.replace(new RegExp("(" + keyword + ")", "igm"), "<span class='high-lighted'>$1</span>");
                        });
                }
            });
        }

        return newText;
    }
}


