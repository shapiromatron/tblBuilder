import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';

import d3 from 'd3';

import './forestPlot.html';

import {
    closeModal,
} from '/imports/api/client/utilities';


// global settings
Session.setDefault('epiForestPlotMin', 0.05);
Session.setDefault('epiForestPlotMax', 50);


Template.forestPlot.events({
    'rerender svg': function(evt, tmpl){
        var data = tmpl.data.parent.riskEstimates[tmpl.data.index],
            svg = d3.select(tmpl.find('svg')).html(null),
            width = parseInt(svg.node().getBoundingClientRect().width),
            height = parseInt(svg.node().getBoundingClientRect().height),
            xscale = d3.scale.log()
                .range([0, width])
                .domain([Session.get('epiForestPlotMin'), Session.get('epiForestPlotMax')])
                .clamp(true),
            yscale = d3.scale.linear().range([0, height]).domain([0, 1]).clamp(true),
            group = svg.append('g').attr('class', 'riskBar'),
            riskStr = `Effect measure ${tmpl.data.parent.effectMeasure}: ${data.riskMid}`;

        if (data.riskLow && data.riskHigh){
            riskStr += ` (${data.riskLow}-${data.riskHigh})`;
        }

        svg.attr('viewBox', `0 0 ${width} ${height}`);
        group.append('svg:title').text(riskStr);

        if (data.riskMid != null) {
            group.selectAll()
                .data([data])
                .enter()
                .append('circle')
                .attr('cx', function(d, i) {return xscale(d.riskMid);})
                .attr('cy', function(d, i) {return yscale(0.5);})
                .attr('r', 5);
        }

        if ((data.riskLow != null) && (data.riskHigh != null)) {
            group.selectAll()
                .data([data])
                .enter()
                .append('line')
                .attr('x1', function(d, i) {return xscale(d.riskLow);})
                .attr('x2', function(d, i) {return xscale(d.riskHigh);})
                .attr('y1', yscale(0.5))
                .attr('y2', yscale(0.5));

            group.selectAll()
                .data([data])
                .enter()
                .append('line')
                .attr('x1', function(d, i) {return xscale(d.riskHigh);})
                .attr('x2', function(d, i) {return xscale(d.riskHigh);})
                .attr('y1', yscale(0.25))
                .attr('y2', yscale(0.75));

            group.selectAll()
                .data([data])
                .enter()
                .append('line')
                .attr('x1', function(d, i) {return xscale(d.riskLow);})
                .attr('x2', function(d, i) {return xscale(d.riskLow);})
                .attr('y1', yscale(0.25))
                .attr('y2', yscale(0.75));
        }
    },
});
Template.forestPlot.onRendered(function() {
    this.$('svg').trigger('rerender');
});



Template.forestAxisModal.helpers({
    getMin: function(){
        return Session.get('epiForestPlotMin');
    },
    getMax: function(){
        return Session.get('epiForestPlotMax');
    },
    hasError: function(){
        return Template.instance().err.get().length>0;
    },
    getError: function(){
        return Template.instance().err.get();
    },
});
Template.forestAxisModal.events({
    'click #update': function(evt, tmpl){
        var min = parseFloat(tmpl.$('input[name="min"]').val(), 10),
            max = parseFloat(tmpl.$('input[name="max"]').val(), 10);
        if (min>0 && max>0 && max>min){
            Session.set('epiForestPlotMin', min);
            Session.set('epiForestPlotMax', max);
            toggleRiskPlot();
            $('.epiRiskPlot').trigger('rerender');
            closeModal(evt, tmpl);
        } else {
            tmpl.err.set('Values must be greater than 0, and min<max.');
        }
    },
    'click #cancel': closeModal,
});
Template.forestAxisModal.onCreated(function() {
    this.err = new ReactiveVar('');
});
Template.forestAxisModal.onRendered(function() {
    $('#modalDiv').modal('toggle');
});


let toggleRiskPlot = function() {
    d3.select('.epiRiskAxes').remove();
    if (!Session.get('epiRiskShowPlots')) return;
    Tracker.flush();

    var header = $('.riskTR'),
        tbl = $('.evidenceTable'),
        tbl_pos = tbl.position(),
        header_pos = header.position(),
        y_top = tbl_pos.top + header.outerHeight(),
        x_left = header_pos.left,
        width = header.width(),
        height = tbl.height() - header.height(),
        xPlotBuffer = 0,   // make room for the text
        yPlotBuffer = 20,  // make room for x-axis
        xscale = d3.scale.log()
            .range([0, width])
            .domain([Session.get('epiForestPlotMin'), Session.get('epiForestPlotMax')])
            .clamp(true),
        yscale = d3.scale.linear()
            .range([0, height - yPlotBuffer])
            .domain([0, 1])
            .clamp(true),
        xaxis = d3.svg.axis()
            .scale(xscale)
            .orient('bottom')
            .ticks(0, d3.format(',.f')),
        gridLineClass = (v) => {
            switch (v){
            case 1:
                return 'baseline';
            case 0.001:
            case 0.01:
            case 0.1:
            case 10:
            case 100:
            case 1000:
                return 'major';
            default:
                return 'minor';
            }
        },
        svg, gridlines;

    svg = d3.select('.container')
        .insert('svg', '#epiCohortTbl')
        .attr('class', 'epiRiskAxes')
        .attr('height', height + yPlotBuffer)
        .attr('width', width + 2 * xPlotBuffer)
        .style({
            top: `${parseInt(y_top)}px`,
            left: `${parseInt(x_left - xPlotBuffer)}px`,
        });

    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(${xPlotBuffer}, ${height - yPlotBuffer})`)
        .call(xaxis);

    gridlines = svg.append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${xPlotBuffer},0)`);

    gridlines.selectAll('gridlines')
        .data(xscale.ticks(10))
        .enter()
          .append('svg:line')
          .attr('x1', (v) => xscale(v))
          .attr('x2', (v) => xscale(v))
          .attr('y1', yscale(0))
          .attr('y2', yscale(1))
          .attr('class', gridLineClass);
};

export { toggleRiskPlot };
