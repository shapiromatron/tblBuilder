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
