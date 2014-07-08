XLSX = Meteor.require('xlsx')

type = do ->
    classToType = {}
    for name in "Boolean Number String Function Array Date RegExp Undefined Null".split(" ")
        classToType["[object " + name + "]"] = name.toLowerCase()

    (obj) ->
        strType = Object::toString.call(obj)
        classToType[strType] or "object"

excel_datenum = (v, date1904) ->
    if(date1904) then v+=1462
    epoch = Date.parse(v)
    (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000)

class Workbook
    SheetNames: []
    Sheets: {}

sheet_from_array_of_arrays = (data) ->
    ws = {}
    range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }}
    for R,i in data
        for C,j in data[i]
            if (range.s.r > i) then range.s.r = i
            if (range.s.c > j) then range.s.c = j
            if (range.e.r < i) then range.e.r = i
            if (range.e.c < j) then range.e.c = j
            cell = {v: data[i][j] };
            if cell.v is null then continue
            cell_ref = XLSX.utils.encode_cell({c:j, r:i})
            switch type(cell.v)
                when "number"
                    cell.t = 'n'
                when "boolean"
                    cell.t = 'b'
                when 'date'
                    cell.t = 'n'
                    cell.z = XLSX.SSF._table[14]
                    cell.v = excel_datenum(cell.v)
                else
                    cell.t = 's'

            ws[cell_ref] = cell
    if(range.s.c < 10000000) then ws['!ref'] = XLSX.utils.encode_range(range)
    return ws

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
    epiCohortExcelDownload: (tbl_id) ->

        getEpiCohortData = (tbl_id) ->
            cohorts = EpiCohort.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch()
            header = ['reference', 'location', 'followUpPeriod',
                      'numSubjects', 'numSubjectsDetails', 'covariates',
                      'comments', 'isHiddenCohort', 'organSite',
                      'exposureCategories', 'exposedCases', 'riskMid',
                      'riskLow', 'riskHigh', 'riskEstimated',
                      'isHiddenCohortExposure']
            data = [header]
            for v in cohorts
                row = [v.reference, v.location, v.followUpPeriod
                       v.numSubjects, v.numSubjectsText, v.covariates
                       v.comments, v.isHidden]
                rows = getEpiRiskEstimateData(v._id, row)
                data.push.apply(data, rows)
            return data

        getEpiRiskEstimateData = (parent_id, row_arr) ->
            exposures = EpiRiskEstimate.find({parent_id: parent_id}, {sort: {sortIdx: 1}}).fetch()
            rows = []
            for v in exposures
                new_row = row_arr.slice()  # shallow copy
                new_row.push(v.organSite, v.exposureCategories, v.exposedCases,
                             v.riskMid, v.riskLow, v.riskHigh,
                             v.riskEstimated, v.isHidden)
                rows.push(new_row)
            return rows

        data = getEpiCohortData(tbl_id)
        ws_name = "epiCohort"
        wb = new Workbook()
        ws = sheet_from_array_of_arrays(data)
        wb.SheetNames.push(ws_name)
        wb.Sheets[ws_name] = ws
        XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'})

    epiEvidenceDownload: (tbl_id) ->

        getDescriptiveData = ->
            vals = EpiDescriptive.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch()
            header = ["Descriptive ID", "Reference", "Study Design",
                      "Location", "Enrollment Dates", "Population Description",
                      "Population Size", "Population Cases", "Population Controls",
                      "Source Case Control", "Exposure Assessment Method", "Outcome Data Source",
                      "Response Rate", "Referent Group", "Exposure Level", "Analytical Method",
                      "Strengths", "Limitations", "Notes",

                      "Result ID", "Cancer Site", "Effect Measure",
                      "Effect Units", "Trend Test", "Covariates",
                      "Covariates Text", "Notes",

                      "Exposure Category", "Number Exposed", "Risks estimated?",
                      "Risk Mid", "Risk 5% CI", "Risk 95% CI"]
            data = [header]
            for v in vals
                reference = Reference.findOne({_id: v.referenceID}).name
                row = [v._id, reference, v.studyDesign,
                       v.location, v.enrollmentDates, v.populationDescription,
                       v.populationSize, v.populationSizeCase, v.populationSizeControl,
                       v.sourceCaseControls, v.exposureAssessmentMethod, v.outcomeDataSource,
                       v.responseRate, v.referentGroup, v.exposureLevel, v.analyticalMethod,
                       v.strengths, v.limitations, v.notes]
                rows = getResultData(v._id, row)
                data.push.apply(data, rows)
            return data

        getResultData = (parent_id, row) ->
            vals = EpiResult.find({parent_id: parent_id}, {sort: {sortIdx: 1}}).fetch()
            rows = []
            # multiple results (cancer sites) per cohort
            for v in vals
                covariates = v.covariates.join(', ')
                row2 = row.slice()  # shallow copy
                row2.push(v._id, v.cancerSite, v.effectMeasure,
                          v.effectUnits, v.trendTest, covariates,
                          v.covariatesControlledText, v.notes)

                # multiple risk-estimates per cancer site (low-exp group, high-exp group, etc.)
                for re in v.riskEstimates
                    row3 = row2.slice()  # shallow copy
                    row3.push(re.exposureCategory, re.numberExposed, re.riskEstimated,
                              re.riskMid, re.riskLow, re.riskHigh)
                    rows.push(row3)
            return rows

        data = getDescriptiveData()
        ws_name = "epi Results"
        wb = new Workbook()
        ws = sheet_from_array_of_arrays(data)
        wb.SheetNames.push(ws_name)
        wb.Sheets[ws_name] = ws
        XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'})

    mechanisticEvidenceExcelDownload: (tbl_id) ->

        getDataRow = (v) ->
            refs = _.pluck(Reference.find({_id: {$in : v.references}},
                                          {fields: {name: 1}}).fetch(), 'name')
            return [v.section, v._id, v.subheading, v.text,
                    refs.join('; '), v.humanInVivo, v.humanInVitro,
                    v.animalInVivo, v.animalInVitro]

        getData = (tbl_id) ->
            header = ['section', '_id', 'subheading', 'text',
                      'references', 'humanInVivo', 'humanInVitro',
                      'animalInVivo', 'animalInVitro']
            data = [header]

            addEvidence = (evidence) ->
                data.push(getDataRow(evidence))
                children = MechanisticEvidence.find({parent: evidence._id},
                                                    {sort: {sortIdx: 1}})
                children.forEach((child) -> addEvidence(child))

            for section in mechanisticEvidenceSections
                sectionEvidences = MechanisticEvidence.find({tbl_id: tbl_id, section: section.section},
                                                            {sort: {sortIdx: 1}})
                sectionEvidences.forEach((evidence) -> addEvidence(evidence))

            return data

        data = getData(tbl_id)
        ws_name = "mechanisticEvidence"
        wb = new Workbook()
        ws = sheet_from_array_of_arrays(data)
        wb.SheetNames.push(ws_name)
        wb.Sheets[ws_name] = ws
        XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'})

    referenceExcelDownload: (monographNumber) ->

        getDataRow = (v) ->
            return [v._id, v.name, v.fullCitation,
                    v.referenceType, v.pubmedID, v.otherURL]

        getData = ->
            header = ['_id', 'Short Citation', 'Full Citation',
                      'Reference Type', 'Pubmed ID', 'Other URL']
            data = [header]
            refs = Reference.find({"monographNumber": {$in: [monographNumber]}},
                                  {sort: [["name", 1]]})

            for ref in refs.fetch()
                data.push(getDataRow(ref))

            return data

        data = getData()
        ws_name = "#{monographNumber}-references"
        wb = new Workbook()
        ws = sheet_from_array_of_arrays(data)
        wb.SheetNames.push(ws_name)
        wb.Sheets[ws_name] = ws
        XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'})

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

    searchCancerSite: (query) ->
        check(query, String)
        return singleFieldTextSearch
                    Collection: EpiResult,
                    field: "cancerSite",
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

    searchAnalyticalMethod: (query) ->
        check(query, String)
        return singleFieldTextSearch
                    Collection: EpiDescriptive,
                    field: "analyticalMethod",
                    query: query

    searchAgent: (query) ->
        check(query, String)
        return singleFieldTextSearch
                    Collection: Tables,
                    field: "agent",
                    query: query

    searchReference: (inputs) ->
        check(inputs, {qry: String, monographNumber: Match.Integer})
        querystr = new RegExp(inputs.qry, "i")  # case insensitive
        query =
            $and: [
                name:
                    $regex: querystr,
                monographNumber:
                    $in: [ inputs.monographNumber ]
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
