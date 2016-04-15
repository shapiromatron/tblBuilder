import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';


export const createErrorDiv = function(context) {
    var  msg, ul = $('<ul>');
    context.invalidKeys().forEach(function(obj){
        msg = undefined;
        try {
            msg = context.keyErrorMessage(obj.name);
        } catch (err) {
            console.error(err);
        }
        if (msg != null) {
            ul.append(`<li>${msg}</li>`);
        } else {
            ul.append(`<li>${obj.name} is ${obj.type}; got \'${obj.value}\' </li>`);
        }
    });

    return $('<div class="bg-danger">')
        .append('<p><strong>The following errors were found:</strong></p>')
        .append(ul);
};


export const createNewNestedModal = function(evt, tmpl) {
    var div = document.getElementById('modalHolder'),
        key = Session.get('evidenceType'),
        NestedTemplate = tblBuilderCollections.evidenceLookup[key].nested_template;
    $(div).empty();
    Blaze.renderWithData(NestedTemplate, {parent: this}, div);
};

export const isCtrlClick = function(evt){
    return evt.ctrlKey || evt.altKey || evt.metaKey;
};

export const animateClick = function(el){
    $(el)
      .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
          function(){$(el).removeClass('animated rubberBand');})
      .addClass('animated rubberBand');
};
