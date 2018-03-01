sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("PU_Reports.controller.Master", {

		onInit: function() {
		
			var that = this;
			this.oHeader = {
				"Accept": "application/json",
				"Content-Type": "application/json"
			};
			
			this._router = sap.ui.core.UIComponent.getRouterFor(this);
			this._router.attachRoutePatternMatched(function(oEvent) {
				var viewName = oEvent.getParameter("name");
				/*if ( viewName === "dashboard" || viewName === "master") {
					that.routePatternMatched(oEvent);
				}*/
					that.routePatternMatched(oEvent);
			});
		},

		routePatternMatched: function(){
			this.setMasterListItems();
		},
		
		setMasterListItems: function() {

			var oRepArray = [{
				"reportName": "Summary Report",
				"reportKey": "summaryReport"
			}, {
				"reportName": "Price Trend Report",
				"reportKey": "priceTrend"
			}, {
				"reportName": "Vendor Competitor Report",
				"reportKey": "vendorCompetitor"
			}];
			
			var oListReportsModel = this.getOwnerComponent().getModel('oListReportsModel');
			oListReportsModel.setData({ reportsList: oRepArray});
			this.getView().setModel(oListReportsModel, "oListReportsModel");
		},
		
		onListItemSelect: function(oEvent){
			var selectedItem = oEvent.getParameters().srcControl.getBindingContext("oListReportsModel");
			var sPath = selectedItem.getPath();
			var oListReportsModel = this.getView().getModel("oListReportsModel");
			var oSelectedObj = oListReportsModel.getProperty(sPath);
			this._router.navTo(oSelectedObj.reportKey);
		}
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf PU_Reports.view.Master
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf PU_Reports.view.Master
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf PU_Reports.view.Master
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf PU_Reports.view.Master
		 */
		//	onExit: function() {
		//
		//	}

	});

});