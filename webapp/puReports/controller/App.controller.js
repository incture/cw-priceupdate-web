sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("PU_Reports.controller.App", {
		onInit: function() {
		/*	var oSplitApp = this.getView().byId("REPORT_SPLIT_APP");
			var oDetailPage = sap.ui.view({
				id: "REPORT",
				viewName: "PU_Reports.view.summaryReport",
				type: sap.ui.core.mvc.ViewType.XML
			});
			oSplitApp.addDetailPage(oDetailPage);*/
		},

		onSuggest: function(event) {

			var value = event.getParameter("suggestValue");
			var oSearchField = this.byId("searchField");
			var filters = [];
			if (value) {
				filters = [new sap.ui.model.Filter([new sap.ui.model.Filter("desc", function(sDes) {
					return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
				})])];
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
				oDialog = sap.ui.xmlfragment(oView.getId(), "view.userPreference", this);
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
				oDialog = sap.ui.xmlfragment(oView.getId(), "view.notificationPanel", this);
				oView.addDependent(oDialog);
			}
			oDialog.openBy(oEvent.getSource());
		}
	});
});