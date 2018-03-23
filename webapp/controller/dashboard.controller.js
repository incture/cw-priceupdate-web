sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("freshDirectSKU.SKU.controller.dashboard", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf freshDirectSKU.SKU.view.dashboard
		 */
		onInit: function() {
			var oDashboardModel = new sap.ui.model.json.JSONModel();
			oDashboardModel.loadData("model/skuInboxData.json", null, false);
			this.getView().setModel(oDashboardModel, "oDashboardModel");

			var dshbrdVisibleModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(dshbrdVisibleModel, "dshbrdVisibleModel");
			dshbrdVisibleModel.setProperty("/clearVisible", false);
		},

		/******* Opens Filter dialog box *******/
		onFilterPress: function(oEvent) {
			this.selectedColumn = oEvent.getSource().getParent().getContent()[1].getText();
			if (!this.filterInputDialog) {
				this.filterInputDialog = sap.ui.xmlfragment("sku.fragment.filterInput", this);
				this.getView().addDependent(this.filterInputDialog);
			}
			this.filterInputDialog.openBy(oEvent.getSource());
		},

		/********* Filtering table *********/
		dashboradTblFilter: function(oEvent) {
			var aFilters = [];
			var sQuery = "";
			var dshbrdVisibleModel = this.getView().getModel("dshbrdVisibleModel");
			if (oEvent) {
				sQuery = oEvent.getSource().getValue();
			}
			if (sQuery == "") {
				dshbrdVisibleModel.setProperty("/clearVisible", false);
			} else {
				dshbrdVisibleModel.setProperty("/clearVisible", true);
			}
			var filterArry = [];
			var metaModel = [this.selectedColumn];
			if (sQuery && sQuery.length > 0) {
				for (var i = 0; i < metaModel.length; i++) {
					var bindingName = metaModel[i];
					filterArry.push(new sap.ui.model.Filter(bindingName, sap.ui.model.FilterOperator.Contains, sQuery));
				}
				var filter = new sap.ui.model.Filter(filterArry, false);
				aFilters.push(filter);
			}
			// update list binding
			var reqList = this.getView().byId("idSkuDashboardTable");
			var binding = reqList.getBinding("items");
			binding.filter(aFilters, "Application");

		},

		/*********Clear filter ************/
		onClearFilter: function() {
			this.getView().getModel("oDashboardModel").refresh();
		},

		/*************Open sorting dialog *************/
		handleOpenSortOption: function(oEvent) {
			this.selectedColumn = oEvent.getSource().getParent().getContent()[1].getText();
			var oButton = oEvent.getSource();
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment("sku.fragment.sorting", this);
				this.getView().addDependent(this._actionSheet);
			}
			this._actionSheet.openBy(oButton);
		},

		/************* Sorting function ***********/
		onSortActionSelected: function(oEvent) {
			var oTable = this.getView().byId("idSkuDashboardTable");
			var oBinding = oTable.getBinding("items");
			var aSorters = [], bDescending;
			var sPath = this.selectedColumn;
			var sortSelection = oEvent.getSource().getText();
			if (sortSelection == "Ascending") {
				bDescending = false;
			} else {
				bDescending = true;
			}
			aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
			this._actionSheet.close();
		},

		/*********** notes pressed from table ***********/
		onNotesPress: function(oEvent) {
			if (!this._notesDialog) {
				this._notesDialog = sap.ui.xmlfragment("sku.fragment.notesFragment", this);
				this.getView().addDependent(this._notesDialog);
			}
			this._notesDialog.open(oEvent.getSource());
		},

		onNotesCancel: function() {
			this._notesDialog.close();
		},

		/************** Save newly added notes ************/
		onNotesSave: function() {

		},

		/***************** Export excel sheet ***************/
		onExporttoExcel: function() {

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf freshDirectSKU.SKU.view.dashboard
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf freshDirectSKU.SKU.view.dashboard
		 */
		onAfterRendering: function() {
			var oTable = this.getView().byId("idSkuDashboardTable");
			oTable.addEventDelegate({
				onAfterRendering: function() {
					var chkBox = document.getElementById("__xmlview1--idSkuDashboardTable-sa");
					if (chkBox) {
						chkBox.style.display = "none";
					}
				}
			}, this);
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf freshDirectSKU.SKU.view.dashboard
		 */
		//	onExit: function() {
		//
		//	}

	});

});