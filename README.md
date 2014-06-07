# IARC table builder

Building evidence tables to justify decisions for human-health decisions can be
cumbersome, and often times the data which are entered in these tables can be
reused for subsequent analyses. However, the tables impose certain formatting
conventions for consiseness in the table.

This application attempts to create a simple web-application for adding data to 
a table, and will allow for customized Excel reports for downloading the data
in both formatted-tables and raw-tabular format which is more amenable for
statistical modeling.

## Technical specifics

This application is written using the Meteor javascript framework. The
atmosphere.js package was also used to add additional packages which were not
available in the core meteor package.

To deploy, instructions can be followed from (meteor)[http://docs.meteor.com].
