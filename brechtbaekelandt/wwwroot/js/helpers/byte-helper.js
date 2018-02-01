function bytesToSizeString(bytes) {

    if (bytes === 0) return "0 Byte";

    var suffix = ["Bytes", "KB", "MB", "GB", "TB"];

    var i;

    var bytesDouble = bytes;

    for (i = 0; i < suffix.length && bytes >= 1024; i++ , bytes /= 1024) {
        bytesDouble = bytes / 1024;
    }

    return bytesDouble.toFixed(2) + " " + suffix[i];
};