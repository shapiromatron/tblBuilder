import _ from 'underscore';
import {Meteor} from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { isStaffOrHigher } from '/imports/api/server/utilities';

import tblBuilderCollections from '/imports/collections';


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
    adminToggleQAd: function(_id, model, modifier) {
        var collection, obj, qad;
        if (!isStaffOrHigher(this.userId)) {
            throw new Meteor.Error(403, 'Nice try wise-guy.');
        }
        collection = tblBuilderCollections.evidenceLookup[model].collection;
        if (collection) {
            obj = collection.findOne(_id);
            if (obj) {
                qad = obj.isQA;
                if (qad) {
                    modifier.$set = _.extend(modifier.$set, {
                        isQA: false,
                        timestampQA: null,
                        user_id_QA: null,
                    });
                } else {
                    modifier.$set = _.extend(modifier.$set, {
                        isQA: true,
                        timestampQA: new Date(),
                        user_id_QA: this.userId,
                    });
                }
                collection.update(_id, modifier);
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
});
