singleFieldTextSearch = (Collection, field, qrystr) ->
    # Perform a search of a single field, and return unique values.
    check(qrystr, String)
    query = {}
    query[field] = {$regex: new RegExp(qrystr, "i")}
    options = {fields: {}, limit: 1000, sort: []}
    options.fields[field] = 1
    options.sort.push(field)
    queryset = Collection.find(query, options).fetch()
    values = _.pluck(queryset, field)
    return _.uniq(values, true)


Meteor.methods

    #admin-only methods
    adminUserEditProfile: (_id, obj) ->
        unless share.isStaffOrHigher(this.userId)
            throw new Meteor.Error(403, "Nice try wise-guy.")

        Meteor.users.update(_id, {$set: obj})

    adminUserCreateProfile: (obj) ->
        unless share.isStaffOrHigher(this.userId)
            throw new Meteor.Error(403, "Nice try wise-guy.")

        opts = {email: obj.emails[0].address}
        _id = Accounts.createUser(opts)
        Meteor.users.update(_id, {$set: obj})
        Accounts.sendEnrollmentEmail(_id)

    adminUserResetPassword: (_id) ->
        unless share.isStaffOrHigher(this.userId)
            throw new Meteor.Error(403, "Nice try wise-guy.")

        # This will work even if a user has not initially created
        # a password
        Accounts.sendResetPasswordEmail(_id)

    adminToggleQAd: (_id, model) ->
        unless share.isStaffOrHigher(this.userId)
            throw new Meteor.Error(403, "Nice try wise-guy.")

        collection = switch
            when model is "epiDescriptive" then EpiDescriptive
            when model is "epiResult" then EpiResult
            when model is "mechanisticEvidence" then MechanisticEvidence
            when model is "exposureEvidence" then ExposureEvidence
            when model is "animalEvidence" then AnimalEvidence
            when model is "animalEndpointEvidence" then AnimalEndpointEvidence
            when model is "genotoxEvidence" then GenotoxEvidence
            when model is "mechQuantEvidence" then MechQuantEvidence
            else undefined

        if collection
            obj = collection.findOne(_id)

            if obj
                qad = obj.isQA
                if qad
                    updates = {isQA: false, timestampQA: null, user_id_QA: null}
                else
                    timestamp = new Date()
                    updates = {isQA: true, timestampQA: timestamp, user_id_QA: this.userId}
                collection.update(_id, {$set: updates})
                return {success: true, QAd: not qad}
        return {success: false}

    # users
    searchUsers: (str) ->
        check(str, String)
        querystr = new RegExp(str, "i")  # case insensitive
        query = {$or: [{"emails": {$elemMatch: {"address": {$regex: querystr}}}},
                       {"profile.fullName": {$regex: querystr}},
                       {"profile.affiliation": {$regex: querystr}}]}
        Meteor.users.find(query, {fields: {_id: 1, emails: 1, profile: 1}, limit: 20}).fetch()

    # references
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

    # epi evidence auto-complete
    searchOrganSite: (query) ->
        return singleFieldTextSearch(EpiResult, "organSite", query)

    searchEffectUnits: (query) ->
        return singleFieldTextSearch(EpiResult, "effectUnits", query)

    searchEffectMeasure: (query) ->
        return singleFieldTextSearch(EpiResult, "effectMeasure", query)

    searchMonographAgent: (query) ->
        return singleFieldTextSearch(Tables, "monographAgent", query)

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

    # exposure evidence auto-complete
    searchCountries: (query) ->
        return singleFieldTextSearch(ExposureEvidence, "country", query)

    searchAgents: (query) ->
        return singleFieldTextSearch(ExposureEvidence, "agent", query)

    searchSamplingMatrices: (query) ->
        return singleFieldTextSearch(ExposureEvidence, "samplingMatrix", query)

    searchUnits: (query) ->
        vals = singleFieldTextSearch(ExposureEvidence, "units", query)

        # extra check for micro symbol
        if query[0] is "u"
            extra = singleFieldTextSearch(ExposureEvidence, "units", query.replace("u", "μ"))
            vals = _.union(extra, vals)

        # extra check for pico symbol
        if query[0] is "p"
            extra = singleFieldTextSearch(ExposureEvidence, "units", query.replace("p", "ρ"))
            vals = _.union(extra, vals)

        return vals

    # genotox evidence auto-complete
    searchGenotoxAgents: (query) ->
        return singleFieldTextSearch(GenotoxEvidence, "agent", query)

    searchGenotoxTestSystem: (query) ->
        return singleFieldTextSearch(GenotoxEvidence, "testSystem", query)

    searchSpeciesNonMamm: (query) ->
        return singleFieldTextSearch(GenotoxEvidence, "speciesNonMamm", query)

    searchStrainNonMamm: (query) ->
        return singleFieldTextSearch(GenotoxEvidence, "strainNonMamm", query)

    searchSpeciesMamm: (query) ->
        return singleFieldTextSearch(GenotoxEvidence, "speciesMamm", query)

    searchGenotoxSpecies: (query) ->
        return singleFieldTextSearch(GenotoxEvidence, "species", query)

    searchGenotoxStrain: (query) ->
        return singleFieldTextSearch(GenotoxEvidence, "strain", query)

    searchTissueCellLine: (query) ->
        return singleFieldTextSearch(GenotoxEvidence, "tissueCellLine", query)

    searchGenotoxTissueAnimal: (query) ->
        return singleFieldTextSearch(GenotoxEvidence, "tissueAnimal", query)

    searchGenotoxTissueHuman: (query) ->
        return singleFieldTextSearch(GenotoxEvidence, "tissueHuman", query)

    searchGenotoxCellType: (query) ->
        return singleFieldTextSearch(GenotoxEvidence, "cellType", query)

    searchGenotoxDosingRoute: (query) ->
        return singleFieldTextSearch(GenotoxEvidence, "dosingRoute", query)

    searchGenotoxDosingUnits: (query) ->
        vals = singleFieldTextSearch(GenotoxEvidence, "units", query)

        # extra check for micro symbol
        if query[0] is "u"
            extra = singleFieldTextSearch(GenotoxEvidence, "units", query.replace("u", "μ"))
            vals = _.union(extra, vals)

        # extra check for pico symbol
        if query[0] is "p"
            extra = singleFieldTextSearch(GenotoxEvidence, "units", query.replace("p", "ρ"))
            vals = _.union(extra, vals)

        return vals
