(function () {
    "use strict";

    // locals
    var unwrap = ko.utils.unwrapObservable;

    /**
    * initiate        
    *
    * @param {element} element
    * @param {object} value
    * @param {object} bindings
    * @api public
    */
    function init(element, value, bindings) {
        var $el = $(element);
        var modelValue = unwrap(value());

        var text = modelValue.text || "";
        var keywords = modelValue.keywords || [0];

        var highLightedText = highlight(text, keywords);

        $el.html(highLightedText);
    }

    /**
    * update
    *
    * @param {element} element
    * @param {object} value
    * @param {object} bindings
    * @api public
    */
    function update(element, value, bindings) {
        var $el = $(element);
        var modelValue = unwrap(value());

        var text = modelValue.text || "";
        var keywords = modelValue.keywords || [0];

        var highLightedText = highlight(text, keywords);

        $el.html(highLightedText);
    }

    /**
    * highlight
    *
    * @param {object} text
    * @param {object} keywords
    * @api private
    */
    function highlight(text, keywords) {
        var newText = text;

        if (text && keywords && keywords.length > 0) {
            keywords.forEach(function (keyword) {
                if (keyword) {
                    newText = (!newText.startsWith("<") ? "<p>" + newText + "</p>" : newText).replace(/(>[^<]+)/igm,
                        function (result) {
                            return result.replace(new RegExp("(" + keyword + ")", "igm"),
                                "<span class='high-lighted'>$1</span>");
                        });
                }
            });
        }

        return newText;
    }

    ko.bindingHandlers.highlight = {
        init: init,
        update: update
    }
})();