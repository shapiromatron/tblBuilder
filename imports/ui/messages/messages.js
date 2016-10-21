import './messages.html';

import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';


Session.setDefault('messages', []);


Template.messages.helpers({
    getMessages(){
        return Session.get('messages');
    },
});


Template.dismissableAlert.events({
    'click .close': function(evt, tmpl) {
        let messages = Session.get('messages'),
            targetString = JSON.stringify(tmpl.data);

        for (var i=0; i<messages.length; i++){
            if (targetString === JSON.stringify(messages[i])){
                messages.splice(i, 1);
                Session.set('messages', messages);
                break;
            }
        }
    },
});

