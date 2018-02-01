var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.post = (function ($, jQuery, ko, undefined) {
    "use strict";

    //function findIndexByKeyValue(arr, key, value) {
    //    for (var i = 0; i < arr.length; i++) {

    //        var currentValue;

    //        if (ko.isObservable(arr[i][key])) {
    //            currentValue = arr[i][key]();
    //        }
    //        else {
    //            currentValue = arr[i][key];
    //        }
    //        if (currentValue === value) {
    //            return i;
    //        }
    //    }
    //    return null;
    //}

    function PostViewModel(serverViewModel) {
        var self = this;

        ko.mapping.fromJS(serverViewModel, {}, self);
    };

    function init(serverViewModel) {
        var viewModel = new PostViewModel(serverViewModel);

        ko.applyBindings(viewModel);
    }

    return {
        PostViewModel: PostViewModel,
        init: init
    };

})($, jQuery, ko);