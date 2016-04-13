import { Match } from 'meteor/check';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import _ from 'underscore';


SimpleSchema.extendOptions({
    popoverText: Match.Optional(String),
    forceRequiredSymbol: Match.Optional(Boolean),
    typeaheadMethod: Match.Optional(String),
    placeholderText: Match.Optional(String),
    textAreaRows: Match.Optional(Match.Integer),
});


_.extend(String.prototype, {
    escapeRegex: function() {
        // http://stackoverflow.com/questions/3561493/
        return this.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    },
});


tblBuilderCollections = {
    attachSchema: function(Coll, spec){
        Coll.attachSchema(new SimpleSchema(spec));
    },
    base: {
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
    table: {
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
};
