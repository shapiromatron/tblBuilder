/* Startup on both client and server */

import { Accounts } from 'meteor/accounts-base';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import '/imports/api/shared';


Accounts.config({forbidClientAccountCreation: true});

SimpleSchema.messages({
    minCount: '[label] must specify at least [minCount] value(s) (press &lt;enter&gt; after typing to add to list)',
    numOrNR: '[label] must either be numeric or the string "NR"',
});
