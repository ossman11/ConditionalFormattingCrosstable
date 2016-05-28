How to install:
All information for how to install SDKs into Design Studio can be found here: http://help.sap.com/bodesignstudio_re

What is possible:
This plugin allows design studio users to modify the css classes attached to native CrossTable Elements.
This is done through setting rules which are applied to the table when ever it is changed.

There are three types of rules (currently only 2 implemented) Row, Column and Cell rules.
Row and Column rules look at the header cells either for css classes or text content.
Cell Rules look at the Cell contents either to be positive or negative.

All the Styles are injected into native css allow everything css can do to work with this plugin.
The styles only work for the target crosstable and does not effect anything outside the table.

How does it work:
This plugin uses the ID from the CrossTable to attach a listener to the CrossTable holder element.
When ever the CrossTable changes the listener triggers and applys the rules to the CrossTable contents.
Because of how the CrossTable works the whole table is drawn everytime fully allowing this to work.
As plugins are not able to modify native components this plugin works as an outsider.