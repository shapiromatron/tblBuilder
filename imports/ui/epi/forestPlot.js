import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { Template } from 'meteor/templating';

import _ from 'underscore';
import d3 from 'd3';

import './forestPlot.html';

import {
    closeModal,
} from '/imports/api/client/utilities';


// global settings
Session.setDefault('epiForestPlotMin', 0.05);
Session.setDefault('epiForestPlotMax', 50);


Template.forestPlotAxis.events({
    'rerender svg': function(evt, tmpl){
        if (!Session.get('epiRiskShowPlots')) return;
        tmpl.$('.epiRiskAxes').empty().hide();
        var header = $('.riskTR'),
            tbl = $('.evidenceTable'),
            tbl_pos = tbl.position(),
            header_pos = header.position(),
            y_top = tbl_pos.top + header.outerHeight(),
            x_left = header_pos.left,
            width = parseInt($('.riskTR').width()),
            yPlotBuffer = 25,  // make room for x-axis
            height = tbl.outerHeight() - tbl.find('thead').outerHeight() + yPlotBuffer,
            xscale = d3.scale.log()
                .range([0, width])
                .domain([Session.get('epiForestPlotMin'), Session.get('epiForestPlotMax')])
                .clamp(true),
            yscale = d3.scale.linear()
                .range([0, height - yPlotBuffer])
                .domain([0, height - yPlotBuffer])
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
            getData = function() {
                return $('.fpData').map(function(){
                    let d2 = this.dataset,
                        title = `Effect measure ${d2.measure}: ${d2.mid}`;

                    if (d2.low && d2.high){
                        title += ` (${d2.low}-${d2.high})`;
                    }

                    return _.extend({}, d2, {
                        ymid: this.getBoundingClientRect().top + 20 - y_top,
                        showCircle: _.isFinite(d2.mid),
                        showLine: (_.isFinite(d2.low) && _.isFinite(d2.high)),
                        title,
                    });
                });
            },
            data = getData(),
            svg, gridlines, groups;

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
              .attr('y1', yscale.domain()[0])
              .attr('y2', yscale.domain()[1])
              .attr('class', gridLineClass);

        groups = svg
            .selectAll('.fp')
            .data(data)
            .enter()
            .append('g')
                .attr('class', 'fp');

        groups.append('title')
            .text((d) => d.title);

        groups
            .filter((d) => d.showCircle)
            .append('circle')
            .attr('cx', (d) => xscale(d.mid))
            .attr('cy', (d) => yscale(d.ymid))
            .attr('r', 5);

        groups
            .filter((d) => d.showLine)
            .append('line')
            .attr('x1', (d) => xscale(d.low))
            .attr('x2', (d) => xscale(d.high))
            .attr('y1', (d) => yscale(d.ymid))
            .attr('y2', (d) => yscale(d.ymid));

        groups
            .filter((d) => d.showLine)
            .append('line')
            .attr('x1', (d) => xscale(d.low))
            .attr('x2', (d) => xscale(d.low))
            .attr('y1', (d) => yscale(d.ymid-8))
            .attr('y2', (d) => yscale(d.ymid+8));

        groups
            .filter((d) => d.showLine)
            .append('line')
            .attr('x1', (d) => xscale(d.high))
            .attr('x2', (d) => xscale(d.high))
            .attr('y1', (d) => yscale(d.ymid-8))
            .attr('y2', (d) => yscale(d.ymid+8));
        tmpl.$('.epiRiskAxes').fadeIn();
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

// create a hook to re-render
let rerenderAxis = function(){
    Tracker.afterFlush(() => $('.epiRiskAxes').trigger('rerender'));
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
