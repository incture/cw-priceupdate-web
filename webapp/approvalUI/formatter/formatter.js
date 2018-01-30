jQuery.sap.declare("approvalui.formatter.formatter");
approvalui.formatter.formatter = {
	
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
	
	formaValueState: function(evt){
		if(evt){
			return evt;
		}else{
			return "None";
		}
	},
	
	formatBooleanValues: function(evt){	
		var oBoolean = typeof(evt);
		if(oBoolean === "boolean"){
			return evt;
		}
		else if(oBoolean === "string"){
			if(evt === "true"){
				return true;
			}else{
				return false;
			}
		}
	},
	
	formatStatusValues: function(evt){
		if(evt === "Update Pending"){
			this.addStyleClass("pendingRecordsStyle");
			return evt;
		}else if(evt === "Approved"){
			this.addStyleClass("approveRecordsStyle");
			return evt;
		}else{
			this.addStyleClass("rejectRecordsStyle");
			return evt;
		}
	},
	
	formatMaxLength: function(evt){
		if(evt){
			return parseInt(evt);
		}
	},
	
		
	formatApprovalDateValues: function(evt){
		
		if(this.hasOwnProperty("mAggregations")){
			var sPath = this.getBindingContext("oAppDetModel").getPath();
			var oModel = this.getBindingContext("oAppDetModel").getModel();
			var currentObj = oModel.getProperty(sPath);
			if(evt){
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "MM/dd/yyyy"});
				var oDate = oDateFormat.format(new Date(evt));
				var dateToService = approvalui.formatter.formatter.formatDateToService(oDate);
				currentObj.fieldValueNew = evt;
				return oDate;
			}else{
				currentObj.fieldValueNew = "";
				return "";
			}
		}else{
			return evt;
		}
	},
	
	formatDateToService: function(date){
		var mm = date.split("/")[0];
		var dd = date.split("/")[1];
		var yy = date.split("/")[2];
		var oFormatteDt = yy + "-" + mm + "-" + dd + " 00:00:00.0";
		return oFormatteDt;
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
	
	setSearchParams: function(fieldValue, fieldId, oAdvanceSearchModel){
		
		var oSearchArray = oAdvanceSearchModel.getData().searchpanel;
		oSearchArray.filter(function(obj, i, arr){
			if(obj.fieldId === fieldId){
				obj.fieldValue = fieldValue;
			}
		});
	},
	
	setBusinessContextParams:function(fieldValueNew,fieldId,oBusinessContextModel){	
		var oContextArray = oBusinessContextModel.getData().businessObjectList;
		for(var k in oContextArray){
			if(oContextArray[k].boList.fieldId === fieldId){
			oContextArray[k].boList.fieldValueNew =fieldValueNew;	
		}
		}
	},
	
	onTableFilter: function(oEvent, oTable, oBindingPaths){
    	
    	var aFilters = [];
    	var sQuery = "";
    	if (oEvent) {
    		sQuery = oEvent.getSource().getValue();
    	}
        var filterArry = [];
        if (sQuery && sQuery.length > 0) {
        		for ( var i = 0; i < oBindingPaths.length; i++) {
        			var bindingName = oBindingPaths[i];
        			filterArry.push(new sap.ui.model.Filter(bindingName, sap.ui.model.FilterOperator.Contains, sQuery));
        		}
    			
          var filter = new sap.ui.model.Filter(filterArry, false);
          aFilters.push(filter);
        }
      
        var binding = oTable.getBinding("items");
        binding.filter(aFilters, "Application");
    },
    
    formatPageNumber: function(evt){
		if(evt){
			return "Page : " + evt;
		}
	},
	
	commentIconChang:function(val){
		
		var oAppDetModel = this.getModel("oAppDetModel");
		var sPath = this.getBindingContext("oAppDetModel").sPath;
		var data = oAppDetModel.getProperty(sPath);
		var value = data.commentList;
		var count= 0;
		if(!Array.isArray(value)){
			var oTempArry = [];
			oTempArry.push(value);
			value = oTempArry;
		}
		value.filter(function(obj, i, arr){
			if(obj.fieldId === "REQUESTER_COMMENTS" || obj.fieldId === "APPROVER_COMMENTS"){
				if(obj.fieldValue ===  ""){
					return;
				}
				else{
					count++;
				}
			}
		});
		if(count === 0){
			return "sap-icon://post";
		}else{
			return "sap-icon://comment";
		}
	},
	
	formatColumnWidth: function(label){
		if(label === ""){
			this.getParent().setWidth("2rem");
		}
		if(label === "Material Number"){
			this.getParent().setWidth("9rem");
		}
		return label;
	},
	
	setColorMode:function(val){
		if(val === "CREATED"){
			this.addStyleClass("colorforCreted");
			return true;
		}else if(val === "CHANGE"){
			this.addStyleClass("colorforChanged");
			return true;
		}else if(val === "IMPACTED"){
			this.addStyleClass("colorforImpacted");
			return true;
		}else if(val === "DELETED"){
			this.addStyleClass("colorforDeleted");
			return true;
		}else {
			this.addStyleClass("colorforOthers");
			return true;
		}
	},
};