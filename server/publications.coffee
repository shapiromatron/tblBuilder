Meteor.publish 'tables', (user_id) ->
    check(user_id, String)
    Tables.find({$or: [{user_id: user_id},
                       {user_roles: {$elemMatch: {user_id: user_id}}}]})

Meteor.publish 'epiCaseControl', (tbl_id) ->
    check(tbl_id, String)
    return [ EpiCaseControl.find({tbl_id: tbl_id}),
             EpiRiskEstimate.find({tbl_id: tbl_id}) ]

Meteor.publish 'epiCohort', (tbl_id) ->
    check(tbl_id, String)
    return [ EpiCohort.find({tbl_id: tbl_id}),
             EpiRiskEstimate.find({tbl_id: tbl_id}) ]


Meteor.publish 'tblUsers', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(tbl_id)
    ids = (v.user_id for v in tbl.user_roles)
    Meteor.users.find({_id: {$in: ids}},
                      {fields: {_id: 1, emails: 1, profile: 1}})
