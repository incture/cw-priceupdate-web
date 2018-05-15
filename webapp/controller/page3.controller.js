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

	/*********************** Susmitha ****************/
	/*IDEATION CODE STARTS*/

	loadIdeationModel: function() {
		var oIdeationModel = this.getOwnerComponent().getModel('oIdeationModel');
		this.getView().setModel(oIdeationModel, "oIdeationModel");
		this.oIdeationModel = oIdeationModel;

		var oIdeationDropdownModel = this.getOwnerComponent().getModel('oIdeationDropdownModel');
		this.getView().setModel(oIdeationDropdownModel, "oIdeationDropdownModel");
		this.oIdeationDropdownModel = oIdeationDropdownModel;

		var oIdeationVisiblityModel = this.getOwnerComponent().getModel('oIdeationVisiblityModel');
		this.getView().setModel(oIdeationVisiblityModel, "oIdeationVisiblityModel");
		this.oIdeationVisiblityModel = oIdeationVisiblityModel;

		var oIdeationServiceModel = this.getOwnerComponent().getModel('oIdeationServiceModel');
		this.getView().setModel(oIdeationServiceModel, "oIdeationServiceModel");
		this.oIdeationServiceModel = oIdeationServiceModel;

		oIdeationDropdownModel.loadData("model/SKUModel.json");
		this.ideationTabRefresh();
	},

	//Below function performs check digit validation [JAVA service]
	/*GET Service to Check whether UPC is Valid or not*/
	checkUPCValidity: function() {

		var that = this;
		var oIdeationModel = this.oIdeationModel;
		var oIdeationServiceModel = this.oIdeationServiceModel;
		var oIdeationVisiblityModel = this.oIdeationVisiblityModel;
		var oResourceModel = this.oResourceModel;

		//var UPCCheckboxState = oIdeationModel.getProperty("/UPCCheckboxState");
		var validUPCMessage = oResourceModel.getProperty("/VALID_UPC");
		var invalidUPCMessage = oResourceModel.getProperty("/INVALID_UPC");

		var upc = oIdeationModel.getProperty("/upc");
		var sUrl = "/SKU/rest/skuRequest/upcValidation/" + upc;

		oIdeationServiceModel.loadData(sUrl, null, true, "GET", false, false, that.oHeader);
		oIdeationServiceModel.attachRequestCompleted(function(oEvent) {
			var message = oEvent.getSource().getData().message;
			if (message === "INVALID_UPC") {
				oIdeationVisiblityModel.setProperty("/UPCInvalidVisiblity", true);
				oIdeationVisiblityModel.setProperty("/UPCValidVisiblity", false);
				util.toastMessage(invalidUPCMessage);
			} else if (message === "VALID_UPC") {
				oIdeationVisiblityModel.setProperty("/UPCInvalidVisiblity", false);
				oIdeationVisiblityModel.setProperty("/UPCValidVisiblity", true);
				util.toastMessage(validUPCMessage);
			} else {
				oIdeationVisiblityModel.setProperty("/UPCInvalidVisiblity", false);
				oIdeationVisiblityModel.setProperty("/UPCValidVisiblity", false);
			}
			oIdeationVisiblityModel.rerfesh();
		});

		oIdeationServiceModel.attachRequestFailed(function(oEvent) {
			// that.busy.close();
		});
	},

	/*Function opens the pop-up to add new Brand*/
	openAddBrandPopup: function(oEvent) {
		var oIdeationModel = this.oIdeationModel;
		this.addBrandPopover = sap.ui.xmlfragment("freshdirect.SKU.fragments.addBrand", this);
		this.getView().addDependent(this.addBrandPopover);
		oIdeationModel.setProperty("/newBrand", "");
		this.addBrandPopover.openBy(oEvent.getSource());
	},

	//Below function closes the Brand pop-up
	onRejectNewBrand: function() {
		this.addBrandPopover.close();
	},

	/*Function to add new Brand to Existing Brands*/
	onAddNewBrand: function() {
		var oIdeationModel = this.oIdeationModel;
		var oIdeationDropdownModel = this.oIdeationDropdownModel;
		var brand = oIdeationDropdownModel.getProperty("/brand");
		var newBrand = oIdeationModel.getProperty("/newBrand");
		var obj = {
			"b": newBrand,
			"key": newBrand
		};
		brand.unshift(obj);
		oIdeationModel.setProperty("/brand", newBrand);
		oIdeationDropdownModel.refresh();
		oIdeationModel.refresh();
		this.addBrandPopover.close();
	},

	//UPCCheckboxSelected: function(oEvent) {
	//	var oIdeationModel = this.getView().getModel("oIdeationModel");
	//	var UPCCheckboxState = oEvent.getParameters().getSelected();
	//	oIdeationModel.setProperty("/targetActivation",	UPCCheckboxState);
	//	this.UPCvalid();
	//},

	/*Function to enable SAP Product Description TextArea*/
	onSAPProdDescEdit: function() {
		var oIdeationVisiblityModel = this.oIdeationVisiblityModel;
		oIdeationVisiblityModel.setProperty("/sapProdDescEditEnabled", true);
	},

	/*Function gives Target ASAP date when Target ASAP checkbox is checked*/
	targetActitivationDate: function() {
		//var oIdeationModel = this.oIdeationModel;
		var today = new Date();
		var modDate = today.setDate(today.getDate() + 13);
		var finaldate = new Date(modDate);
		return finaldate;
		//oIdeationModel.setProperty("/finalDate", finaldate);
	},

	/*Function sets the Target Activation Date when Target ASAP is checked*/
	onTarActASAP: function(oEvent) {
		var oIdeationModel = this.oIdeationModel;
		var oIdeationVisiblityModel = this.oIdeationVisiblityModel;
		var finalDate = this.targetActitivationDate();
		var checkboxState = oEvent.getSource().getSelected();
		//var finalDate = oIdeationModel.getProperty("/finalDate");

		var dd = finalDate.getDate();
		var mm = finalDate.getMonth() + 1;
		if (mm < 10) {
			mm = "0" + mm;
		}
		var yy = finalDate.getFullYear();
		var date = dd + "/" + mm + "/" + yy;
		if (checkboxState === true) {

			oIdeationModel.setProperty("/targetActivationDate", date);
			oIdeationVisiblityModel.setProperty("/tarActDateenabled", false);
		} else {
			oIdeationModel.setProperty("/targetActivationDate", "");
			oIdeationVisiblityModel.setProperty("/tarActDateEnabled", true);
		}
		oIdeationVisiblityModel.refresh();
	},

	/*Function is triggered when Target Activation date is selected Manually*/
	onTargetActivationDateChange: function(oEvent) {
		this.targetActitivationDate();
		var selectedDate = oEvent.getSource().getDateValue();
		var oIdeationModel = this.oIdeationModel;
		var oResourceModel = this.oResourceModel;
		var finalDate = oIdeationModel.getProperty("/finalDate");
		if (finalDate >= selectedDate) {
			var errorMessage = oResourceModel.getProperty("/TARGET_ACTIVATION_ERROR");
			util.toastMessage(errorMessage);
			oIdeationModel.setProperty("/tarActDate", "");
		}
	},

	/*Function to set the dropdown values for Tier2 based on Tier1 value Selected*/
	onTier1Selection: function(oEvent) {

		var oIdeationModel = this.oIdeationModel;
		var oIdeationDropdownModel = this.oIdeationDropdownModel;
		var selectedkey = oEvent.getSource().getSelectedKey();
		var tier2 = oIdeationDropdownModel.getProperty("/tier2");
		var temp1 = [];
		for (var i = 0; i < tier2.length; i++) {
			if (selectedkey === tier2[i].key) {
				temp1.push(tier2[i].value);
			}
		}

		oIdeationDropdownModel.setProperty("/tier2array", temp1);
		oIdeationModel.setProperty("/tier2", "");
		oIdeationModel.setProperty("/tier3", "");
		oIdeationModel.setProperty("/tier4", "");
	},

	/*Function to set the dropdown values for Tier3 based on Tier2 value Selected*/
	onTier2Selection: function(oEvent) {
		var oIdeationModel = this.oIdeationModel;
		var oIdeationDropdownModel = this.oIdeationDropdownModel;
		var selectedkey = oEvent.getSource().getSelectedKey();
		var tier3 = oIdeationDropdownModel.getProperty("/tier3");
		var temp2 = [];
		for (var i = 0; i < tier3.length; i++) {
			if (tier3[i].key === selectedkey) {
				temp2.push(tier3[i].value);
			}
		}
		oIdeationDropdownModel.setProperty("/tier3array", temp2);
		oIdeationModel.setProperty("/tier3", "");
		oIdeationModel.setProperty("/tier4", "");
	},

	/*Function to set the dropdown values for Tier4 based on Tier3 value Selected*/
	onTier3Selection: function(oEvent) {
		var oIdeationModel = this.oIdeationModel;
		var oIdeationDropdownModel = this.oIdeationDropdownModel;
		var tier4 = oIdeationDropdownModel.getProperty("/tier4");
		var selectedkey3 = oEvent.getSource().getSelectedKey();
		var temp3 = [];
		for (var i = 0; i < tier4.length; i++) {
			if (tier4[i].key === selectedkey3) {
				temp3.push(tier4[i].value);
			}
		}
		oIdeationDropdownModel.setProperty("/tier4array", temp3);
		oIdeationModel.setProperty("/tier4", "");
	},

	/*POST services to Create new SKU [JAVA service]*/
	onSubmit: function() {
		var that = this;
		var oIdeationServiceModel = this.oIdeationServiceModel;
		var oIdeationModel = this.oIdeationModel;
		var oResourceModel = this.oResourceModel;
		var SKUData = oIdeationModel.getProperty("/");
		if ((SKUData.targetActivationDate !== "" && SKUData.targetActivationDate !== undefined) &&
			(SKUData.brand !== "" && SKUData.brand !== undefined) &&
			(SKUData.materialType !== "" && SKUData.materialType !== undefined) &&
			(SKUData.upc !== "" && SKUData.upc !== undefined) &&
			(SKUData.storeTemperatureZone !== "" && SKUData.storeTemperatureZone !== undefined) &&
			(SKUData.tier1 !== "" && SKUData.tier1 !== undefined) &&
			(SKUData.tier2 !== "" && SKUData.tier2 !== undefined) &&
			(SKUData.tier3 !== "" && SKUData.tier3 !== undefined) &&
			(SKUData.tier4 !== "" && SKUData.tier4 !== undefined) &&
			(SKUData.attribute1 !== " " && SKUData.attribute1 !== undefined) &&
			(SKUData.attribute2 !== " " && SKUData.attribute2 !== undefined) &&
			(SKUData.attribute3 !== " " && SKUData.attribute3 !== undefined) &&
			(SKUData.attribute4 !== " " && SKUData.attribute4 !== undefined)) {

			var sUrl = "/SKU/rest/skuRequest/createRequest";
			var successMessage = oResourceModel.getProperty("/SKU_CREATION_SUCCESS");
			var errorMessage = oResourceModel.getProperty("/SKU_CREATION_ERROR");
			var oIdeationModelData = oIdeationModel.getProperty("/");
			this.busy.open();
			oIdeationServiceModel.loadData(sUrl, JSON.stringify(oIdeationModelData), true, "POST", false, false, that.oHeader);

			oIdeationServiceModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getSource().getData().status === "true") {
					util.toastMessage(successMessage);
					that.ideationTabRefresh();
				} else {
					util.toastMessage(successMessage);
				}
				that.busy.close();
			});

			oIdeationServiceModel.attachRequestFailed(function(oEvent) {
				that.busy.close();
			});

		} else {
			var errorMessage = oResourceModel.getProperty("/FILL_MANDATORY_FIELDS");
			util.toastMessage(errorMessage);

		}
	},

	/*Refresh the Ideation Page*/
	onCancel: function(oEvent) {
		this.ideationTabRefresh();
	},

	/*Function sets all the Ideation field values to null*/
	ideationTabRefresh: function() {
		var oIdeationModel = this.oIdeationModel;
		var oIdeationVisiblityModel = this.oIdeationVisiblityModel;
		oIdeationModel.setProperty("/brand", "");
		oIdeationModel.setProperty("/description", "");
		oIdeationModel.setProperty("/individualPackageSize", "");
		oIdeationModel.setProperty("/sapProductDescription", "");
		oIdeationModel.setProperty("/upc", "");
		oIdeationModel.setProperty("/packageType", "");
		oIdeationModel.setProperty("/packageCount", "");
		oIdeationModel.setProperty("/individualPackageSize", "");
		oIdeationModel.setProperty("/individualPackageSizeUom", "");
		oIdeationModel.setProperty("/storeTemperatureZone", "");
		oIdeationModel.setProperty("/materialType", "");
		oIdeationModel.setProperty("/buom", "");
		oIdeationModel.setProperty("/PLUCode", "");
		oIdeationModel.setProperty("/merchantProductFlavour", "");
		oIdeationModel.setProperty("/purchaseGroup", "");
		oIdeationModel.setProperty("/newBrand", "");
		oIdeationModel.setProperty("/targetActivation", false);
		oIdeationModel.setProperty("/targetActivationDate", "");
		oIdeationModel.setProperty("/tier1", "");
		oIdeationModel.setProperty("/tier2", "");
		oIdeationModel.setProperty("/tier3", "");
		oIdeationModel.setProperty("/tier4", "");
		oIdeationModel.setProperty("/attribute1", "");
		oIdeationModel.setProperty("/attribute2", "");
		oIdeationModel.setProperty("/attribute3", "");
		oIdeationModel.setProperty("/attribute4", "");

		oIdeationVisiblityModel.setProperty("/sapProdDescEditEnabled", false);
		oIdeationVisiblityModel.setProperty("/UPCInvalidVisiblity", false);
		oIdeationVisiblityModel.setProperty("/UPCValidVisiblity", false);
		oIdeationVisiblityModel.setProperty("/UPCCheckboxState", false);
		oIdeationVisiblityModel.setProperty("/sapProdDescValidVisiblity", false);
		oIdeationVisiblityModel.setProperty("/sapProdDescInvalidVisiblity", false);
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