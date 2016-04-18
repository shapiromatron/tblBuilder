import _ from 'underscore';

export default {
    sortByReference: function(objs, ascending){
        objs = _.chain(objs)
                .map(function(d){
                    d.getReference();
                    d._refsort = d.reference.getSortString();
                    return d;
                })
                .sortBy('_refsort')
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
                .sortBy('_sortOrder')
                .value();
        if (!ascending) objs.reverse();
        return objs;
    },
};
