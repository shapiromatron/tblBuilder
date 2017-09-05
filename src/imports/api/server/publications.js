import {Meteor} from 'meteor/meteor';
import { check, Match } from 'meteor/check';

import _ from 'underscore';

import { isStaffOrHigher } from './utilities';

import { isNtp } from '/imports/utilities';

import Tables from '/imports/collections/tables';
import Reference from '/imports/collections/reference';
import ExposureEvidence from '/imports/collections/exposure';
import AnimalEvidence from '/imports/collections/animalEvidence';
import AnimalEndpointEvidence from '/imports/collections/animalResult';
import NtpAnimalEvidence from '/imports/collections/ntpAnimalEvidence';
import NtpAnimalEndpointEvidence from '/imports/collections/ntpAnimalEndpointEvidence';
import EpiDescriptive from '/imports/collections/epiDescriptive';
import EpiResult from '/imports/collections/epiResult';
import NtpEpiDescriptive from '/imports/collections/ntpEpiDescriptive';
import NtpEpiConfounder from '/imports/collections/ntpEpiConfounder';
import NtpEpiResult from '/imports/collections/ntpEpiResult';
import GenotoxEvidence from '/imports/collections/genotox';
import MechanisticEvidence from '/imports/collections/mechanistic';
import GenotoxHumanExposureEvidence from '/imports/collections/genotoxHumanExposure';
import GenotoxHumanExposureResult from '/imports/collections/genotoxHumanExposureResult';


let userCanView = function(tbl, userId) {
        // User-can view permissions check on a table-level basis.
        if (isStaffOrHigher(userId)) return true;

        if (tbl && userId) {
            var valid_ids = _.pluck(tbl.user_roles, 'user_id');
            return (userId === tbl.user_id) || (valid_ids.indexOf(userId) >= 0);
        }
        return false;
    }, getReferenceIds = function(Coll, tbl_id){
        // return unique ids for references
        let ref_ids1 = _.pluck(Coll
                .find({tbl_id}, {fields: {referenceID: 1}})
                .fetch(), 'referenceID'),
            ref_ids2 = _.chain(Coll.find({tbl_id}, {fields: {additionalReferences: 1}}).fetch())
              .pluck('additionalReferences')
              .flatten()
              .value();

        return _.chain([ref_ids1, ref_ids2])
           .flatten()
           .uniq()
           .value();
    };

Meteor.publish('tables', function() {
    var options = {sort: [['volumeNumber', 'desc'], ['timestamp', 'desc']]};
    if (this.userId != null) {
        if (isStaffOrHigher(this.userId)) {
            return Tables.find({}, options);
        } else {
            return Tables.find({
                $or: [
                    {user_id: this.userId},
                    {user_roles: {$elemMatch: {user_id: this.userId}}},
                ],
            }, options);
        }
    }
    return this.ready();
});

Meteor.publish('epiDescriptive', function(tbl_id) {
    this.autorun(function () {
        check(tbl_id, String);
        var tbl = Tables.findOne({_id: tbl_id}),
            ref_ids;
        if (userCanView(tbl, this.userId)) {
            ref_ids = getReferenceIds(EpiDescriptive, tbl_id);
            return [
                EpiDescriptive.find({tbl_id: tbl_id}),
                EpiResult.find({tbl_id: tbl_id}),
                Reference.find({_id: {$in: ref_ids}}),
            ];
        }
        return this.ready();
    });
});

Meteor.publish('ntpEpiDescriptive', function(tbl_id) {
    this.autorun(function () {
        check(tbl_id, String);
        var tbl = Tables.findOne({_id: tbl_id}),
            ref_ids;
        if (userCanView(tbl, this.userId)) {
            ref_ids = getReferenceIds(NtpEpiDescriptive, tbl_id);
            return [
                NtpEpiDescriptive.find({tbl_id}),
                NtpEpiConfounder.find({tbl_id}),
                NtpEpiResult.find({tbl_id}),
                Reference.find({_id: {$in: ref_ids}}),
            ];
        }
        return this.ready();
    });
});

Meteor.publish('ntpEpiConfounder', function(tbl_id) {
    this.autorun(function () {
        check(tbl_id, String);
        var tbl = Tables.findOne({_id: tbl_id}),
            ref_ids;
        if (userCanView(tbl, this.userId)) {
            ref_ids = getReferenceIds(NtpEpiDescriptive, tbl_id);
            return [
                NtpEpiDescriptive.find({tbl_id}),
                NtpEpiConfounder.find({tbl_id}),
                Reference.find({_id: {$in: ref_ids}}),
            ];
        }
        return this.ready();
    });
});

Meteor.publish('epiCollective', function(volumeNumber, monographAgent) {

    let isNtpTable = isNtp(),
        tblType = (isNtpTable)? 'NTP Epidemiology Evidence': 'Epidemiology Evidence',
        ResultCollection = (isNtpTable)? NtpEpiResult: EpiResult,
        DescriptiveCollection = (isNtpTable)? NtpEpiDescriptive: EpiDescriptive,
        tbls = Tables.find({
            tblType,
            volumeNumber: parseInt(volumeNumber, 10),
            monographAgent: monographAgent,
            activeTable: true,
        }).fetch(),
        tbl_ids, ref_ids;

    tbls = _.filter(tbls, function(tbl){
        return userCanView(tbl, this.userId);
    }, this);

    if (tbls.length > 0) {
        tbl_ids = _.pluck(tbls, '_id');
        ref_ids = _.pluck(DescriptiveCollection
            .find({tbl_id: {$in: tbl_ids}}, {fields: {referenceID: 1}})
            .fetch(), 'referenceID');
        return [
            DescriptiveCollection.find({tbl_id: {$in: tbl_ids}}),
            ResultCollection.find({tbl_id: {$in: tbl_ids}}),
            Reference.find({_id: {$in: ref_ids}}),
        ];
    }
    return this.ready();
});

Meteor.publish('mechanisticEvidence', function(tbl_id) {
    this.autorun(function () {
        check(tbl_id, String);
        var tbl = Tables.findOne({_id: tbl_id}),
            ref_ids;
        if (userCanView(tbl, this.userId)) {
            ref_ids = getReferenceIds(MechanisticEvidence, tbl_id);
            return [
                MechanisticEvidence.find({tbl_id: tbl_id}),
                Reference.find({_id: {$in: ref_ids}}),
            ];
        }
        return this.ready();
    });
});

Meteor.publish('exposureEvidence', function(tbl_id) {
    this.autorun(function () {
        check(tbl_id, String);
        var tbl = Tables.findOne({_id: tbl_id}),
            ref_ids;
        if (userCanView(tbl, this.userId)) {
            ref_ids = getReferenceIds(ExposureEvidence, tbl_id);
            return [
                ExposureEvidence.find({tbl_id: tbl_id}),
                Reference.find({_id: {$in: ref_ids}}),
            ];
        }
        return this.ready();
    });
});

Meteor.publish('animalEvidence', function(tbl_id) {
    this.autorun(function () {
        check(tbl_id, String);
        var tbl = Tables.findOne({_id: tbl_id}),
            ref_ids;
        if (userCanView(tbl, this.userId)) {
            ref_ids = getReferenceIds(AnimalEvidence, tbl_id);
            return [
                AnimalEvidence.find({tbl_id: tbl_id}),
                AnimalEndpointEvidence.find({tbl_id: tbl_id}),
                Reference.find({_id: {$in: ref_ids}}),
            ];
        }
        return this.ready();
    });
});

Meteor.publish('ntpAnimalEvidence', function(tbl_id) {
    this.autorun(function () {
        check(tbl_id, String);
        var tbl = Tables.findOne({_id: tbl_id}), ref_ids;
        if (userCanView(tbl, this.userId)) {
            ref_ids = getReferenceIds(NtpAnimalEvidence, tbl_id);
            return [
                NtpAnimalEvidence.find({tbl_id}),
                NtpAnimalEndpointEvidence.find({tbl_id}),
                Reference.find({_id: {$in: ref_ids}}),
            ];
        }
        return this.ready();
    });
});

Meteor.publish('genotoxEvidence', function(tbl_id) {
    this.autorun(function () {
        check(tbl_id, String);
        var tbl = Tables.findOne({_id: tbl_id}),
            ref_ids;
        if (userCanView(tbl, this.userId)) {
            ref_ids = getReferenceIds(GenotoxEvidence, tbl_id);
            return [
                GenotoxEvidence.find({tbl_id: tbl_id}),
                Reference.find({_id: {$in: ref_ids}}),
            ];
        }
        return this.ready();
    });
});

Meteor.publish('genotoxHumanExposureEvidence', function(tbl_id) {
    this.autorun(function () {
        check(tbl_id, String);
        var tbl = Tables.findOne({_id: tbl_id}),
            ref_ids;
        if (userCanView(tbl, this.userId)) {
            ref_ids = getReferenceIds(GenotoxHumanExposureEvidence, tbl_id);
            return [
                GenotoxHumanExposureEvidence.find({tbl_id}),
                GenotoxHumanExposureResult.find({tbl_id}),
                Reference.find({_id: {$in: ref_ids}}),
            ];
        }
        return this.ready();
    });
});

Meteor.publish('tblUsers', function(tbl_id) {
    var ids = [], tbl;
    if (!Match.test(tbl_id, String)) return;
    tbl = Tables.findOne(tbl_id);
    if (tbl && userCanView(tbl, this.userId)) {
        ids = _.pluck(tbl.user_roles, 'user_id');
    }
    return Meteor.users.find({_id: {$in: ids}},
        {fields: {_id: 1, emails: 1, profile: 1}});
});

Meteor.publish('adminUsers', function() {
    if (isStaffOrHigher(this.userId)) {
        return Meteor.users.find({},
            {fields: {_id: 1, emails: 1, profile: 1, roles: 1, createdAt: 1}});
    } else {
        return this.ready();
    }
});

Meteor.publish('monographReference', function(monographAgent) {
    check(monographAgent, String);
    return Reference.find({monographAgent: {$in: [monographAgent]}});
});
