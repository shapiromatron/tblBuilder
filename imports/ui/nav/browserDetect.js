import { Template } from 'meteor/templating';


Template.browserDetect.helpers({
    isSupportedBrowser: function() {
        var isChrome = window.chrome != null,
            ua = navigator.userAgent.toLowerCase(),
            isFirefox = ua.indexOf('firefox') > -1,
            isSafari = ua.indexOf('safari') > -1;

        return isChrome || isFirefox || isSafari;
    },
});
