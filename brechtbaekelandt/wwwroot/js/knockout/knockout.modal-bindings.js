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
        var model = value();
        var modelValue = unwrap(value());

        $el.modal({
            show: false
        });

        $el.on("hide.bs.modal", function () {
            model(false);
        });

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $el.modal("destroy");
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
        var $el = $(element);
        var modelValue = unwrap(value());

        if (modelValue) {
            $el.modal("show");
        } else {
            $el.modal("hide");
        }
    }

    ko.bindingHandlers.modal = {
        init: init,
        update: update
    }
})();