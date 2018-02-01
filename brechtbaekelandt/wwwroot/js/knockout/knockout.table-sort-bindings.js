/// <reference path="../../lib/jquery/dist/jquery.js" />
/// <reference path="../../lib/knockout/dist/knockout.debug.js" />

ko.bindingHandlers.tableSort = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var asc = false;

        var $element = $(element);

        $element.css("cursor", "pointer");

        $element.click(function () {
            var value = valueAccessor();
            var prop = value.property;
            var items = value.items;

            asc = !asc;

            items.sort(function (left, right) {
                var item1 = left;
                var item2 = right;

                if (!asc) {
                    item1 = right;
                    item2 = left;
                }

                var props = prop.replace("()", "").split(".");
                for (var i in props) {
                    if (props.hasOwnProperty(i)) {
                        var propName = props[i];

                        if (ko.isObservable(item1[propName]) && ko.isObservable(item2[propName])) {
                            item1 = item1[propName]();
                            item2 = item2[propName]();
                        } else {
                            item1 = item1[propName];
                            item2 = item2[propName];
                        }
                    }
                }

                return item1 === item2 ? 0 : item1 < item2 ? -1 : 1;
            });
        });
    }
};