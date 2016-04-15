import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import {
    typeOptions,
} from './constants';


export default {
    name: {
        label: 'Reference Short Name',
        type: String,
        min: 1,
    },
    referenceType: {
        label: 'Reference Type',
        type: String,
        allowedValues: typeOptions,
        denyUpdate: true,
    },
    otherURL: {
        label: 'Other URL',
        type: String,
        regEx: [SimpleSchema.RegEx.Url],
        optional: true,
    },
    pubmedID: {
        label: 'PubMed ID',
        type: Number,
        optional: true,
        custom: function() {
            var needsPMID = this.field('referenceType').value === 'PubMed',
                isPositive = this.value > 0;
            if (needsPMID && !isPositive) return 'required';
        },
        denyUpdate: true,
    },
    fullCitation: {
        label: 'Full Citation Text',
        type: String,
        min: 1,
    },
    pdfURL: {
        label: 'PDF URL',
        type: String,
        regEx: [SimpleSchema.RegEx.Url],
        optional: true,
    },
    monographAgent: {
        type: [String],
        minCount: 1,
    },
};
