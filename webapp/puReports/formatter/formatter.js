jQuery.sap.declare("PU_Reports.formatter.formatter");
PU_Reports.formatter.formatter = {
	formatBooleanValues: function(evt) {
		var oBoolean = typeof(evt);
		if (oBoolean === "boolean") {
			return evt;
		} else if (oBoolean === "string") {
			if (evt === "true") {
				return true;
			} else {
				return false;
			}
		}
	},
	
	onSAPEnter: function(inputField, controller){
		var that = this;
		inputField.onsapenter=(function(oEvent) {
			if(navigator.onLine){
				sap.m.InputBase.prototype.onsapenter.apply(inputField,arguments);
				controller.onSearch();
			}else{
				setTimeout(function(){
					inputField.focus();
				}, 1200);
			}
		}).bind(that);	
	},
	
	
	formatMaxLength: function(evt) {
		if (evt) {
			return parseInt(evt);
		}
	},
	toastMessage: function(message){
		sap.m.MessageToast.show(message, {
	        duration: 1000, 
	        width: "20em",
	        my: "center center", 
	        at: "center center",
	        of: window, 
	        offset: "0 0", 
	        onClose: null,
	        collision: "fit fit", 
	        autoClose: true,
	        animationTimingFunction: "ease", 
	        animationDuration: 1000,
	        closeOnBrowserNavigation: true 
	    });
	},
	formatTooltipInterval : function(key){
		if(key === "Weekly"){
			return "Date";
		}
		else if(key === "Monthly"){
			return "Interval";
		}
		else {
			return "Month";
		}
	},

	formatMonthfirst: function(evt) {
		var mm = evt.split("-")[1];
		return mm;
	},
	formatDatefirst: function(evt) {
		var dd = evt.split("-")[0];
		return dd;
	},
	formatYearfirst: function(evt) {
		var yy = evt.split("-")[2];
		return yy;
	}
	
};