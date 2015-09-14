var getValue = function(inp) {
  var $val = undefined;

  // special case for our multi-select list object
  if ($(inp).hasClass("multiSelectList")) {
    var $ul = $(inp).parent().next();
    return clientShared.typeaheadSelectListGetLIs($ul);
  }

  // special case for single-reference selector
  if ($(inp).hasClass("referenceSingleSelect")) {
    var $div = $(inp).parent().next();
    return $div.find('p').data('id');
  }

  // special case for multiple-reference selector
  if ($(inp).hasClass("referenceMultiSelect")) {
    var results = [],
        $ul = $(inp).parent().next();
    $ul.find('li').each(function(i, li){
      results.push($(li).data('id'));
    })
    return results;
  }

  // otherwise it's a standard html input
  val = undefined;
  switch (inp.type) {
    case "text":
    case "hidden":
    case "textarea":
    case "url":
      val = inp.value;
      break;
    case "number":
      val = parseFloat(inp.value, 10);
      if (isNaN(val)) val = undefined;
      break;
    case "checkbox":
      val = inp.checked;
      break;
    case "select-one":
      val = $(inp).find('option:selected').val();
      break;
    default:
      console.log('input not recognized');
  }
  return val;
},
b64toBlob = function(b64, contentType, sliceSize) {
  var byteArray, byteArrays, byteCharacters, byteNumbers, i, offset, slice;
  contentType = contentType || '';
  sliceSize = sliceSize || 512;
  byteCharacters = window.atob(b64);
  byteArrays = [];
  offset = 0;

  while (offset < byteCharacters.length) {
    slice = byteCharacters.slice(offset, offset + sliceSize);
    byteNumbers = new Array(slice.length);
    i = 0;
    while (i < slice.length) {
      byteNumbers[i] = slice.charCodeAt(i);
      i++;
    }
    byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
    offset += sliceSize;
  }

  return new Blob(byteArrays, {type: contentType});
},
s2ab = function(s) {
  var buf = new ArrayBuffer(s.length),
      view = new Uint8Array(buf),
      i, j, ref;
  for (i = j = 0, ref = s.length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
    view[i] = s.charCodeAt(i) & 0xFF;
  }
  return buf;
}, createNewNestedModal = function(evt, tmpl) {
  var div = document.getElementById('modalHolder'),
      key = Session.get('evidenceType'),
      NestedTemplate = tblBuilderCollections.evidenceLookup[key].nested_template;
  $(div).empty();
  Blaze.renderWithData(NestedTemplate, {parent: this}, div);
}, isCtrlClick = function(evt){
  return evt.ctrlKey || evt.altKey || evt.metaKey;
}, animateClick = function(el){
  $(el)
    .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
        function(){$(el).removeClass("animated rubberBand")})
    .addClass("animated rubberBand");
};
// template-utility functions
clientShared = {
  createErrorDiv: function(context) {
    var  msg, ul = $("<ul>");

    context.invalidKeys().forEach(function(obj){
      msg = undefined;
      try {
        msg = context.keyErrorMessage(obj.name);
      } catch (err) {}
      if (msg != null) {
        ul.append("<li>" + msg + "</li>");
      } else {
        ul.append("<li>" + obj.name + " is " + obj.type + "; got \"" + obj.value + "\" </li>");
      }
    });

    return $("<div class='bg-danger'>")
      .append('<p><strong>The following errors were found:</strong></p>')
      .append(ul);
  },
  activateInput: function(input) {
    input.focus();
    input.select();
  },
  updateValues: function(form, obj) {
    var newObj = {}, key, val;
    $(form).find("select,input,textarea").each(function(i, inp){
      key = inp.name;
      if (key.length > 0) {
        val = getValue(inp);
        if (obj[key] !== val) newObj[key] = val;
      }
    });
    return newObj;
  },
  newValues: function(form) {
    var obj = {}, key;
    $(form).find("select,input,textarea").each(function(i, inp){
      key = inp.name;
      if (key.length > 0) obj[key] = getValue(inp);
    });
    return obj;
  },
  returnExcelFile: function(raw_data, fn) {
    var blob = new Blob([s2ab(raw_data)], {type: "application/octet-stream"});
    fn = fn || "download.xlsx";
    return saveAs(blob, fn);
  },
  returnWordFile: function(raw_data, fn) {
    var blob;
    fn = fn || "download.docx";
    blob = new Blob([s2ab(raw_data)], {type: "application/octet-stream"});
    return saveAs(blob, fn);
  },
  b64toWord: function(b64, fn) {
    var blob = b64toBlob(b64, "application/octet-stream");
    fn = fn || "download.docx";
    return saveAs(blob, fn);
  },
  toggleRowVisibilty: function(display, $els) {
    return (display) ? $els.fadeIn() : $els.fadeOut();
  },
  moveRowCheck: function(evt) {
    var data = UI.getData(evt.target),
        $el = $(evt.target),
        this_pos = $el.data('sortidx'),
        prev_pos = $el.prev().data('sortidx') || 0,
        next_pos = $el.next().data('sortidx') || prev_pos + 1,
        newIdx = d3.mean([prev_pos, next_pos]);

    if ((this_pos < prev_pos) || (this_pos > next_pos)) {
      this.options.Cls.update(data._id, {$set: {sortIdx: newIdx}});
      $el.data('sortidx', newIdx);
    }
  },
  typeaheadSelectListGetLIs: function($ul) {
    return _.map(
        $ul.find('li'),
        function(li){return li.getAttribute('data-value');});
  },
  toggleRiskPlot: function() {

    d3.select('.epiRiskAxes').remove();
    if (!Session.get('epiRiskShowPlots')) return;
    Tracker.flush();

    var gridlines, svg, xaxis, xscale, yscale,
        header = $('.riskTR'),
        tbl = $('.evidenceTable'),
        tbl_pos = tbl.position(),
        header_pos = header.position(),
        y_top = tbl_pos.top + header.outerHeight(),
        x_left = header_pos.left,
        width = header.width(),
        height = tbl.height() - header.height(),
        xPlotBuffer = 0,   // make room for the text
        yPlotBuffer = 20;  // make room for x-axis

    svg = d3.select('.container')
      .insert("svg", "#epiCohortTbl")
      .attr('class', 'epiRiskAxes')
      .attr('height', height + yPlotBuffer)
      .attr('width', width + 2 * xPlotBuffer)
      .style({
        top: parseInt(y_top) + "px",
        left: parseInt(x_left - xPlotBuffer) + "px"
      });

    xscale = d3.scale.log()
      .range([0, width])
      .domain([0.05, 50])
      .clamp(true);

    yscale = d3.scale.linear()
      .range([0, height - yPlotBuffer])
      .domain([0, 1])
      .clamp(true);

    xaxis = d3.svg.axis()
      .scale(xscale)
      .orient("bottom")
      .ticks(0, d3.format(",.f"));

    svg.append("g")
      .attr("class", 'axis')
      .attr("transform", "translate({0}, {1})".printf(xPlotBuffer, height - yPlotBuffer))
      .call(xaxis);

    gridlines = svg.append("g")
      .attr('class', 'gridlines')
      .attr("transform", "translate({0},0)".printf(xPlotBuffer));

    gridlines.selectAll("gridlines")
      .data(xscale.ticks(10))
        .enter()
          .append("svg:line")
          .attr("x1", function(v) {return xscale(v);})
          .attr("x2", function(v) {return xscale(v);})
          .attr("y1", yscale(0))
          .attr("y2", yscale(1))
          .attr("class", function(v) {
            switch (v){
              case 1:
                return "baseline"
              case 0.1:
              case 10:
                return "major"
              default:
               return "minor"
            }
          });
  },
  toggleQA: function(tmpl, isQA) {
    return tmpl.$('input,select,textarea').prop('disabled', isQA);
  },
  userCanEdit: function(tbl) {
    var i, user, userId;

    userId = Meteor.userId();

    if ((userId == null) || (tbl == null)) return false;
    if (Meteor.user() && Meteor.user().roles.indexOf("superuser") >= 0) return true;
    if (userId === tbl.user_id) return true;
    for (i = 0; i < tbl.user_roles.length; i++) {
      user = tbl.user_roles[i];
      if (userId === user.user_id && user.role !== "reviewers") return true;
    }
    return false;
  },
  initPopovers: function(tmpl, opts){
    opts = opts || {};
    _.extend(opts, {
      delay: {show: 500, hide: 100},
      trigger: "hover",
      placement: "auto"
    });
    $(tmpl.findAll('.helpPopovers')).popover(opts);
  },
  destroyPopovers: function(tmpl){
    $(tmpl.findAll('.helpPopovers')).popover('destroy');
  },
  initDraggables: function($el, handle, cls, opts){
    opts = opts || {};
    _.extend(opts, {
      handle: handle,
      onUpdate: clientShared.moveRowCheck,
      Cls: cls
    });
    return new Sortable($el, opts);
  },
  getPubMedDetails: function(pubmedID, cb) {
    var url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=" + pubmedID + "&rettype=docsum&retmode=xml";

    return HTTP.get(url, function(err, result) {
      var auth, authors, first, fullCitation, isError, journal_source, pmid, pubDate, second, shortCitation, so, title, xml, xmlDoc, year;

      // assume an error occurred by default
      fullCitation = "An error occurred.";
      shortCitation = "";
      isError = true;

      if (result) {
        xmlDoc = $.parseXML(result.content);
        xml = $(xmlDoc);

        err = xml.find("ERROR");
        if (err.length >= 1) {
          fullCitation = xml.find("ERROR").text();
        } else {
          // Parse XML for text, we use the AuthorList children to
          // filter for both "Author" and "CollectiveName" fields,
          // as an example see PMID 187847.
          authors = (function() {
            var i, len, ref1, results;
            ref1 = xml.find('Item[Name=AuthorList]').children();
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              auth = ref1[i];
              results.push(auth.innerHTML);
            }
            return results;
          })();
          title = xml.find("Item[Name=Title]").text();
          journal_source = xml.find("Item[Name=Source]").text();
          so = xml.find("Item[Name=SO]").text();
          pmid = xml.find("Id").text();
          year = pubDate = xml.find("Item[Name=PubDate]").text().substr(0, 4);

          // build short-citation
          first = authors[0].substr(0, authors[0].search(" "));
          shortCitation = first + " (" + year + ")";
          if (authors.length > 2) {
            shortCitation = first + " et al. (" + year + ")";
          } else if (authors.length === 2) {
            second = authors[1].substr(0, authors[1].search(" "));
            shortCitation = first + " and " + second + " (" + year + ")";
          }

          // build full-citation, using the PubMed Summary format, found here:
          // http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=#{pubmedID}&rettype=docsum&retmode=text
          fullCitation = ((authors.join(', ')) + ". " +
                           title + ". " +
                           journal_source + ". " +
                           so + ". PubMed PMID: " +
                           pmid + ".");
          isError = false;
        }
      }
      return cb({
        'shortCitation': shortCitation,
        'fullCitation': fullCitation,
        'isError': isError,
        'pubmedID': pubmedID
      });
    });
  }
}


// abstract template helpers
_.extend(clientShared, {
  abstractMainHelpers: {},
  abstractTblHelpers: {
    showNew: function() {
      return Session.get("evidenceShowNew");
    },
    isEditing: function() {
      return Session.equals('evidenceEditingId', this._id);
    },
    showRow: function(isHidden) {
      return Session.get('evidenceShowAll') || !isHidden;
    },
    object_list: function() {
      var key = Session.get('evidenceType');
      if (key != null) {
        var Collection = tblBuilderCollections.evidenceLookup[key].collection;
        return Collection.find({}, {sort: {sortIdx: 1}});
      }
    }
  },
  abstractRowHelpers: {
    getChildren: function() {
      var key = Session.get('evidenceType'),
          NestedCollection = tblBuilderCollections.evidenceLookup[key].nested_collection;
      return NestedCollection.find({parent_id: this._id}, {sort: {sortIdx: 1}});
    }
  },
  abstractRowEvents: {
    'click #show-edit': function(evt, tmpl) {
      Session.set("evidenceEditingId", this._id);
      Tracker.flush();
      clientShared.activateInput($("input[name=referenceID]")[0]);
    },
    'click #toggle-hidden': function(evt, tmpl) {
      var key = Session.get('evidenceType'),
          Collection = tblBuilderCollections.evidenceLookup[key].collection;
      Collection.update(this._id, {$set: {isHidden: !this.isHidden}});
    },
    'click .add-nested': createNewNestedModal,
    'click #move-content': function(evt, tmpl) {
      var div = document.getElementById('modalHolder'),
          key = Session.get('evidenceType');
      $(div).empty();
      Blaze.renderWithData(Template.moveModal, {content: this}, div);
    },
    'click #clone-content': function(evt, tmpl) {
      var ET = tblBuilderCollections.evidenceLookup[Session.get("evidenceType")];
      utilities.cloneObject(this, ET.collection, ET.nested_collection);
    }
  },
  abstractFormEvents: {
    'click #create-cancel': function(evt, tmpl) {
      Session.set("evidenceShowNew", false);
    },
    'click #update-cancel': function(evt, tmpl) {
      Session.set("evidenceEditingId", null);
    },
    'click #create': function(evt, tmpl) {
      var errorDiv, isValid,
          key = Session.get('evidenceType'),
          Collection = tblBuilderCollections.evidenceLookup[key].collection,
          obj = clientShared.newValues(tmpl.find('#mainForm')),
          createPreValidate = tmpl.view.template.__helpers[" createPreValidate"];

      _.extend(obj, {
        tbl_id: Session.get('Tbl')._id,
      });

      if (createPreValidate) obj = createPreValidate(tmpl, obj, this);
      isValid = Collection.simpleSchema().namedContext().validate(obj);
      if (isValid) {
        Collection.insert(obj);
        Session.set("evidenceShowNew", false);
      } else {
        errorDiv = clientShared.createErrorDiv(Collection.simpleSchema().namedContext());
        $(tmpl.find("#errors")).html(errorDiv);
      }
    },
    'click #update': function(evt, tmpl) {
      var errorDiv, fld, i, isValid, modifier, updatePreValidate,
          key = Session.get('evidenceType'),
          Collection = tblBuilderCollections.evidenceLookup[key].collection,
          vals = clientShared.updateValues(tmpl.find('#mainForm'), this),
          ref = tblBuilderCollections.evidenceLookup[key].requiredUpdateFields;
      for (i = 0; i < ref.length; i++) {
        fld = ref[i];
        vals[fld] = tmpl.find('select[name="' + fld + '"]').value;
      }
      updatePreValidate = tmpl.view.template.__helpers[" updatePreValidate"];
      if (updatePreValidate != null) vals = updatePreValidate(tmpl, vals, this);
      modifier = {$set: vals};
      isValid = Collection
          .simpleSchema()
          .namedContext()
          .validate(modifier, {modifier: true});
      if (isValid) {
        Collection.update(this._id, {$set: vals});
        (isCtrlClick(evt)) ? animateClick(evt.target) : Session.set("evidenceEditingId", false);
      } else {
        errorDiv = clientShared.createErrorDiv(Collection.simpleSchema().namedContext());
        $(tmpl.find("#errors")).html(errorDiv);
      }
    },
    'click #delete': function(evt, tmpl) {
      var key = Session.get('evidenceType'),
          Collection = tblBuilderCollections.evidenceLookup[key].collection;
      Collection.remove(this._id);
      Session.set("evidenceEditingId", null);
    },
    'click #setQA,#unsetQA': function(evt, tmpl) {
      var key = Session.get('evidenceType'),
          collection_name = tblBuilderCollections.evidenceLookup[key].collection_name;
      Meteor.call('adminToggleQAd', this._id, collection_name, function(err, response) {
        if (response) clientShared.toggleQA(tmpl, response.QAd);
      });
    },
    'click #addNestedResult': createNewNestedModal
  },
  abstractNestedTableHelpers: {
    showRow: function(isHidden) {
      return Session.get('evidenceShowAll') || !isHidden;
    }
  },
  abstractNestedTableEvents: {
    'click #inner-show-edit': function(evt, tmpl) {
      var div = document.getElementById('modalHolder'),
          key = Session.get('evidenceType'),
          NestedTemplate = tblBuilderCollections.evidenceLookup[key].nested_template;

      Session.set('nestedEvidenceEditingId', tmpl.data._id);
      return Blaze.renderWithData(NestedTemplate, {}, div);
    },
    'click #inner-toggle-hidden': function(evt, tmpl) {
      var key = Session.get('evidenceType'),
          NestedCollection = tblBuilderCollections.evidenceLookup[key].nested_collection,
          data = tmpl.view.parentView.dataVar.curValue;

      NestedCollection.update(data._id, {$set: {isHidden: !data.isHidden}});
    },
    'click #clone-nested-content': function(evt, tmpl) {
      var data = tmpl.view.parentView.dataVar.curValue,
          ET = tblBuilderCollections.evidenceLookup[Session.get("evidenceType")];
      return utilities.cloneObject(data, ET.nested_collection);
    }
  },
  abstractNestedFormHelpers: {
    isNew: function() {
      return Session.get('nestedEvidenceEditingId') === null;
    },
    getObject: function() {
      var initial = this,
          key = Session.get('evidenceType'),
          NestedCollection = tblBuilderCollections.evidenceLookup[key].nested_collection,
          existing = NestedCollection.findOne({_id: Session.get('nestedEvidenceEditingId')});
      return existing || initial;
    }
  },
  removeNestedFormModal: function(tmpl, options) {
    $('#modalDiv')
      .on('hide.bs.modal', function() {
        var key = Session.get('evidenceType'),
            NestedCollection = tblBuilderCollections.evidenceLookup[key].nested_collection;
        $(tmpl.view._domrange.members).remove();
        Blaze.remove(tmpl.view);
        if ((options != null) && (options.remove != null)) {
          NestedCollection.remove(options.remove);
        }
      }).modal('hide');
  },
  abstractNestedFormEvents: {
    'click #inner-create': function(evt, tmpl) {
      var errorDiv, isValid,
          key = Session.get('evidenceType'),
          NestedCollection = tblBuilderCollections.evidenceLookup[key].nested_collection,
          obj = clientShared.newValues(tmpl.find('#nestedModalForm'));

      _.extend(obj, {
        tbl_id: Session.get('Tbl')._id,
        parent_id: tmpl.data.parent._id,
        sortIdx: 1e10,
        isHidden: false
      });
      NestedCollection.preSaveHook(tmpl, obj);

      isValid = NestedCollection
          .simpleSchema()
          .namedContext()
          .validate(obj);

      if (isValid) {
        NestedCollection.insert(obj);
        clientShared.removeNestedFormModal(tmpl);
      } else {
        errorDiv = clientShared.createErrorDiv(NestedCollection.simpleSchema().namedContext());
        $(tmpl.find("#errors")).html(errorDiv);
      }
    },
    'click #inner-create-cancel': function(evt, tmpl) {
      clientShared.removeNestedFormModal(tmpl);
    },
    'click #inner-update': function(evt, tmpl) {
      var errorDiv, modifier, isValid,
          key = Session.get('evidenceType'),
          NestedCollection = tblBuilderCollections.evidenceLookup[key].nested_collection,
          vals = clientShared.updateValues(tmpl.find('#nestedModalForm'), this);

      NestedCollection.preSaveHook(tmpl, vals);

      modifier = {$set: vals},
      isValid = NestedCollection
          .simpleSchema()
          .namedContext()
          .validate(modifier, {modifier: true});

      if (isValid) {
        NestedCollection.update(this._id, modifier);
        if (isCtrlClick(evt)){
          animateClick(evt.target);
        } else {
          Session.set("nestedEvidenceEditingId", null);
          clientShared.removeNestedFormModal(tmpl);
        }
      } else {
        errorDiv = clientShared.createErrorDiv(NestedCollection.simpleSchema().namedContext());
        $(tmpl.find("#errors")).html(errorDiv);
      }
    },
    'click #inner-update-cancel': function(evt, tmpl) {
      Session.set("nestedEvidenceEditingId", null);
      clientShared.removeNestedFormModal(tmpl);
    },
    'click #inner-delete': function(evt, tmpl) {
      Session.set("nestedEvidenceEditingId", null);
      clientShared.removeNestedFormModal(tmpl, {"remove": this._id});
    },
    'click #setQA,#unsetQA': function(evt, tmpl) {
      var key = Session.get('evidenceType'),
          nested_collection_name = tblBuilderCollections.evidenceLookup[key].nested_collection_name;
      Meteor.call('adminToggleQAd', this._id, nested_collection_name, function(err, response) {
        if (response) clientShared.toggleQA(tmpl, response.QAd);
      });
    }
  }
});
