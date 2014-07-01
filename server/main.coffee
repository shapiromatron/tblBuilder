addTimestampAndUserID = (userId, doc) ->
    doc.timestamp = (new Date()).getTime()
    doc.user_id = userId
    return doc

getNewIdx = (Cls, tbl_id) ->
    # auto-incrementing table index , starting at 1
    max = 0
    found = Cls.findOne({tbl_id: tbl_id}, {sort: {sortIdx: -1}})
    if found then max = found.sortIdx
    return max+1

userCanEditTblContent = (tbl_id, editorId) ->
    tbl = Tables.findOne(tbl_id)
    if not editorId? or not tbl? then return false
    if editorId is tbl.user_id then return true
    for user in tbl.user_roles
        if editorId is user.user_id and user.role isnt "reviewers" then return true
    return false


# Create hooks
Tables.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    return share.isStaffOrHigher(userId)

Reference.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    # Duplication check. First see if a reference with this PubMed ID already
    # exists. If it does, we won't create a new record, but associate the
    # current record with the monograph number specified. Note that this is only
    # checked if the item has a PubMed ID.
    if isFinite(doc.pubmedID)
        ref = Reference.findOne({pubmedID: doc.pubmedID})
    else
        ref = Reference.findOne({fullCitation: doc.fullCitation})

    if (ref?)
        newMonographNumber = doc.monographNumber[0]
        # check if it's already associated with this monograph
        if newMonographNumber not in ref.monographNumber
            Reference.update(ref._id, {$push: {'monographNumber': newMonographNumber}})
        # don't create a new reference.
        return false


MechanisticEvidence.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc['sortIdx'] = getNewIdx(MechanisticEvidence, doc.tbl_id)
    return userCanEditTblContent(doc.tbl_id, userId)

EpiCaseControl.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc['isHidden'] = false
    doc['sortIdx'] = getNewIdx(EpiCaseControl, doc.tbl_id)
    return userCanEditTblContent(doc.tbl_id, userId)

EpiCohort.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc['isHidden'] = false
    doc['sortIdx'] = getNewIdx(EpiCohort, doc.tbl_id)
    return userCanEditTblContent(doc.tbl_id, userId)

EpiRiskEstimate.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc['isHidden'] = false
    doc['sortIdx'] = getNewIdx(EpiRiskEstimate, doc.tbl_id)
    return userCanEditTblContent(doc.tbl_id, userId)



# Update hooks

userCanEditTblContentCheck = (userId, doc, fieldNames, modifier, options) ->
    return userCanEditTblContent(doc.tbl_id, userId)
Reference.before.update (userId, doc, fieldNames, modifier, options) -> return true

MechanisticEvidence.before.update userCanEditTblContentCheck

EpiCaseControl.before.update userCanEditTblContentCheck

EpiCohort.before.update userCanEditTblContentCheck

EpiRiskEstimate.before.update userCanEditTblContentCheck



# Remove hooks

userCanRemoveTblContentCheck = (userId, doc) ->
    return userCanEditTblContent(doc.tbl_id, userId)

Reference.before.remove (userId, doc) -> return true

MechanisticEvidence.before.remove userCanRemoveTblContentCheck

EpiCaseControl.before.remove userCanRemoveTblContentCheck

EpiCohort.before.remove userCanRemoveTblContentCheck

EpiRiskEstimate.before.remove userCanRemoveTblContentCheck


# After insert hook
Meteor.users.after.insert (userId, doc) ->
    Roles.addUsersToRoles(doc._id, "default");

Tables.after.insert (userId, doc) ->
    # Prepopulate mechanistic evidence table with predefined categories.
    if doc.tblType is "Mechanistic Evidence Summary"
        for category in mechanisticEvidenceCategories
            mech =
                tbl_id: doc._id
                section: "mechanisms"
                text: ""
                subheading: category
                humanInVivo: false
                animalInVivo: false
                humanInVitro: false
                animalInVitro: false
                references: []
            MechanisticEvidence.insert(mech)

