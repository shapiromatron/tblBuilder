isCreatorOrProjectManager = (tbl, userId) ->
    # only project managers or creators
    ids = (v.user_id for v in tbl.user_roles when v.role is "projectManagers")
    return ((tbl.user_id is userId) or (userId in ids))

isTeamMemberOrHigher = (tbl, userId) ->
    # only project managers or creators
    ids = (v.user_id for v in tbl.user_roles when v.role in ["projectManagers", "teamMembers"])
    return ((tbl.user_id is userId) or (userId in ids))

tblContentAllowRules =
    # must be a valid-table with team-member or higher permissions

    insert: (userId, doc) ->
        tbl = Tables.findOne({_id: doc.tbl_id})
        if not tbl? then return false
        return isTeamMemberOrHigher(tbl, userId)

    update: (userId, doc, fieldNames, modifier) ->
        tbl = Tables.findOne({_id: doc.tbl_id})
        if not tbl? then return false
        return isTeamMemberOrHigher(tbl, userId)

    remove: (userId, doc) ->
        tbl = Tables.findOne({_id: doc.tbl_id})
        if not tbl? then return false
        return isTeamMemberOrHigher(tbl, userId)

Meteor.startup ->

    # Set rules for create, update, destroy operations
    Tables.allow
        insert: (userId, doc) ->
            return share.isStaffOrHigher(userId)

        update: (userId, doc, fieldNames, modifier) ->
            return isCreatorOrProjectManager(doc, userId)

        remove: (userId, doc) ->
            return isCreatorOrProjectManager(doc, userId)

    Reference.allow
        insert: (userId, doc) ->
            # must be logged-in
            return userId?

        update: (userId, doc, fieldNames, modifier) ->
            # must be logged-in
            return userId?

        remove: (userId, doc) ->
            # must be logged-in
            return userId?

    MechanisticEvidence.allow tblContentAllowRules

    EpiDescriptive.allow tblContentAllowRules

    EpiResult.allow tblContentAllowRules
