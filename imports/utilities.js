import _ from 'underscore';


let getPercentOrText = function(txt) {
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
    capitalizeFirst = function(str){
        if ((str != null) && str.length > 0) {
            str = str[0].toUpperCase() + str.slice(1);
        }
        return str;
    },
    tabularizeHeader = function(schema, idName, omissions){
        /*
        Return a header of object based on schema.

        * @param {object} schema A simple-schema instance
        * @param {string} idName Name for id field
        * @param {string[]} omissions Simple-schema keys that should not be included

        The header consists of all fields in the schema which:

            1) include a label field in the schema
            2) schema key has an $ (indicates an array field)
            3) are not in the omissions array

        In addition, the _id field is listed as the first index in the header,
        using the idName specified.
        */
        let header = _.chain(schema)
            .pairs()
            .reject((d) => _.isUndefined(d[1].label))
            .reject((d) => d[0].indexOf('$')>=0)
            .reject((d) => _.contains(omissions, d[0]))
            .map((d) => d[1].label)
            .value();

        if(idName){
            header.unshift(idName);
        }

        return header;
    },
    tabularize = function(obj, schema, omissions, overrides){
        /*
        Return a row of data based on an object instance and schema.

        * @param {object} obj An object instance
        * @param {object} schema A simple-schema instance for this object
        * @param {string[]} omissions Simple-schema keys that should not be included
        * @param {object} overrides Override function for data presentation in tab

        */
        let data = _.chain(schema)
            .pairs()
            .reject((d) => _.isUndefined(d[1].label))
            .reject((d) => d[0].indexOf('$')>=0)
            .reject((d) => _.contains(omissions, d[0]))
            .map((d) => d[0])
            .map((k) => (overrides[k])? overrides[k](obj): obj[k])
            .value();

        if(obj._id){
            data.unshift(obj._id);
        }

        return data;
    };


export { getPercentOrText };
export { typeaheadSelectListGetLIs };
export { getValue };
export { newValues };
export { capitalizeFirst };
export { tabularizeHeader };
export { tabularize };
