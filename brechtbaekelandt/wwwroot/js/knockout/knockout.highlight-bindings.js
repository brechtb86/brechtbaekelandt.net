/// <reference path="../../lib/jquery/dist/jquery.js" />
/// <reference path="../../lib/knockout/dist/knockout.debug.js" />

ko.bindingHandlers.highlight = {

    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

        var value = valueAccessor();
        var text = value.text || "";
        var allowSpecialCharacters = value.allowSpecialCharacters || false;
        var keywords = value.keywords || [0];

        var highLightedText = ko.bindingHandlers.highlight.doHighLight(text, keywords, allowSpecialCharacters);

        $(element).html(highLightedText);

    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

        var value = valueAccessor();
        var text = value.text || "";
        var allowSpecialCharacters = value.allowSpecialCharacters || false;
        var keywords = value.keywords || [0];

        var highLightedText = ko.bindingHandlers.highlight.doHighLight(text, keywords, allowSpecialCharacters);

        $(element).html(highLightedText);
    },
    doHighLight: function (text, keywords, allowSpecialCharacters = false) {
        var result = text;

        if (text && keywords) {
            keywords.forEach(function (keyword) {
                if (keyword) {

                    result = !result.startsWith("<") && !result.endsWith(">") ? "<p>" + result + "</p>" : result;

                    result = result.replace(/(>[^<]+)/igm,
                        function (newText) {

                            if (!allowSpecialCharacters) {
                                keyword = keyword.replace(/([{}()[\]\\.?*+^$|=!:~-])/g, "\\$1");
                            }

                            return newText.replace(new RegExp("(" + keyword + ")", "igm"),
                                "<span class='high-lighted'>$1</span>");
                        });
                }
            });
        }

        return result;
    }
}


