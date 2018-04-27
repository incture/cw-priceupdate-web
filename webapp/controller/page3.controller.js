sap.ui.controller("freshDirectSKU.SKU.controller.page3", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf view.page3
	 */
	onInit: function() {
		this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		this.commercialFinanceModelLoad();
		this.loadModel();

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
	onShowSuggestion: function() {
		if (!this.referenceMaterialNumberDialog) {
			this.referenceMaterialNumberDialog = sap.ui.xmlfragment("freshDirectSKU.SKU.fragment.referenceMaterialNumber", this);
			this.getView().addDependent(this.referenceMaterialNumberDialog);
		}
		this.referenceMaterialNumberDialog.open();
	},
	onClose: function() {
		this.referenceMaterialNumberDialog.close();
	},

	/*IDEATION CODE STARTS*/

	loadModel: function() {
		var oDropdownModel = new sap.ui.model.json.JSONModel();
		oDropdownModel.loadData("model/SKUModel.json");
		this.getView().setModel(oDropdownModel, "oDropdownModel");
		this.oDropdownModel = oDropdownModel;
		var oIdeationModel = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oIdeationModel, "oIdeationModel");
		this.oIdeationModel = oIdeationModel;
		var oVisiblityModel = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oVisiblityModel, "oVisiblityModel");
		this.oVisiblityModel = oVisiblityModel;
		this.ideationTabRefresh();
	},

	onAddBrand: function(oEvent) {
		var oIdeationModel = this.oIdeationModel;
		this.addBrandPopover = sap.ui.xmlfragment(
			"freshDirectSKU.SKU.fragment.addBrand", this);
		this.getView().addDependent(this.addBrandPopover);
		oIdeationModel.setProperty("/newBrand","");
		this.addBrandPopover.openBy(oEvent.getSource());
	},
	
	onRejectNewBrand: function() {
		this.addBrandPopover.destroy();
	},
	
	onAddNewBrand: function() {
		var oIdeationModel = this.oIdeationModel;
		var oDropdownModel = this.oDropdownModel;
		var brand=oDropdownModel.getProperty("/brand");
		var newBrand = oIdeationModel.getProperty("/newBrand");
		var obj={
		"b": newBrand,
		"key": newBrand
		};
		brand.unshift(obj);
		oDropdownModel.setProperty("/brandSelectedKey",newBrand);
		oDropdownModel.refresh();
		this.addBrandPopover.destroy();
	},

	ideationTabRefresh: function() {
		var oIdeationModel = this.oIdeationModel;
		var oVisiblityModel = this.oVisiblityModel;
		oIdeationModel.setProperty("/brand", "");
		oIdeationModel.setProperty("/prodDesc", "");
		oIdeationModel.setProperty("/packageSize", "");
		oIdeationModel.setProperty("/tarActDate", "");
		oIdeationModel.setProperty("/sapProdDescvalid", "");
		oIdeationModel.setProperty("/upc", "");
		oIdeationModel.setProperty("/packageType", "");
		oIdeationModel.setProperty("/packageCount", "");
		oIdeationModel.setProperty("/indPackageSize", "");
		oIdeationModel.setProperty("/indPackageSizeUOM", "");
		oIdeationModel.setProperty("/tier1", "");
		oIdeationModel.setProperty("/tier2", "");
		oIdeationModel.setProperty("/tier3", "");
		oIdeationModel.setProperty("/tier4", "");
		oIdeationModel.setProperty("/categoryAttribute1", "");
		oIdeationModel.setProperty("/categoryAttribute2", "");
		oIdeationModel.setProperty("/categoryAttribute3", "");
		oIdeationModel.setProperty("/categoryAttribute4", "");
		oIdeationModel.setProperty("/stoarageTempZone", "");
		oIdeationModel.setProperty("/materialType", "");
		oIdeationModel.setProperty("/BUOM", "");
		oIdeationModel.setProperty("/PLUCode", "");
		oIdeationModel.setProperty("/merchantProductFlavour", "");
		oIdeationModel.setProperty("/PurchasingGroup", "");
		oIdeationModel.setProperty("/newBrand", "");
		oIdeationModel.setProperty("/tarActDateenabled", true);
		oVisiblityModel.setProperty("/sapProdDescEditEnabled", false);
		oVisiblityModel.setProperty("/UPCInvalidVisiblity", false);
		oVisiblityModel.setProperty("/UPCValidVisiblity", false);
		oVisiblityModel.setProperty("/UPCCheckboxState", false);
		oVisiblityModel.setProperty("/sapProdDescValidVisiblity", false);
		oVisiblityModel.setProperty("/sapProdDescInvalidVisiblity", false);
	},
	
	UPCCheckboxSelected: function(oEvent) {
		var oIdeationModel = this.getView().getModel(
			"oIdeationModel");
		var UPCCheckboxState = oEvent.getParameters().selected;
		oIdeationModel.setProperty("/UPCCheckboxState",
			UPCCheckboxState);
		this.UPCvalid();
	},
	
	UPCvalid: function(upc) {
		var oIdeationModel = this.oIdeationModel;
		var oVisiblityModel = this.oVisiblityModel;
		var UPCCheckboxState = oIdeationModel
			.getProperty("/UPCCheckboxState");
		var upc = oIdeationModel.getProperty("/upc");
		if (upc.length === 15 && UPCCheckboxState === true) {
			oVisiblityModel.setProperty("/UPCInvalidVisiblity",
				false);
			oVisiblityModel.setProperty("/UPCValidVisiblity",
				true);

		} else if (upc !== "" && UPCCheckboxState === true) {

			oVisiblityModel.setProperty("/UPCInvalidVisiblity",
				true);
			oVisiblityModel.setProperty("/UPCValidVisiblity",
				false);

		} else {
			oVisiblityModel.setProperty("/UPCInvalidVisiblity",
				false);
			oVisiblityModel.setProperty("/UPCValidVisiblity",
				false);

		}
	},

	onCancel: function(oEvent) {
		this.ideationTabRefresh();
	},
	
	sapProdDescfun: function(packageSize, brand, prodDesc, indPackageSizeUOM, packageCount) {

		if ((packageSize !== "" && packageSize !== undefined) && (brand !== "" && brand !== undefined) && (prodDesc !== "" && prodDesc !==
				undefined) && (indPackageSizeUOM !== "" && indPackageSizeUOM !== undefined) && (packageCount !== " " && indPackageSizeUOM !==
				undefined)) {
			var sapProdDesc = brand + " " + prodDesc + "" + packageCount + " " + packageSize + " " + indPackageSizeUOM;
			var oVisiblityModel = this.oVisiblityModel;
			if (sapProdDesc.length > 40) {
				oVisiblityModel.setProperty(
					"/sapProdDescValidVisiblity", false);
				oVisiblityModel.setProperty(
					"/sapProdDescInvalidVisiblity", true);
			} else {
				oVisiblityModel.setProperty(
					"/sapProdDescValidVisiblity", true);
				oVisiblityModel.setProperty(
					"/sapProdDescInvalidVisiblity", false);
			}
			return sapProdDesc;
		}

	},
	targetActitivationDate: function() {
		var oIdeationModel = this.oIdeationModel;
		var today = new Date();
		var modDate = today.setDate(today.getDate() + 13);
		var finaldate = new Date(modDate);
		oIdeationModel.setProperty("/finalDate", finaldate);
	},
	
	tarActASAPfn: function(oEvent) {
		var oIdeationModel = this.oIdeationModel;
		var oVisiblityModel = this.oVisiblityModel;
		this.targetActitivationDate();
		var checkboxState = oEvent.getParameters().selected;
		var finalDate = oIdeationModel
			.getProperty("/finalDate");
		var dd = finalDate.getDate();
		var mm = finalDate.getMonth() + 1;
		var yy = finalDate.getFullYear();
		var date = dd + "/" + mm + "/" + yy;
		if (checkboxState === true) {

			oIdeationModel.setProperty("/tarActDate", date);
			oIdeationModel.setProperty("/tarActDateenabled",
				false);
		} else {
			oIdeationModel.setProperty("/tarActMinDate", date);
			oIdeationModel.setProperty("/tarActDate", "");
			oVisiblityModel.setProperty("/tarActDateEnabled",
				true);
		}
	},
	
	onTargetActivationDateChange: function(oEvent) {
		this.targetActitivationDate();
		var selectedDate = oEvent.getSource().getDateValue();
		var oIdeationModel = this.oIdeationModel;
		var finalDate = oIdeationModel
			.getProperty("/finalDate");
		if (finalDate >= selectedDate) {

			sap.m.MessageBox
				.show(
					"Target Activation date should be more than 14 days from current date", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "info"
					});
			oIdeationModel.setProperty("/tarActDate", "");
		}

	},
	
	sapProdDescEdit: function() {
		var oVisiblityModel = this.oVisiblityModel;
		oVisiblityModel.setProperty("/sapProdDescEditEnabled",
			true);
	},

	onTier1Selection: function(oEvent) {

		var oIdeationModel = this.oIdeationModel;
		var oDropdownModel = this.oDropdownModel;
		var selectedkey = oEvent.getSource().getSelectedKey();
		var tier2 = oDropdownModel.getProperty("/tier2");
		var temp1 = [];
		for (var i = 0; i < tier2.length; i++) {
			if (selectedkey === tier2[i].key) {
				temp1.push(tier2[i].value);
			}
		}

		oDropdownModel.setProperty("/tier2array", temp1);
		oIdeationModel.setProperty("/tier2", "");
		oIdeationModel.setProperty("/tier3", "");
		oIdeationModel.setProperty("/tier4", "");
	},

	onTier2Selection: function(oEvent) {
		var oIdeationModel = this.oIdeationModel;
		var oDropdownModel = this.oDropdownModel;
		var selectedkey = oEvent.getSource().getSelectedKey();
		var tier3 = oDropdownModel.getProperty("/tier3");
		var temp2 = [];
		for (var i = 0; i < tier3.length; i++) {
			if (tier3[i].key === selectedkey) {
				temp2.push(tier3[i].value);
			}
		}
		oDropdownModel.setProperty("/tier3array", temp2);
		oIdeationModel.setProperty("/tier3", "");
		oIdeationModel.setProperty("/tier4", "");
	},
	
	onTier3Selection: function(oEvent) {
		var oIdeationModel = this.oIdeationModel;
		var oDropdownModel = this.oDropdownModel;
		var tier4 = oDropdownModel.getProperty("/tier4");
		var selectedkey3 = oEvent.getSource().getSelectedKey();
		var temp3 = [];
		for (var i = 0; i < tier4.length; i++) {
			if (tier4[i].key === selectedkey3) {
				temp3.push(tier4[i].value);
			}
		}
		oDropdownModel.setProperty("/tier4array", temp3);
		oIdeationModel.setProperty("/tier4", "");
	},
	
	onSubmit: function() {
		var that = this;
		var oIdeationModel = this.oIdeationModel;
		var SKUData = oIdeationModel.getProperty("/");
		if ((SKUData.packageSize !== "" && SKUData.packageSize !== undefined) && 
		(SKUData.brand !== "" && SKUData.brand !== undefined) &&
		(SKUData.prodDesc !== "" && SKUData.prodDesc !== undefined) && 
		(SKUData.indPackageSizeUOM !== "" && SKUData.indPackageSizeUOM !==undefined) &&
		(SKUData.packageCount !== " " && SKUData.indPackageSizeUOM !== undefined) && 
		(SKUData.upc !== "" && SKUData.upc !== undefined) &&
		(SKUData.merchantProductName !== "" && SKUData.merchantProductName !== undefined) &&
		(SKUData.stoarageTempZone !== "" && SKUData.stoarageTempZone !== undefined) && 
		(SKUData.tier1 !== "" && SKUData.tier1 !== undefined) &&
		(SKUData.tier2 !== "" && SKUData.tier2 !== undefined) && 
		(SKUData.tier3 !== "" && SKUData.tier3 !== undefined) &&
		(SKUData.tier4 !== "" && SKUData.tier4 !== undefined) && 
		(SKUData.categoryAttribute1 !== " " && SKUData.categoryAttribute1 !==undefined) &&
		(SKUData.categoryAttribute2 !== " " && SKUData.categoryAttribute2 !== undefined) &&
		(SKUData.categoryAttribute3 !== " " && SKUData.categoryAttribute3 !== undefined) &&
		(SKUData.categoryAttribute4 !== " " && SKUData.categoryAttribute4 !== undefined) && 
		(SKUData.packageCount !== " " && SKUData.packageCount !==undefined)) {
			that.ideationTabRefresh();
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
	},

	/*IDEATION CODE ENDS*/
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