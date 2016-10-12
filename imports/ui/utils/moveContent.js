import {Meteor} from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import _ from 'underscore';

import Tables from '/imports/collections/tables';
import Reference from '/imports/collections/reference';
import tblBuilderCollections from '/imports/collections';

import {
    userCanEdit,
} from '/imports/api/client/utilities';


Template.moveModal.helpers({
    getCurrentTable: function() {
        var d = Session.get('Tbl');
        return `${d.volumeNumber} ${d.monographAgent}: ${d.name}`;
    },
    getOptions: function() {
        var tbls = Tables.find({tblType: Session.get('Tbl').tblType}).fetch(),
            thisTblId = Session.get('Tbl')._id;
        return _.chain(tbls)
                .filter(userCanEdit)
                .filter(function(d){return d._id !== thisTblId;})
                .sortBy(function(d){return d.sortIdx;})
                .sortBy(function(d){return d.monographAgent;})
                .reverse()
                .sortBy(function(d){return d.volumeNumber;})
                .reverse()
                .map(function(d) {
                    return `<option value='${d._id}'>${d.volumeNumber} ${d.monographAgent}: ${d.name}</option>`;
                })
                .value()
                .join('');
    },
});
Template.moveModal.events({
    'click #move-content': function(evt, tmpl) {
        var content_id = this.content._id,
            tbl_id = tmpl.$('select[name="moveTblTo"]').val(),
            newMonographAgent = Tables.findOne(tbl_id).monographAgent,
            ET = tblBuilderCollections.evidenceLookup[Session.get('evidenceType')],
            nesteds;

        Meteor.call('getMaximumTableSortIndex', ET.collection_name, tbl_id, (err, resp)=>{
            let sortIdx = resp;

            // ensure reference is associated with monographAgent
            if (this.content.referenceID){
                Reference
                    .findOne(this.content.referenceID)
                    .addMonographAgent(newMonographAgent);
            }

            // update reference
            ET.collection.update(
                {_id: content_id},
                {$set: {tbl_id, sortIdx: sortIdx}}
            );

            // move nested collections
            if (ET.nested_collection != null) {
                nesteds = ET.nested_collection.find({parent_id: content_id}).fetch();
                nesteds.forEach(function(nested){
                    ET.nested_collection.update(
                        {_id: nested._id},
                        {$set: {tbl_id}});
                });
            }
        });



        tmpl.$(tmpl.firstNode).modal('hide');
    },
});
Template.moveModal.onRendered(function() {
    this.$('#moveModal').modal('show');
});
