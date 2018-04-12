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
	financeCaseValue: function() {
		var page3Model = this.getView().getModel("page3Model");
		var v = page3Model.getData().commercialFinance;
		v[6].case = v[3].case-v[4].case;
		v[8].case = (v[7].case-v[6].case).toFixed(2);

	},
	commercialFinanceModelLoad: function() {
		var page3Model = new sap.ui.model.json.JSONModel();
		page3Model.loadData("model/page3Model.json");
		var that = this;
		page3Model.attachRequestCompleted(function(oEvent) {
			that.getView().setModel(page3Model, "page3Model");

		});

	},

	/*	Commercial Finance code ends*/

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
	onAfterRendering: function() {
		// this.financeCaseValue();
	}

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf view.page3
	 */
	//	onExit: function() {
	//
	//	}

});