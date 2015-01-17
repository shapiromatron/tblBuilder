addTimestampAndUserID = (userId, doc) ->
    doc.timestamp = new Date()
    doc.user_id = userId
    return doc

addQAmarks = (doc) ->
    doc.isQA = false
    doc.timestampQA = null
    doc.user_id_QA = null
    return doc

getNewIdx = (Cls, tbl_id) ->
    # auto-incrementing table index , starting at 1
    max = 0
    found = Cls.findOne({tbl_id: tbl_id}, {sort: {sortIdx: -1}})
    if found then max = found.sortIdx
    return max+1

userCanEditTblContent = (tbl_id, editorId) ->
    if "superuser" in Meteor.user().roles then return true
    tbl = Tables.findOne(tbl_id)
    if not editorId? or not tbl? then return false
    if editorId is tbl.user_id then return true
    for user in tbl.user_roles
        if editorId is user.user_id and user.role isnt "reviewers" then return true
    return false


# Create hooks
Tables.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    currentMaxTable = Tables.findOne(
        {"volumeNumber": doc.volumeNumber,"monographAgent": doc.monographAgent},
        {"sort": {"sortIdx": -1}})
    currentMax = if currentMaxTable then currentMaxTable.sortIdx else 0
    doc.sortIdx = currentMax+1
    return share.isStaffOrHigher(userId)

ReportTemplate.before.insert (userId, doc) ->
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
        newMonographAgent = doc.monographAgent[0]
        # check if it's already associated with this monograph
        if newMonographAgent not in ref.monographAgent
            Reference.update(ref._id, {$push: {'monographAgent': newMonographAgent}})
        # don't create a new reference.
        return false


MechanisticEvidence.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc = addQAmarks(doc)
    doc['sortIdx'] = getNewIdx(MechanisticEvidence, doc.tbl_id)
    return userCanEditTblContent(doc.tbl_id, userId)

EpiDescriptive.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc = addQAmarks(doc)
    doc['isHidden'] = false
    doc['sortIdx'] = getNewIdx(EpiDescriptive, doc.tbl_id)
    return userCanEditTblContent(doc.tbl_id, userId)

EpiResult.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc = addQAmarks(doc)
    doc['isHidden'] = false
    doc['sortIdx'] = getNewIdx(EpiResult, doc.tbl_id)
    return userCanEditTblContent(doc.tbl_id, userId)

ExposureEvidence.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc = addQAmarks(doc)
    doc['isHidden'] = false
    doc['sortIdx'] = getNewIdx(ExposureEvidence, doc.tbl_id)
    return userCanEditTblContent(doc.tbl_id, userId)

AnimalEvidence.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc = addQAmarks(doc)
    doc['isHidden'] = false
    doc['sortIdx'] = getNewIdx(AnimalEvidence, doc.tbl_id)
    return userCanEditTblContent(doc.tbl_id, userId)

AnimalEndpointEvidence.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc = addQAmarks(doc)
    doc['isHidden'] = false
    doc['sortIdx'] = getNewIdx(AnimalEndpointEvidence, doc.tbl_id)
    return userCanEditTblContent(doc.tbl_id, userId)

GenotoxEvidence.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc = addQAmarks(doc)
    doc['isHidden'] = false
    doc['sortIdx'] = getNewIdx(GenotoxEvidence, doc.tbl_id)
    return userCanEditTblContent(doc.tbl_id, userId)


# Update hooks
userCanEditTblContentCheck = (userId, doc, fieldNames, modifier, options) ->
    return userCanEditTblContent(doc.tbl_id, userId)

Reference.before.update (userId, doc, fieldNames, modifier, options) -> return true

MechanisticEvidence.before.update userCanEditTblContentCheck

EpiDescriptive.before.update userCanEditTblContentCheck

EpiResult.before.update userCanEditTblContentCheck

ExposureEvidence.before.update userCanEditTblContentCheck

AnimalEvidence.before.update userCanEditTblContentCheck

AnimalEndpointEvidence.before.update userCanEditTblContentCheck

GenotoxEvidence.before.update userCanEditTblContentCheck


# Remove hooks
Tables.before.remove (userId, doc) ->
    # also remove all results
    EpiResult.remove({tbl_id: doc._id})
    EpiDescriptive.remove({tbl_id: doc._id})
    MechanisticEvidence.remove({tbl_id: doc._id})

userCanRemoveTblContentCheck = (userId, doc) ->
    return userCanEditTblContent(doc.tbl_id, userId)

Reference.before.remove (userId, doc) -> return true

MechanisticEvidence.before.remove (userId, doc) ->
    # also remove all child documents
    if userCanRemoveTblContentCheck(userId, doc) is false then return false
    MechanisticEvidence.remove({parent: doc._id})
    return true

EpiDescriptive.before.remove (userId, doc) ->
    # also remove all results
    if userCanRemoveTblContentCheck(userId, doc) is false then return false
    EpiResult.remove({parent_id: doc._id})
    return true

EpiResult.before.remove userCanRemoveTblContentCheck

ExposureEvidence.before.remove userCanRemoveTblContentCheck

AnimalEvidence.before.remove userCanRemoveTblContentCheck

AnimalEndpointEvidence.before.remove userCanRemoveTblContentCheck

GenotoxEvidence.before.remove userCanRemoveTblContentCheck


# After insert hook
Meteor.users.after.insert (userId, doc) ->
    Roles.addUsersToRoles(doc._id, "default");

Tables.after.insert (userId, doc) ->
    # Prepopulate mechanistic evidence table with predefined categories.
    if doc.tblType is "Mechanistic Evidence Summary"
        for category in mechanisticEvidenceCategories
            mech =
                tbl_id: doc._id
                section: "characteristics"
                text: ""
                subheading: category
                humanInVivo: false
                animalInVivo: false
                humanInVitro: false
                animalInVitro: false
                references: []
            MechanisticEvidence.insert(mech)

