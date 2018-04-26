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

	onAddBrand: function(oEvent) {
		this.popover = sap.ui.xmlfragment(
			"freshdirect.SKU.fragment.addBrand", this);
		this.getView().addDependent(this.popover);
		this.popover.openBy(oEvent.getSource());
	},
	onRejectNewBrand: function() {

		this.popover.destroy();

	},
	onAddNewBrand: function() {
		var oIdeationModel = this.getView().getModel(
			"oIdeationModel");
		var newBrand = oIdeationModel.getProperty("/newBrand",
			"");
		oIdeationModel.setProperty("/brand", newBrand);

		this.popover.destroy();

	},
	loadModel: function() {
		var oDropdownModel = new sap.ui.model.json.JSONModel();
		oDropdownModel.loadData("model/oDropdownModel.json");
		this.getView().setModel(oDropdownModel, "oDropdownModel");
			var oIdeationModel = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oIdeationModel,
			"oIdeationModel");
		this.setoIdeationModelProperty();
	},

	setoIdeationModelProperty: function() {
		var oIdeationModel = this.getView().getModel(
			"oIdeationModel");
		oIdeationModel.setProperty("/brand", "");
		oIdeationModel.setProperty("/prodDesc", "");
		oIdeationModel.setProperty("/packageSize", "");
		oIdeationModel.setProperty("/tarActDateenabled", true);
		oIdeationModel.setProperty("/sapProdDescEditEnabled", false);
		oIdeationModel.setProperty("/tarActDate", "");
		oIdeationModel.setProperty("/sapProdDescvalid", "");
		oIdeationModel.setProperty("/sapProdDescValidVisiblity", false);
		oIdeationModel.setProperty("/sapProdDescInvalidVisiblity", false);
		oIdeationModel.setProperty("/upc", "");
		oIdeationModel.setProperty("/UPCInvalidVisiblity", false);
		oIdeationModel.setProperty("/UPCValidVisiblity", false);
		oIdeationModel.setProperty("/UPCCheckboxState", false);
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
		var oIdeationModel = this.getView().getModel(
			"oIdeationModel");
		var UPCCheckboxState = oIdeationModel
			.getProperty("/UPCCheckboxState");
		var upc = oIdeationModel.getProperty("/upc");
		if (upc.length === 15 && UPCCheckboxState === true) {
			oIdeationModel.setProperty("/UPCInvalidVisiblity",
				false);
			oIdeationModel.setProperty("/UPCValidVisiblity",
				true);

		} else if (upc !== "" && UPCCheckboxState === true) {

			oIdeationModel.setProperty("/UPCInvalidVisiblity",
				true);
			oIdeationModel.setProperty("/UPCValidVisiblity",
				false);

		} else {
			oIdeationModel.setProperty("/UPCInvalidVisiblity",
				false);
			oIdeationModel.setProperty("/UPCValidVisiblity",
				false);

		}
	},

	onCancel: function(oEvent) {
		// this.dialog.close();
		this.setoIdeationModelProperty();
	},
	sapProdDescfun: function(packageSize, brand, prodDesc,
		indPackageSizeUOM, packageCount) {

		if ((packageSize !== "" && packageSize !== undefined) && (brand !== "" && brand !== undefined) && (prodDesc !== "" && prodDesc !==
				undefined) && (indPackageSizeUOM !== "" && indPackageSizeUOM !== undefined) && (packageCount !== " " && indPackageSizeUOM !==
				undefined)) {
			var sapProdDesc = brand + " " + prodDesc + "" + packageCount + " " + packageSize + " " + indPackageSizeUOM;
			var oIdeationModel = this.getView().getModel(
				"oIdeationModel");
			if (sapProdDesc.length > 40) {
				oIdeationModel.setProperty(
					"/sapProdDescValidVisiblity", false);
				oIdeationModel.setProperty(
					"/sapProdDescInvalidVisiblity", true);
			} else {
				oIdeationModel.setProperty(
					"/sapProdDescValidVisiblity", true);
				oIdeationModel.setProperty(
					"/sapProdDescInvalidVisiblity", false);
			}
			return sapProdDesc;
		}

	},
	targetActitivationDate: function() {
		var oIdeationModel = this.getView().getModel(
			"oIdeationModel");
		var today = new Date();
		var modDate = today.setDate(today.getDate() + 13);
		var finaldate = new Date(modDate);
		oIdeationModel.setProperty("/finalDate", finaldate);
	},
	tarActASAPfn: function(oEvent) {
		this.targetActitivationDate();
		var oIdeationModel = this.getView().getModel(
			"oIdeationModel");
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
			oIdeationModel.setProperty("/tarActDateenabled",
				true);
		}
	},
	onTargetActivationDateChange: function(oEvent) {
		this.targetActitivationDate();
		var selectedDate = oEvent.getSource().getDateValue();
		var oIdeationModel = this.getView().getModel(
			"oIdeationModel");
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
		var oIdeationModel = this.getView().getModel(
			"oIdeationModel");
		oIdeationModel.setProperty("/sapProdDescEditEnabled",
			true);
	},

	onTier1Selection: function(oEvent) {

		var temp1 = [];
		var oDropdownModel = this.getView().getModel("oDropdownModel");
		var oIdeationModel = this.getView().getModel(
			"oIdeationModel");
		var oDropdownModelData = oDropdownModel.getData().tier1;
		var selectedkey = oEvent.getSource().getSelectedKey();
		var tier2Data = oDropdownModel.getData().tier2;

		for (var i = 0; i < oDropdownModelData.length; i++) {
			if (selectedkey === tier2Data[i].key) {
				temp1.push(tier2Data[i].value);
			}
		}

		oDropdownModel.setProperty("/tier2array", temp1);
		oIdeationModel.setProperty("/tier2", "");
		oIdeationModel.setProperty("/tier3", "");
		oIdeationModel.setProperty("/tier4", "");
	},

	onTier2Selection: function(oEvent) {
		var oDropdownModel = this.getView().getModel("oDropdownModel");
		var oIdeationModel = this.getView().getModel(
			"oIdeationModel");
		var oDropdownModelData = oDropdownModel.getData();
		var selectedkey = oEvent.getSource().getSelectedKey();
		var temp2 = [];
		for (var i = 0; i < oDropdownModelData.tier3.length; i++) {
			if (oDropdownModelData.tier3[i].key === selectedkey) {
				temp2.push(oDropdownModelData.tier3[i].value);
				oDropdownModel.setProperty("/tier3array", temp2);
				console.log(temp2);
				oIdeationModel.setProperty("/tier3", "");
				oIdeationModel.setProperty("/tier4", "");
			}
		}
	},
	onTier3Selection: function(oEvent) {
		var oDropdownModel = this.getView().getModel("oDropdownModel");
		var oIdeationModel = this.getView().getModel(
			"oIdeationModel");
		var oDropdownModelData = oDropdownModel.getData();
		var selectedkey3 = oEvent.getSource().getSelectedKey();
		var temp3 = [];
		for (var i = 0; i < oDropdownModelData.tier4.length; i++) {
			if (oDropdownModelData.tier4[i].key === selectedkey3) {
				temp3.push(oDropdownModelData.tier4[i].value);
				console.log(temp3);
				oDropdownModel.setProperty("/tier4array", temp3);
				oIdeationModel.setProperty("/tier4", "");
			}
		}
	},
	onSubmit: function() {
		var that = this;
		var oIdeationModel = this.getView().getModel(
			"oIdeationModel");
		var SKUData = oIdeationModel.getData();
		if ((SKUData.packageSize != "" && SKUData.packageSize != undefined) && (SKUData.brand != "" && SKUData.brand != undefined) && (
				SKUData.prodDesc != "" && SKUData.prodDesc != undefined) && (SKUData.indPackageSizeUOM != "" && SKUData.indPackageSizeUOM !=
				undefined) && (SKUData.packageCount != " " && SKUData.indPackageSizeUOM != undefined) && (SKUData.upc != "" && SKUData.upc !=
				undefined) && (SKUData.merchantProductName != "" && SKUData.merchantProductName != undefined) && (SKUData.stoarageTempZone != "" &&
				SKUData.stoarageTempZone != undefined) && (SKUData.tier1 != "" && SKUData.tier1 != undefined) && (SKUData.tier2 != "" && SKUData.tier2 !=
				undefined) && (SKUData.tier3 != "" && SKUData.tier3 != undefined) && (SKUData.tier4 != "" && SKUData.tier4 != undefined) && (
				SKUData.categoryAttribute1 != " " && SKUData.categoryAttribute1 != undefined) && (SKUData.categoryAttribute2 != " " && SKUData.categoryAttribute2 !=
				undefined) && (SKUData.categoryAttribute3 != " " && SKUData.categoryAttribute3 != undefined) && (SKUData.categoryAttribute4 !=
				" " && SKUData.categoryAttribute4 != undefined) && (SKUData.packageCount != " " && SKUData.packageCount != undefined)) {
			that.setoIdeationModelProperty();
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