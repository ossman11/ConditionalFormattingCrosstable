sap.designstudio.sdk.PropertyPage.subclass("com.bob.tools.CrossTableDesignPropertyPage",  function() {
	
	var ROWRULE = '<div class="Rule">' +
		'<input class="Type" list="RowRuleTypes" placeholder="Type"/>' +
		'<input class="StyleName" list="CustomStyles" placeholder="Style name" />' +
		'<input class="Search" placeholder="Search" />' +
		'<div class="Remove" ></div>' +
		'</div>';
	var CELLRULE = '<div class="Rule">' +
			'<input class="Type" list="CellRuleTypes" placeholder="Type"/>' +
			'<input class="StyleName" list="CustomStyles" placeholder="Style name" />' +
			'<div class="Remove"></div>' +
			'</div>';
	var STYLERULE = '<div class="Rule">' +
			'<input class="StyleName" placeholder="StyleName"/>'+
			'<div class="Remove">'+
			'</div><div class="Add Small Property"></div>' +
			'</div>';
			
	var STYLEPROPERTY = '<div class="Property"><input class="Prop" placeholder="CSS" />'+
		':<input class="Val" placeholder="value" /><div class="Remove"></div></div>';
	
	var removeRule = function(){
		$(this).parent().remove();
		that.firePropertiesChanged(["rules"]);
	}
	
	var addRule = function(){
		var ruleholder = $(this).parent();	
		var rules = ruleholder.find(".Rules");

		if(ruleholder.hasClass("Row")){
			rules.append($(ROWRULE));
		} else if(ruleholder.hasClass("Cell")){
			rules.append($(CELLRULE));
		} else if(ruleholder.hasClass("Style")){
			rules.append($(STYLERULE));
		}
		updateHandlers();
	}
	
	var addProp = function(){		
		var parentStyle = $(this).parent();
		parentStyle.append($(STYLEPROPERTY));
		updateHandlers();
	}
	
	var updateHandlers = function(){
		$(".Add").unbind( "click" );
		$(".Remove").unbind( "click" );
		
		$(".Add.Rule").click(addRule);
		$(".Add.Property").click(addProp);
		$(".Remove").click(removeRule);
	}
	
	var that = this;
	
	this.init = function() {
		$("#form").submit(function() {
			that.firePropertiesChanged(["rules"]);
			return false;
		});
	};
	
	// get/set rule string
	this.rules = function(value){
		if(value === undefined){	
			return this.getRules();
		} else {
			if(value === ""){value = '{"ROW":[],"CELL":[],"COLUMN":[],"STYLE":{}}';}
			var r = jQuery.parseJSON(value);
			// TODO convert the old rules into UI
			this.setRules(r);
			return this;
		}
	}
	
	this.getRules = function(){
		var ret = {"ROW":[],"CELL":[],"COLUMN":[],"STYLE":{}};
		var rowRules = $(".RuleHolder.Row .Rule");

		rowRules.each(function(index){
			var E = $(this);
			var tmp = {"type":E.find(".Type").val(),
				"styleName":E.find(".StyleName").val(),
				"search":E.find(".Search").val()};
			ret["ROW"][ret["ROW"].length] = tmp;
		});
		
		var cellRules = $(".RuleHolder.Cell .Rule");

		cellRules.each(function(index){
			var E = $(this);
			var tmp = {"type":E.find(".Type").val(),
				"styleName":E.find(".StyleName").val()};
			ret["CELL"][ret["CELL"].length] = tmp;
		});
		
		var styleRules = $(".RuleHolder.Style .Rule");
		
		styleRules.each(function(index){
			var E = $(this);
			var Name = E.find(".StyleName").val();
			
			var properties = E.find(".Property");
			var tmp = {};
			properties.each(function(index){
				var D = $(this);
				tmp[D.find(".Prop").val()] = D.find(".Val").val();
			});
			ret["STYLE"][Name] = tmp;
		});
		
		return JSON.stringify(ret);
	}
	
	this.setRules = function(rules){
		var rowRules = rules["ROW"];
		var rowHolder = $(".RuleHolder.Row .Rules");
		rowHolder.empty();
		for(var i=0; i<rowRules.length;i++){
			var R = rowRules[i];
			var newRule = $(ROWRULE);
			newRule.find(".Type").val(R["type"]);
			newRule.find(".StyleName").val(R["styleName"]);
			newRule.find(".Search").val(R["search"]);
			
			rowHolder.append(newRule);
		}
		
		var cellRules = rules["CELL"];
		var cellHolder = $(".RuleHolder.Cell .Rules");
		cellHolder.empty();
		for(var i=0; i<cellRules.length;i++){
			var R = cellRules[i];
			var newRule = $(CELLRULE);
			newRule.find(".Type").val(R["type"]);
			newRule.find(".StyleName").val(R["styleName"]);
			
			cellHolder.append(newRule);
		}
		
		var styleRules = rules["STYLE"];
		var styleHolder = $(".RuleHolder.Style .Rules");
		styleHolder.empty();
		jQuery.each( styleRules, function( i, val ) {
			var newRule = $(STYLERULE);
			newRule.find(".StyleName").val(i);
			
			jQuery.each( val, function(j,value){
				var newProp = $(STYLEPROPERTY);
				
				newProp.find(".Prop").val(j);
				newProp.find(".Val").val(value);
				
				newRule.append(newProp);
			});
			
			styleHolder.append(newRule);
		});
		updateHandlers();
	}
});