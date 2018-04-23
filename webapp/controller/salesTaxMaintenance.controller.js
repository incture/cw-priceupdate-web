sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
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
			var that=this;
			this.getView().setModel(avalaraTaxModel, "avalaraTaxModel");
			avalaraTaxModel.attachRequestCompleted(function(oEvent) {
			var totlaResults=avalaraTaxModel.getData().avalaraTax.length;
			createNewTaxCodeModel.setProperty("/totlaResults",totlaResults);
				that.buttonDisabled();
			that.generatePagination();
			});
			avalaraTaxModel.loadData("model/avalaraTaxModel.json");
		
		
			var oPaginationModel=this.getOwnerComponent().getModel("paginationModel");
			this.getView().setModel(oPaginationModel,"oPaginationModel");

		},
		onRowSelection: function() {
			var createNewTaxCodeModel = this.getView().getModel("createNewTaxCodeModel");
			createNewTaxCodeModel.setProperty("/modifyEnabled", true);
			createNewTaxCodeModel.setProperty("/deleteEnabled", true);
		},
		buttonDisabled: function() {
			var createNewTaxCodeModel = this.getView().getModel("createNewTaxCodeModel");
			createNewTaxCodeModel.setProperty("/modifyEnabled", false);
			createNewTaxCodeModel.setProperty("/deleteEnabled", false);
		},
		createNewTaxCode: function(oEvent) {
			var table = oEvent.getSource().getParent().getParent();
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
			createNewTaxCodeModel.setProperty("/fragmentTitle", "New Avalara Tax Code");
			this.openAvalraTaxDialog();
			table.removeSelections();
		},
		createNewSubCategory: function(oEvent) {
			var table = oEvent.getSource().getParent().getParent();
			var createNewTaxCodeModel = this.getView().getModel("createNewTaxCodeModel");
			createNewTaxCodeModel.setProperty("/categoryEditable", true);
			createNewTaxCodeModel.setProperty("/CategoryDropdownVisible", true);
			createNewTaxCodeModel.setProperty("/CategoryInputVisible", false);
			createNewTaxCodeModel.setProperty("/subCategoryEditable", true);
			createNewTaxCodeModel.setProperty("/subCategoryDropdownVisible", false);
			createNewTaxCodeModel.setProperty("/subCategoryInputVisible", true);
			createNewTaxCodeModel.setProperty("/taxCodeEditable", true);
			createNewTaxCodeModel.setProperty("/buttonText", "Create");
			createNewTaxCodeModel.setProperty("/fragmentTitle", "New Avalara Tax Code");
			this.openAvalraTaxDialog();
			table.removeSelections();
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
				createNewTaxCodeModel.setProperty("/fragmentTitle", "Modify Avalara Tax Code");
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
			this.buttonDisabled();
		},
		onCreateNewAvalaraTaxode: function(oEvent) {

			var avalaraTaxModel = this.getView().getModel("avalaraTaxModel");
			var avalaraTaxModelData = avalaraTaxModel.getData();
			var createNewTaxCodeModel = this.getView().getModel("createNewTaxCodeModel");
			var createNewTaxCodeModeldata = createNewTaxCodeModel.getData();
			var selected = createNewTaxCodeModel.getProperty("/selected");
			if (createNewTaxCodeModeldata.buttonText === "Create") {
				var selectedCategoryKey = createNewTaxCodeModeldata.categorySelectedKey;
				for (var i = 0; i < avalaraTaxModelData.cat.length; i++) {
					if (avalaraTaxModelData.cat[i].key === selectedCategoryKey) {

						var selectedCategory = avalaraTaxModelData.cat[i].c;
					}
				}
				if ((selectedCategory != undefined && selectedCategory != "") &&
					(createNewTaxCodeModeldata.subCategory != undefined && createNewTaxCodeModeldata.subCategory != "") &&
					(createNewTaxCodeModeldata.taxCode != undefined && createNewTaxCodeModeldata.taxCode != "") &&
					(createNewTaxCodeModeldata.Description != undefined && createNewTaxCodeModeldata.Description != "") &&
					(createNewTaxCodeModeldata.taxable != undefined && createNewTaxCodeModeldata.taxable != "")) {

					var newTax = {
						"category": selectedCategory,
						"subCategory": createNewTaxCodeModeldata.subCategory,
						"taxCode": createNewTaxCodeModeldata.taxCode,
						"taxable": createNewTaxCodeModeldata.taxable,
						"Description": createNewTaxCodeModeldata.Description
					};
					avalaraTaxModelData.avalaraTax.push(newTax);
						this.onCancelCreateNewTaxCode();
				} else {
					sap.m.MessageToast.show("Please Enter Data in all Fields");
				}
			} else {

				var newTax = {
					"category": createNewTaxCodeModeldata.category,
					"subCategory": createNewTaxCodeModeldata.subCategory,
					"taxCode": createNewTaxCodeModeldata.taxCode,
					"taxable": createNewTaxCodeModeldata.taxable,
					"Description": createNewTaxCodeModeldata.Description
				};
				avalaraTaxModelData.avalaraTax.splice(selected, 1, newTax);
					this.onCancelCreateNewTaxCode();
			}
			avalaraTaxModel.refresh();
		

		},
		onCancelCreateNewTaxCode: function(oEvent) {
			var avalaraTaxModel = this.getView().getModel("avalaraTaxModel");
			var avalaraTaxModelData = avalaraTaxModel.getData();
			var createNewTaxCodeModel = this.getView().getModel("createNewTaxCodeModel");
			var createNewTaxCodeModeldata = createNewTaxCodeModel.getData();
			var selected = createNewTaxCodeModel.getProperty("/selected");
			if (createNewTaxCodeModeldata.buttonText === "Modify") {
				var newTax = {
					"category": createNewTaxCodeModeldata.category,
					"subCategory": createNewTaxCodeModeldata.subCategory,
					"taxCode": createNewTaxCodeModeldata.taxCode,
					"taxable": createNewTaxCodeModeldata.taxable,
					"Description": createNewTaxCodeModeldata.Description
				};
				avalaraTaxModelData.avalaraTax.splice(selected, 1, newTax);
			}

			this.creteNewTaxCodedialog.close();
			this.fragmentRefresh();
			this.buttonDisabled();

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
						name: "Category",
						template: {
							content: "{category}"
						}
					}, {
						name: "Sub Category",
						template: {
							content: "{subCategory}"
						}
					}, {
						name: "Avalara Tax Code",
						template: {
							content: "{taxCode}"
						}
					}, {
						name: "Taxable",
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
			oExport.saveFile("AVALARA TAX MAINTANENCE"); // download exported file 

		},
		// generatePagination:function()
		// {
		// 	var oPaginationModel=this.oPaginationModel;
		// 	var createNewTaxCodeModel=this.getView().getModel("createNewTaxCodeModel");
		// 	var totalResults=createNewTaxCodeModel.getProperty("/totalResults");
		// 	var countPerPage=20;
		// 	oPaginationModel.setProperty("/prevBtnVisible",false);
		// 	oPaginationModel.setProperty("/nextBtnVisible",false);
		// 	var pageCount=parseInt(totalResults/countPerPage);
		// 	if(pageCount%countPerPage!==0)
		// 	{
		// 		pageCount=pageCount+1;
		// 	}
		// 	if(pageCount>3)
		// 	{
		// 	oPaginationModel.setProperty("/nextBtnVisible",true);	
		// 	}
		// 	var array=[];
		// 	for(var i=1;i<=pageCount;i++)
		// 	{
		// 		var object={
		// 		text:i
		// 		};
		// 		array.push(object);
		// 	}
		// 		oPaginationModel.setProperty("/counters",array);
		// 		oPaginationModel.setproperty("/selectedPage",1);
		// 		oPaginationModel.refresh();
		// }
		// onFilter:function(oEvent)
		// {
		// 	var sFilter=oEvent.getSource().getValue();
		// 	var aFilters;
		// 	var aFilterContent;
		// 	var aFilterColumn;
		// }
			/******* Opens Filter dialog box *******/
		onFilterPress: function(oEvent) {
			//this.getOwnerComponent().byId("idFilterInput").setValue("");
			this.selectedColumn = oEvent.getSource().getParent().getContent()[1].getText();
			if (!this.filterInputDialog) {
				this.filterInputDialog = sap.ui.xmlfragment("freshDirectSKU.SKU.fragment.filterInput", this);
				this.getView().addDependent(this.filterInputDialog);
			}
			this.filterInputDialog.openBy(oEvent.getSource());
		},

		/********* Filtering table *********/
		tableFilter: function(oEvent) {
			var aFilters = [];
			var sQuery = "";
			var createNewTaxCodeModel = this.getView().getModel("createNewTaxCodeModel");
			if (oEvent) {
				sQuery = oEvent.getSource().getValue();
			}
			if (sQuery === "") {
				createNewTaxCodeModel.setProperty("/clearVisible", false);
			} else {
				createNewTaxCodeModel.setProperty("/clearVisible", true);
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
			var reqList =this.getView().byId("avalaraTaxCodeTable");
			var binding = reqList.getBinding("items");
			binding.filter(aFilters, "Application");

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