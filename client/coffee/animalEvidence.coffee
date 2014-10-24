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
Template.animalEndpointForm.events(share.abstractNestedFormEvents)

Template.animalEndpointForm.rendered = ->
    share.toggleQA(@, @.data.isQA)
    $(@.find('#nestedModalDiv')).modal('toggle')
    $(@.findAll('.helpPopovers')).popover
        delay: {show: 500, hide: 100}
        trigger: "hover"
        placement: "auto"
