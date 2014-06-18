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

getNewIdx = (Cls, filter) ->
    max = -1
    val = Cls.findOne(filter, {fields: {"sortIdx":1, "_id":0}, sort: {"sortIdx":-1}})
    if (val and isFinite(val.sortIdx)) then max = val.sortIdx
    return max+1

Meteor.methods
    epiCohortExcelDownload: (myTbl_id) ->

        getEpiCohortData = (myTbl_id) ->
            cohorts = EpiCohort.find({myTbl_id: myTbl_id}, {sort: {sortIdx: 1}}).fetch()
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

        data = getEpiCohortData(myTbl_id)
        ws_name = "epiCohort"
        wb = new Workbook()
        ws = sheet_from_array_of_arrays(data)
        wb.SheetNames.push(ws_name)
        wb.Sheets[ws_name] = ws
        XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'})

    epiCohortNewIdx: (myTbl_id) ->
        check(myTbl_id, String)
        getNewIdx(EpiCohort, {myTbl_id: myTbl_id})

    epiRiskEstimateNewIdx: (parent_id) ->
        check(parent_id, String)
        getNewIdx(EpiRiskEstimate, {parent_id: parent_id})

    epiCaseControlNewIdx: (myTbl_id) ->
        check(myTbl_id, String)
        getNewIdx(EpiCaseControl, {myTbl_id: myTbl_id})

    searchUsers: (str) ->
        check(str, String)
        querystr = new RegExp(str, "i")  # case insensitive
        query = {$or: [{"emails": {$elemMatch: {"address": {$regex: querystr}}}},
                       {"profile.fullName": {$regex: querystr}},
                       {"profile.affiliation": {$regex: querystr}}]}
        Meteor.users.find(query, {fields: {_id: 1, emails: 1, profile: 1}, limit: 50}).fetch()



