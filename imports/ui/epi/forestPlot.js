import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import d3 from 'd3';

import './forestPlot.html';


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
