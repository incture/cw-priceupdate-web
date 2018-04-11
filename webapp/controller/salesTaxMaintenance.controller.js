sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV'
], function(Controller, Export, ExportTypeCSV) {
	"use strict";

	return Controller.extend("freshDirectSKU.SKU.controller.salesTaxMaintenance", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf freshDirectSKU.SKU.view.salesTaxMaintenance
		 */
		onInit: function() {
			var createNewTaxCodeModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(createNewTaxCodeModel, "createNewTaxCodeModel");
			var avalaraTaxModel = new sap.ui.model.json.JSONModel();
			avalaraTaxModel.loadData("model/avalaraTaxModel.json");
			this.getView().setModel(avalaraTaxModel, "avalaraTaxModel");

		},
		createNewTaxCode: function() {
			var createNewTaxCodeModel = this.getView().getModel("createNewTaxCodeModel");
			createNewTaxCodeModel.setProperty("/categoryEditable", true);
			createNewTaxCodeModel.setProperty("/CategoryInputVisible", false);
			createNewTaxCodeModel.setProperty("/CategoryDropdownVisible", true);
			createNewTaxCodeModel.setProperty("/subCategoryEditable", true);
			createNewTaxCodeModel.setProperty("/subCategoryEditable", true);
			createNewTaxCodeModel.setProperty("/subCategoryDropdownVisible", true);
			createNewTaxCodeModel.setProperty("/subCategoryInputVisible", false);
			createNewTaxCodeModel.setProperty("/taxCodeEditable", true);
			createNewTaxCodeModel.setProperty("/buttonText", "Create");
			this.openAvalraTaxDialog();
		},
		createNewSubCategory: function() {
			var createNewTaxCodeModel = this.getView().getModel("createNewTaxCodeModel");
			createNewTaxCodeModel.setProperty("/categoryEditable", true);
			createNewTaxCodeModel.setProperty("/CategoryDropdownVisible", true);
			createNewTaxCodeModel.setProperty("/CategoryInputVisible", false);
			createNewTaxCodeModel.setProperty("/subCategoryEditable", true);
			createNewTaxCodeModel.setProperty("/subCategoryDropdownVisible", false);
			createNewTaxCodeModel.setProperty("/subCategoryInputVisible", true);
			createNewTaxCodeModel.setProperty("/taxCodeEditable", true);
			createNewTaxCodeModel.setProperty("/buttonText", "Create");
			this.openAvalraTaxDialog();
		},
		modifyTaxCode: function(oEvent) {
			var table = oEvent.getSource().getParent().getParent();
			var selectedItems = table.getSelectedItems();
			if (selectedItems.length === 0) {
				sap.m.MessageToast.show("Select a Row to Edit");
			} else if (selectedItems.length > 1) {
				sap.m.MessageToast.show("Select a single Row to Edit");
			} else {
				var createNewTaxCodeModel = this.getView().getModel("createNewTaxCodeModel");
				var avalaraTaxModel = this.getView().getModel("avalaraTaxModel");
				var avalaraTaxModelData = avalaraTaxModel.getData();
				var selected = selectedItems[0].getId().split("-")[2];
				var selectedItemData = avalaraTaxModelData.avalaraTax[selected];
			
				createNewTaxCodeModel.setProperty("/", selectedItemData, null, true);
					createNewTaxCodeModel.setProperty("/selected", selected);
				createNewTaxCodeModel.setProperty("/categoryEditable", false);
				createNewTaxCodeModel.setProperty("/CategoryDropdownVisible", false);
				createNewTaxCodeModel.setProperty("/CategoryInputVisible", true);
				createNewTaxCodeModel.setProperty("/subCategoryEditable", false);
				createNewTaxCodeModel.setProperty("/subCategoryDropdownVisible", false);
				createNewTaxCodeModel.setProperty("/subCategoryInputVisible", true);
				createNewTaxCodeModel.setProperty("/taxCodeEditable", false);
				createNewTaxCodeModel.setProperty("/buttonText", "Modify");
				this.openAvalraTaxDialog();
				table.removeSelections();
			}

		},
		openAvalraTaxDialog: function() {
			var createNewTaxCodeModel = this.getView().getModel("createNewTaxCodeModel");
			createNewTaxCodeModel.setProperty("/taxableEditable", true);
			createNewTaxCodeModel.setProperty("/DescriptionEditable", true);
			if (!this.creteNewTaxCodedialog) {
				this.creteNewTaxCodedialog = sap.ui.xmlfragment("freshDirectSKU.SKU.fragment.createNewAvalaraTaxCode", this);
				this.getView().addDependent(this.creteNewTaxCodedialog);
			}
			this.creteNewTaxCodedialog.open();
			this.onCategorySelection();
		},
		deleteTaxCode: function(oEvent) {
			var avalaraTaxModel = this.getView().getModel("avalaraTaxModel");
			var avalaraTaxModelData = avalaraTaxModel.getData();
			var table = oEvent.getSource().getParent().getParent();
			var selectedItems = table.getSelectedItems();
			if (selectedItems.length === 0) {
				sap.m.MessageToast.show("Select a Row to Delete");
			}
			for (var i = 0; i < selectedItems.length; i++) {

				var selectedIndex = selectedItems[i].getId().split("-")[2];
				avalaraTaxModelData.avalaraTax.splice(selectedIndex, 1);
			}
			avalaraTaxModel.refresh();
			table.removeSelections();
		},
		onCreateNewAvalaraTaxode: function() {

			var avalaraTaxModel = this.getView().getModel("avalaraTaxModel");
			var avalaraTaxModelData = avalaraTaxModel.getData();
			var createNewTaxCodeModel = this.getView().getModel("createNewTaxCodeModel");
			var createNewTaxCodeModeldata = createNewTaxCodeModel.getData();
			var selected = createNewTaxCodeModel.getProperty("/selected");
				var selectedCategory = createNewTaxCodeModeldata.categorySelectedKey;       
			if (createNewTaxCodeModeldata.buttonText === "Create") {
			    
				var newTax = {
					"category": selectedCategory,
					"subCategory": createNewTaxCodeModeldata.subCategory,
					"taxCode": createNewTaxCodeModeldata.taxCode,
					"taxable": createNewTaxCodeModeldata.taxable,
					"Description": createNewTaxCodeModeldata.Description
				};
				avalaraTaxModelData.avalaraTax.push(newTax);
			} else {

				var newTax = {
					"category":createNewTaxCodeModeldata.category,
					"subCategory": createNewTaxCodeModeldata.subCategory,
					"taxCode": createNewTaxCodeModeldata.taxCode,
					"taxable": createNewTaxCodeModeldata.taxable,
					"Description": createNewTaxCodeModeldata.Description
				};
				avalaraTaxModelData.avalaraTax.splice(selected, 1, newTax);

			}
			avalaraTaxModel.refresh();
			this.onCancelCreateNewTaxCode();
		},
		onCancelCreateNewTaxCode: function() {

			this.creteNewTaxCodedialog.close();
			this.fragmentRefresh();

		},
		fragmentRefresh: function() {
			var createNewTaxCodeModel = this.getView().getModel("createNewTaxCodeModel");
			createNewTaxCodeModel.setProperty("/category", "");
			createNewTaxCodeModel.setProperty("/subCategory", "");
			createNewTaxCodeModel.setProperty("/taxable", "");
			createNewTaxCodeModel.setProperty("/taxCode", "");
			createNewTaxCodeModel.setProperty("/Description", "");

			createNewTaxCodeModel.refresh();
		},

		onCategorySelection: function(oEvent) {

			var temp = [];
			var avalaraTaxModel = this.getView().getModel("avalaraTaxModel");
			var createNewTaxCodeModel = this.getView().getModel(
				"createNewTaxCodeModel");
			var createNewTaxCodeModelData = createNewTaxCodeModel.getData();
			var avalaraTaxModel = avalaraTaxModel.getData();

			if (oEvent) {
				var selectedkey = oEvent.getSource().getSelectedKey();
			} else if (createNewTaxCodeModelData.buttonText != "Modify") {
				createNewTaxCodeModel.setProperty("/categorySelectedKey", "02");
				var selectedkey = "02";
			}

			temp.push(avalaraTaxModel[selectedkey]);
			createNewTaxCodeModel.setProperty("/subcat", temp);

		},
		onDownloadtoExcel: function() {

			var oExport = new Export({
				exportType: new ExportTypeCSV({
					separatorChar: ","
				}),
				models: this.getView().getModel("avalaraTaxModel"),
				rows: {
					path: "/avalaraTax"
				},
				columns: [{
						name: "category",
						template: {
							content: "{category}"
						}
					}, {
						name: "subCategory",
						template: {
							content: "{subCategory}"
						}
					}

					, {
						name: "taxCode",
						template: {
							content: "{taxCode}"
						}
					}, {
						name: "taxable",
						template: {
							content: "{taxable}"
						}
					}, {
						name: "Description",
						template: {
							content: "{Description}"
						}
					}

				]
			});
			oExport.saveFile("AVALARA_TAX_MAINTANENCE"); // download exported file 

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf freshDirectSKU.SKU.view.salesTaxMaintenance
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf freshDirectSKU.SKU.view.salesTaxMaintenance
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf freshDirectSKU.SKU.view.salesTaxMaintenance
		 */
		//	onExit: function() {
		//
		//	}

	});

});