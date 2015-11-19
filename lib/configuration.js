Accounts.config({forbidClientAccountCreation: true});

browserWhitelist = ["Chrome", "Firefox", "Mozilla"];

SimpleSchema.messages({
    minCount: "[label] must specify at least [minCount] value(s) (press &lt;enter&gt; after typing to add to list)",
    numOrNR: '[label] must either be numeric or the string "NR"',
});
