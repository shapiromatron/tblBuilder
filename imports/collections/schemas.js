import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import _ from 'underscore';

let baseSchema = {
        created: {
            type: Date,
            optional: true,
            denyUpdate: true,
        },
        lastUpdated: {
            type: Date,
            optional: true,
            denyUpdate: true,
        },
        user_id: {
            type: SimpleSchema.RegEx.Id,
            denyUpdate: true,
            optional: true,
        },
    },
    tableSchema = {
        tbl_id: {
            type: SimpleSchema.RegEx.Id,
        },
        isHidden: {
            type: Boolean,
            optional: true,
        },
        sortIdx: {
            type: Number,
            decimal: true,
            optional: true,
        },
        isQA: {
            type: Boolean,
            defaultValue: false,
            optional: true,
        },
        timestampQA: {
            type: Date,
            optional: true,
        },
        user_id_QA: {
            type: SimpleSchema.RegEx.Id,
            optional: true,
        },
    },
    attachBaseSchema = function(Coll, extension){
        let schema = _.extend(extension, baseSchema);
        Coll.attachSchema(new SimpleSchema(schema));
    },
    attachTableSchema = function(Coll, extension){
        let schema = _.extend(extension, tableSchema, baseSchema);
        Coll.attachSchema(new SimpleSchema(schema));
    };

export { attachBaseSchema };
export { attachTableSchema };
