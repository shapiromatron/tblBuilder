import { Template } from 'meteor/templating';


Template.browserDetect.helpers({
    isSupportedBrowser: function() {
        var isChrome = window.chrome != null,
            ua = navigator.userAgent.toLowerCase(),
            isFirefox = ua.indexOf('firefox') > -1,
            isSafari = ua.indexOf('safari') > -1;

        return isChrome || isFirefox || isSafari;
    },
    getErrorMessage: function() {
        return '<b>Warning:</b> Your current browser has not been tested extensively with this website, which may result in some some errors with functionality. The following browsers are supported: <ul> <li><a href="https://www.google.com/chrome/" target="_blank">Google Chrome</a> (preferred)</li> <li><a href="https://www.mozilla.org/firefox/" target="_blank">Mozilla Firefox</a></li> <li><a href="https://www.apple.com/safari/" target="_blank">Apple Safari</a></li> </ul><br> Please use a different browser for an optimal experience.';
    },
});
