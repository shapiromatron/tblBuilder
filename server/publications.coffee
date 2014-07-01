# sleep = (ms) ->
#     # DEBUG: force sleep
#     unixtime_ms = new Date().getTime()
#     while(new Date().getTime() < unixtime_ms + ms)
#         x=1

permissionsCheck = (tbl, userId) ->
    # User-can view permissions check on a table-level basis.
    if(tbl and userId)
        valid_ids = (v.user_id for v in tbl.user_roles)
        return ((userId is tbl.user_id) or (valid_ids.indexOf(id)>=0))
    return false

emptyCollection = (Col) ->
    return Col.find({_id: -1})


Meteor.publish 'tables', (user_id) ->
    if user_id is null
        return emptyCollection(Tables)
    Tables.find({$or: [{user_id: user_id},
                       {user_roles: {$elemMatch: {user_id: user_id}}}]},
                {sort: [['monographNumber', 'desc'], ['timestamp', 'desc']]})

Meteor.publish 'epiCaseControl', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(_id: tbl_id)
    if not permissionsCheck(tbl, this.userId)
        return emptyCollection(EpiCaseControl)
    return [EpiCaseControl.find({tbl_id: tbl_id}),
            EpiRiskEstimate.find({tbl_id: tbl_id}),
            Reference.find({monographNumber: {$in: [tbl.monographNumber]}}) ]

Meteor.publish 'epiCohort', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(_id: tbl_id)
    if not permissionsCheck(tbl, this.userId)
        return emptyCollection(EpiCohort)
    return [EpiCohort.find({tbl_id: tbl_id}),
            EpiRiskEstimate.find({tbl_id: tbl_id}),
            Reference.find({monographNumber: {$in: [tbl.monographNumber]}}) ]

Meteor.publish 'mechanisticEvidence', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(_id: tbl_id)
    if not permissionsCheck(tbl, this.userId)
        return emptyCollection(MechanisticEvidence)
    return [MechanisticEvidence.find({tbl_id: tbl_id}),
            Reference.find({monographNumber: {$in: [tbl.monographNumber]}}) ]

Meteor.publish 'tblUsers', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(tbl_id)
    if not permissionsCheck(tbl, this.userId)
        return emptyCollection(Meteor.users)
    ids = (v.user_id for v in tbl.user_roles)
    Meteor.users.find({_id: {$in: ids}},
                      {fields: {_id: 1, emails: 1, profile: 1}})

Meteor.publish 'monographReference', (monographNumber) ->
    monographNumber = parseInt(monographNumber, 10)
    check(monographNumber, Number)
    Reference.find({monographNumber: {$in: [monographNumber]}})
