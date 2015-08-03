# ANIMAL MAIN ------------------------------------------------------------------
Template.animalMain.helpers(share.abstractMainHelpers)

Template.animalMain.rendered = ->
    Session.set('evidenceShowNew', false)
    Session.set('evidenceEditingId', null)
    Session.set('evidenceShowAll', false)
    Session.set('evidenceType', 'animal')


# ANIMAL TABLE -----------------------------------------------------------------

animalTblHelpers =

    getReportTypes: ->
        return [
            {
                "type": "AnimalHtmlTblRecreation",
                "fn": "ani-results",
                "text": "Download Word: HTML table recreation"
            },
        ]

animalTblEvents =

    'click .wordReport': (evt, tmpl) ->
        tbl_id = Session.get('Tbl')._id
        report_type = evt.target.dataset.type
        fn = evt.target.dataset.fn + ".docx"
        Meteor.call "pyWordReport", tbl_id, report_type, (err, response) ->
            if (response) then return share.b64toWord(response, fn)
            return alert("An error occurred.")

Template.animalTbl.helpers _.extend(animalTblHelpers, share.abstractTblHelpers)
Template.animalTbl.events _.extend(animalTblEvents, share.abstractTblEvents)

Template.animalTbl.rendered = ->
    new Sortable(@.find('#sortable'),
        handle: ".dhOuter",
        onUpdate: share.moveRowCheck,
        Cls: AnimalEvidence )
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


# ANIMAL ROW -------------------------------------------------------------------
getFirstEndpoint = (parent_id) ->
    # reactive source; use the values from the first endpoint-group
    return AnimalEndpointEvidence.findOne({parent_id: parent_id})

animalEndpointRowHelperExtension =
    getDoses: () ->
        return shared.getAnimalDoses(getFirstEndpoint(@_id))

    getNStarts: () ->
        return shared.getAnimalNStarts(getFirstEndpoint(@_id))

    getNSurvivings: () ->
        return shared.getAnimalNSurvivings(getFirstEndpoint(@_id))

animalRowHelpers = $.extend(true, {}, share.abstractRowHelpers, animalEndpointRowHelperExtension)
Template.animalRow.helpers(animalRowHelpers)
Template.animalRow.events(share.abstractRowEvents)

Template.animalRow.rendered = ->
    new Sortable(@.find('#sortableInner'),
        handle: ".dhInner",
        onUpdate: share.moveRowCheck,
        Cls: AnimalEndpointEvidence)
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))

# ANIMAL FORM ------------------------------------------------------------------
Template.animalForm.events(share.abstractFormEvents)

Template.animalForm.helpers
    getStudyDesigns: ->
        return animalStudyDesigns

    getSexes: ->
        return animalSexes

Template.animalForm.rendered = ->
    share.toggleQA(@, @.data.isQA)
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"


# ANIMAL ENDPOINT TBL ----------------------------------------------------------
animalEndpointTblHelpersExtension =
    getIncidents: () ->
        txt = ""
        val = shared.getAnimalEndpointIncidents(@endpointGroups)
        if val isnt ""
            sig = @incidence_significance or ""
            txt = "<tr><td>#{val}</td><td>#{sig}</td></tr>"
        return txt

    getMultiplicities: () ->
        txt = ""
        val = shared.getAnimalEndpointMultiplicities(@endpointGroups)
        if val isnt ""
            sig = @multiplicity_significance or ""
            txt = "<tr><td>#{val}</td><td>#{sig}</td></tr>"
        return txt

    getTotalTumours: () ->
        txt = ""
        val = shared.getAnimalTotalTumours(@endpointGroups)
        if val isnt ""
            sig = @total_tumours_significance or ""
            txt = "<tr><td>#{val}</td><td>#{sig}</td></tr>"
        return txt


animalEndpointTblHelpers = $.extend(true, {}, share.abstractNestedTableHelpers, animalEndpointTblHelpersExtension)

Template.animalEndpointTbl.helpers(animalEndpointTblHelpers)
Template.animalEndpointTbl.events(share.abstractNestedTableEvents)


# ANIMAL ENDPOINT FORM ---------------------------------------------------------
Template.animalEndpointForm.helpers(share.abstractNestedFormHelpers)

getEndpointGroupRows = (tmpl, obj) ->
    delete obj.dose
    delete obj.nStart
    delete obj.nSurviving
    delete obj.incidence
    delete obj.multiplicity
    delete obj.totalTumours
    obj.endpointGroups = []
    tbody = tmpl.find('.endpointGroupTbody')
    for row in $(tbody).find('tr')
        obj.endpointGroups.push(share.newValues(row))

# copy but override abstract object
animalEndpointFormExtension =

    'click #inner-addEndpointGroup': (evt, tmpl) ->
        tbody = tmpl.find('.endpointGroupTbody')
        Blaze.renderWithData(Template.animalEndpointGroupForm, {}, tbody)

    'click #inner-create': (evt, tmpl) ->
        # override required to get riskRow information
        key = Session.get('evidenceType')
        NestedCollection = share.evidenceType[key].nested_collection
        obj = share.newValues(tmpl.find('#nestedModalForm'))
        getEndpointGroupRows(tmpl, obj)  # (override)
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['parent_id'] = tmpl.data.parent._id
        obj['sortIdx'] = 1e10  # temporary, make sure to place at bottom
        obj['isHidden'] = false

        isValid = NestedCollection.simpleSchema().namedContext().validate(obj)
        if isValid
            NestedCollection.insert(obj)
            share.removeNestedFormModal(tmpl)
        else
            errorDiv = share.createErrorDiv(NestedCollection.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #inner-update': (evt, tmpl) ->
        # override required to get riskRow information
        key = Session.get('evidenceType')
        NestedCollection = share.evidenceType[key].nested_collection
        vals = share.updateValues(tmpl.find('#nestedModalForm'), @)
        getEndpointGroupRows(tmpl, vals)  # (override)
        modifier = {$set: vals}

        isValid = NestedCollection.simpleSchema().namedContext().validate(modifier, {modifier: true})
        if isValid
            NestedCollection.update(@_id, modifier, {removeEmptyStrings: false})
            Session.set("nestedEvidenceEditingId", null)
            share.removeNestedFormModal(tmpl)
        else
            errorDiv = share.createErrorDiv(NestedCollection.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #calculate-statistics': (evt, tmpl) ->
        Meteor.call "getAnimalBioassayStatistics", @_id, (err, response) ->
            if (response) then return console.log(response)
            return alert("An error occurred.")

animalEndpointFormEvents = $.extend(true, {}, share.abstractNestedFormEvents, animalEndpointFormExtension)
Template.animalEndpointForm.events(animalEndpointFormEvents)


Template.animalEndpointForm.rendered = ->
    aniResult = AnimalEndpointEvidence.findOne({_id: Session.get('nestedEvidenceEditingId')})
    if aniResult?
        share.toggleQA(@, aniResult.isQA)
    $(@.find('#nestedModalDiv')).modal('toggle')
    $(@.findAll('.helpPopovers')).popover
        delay: {show: 500, hide: 100}
        trigger: "hover"
        placement: "auto"


# ANIMAL ENDPOINT GROUP FORM ROW -----------------------------------------------
Template.animalEndpointGroupForm.events
    'click #endpointGroup-delete': (evt, tmpl) ->
        Blaze.remove(tmpl.view)
        $(tmpl.view._domrange.members).remove()
