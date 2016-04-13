import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';

import _ from 'underscore';
import d3 from 'd3';


let getHTMLTitleBase = function() {
        var context = Meteor.settings['public'].context.toUpperCase();
        return context + ' Table Builder';
    },
    getNextSortIdx = function(currentIdx, Collection){
        var nextIdx = _.chain(Collection.find().fetch())
                    .pluck('sortIdx')
                    .filter(function(d){return d > currentIdx;})
                    .sort()
                    .first()
                    .value() || (currentIdx + 2);

        return d3.mean([currentIdx, nextIdx]);
    };

export { getHTMLTitleBase };

export { getNextSortIdx };

export const getHTMLTitleTbl = function() {
    var base = getHTMLTitleBase(),
        tbl = Session.get('Tbl');
    return tbl.name + ' | ' + tbl.tblType + ' | ' + base;
};

export const capitalizeFirst = function(str) {
    if ((str != null) && str.length > 0) {
        str = str[0].toUpperCase() + str.slice(1);
    }
    return str;
};


export const cloneObject = function(oldObj, Collection, NestedCollection) {
    var newObj, new_parent_id, ref, newNest;

    // clone object
    newObj = _.extend({}, oldObj);
    delete newObj._id;

    // increment sort-index
    if (newObj.sortIdx) newObj.sortIdx = getNextSortIdx(newObj.sortIdx, Collection);

    // insert, getting new parent-ID
    new_parent_id = Collection.insert(newObj);

    // clone nested collection, if exists
    if (NestedCollection != null) {
        ref = NestedCollection.find({parent_id: oldObj._id}).fetch();
        _.each(ref, function(oldNest){
            newNest = _.extend({}, oldNest);
            delete newNest._id;
            newNest.parent_id = new_parent_id;
            return NestedCollection.insert(newNest);
        });
    }
};

export const getPercentOrText = function(txt) {
    if (txt == null) return '';
    if (_.isFinite(txt)) txt = txt.toString();
    if (txt.search && txt.search(/(\d)+/) >= 0) txt += '%';
    return txt;
};
