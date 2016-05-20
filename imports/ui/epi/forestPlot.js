import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { Template } from 'meteor/templating';

import d3 from 'd3';

import './forestPlot.html';

import {
    closeModal,
} from '/imports/api/client/utilities';


// global settings
Session.setDefault('epiForestPlotMin', 0.05);
Session.setDefault('epiForestPlotMax', 50);
Session.setDefault('epiForestPlotWidth', 100);


Template.forestPlotAxis.events({
    'rerender svg': function(evt, tmpl){
        tmpl.$('.epiRiskAxes').empty();
        var header = $('.riskTR'),
            tbl = $('.evidenceTable'),
            tbl_pos = tbl.position(),
            header_pos = header.position(),
            y_top = tbl_pos.top + header.outerHeight(),
            x_left = header_pos.left,
            width = parseInt($('.riskTR').outerWidth()),
            yPlotBuffer = 25,  // make room for x-axis
            height = tbl.outerHeight() - tbl.find('thead').outerHeight() + yPlotBuffer,
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

        svg = d3.select('.epiRiskAxes')
            .attr('class', 'epiRiskAxes')
            .attr('height', height)
            .attr('width', width)
            .style({
                left: `${parseInt(x_left)}px`,
                top: `${parseInt(y_top)}px`,
            });

        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${height-yPlotBuffer})`)
            .call(xaxis);

        gridlines = svg.append('g')
            .attr('class', 'gridlines');

        gridlines.selectAll('gridlines')
            .data(xscale.ticks(10))
            .enter()
              .append('svg:line')
              .attr('x1', (v) => xscale(v))
              .attr('x2', (v) => xscale(v))
              .attr('y1', yscale(0))
              .attr('y2', yscale(1))
              .attr('class', gridLineClass);

        Session.set('epiForestPlotWidth', width);

    },
});
Template.forestPlotAxis.onRendered(function() {
    // add for reactivity when changed
    Tracker.autorun(()=>{
        let xMin = Session.get('epiForestPlotMin'),
            yMin = Session.get('epiForestPlotMax');
        this.$('svg').trigger('rerender');
    });
});


Template.forestPlot.events({
    'rerender svg': function(evt, tmpl){
        var td = $(evt.target).parent(),
            data = tmpl.data.parent.riskEstimates[tmpl.data.index],
            svg = d3.select(tmpl.find('svg')).html(null),
            width = Session.get('epiForestPlotWidth'),
            height = Math.min(parseInt(td.height()), 20),
            left = $('.riskTR').position().left,
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

        svg
            .attr('width', width)
            .attr('height', height)
            .style({
                left: `${parseInt(left)}px`,
                top: `${parseInt(td.position().top)}px`,
            });
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
    // add for reactivity when changed
    Tracker.autorun(()=>{
        let xMin = Session.get('epiForestPlotMin'),
            yMin = Session.get('epiForestPlotMax'),
            width = Session.get('epiForestPlotWidth');
        this.$('svg').trigger('rerender');
    });
});
let rerenderAxis = function(){
    Tracker.flush();
    Tracker.afterFlush(function(){
        $('.epiRiskAxes').trigger('rerender');
    });
};


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


export { rerenderAxis };
