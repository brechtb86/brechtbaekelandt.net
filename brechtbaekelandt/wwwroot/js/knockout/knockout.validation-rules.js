ko.validation.rules["requiresOneOf"] = {
    getValue: function (o) {
        return (typeof o === "function" ? o() : o);
    },
    validator: function (val, fields) {
        var self = this;

        var anyOne = ko.utils.arrayFirst(fields, function (field) {
            var stringTrimRegEx = /^\s+|\s+$/g,
                testVal;

            var val = self.getValue(field);

            if (val === undefined || val === null)
                return !required;

            testVal = val;
            if (typeof (val) == "string") {
                testVal = val.replace(stringTrimRegEx, "");
            }

            return ((testVal + "").length > 0);

        });

        return (anyOne != null);
    },
    message: "One of these fields is required"

};

ko.validation.rules["changeLimit"] = {
    validator: function (val, options) {
        return Math.abs(val - options.baseValueAccessor()) <= options.maxChange;
    },
    message: "Change limit exeeded"
};

ko.validation.rules["validObject"] = {
    validator: function (obj, bool) {
        if (!obj || typeof obj !== "object") {
            throw "[validObject] Parameter must be an object";
        }
        return bool === (ko.validation.group(obj)().length === 0);
    },
    message: "Every property of the object must validate to '{0}'"
};

ko.validation.rules["validArray"] = {
    validator: function (arr, bool) {
        if (!arr || typeof arr !== "object" || !(arr instanceof Array)) {
            throw "[validArray] Parameter must be an array";
        }
        return bool === (arr.filter(function (element) {
            return ko.validation.group(ko.utils.unwrapObservable(element))().length !== 0;
        }).length === 0);
    },
    message: "Every element in the array must validate to '{0}'"
};

ko.validation.rules["htmlNotEmpty"] = {
    validator: function (val, otherVal) {

        function isBlank(str) {
            return (!str || !str.match(/\S/));
        }

        function isEmpty(str) {
            return (!str || 0 === str.length);
        }

        function isHtmlEmpty(str) {
            if (!str.match(/^\s*?\\</)) return false;
            var s = $(str).text();
            return (isEmpty(s) || isBlank(s));
        }

        var invalid = isEmpty(val);
        if (!invalid) invalid = isHtmlEmpty(val);

        return !invalid;
    },
    message: "Invalid.  Please enter a value"
};

ko.validation.rules["nullableInt"] = {
    validator: function (val, validate) {
        return val === null || val === "" || (validate && /^-?\d*$/.test(val.toString()));
    },
    message: "Must be empty or an integer value"
};

ko.validation.rules["nullableDecimal"] = {
    validator: function (val, validate) {
        return val === null || val === "" || (validate && /^-?\d*(?:\.\d*)?$/.test(val.toString()));
    },
    message: "Must be empty or a decimal value"
};

ko.validation.rules["conditionalRequired"] = {
    validator: function (val, condition) {
        var required = false;
        if (typeof condition == "function") {
            required = condition();
        }
        else {
            required = condition;
        }

        if (required) {
            return !(val == undefined || val == null || val.length == 0);
        }
        else {
            return true;
        }
    },
    message: ko.validation.rules.required.message
}

ko.validation.rules["creditCard"] = {
    getValue: function (o) {
        return (typeof o === "function" ? o() : o);
    },
    validator: function (val, cardTypeField) {
        var self = this;

        var cctype = self.getValue(cardTypeField);
        if (!cctype) return false;
        cctype = cctype.toLowerCase();

        if (val.length < 15) {
            return (false);
        }
        var match = cctype.match(/[a-zA-Z]{2}/);
        if (!match) {
            return (false);
        }

        var number = val;
        match = number.match(/[^0-9]/);
        if (match) {
            return (false);
        }

        var fnMod10 = function (number) {
            var doubled = [];
            for (var i = number.length - 2; i >= 0; i = i - 2) {
                doubled.push(2 * number[i]);
            }
            var total = 0;
            for (var i = ((number.length % 2) == 0 ? 1 : 0); i < number.length; i = i + 2) {
                total += parseInt(number[i]);
            }
            for (var i = 0; i < doubled.length; i++) {
                var num = doubled[i];
                var digit;
                while (num != 0) {
                    digit = num % 10;
                    num = parseInt(num / 10);
                    total += digit;
                }
            }

            if (total % 10 == 0) {
                return (true);
            } else {
                return (false);
            }
        }

        switch (cctype) {
            case "vc":
            case "mc":
            case "ae":
                //Mod 10 check
                if (!fnMod10(number)) {
                    return false;
                }
                break;
        }
        switch (cctype) {
            case "vc":
                if (number[0] != "4" || (number.length !== 13 && number.length !== 16)) {
                    return false;
                }
                break;
            case "mc":
                if (number[0] != "5" || (number.length != 16)) {
                    return false;
                }
                break;

            case "ae":
                if (number[0] != "3" || (number.length != 15)) {
                    return false;
                }
                break;

            default:
                return false;
        }

        return (true);
    },
    message: "Card number not valid."
};

ko.validation.rules["areSame"] = {
    getValue: function (o) {
        return (typeof o === "function" ? o() : o);
    },
    validator: function (val, otherField) {
        return val === this.getValue(otherField);
    },
    message: "The fields must have the same value"
};

ko.validation.rules["passwordComplexity"] = {
    validator: function (val) {
        return /(?=^[^\s]{6,128}$)((?=.*?\d)(?=.*?[A-Z])(?=.*?[a-z])|(?=.*?\d)(?=.*?[^\w\d\s])(?=.*?[a-z])|(?=.*?[^\w\d\s])(?=.*?[A-Z])(?=.*?[a-z])|(?=.*?\d)(?=.*?[A-Z])(?=.*?[^\w\d\s]))^.*/.test("" + val + "");
    },
    message: "Password must be between 6 and 128 characters long and contain three of the following 4 items: upper case letter, lower case letter, a symbol, a number"
};

ko.validation.rules["arrayItemsPropertyValueUnique"] = {
    validator: function (array, arrayItemPropertyName) {
        if (!array || typeof array !== "object" || !(array instanceof Array)) {
            throw "[arrayItemsPropertyValueUnique] Parameter must be an array";
        }

        //console.log('arrayItemsPropertyValueUnique', array, arrayItemPropertyName);

        var values = [];

        for (var index = 0; index < array.length; index++) {
            var prop = array[index][arrayItemPropertyName];
            var value = prop();
            if (values.indexOf(value) != -1) {
                console.warn("The items in the array do not have a unique value for property '"
                    + arrayItemPropertyName + "'.", array);
                return false;
            } else {
                values.push(value);
            }
        }

        return true;
    },
    message: "The items in the array do not have a unique value for property '{0}'."
};

ko.validation.rules["uniqueConstraint"] = {
    validator: function (arr, itemPropertyNames) {
        if (!Array.isArray(arr)) {
            throw new TypeError("[uniqueConstraint] must extend an observableArray");
        }
        if (!Array.isArray(itemPropertyNames)) {
            itemPropertyNames = [itemPropertyNames];
        }
        var vals = [], v, stringJoinHash = "`\r", i = 0,
            mapToValues = function (pName) {
                return ko.unwrap(arr[i][pName]);
            };

        for (; i < arr.length; i++) {
            v = ko.utils.arrayMap(itemPropertyNames, mapToValues).join(stringJoinHash);
            if (ko.utils.arrayIndexOf(vals, v) != -1) {
                return false;
            } else {
                vals.push(v);
            }
        }

        return true;
    },
    message: "2 or more '{0}' items do not have a unique value."
};


ko.validation.rules["multiEmail"] = {
    validator: function (val, validate) {
        if (!validate) { return true; }

        var isValid = true;
        if (!ko.validation.utils.isEmptyVal(val)) {
            // use the required: true property if you don't want to accept empty values
            var values = val.split(";");
            $(values).each(function (index) {
                isValid = ko.validation.rules["email"].validator($.trim(this), validate);
                return isValid; // short circuit each loop if invalid
            });
        }
        return isValid;
    },
    message: "Please enter valid email addresses (separate multiple email addresses using a semicolon)."
};

ko.validation.rules["isUnique"] = {
    validator: function (newVal, options) {
        if (options.predicate && typeof options.predicate !== "function")
            throw new Error("Invalid option for isUnique validator. The 'predicate' option must be a function.");

        var array = options.array || options;
        var count = 0;
        ko.utils.arrayMap(ko.utils.unwrapObservable(array),
            function (existingVal) {
                if (equalityDelegate()(existingVal, newVal)) count++;
            });
        return count < 2;

        function equalityDelegate() {
            return options.predicate ? options.predicate : function (v1, v2) { return v1 === v2; };
        }
    },
    message: "This value is a duplicate"
};

ko.validation.rules["localizedDate"] = {
    validator: function (value, culture) {
        if (ko.validation.utils.isEmptyVal(value) || !culture) return true;

        var settings = $.datepicker.regional[culture];
        try {
            $.datepicker.parseDate(settings.dateFormat, value, settings);
            return true;
        } catch (e) {
            return false;
        }
    },
    message: "Please enter a proper date"
};

ko.validation.rules["json"] = {
    validator: function (value, validate) {
        // http://stackoverflow.com/a/20392392
        if (!validate) { return true; }
        try {
            var o = JSON.parse(value);
            return (o && typeof o === "object" && o !== null);
        }
        catch (e) { }
        return false;
    },
    message: "The field must be a valid JSON"
};

ko.validation.rules["existsIn"] = {
    validator: function (newVal, params) {

        if (newVal.length === 0) return true;

        var arr = params.array || params;

        var array = ko.unwrap(arr);

        if (!Array.isArray(params)) {
            if (typeof (newVal) === "string" && params.stringIgnoreCase) {
                newVal = newVal.toLowerCase();
                array = array.map(function (item) {
                    return item.toLowerCase();
                });
            }
        }

        return array.indexOf(newVal) > -1;
    },
    message: "The value doesn't exist in target array"
};


ko.validation.rules["doesntExistIn"] = {
    validator: function (newVal, params) {

        if (newVal.length === 0) return true;

        var arr = params.array || params;

        var array = ko.unwrap(arr);

        if (!Array.isArray(params)) {
            if (typeof (newVal) === "string" && params.stringIgnoreCase) {
                newVal = newVal.toLowerCase();
                array = array.map(function (item) {
                    return item.toLowerCase();
                });
            }
        }

        return array.indexOf(newVal) === -1;
    },
    message: "The value exists in target array"
};

ko.validation.rules["minAge"] = {
    validator: function (val, otherVal) {
        var yyyyMMDD = val.split("-");

        var today = new Date();
        var then = new Date(yyyyMMDD[0], yyyyMMDD[1] - 1, yyyyMMDD[2]);

        var yearDiff = today.getYear() - then.getYear();
        var monthDiff = today.getMonth() - then.getMonth();
        var dayDiff = today.getDate() - then.getDate();

        if (yearDiff < otherVal)
            return false;

        if (yearDiff > otherVal)
            return true;

        if (monthDiff < 0)
            return false;

        if (monthDiff > 0)
            return true;

        if (dayDiff < 0)
            return false;

        return true;
    },
    message: "You must be at least {0} years of age."
};
ko.validation.rules["ipAddress"] = {
    validator: function (val) {
        return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test("" + val + "");
    },
    message: "Please insert a valid ip address"
};

ko.validation.rules["minimumItemsInArray"] = {
    validator: function (arr, params) {
        if (!Array.isArray(arr)) {
            throw new TypeError("[minimumItemsInArray] must extend an observableArray");
        }

        if (params.minimum)
            return arr.length >= 1;

        return arr.length >= params.minimum;
    },
    message: "The There must be minimum one element in the array"
};
