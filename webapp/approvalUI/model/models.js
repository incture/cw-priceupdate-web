sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		createpurchaseRequestDataModel: function(taskId) {
			var oModel = new JSONModel("/bpmworkflowruntime/rest/v1/task-instances/" + taskId);
			oModel.setDefaultBindingMode("TwoWay");
			return oModel;
		}
	};
});