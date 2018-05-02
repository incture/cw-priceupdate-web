sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("freshDirectSKU.SKU.controller.dropdownView", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf freshDirectSKU.SKU.view.dropdownView
		 */
			onInit: function() {
				var oDDVisibleModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oDDVisibleModel,"oDDVisibleModel");
			},
			
			onDropdownClick : function(oEvent){
				var oDDVisibleModel = this.getView().getModel("oDDVisibleModel");
				var oButtonText = oEvent.getSource().getText();
				if(oButtonText === "Create"){
					oDDVisibleModel.setProperty("/createVisible" , true);
					oDDVisibleModel.setProperty("/modifyVisible" , false);
					oDDVisibleModel.setProperty("/uploadVisible" , false);
					oDDVisibleModel.setProperty("/templateVisible" , false);
				} else if(oButtonText === "Modify"){
					oDDVisibleModel.setProperty("/createVisible" , false);
					oDDVisibleModel.setProperty("/modifyVisible" , true);
					oDDVisibleModel.setProperty("/uploadVisible" , false);
					oDDVisibleModel.setProperty("/templateVisible" , false);
				} else if(oButtonText === "Upload"){
					oDDVisibleModel.setProperty("/createVisible" , false);
					oDDVisibleModel.setProperty("/modifyVisible" , false);
					oDDVisibleModel.setProperty("/uploadVisible" , true);
					oDDVisibleModel.setProperty("/templateVisible" , false);
				}else if(oButtonText === "Templates"){
					oDDVisibleModel.setProperty("/createVisible" , false);
					oDDVisibleModel.setProperty("/modifyVisible" , false);
					oDDVisibleModel.setProperty("/uploadVisible" , false);
					oDDVisibleModel.setProperty("/templateVisible" , true);
				}
				if (!this.dropdownDialog) {
					this.dropdownDialog = sap.ui.xmlfragment("freshDirectSKU.SKU.fragment.Dropdown", this);
					this.getView().addDependent(this.dropdownDialog);
				}
			this.dropdownDialog.openBy(oEvent.getSource());
			}
			

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf freshDirectSKU.SKU.view.dropdownView
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf freshDirectSKU.SKU.view.dropdownView
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf freshDirectSKU.SKU.view.dropdownView
		 */
		//	onExit: function() {
		//
		//	}

	});

});