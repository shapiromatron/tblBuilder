# sleep = (ms) ->
#     # DEBUG: force sleep
#     unixtime_ms = new Date().getTime()
#     while(new Date().getTime() < unixtime_ms + ms)
#         x=1

userCanView = (tbl, userId) ->
    # User-can view permissions check on a table-level basis.
    if share.isStaffOrHigher(userId) then return true
    if(tbl and userId)
        valid_ids = (v.user_id for v in tbl.user_roles)
        return ((userId is tbl.user_id) or (valid_ids.indexOf(userId)>=0))
    return false

Meteor.publish 'tables', (user_id) ->
    if this.userId?
        options = {sort: [['volumeNumber', 'desc'], ['timestamp', 'desc']]}
        if share.isStaffOrHigher(this.userId)
            return Tables.find({}, options)
        else
            return Tables.find({$or: [{user_id: this.userId},
                                      {user_roles: {$elemMatch: {user_id: this.userId}}}]}, options)
    return this.ready()

Meteor.publish 'epiDescriptive', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(_id: tbl_id)
    if userCanView(tbl, this.userId)
        return [EpiDescriptive.find({tbl_id: tbl_id}),
                EpiResult.find({tbl_id: tbl_id}),
                Reference.find({monographAgent: {$in: [tbl.monographAgent]}}) ]
    return this.ready()

Meteor.publish 'mechanisticEvidence', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(_id: tbl_id)
    if userCanView(tbl, this.userId)
        return [MechanisticEvidence.find({tbl_id: tbl_id}),
                Reference.find({monographAgent: {$in: [tbl.monographAgent]}}) ]
    return this.ready()

Meteor.publish 'tblUsers', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(tbl_id)
    if userCanView(tbl, this.userId)
        ids = (v.user_id for v in tbl.user_roles)
        return Meteor.users.find({_id: {$in: ids}},
                                 {fields: {_id: 1, emails: 1, profile: 1}})
    return this.ready()

Meteor.publish 'adminUsers', ->
    if share.isStaffOrHigher(this.userId)
        return Meteor.users.find({},
                {fields: {_id: 1, emails: 1, profile: 1, roles: 1, createdAt: 1}})
    else
        return this.ready()

Meteor.publish 'monographReference', (monographAgent) ->
    check(monographAgent, String)
    Reference.find({monographAgent: {$in: [monographAgent]}})

Meteor.publish 'reportTemplate', ->
    ReportTemplate.find()
