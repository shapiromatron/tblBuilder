Meteor.methods({
    adminUserEditProfile: function(_id, obj) {
        if (!serverShared.isStaffOrHigher(this.userId)) {
            throw new Meteor.Error(403, 'Nice try wise-guy.');
        }
        return Meteor.users.update(_id, {$set: obj});
    },
    adminUserCreateProfile: function(obj) {
        var _id, opts;
        if (!serverShared.isStaffOrHigher(this.userId)) {
            throw new Meteor.Error(403, 'Nice try wise-guy.');
        }
        obj.emails[0].address = obj.emails[0].address.trim();
        opts = {email: obj.emails[0].address};
        _id = Accounts.createUser(opts);
        Meteor.users.update(_id, {$set: obj});
        return Accounts.sendEnrollmentEmail(_id);
    },
    adminUserResetPassword: function(_id) {
        if (!serverShared.isStaffOrHigher(this.userId)) {
            throw new Meteor.Error(403, 'Nice try wise-guy.');
        }
        return Accounts.sendResetPasswordEmail(_id);
    },
    adminToggleQAd: function(_id, model) {
        var collection, obj, qad, timestamp, updates;
        if (!serverShared.isStaffOrHigher(this.userId)) {
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
        if (!serverShared.isStaffOrHigher(this.userId)) {
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
