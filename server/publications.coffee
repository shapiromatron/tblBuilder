# sleep = (ms) ->
#     # DEBUG: force sleep
#     unixtime_ms = new Date().getTime()
#     while(new Date().getTime() < unixtime_ms + ms)
#         x=1

userCanView = (tbl, userId) ->
    # User-can view permissions check on a table-level basis.
    if serverShared.isStaffOrHigher(userId) then return true
    if(tbl and userId)
        valid_ids = (v.user_id for v in tbl.user_roles)
        return ((userId is tbl.user_id) or (valid_ids.indexOf(userId)>=0))
    return false

Meteor.publish 'tables', (user_id) ->
    if this.userId?
        options = {sort: [['volumeNumber', 'desc'], ['timestamp', 'desc']]}
        if serverShared.isStaffOrHigher(this.userId)
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

Meteor.publish 'epiCollective', (volumeNumber, monographAgent) ->
    allTbls = Tables.find({
                tblType: "Epidemiology Evidence",
                volumeNumber: parseInt(volumeNumber, 10),
                monographAgent: monographAgent
            }).fetch()

    tbls = []
    for tbl in allTbls
        if userCanView(tbl, this.userId) then tbls.push(tbl)

    if tbls.length > 0
        tbl_ids = _.pluck(tbls, "_id")
        return [
            EpiDescriptive.find({tbl_id: {$in: tbl_ids}}),
            EpiResult.find({tbl_id: {$in: tbl_ids}}),
            Reference.find({monographAgent: {$in: [monographAgent]}})
        ]
    return this.ready()

Meteor.publish 'mechanisticEvidence', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(_id: tbl_id)
    if userCanView(tbl, this.userId)
        return [MechanisticEvidence.find({tbl_id: tbl_id}),
                Reference.find({monographAgent: {$in: [tbl.monographAgent]}}) ]
    return this.ready()

Meteor.publish 'exposureEvidence', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(_id: tbl_id)
    if userCanView(tbl, this.userId)
        return [ExposureEvidence.find({tbl_id: tbl_id}),
                Reference.find({monographAgent: {$in: [tbl.monographAgent]}}) ]
    return this.ready()

Meteor.publish 'animalEvidence', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(_id: tbl_id)
    if userCanView(tbl, this.userId)
        return [AnimalEvidence.find({tbl_id: tbl_id}),
                AnimalEndpointEvidence.find({tbl_id: tbl_id}),
                Reference.find({monographAgent: {$in: [tbl.monographAgent]}}) ]
    return this.ready()

Meteor.publish 'genotoxEvidence', (tbl_id) ->
    check(tbl_id, String)
    tbl = Tables.findOne(_id: tbl_id)
    if userCanView(tbl, this.userId)
        return [GenotoxEvidence.find({tbl_id: tbl_id}),
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
    if serverShared.isStaffOrHigher(this.userId)
        return Meteor.users.find({},
                {fields: {_id: 1, emails: 1, profile: 1, roles: 1, createdAt: 1}})
    else
        return this.ready()

Meteor.publish 'monographReference', (monographAgent) ->
    check(monographAgent, String)
    Reference.find({monographAgent: {$in: [monographAgent]}})

Meteor.publish 'reportTemplate', ->
    ReportTemplate.find()
