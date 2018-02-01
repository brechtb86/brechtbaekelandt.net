var parseURL = function (url) {
    var urlParseRegex = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;
    var matches = urlParseRegex.exec(url || "") || [];

    var search = matches[16] || "";
    var queryString = [];
    if (search !== "") {
        var hash;
        var hashes = search.substring(1).split("&");
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split("=");
            queryString.push(hash[0]);
            queryString[hash[0]] = hash[1];
        }
    }
    var filename = matches[15] || "";
    var fileExtension = "";
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
        filename: filename,//matches[15] || "",
        search: search,// matches[16] || "",
        hash: matches[17] || "",
        queryString: queryString,
        fileExtension: fileExtension
    };
};

isValidMagnetUrl = function (url) {
    var urlRegex = /magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i;

    return url.match(urlRegex) !== null;
}

isValidUrl = function (url) {
    var urlRegex =
        /(http(s)?:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

    return url.match(urlRegex) !== null;
}