var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.helpers = (function () {
    "use strict";

    function ByteHelper() {
    };

    ByteHelper.prototype.bytesToSizeString = function (bytes) {
        if (bytes === 0) return "0 Byte";

        var suffix = ["Bytes", "KB", "MB", "GB", "TB"];

        var i;

        var bytesDouble = bytes;

        for (i = 0; i < suffix.length && bytes >= 1024; i++ , bytes /= 1024) {
            bytesDouble = bytes / 1024;
        }

        return bytesDouble.toFixed(2) + " " + suffix[i];
    };

    function GuidHelper() {
    };

    GuidHelper.prototype.createGuid = function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    function NumberHelper() {
    };

    NumberHelper.prototype.roundTo = function (number, digits) {
        var negative = false;
        if (digits === undefined) {
            digits = 0;
        }
        if (number < 0) {
            negative = true;
            number = number * -1;
        }
        var multiplicator = Math.pow(10, digits);
        number = parseFloat((number * multiplicator).toFixed(11));
        number = (Math.round(number) / multiplicator).toFixed(2);
        if (negative) {
            number = (number * -1).toFixed(2);
        }
        return number;
    };

    function UrlHelper() {
    };

    UrlHelper.prototype.parseUrl = function (url) {
        var urlParseRegex = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;

        var matches = urlParseRegex.exec(url || "") || [];

        var queryString = [];

        var search = matches[16] || "";
        if (search !== "") {
            var hash;
            var hashes = search.substring(1).split("&");
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split("=");
                queryString.push(hash[0]);
                queryString[hash[0]] = hash[1];
            }
        }

        var fileExtension = "";

        var filename = matches[15] || "";
        if (filename !== "") {
            if (filename.indexOf(".") > -1) {
                var splitDot = filename.split(".");
                fileExtension = splitDot[splitDot.length - 1];
            }
        }

        return {
            href: matches[0] || "",
            hrefNoHash: matches[1] || "",
            hrefNoSearch: matches[2] || "",
            domain: matches[3] || "",
            protocol: matches[4] || "",
            doubleSlash: matches[5] || "",
            authority: matches[6] || "",
            username: matches[8] || "",
            password: matches[9] || "",
            host: matches[10] || "",
            hostname: matches[11] || "",
            port: matches[12] || "",
            pathname: matches[13] || "",
            directory: matches[14] || "",
            filename: filename,
            search: search,
            hash: matches[17] || "",
            queryString: queryString,
            fileExtension: fileExtension
        };
    };

    UrlHelper.prototype.getParameterByName = function (url, name) {
        if (!url) url = window.location.href;

        name = name.replace(/[\[\]]/g, "\\$&");

        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);

        if (!results) {
            return null
        };

        if (!results[2]) {
            return "";
        }

        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    UrlHelper.prototype.isValidMagnetUrl = function (url) {
        var urlRegex = /magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i;

        return url.match(urlRegex) !== null;
    };

    UrlHelper.prototype.isValidUrl = function (url) {
        var urlRegex =
            /(http(s)?:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

        return url.match(urlRegex) !== null;
    };

    function WebHelper() {
    };

    WebHelper.prototype.fileExists = function (url) {
        var http = new XMLHttpRequest();
        http.open("HEAD", url, false);
        http.send();

        return http.status !== 404;
    };

    return {
        ByteHelper: ByteHelper,
        GuidHelper: GuidHelper,
        NumberHelper: NumberHelper,
        UrlHelper: UrlHelper,
        WebHelper: WebHelper
    };
})();