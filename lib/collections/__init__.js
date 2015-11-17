SimpleSchema.extendOptions({
    popoverText: Match.Optional(String),
    forceRequiredSymbol: Match.Optional(Boolean),
    typeaheadMethod: Match.Optional(String),
    placeholderText: Match.Optional(String),
    textAreaRows: Match.Optional(Match.Integer),
});


_.extend(String.prototype, {
    printf: function(){
        // http://stackoverflow.com/questions/610406/
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number){
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    },
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


libShared = {
    sortByReference: function(objs, ascending){
        objs = _.chain(objs)
                .map(function(d){
                    d.getReference();
                    d._refsort = d.reference.getSortString();
                    return d;
                })
                .sortBy("_refsort")
                .value();
        if (!ascending) objs.reverse();
        return objs;
    },
    sortByTextField: function(fieldName, objs, ascending){
        objs = _.chain(objs)
                .sortBy(fieldName)
                .value();
        if (!ascending) objs.reverse();
        return objs;
    },
    sortByFieldOrder: function(arr, fieldName, objs, ascending){
        objs = _.chain(objs)
                .map(function(d){
                    d._sortOrder = arr.indexOf(d[fieldName]);
                    return d;
                })
                .sortBy("_sortOrder")
                .value();
        if (!ascending) objs.reverse();
        return objs;
    },
};
