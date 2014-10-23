# GENOTOX MAIN -----------------------------------------------------------------
Template.genotoxMain.rendered = ->
    Session.set('evidenceShowNew', false)
    Session.set('evidenceEditingId', null)
    Session.set('evidenceShowAll', false)
    Session.set('evidenceType', 'genotox')


# GENOTOX TABLE ----------------------------------------------------------------
Template.genotoxTbl.helpers(share.abstractTblHelpers)
Template.genotoxTbl.events(share.abstractTblEvents)

Template.genotoxTbl.rendered = ->
    new Sortable(@.find('#sortable'),
        handle: ".dhOuter",
        onUpdate: share.moveRowCheck,
        Cls: GenotoxEvidence )
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


# GENOTOX ROW ------------------------------------------------------------------
Template.genotoxRow.events(share.abstractRowEvents)


# GENOTOX FORM -----------------------------------------------------------------
Template.genotoxForm.events(share.abstractFormEvents)

Template.genotoxForm.rendered = ->
    share.toggleQA(@, @.data.isQA)
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"
