singleFieldTextSearch = (inputs) ->
    # Perform a search of a single field, and return unique values.
    field = inputs['field']
    query = {}
    query[field] = {$regex: new RegExp(inputs['query'], "i")}
    options = {fields: {}, limit: 1000, sort: []}
    options.fields[field] = 1
    options.sort.push(field)
    queryset = inputs['Collection'].find(query, options).fetch()
    values = _.pluck(queryset, field)
    return _.uniq(values, true)


Meteor.methods

    adminUserEditProfile: (_id, obj) ->
        if share.isStaffOrHigher(this.userId)
            Meteor.users.update(_id, {$set: obj})
        else
            throw new Meteor.Error(403, "Nice try wise-guy.")

    adminUserCreateProfile: (obj) ->
        if share.isStaffOrHigher(this.userId)
            opts = {email: obj.emails[0].address}
            _id = Accounts.createUser(opts)
            Meteor.users.update(_id, {$set: obj})
            Accounts.sendEnrollmentEmail(_id)
        else
            throw new Meteor.Error(403, "Nice try wise-guy.")

    adminUserResetPassword: (_id) ->
        if share.isStaffOrHigher(this.userId)
            # This will work even if a user has not initially created
            # a password
            Accounts.sendResetPasswordEmail(_id)
        else
            throw new Meteor.Error(403, "Nice try wise-guy.")

    searchUsers: (str) ->
        check(str, String)
        querystr = new RegExp(str, "i")  # case insensitive
        query = {$or: [{"emails": {$elemMatch: {"address": {$regex: querystr}}}},
                       {"profile.fullName": {$regex: querystr}},
                       {"profile.affiliation": {$regex: querystr}}]}
        Meteor.users.find(query, {fields: {_id: 1, emails: 1, profile: 1}, limit: 20}).fetch()

    searchOrganSite: (query) ->
        check(query, String)
        return singleFieldTextSearch
                    Collection: EpiResult,
                    field: "organSite",
                    query: query

    searchEffectUnits: (query) ->
        check(query, String)
        return singleFieldTextSearch
                    Collection: EpiResult,
                    field: "effectUnits",
                    query: query

    searchEffectMeasure: (query) ->
        check(query, String)
        return singleFieldTextSearch
                    Collection: EpiResult,
                    field: "effectMeasure",
                    query: query

    searchMonographAgent: (query) ->
        check(query, String)
        return singleFieldTextSearch
                    Collection: Tables,
                    field: "monographAgent",
                    query: query

    searchReference: (inputs) ->
        check(inputs, {qry: String, monographAgent: String})
        querystr = new RegExp(inputs.qry, "i")  # case insensitive
        query =
            $and: [
                name:
                    $regex: querystr,
                monographAgent:
                    $in: [ inputs.monographAgent ]
            ]

        options =
            limit: 50

        Reference.find(query, options).fetch()

    searchCovariates: (query) ->
        check(query, String)
        querystr = new RegExp(query, "i")  # case insensitive
        queryset = EpiResult.find({"covariates": { $in: [ querystr ] }},
                        {fields: {covariates: 1}, limit: 1000}).fetch()
        covariates = _.flatten(_.pluck(queryset, 'covariates'))
        covariates = _.filter(covariates, (v) -> v.match(querystr))
        return _.uniq(covariates, false)

    searchCoexposures: (query) ->
        check(query, String)
        querystr = new RegExp(query, "i")  # case insensitive
        queryset = EpiDescriptive.find({"coexposures": { $in: [ querystr ] }},
                        {fields: {coexposures: 1}, limit: 1000}).fetch()
        coexposures = _.flatten(_.pluck(queryset, 'coexposures'))
        coexposures = _.filter(coexposures, (v) -> v.match(querystr))
        return _.uniq(coexposures, false)
