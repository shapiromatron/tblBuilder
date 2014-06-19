Meteor.publish 'myTbls', (user_id) ->
    check(user_id, String)
    MyTbls.find({$or: [{user_id: user_id},
                       {user_roles: {$elemMatch: {user_id: user_id}}}]})

Meteor.publish 'epiCaseControl', (myTbl_id) ->
    check(myTbl_id, String)
    return [ EpiCaseControl.find({myTbl_id: myTbl_id}),
             EpiRiskEstimate.find({myTbl_id: myTbl_id}) ]

Meteor.publish 'epiCohort', (myTbl_id) ->
    check(myTbl_id, String)
    return [ EpiCohort.find({myTbl_id: myTbl_id}),
             EpiRiskEstimate.find({myTbl_id: myTbl_id}) ]


Meteor.publish 'tblUsers', (myTbl_id) ->
    check(myTbl_id, String)
    tbl = MyTbls.findOne(myTbl_id)
    ids = (v.user_id for v in tbl.user_roles)
    Meteor.users.find({_id: {$in: ids}},
                      {fields: {_id: 1, emails: 1, profile: 1}})
