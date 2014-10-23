# MECH QUANT MAIN --------------------------------------------------------------
Template.mechQuantMain.rendered = ->
    Session.set('evidenceShowNew', false)
    Session.set('evidenceEditingId', null)
    Session.set('evidenceShowAll', false)
    Session.set('evidenceType', 'mechQuant')


# MECH QUANT TABLE -------------------------------------------------------------
Template.mechQuantTbl.helpers(share.abstractTblHelpers)
Template.mechQuantTbl.events(share.abstractTblEvents)

Template.mechQuantTbl.rendered = ->
    new Sortable(@.find('#sortable'),
        handle: ".dhOuter",
        onUpdate: share.moveRowCheck,
        Cls: MechQuantEvidence )
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


# MECH QUANT ROW ---------------------------------------------------------------
Template.mechQuantRow.events(share.abstractRowEvents)


# MECH QUANT FORM --------------------------------------------------------------
Template.mechQuantForm.events(share.abstractFormEvents)

Template.mechQuantForm.rendered = ->
    share.toggleQA(@, @.data.isQA)
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"
