import { Session } from 'meteor/session';

Session.setDefault('showSortIndex', false);

window.tblDebug = {
    sortIndexDisplay(){
        let val = !Session.get('showSortIndex');
        Session.set('showSortIndex', val);
        console.debug('Show sort index:', val);
    },
};
