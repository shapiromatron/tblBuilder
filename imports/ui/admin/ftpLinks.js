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
        let data = {};
        _.each(tmpl.$('form').serializeArray(), function(d){
            data[d.name] = d.value;
        });
        Meteor.call('adminFtpDownload', data, function(err, resp){
            if (resp){
                return b64toExcel(resp, 'ftpLinks.xlsx');
            }
            let message = `An error occured: ${err}`;
            addUserMessage(message, 'warning');
        });
    },
});
