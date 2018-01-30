sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"approvalui/model/models",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(UIComponent, Device, models, JSONModel) {
	"use strict";

	return UIComponent.extend("approvalui.Component", {

		metadata: {
			manifest: "json",
			publicMethods: ["updateBinding"]
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			//this.setModel(this.oComponentData.inboxHandle.attachmentHandle.detailModel, "taskModel");
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}

// 		createContent: function() {
// 			var startupParameters = this.getComponentData().startupParameters;
// 			var oTaskModel = startupParameters.taskModel;
// 			var taskId = oTaskModel.getData().InstanceID;
// 			var oContextModel = new sap.ui.model.json.JSONModel();
// 			oContextModel.loadData("/bpmworkflowruntime/rest/v1/task-instances/" + taskId + "/context", null, false, "GET", true);
// 			oContextModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
// 			this.setModel(oContextModel, "contextData");
			
// var requestModel = new sap.ui.model.json.JSONModel();
// 	requestModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
// 	requestModel.setData({comments:"ABC"});
// this.setModel(requestModel,"reqModel"); 
// 			// var ReqId = oContextModel.getData().request;

// 			var mainView = sap.ui.view({
// 				type: sap.ui.core.mvc.ViewType.XML,
// 				viewName: "approvalui.view.App",
// 				viewData: {
// 					taskId: taskId
// 				}
// 			});
// 			startupParameters.inboxAPI.addAction({
// 				action: "Reject",
// 				label: "Reject",
// 				type: "Reject"
// 			}, function(button) {
// 				var reqModel = this.getModel("requestModel");
// 				var reqModelData = reqModel.getData();
// 				reqModel.refresh();
// 				if (reqModelData.comments) {
// 					reqModelData.Status = "Reject";
// 					reqModel.refresh();
// 					this._completeTask(taskId, false);
// 				} else {
// 					sap.m.MessageToast.show("Please Enter the comments");
// 				}
// 			}, this);

// 			startupParameters.inboxAPI.addAction({
// 				action: "Approve",
// 				label: "Approve",
// 				type: "Accept"
// 			}, function(button) {
// 				var reqModel = this.getModel("requestModel");
// 				var reqModelData = reqModel.getData();
// 				reqModelData.Status = "approved";
// 				this.getModel("contextData").refresh();
// 				this._completeTask(taskId, true);
// 			}, this);
// 			return mainView;

// 		},
// 		_completeTask: function(taskId, approvalStatus) {
// 			var token = this._fetchToken();
// 			$.ajax({
// 				url: "/bpmworkflowruntime/rest/v1/task-instances/" + taskId,
// 				method: "PATCH",
// 				contentType: "application/json",
// 				async: false,
// 				data: "{\"status\": \"COMPLETED\", \"context\": {\"IsApproved\":" + approvalStatus + "}}",
// 				headers: {
// 					"X-CSRF-Token": token
// 				}
// 			});
// 			this._refreshTask(taskId);
// 		},

// 		_fetchToken: function() {
// 			var token;
// 			$.ajax({
// 				url: "/bpmworkflowruntime/rest/v1/xsrf-token",
// 				method: "GET",
// 				async: false,
// 				headers: {
// 					"X-CSRF-Token": "Fetch"
// 				},
// 				success: function(result, xhr, data) {
// 					token = data.getResponseHeader("X-CSRF-Token");
// 				}
// 			});
// 			return token;
// 		},

// 		_refreshTask: function(taskId) {
// 			this.getComponentData().startupParameters.inboxAPI.updateTask("NA", taskId);
// 		}

	});
});