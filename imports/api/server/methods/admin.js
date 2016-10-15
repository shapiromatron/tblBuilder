import _ from 'underscore';

import {Meteor} from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import PythonShell from 'python-shell';

import { isStaffOrHigher } from '/imports/api/server/utilities';

import tblBuilderCollections from '/imports/collections';

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
    adminUserEditProfile: function(_id, obj) {
        if (!isStaffOrHigher(this.userId)) {
            throw new Meteor.Error(403, 'Nice try wise-guy.');
        }
        return Meteor.users.update(_id, {$set: obj});
    },
    adminUserCreateProfile: function(obj) {
        var _id, opts;
        if (!isStaffOrHigher(this.userId)) {
            throw new Meteor.Error(403, 'Nice try wise-guy.');
        }
        obj.emails[0].address = obj.emails[0].address.trim();
        opts = {email: obj.emails[0].address};
        _id = Accounts.createUser(opts);
        Meteor.users.update(_id, {$set: obj});
    },
    adminUserResetPassword: function(_id) {
        if (!isStaffOrHigher(this.userId)) {
            throw new Meteor.Error(403, 'Nice try wise-guy.');
        }
        return Accounts.sendResetPasswordEmail(_id);
    },
    adminToggleQAd: function(_id, model) {
        var collection, obj, qad, timestamp, updates;
        if (!isStaffOrHigher(this.userId)) {
            throw new Meteor.Error(403, 'Nice try wise-guy.');
        }
        collection = tblBuilderCollections.evidenceLookup[model].collection;
        if (collection) {
            obj = collection.findOne(_id);
            if (obj) {
                qad = obj.isQA;
                if (qad) {
                    updates = {isQA: false, timestampQA: null, user_id_QA: null};
                } else {
                    timestamp = new Date();
                    updates = {isQA: true, timestampQA: timestamp, user_id_QA: this.userId};
                }
                collection.update(_id, {$set: updates});
                return {success: true, QAd: !qad};
            }
        }
        return {success: false};
    },
    adminSetPassword: function(_id, passwd) {
        if (!isStaffOrHigher(this.userId)) {
            throw new Meteor.Error(403, 'Nice try wise-guy.');
        }
        try {
            Accounts.setPassword(_id, passwd);
            return {success: true};
        } catch (_error) {
            return {success: false};
        }
    },
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
