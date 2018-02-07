(function () {
    "use strict";

    // locals
    var unwrap = ko.unwrap;

    /**
    * initiate        
    *
    * @param {element} element
    * @param {object} value
    * @param {object} bindings
     * * @param {object} viewModel
    * @api public
    */
    function init(element, value, bindings, viewModel) {
        var $el = $(element);
        var model = value();

        $el.keypress(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                event.preventDefault();
                model.call(viewModel);
                return false;
            }
            return true;
        });
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

    }

    ko.bindingHandlers.enterKey = {
        init: init,
        update: update
    }
})();

(function () {
    "use strict";

    // locals
    var unwrap = ko.unwrap;

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
        var model = value();
        var allBindings = unwrap(bindings());
        var timeOut = allBindings.timeOut || 250;

        var typingTimeout;

        $el.keydown(function () {
            model(true);
        });

        $el.keyup(function () {
            if (typingTimeout != undefined) clearTimeout(typingTimeout);
            typingTimeout = setTimeout(function () { model(false); }, timeOut);
        });

        function callServerScript() {
            // your code here
        }
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

    }

    ko.bindingHandlers.isTyping = {
        init: init,
        update: update
    }
})();

