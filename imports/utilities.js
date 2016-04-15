import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';

import _ from 'underscore';


let getHTMLTitleBase = function() {
        var context = Meteor.settings['public'].context.toUpperCase();
        return context + ' Table Builder';
    },
    getHTMLTitleTbl = function() {
        var base = getHTMLTitleBase(),
            tbl = Session.get('Tbl');
        return tbl.name + ' | ' + tbl.tblType + ' | ' + base;
    },
    getPercentOrText = function(txt) {
        if (txt == null) return '';
        if (_.isFinite(txt)) txt = txt.toString();
        if (txt.search && txt.search(/(\d)+/) >= 0) txt += '%';
        return txt;
    },
    typeaheadSelectListGetLIs = function($ul) {
        return _.map(
            $ul.find('li'),
            function(li){return li.getAttribute('data-value');});
    },
    getValue = function(inp) {
        var val = undefined,
            $el,
            results = [];

        // special case for our multi-select list object
        if ($(inp).hasClass('multiSelectList')) {
            $el = $(inp).parent().next();
            return typeaheadSelectListGetLIs($el);
        }

        // special case for single-reference selector
        if ($(inp).hasClass('referenceSingleSelect')) {
            $el = $(inp).parent().next();
            return $el.find('p').data('id');
        }

        // special case for multiple-reference selector
        if ($(inp).hasClass('referenceMultiSelect')) {
            $el = $(inp).parent().next();
            $el.find('li').each(function(i, li){
                results.push($(li).data('id'));
            });
            return results;
        }

        // otherwise it's a standard html input
        val = undefined;
        switch (inp.type) {
        case 'text':
        case 'hidden':
        case 'textarea':
        case 'url':
            val = inp.value.trim();
            if (val.length === 0) val = null;
            break;
        case 'number':
            val = parseFloat(inp.value, 10);
            if (isNaN(val)) val = null;
            break;
        case 'checkbox':
            val = inp.checked;
            break;
        case 'select-one':
            val = $(inp).find('option:selected').val();
            break;
        default:
            console.log('input not recognized');
        }
        return val;
    },
    newValues = function(form) {
        var obj = {}, key;
        $(form).find('select,input,textarea').each(function(i, inp){
            key = inp.name;
            if (key.length > 0) obj[key] = getValue(inp);
        });
        return obj;
    },
    capitalizeFirst = function(){

    };

export { getHTMLTitleBase };
export { getHTMLTitleTbl };
export { getPercentOrText };
export { capitalizeFirst };
export { typeaheadSelectListGetLIs };
export { getValue };
export { newValues };
