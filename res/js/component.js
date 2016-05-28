define(["sap/designstudio/sdk/component", "css!../css/component.css"], function(Component, css) {
	Component.subclass("com.bob.tools.CrossTableDesign", function() {

		var that = this;
		
		var StandardRules = '{"ROW":[],"STYLE":{}}';
			
		// '{"ROW":[{"type":"class","search":".sapzencrosstab-CollapseNode","styleName":"DARKGREYROW"},{"type":"class","search":".sapzencrosstab-ExpandNode","styleName":"DARKGREYROW"},{"type":"text","search":"Umsatz","styleName":"BLACKROW"}],"STYLE":{"DARKGREYROW":{"background-color":"rgb(200,200,200)"},"BLACKROW":{"display":"none"},"BLACKROW .sapzencrosstab-CollapseNode":{"opacity":"0"},"BLACKROW .sapzencrosstab-ExpandNode":{"opacity":"0"},"DARKGREYROW.BLACKROW":{"display":"table-row","background-color":"rgb(100,100,100)"}}}';

		this.init = function() {
			// init stuffz
			// create a custom style sheet
			this.customStyle = document.createElement("style");
			this.customStyle.type = "text/css";
			this.customStyle.innerHTML = "";
			document.getElementsByTagName("head")[0].appendChild(this.customStyle);
			// create observer to apply the rules to the table
			this.observer = new MutationObserver(this.ApplyRules);
			// set the target table to undefined at the start.
			this.TARGET = undefined;
			this.RULES = {};
			// Set the rules to the default rules to prevent crashes
			this.rules(StandardRules);
			this.sync();
		};
		// wait to be rendered
		this.sync = function(){
			if(that.CountRows() > 0){
				that.ApplyRules();
			} else {
				var t = setTimeout(that.sync,10);
			}
		}
		// get/set target variable
		this.target = function(value){
			if(value === undefined){
				return this.TARGET;
			} else {
				// remove old target from the observer
				this.observeSTOP(this.TARGET);
				// set new target and keep an eye on it
				this.TARGET = value;
				this.ready = false;
				this.observe(value);
				this.LoadStyles();
				
				this.ApplyRules();
			}
		}
		// get/set rule string
		this.rules = function(value){
			if(value === undefined || value === ""){
				return JSON.stringify(this.RULES);
			} else {				
				this.rulesOriginal = value;
				this.RULES = JSON.parse(value);
				this.LoadStyles();
				
				this.ApplyRules();
			}
		}
		// add the parent of the targeted table into the observer
		this.observe = function(value){
			this.observer.observe(
					document.getElementById(value).parentElement,
					{ attributes: true, childList: true, characterData: true }
			);
		}
		// remove the parent of the old target from the observer
		this.observeSTOP = function(value){
			if(value === undefined){return;}
			this.observer.disconnect(document.getElementById(value).parentElement);
		}
		// Converts all styles from the rules into the stylesheet
		this.LoadStyles = function(){
			var tmp = "";
			$.each(this.RULES["STYLE"], function(i,val) {
				if(i === undefined || val === undefined){return;}
				var main = " #"+ that.TARGET +" ."+i+"{";
				var children = " #"+ that.TARGET +" ."+i+" *{";
				$.each(val, function(j,val) {
					main += j+":"+val+" !important;";
					if(j.indexOf("background") > -1 || j.indexOf("color") > -1){
						children += j+":inherit !important;";
					}
				});
				main += "}";children += "}";
				tmp += main;tmp += children;
			});
			this.customStyle.innerHTML = tmp;
		}
		// applies all the rules onto the target table
		this.ApplyRules = function(){
			var rowcount = that.CountRows();
			if(that.RULES["ROW"] && that.RULES["ROW"].length > 0 || true)
			{
				var rules = that.RULES["ROW"];
				var step = 0;
				var rowHeight = that.RowHeight(0);
				for(var i=0;i<rowcount;i+=rowHeight){
					// Check row rules and apply their styles to the rows that match
					for(var j=0;j<rules.length;j++){
						var R = rules[j];
						if(that.SearchRow(i,R["type"],R["search"])){
							that.RowClass(i,R["styleName"]);
						}
					}
					// Give all the rows odd and even classes
					if(step%2 == 0){
						that.RowClass(i,"EVENROW");
					} else {
						that.RowClass(i,"ODDROW");
					}
					// check the current row height to skip sub rows
					rowHeight = that.RowHeight(i);
					// Keep track of the amount of actual rows processed
					step++;
				}
			}
			if(that.RULES["CELL"] && that.RULES["CELL"].length > 0 || true){
				var cells = that.SelectAllCells();
				var rules = that.RULES["CELL"];
				cells.each(function( index ){
					var cell = $(this);
					for(var j=0;j<rules.length;j++){
						var R = rules[j];
						if(that.SearchCell(cell, R["type"])){
							that.CellClass(cell, R["styleName"]);
						}
					}
				});
			}
		}
		// get row count
		this.CountRows = function(){
			return $("#"+ that.TARGET +"_rowHeaderArea").children().children().length;
		}
		// Select a row [header,data]
		this.SelectRow = function(nr){
			var header = $("#"+ that.TARGET +"_rowHeaderArea").children().children()[nr];
			var row = $("#"+ that.TARGET +"_dataArea").children().children()[nr];
			return [$(header),$(row)];
		}
		// Select all data cells
		this.SelectAllCells = function(){
			return $("#"+ that.TARGET +" td.sapzencrosstab-DataCellDefault");
		}
		// Get the row size
		this.RowHeight = function(nr){
			var row = this.SelectRow(nr);
			
			var ret = 1;
			row[0].children().each(function( index ){
				var h = parseInt($(this).attr("rowspan"));
				if(h && h>ret){ret = h;}
			});
			return ret;
		}
		// apply a class to a row
		this.RowClass = function(nr,className){
			var row = this.SelectRow(nr);
			
			var none = (row[0].css("display") == "none");
			
			var rowHeight = this.RowHeight(nr);
			if(rowHeight > 1){
				for(var i=1;i<rowHeight;i++){
					this.RowClass(nr+i,className);
				}
			}
			
			row[0].addClass(className);
			row[1].addClass(className);
			
			var NONE = (row[0].css("display") == "none");
			
			if(none != NONE){
				if(NONE){
					this.SetTargetHeight(row[0].height() * -1);
				} else {
					this.SetTargetHeight(row[0].height() );
				}
			}
		}
		// apply a class to a cell
		this.CellClass = function(cell, className){
			cell.addClass(className);
		}
		// Sets the height of the target table
		this.SetTargetHeight = function(val){
			var sizeDIV = $("#"+this.TARGET+"_altRenderModeTableDiv");
			sizeDIV.height(sizeDIV.height() + val);
		}
		// Searches the row header for certain conditions
		this.SearchRow = function(nr,type,target){
			var row = this.SelectRow(nr);
			if(type == "class"){
				if(row[0].find(target).length > 0){
					return true;
				}
			}
			if(type == "text"){
				if(row[0].text().indexOf(target) > -1){
					return true;
				}
			}
			if(type == "compare"){
				
			}
			return false;
		}
		
		this.SearchCell = function(cell, type){
			var nr = parseInt(cell.text());
			if(type == "positive"){
				if(nr > 0){return true;}
			}
			if(type == "negative"){
				if(nr < 0){return true;}
			}
			return false;
		}
	});	
});
    
