Meteor.publish 'myTbls', (user_id) ->
    check(user_id, String)
    MyTbls.find({user_id: user_id})

Meteor.publish 'epiCaseControl', (myTbl_id) ->
    check(myTbl_id, String)
    EpiCaseControl.find({myTbl_id: myTbl_id})

Meteor.publish 'epiRiskEstimate', (myTbl_id) ->
    check(myTbl_id, String)
    EpiRiskEstimate.find({myTbl_id: myTbl_id})

Meteor.publish 'epiCohort', (myTbl_id) ->
    check(myTbl_id, String)
    EpiCohort.find({myTbl_id: myTbl_id})

Meteor.publish 'tblUsers', (myTbl_id) ->
    check(myTbl_id, String)
    tbl = MyTbls.findOne(myTbl_id)
    ids = (v.user_id for v in tbl.user_roles)
    Meteor.users.find({_id: {$in: ids}},
                      {fields: {_id: 1, emails: 1}})
