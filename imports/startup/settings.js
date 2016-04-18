import { Match } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import _ from 'underscore';

Accounts.config({forbidClientAccountCreation: true});

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

SimpleSchema.messages({
    minCount: '[label] must specify at least [minCount] value(s) (press &lt;enter&gt; after typing to add to list)',
    numOrNR: '[label] must either be numeric or the string "NR"',
});
