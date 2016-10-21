import {Meteor} from 'meteor/meteor';

import { isStaffOrHigher } from '/imports/api/server/utilities';

import {
    getPyShell,
} from '/imports/api/server/utilities';


let Future = Npm.require('fibers/future'),
    generateFtpExcel = function(fut, data){
        var result,
            shell = getPyShell('ftpScraper.py');

        shell.on('message', function(msg){
            result = msg.xlsx;
            console.log(msg);
        });

        shell.send(JSON.stringify(data));

        shell.end(function(err) {
            if (err) {
                process.stdout.write(err.traceback);
            }
            return fut['return'](result);
        });
    };


Meteor.methods({
    adminFtpDownload: function(data) {
        if (!isStaffOrHigher(this.userId)) {
            throw new Meteor.Error(403, 'Nice try wise-guy.');
        }
        this.unblock();
        let fut = new Future();
        generateFtpExcel(fut, data);
        return fut.wait();
    },
});
