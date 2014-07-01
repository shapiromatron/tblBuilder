# sleep = (ms) ->
#     # DEBUG: force sleep
#     unixtime_ms = new Date().getTime()
#     while(new Date().getTime() < unixtime_ms + ms)
#         x=1

userCanView = (tbl, userId) ->
    # User-can view permissions check on a table-level basis.
    if(tbl and userId)
        valid_ids = (v.user_id for v in tbl.user_roles)
        return ((userId is tbl.user_id) or (valid_ids.indexOf(id)>=0))
    return false

Meteor.publish 'tables', (user_id) ->
    if user_id?
        return Tables.find({$or: [{user_id: user_id},
                                  {user_roles: {$elemMatch: {user_id: user_id}}}]},
                           {sort: [['monographNumber', 'desc'], ['timestamp', 'desc']]})
    else this.stop(); return;

Meteor.publish 'epiCaseControl', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(_id: tbl_id)
    if userCanView(tbl, this.userId)
        return [EpiCaseControl.find({tbl_id: tbl_id}),
                EpiRiskEstimate.find({tbl_id: tbl_id}),
                Reference.find({monographNumber: {$in: [tbl.monographNumber]}}) ]
    else this.stop(); return;

Meteor.publish 'epiCohort', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(_id: tbl_id)
    if userCanView(tbl, this.userId)
        return [EpiCohort.find({tbl_id: tbl_id}),
                EpiRiskEstimate.find({tbl_id: tbl_id}),
                Reference.find({monographNumber: {$in: [tbl.monographNumber]}}) ]
    else this.stop(); return;

Meteor.publish 'mechanisticEvidence', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(_id: tbl_id)
    if userCanView(tbl, this.userId)
        return [MechanisticEvidence.find({tbl_id: tbl_id}),
                Reference.find({monographNumber: {$in: [tbl.monographNumber]}}) ]
    else this.stop(); return;

Meteor.publish 'tblUsers', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(tbl_id)
    if userCanView(tbl, this.userId)
        ids = (v.user_id for v in tbl.user_roles)
        return Meteor.users.find({_id: {$in: ids}},
                                 {fields: {_id: 1, emails: 1, profile: 1}})
    else this.stop(); return;

Meteor.publish 'monographReference', (monographNumber) ->
    monographNumber = parseInt(monographNumber, 10)
    check(monographNumber, Number)
    Reference.find({monographNumber: {$in: [monographNumber]}})
