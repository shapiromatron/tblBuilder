import { Session } from 'meteor/session';

Session.setDefault('showSortIndex', false);
Session.setDefault('showIds', false);

window.tblDebug = {
    toggleIdDisplay(){
        let val = !Session.get('showIds');
        Session.set('showIds', val);
        console.debug('Show ids:', val);
    },
    toggleSortIndexDisplay(){
        let val = !Session.get('showSortIndex');
        Session.set('showSortIndex', val);
        console.debug('Show sort index:', val);
    },
};
