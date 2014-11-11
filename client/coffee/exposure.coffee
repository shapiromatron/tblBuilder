# EXPOSURE MAIN ------------------------------------------------------------------
Template.exposureMain.rendered = ->
    Session.set('evidenceShowNew', false)
    Session.set('evidenceEditingId', null)
    Session.set('evidenceShowAll', false)
    Session.set('evidenceType', 'exposure')


# EXPOSURE TABLE ---------------------------------------------------------------
Template.exposureTbl.helpers(share.abstractTblHelpers)
Template.exposureTbl.events(share.abstractTblEvents)

Template.exposureTbl.rendered = ->
    new Sortable(@.find('#sortable'),
        handle: ".dhOuter",
        onUpdate: share.moveRowCheck,
        Cls: ExposureEvidence )
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


# EXPOSURE ROW -----------------------------------------------------------------
Template.exposureRow.events(share.abstractRowEvents)


# EXPOSURE FORM ----------------------------------------------------------------
Template.exposureForm.events(share.abstractFormEvents)

Template.exposureForm.rendered = ->
    share.toggleQA(@, @.data.isQA)
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"
