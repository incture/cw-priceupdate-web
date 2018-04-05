jQuery.sap.require("sap.m.MessageBox");
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
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
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
			if (sQuery === "") {
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
		onRequestIdPress: function() {
			this.oRouter.navTo("page3");
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
			var aSorters = [],
				bDescending;
			var sPath = this.selectedColumn;
			var sortSelection = oEvent.getSource().getText();
			if (sortSelection === "Ascending") {
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

		/*Create SKU Fragment Code Starts*/

		onCreatePress: function() {
			this.loadModel();
			this.onCreateNewSKU();
			if(!this.createNewSkudialog)
			{
			this.createNewSkudialog = sap.ui.xmlfragment(
				"freshDirectSKU.SKU.fragment.createNewSKU", this);
			this.getView().addDependent(this.createNewSkudialog);
			}
			this.createNewSkudialog.open();

		},
		onAddBrand: function(oEvent) {
			this.popover = sap.ui.xmlfragment(
				"freshDirectSKU.SKU.fragment.addBrand", this);
			this.getView().addDependent(this.popover);
			this.popover.openBy(oEvent.getSource());
		},
		onRejectNewBrand: function() {

			this.popover.destroy();

		},
		onAddNewBrand: function() {
			var createSKUModel = this.getView().getModel(
				"createSKUModel");
			var newBrand = createSKUModel.getProperty("/newBrand",
				"");
			createSKUModel.setProperty("/brand", newBrand);

			this.popover.destroy();

		},
		loadModel: function() {
			var SKUModel = new sap.ui.model.json.JSONModel();
			SKUModel.loadData("model/SKUModel.json");
			this.getView().setModel(SKUModel, "SKUModel");
		},
		onCreateNewSKU: function() {
			var createSKUModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(createSKUModel,
				"createSKUModel");
			this.setCreateSKUModelProperty();
		},
		setCreateSKUModelProperty: function() {
			var createSKUModel = this.getView().getModel(
				"createSKUModel");
			createSKUModel.setProperty("/brand", "");
			createSKUModel.setProperty("/prodDesc", "");
			createSKUModel.setProperty("/packageSize", "");
			createSKUModel.setProperty("/tarActDateenabled", true);
			createSKUModel.setProperty("/sapProdDescEditEnabled", false);
			createSKUModel.setProperty("/tarActDate", "");
			createSKUModel.setProperty("/sapProdDescvalid", "");
			createSKUModel.setProperty("/sapProdDescValidVisiblity", false);
			createSKUModel.setProperty("/sapProdDescInvalidVisiblity", false);
			createSKUModel.setProperty("/upc", "");
			createSKUModel.setProperty("/UPCInvalidVisiblity", false);
			createSKUModel.setProperty("/UPCValidVisiblity", false);
			createSKUModel.setProperty("/UPCCheckboxState", false);
			createSKUModel.setProperty("/packageType", "");
			createSKUModel.setProperty("/packageCount", "");
			createSKUModel.setProperty("/indPackageSize", "");
			createSKUModel.setProperty("/indPackageSizeUOM", "");
			createSKUModel.setProperty("/tier1", "");
			createSKUModel.setProperty("/tier2", "");
			createSKUModel.setProperty("/tier3", "");
			createSKUModel.setProperty("/tier4", "");
			createSKUModel.setProperty("/categoryAttribute1", "");
			createSKUModel.setProperty("/categoryAttribute2", "");
			createSKUModel.setProperty("/categoryAttribute3", "");
			createSKUModel.setProperty("/categoryAttribute4", "");
			createSKUModel.setProperty("/stoarageTempZone", "");
			createSKUModel.setProperty("/materialType", "");
			createSKUModel.setProperty("/BUOM", "");
			createSKUModel.setProperty("/PLUCode", "");
			createSKUModel.setProperty("/merchantProductFlavour", "");
			createSKUModel.setProperty("/PurchasingGroup", "");
			createSKUModel.setProperty("/newBrand", "");

		},
		UPCCheckboxSelected: function(oEvent) {
			var createSKUModel = this.getView().getModel(
				"createSKUModel");
			var UPCCheckboxState = oEvent.getParameters().selected;
			createSKUModel.setProperty("/UPCCheckboxState",
				UPCCheckboxState);
			this.UPCvalid();

		},
		UPCvalid: function(upc) {
			var createSKUModel = this.getView().getModel(
				"createSKUModel");
			var UPCCheckboxState = createSKUModel
				.getProperty("/UPCCheckboxState");
			var upc = createSKUModel.getProperty("/upc");
			if (upc.length === 15 && UPCCheckboxState === true) {
				createSKUModel.setProperty("/UPCInvalidVisiblity",
					false);
				createSKUModel.setProperty("/UPCValidVisiblity",
					true);

			} else if (upc !== "" && UPCCheckboxState === true) {

				createSKUModel.setProperty("/UPCInvalidVisiblity",
					true);
				createSKUModel.setProperty("/UPCValidVisiblity",
					false);

			} else {
				createSKUModel.setProperty("/UPCInvalidVisiblity",
					false);
				createSKUModel.setProperty("/UPCValidVisiblity",
					false);

			}
		},

		onCancel: function(oEvent) {
			this.dialog.close();
			this.setCreateSKUModelProperty();
		},
		sapProdDescfun: function(packageSize, brand, prodDesc,
			indPackageSizeUOM, packageCount) {

			if ((packageSize !== "" && packageSize !== undefined) && (brand !== "" && brand !== undefined) && (prodDesc !== "" && prodDesc !==
					undefined) && (indPackageSizeUOM !== "" && indPackageSizeUOM !== undefined) && (packageCount !== " " && indPackageSizeUOM !==
					undefined)) {
				var sapProdDesc = brand + " " + prodDesc + "" + packageCount + " " + packageSize + " " + indPackageSizeUOM;
				var createSKUModel = this.getView().getModel(
					"createSKUModel");
				if (sapProdDesc.length > 40) {
					createSKUModel.setProperty(
						"/sapProdDescValidVisiblity", false);
					createSKUModel.setProperty(
						"/sapProdDescInvalidVisiblity", true);
				} else {
					createSKUModel.setProperty(
						"/sapProdDescValidVisiblity", true);
					createSKUModel.setProperty(
						"/sapProdDescInvalidVisiblity", false);
				}
				return sapProdDesc;
			}

		},
		targetActitivationDate: function() {
			var createSKUModel = this.getView().getModel(
				"createSKUModel");
			var today = new Date();
			var modDate = today.setDate(today.getDate() + 13);
			var finaldate = new Date(modDate);
			createSKUModel.setProperty("/finalDate", finaldate);
		},
		tarActASAPfn: function(oEvent) {
			this.targetActitivationDate();
			var createSKUModel = this.getView().getModel(
				"createSKUModel");
			var checkboxState = oEvent.getParameters().selected;
			var finalDate = createSKUModel
				.getProperty("/finalDate");
			var dd = finalDate.getDate();
			var mm = finalDate.getMonth() + 1;
			var yy = finalDate.getFullYear();
			var date = dd + "/" + mm + "/" + yy;
			if (checkboxState === true) {

				createSKUModel.setProperty("/tarActDate", date);
				createSKUModel.setProperty("/tarActDateenabled",
					false);
			} else {
				createSKUModel.setProperty("/tarActMinDate", date);
				createSKUModel.setProperty("/tarActDate", "");
				createSKUModel.setProperty("/tarActDateenabled",
					true);
			}
		},
		onTargetActivationDateChange: function(oEvent) {
			this.targetActitivationDate();
			var selectedDate = oEvent.getSource().getDateValue();
			var createSKUModel = this.getView().getModel(
				"createSKUModel");
			var finalDate = createSKUModel
				.getProperty("/finalDate");
			if (finalDate >= selectedDate) {

				sap.m.MessageBox
					.show(
						"Target Activation date should be more than 14 days from current date", {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: "info"
						});
				createSKUModel.setProperty("/tarActDate", "");
			}

		},
		sapProdDescEdit: function() {
			var createSKUModel = this.getView().getModel(
				"createSKUModel");
			createSKUModel.setProperty("/sapProdDescEditEnabled",
				true);
		},

		onTier1Selection: function(oEvent) {

			var temp1 = [];
			var SKUModel = this.getView().getModel("SKUModel");
			var createSKUModel = this.getView().getModel(
				"createSKUModel");
			var SKUModelData = SKUModel.getData().tier1;
			var selectedkey = oEvent.getSource().getSelectedKey();
			var tier2Data = SKUModel.getData().tier2;

			for (var i = 0; i < SKUModelData.length; i++) {
				if (selectedkey === tier2Data[i].key) {
					temp1.push(tier2Data[i].value);
				}
			}

			SKUModel.setProperty("/tier2array", temp1);
			createSKUModel.setProperty("/tier2", "");
			createSKUModel.setProperty("/tier3", "");
			createSKUModel.setProperty("/tier4", "");
		},

		onTier2Selection: function(oEvent) {
			var SKUModel = this.getView().getModel("SKUModel");
			var createSKUModel = this.getView().getModel(
				"createSKUModel");
			var SKUModelData = SKUModel.getData();
			var selectedkey = oEvent.getSource().getSelectedKey();
			var temp2 = [];
			for (var i = 0; i < SKUModelData.tier3.length; i++) {
				if (SKUModelData.tier3[i].key === selectedkey) {
					temp2.push(SKUModelData.tier3[i].value);
					SKUModel.setProperty("/tier3array", temp2);
					console.log(temp2);
					createSKUModel.setProperty("/tier3", "");
					createSKUModel.setProperty("/tier4", "");
				}
			}
		},
		onTier3Selection: function(oEvent) {
			var SKUModel = this.getView().getModel("SKUModel");
			var createSKUModel = this.getView().getModel(
				"createSKUModel");
			var SKUModelData = SKUModel.getData();
			var selectedkey3 = oEvent.getSource().getSelectedKey();
			var temp3 = [];
			for (var i = 0; i < SKUModelData.tier4.length; i++) {
				if (SKUModelData.tier4[i].key === selectedkey3) {
					temp3.push(SKUModelData.tier4[i].value);
					console.log(temp3);
					SKUModel.setProperty("/tier4array", temp3);
					createSKUModel.setProperty("/tier4", "");
				}
			}
		},
		onSubmit: function() {
			var that = this;
			var createSKUModel = this.getView().getModel(
				"createSKUModel");
			var SKUData = createSKUModel.getData();
			if ((SKUData.packageSize != "" && SKUData.packageSize != undefined) && (SKUData.brand != "" && SKUData.brand != undefined) && (
					SKUData.prodDesc != "" && SKUData.prodDesc != undefined) && (SKUData.indPackageSizeUOM != "" && SKUData.indPackageSizeUOM !=
					undefined) && (SKUData.packageCount != " " && SKUData.indPackageSizeUOM != undefined) && (SKUData.upc != "" && SKUData.upc !=
					undefined) && (SKUData.merchantProductName != "" && SKUData.merchantProductName != undefined) && (SKUData.stoarageTempZone != "" &&
					SKUData.stoarageTempZone != undefined) && (SKUData.tier1 != "" && SKUData.tier1 != undefined) && (SKUData.tier2 != "" && SKUData.tier2 !=
					undefined) && (SKUData.tier3 != "" && SKUData.tier3 != undefined) && (SKUData.tier4 != "" && SKUData.tier4 != undefined) && (
					SKUData.categoryAttribute1 != " " && SKUData.categoryAttribute1 != undefined) && (SKUData.categoryAttribute2 != " " && SKUData.categoryAttribute2 !=
					undefined) && (SKUData.categoryAttribute3 != " " && SKUData.categoryAttribute3 != undefined) && (SKUData.categoryAttribute4 !=
					" " && SKUData.categoryAttribute4 != undefined) && (SKUData.packageCount != " " && SKUData.packageCount != undefined)) {
				that.setCreateSKUModelProperty();
				sap.m.MessageBox
					.show(
						"SKU has been successfully created", {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: "info"
						});
			} else {
				sap.m.MessageBox
					.show(
						"Fill all the Fields", {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: "info"
						});
			}
		}

		/*Create SKU Fragment Code Ends*/

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf freshDirectSKU.SKU.view.dashboard
		 */
		//	onExit: function() {
		//
		//	}

	});

});