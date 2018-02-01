/// <reference path="../../lib/knockout/dist/knockout.debug.js" />

ko.subscribable.fn.subscribeChanged = function (callback) {
    var oldVal;

    this.subscribe(function (oldValue) {
        oldVal = oldValue;
    }, this, "beforeChange");

    this.subscribe(function (newValue) {
        callback(newValue, oldVal);
    });
};