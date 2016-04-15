import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import { attachTableSchema } from '../schemas';

import schema_extension from './schema';
import {
    evidenceSections,
    evidenceCategories,
    evidenceOptions,
} from './constants';


let instanceMethods = {
    },
    classMethods = {
        evidenceSections,
        evidenceCategories,
        evidenceOptions,
        tabular: function(tbl_id){
            var data = [],
                header = [
                    '_id',
                    'section',
                    'parent',
                    'subheading',
                    'text',
                    'references',
                    'humanInVivo',
                    'humanInVitro',
                    'animalInVivo',
                    'animalInVitro',
                ],
                references, children, sectionObj,
                getRow = function(v) {
                    references = _.pluck(Reference.find(
                            {_id: {$in: v.references}},
                            {fields: {name: 1}}).fetch(), 'name');
                    return [
                        v._id,
                        v.section,
                        v.parent,
                        v.subheading || '',
                        v.text || '',
                        references.join('; '),
                        v.humanInVivo,
                        v.humanInVitro,
                        v.animalInVivo,
                        v.animalInVitro,
                    ];
                },
                addEvidence = function(evidence) {
                    data.push(getRow(evidence));
                    children = MechanisticEvidence.find(
                            {parent: evidence._id},
                            {sort: {sortIdx: 1}});
                    children.forEach(function(child){addEvidence(child);});
                };

            data.push(header);
            MechanisticEvidence.evidenceSections.forEach(function(section){
                sectionObj = MechanisticEvidence.find(
                        {tbl_id: tbl_id, section: section.section},
                        {sort: {sortIdx: 1}});
                sectionObj.forEach(function(e) {addEvidence(e);});
            });
            return data;
        },
        wordReportFormats: [
            {
                'type': 'MechanisticEvidenceHtmlTables',
                'fn': 'mechanistic',
                'text': 'Download Word',
            },
        ],
        wordContext: function(tbl_id){
            var formatEvidence = function(obj) {
                    var refs = Reference.find({_id: {$in: obj.references}}).fetch();
                    obj.references = _.pluck(refs, 'name').join(', ');
                    if (obj.references !== '') obj.references = '(' + obj.references + ')';
                    obj.text = obj.text || '';
                    return obj.subheading = obj.subheading || '';
                },
                getChildren = function(parent) {
                    var children = MechanisticEvidence.find(
                                {parent: parent._id},
                                {sort: {sortIdx: 1}}).fetch();
                    parent.children = children;
                    return children.map(function(child){
                        formatEvidence(child);
                        return getChildren(child);
                    });
                },
                data = {'table': Tables.findOne({_id: tbl_id})};

            data.sections = MechanisticEvidence.evidenceSections.map(function(section){
                var children = MechanisticEvidence.find(
                    {tbl_id: tbl_id,section: section.section},
                    {sort: {sortIdx: 1}}).fetch();
                children.forEach(function(child){
                    child.hasSubheading = (child.subheading != null) && child.subheading !== '';
                    formatEvidence(child);
                    getChildren(child);
                });
                return {'description': section.sectionDesc, 'children': children};
            });
            return data;
        },
    },
    MechanisticEvidence = new Meteor.Collection('mechanisticEvidence', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });

_.extend(MechanisticEvidence, classMethods);
attachTableSchema(MechanisticEvidence, schema_extension);

export default MechanisticEvidence;
