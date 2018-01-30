sap.ui.define(["sap/ui/core/mvc/Controller",
"com/incture/util/util"
], function(Controller) {

	return Controller.extend("com.incture.controller.App", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf view.Details
		 */
	onInit: function() {
		var oComponent = this.getOwnerComponent();
		this._router = oComponent.getRouter();
	},
	
	onSuggest: function (event) {
		
		var value = event.getParameter("suggestValue");
		var oSearchField = this.byId("searchField");
		var filters = [];
		if (value) {
			filters = [new sap.ui.model.Filter([new sap.ui.model.Filter("desc", function(sDes) {
			                                    return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
			                                    })
			                                    ])];
			}
			oSearchField.getBinding("suggestionItems").filter(filters);
			oSearchField.suggest();
		},
		
		onSearch: function(event) {
			var item = event.getParameter("suggestionItem");
			if (item) {
				sap.m.MessageToast.show("search for: " + item.getText());
			}
		},
			
		onUserPress: function(oEvent) {
			 var oView = this.getView();
	         var oDialog = oView.byId("userDialog");
	         // create dialog lazily
	         if (!oDialog) {
	            // create dialog via fragment factory
	            oDialog = sap.ui.xmlfragment(oView.getId(), "com.incture.fragment.userPreference", this);
	            oView.addDependent(oDialog);
	         }
	         oDialog.openBy(oEvent.getSource());
		},
	
		onShowMaster: function(oEvent) {
			var oSplitApp = this.getView().byId('idSplitApp');
			if (oSplitApp.isMasterShown()) {
				oSplitApp.setMode("HideMode");
				oSplitApp.hideMaster();
			} else {
				oSplitApp.setMode("ShowHideMode");
				oSplitApp.showMaster();
				//this._router.navTo("master");
			}
		},
		
		handleNotifications: function(oEvent) {
			 var oView = this.getView();
	         var oDialog = oView.byId("inctureMDNotifications");
	         // create dialog lazily
	         if (!oDialog) {
	            // create dialog via fragment factory
	            oDialog = sap.ui.xmlfragment(oView.getId(), "com.incture.fragment.notificationPanel", this);
	            oView.addDependent(oDialog);
	         }
	         oDialog.openBy(oEvent.getSource());
		}
	/**
	* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	* (NOT before the first rendering! onInit() is used for that one!).
	* @memberOf view.Details
	*/
	//onBeforeRendering: function() {
	//
	//},

	/**
	* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	* This hook is the same one that SAPUI5 controls get after being rendered.
	* @memberOf view.Details
	*/
	//onAfterRendering: function() {
	//
	//},
	/**
	* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	* @memberOf view.Details
	*/
	//onExit: function() {
	//
	//}
	});
});