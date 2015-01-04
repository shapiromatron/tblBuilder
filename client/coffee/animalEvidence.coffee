# ANIMAL MAIN ------------------------------------------------------------------
Template.animalMain.rendered = ->
    Session.set('evidenceShowNew', false)
    Session.set('evidenceEditingId', null)
    Session.set('evidenceShowAll', false)
    Session.set('evidenceType', 'animal')


# ANIMAL TABLE -----------------------------------------------------------------
Template.animalTbl.helpers(share.abstractTblHelpers)
Template.animalTbl.events(share.abstractTblEvents)

Template.animalTbl.rendered = ->
    new Sortable(@.find('#sortable'),
        handle: ".dhOuter",
        onUpdate: share.moveRowCheck,
        Cls: AnimalEvidence )
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


# ANIMAL ROW -------------------------------------------------------------------
Template.animalRow.helpers(share.abstractRowHelpers)
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
Template.animalEndpointTbl.helpers(share.abstractNestedTableHelpers)
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
        console.log(obj)
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
            NestedCollection.update(@_id, modifier)
            Session.set("nestedEvidenceEditingId", null)
            share.removeNestedFormModal(tmpl)
        else
            errorDiv = share.createErrorDiv(NestedCollection.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

animalEndpointFormEvents = $.extend(true, {}, share.abstractNestedFormEvents, animalEndpointFormExtension)
Template.animalEndpointForm.events(animalEndpointFormEvents)


Template.animalEndpointForm.rendered = ->
    share.toggleQA(@, @.data.isQA)
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
