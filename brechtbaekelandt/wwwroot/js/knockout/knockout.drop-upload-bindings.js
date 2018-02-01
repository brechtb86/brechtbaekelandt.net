/// <reference path="../../lib/jquery/dist/jquery.js" />
/// <reference path="../../lib/knockout/dist/knockout.debug.js" />

ko.bindingHandlers.dropUpload = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = valueAccessor();

        if (value === null || typeof value === "undefined") {
            throw new Error("Cannot bind dropUpload to undefined value. data-bind expression: " +
                element.getAttribute("data-bind"));
        }

        var allowedExtensions = allBindings.get("allowedExtensions") || [];

        var allowedExtensionsWithDot = allowedExtensions.map(function (extension) {
            return "." + extension;
        });

        var allowedExtensionsString = allowedExtensionsWithDot.join(",");

        $(element).on("drop dragdrop", function (event) {
            event.preventDefault();
            for (var i = 0; i < event.originalEvent.dataTransfer.files.length; i++) {

                var file = event.originalEvent.dataTransfer.files[i];

                if (allowedExtensions.length > 0) {
                    var extension = file.name.split(".").pop();

                    if ($.inArray(extension, allowedExtensions) > -1) {
                        value.push(file);
                    }
                }
                else {
                    value.push(file);
                }
            }
            $(this).removeClass("drop-background");
        });

        var $inputElement = $("<input type='file' class='hidden' />");

        if (allowedExtensions.length > 0) {
            $inputElement.attr("accept", allowedExtensionsString);
        }

        $(element).append($inputElement);

        $(element).dblclick(function () {

            $(element).find("input:file").click();
        });
        $(element).find("input:file").change(function () {
            var val = $(this).val();

            if (val) {
                value.push($(this).get(0).files[0]);
            }
        });
        $(element).on("dragenter", function () {
            $(this).addClass("drop-background");
        });
        $(element).on("dragleave", function () {
            //$(this).css("background-color", "red");
        });
        $(element).on("dragover", function (event) {
            event.preventDefault();
        });
    }
};