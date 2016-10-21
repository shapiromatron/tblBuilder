import _ from 'underscore';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './ftpLinks.html';

import {
    b64toExcel,
    addUserMessage,
} from '/imports/api/client/utilities';


Template.ftpForm.events({
    'click #submit': function(evt, tmpl){

        // get data from form
        let data = {};
        _.each(tmpl.$('form').serializeArray(), function(d){
            data[d.name] = d.value;
        });

        // validate
        let validationErrs = [];
        if (data.host === ''){
            validationErrs.push('Host is required');
        }
        if (data.user === ''){
            validationErrs.push('Username is required');
        }
        if (data.password === ''){
            validationErrs.push('Password is required');
        }
        if(validationErrs.length > 0){
            return addUserMessage(validationErrs.join('<br>'), 'warning');
        }

        // execute method
        Meteor.call('adminFtpDownload', data, function(err, resp){
            if (resp){
                return b64toExcel(resp, 'ftpLinks.xlsx');
            }
            let message = `An error occured: ${err}`;
            addUserMessage(message, 'warning');
        });

    },
});
