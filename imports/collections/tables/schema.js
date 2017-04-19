import _ from 'underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import {
    typeOptions,
    roleOptions,
    statusOptions,
} from './constants';


export default {
    monographAgent: {
        label: 'Monograph Agent Name',
        type: String,
        min: 1,
    },
    volumeNumber: {
        label: 'Volume Number',
        type: Number,
        decimal: false,
    },
    name: {
        label: 'Table Name',
        type: String,
        min: 1,
    },
    tblType: {
        label: 'Table Type',
        type: String,
        allowedValues: typeOptions,
        denyUpdate: true,
    },
    'user_roles.$.user_id': {
        type: SimpleSchema.RegEx.Id,
    },
    'user_roles.$.role': {
        type: String,
        allowedValues: roleOptions,
    },
    sortIdx: {
        type: Number,
        decimal: true,
        optional: true,
    },
    status: {
        label: 'Table Status',
        type: String,
        allowedValues: _.keys(statusOptions),
        popoverText: 'Table status',
    },
    activeTable: {
        type: Boolean,
        defaultValue: true,
    },
};
