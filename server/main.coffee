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

Reference.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    # Duplication check. First see if a reference with this PubMed ID already
    # exists. If it does, we won't create a new record, but associate the
    # current record with the monograph number specified. Note that this is only
    # checked if the item has a PubMed ID.
    if isFinite(doc.pubmedID)
        ref = Reference.findOne({pubmedID: doc.pubmedID})
        if ref
            newMonographNumber = doc.monographNumber[0]
            # check if it's already associated with this monograph
            if ref not in ref.monographNumber
                Reference.update(ref._id, {$push: {'monographNumber': newMonographNumber}})
            # don't create a new reference.
            return false

MechanisticEvidence.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc['sortIdx'] = getNewIdx(MechanisticEvidence, doc.tbl_id)

Tables.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)

EpiCaseControl.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc['isHidden'] = false
    doc['sortIdx'] = getNewIdx(EpiCaseControl, doc.tbl_id)

EpiCohort.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc['isHidden'] = false
    doc['sortIdx'] = getNewIdx(EpiCohort, doc.tbl_id)

EpiRiskEstimate.before.insert (userId, doc) ->
    doc = addTimestampAndUserID(userId, doc)
    doc['isHidden'] = false
    doc['sortIdx'] = getNewIdx(EpiRiskEstimate, doc.tbl_id)

