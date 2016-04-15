import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import { attachBaseSchema } from '../schemas';

import schema_extension from './schema';
import {
    typeOptions,
} from './constants';


let instanceMethods = {
        addMonographAgent: function(monographAgent){
            if (_.contains(this.monographAgent, monographAgent)) return;
            this.monographAgent.push(monographAgent);
            var vals = {monographAgent: this.monographAgent};
            Reference.update(this._id, {$set: vals});
        },
        getSortString: function(){
            var yr = '0000',
                nums = this.name.match(/\d{4}/g);
            if (nums) yr = nums.pop();
            return `${yr}_${this.name}`;
        },
    },
    classMethods = {
        typeOptions,
        tabular: function(monographAgent){
            var data, refs,
                header = [
                    '_id', 'Short Citation', 'Full Citation',
                    'Reference Type', 'Pubmed ID', 'Other URL',
                    'PDF link',
                ];

            refs = Reference.find(
                {'monographAgent': {$in: [monographAgent]}},
                {sort: [['name', 1]]}).fetch();
            data = _.map(refs, function(v) {
                return [
                    v._id, v.name, v.fullCitation,
                    v.referenceType, v.pubmedID, v.otherURL,
                    v.pdfURL];
            });
            data.unshift(header);
            return data;
        },
        checkForDuplicate: function(doc){
            // try to get matching reference, or return undefined if not found
            let ref;
            if (doc.pubmedID === null) {
                ref = Reference.findOne({fullCitation: doc.fullCitation});
            } else {
                ref = Reference.findOne({pubmedID: doc.pubmedID});
            }
            return ref;
        },
    },
    Reference = new Meteor.Collection('reference', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(Reference, classMethods);
attachBaseSchema(Reference, schema_extension);

export default Reference;
