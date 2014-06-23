Meteor.publish 'tables', (user_id) ->
    check(user_id, String)
    Tables.find({$or: [{user_id: user_id},
                       {user_roles: {$elemMatch: {user_id: user_id}}}]},
                {sort: [['timestamp', 'desc']]})

Meteor.publish 'epiCaseControl', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(_id: tbl_id)
    return [EpiCaseControl.find({tbl_id: tbl_id}),
            EpiRiskEstimate.find({tbl_id: tbl_id}),
            Reference.find({monographNumber: {$in: [tbl.monographNumber]}}) ]

Meteor.publish 'epiCohort', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(_id: tbl_id)
    return [EpiCohort.find({tbl_id: tbl_id}),
            EpiRiskEstimate.find({tbl_id: tbl_id}),
            Reference.find({monographNumber: {$in: [tbl.monographNumber]}}) ]

Meteor.publish 'tblUsers', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(tbl_id)
    ids = (v.user_id for v in tbl.user_roles)
    Meteor.users.find({_id: {$in: ids}},
                      {fields: {_id: 1, emails: 1, profile: 1}})

Meteor.publish 'monographReference', (monographNumber) ->
    monographNumber = parseInt(monographNumber, 10)
    check(monographNumber, Number)
    Reference.find({monographNumber: {$in: [monographNumber]}})
