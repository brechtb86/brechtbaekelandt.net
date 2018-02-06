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
        var modelValue = unwrap(value());
        var allBindings = unwrap(bindings());
        
        if (model === null || typeof model === "undefined") {
            throw new Error("Cannot bind modal to undefined value. data-bind expression: " +
                element.getAttribute("data-bind"));
        }

        var isValueArray = modelValue instanceof Array;
        var allowedExtensions = allBindings.allowedExtensions || [];
        var allowedExtensionsWithDot = allowedExtensions.map(function (extension) {
            return extension.indexOf(".") < 0 ? "." + extension : extension;
        });
        var allowedExtensionsAcceptString = allowedExtensionsWithDot.join(",");

        $el.on("drop dragdrop", function (event) {
            event.preventDefault();

            if (!isValueArray) {

                var file = event.originalEvent.dataTransfer.files[0];

                if (allowedExtensions.length > 0) {
                    if ($.inArray(file.name.split(".").pop(), allowedExtensions) > -1) {
                        model(file);
                    }
                }
                else {
                    model(file);
                }
            }
            else {
                for (var i = 0; i < event.originalEvent.dataTransfer.files.length; i++) {

                    var currentFile = event.originalEvent.dataTransfer.files[i];

                    if (allowedExtensions.length > 0) {
                        if ($.inArray(currentFile.name.split(".").pop(), allowedExtensions) > -1) {
                            model.push(currentFile);
                        }
                    }
                    else {
                        model.push(currentFile);
                    }
                }
            }

            $(this).removeClass("enter-drag");
            $(this).removeClass("leave-drag");
        });

        var $inputElement = $("<input type='file' class='hidden' />");

        if (allowedExtensions.length > 0) {
            $inputElement.attr("accept", allowedExtensionsAcceptString);
        }

        $el.append($inputElement);

        $el.dblclick(function () {

            $(element).find("input:file").click();
        });

        $el.find("input:file").change(function () {
            var val = $(this).val();

            if (val) {
                if (!isValueArray) {
                    model($(this).get(0).files[0]);
                } else {
                    model.push($(this).get(0).files[0]);
                }
            }
        });

        $el.on("dragenter", function () {
            $(this).addClass("enter-drag");
        });

        $el.on("dragleave", function () {
            $(this).addClass("leave-drag");
        });

        $el.on("dragover", function (event) {
            event.preventDefault();
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
        var model = value();
        var modelValue = unwrap(value());


    }

    ko.bindingHandlers.dropUpload = {
        init: init,
        update: update
    }
})();