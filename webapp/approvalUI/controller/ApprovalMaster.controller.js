sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/BusyDialog",
    "approvalui/formatter/formatter"
    ], function(Controller, BusyDialog,formatter) {
	"use strict";
	return Controller.extend("approvalui.controller.ApprovalMaster", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf price_update.Price_Update
*/
	onInit: function() {
		
		var that = this;
		this.busy = new BusyDialog();
		this.oHeader = { "Accept": "application/json", "Content-Type": "application/json" };
		this.setViewModel();
	},
	
	setViewModel: function(oEvent) {
		
		var that = this;
		var oMasterPanelModel = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oMasterPanelModel, "oMasterPanelModel");
		this.oMasterPanelModel = oMasterPanelModel;
		
		var oApprovalMatSectionModel = sap.ui.getCore().getModel("oApprovalMatSectionModel");
		this.oApprovalMatSectionModel = oApprovalMatSectionModel;
		
		var oApprovalBusinessContextModel = sap.ui.getCore().getModel("oApprovalBusinessContextModel");
        this.oApprovalBusinessContextModel = oApprovalBusinessContextModel;
        
        this.isActive = "Active";
		this.isChanged = "ALL";
		this.pIndex = 0;
		this.requestId ="";
			// var contextModel = this.getOwnerComponent().getModel("contextData");
			// this.requestId = contextModel.getData().requestId;
			// if(this.requestId)
			// {
			// 		this.getMasterPanelData(this.requestId);	
			// }
			
        this.getRequestId();
	},
	
	getRequestId : function(){
		
		var that = this;
		var requestId = jQuery.sap.getUriParameters().mParams.requestId[0]; 
		// var that = this;
		// var taskId = jQuery.sap.getUriParameters().mParams.taskId[0]; 
			// var oContextModel = new sap.ui.model.json.JSONModel();
			// oContextModel.loadData("/destination/bpmworkflowruntime/rest/v1/task-instances/" + taskId + "/context", null, false, "GET", true);
			// oContextModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			// this.getView().setModel(oContextModel, "contextData");
		this.requestId = requestId;
			this.getMasterPanelData(this.requestId);	
		
		// var sUrl = "/oneapp/cwpu/record/requestId/" +taskId;
		// var oModel = new sap.ui.model.json.JSONModel();
		// oModel.loadData(sUrl, "", true, "GET", false, false, that.oHeader );
		// oModel.attachRequestCompleted(function(oEvent) {
		// 	if (oEvent.getParameter("success")) {
		// 		var resultData = oModel.getData();
		// 		if(resultData){
		// 			that.requestId = resultData.requestId;
		// 			that.getMasterPanelData(that.requestId);	
		// 		}
		// 	}else{
		// 		var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
		// 		formatter.toastMessage(errorText);
		// 	}
		// });
		// oModel.attachRequestFailed(function(oEvent) {
		// 	var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
	 //       formatter.toastMessage(errorText);
		// });
	},
	
	getMasterPanelData:function(requestId){
		
		// var sRootPath = jQuery.sap.getModulePath("approvalui");
// var sResourcePath = sRootPath + "/css/style.css";
		var that=this;
		var oMasterPanelModel=this.oMasterPanelModel;
		var sUrl = "/pricemaintainencerest/approver/sidepanel/"+requestId;
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.loadData(sUrl, "", true, "GET", false, false, that.oHeader );
		oModel.attachRequestCompleted(function(oEvent) {
			if (oEvent.getParameter("success")) {
				var resultData = oModel.getData();
				if(resultData){
					var data=resultData.approverSidePanel;
					if (!Array.isArray(data)) {
						var tempArry = [];
						tempArry.push(data);
						resultData.approverSidePanel = tempArry;
					}
				oMasterPanelModel.setData(resultData);
				oMasterPanelModel.refresh();
				that.setPayloadData(that.isActive,that.isChanged,requestId);
				that.setMasterPanelData();
				that.attachEventMethod();
				}
			}else{
				var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
				formatter.toastMessage(errorText);
			}
		});
		oModel.attachRequestFailed(function(oEvent) {
			var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
	        formatter.toastMessage(errorText);
		});
	},
	
	setMasterPanelData:function(){
		
		var that = this;
		var oMasterVBox = this.getView().byId("MASTER_PANEL_BOX");
		oMasterVBox.bindAggregation("items", "oMasterPanelModel>/approverSidePanel", function(index, context){
			var contextPath = context.getPath();
			var oMasterPanelModel = context.getModel();
			var bindingPath = "oMasterPanelModel>" + contextPath;
			
			var sKeyPath = "oMasterPanelModel>" + contextPath + "/metadata";
			var currentObj = oMasterPanelModel.getProperty(contextPath);
			var hasMetaData = currentObj.hasOwnProperty("metadata");
			
			var sValuePath = "oMasterPanelModel>" + contextPath + "/vkValues";
			var hasFieldInput = currentObj.hasOwnProperty("vkValues");
			
			var oItemHbox = new sap.m.HBox();
			
			var oValueVBox = new sap.m.VBox();
			oValueVBox.bindAggregation("items", sValuePath, function(index, context, currentObj){
				var contextPath = context.getPath();
				var oMasterPanelModel = context.getModel();
				var sPath = "oMasterPanelModel>" + contextPath;
				var currentObj = oMasterPanelModel.getProperty(contextPath);
				var index = "/" + contextPath.split("/")[1] + "/" + contextPath.split("/")[2];
				var parentObj = oMasterPanelModel.getProperty(index);
				
				if(currentObj.fieldName === "Status"){
					var oStatusText = new sap.m.Text({
						text: { path: sPath + "/fieldValue", formatter:formatter.formatStatusValues},
						visible: { path: sPath + "/visible", formatter:formatter.formatBooleanValues}
					}).addStyleClass("businessContextTextClass");
					return oStatusText;
				}else{
					var oText = new sap.m.Text({
						text: "{" + sPath + "/fieldName}"+ " : " +"{" + sPath + "/fieldValue}",
						visible: { path: sPath + "/visible", formatter:formatter.formatBooleanValues}
					}).addStyleClass("businessContextTextClass");
					return oText;
				}
			}).addStyleClass("inctureMDSideValueVboxStle");
			oItemHbox.addItem(oValueVBox);
			var oHrHBox = new sap.m.HBox();
			oHrHBox.addStyleClass("lineInPanelItemClass");
			
			var oVbox = new sap.m.VBox();
			oVbox.addStyleClass("incMDDataClass");
			oVbox.addItem(oItemHbox);
			oVbox.addItem(oHrHBox);
			return oVbox;
		});
	},
	
	onItemPress: function(oEvent) {
		var that = this;
		this.pIndex=oEvent.srcControl.getBindingContext("oMasterPanelModel").getPath().split("/")[2];
		var index=this.pIndex;
		var vboxEvent = this.getView().byId("MASTER_PANEL_BOX").getItems();
		for(var i=0; i<vboxEvent.length; i++){
			var styleClass = vboxEvent[i].aCustomStyleClasses;
			for(var j=0; j<styleClass.length; j++){
				if(styleClass[j] === "afterClickBgColor"){
					vboxEvent[i].removeStyleClass("afterClickBgColor");
				}
			}
		}
		vboxEvent[index].addStyleClass("afterClickBgColor");
		var oDetailController = this.getView().getParent().getParent().getDetailPage("APPRV_DETAIL").getController();
		this.isActive = oDetailController.isActive;
		this.isChanged = oDetailController.isChanged;
 		this.setPayloadData(that.isActive,that.isChanged,that.requestId);
	},
	
	setPayloadData:function(active,change,requestId){
		var oMasterPanelModel =this.oMasterPanelModel;
        var mModel = oMasterPanelModel.getData();
        var index= this.pIndex;
        var data=mModel.approverSidePanel[index];
        var table=data.dtTable;
        var values=data.metadata;
 		for(var i=0; i<values.length;i++){
 			if(values[i].fieldId === "Vkey"){
 				var vkey = data.vkValues[i].fieldValue;	
 			}
 		}
		var payload={
				"requestId":requestId,
	 			 "vkey":vkey,
	 			 "decisionTable":table,
	 			 "usage":"A",
	 			 "mode":"Task",
	 			 "uiName":"4",
	 			 "recordType":this.isActive,
	 			 "changeMode":this.isChanged,
	 			 "status":"Update Pending",
	 			 "userType" : "B"
	 	};
	 	this.getDeatailMaterialData(payload);
	},
	
	getDeatailMaterialData:function(payload){
		
		var that=this;
		//this.busy.open();
		var oApprovalMatSectionModel = this.oApprovalMatSectionModel;
		var oApprovalBusinessContextModel = this.oApprovalBusinessContextModel;
		// var sRootPath = jQuery.sap.getModulePath("approvalui");
		var sUrl = "/pricemaintainencerest/conditionRecord/pendingRecords";
		var payload=payload;
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.loadData(sUrl, JSON.stringify(payload), true, "POST", false, false, that.oHeader);
		oModel.attachRequestCompleted(function(oEvent) {
			if (oEvent.getParameter("success")) {
				var resultData = oEvent.getSource().getData();
				if (resultData.hasOwnProperty("headerRecords")) {
	                if (!Array.isArray(resultData.headerRecords)) {
	                       var oTempArr = [];
	                       oTempArr.push(resultData.headerRecords);
	                       resultData.headerRecords = oTempArr;
	                }
				}else{
	                resultData.headerRecords = [];
	            }
				oApprovalMatSectionModel.setData(resultData);
				var businessContextParams = jQuery.extend(true, {},resultData);
				oApprovalBusinessContextModel.setData(businessContextParams);
				var conditionData = resultData.conditionTypesRecords;
				var businessObjectList = resultData.businessObjectList;
				if (businessObjectList) {
					if (!Array.isArray(businessObjectList)) {
						var tempArry = [];
						tempArry.push(businessObjectList);
						resultData.businessObjectList = tempArry;
					}
					//Deleting Objects having "isVisible" property "false", 
		            //As aggregation binding on Grid Layout, with invisible controls creates placeholder. 
					var length = businessObjectList.length;
					for(var i=length-1; i>=0; i--){
						if(businessObjectList[i].isVisible === "false"||businessObjectList[i].isVisible === false){
							businessObjectList.splice(i,1);
		                 }
					}
				}
				if (conditionData) {
					if (!Array.isArray(conditionData.entry)) {
						var tempArry = [];
						tempArry.push(conditionData.entry);
						resultData.conditionTypesRecords.entry = tempArry;
					}
				}
				oApprovalMatSectionModel.refresh();
				//sap.ui.core.UIComponent.getRouterFor(that).getView('view.ApprovalDetail').getController().getMaterialData();
				 that.getView().getParent().getParent().getDetailPage("APPRV_DETAIL").getController().getMaterialData(payload);
			}else{
				var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
	             formatter.toastMessage(errorText);
				//that.busy.close();
			}
		});
		oModel.attachRequestFailed(function(oEvent) {
			var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
	        formatter.toastMessage(errorText);
			//that.busy.close();
		});
	},
	
	attachEventMethod : function(){
		var that = this;
		var vboxEvent = this.getView().byId("MASTER_PANEL_BOX").getItems();
		var panelItemlen = vboxEvent.length;
		for(var i=0; i<panelItemlen;i++){
			var index= vboxEvent[i].oBindingContexts.oMasterPanelModel.sPath.split("/")[2];
			vboxEvent[index].onclick = function(oEvent){
				that.onItemPress(oEvent);
				
			}
		}
	}

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf price_update.Price_Update
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf price_update.Price_Update
*/
//	onAfterRendering: function() {
//		
//    },

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf price_update.Price_Update
*/
//	onExit: function() {
//
//	}

});
});