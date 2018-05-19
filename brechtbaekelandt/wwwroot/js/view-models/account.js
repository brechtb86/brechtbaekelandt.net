var brechtbaekelandt = brechtbaekelandt || {};

brechtbaekelandt.account = (function ($, jQuery, ko, undefined) {
    "use strict";

    function AccountViewModel() {
        var self = this;

        self.newUser = {};
        self.newUser.userName = ko.observable().extend({
            required: { message: "please enter the username." },
            pattern: {
                message: "the username cannot contain any spaces or special charachters.",
                params: "^[a-zA-Z0-9]*$"
            }
        });
        self.newUser.firstName = ko.observable().extend({ required: { message: "please enter the first name." } });
        self.newUser.lastName = ko.observable().extend({ required: { message: "please enter the lastname." } });
        self.newUser.fullName = ko.computed(function () {
            return self.newUser.firstName() + " " + self.newUser.lastName();
        });
        self.newUser.emailAddress = ko.observable().extend({
            required: { message: "please enter the email address." },
            email: { message: "please enter a valid email address." }
        });
        self.newUser.password = ko.observable().extend({
            required: {
                message: "please enter the password."
            },
            pattern: {
                message: "the password must contain at least one digit, one special character and must be minimum 6 charachters long.",
                params: "^(?=.*[a-z])(?=.*\\d)(?=.*[#$^+=!*()@%&]).{8,255}$"
            }
        });
        self.newUser.isAdmin = ko.observable();

        self.isUserAddSuccess = ko.observable(false);

        self.userAddErrorMessage = ko.observable();
        self.userAddErrorMessages = ko.observableArray();
        self.userDeleteErrorMessage = ko.observable();

        self.userAddErrors = ko.validation.group(self.newUser);
    };

    AccountViewModel.prototype.addUser = function (user) {
        var self = this;

        self.userAddErrorMessage("");
        self.userAddErrorMessages([]);

        self.isUserAddSuccess(false);

        if (self.userAddErrors().length > 0) {
            self.userAddErrors.showAllMessages(true);
            return;
        }

        $.ajax({
            url: "../api/account/add",
            dataType: "json",
            contentType: "application/json",
            type: "post",
            data: ko.toJSON(user)
        })
            .done(function (data, textStatus, jqXhr) {

                self.newUser.userName("");
                self.newUser.firstName("");
                self.newUser.lastName("");
                self.newUser.emailAddress("");
                self.newUser.password("");
                self.newUser.isAdmin(false);

                for (var prop in self.newUser) {
                    if (self.newUser.hasOwnProperty(prop)) {
                        if (!ko.isComputed(self.newUser[prop])) {
                            self.newUser[prop].isModified(false);
                        }
                    }
                }

                self.isUserAddSuccess(true);

                self.userAddErrors.showAllMessages(false);
            })
            .fail(function (jqXhr, textStatus, errorThrown) {
                if (jqXhr.status === 400) {
                    self.userAddErrorMessages(jqXhr.responseJSON);
                } else {
                    self.userAddErrorMessage("there was a problem adding the user, please try again.");
                }
            })
            .always(function () {

            });
    };
    
    function init(serverViewModel) {
        var viewModel = new AccountViewModel();

        ko.applyBindings(viewModel);
    };

    return {
        AccountViewModel: AccountViewModel,
        init: init
    };

})($, jQuery, ko);