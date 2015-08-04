# moveModalHolder
Template.moveModalHolder.helpers

    getCurrentTable: () ->
        d = Session.get('Tbl')
        return "#{d.volumeNumber} #{d.monographAgent}: #{d.name}"

    getOptions: () ->
        # find all tables which user can edit
        userId = Meteor.userId()
        tbls = Tables.find({tblType: Session.get("Tbl").tblType}).fetch()
        return _.chain(tbls)
                .filter(clientShared.userCanEdit)
                .map((d) -> "<option value='#{d._id}'>#{d.volumeNumber} #{d.monographAgent}: #{d.name}</option>")
                .value()
                .join("")

Template.moveModalHolder.events

    'click #move-content': (evt, tmpl) ->
        # Move content from one table to another table.
        content_id = @.content._id
        tbl_id = $(tmpl.find("select[name='moveTblTo']")).val()
        ET = clientShared.evidenceType[Session.get("evidenceType")]
        ET.collection.update(
            {"_id": content_id},
            {$set: {"tbl_id": tbl_id, "sortIdx": 500}})
        if ET.nested_collection?
            # http://stackoverflow.com/questions/20218508/
            for nest in ET.nested_collection.find({parent_id: content_id}).fetch()
                ET.nested_collection.update(
                    {"_id": nest._id}
                    {$set: {"tbl_id": tbl_id}})
        $(tmpl.firstNode).modal('hide')

Template.moveModalHolder.rendered = ->
    $(@.find('#moveModalHolder')).modal('show')
