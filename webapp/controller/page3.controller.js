sap.ui.controller("freshDirectSKU.SKU.controller.page3", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf view.page3
	 */
	onInit: function() {
		this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		this.commercialFinanceModelLoad();
		/*this.oProcessFlow1 = this.getView().byId("processflow2");
		this.oProcessFlow1.setZoomLevel("Four");*/
	},

	onBackPress: function() {
		this.oRouter.navTo("dashboard");
	},
	/*	Commercial Finance code starts*/

	financeEachValue: function(value) {
		if (value) {
			var each = value / 12;
			var each1 = each.toFixed(2);
			return each1;
		}
	},
	commercialFinanceModelLoad: function() {
		var commercialFinanceModel = new sap.ui.model.json.JSONModel();
		commercialFinanceModel.loadData("model/commercialFinanceModel.json");
		this.getView().setModel(commercialFinanceModel, "commercialFinanceModel");
	}

	/*	Commercial Finance code starts*/

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf view.page3
	 */
	//	onBeforeRendering: function() {
	//
	//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf view.page3
	 */
	//	onAfterRendering: function() {
	//
	//	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf view.page3
	 */
	//	onExit: function() {
	//
	//	}

});