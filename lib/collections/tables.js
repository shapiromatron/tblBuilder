var instanceMethods = {
    getURL: function() {
        if (Meteor.isServer) return;
        var route = Tables.routePaths[this.tblType];
        if(route){
            return Router.path(route, {_id: this._id});
        } else {
            return Router.path('404');
        }
    },
    canEdit: function() {
        var currentUser = Meteor.user(),
            ids = [], id;

        if (currentUser) id = currentUser._id;
        if (id === undefined) return false;
        if (currentUser.roles.indexOf("superuser") >= 0) return true;

        ids = _.chain(this.user_roles)
                .filter(function(v){return v.role === "projectManagers";})
                .pluck("user_id")
                .value();

        return (id === this.user_id) || _.contains(ids, id);
    }
};
Tables = new Meteor.Collection('tables', {
    transform: function (doc) {
        return  _.extend(Object.create(instanceMethods), doc);
    }
});


// collection class methods/attributes
_.extend(Tables, {
    typeOptions: [
        "Exposure Evidence",
        "Epidemiology Evidence",
        "Animal Bioassay Evidence",
        "Genetic and Related Effects",
        "Mechanistic Evidence Summary",
    ],
    roleOptions: [
        "projectManagers",
        "teamMembers",
        "reviewers"
    ],
    routePaths: {
        "Mechanistic Evidence Summary": "mechanisticMain",
        "Epidemiology Evidence": "epiMain",
        "Exposure Evidence": "exposureMain",
        "Animal Bioassay Evidence": "animalMain",
        "Genetic and Related Effects": "genotoxMain",
    }
});


tblBuilderCollections.attachSchema(Tables, _.extend({
    monographAgent: {
        label: "Monograph Agent Name",
        type: String,
        min: 1
    },
    volumeNumber: {
        label: "Volume Number",
        type: Number,
        decimal: false
    },
    name: {
        label: "Table Name",
        type: String,
        min: 1
    },
    tblType: {
        label: "Table Type",
        type: String,
        allowedValues: Tables.typeOptions,
        denyUpdate: true
    },
    "user_roles.$.user_id": {
        type: SimpleSchema.RegEx.Id
    },
    "user_roles.$.role": {
        type: String,
        allowedValues: Tables.roleOptions
    },
    sortIdx: {
        type: Number,
        decimal: true,
        optional: true
    }
}, tblBuilderCollections.base));
