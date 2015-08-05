tblBuilderSchema = {
    attachSchema: function(Coll, spec){
        Coll.attachSchema(new SimpleSchema(spec));
    },
    base: {
        timestamp: {
            type: Date,
            optional: true,
            denyUpdate: true
        },
        user_id: {
            type: SimpleSchema.RegEx.Id,
            denyUpdate: true,
            optional: true
        }
    },
    table: {
        tbl_id: {
            type: SimpleSchema.RegEx.Id
        },
        isHidden: {
            type: Boolean,
            optional: true
        },
        sortIdx: {
            type: Number,
            decimal: true,
            optional: true
        },
        isQA: {
            type: Boolean,
            defaultValue: false,
            optional: true
        },
        timestampQA: {
            type: Date,
            optional: true
        },
        user_id_QA: {
            type: SimpleSchema.RegEx.Id,
            optional: true
        }
    }
};
