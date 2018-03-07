jQuery.sap.require("sap.m.MessageBox");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/incture/formatter/formatter",
	"sap/m/BusyDialog",
	"com/incture/formatter/dateFunctions",
	"sap/ui/core/format/DateFormat",
	"com/incture/formatter/conditionRecDialog"
], function(Controller, formatter, BusyDialog, dateFunctions, oDateFormat, conditionRecDialog) {
	"use strict";
	return Controller.extend("com.incture.controller.materialDetails", {

		onInit: function() {

			var that = this;
			this.busy = new BusyDialog();

			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this.oHeader = {
				"Accept": "application/json",
				"Content-Type": "application/json"
			};

			var oMatSectionModel = this.getOwnerComponent().getModel("oMatSectionModel");
			this.oMatSectionModel = oMatSectionModel;

			var oScalePathModel = this.getOwnerComponent().getModel("oScalePathModel");
			this.oScalePathModel = oScalePathModel;

			var oSubmitModel = this.getOwnerComponent().getModel("oSubmitModel");
			this.oSubmitModel = oSubmitModel;

			var oBusinessContextModel = this.getOwnerComponent().getModel("oBusinessContextModel");
			this.oBusinessContextModel = oBusinessContextModel;

			var oNetPriceModel = this.getOwnerComponent().getModel("oNetPriceModel");
			this.oNetPriceModel = oNetPriceModel;

			var oTempModel = this.getOwnerComponent().getModel("oTempModel");
			this.oTempModel = oTempModel;

			this._router.getRoute("materialDetails").attachPatternMatched(
				this.routePatternMatched, this);
		},

		routePatternMatched: function() {
			this.isActive = "Active";
			this.isChanged = "ALL";
			this.selectedTabSPath = "";
			this.errorStateBVal = 0;
			this.selectedIconTab = "";
			this.conditionRecord = "";
			this.getVariableKeyData();
			this.generateMatTableColumns();
			this.getMaterialData();

			//this.generateCmntBox();
			var oElementVisibleModel = this.getOwnerComponent().getModel("oElementVisibleModel");
			this.oElementVisibleModel = oElementVisibleModel;

			var oAdvanceSearchModel = this.getOwnerComponent().getModel("oVariableKeyModel");
			var oSearchArry = oAdvanceSearchModel.getData().rows[0];
			var len = oSearchArry.length;
			for (var i = 0; i < len; i++) {
				if (oSearchArry[i] === "Update Pending") {
					oElementVisibleModel.getData().submitButton = false;
					oElementVisibleModel.getData().revokeButton = true;
					oElementVisibleModel.getData().saveButton = false;
					oElementVisibleModel.getData().addButton = false;
					oElementVisibleModel.getData().undoButton = false;
					oElementVisibleModel.getData().toolbarVisible = true;
					oElementVisibleModel.getData().imageVisible = true;
					oElementVisibleModel.getData().addScaleButton = false;
					oElementVisibleModel.getData().deletecaleButton = false;
					oElementVisibleModel.getData().scaleImage = true;
					oElementVisibleModel.getData().cancelScaleButton = false;
					oElementVisibleModel.getData().scaleTableMode = "None";
				} else if (oSearchArry[i] === "Available") {
					oElementVisibleModel.getData().submitButton = true;
					oElementVisibleModel.getData().revokeButton = false;
					oElementVisibleModel.getData().saveButton = true;
					oElementVisibleModel.getData().addButton = true;
					oElementVisibleModel.getData().undoButton = true;
					oElementVisibleModel.getData().toolbarVisible = false;
					oElementVisibleModel.getData().imageVisible = true;
					oElementVisibleModel.getData().addScaleButton = true;
					oElementVisibleModel.getData().deletecaleButton = true;
					oElementVisibleModel.getData().scaleImage = true;
					oElementVisibleModel.getData().cancelScaleButton = true;
					oElementVisibleModel.getData().scaleTableMode = "None";
				} else {
					oElementVisibleModel.getData().submitButton = true;
					oElementVisibleModel.getData().revokeButton = false;
					oElementVisibleModel.getData().saveButton = true;
					oElementVisibleModel.getData().addButton = true;
					oElementVisibleModel.getData().undoButton = true;
					oElementVisibleModel.getData().toolbarVisible = false;
					oElementVisibleModel.getData().imageVisible = true;
					oElementVisibleModel.getData().addScaleButton = true;
					oElementVisibleModel.getData().deletecaleButton = true;
					oElementVisibleModel.getData().scaleImage = true;
					oElementVisibleModel.getData().cancelScaleButton = true;
					oElementVisibleModel.getData().scaleTableMode = "None";
				}
			}

			oElementVisibleModel.getData().setStatus = this.isActive;
			oElementVisibleModel.getData().setRecord = this.isChanged;
			oElementVisibleModel.refresh(true);

			var oTable = this.getView().byId("TABLEOFMATERIAL");
			oTable.setVisible(true);
			var oVBox = this.getView().byId("NETPRICEDATA");
			oVBox.setVisible(false);

			var oResourceModel = this.getOwnerComponent().getModel("i18n");
			this.oResourceModel = oResourceModel.getResourceBundle();
			this.oUndoModel = this.getOwnerComponent().getModel("oUndoModel");
			this.oSplitRecordsModel = this.getOwnerComponent().getModel("oSplitRecordsModel");
		},

		//Service to get Materials list, getting the view data.
		getMaterialData: function() {

			var oPayload;
			var that = this;
			this.busy.open();
			var oMatSectionModel = this.oMatSectionModel;
			var oBusinessContextModel = this.oBusinessContextModel;
			var oVariableKeyModel = this.getOwnerComponent().getModel("oVariableKeyModel");
			var data = oVariableKeyModel.getData().rows[0];
			var decisionTableId = data[0];
			var status = data[(data.length) - 1];
			var headerList = this.getOwnerComponent().getModel("oMatSearchModel").getData().metadata;
			var contextMetadata = this.getOwnerComponent().getModel("oMatSearchModel").getData().contextMetadata;
			var sUrl = "/CWPRICE_WEB/conditionRecord/getAllRecords";
			if (status === "Update Pending") {
				oPayload = {
					"usageId": "A",
					"uiName": "4",
					"singleRecords": data,
					"metaData": headerList,
					"decisionTableId": decisionTableId,
					"mode": "Task",
					"contextMetadataDto": contextMetadata,
					"status": status,
					"recordType": this.isActive,
					"changeMode": this.isChanged,
					"userType": "V"
				};
			} else {
				oPayload = {
					"usageId": "A",
					"uiName": "3",
					"singleRecords": data,
					"metaData": headerList,
					"decisionTableId": decisionTableId,
					"mode": "Read",
					"contextMetadataDto": contextMetadata,
					"recordType": this.isActive,
					"userType": "V"
				};
			}
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, JSON.stringify(oPayload), true, "POST", false, false, that.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = oEvent.getSource().getData();
					var businessContextParams = jQuery.extend(true, {}, resultData);
					oBusinessContextModel.setData(businessContextParams);
					var conditionData = resultData.conditionTypesRecords;
					var businessObjectList = resultData.businessObjectList;

					var pricelistTblCol = jQuery.extend(true, [], resultData.tableColumn);
					pricelistTblCol = formatter.setUserDialogColVisible(pricelistTblCol, "false");
					resultData.pricelistTblCol = pricelistTblCol;

					if (businessObjectList) {
						if (!Array.isArray(businessObjectList)) {
							var tempArry = [];
							tempArry.push(businessObjectList);
							resultData.businessObjectList = tempArry;
						}

						//Deleting Objects having "isVisible" property "false", 
						//As aggregation binding on Grid Layout, with invisible controls creates placeholder. 
						var length = businessObjectList.length;
						for (var i = length - 1; i >= 0; i--) {
							if (businessObjectList[i].isVisible === "false" || businessObjectList[i].isVisible === false) {
								businessObjectList.splice(i, 1);
							}
						}
					} else {
						that.oElementVisibleModel.getData().addButton = true;
						that.oElementVisibleModel.getData().undoButton = true;
						that.oElementVisibleModel.refresh();
					}
					that.conditionRecord = resultData.conditionTypes[0].conditionId;
					oMatSectionModel.setData(resultData);
					if (conditionData) {
						if (!Array.isArray(conditionData.entry)) {
							var tempArry = [];
							tempArry.push(conditionData.entry);
							resultData.conditionTypesRecords.entry = tempArry;
						}
					}
					formatter.addConditionRecArray(oMatSectionModel, that.oUndoModel);

					//Deltet below line
					var oConditionTypeRec = oMatSectionModel.getProperty("/conditionTypesRecords");
					dateFunctions.sortConditionRecords(oConditionTypeRec.entry[0].value.listMatrialInfoRecord);
					//

					//Adding version2 data structure in oMatSectionModel, for the latest change made in UI for ECC validation
					//This array 'Version2' is not used in UI, but changes made in UI are sent to sevice.
					var oConditionTypeRec = oMatSectionModel.getProperty("/conditionTypesRecords");
					var oVersion2Log = jQuery.extend(true, {}, oConditionTypeRec);
					oMatSectionModel.setProperty("/oVersion2Log", oVersion2Log);
					////////////////////////////

					var conditionRecords = that.conditionRecord;
					that.setBussinessContext(status);
					that.setDataOnCondition(status, conditionRecords);
					that.createHeaderComment();

					//Set first tab as default in condition record tab view on load.
					var oMatTable = that.getView().byId("PRICE_UPDATE_MAT_TABLE");
					oMatTable.getParent().setSelectedKey(conditionRecords);
					oMatTable.getParent().rerender();
					that.busy.close();
				} else {
					//var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
					var errorText = oEvent.getParameters().errorobject.statusText;
					formatter.toastMessage(errorText);
					that.busy.close();
				}
			});

			oModel.attachRequestFailed(function(oEvent) {
				//var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
				var errorText = oEvent.getParameters().errorobject.statusText;
				formatter.toastMessage(errorText);
				that.busy.close();
			});
			that.busy.close();
		},

		setBussinessContext: function(status) {

			var that = this;
			switch (status) {
				case "Update Pending":
					that.setPendingUIBusinessContext();
					break;

				case "Available":
					that.setUIBusinessContext();
					break;

				default:
					that.setUIBusinessContext();
					break;
			}
		},

		setDataOnCondition: function(status, conditionRecords) {

			var that = this;
			switch (status) {
				case "Update Pending":
					that.onPendingIconBarSelect(conditionRecords, status);
					break;

				case "Available":
					that.onIconBarSelect(conditionRecords, status);
					break;

				default:
					that.onIconBarSelect(conditionRecords, status);
					break;
			}
		},

		//Binding contents for "Purchase Info Record" grid layout
		setUIBusinessContext: function() {

			var that = this;
			var oInfoRecGrid = this.getView().byId("INFO_REC_GRID");
			oInfoRecGrid.bindAggregation("content", "oMatSectionModel>/businessObjectList", function(index, context) {
				var contextPath = context.getPath();
				var oMatSectionModel = context.getModel();
				var bindingPath = "oMatSectionModel>" + contextPath;
				var sPath = "oMatSectionModel>" + contextPath + "/boList";
				var currentObj = oMatSectionModel.getProperty(contextPath);
				//            var hasLabel = currentObj.hasOwnProperty("label");
				var hasFieldInput = currentObj.hasOwnProperty("boList");
				var fieldVisible = formatter.formatBooleanValues(currentObj.isVisible);

				if (hasFieldInput) {
					if (!Array.isArray(currentObj.boList)) {
						var oTempArry = [];
						oTempArry.push(currentObj.boList);
						currentObj.boList = oTempArry;
						currentObj.width = "100%";
					} else {
						currentObj.width = "80%";
					}
				}

				if (fieldVisible) {
					var oHBox = new sap.m.HBox();
					var oLabel = new sap.m.Label({
						required: {
							path: bindingPath + "/isMandatory",
							formatter: formatter.formatBooleanValues
						},
						tooltip: "{" + bindingPath + "/label}",
						text: "{" + bindingPath + "/label}" + ":"
					}).addStyleClass('gridLblClass');
					oHBox.addItem(oLabel);

					var oItems = new sap.m.HBox();
					oItems.bindAggregation("items", sPath, function(index, context, currentObj) {
						var contextPath = context.getPath();
						var oMatSectionModel = context.getModel();
						var sPath = "oMatSectionModel>" + contextPath;
						var currentObj = oMatSectionModel.getProperty(contextPath);
						var fieldType = currentObj.uiFieldType;
						var index = "/" + contextPath.split("/")[1] + "/" + contextPath.split("/")[2];
						var parentObj = oMatSectionModel.getProperty(index);

						if (fieldType === "Input") {
							var oInput = new sap.m.Input({
								width: parentObj.width,
								value: "{" + sPath + "/fieldValueNew}",
								maxLength: {
									path: sPath + "/fieldLength",
									formatter: formatter.formatMaxLength
								},
								visible: {
									path: sPath + "/isVisible",
									formatter: formatter.formatBooleanValues
								},
								enabled: {
									path: sPath + "/isEditable",
									formatter: formatter.formatBooleanValues
								},
								showSuggestion: {
									path: sPath + "/isLookup",
									formatter: formatter.formatBooleanValues
								},
								valueState: {
									path: sPath + "/valueState",
									formatter: formatter.formaValueState
								},
								change: function(oEvent) {
									var oBusinessContextModel = that.oBusinessContextModel;
									formatter.setBusinessContextParams(oEvent, oMatSectionModel, oBusinessContextModel);
									formatter.checkValidInputType(oEvent, oMatSectionModel, "oMatSectionModel");
								}
							}).addStyleClass("businessContextInputClass");
							var oDataTemplate = new sap.ui.core.CustomData({
								key: "{" + sPath + "/fieldId}"
							});
							oDataTemplate.bindProperty("value", "answer");
							oInput.addCustomData(oDataTemplate);
							return oInput;
						} else if (fieldType === "Text") {
							var oText = new sap.m.Label({
								text: "{" + sPath + "/fieldValueNew}",
								visible: {
									path: sPath + "/isVisible",
									formatter: formatter.formatBooleanValues
								}
							}).addStyleClass("businessContextTextClass");
							return oText;
						}
					});
					oHBox.addItem(oItems);
					return oHBox;
				} else {
					var oLabel = new sap.m.Label({
						visible: false
					});
					return oLabel;
				}
			});
		},

		setPendingUIBusinessContext: function() {

			var that = this;
			var oInfoRecGrid = this.getView().byId("INFO_REC_GRID");
			oInfoRecGrid.bindAggregation("content", "oMatSectionModel>/businessObjectList", function(index, context) {
				var contextPath = context.getPath();
				var oMatSectionModel = context.getModel();
				var bindingPath = "oMatSectionModel>" + contextPath;
				var sPath = "oMatSectionModel>" + contextPath + "/boList";
				var currentObj = oMatSectionModel.getProperty(contextPath);

				//var hasLabel = currentObj.hasOwnProperty("label");
				var hasFieldInput = currentObj.hasOwnProperty("boList");
				var fieldVisible = formatter.formatBooleanValues(currentObj.isVisible);

				if (hasFieldInput) {
					if (!Array.isArray(currentObj.boList)) {
						var oTempArry = [];
						oTempArry.push(currentObj.boList);
						currentObj.boList = oTempArry;
						currentObj.width = "100%";
					} else {
						currentObj.width = "80%";
					}
				}

				if (fieldVisible) {
					var oHBox = new sap.m.HBox();
					var oLabel = new sap.m.Label({
						required: {
							path: bindingPath + "/isMandatory",
							formatter: formatter.formatBooleanValues
						},
						tooltip: "{" + bindingPath + "/label}",
						text: "{" + bindingPath + "/label}" + ":"
					}).addStyleClass('gridLblClass');
					oHBox.addItem(oLabel);

					var oItems = new sap.m.HBox();
					oItems.bindAggregation("items", sPath, function(index, context, currentObj) {
						var contextPath = context.getPath();
						var oMatSectionModel = context.getModel();
						var sPath = "oMatSectionModel>" + contextPath;
						var currentObj = oMatSectionModel.getProperty(contextPath);
						var fieldType = currentObj.uiFieldType;
						var index = "/" + contextPath.split("/")[1] + "/" + contextPath.split("/")[2];
						var parentObj = oMatSectionModel.getProperty(index);
						if (fieldType === "Input") {
							if (currentObj.fieldValueNew === currentObj.fieldValue || currentObj.fieldValue === null || currentObj.fieldValue === "") {
								var oInput = new sap.m.Input({
									width: parentObj.width,
									value: "{" + sPath + "/fieldValueNew}",
									maxLength: {
										path: sPath + "/fieldLength",
										formatter: formatter.formatMaxLength
									},
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatBooleanValues
									},
									enabled: {
										path: sPath + "/isEditable",
										formatter: formatter.formatBooleanValues
									},
									showSuggestion: {
										path: sPath + "/isLookup",
										formatter: formatter.formatBooleanValues
									},
									valueState: {
										path: sPath + "/valueState",
										formatter: formatter.formaValueState
									},
									change: function(oEvent){
										formatter.checkValidInputType(oEvent, oMatSectionModel, "oMatSectionModel");
									}
								}).addStyleClass("businessContextInputClass");
								var oDataTemplate = new sap.ui.core.CustomData({
									key: "{" + sPath + "/fieldId}"
								});
								oDataTemplate.bindProperty("value", "answer");
								oInput.addCustomData(oDataTemplate);
								return oInput;
							} else {
								var oVBox = new sap.m.VBox();
								var oNewInput = new sap.m.Input({
									width: parentObj.width,
									value: "{" + sPath + "/fieldValueNew}",
									maxLength: {
										path: sPath + "/fieldLength",
										formatter: formatter.formatMaxLength
									},
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatBooleanValues
									},
									enabled: {
										path: sPath + "/isEditable",
										formatter: formatter.formatBooleanValues
									},
									showSuggestion: {
										path: sPath + "/isLookup",
										formatter: formatter.formatBooleanValues
									},
									valueState: {
										path: sPath + "/valueState",
										formatter: formatter.formaValueState
									},
									change:function(oEvent){
										formatter.checkValidInputType(oEvent, oMatSectionModel, "oMatSectionModel");
									}
								}).addStyleClass("businessContextInputClass");
								var oDataTemplate = new sap.ui.core.CustomData({
									key: "{" + sPath + "/fieldId}"
								});
								oDataTemplate.bindProperty("value", "answer");
								oNewInput.addCustomData(oDataTemplate);
								oVBox.addItem(oNewInput);

								var oHBox = new sap.m.HBox();
								oHBox.addStyleClass("businessContextLineStyle");
								oVBox.addItem(oHBox);

								var oInput = new sap.m.Input({
									width: parentObj.width,
									value: "{" + sPath + "/fieldValue}",
									maxLength: {
										path: sPath + "/fieldLength",
										formatter: formatter.formatMaxLength
									},
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatBooleanValues
									},
									enabled: {
										path: sPath + "/isEditable",
										formatter: formatter.formatBooleanValues
									},
									showSuggestion: {
										path: sPath + "/isLookup",
										formatter: formatter.formatBooleanValues
									},
									valueState: {
										path: sPath + "/valueState",
										formatter: formatter.formaValueState
									},
									change: function(oEvent){
										formatter.checkValidInputType(oEvent, oMatSectionModel, "oMatSectionModel");
									}
								}).addStyleClass("businessContextInputClass");
								var oDataTemplate = new sap.ui.core.CustomData({
									key: "{" + sPath + "/fieldId}"
								});
								oDataTemplate.bindProperty("value", "answer");
								oInput.addCustomData(oDataTemplate);
								oVBox.addItem(oInput);
								return oVBox;
							}
						} else if (fieldType === "Text") {
							if (currentObj.fieldValueNew === currentObj.fieldValue || currentObj.fieldValue === null || currentObj.fieldValue === "") {
								var oText = new sap.m.Label({
									text: "{" + sPath + "/fieldValue}",
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatBooleanValues
									}
								}).addStyleClass("businessContextTextClass ");
								return oText;
							} else {
								var oVBox = new sap.m.VBox();
								var oNewText = new sap.m.Label({
									text: "{" + sPath + "/fieldValueNew}",
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatBooleanValues
									}
								}).addStyleClass("businessContextTextClass");
								oVBox.addItem(oNewText);

								var oHBox = new sap.m.HBox();
								oHBox.addStyleClass("businessContextLineStyle");
								oVBox.addItem(oHBox);

								var oText = new sap.m.Label({
									text: "{" + sPath + "/fieldValue}",
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatBooleanValues
									}
								}).addStyleClass("businessContextTextClass oldValueColor");
								oVBox.addItem(oText);
								return oVBox;
							}
						}
					});
					oHBox.addItem(oItems);
					return oHBox;
				} else {
					var oLabel = new sap.m.Label({
						visible: false
					});
					return oLabel;
				}
			});
		},

		//Binding date for columns of "Condition Records" table
		generateMatTableColumns: function() {

			var that = this;
			var oMatTable = this.getView().byId("PRICE_UPDATE_MAT_TABLE");
			oMatTable.bindAggregation("columns", "oMatSectionModel>/tableColumn", function(index, context) {
				var contextPath = context.getPath();
				var model = context.getModel();
				var sPath = "oMatSectionModel>" + contextPath;
				var obj = model.getProperty(contextPath);

				if (obj.fieldId === "Scales") {
					obj.selectedTab = that.conditionRecord;
				}

				var oColumn = new sap.m.Column({
					hAlign: "Center",
					visible: {
						parts: [sPath + "/isVisible", sPath + "/fieldId", sPath + "/selectedTab"],
						formatter: formatter.setScaleColumnVisible
					},
					//visible: { path: sPath + "/isVisible", formatter: formatter.formatBooleanValues},
					header: new sap.m.Text({
						wrapping: true,
						text: {
							path: sPath + "/label",
							formatter: formatter.formatColumnWidth
						}
					}).addStyleClass("textClass")
				});
				return oColumn;
			});
		},

		//Enable undo button based on the selected icon tab bar
		setUndoBtnEnabled: function(selectedIconTab) {

			var oArray, oCurrentObj;
			var oUndoModel = this.oUndoModel;
			var oConditionTypes = oUndoModel.getData().oConditionTypes;
			oConditionTypes.forEach(function(obj) {
				if (selectedIconTab === obj.key) {
					oCurrentObj = obj;
					oArray = obj.prevStateArray;
				}
			});

			if (!oArray.length) {
				oUndoModel.setProperty("/undoBtnEnabled", false);
			} else {
				oUndoModel.setProperty("/undoBtnEnabled", true);
			}
		},

		//Binding "Condition Records" table on select of Icon tab bar 
		onIconBarSelect: function(oEvent, status) {

			var that = this;
			var selectedIconTab;
			if (typeof(oEvent) === "string") {
				selectedIconTab = oEvent;
				this.selectedIconTab = selectedIconTab;
			} else {
				selectedIconTab = oEvent.getSource().getSelectedKey();
				this.selectedIconTab = selectedIconTab;
			}
			this.conditionRecord = this.selectedIconTab;

			this.setUndoBtnEnabled(this.selectedIconTab);

			var oMatModel = this.oMatSectionModel;
			var oMatTable = this.getView().byId("PRICE_UPDATE_MAT_TABLE");
			var getSelectedTabSPath = this.getSelectedTabSPath(selectedIconTab);
			if (getSelectedTabSPath.length) {
				var sPath = getSelectedTabSPath[0];
				this.selectedTabSPath = sPath;

				//Make 'Scales' column visible for only for 'GROSS' condition type, 
				var oGrossKey = oMatModel.getProperty("/conditionTypesRecords/entry/" + sPath + "/key");
				var oConditionRec = oMatModel.getProperty("/tableColumn");
				if (oGrossKey === "PB00") {
					oConditionRec.filter(function(obj, index, array) {
						if (obj.fieldId === "Scales") {
							obj.isVisible = "true";
							obj.selectedTab = oGrossKey;
						}
					});
				} else {
					oConditionRec.filter(function(obj, index, array) {
						if (obj.fieldId === "Scales") {
							obj.isVisible = "false";
							obj.selectedTab = oGrossKey;
						}
					});
				}
				oMatModel.refresh();
				///////////////////////////////////////////////////////////////////////

				oMatTable.bindAggregation("items", "oMatSectionModel>/conditionTypesRecords/entry/" + sPath + "/value/listMatrialInfoRecord",
					function(index, context) {
						var contextPath = context.getPath();
						var model = context.getModel();
						var property = model.getProperty(contextPath).tableColumnRecords;
						if (property) {
							contextPath = contextPath + "/tableColumnRecords";
						}
						var row = new sap.m.ColumnListItem();
						var sPath = "oMatSectionModel>" + contextPath;
						row.bindAggregation("cells", sPath, function(index, context) {
							var model = context.getModel();
							var sPath = context.getPath();
							model.getProperty(sPath).status = status;
							model.getProperty(sPath).modelName = "oMatSectionModel";
							model.refresh();
							var bindingPath = "oMatSectionModel>" + sPath;
							var cuurentObj = model.getProperty(sPath);
							var fieldVisible = formatter.formatBooleanValues(cuurentObj.isVisible);
							if (fieldVisible) {
								if (cuurentObj.uiFieldType === "Input") {
									var oInput = new sap.m.Input({
										value: "{" + bindingPath + "/fieldValueNew}",
										maxLength: {
											path: bindingPath + "/fieldLength",
											formatter: formatter.formatMaxLength
										},
										visible: {
											path: bindingPath + "/isVisible",
											formatter: formatter.formatBooleanValues
										},
										enabled: {
											path: bindingPath + "/isEditable",
											formatter: formatter.formatBooleanValues
										},
										showSuggestion: {
											path: bindingPath + "/isLookup",
											formatter: formatter.formatBooleanValues
										},
										valueState: {
											path: bindingPath + "/valueState",
											formatter: formatter.formaValueState
										},
										width: "100%",
										change: function(evt) {
											that.onChangeSAPInput(evt);
										}
									});
									var oCustomData = new sap.ui.core.CustomData({
										key: "{" + bindingPath + "/fieldType}",
										value: "{" + bindingPath + "/fieldId}"
									});
									oInput.addStyleClass("inputBaseClass1 inputBaseClass");
									oInput.addCustomData(oCustomData);
									return oInput;
								} else if (cuurentObj.uiFieldType === "Link") {
									var OVBox = new sap.m.VBox();
									var oLink = new sap.m.Link({
										text: "{" + bindingPath + "/fieldValueNew}",
										visible: {
											path: bindingPath + "/isVisible",
											formatter: formatter.formatBooleanValues
										},
										enabled: {
											path: bindingPath + "/isEditable",
											formatter: formatter.formatBooleanValues
										}
									}).addStyleClass("");
									OVBox.addItem(oLink);
									OVBox.onclick = function(oEvent) {
										that.openScaleDetails(oEvent);
									};
									return OVBox;
								} else if (cuurentObj.uiFieldType === "Vbox") {
									var oImage = new sap.m.Image({
										src: {
											path: bindingPath + "/colorCode",
											formatter: formatter.setImageColorMode
										},
										tooltip: {
											path: bindingPath + "/colorCode",
											formatter: formatter.setImageTooltip
										}
									});
									return oImage;
									/*var oVBox = new sap.m.VBox({
									                visible: {
									                                path: bindingPath + "/colorCode",
									                                formatter: formatter.setColorMode
									                }
									});
									oVBox.addStyleClass("colorBoxClass");
									return oVBox;*/
								} else if (cuurentObj.uiFieldType === "Text") {
									var oText = new sap.m.Text({
										text: "{" + bindingPath + "/fieldValueNew}",
										visible: {
											path: bindingPath + "/isVisible",
											formatter: formatter.formatBooleanValues
										},
										width: "100%"
									}).addStyleClass("forTextCSS");
									return oText;
								} else if (cuurentObj.uiFieldType === "Date") {
									var oDate = new sap.m.DatePicker({
										valueFormat: "MM/dd/yyyy",
										displayFormat: "MM/dd/yyyy",
										value: "{" + bindingPath + "/fieldValueNew}",
										visible: {
											path: bindingPath + "/isVisible",
											formatter: formatter.formatBooleanValues
										},
										enabled: {
											path: bindingPath + "/isEditable",
											formatter: formatter.formatBooleanValues
										},
										valueState: {
											path: bindingPath + "/valueState",
											formatter: formatter.formaValueState
										},
										change: function(oEvent) {
											that.onChangeSAPDatePicker(oEvent);
										}
									}).addStyleClass("forTextCSS");
									var oCustomData = new sap.ui.core.CustomData({
										key: "{" + bindingPath + "/dateOrder}"
									});
									oDate.addCustomData(oCustomData);
									return oDate;
								} else if (cuurentObj.uiFieldType === "Button") {
									if (cuurentObj.fieldId === "Comment") {
										var oCmntBtn = new sap.m.Button({
											type: "Transparent",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatBooleanValues
											},
											icon: {
												path: bindingPath + "/isVisible",
												formatter: formatter.commentIconChang
											},
											press: function(oEvent) {
												that.openCommentBox(oEvent);
											}
										}).addStyleClass("cellBground");
										return oCmntBtn;
									} else {
										var oDeleteBtn = new sap.m.Button({
											type: "Transparent",
											icon: "sap-icon://delete",
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatBooleanValues
											},
											press: function(oEvent) {
												that.onDeleteConditionRec(oEvent);
											}
										}).addStyleClass("cellBground");
										return oDeleteBtn;
									}
								}
							} else {
								var oLabel = new sap.m.Label({
									visible: false
								});
								return oLabel;
							}
						});
						return row;
					});
			} else {
				this.selectedTabSPath = "";
				oMatTable.unbindItems();
			}
		},

		onPendingIconBarSelect: function(oEvent, status) {

			var that = this;
			if (typeof(oEvent) === "string") {
				var selectedIconTab = oEvent;
				this.selectedIconTab = selectedIconTab;
			} else {
				var selectedIconTab = oEvent.getSource().getSelectedKey();
				this.selectedIconTab = selectedIconTab;
			}
			this.conditionRecord = this.selectedIconTab;
			var oMatModel = this.oMatSectionModel;
			var oMatTable = this.getView().byId("PRICE_UPDATE_MAT_TABLE");
			var getSelectedTabSPath = this.getSelectedTabSPath(selectedIconTab);
			if (getSelectedTabSPath.length) {
				var sPath = getSelectedTabSPath[0];
				this.selectedTabSPath = sPath;
				oMatTable.bindAggregation("items", "oMatSectionModel>/conditionTypesRecords/entry/" + sPath + "/value/listMatrialInfoRecord",
					function(index, context) {
						var contextPath = context.getPath();
						var model = context.getModel();
						var property = model.getProperty(contextPath).tableColumnRecords;
						if (property) {
							contextPath = contextPath + "/tableColumnRecords";
						}
						var row = new sap.m.ColumnListItem();
						var sPath = "oMatSectionModel>" + contextPath;
						row.bindAggregation("cells", sPath, function(index, context) {
							var model = context.getModel();
							var sPath = context.getPath();
							model.getProperty(sPath).status = status;
							model.getProperty(sPath).modelName = "oMatSectionModel";
							model.refresh();
							var bindingPath = "oMatSectionModel>" + sPath;
							var cuurentObj = model.getProperty(sPath);
							var fieldVisible = formatter.formatBooleanValues(cuurentObj.isVisible);
							if (fieldVisible) {
								if (cuurentObj.uiFieldType === "Input") {
									if (cuurentObj.fieldValueNew === cuurentObj.fieldValue || cuurentObj.fieldValue === "" || cuurentObj.fieldValue === null)  {
										var oInput = new sap.m.Input({
											value: "{" + bindingPath + "/fieldValueNew}",
											maxLength: {
												path: bindingPath + "/fieldLength",
												formatter: formatter.formatMaxLength
											},
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatBooleanValues
											},
											showSuggestion: {
												path: bindingPath + "/isLookup",
												formatter: formatter.formatBooleanValues
											},
											valueState: {
												path: bindingPath + "/valueState",
												formatter: formatter.formaValueState
											},
											width: "100%",
											change: function(evt) {
												that.onChangeSAPInput(evt);
											}
										}).addStyleClass("inputBaseClass noBorder apprvInputBaseClass sapUiSizeCompact");
										var oCustomData = new sap.ui.core.CustomData({
											key: "{" + bindingPath + "/fieldType}",
											value: "{" + bindingPath + "/fieldId}"
										});
										oInput.addCustomData(oCustomData);
										return oInput;
									} else {
										var oVBox = new sap.m.VBox();
										var oNewInput = new sap.m.Input({
											value: "{" + bindingPath + "/fieldValueNew}",
											maxLength: {
												path: bindingPath + "/fieldLength",
												formatter: formatter.formatMaxLength
											},
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatBooleanValues
											},
											showSuggestion: {
												path: bindingPath + "/isLookup",
												formatter: formatter.formatBooleanValues
											},
											valueState: {
												path: bindingPath + "/valueState",
												formatter: formatter.formaValueState
											},
											width: "100%",
											change: function(evt) {
												that.onChangeSAPInput(evt);
											}
										}).addStyleClass("inputBaseClass noBorder apprvInputBaseClass sapUiSizeCompact");
										var oCustomData = new sap.ui.core.CustomData({
											key: "{" + bindingPath + "/fieldType}",
											value: "{" + bindingPath + "/fieldId}"
										});
										oNewInput.addCustomData(oCustomData);
										oVBox.addItem(oNewInput);

										var oHBox = new sap.m.HBox();
										oHBox.addStyleClass("horizonatlLineStyleClass");
										oVBox.addItem(oHBox);

										var oInput = new sap.m.Input({
											value: "{" + bindingPath + "/fieldValue}",
											maxLength: {
												path: bindingPath + "/fieldLength",
												formatter: formatter.formatMaxLength
											},
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatBooleanValues
											},
											showSuggestion: {
												path: bindingPath + "/isLookup",
												formatter: formatter.formatBooleanValues
											},
											valueState: {
												path: bindingPath + "/valueState",
												formatter: formatter.formaValueState
											},
											width: "100%",
											change: function(evt) {
												that.onChangeSAPInput(evt);
											}
										}).addStyleClass("inputBaseClass oldValueColor noBorder apprvInputBaseClass sapUiSizeCompact");
										var oCustomData = new sap.ui.core.CustomData({
											key: "{" + bindingPath + "/fieldType}",
											value: "{" + bindingPath + "/fieldId}"
										});
										oInput.addCustomData(oCustomData);
										oVBox.addItem(oInput);
										return oVBox;
									}
								} else if (cuurentObj.uiFieldType === "Link") {
									if (cuurentObj.fieldValueNew === cuurentObj.fieldValue || cuurentObj.fieldValue === "" || cuurentObj.fieldValue === null) {
										var oVBox = new sap.m.VBox();
										var oNewValLink = new sap.m.Link({
											text: "{" + bindingPath + "/fieldValueNew}",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatBooleanValues
											}
										}).addStyleClass("cellBground");
										oVBox.addItem(oNewValLink);
										oVBox.onclick = function(oEvent) {
											that.openScaleDetails(oEvent);
										};
										return oVBox;
									} else {
										var oVBox = new sap.m.VBox();
										var oNewValLink = new sap.m.Link({
											text: "{" + bindingPath + "/fieldValueNew}",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatBooleanValues
											}
										}).addStyleClass("cellBground");
										oVBox.addItem(oNewValLink);

										var oHBox = new sap.m.HBox();
										oHBox.addStyleClass("horizonatlLineStyleClass");
										oVBox.addItem(oHBox);

										var oLink = new sap.m.Link({
											text: "{" + bindingPath + "/fieldValue}",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatBooleanValues
											}
										}).addStyleClass("cellBground oldValueColor");
										oVBox.addItem(oLink);
										oVBox.onclick = function(oEvent) {
											that.openScaleDetails(oEvent);
										};
										return oVBox;
									}
								} else if (cuurentObj.uiFieldType === "Vbox") {
									var oImage = new sap.m.Image({
										src: {
											path: bindingPath + "/colorCode",
											formatter: formatter.setImageColorMode
										}
									});
									return oImage;
									/*var oVBox = new sap.m.VBox({
									                visible: {
									                                path: bindingPath + "/colorCode",
									                                formatter: formatter.setColorMode
									                }
									});
									oVBox.addStyleClass("colorBoxClass");
									return oVBox;*/
								} else if (cuurentObj.uiFieldType === "Text") {
									if (cuurentObj.fieldValueNew === cuurentObj.fieldValue || cuurentObj.fieldValue === "" || cuurentObj.fieldValue === null) {
										var oNewText = new sap.m.Text({
											text: "{" + bindingPath + "/fieldValueNew}",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatBooleanValues
											}
										}).addStyleClass("cellBground");
										return oNewText;
									} else {
										var oVBox = new sap.m.VBox();
										var oNewText = new sap.m.Text({
											text: "{" + bindingPath + "/fieldValueNew}",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatBooleanValues
											}
										}).addStyleClass("cellBground");
										oVBox.addItem(oNewText);

										var oHBox = new sap.m.HBox();
										oHBox.addStyleClass("horizonatlLineStyleClass");
										oVBox.addItem(oHBox);

										var oText = new sap.m.Text({
											text: "{" + bindingPath + "/fieldValue}",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatBooleanValues
											}
										}).addStyleClass("cellBground oldValueColor");
										oVBox.addItem(oText);
										return oVBox;
									}
								} else if (cuurentObj.uiFieldType === "Date") {
									if (cuurentObj.fieldValueNew === cuurentObj.fieldValue || cuurentObj.fieldValue === "" || cuurentObj.fieldValue === null) {
										var oNewDate = new sap.m.DatePicker({
											value: "{" + bindingPath + "/fieldValueNew}",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatBooleanValues
											},
											valueState: {
												path: bindingPath + "/valueState",
												formatter: formatter.formaValueState
											},
											change: function(oEvent) {
												that.onChangeSAPDatePicker(oEvent);
											}
										}).addStyleClass("forDateCSS noBorder");
										var oCustomData = new sap.ui.core.CustomData({
											key: "{" + bindingPath + "/dateOrder}"
										});
										oNewDate.addCustomData(oCustomData);
										return oNewDate;
									} else {
										var oVBox = new sap.m.VBox();
										var oNewDate = new sap.m.DatePicker({
											value: "{" + bindingPath + "/fieldValueNew}",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatBooleanValues
											},
											valueState: {
												path: bindingPath + "/valueState",
												formatter: formatter.formaValueState
											},
											change: function(oEvent) {
												that.onChangeSAPDatePicker(oEvent);
											}
										}).addStyleClass("forDateCSS noBorder");
										var oCustomData = new sap.ui.core.CustomData({
											key: "{" + bindingPath + "/dateOrder}"
										});
										oNewDate.addCustomData(oCustomData);
										oVBox.addItem(oNewDate);

										var oHBox = new sap.m.HBox();
										oHBox.addStyleClass("horizonatlLineStyleClass");
										oVBox.addItem(oHBox);

										var oDate = new sap.m.DatePicker({
											value: "{" + bindingPath + "/fieldValue}",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatBooleanValues
											},
											valueState: {
												path: bindingPath + "/valueState",
												formatter: formatter.formaValueState
											},
											change: function(oEvent) {
												that.onChangeSAPDatePicker(oEvent);
											}
										}).addStyleClass("forDateCSS noBorder oldValueColor");
										var oCustomData = new sap.ui.core.CustomData({
											key: "{" + bindingPath + "/dateOrder}"
										});
										oDate.addCustomData(oCustomData);
										oVBox.addItem(oDate);
										return oVBox;
									}
								} else if (cuurentObj.uiFieldType === "Button") {
									if (cuurentObj.fieldId === "Comment") {
										var oCmntBtn = new sap.m.Button({
											type: "Transparent",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatBooleanValues
											},
											icon: {
												path: bindingPath + "/isVisible",
												formatter: formatter.commentIconChang
											},
											press: function(oEvent) {
												that.openCommentBox(oEvent);
											}
										}).addStyleClass("cellBground");
										return oCmntBtn;
									} else {
										var oDeleteBtn = new sap.m.Button({
											type: "Transparent",
											icon: "sap-icon://delete",
											press: function(oEvent) {
												that.onDeleteConditionRec(oEvent);
											}
										}).addStyleClass("cellBground");
										return oDeleteBtn;
									}
								}
							} else {
								var oLabel = new sap.m.Label({
									visible: false
								});
								return oLabel;
							}
						});
						return row;
					});
			} else {
				this.selectedTabSPath = "";
				oMatTable.unbindItems();
			}
		},

		//Validating input field on attach change
		onChangeSAPInput: function(oEvent) {
			var evt = oEvent.getSource();
			var oValue = evt.getValue();
			//var oMaxLength = evt.getMaxLength();
			var fieldType = evt.getCustomData()[0].getKey();
			var oMatModel = this.oMatSectionModel;
			var sPath = evt.getBindingContext("oMatSectionModel").getPath();
			var selectedObj = oMatModel.getProperty(sPath);

			var oFieldPathIndex = sPath.split("/");
			oFieldPathIndex = oFieldPathIndex[oFieldPathIndex.length - 1];

			//Get current object; [Focused row]
			var oCurrentRowPath = oEvent.getSource().getParent().getBindingContext("oMatSectionModel").getPath();
			var oCurrentObj = oMatModel.getProperty(oCurrentRowPath);
			var oRecordNumber = formatter.getConditionConditionRecNo(oCurrentObj.tableColumnRecords);

			/*var firstObjSpath = sPath.split("/").slice(0, -1).join("/") + "/0";
			var getFirstObj = oMatModel.getProperty(firstObjSpath);*/
			var oValue1 = selectedObj.fieldValueNew;
			//var oValue2 = selectedObj.fieldValue;

			var secondObjSpath = sPath.split("/").slice(0, -1).join("/") + "/1";
			var getSecondObj = oMatModel.getProperty(secondObjSpath);
			var prevChangeMode = getSecondObj.colorCode;

			if (fieldType === "FLOAT") {
				var regex = "[+-]?([0-9]*[.])?[0-9]+";
				var decimalPosition = "2"; //evt.getCustomData()[0].getValue();
			} else if (fieldType === "INT") {
				var regex = "^[1-9]([0-9]*)$";
			} else if (fieldType === "CHAR") {
				var regex = /^[a-zA-Z]+$/;
			}
			if (!oValue.match(regex)) {
				selectedObj.valueState = "Error";
				this.errorStateBVal = this.errorStateBVal + 1;
			} else {
				if (this.errorStateBVal > 0 && selectedObj.valueState === "Error") {
					this.errorStateBVal = this.errorStateBVal - 1;
					selectedObj.valueState = "None";
				}
			}

			//uiPrevValue -- Stores previous state value
			//store sPath in undo model to do undo
			formatter.formatDateEnable(sPath, oMatModel);
			var undoModel = this.oUndoModel;
			var prevValue = selectedObj.uiPrevValue;
			formatter.setPreviousStateObjects(sPath, "oMatSectionModel", prevValue, undoModel, "PROPERTY", "CHANGE", "fieldValueNew", "",
				"", prevChangeMode, this.selectedIconTab, oRecordNumber);
			selectedObj.uiPrevValue = oValue1;
			undoModel.setProperty("/undoBtnEnabled", true);

			var oConditionTypeRec = oMatModel.getProperty("/conditionTypesRecords/entry/" + this.selectedTabSPath +
				"/value/listMatrialInfoRecord");
			var bIndices = formatter.getSameConditionRecords(oRecordNumber, oConditionTypeRec);
			formatter.updateSameCondtionRecord(oFieldPathIndex, oCurrentRowPath, bIndices, oMatModel, undoModel, this.selectedIconTab, oValue1);

			//Version2 update data 
			var oVersion2Log = oMatModel.getProperty("/oVersion2Log/entry/" + this.selectedTabSPath + "/value/listMatrialInfoRecord");
			var checkDuplicateRec = formatter.checkDuplicateConditionRec(oCurrentObj, oVersion2Log);
			if (checkDuplicateRec[0] === true) {
				var index = checkDuplicateRec[1];
				var oPath = "/oVersion2Log/entry/" + this.selectedTabSPath + "/value/listMatrialInfoRecord/" + index;
				oMatModel.setProperty(oPath, oCurrentObj);
			}
			oMatModel.refresh();
		},

		//Validating start and end date on attach change
		onChangeSAPDatePicker: function(oEvent) {
			var evt = oEvent.getSource();
			var fieldType = evt.getCustomData()[0].getKey();
			var oMatModel = this.oMatSectionModel;
			var sPath = evt.getBindingContext("oMatSectionModel").getPath();
			var sPathIndex = sPath.charAt(sPath.length - 1);
			var selectedObj = oMatModel.getProperty(sPath);
			var oRecordMode = selectedObj.changeMode;

			//selectedObj.uiFieldValue = formatter.formatDateValues(evt.getValue());
			var dateTimeInst = oDateFormat.getDateTimeInstance({
				pattern: "MM/dd/yyyy"
			});
			var selectedRow = evt.getParent().getBindingContext("oMatSectionModel").getPath();
			var getObject = oMatModel.getProperty(selectedRow);

			var splitIndex = selectedRow.split("/");
			var mPath = splitIndex[splitIndex.length - 1];

			var firstObjSpath = sPath.split("/").slice(0, -1).join("/") + "/0";
			var getFirstObj = oMatModel.getProperty(firstObjSpath);
			if (!selectedObj.hasOwnProperty("changeMode")) {
				getFirstObj.changeMode = "CREATE";
			}

			if (fieldType === "Start") {
				sPathIndex = parseInt(sPathIndex) + 1;
				var val = sPath;
				val = val.slice(0, -1);
				val += sPathIndex;
				var endDateSPath = val;
				var endDateObj = oMatModel.getProperty(endDateSPath);
				var startDate = evt.getDateValue();
				var endDate = new Date(endDateObj.fieldValueNew);

				var oDate = dateTimeInst.format(startDate);
				selectedObj.fieldValueNew = oDate;
				selectedObj.fieldValue = oDate;
				selectedObj.uiFieldValue = oDate;

				var validEndDate = isNaN(endDate.getTime());
				if (!validEndDate) {
					if (startDate > endDate) {
						var tooltip = this.oResourceModel.getText("ERR_START_GREATER_END_DATE");
						formatter.toastMessage(tooltip);
						evt.setTooltip(tooltip);
						if (this.errorStateBVal > 0) {
							this.errorStateBVal = this.errorStateBVal + 1;
							selectedObj.valueState = "Error";
						}
					} else {
						var oParamObject = dateFunctions.checkCondtionRecCase(this.selectedTabSPath, mPath, oMatModel, oDateFormat, oRecordMode);
						if (oParamObject) {
							conditionRecDialog.showChangedConditionRec(oParamObject, this.oSplitRecordsModel, oMatModel, this, sPath, getObject);
						}
						evt.setTooltip("");
						if (this.errorStateBVal > 0 && selectedObj.valueState === "Error") {
							this.errorStateBVal = this.errorStateBVal - 1;
							selectedObj.valueState = "None";
						}
					}
				}
			} else if (fieldType === "End") {
				sPathIndex = parseInt(sPathIndex) - 1;
				var val = sPath;
				val = val.slice(0, -1);
				val += sPathIndex;
				var startDateSPath = val;
				var startDateObj = oMatModel.getProperty(startDateSPath);
				var endDate = evt.getDateValue();
				var startDate = new Date(startDateObj.fieldValueNew);

				var oDate = dateTimeInst.format(endDate);
				selectedObj.fieldValueNew = oDate;
				selectedObj.fieldValue = oDate;
				selectedObj.uiFieldValue = oDate;

				if (endDate < startDate) {
					var tooltip = this.oResourceModel.getText("ERR_START_GREATER_END_DATE");
					formatter.toastMessage(tooltip);
					evt.setTooltip(tooltip);
					if (this.errorStateBVal > 0) {
						this.errorStateBVal = this.errorStateBVal + 1;
						selectedObj.valueState = "Error";
					}
				} else {
					selectedObj.valueState = "None";
					evt.setTooltip("");

					var oParamObject = dateFunctions.checkCondtionRecCase(this.selectedTabSPath, mPath, oMatModel, oDateFormat, oRecordMode);
					if (oParamObject) {
						conditionRecDialog.showChangedConditionRec(oParamObject, this.oSplitRecordsModel, oMatModel, this, sPath, getObject);
					}
				}
			}
			oMatModel.refresh();
		},

		onConfirmDialog: function() {

			var oNewConditionRec, currentObj, affectedRecords, type; //, selectedRow;
			var oMatModel = this.oMatSectionModel;
			var oSplitRecordsModel = this.oSplitRecordsModel;
			var oSplitRecordData = oSplitRecordsModel.getData().items;
			var length = oSplitRecordData.length;
			for (var i = 0; i < length; i++) {
				if (oSplitRecordData[i].radioBtnSelected) {
					oNewConditionRec = oSplitRecordData[i].newConditionRecords;
					if (oSplitRecordData[i].currentObject) {
						currentObj = oSplitRecordData[i].currentObject;
						affectedRecords = oSplitRecordData[i].rows;
						type = oSplitRecordData[i].type;
					}
				}
			}
			oMatModel.setProperty("/conditionTypesRecords/entry/" + this.selectedTabSPath + "/value/listMatrialInfoRecord", oNewConditionRec);
			//oMatModel.getData().conditionTypesRecords.entry[this.selectedTabSPath].value.listMatrialInfoRecord = oNewConditionRec;

			//Version2 update data 
			if (currentObj) {
				var oVersion2Log = oMatModel.getProperty("/oVersion2Log/entry/" + this.selectedTabSPath + "/value/listMatrialInfoRecord");
				var oTempArry = jQuery.extend(true, [], oVersion2Log);
				var checkDuplicateRec = formatter.checkDuplicateConditionRec(currentObj, oTempArry);
				if (checkDuplicateRec[0] === true) {
					var index = checkDuplicateRec[1];
					var oPath = "/oVersion2Log/entry/" + this.selectedTabSPath + "/value/listMatrialInfoRecord/" + index;
					oMatModel.setProperty(oPath, currentObj);
				} else {
					oVersion2Log.push(currentObj);
				}
			}

			oMatModel.refresh();
			this.priceList.close();
			this.priceList.destroyContent();
		},

		//Getter method for getting the selected sPath from Icon tab bar
		getSelectedTabSPath: function(selIconTab) {
			var oMatSectionModel = this.oMatSectionModel;
			var oSearchArry = oMatSectionModel.getData().conditionTypesRecords.entry;
			if (oSearchArry) {
				for (var i = 0; i < oSearchArry.length; i++) {
					if (selIconTab === oSearchArry[i].key) {
						return [i, true];
					}
				}
				return false;
			}
		},

		//Add new row on click of plus button from table
		onAddRow: function() {

			var oTempArry;
			var sPath = this.selectedTabSPath;
			//var oMatTable = this.getView().byId("PRICE_UPDATE_MAT_TABLE");
			var oMatSectionModel = this.oMatSectionModel;
			var columnArry = oMatSectionModel.getData().tableColumn;
			var conditionRecords = oMatSectionModel.getData().conditionTypesRecords;
			if (conditionRecords) {
				var oCondtionTypeRec = oMatSectionModel.getData().conditionTypesRecords.entry[sPath];
				var bVal = this.validateOnAddRow(oCondtionTypeRec);
				if (bVal) {
					var oArray = oCondtionTypeRec.value.listMatrialInfoRecord.tableColumnRecords;
					if (!oArray) {
						oArray = oCondtionTypeRec.value.listMatrialInfoRecord;
					}

					if (oArray.length) {
						if (!oArray[0].tableColumnRecords) {
							var obj = {};
							obj.tableColumnRecords = oArray;
							oTempArry = [];
							oTempArry.push(obj);
						} else {
							oTempArry = oArray;
						}
					} else {
						oTempArry = [];
					}

					var oScaleColumnList = oMatSectionModel.getData().scaleColumnList;
					var oScaleDataList = oMatSectionModel.getData().scalesDtoList;
					var oNewRow = this.getTableTemplate(columnArry, oScaleColumnList,oScaleDataList);
					oTempArry.push(oNewRow);
					oCondtionTypeRec.value.listMatrialInfoRecord = oTempArry;
					oMatSectionModel.refresh();

					var undoModel = this.oUndoModel;
					var length = oTempArry.length - 1;
					length = length.toString();
					var modelSPath = "/conditionTypesRecords/entry/" + this.selectedTabSPath + "/value/listMatrialInfoRecord/" + length;
					formatter.setPreviousStateObjects(modelSPath, "oMatSectionModel", "", undoModel, "OBJECT", "NEW", "", "", "", "", this.selectedIconTab);
					undoModel.setProperty("/undoBtnEnabled", true);
				}
			}
		},

		//Validate if row cells is not empty, before adding a new row
		validateOnAddRow: function(oCondtionTypeRec) {

			var listMatrialInfoRecord = oCondtionTypeRec.value.listMatrialInfoRecord;
			if (Array.isArray(listMatrialInfoRecord)) {
				var length = listMatrialInfoRecord.length;
				if (length) {
					for (var i = length - 1; i < length; i++) {
						var tableRows = listMatrialInfoRecord[i].tableColumnRecords;
						var cellsLength = tableRows.length;
						for (var j = 0; j < cellsLength; j++) {
							if (tableRows[j].isVisible === "true" || tableRows[j].isVisible === true) {
								if (tableRows[j].uiFieldType === "Input" || tableRows[j].uiFieldType === "Date") {
									if (tableRows[j].fieldValueNew === "" || tableRows[j].valueState === "Error") {
										return false;
									}
								}
							}
						}
					}
					return true;
				} else if (length === 0) {
					return true;
				}
			} else if (listMatrialInfoRecord.tableColumnRecords) {
				var length = listMatrialInfoRecord.tableColumnRecords.length;
				var cellsLength = listMatrialInfoRecord.tableColumnRecords.length;
				for (var i = 0; i < length; i++) {
					var tableRows = listMatrialInfoRecord.tableColumnRecords[i];
					if (tableRows.isVisible === "true") {
						if (tableRows.fieldValueNew === "" || tableRows.valueState === "Error") {
							return false;
						}
					}
				}
				return true;
			} else {
				return true;
			}
		},

		//Creating a temp object for scales pop-up table
		getTableTemplate: function(oArray, oScaleColumnList, oScaleDataList) {

			var tableColumnRecords = [];
			for (var i = 0; i < oArray.length; i++) {
				var oTempObj = jQuery.extend({}, oArray[i]);
				//delete oTempObj.deletionFlag;
				if (oTempObj.fieldId === "DATAB") {
					var dateTimeInst = oDateFormat.getDateTimeInstance({
						pattern: "MM/dd/yyyy"
					});
					var oDate = dateTimeInst.format(new Date());
					oTempObj.fieldValueNew = oDate;
					oTempObj.fieldValue = oDate;
					oTempObj.uiFieldValue = oDate;
					oTempObj.isEditable = "false";
				}
				if (oTempObj.fieldId === "DATBI") {
					oTempObj.isEditable = "false";
				}
				if (oTempObj.label === "Scales") {
					oTempObj.fieldValue = oTempObj.fieldValue;
					oTempObj.scaleColumnList = oScaleColumnList;
					oTempObj.fieldValueNew = "0";
					oTempObj.scaleDataList = oScaleDataList;
					oTempObj.isEditable = "true";
				} else {
					oTempObj.fieldValue = "";
				}
				if (oTempObj.fieldId === "COLOR") {
					oTempObj.colorCode = "CREATED";
				}
				if (oTempObj.fieldId === "KNUMH") {
					var oRecordNum = formatter.generateConditionRecNo();
					oTempObj.fieldValueNew = oRecordNum;
					oTempObj.fieldValue = oRecordNum;
				}
				oTempObj.changeMode = "CREATE";
				tableColumnRecords.push(oTempObj);
			}

			var obj = {};
			obj.tableColumnRecords = tableColumnRecords;
			return obj;
		},

		//Function to delete selected condition record from "Condition Records" table
		onDeleteConditionRec: function(oEvent) {

			var oTempArry = [];
			var mPath = this.selectedTabSPath;
			var oMatSectionModel = this.oMatSectionModel;
			//var oMatTable = this.getView().byId("PRICE_UPDATE_MAT_TABLE");
			var bindingContext = oEvent.getSource().getParent().getBindingContext("oMatSectionModel");
			var length = bindingContext.sPath.split("/").length - 1;
			var sPath = bindingContext.sPath.split("/")[length];
			var oCondtionTypeRec = oMatSectionModel.getData().conditionTypesRecords.entry[mPath];
			var oArray = oCondtionTypeRec.value.listMatrialInfoRecord;
			var oFieldPathIndex = sPath.split("/");
			oFieldPathIndex = oFieldPathIndex[oFieldPathIndex.length - 1];

			if (isNaN(sPath)) {
				var obj = {};
				obj.tableColumnRecords = oArray[sPath];
				oTempArry.push(obj);
				sPath = 0;
			} else {
				oTempArry = oArray;
			}

			var oSelectedArry = oTempArry[sPath].tableColumnRecords;
			//var bValHardDelete = formatter.validateRecordOnUIDelete(oSelectedArry);

			var bValHardDelete;
			var oChangeMode = oSelectedArry[0].changeMode;
			if (oChangeMode === "CREATE") {
				bValHardDelete = true;
			} else {
				bValHardDelete = false;
			}

			var bVal = oSelectedArry[0].hasOwnProperty("deletionFlag");
			if (bVal) {
				var obj = oSelectedArry[0];
				if (oSelectedArry[0].changeMode !== "DELETE") {

					if (bValHardDelete) {
						//Version2log
						var oVersion2Log = oMatSectionModel.getProperty("/oVersion2Log/entry/" + this.selectedTabSPath + "/value/listMatrialInfoRecord/");
						var checkDuplicateRec = formatter.checkDuplicateConditionRec(oTempArry[sPath], oVersion2Log);
						if (checkDuplicateRec[0] === true) {
							var index = checkDuplicateRec[1];
							//            var oPath = "/oVersion2Log/entry/" + this.selectedTabSPath + "/value/listMatrialInfoRecord/" + index;
							oVersion2Log.splice(index, 1);
						}
						oTempArry.splice(sPath, 1);
						oMatSectionModel.refresh();
						return;
					}
					//Set 'Change Mode' to 'Deleted', when a obj from service is deleted.
					var prevValue = obj.changeMode;
					var undoModel = this.oUndoModel;
					var obj2 = oSelectedArry[1];
					var prevChangeMode = obj2.colorCode;
					//Get current object; [Focused row]
					var oCurrentRowPath = oEvent.getSource().getParent().getBindingContext("oMatSectionModel").getPath();
					var oCurrentObj = oMatSectionModel.getProperty(oCurrentRowPath);
					var oRecordNumber = formatter.getConditionConditionRecNo(oCurrentObj.tableColumnRecords);
					var deleteBtnPath = oEvent.getSource().getBindingContext("oMatSectionModel").getPath();
					formatter.setPreviousStateObjects(deleteBtnPath, "oMatSectionModel", prevValue, undoModel, "OBJECT", "DELETE", "", "", "",
						prevChangeMode, this.selectedIconTab, oRecordNumber);
					undoModel.setProperty("/undoBtnEnabled", true);

					obj.deletionFlag = "true";
					obj.fieldValue = "True";
					var prevChangeMode = "";
					if (obj.changeMode === "CREATE") {
						prevChangeMode = "CREATE";
					} else {
						prevChangeMode = obj.changeMode;
					}
					obj.uiPrevValue = prevChangeMode;
					obj.changeMode = "DELETE";
					oSelectedArry[1].colorCode = "DELETED";

					//Disabling the row
					formatter.setConditionRecEditable(oSelectedArry, "false");

					var oConditionTypeRec = oMatSectionModel.getProperty("/conditionTypesRecords/entry/" + this.selectedTabSPath +
						"/value/listMatrialInfoRecord");
					var bIndices = formatter.getSameConditionRecords(oRecordNumber, oConditionTypeRec);
					formatter.updateSameCondtionRecord(oFieldPathIndex, oCurrentRowPath, bIndices, oMatSectionModel, undoModel, this.selectedIconTab,
						"DELETE");

					//Version2 update data 
					var oCurrentObj = oMatSectionModel.getProperty(bindingContext.getPath());
					var oVersion2Log = oMatSectionModel.getProperty("/oVersion2Log/entry/" + this.selectedTabSPath + "/value/listMatrialInfoRecord");
					var checkDuplicateRec = formatter.checkDuplicateConditionRec(oCurrentObj, oVersion2Log);
					if (checkDuplicateRec[0] === true) {
						var index = checkDuplicateRec[1];
						var oPath = "/oVersion2Log/entry/" + this.selectedTabSPath + "/value/listMatrialInfoRecord/" + index;
						oMatSectionModel.setProperty(oPath, oCurrentObj);
					}
				} else {
					return;
				}
			} else {
				oTempArry.splice(sPath, 1);
			}
			oCondtionTypeRec.value.listMatrialInfoRecord = oTempArry;
			oMatSectionModel.refresh(true);
		},

		//Binding data for "Header Details" table 
		getVariableKeyData: function() {

			var that = this;
			var oConditionRecordTbl = this.getView().byId("VARIABLE_KEY_TBL");
			var oVariableKeyModel = this.getOwnerComponent().getModel("oVariableKeyModel");
			oConditionRecordTbl.setModel(oVariableKeyModel);
			oConditionRecordTbl.bindAggregation("columns", "oVariableKeyModel>/columns", function(index, context) {
				var contextPath = context.getPath();
				var oModel = context.getModel();
				var sPath = "oVariableKeyModel>" + contextPath;
				var currentObj = oModel.getProperty(contextPath);
				var fieldType = currentObj.uiFieldType;
				var fieldVisible = formatter.formatBooleanValues(currentObj.isVisible);
				var oColumn = new sap.m.Column({
					header: new sap.m.Text({
						text: "{" + sPath + "/label}"
					}).addStyleClass("matTblHdrClass"),
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatBooleanValues
					}
				});
				return oColumn;
			});

			oConditionRecordTbl.bindItems("oVariableKeyModel>/rows", function(index, context) {
				var contextPath = context.getPath();
				var sPath = "oVariableKeyModel>" + contextPath;
				var row = new sap.m.ColumnListItem();
				row.bindAggregation("cells", sPath, function(index, context) {
					var model = context.getModel();
					var sPath = context.getPath();
					var oText = new sap.m.Text({
						text: "{" + sPath + "}"
					}).addStyleClass("cellBground");
					return oText;
				});
				return row;
			});
		},

		//Called when the user navigates to previous screen
		onNavBack: function(bVal) {
			var that = this,
				count = 0;
			var oUndoModel = this.oUndoModel;

			if (bVal === true) {
				oUndoModel.setProperty("/oConditionTypes", []);
			}

			var oConditionTypes = oUndoModel.getProperty("/oConditionTypes");
			oConditionTypes.forEach(function(obj) {
				if (obj.prevStateArray.length) {
					count = count + 1;
				}
			});

			if (count) {
				var oConfirmMsg = this.oResourceModel.getText("CONFIRM_MSG_ON_NAVIGATION");
				sap.m.MessageBox.confirm(oConfirmMsg, {
					icon: sap.m.MessageBox.Icon.WARNING,
					onClose: function(oAction) {
						if (oAction === "OK") {
							that._router.navTo("dashboard");
							that.getOwnerComponent().getModel("oSearchModel").setData([]);
							that.getOwnerComponent().getModel("oDisplaySearchModel").setData([]);
							that.oMatSectionModel.setProperty("/businessObjectList", []);
							that.oMatSectionModel.setProperty("/conditionTypes", []);
							that.oMatSectionModel.setProperty("/conditionTypesRecords", []);
						}
					}
				});
			} else {
				this._router.navTo("dashboard");
			}
		},

		//Function to validate for empty cells in table, on click of submit button
		onSubmitMaterialList: function(oEvent) {

			var oButtonType = oEvent.getSource().getCustomData()[0].getValue();
			var oMatSectionModel = this.oMatSectionModel;
			var oConditionTypesRecords = oMatSectionModel.getData().conditionTypesRecords;
			var oBusinessObjectList = oMatSectionModel.getData().businessObjectList;
			if (oConditionTypesRecords == null && oBusinessObjectList === null) {
				this.onSubmit(oButtonType);
			} else {
				var oCondtionTypeRec = oConditionTypesRecords.entry;
				for(var j = 0; j<oBusinessObjectList.length; j++){
					var hasFieldInput = oBusinessObjectList[j].hasOwnProperty("boList");
					if (hasFieldInput) {
						if (!Array.isArray(oBusinessObjectList[j].boList)) {
							var oTempArry = [];
							oTempArry.push(oBusinessObjectList[j].boList);
							oBusinessObjectList[j].boList = oTempArry;
						} 
						var oBOList = oBusinessObjectList[j].boList;
						for(var k = 0; k<oBOList.length; k++){
							if (oBOList[k].valueState === "Error") {
										var errorText = this.oResourceModel.getText("ERR_ENTER_VALID_VAL");
										formatter.toastMessage(errorText);
										return;
									}
						}
						
					}else{
						continue;
					}
				}
				var length = oCondtionTypeRec.length;
				for (var i = 0; i < length; i++) {
					var oArray = oCondtionTypeRec[i].value.listMatrialInfoRecord;
					if (!Array.isArray(oArray)) {
						var oTempArry = [];
						oTempArry.push(oArray);
					} else {
						oTempArry = oArray;
					}
					for (var j = 0; j < oTempArry.length; j++) {
						var currenCell = oTempArry[j].tableColumnRecords;
						for (var k = 0; k < currenCell.length; k++) {
							if (currenCell[k].isVisible === "true") {
								if (currenCell[k].isMendatory === "true") {
									if (currenCell[k].fieldValueNew === "" || currenCell[k].valueState === "Error") {
										var errorText = this.oResourceModel.getText("ERR_ENTER_VALID_MAT_LIST");
										formatter.toastMessage(errorText);
										return;
									}
								}
								if (currenCell[k].fieldId === "Scales") {
									var scaleDataList = currenCell[k].scaleDataList;
									for (var l = 0; l < scaleDataList.length; l++) {
										var parameterList = scaleDataList[l].parameterList;
										for (var m = 0; m < parameterList.length; m++) {
											if (parameterList[m].isVisible === "true") {
												if (parameterList[m].fieldValue === "") {
													var errorText = this.oResourceModel.getText("ERR_ENTER_VALID_MAT_LIST");
													formatter.toastMessage(errorText);
													return;
												}
											}

										}
									}
								}
							}
						}
					}
				}
				this.onSubmit(oButtonType);
			}
		},

		//Function to update the materials list
		onSubmit: function(oButtonType) {

			var that = this;
			this.busy.open();
			var oMatSectionModel = this.oMatSectionModel;
			var oSubmitModel = this.oSubmitModel;
			var businessContextData = this.oBusinessContextModel.getData().businessObjectList;
			var metaData = this.getOwnerComponent().getModel("oMatSearchModel").getData().metadata;
			var oSearchPanel = this.getOwnerComponent().getModel("oAdvanceSearchModel").getData().searchpanel;
			var variableModel = this.getOwnerComponent().getModel("oVariableKeyModel");
			var data = variableModel.getData().rows[0];
			var decisionTableId = variableModel.getData().rows[0][0];
			var sUrl = "/CWPRICE_WEB/record/insert";
			if (oButtonType === "SUBMIT") {
				var oPayload = oMatSectionModel.getData();
				oPayload.businessObjectId = "PIR";
				oPayload.decisionTableId = decisionTableId,
					oPayload.requestType = "UI";
				oPayload.usageId = "A";
				oPayload.applicationId = "M";
				oPayload.headerList = data;
				oPayload.metaData = metaData;
				oPayload.businessContextData = businessContextData;
				oPayload.headerListDto = oSearchPanel;
				oPayload.mode = "Save_Close";
			} else {
				var oPayload = oMatSectionModel.getData();
				oPayload.businessObjectId = "PIR";
				oPayload.decisionTableId = decisionTableId,
					oPayload.requestType = "UI";
				oPayload.usageId = "A";
				oPayload.applicationId = "M";
				oPayload.headerList = data;
				oPayload.metaData = metaData;
				oPayload.businessContextData = businessContextData;
				oPayload.headerListDto = oSearchPanel;
				oPayload.mode = "Save";
			}

			if (oPayload.pricelistTblCol) {
				delete oPayload.pricelistTblCol;
			}

			oPayload.requesterDetail = this.getOwnerComponent().getModel("user").getData();
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, JSON.stringify(oPayload), true, "POST", false, false, that.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = oEvent.getSource().getData();
					oSubmitModel.setData(resultData);
					that.busy.close();
					//var sucessMessage = resultData.message;
					if (oButtonType === "SUBMIT") {
						that.onValidateECC();
					}
				} else {
					//var errorText = resultData.message;
					var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
					formatter.toastMessage(errorText);
					that.busy.close();
				}
			});

			oModel.attachRequestFailed(function(oEvent) {
				var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
				formatter.toastMessage(errorText);
				that.busy.close();
			});

		},

		//Function to validate the submitted records in ECC 
		onValidateECC: function() {

			var that = this;
			this.busy.open();
			var oSubmitModel = this.oSubmitModel;
			var sUrl = "/CWPRICE_WEB/record/validate";
			var data = oSubmitModel.getData();
			var oPayload = {};
			var reqId = data.requestId;
			oPayload.mode = "V";
			oPayload.requestId = reqId;
			oPayload.inputList = [{
				"decisionTable": "A017",
				"variableKey": ""
			}];

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, JSON.stringify(oPayload), true, "POST", false, false, that.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
				if (oEvent.getParameter("success")) {
					var resultData = oEvent.getSource().getData();
					var status = resultData.status;
					if (status !== "ERROR") {
						that.fntriggerBPM(data.requestId);
					} else {
						if (resultData.message) {
							errorText = resultData.message;
						}
						formatter.toastMessage(errorText);
					}
				} else {
					formatter.toastMessage(errorText);
				}
				that.busy.close();
			});

			oModel.attachRequestFailed(function(oEvent) {
				var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
				formatter.toastMessage(errorText);
				that.busy.close();
			});
		},

		//To close the scales table dialog box
		onCloseFilterOptionsDialogConfirm: function(oEvent) {
			var oModel = this.oMatSectionModel;
			var oScalePathModel = this.oScalePathModel;
			var headerData = oModel.getData().headerRecords[0].recordList;
			var status = headerData[(headerData.length) - 1];
			var sPath = oScalePathModel.getData().sPath;
			var data = oModel.getProperty(sPath).scaleDataList;
			var count = 0;
			if (status === "Update Pending") {
				this._oDialog.close();
			} else {
				if (data) {
					for (var k in data) {
						var parameter = data[k].parameterList;
						for (var m in parameter) {
							if (data[k].fieldValue === "") {
								count++;
							}
							if (count > 0) {
								var errorText = this.oResourceModel.getText("ERR_ENTER_VALID_SCALES");
								formatter.toastMessage(errorText);
								return false;
							}
						}
					}
				}
				this._oDialog.close();
			}
		},

		////// Scale Details //////
		//Dialog-box open scales details table
		openScaleDetails: function(oEvent) {

			var oMatModel = this.oMatSectionModel;
			var oScalePathModel = this.oScalePathModel;
			var sPath = oEvent.srcControl.getBindingContext("oMatSectionModel").sPath;
			oScalePathModel.getData().sPath = sPath;
			oScalePathModel.refresh(true);
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.incture.fragment.scales", this);
			}

			this.setScaleDialogTableData(sPath);
			this.getView().addDependent(this._oDialog);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		//Binding data for scales table 
		setMaximumQuantity: function(oArray) {
			var oMatSectionModel = this.oMatSectionModel;
			var tableLen = oArray;

			for (var i = 1; i < tableLen.length; i++) {
				var paramData = tableLen[i].parameterList;
				var parLen = paramData.length;
				if (i < (tableLen.length - 1)) {
					
					
					for(var p = i+1; p<tableLen.length; p++){
					var paramData1 = tableLen[p].parameterList;
                    if(paramData1[0].deletionFlag === "true"){
                    	if(p !== (tableLen.length - 1)){
                    		continue;
                    	}else{
                    		for (var j = 0; j < paramData.length; j++) {
								if (paramData[j].fieldId === "Max_Quantity") {
								paramData[j].fieldValueNew = "N";
								paramData[j].editValue = "N";
								return;
						}

					}
                    	}
                    	
                    }else{
                    	paramData1 = paramData1;
                    	break;
                    }
					}
					for (var j = 0; j < paramData.length; j++) {
						if (paramData1[j].fieldId === "KSTBM") {
							var maxvalue = parseInt(paramData1[j].fieldValueNew);
						}
						if (paramData1[j].fieldId === "Max_Quantity") {
							paramData[j].fieldValueNew = maxvalue - 1;
							paramData[j].editValue = maxvalue - 1;
						}

					}
				}
				if (i === (tableLen.length - 1)) {
					for (var j = 0; j < paramData.length; j++) {
						if (paramData[j].fieldId === "Max_Quantity") {
							paramData[j].fieldValueNew = "N";
							paramData[j].editValue = "N";
						}

					}
				}

			}
			oMatSectionModel.refresh();
		},
		setScaleDialogTableData: function(sPath) {

			var that = this;
			var oMatSectionModel = this.oMatSectionModel;
			var headerData = oMatSectionModel.getData().headerRecords[0].recordList;
			var status = headerData[(headerData.length) - 1];
			oMatSectionModel.getProperty(sPath).status = status;

			var oArray = oMatSectionModel.getProperty(sPath).scaleDataList;
			this.setMaximumQuantity(oArray);
			oMatSectionModel.refresh();
			var oScaleTable = this._oDialog.getContent()[0].getContent()[0];
			var bindingPath = "oMatSectionModel>" + sPath;

			var oScaleLabel = new sap.m.Label({
				text: "{i18n>SCALE_DATA}"
			}).addStyleClass("scaleLableStyle");

			var oToolbarSpacer = new sap.m.ToolbarSpacer();

			/*var oImage = new sap.m.Image({
				src: "images/SCLAESNEW.png",
				visible: {
					parts: [bindingPath + "/status", bindingPath + "/isEditable"],
					formatter: formatter.formatStatusBooleanValues
				}
			}).addStyleClass("scalesLegendClass");*/

			/*var oUndoButton = new sap.m.Button({
				icon: "sap-icon://undo",
				visible: {
					parts: [bindingPath + "/status", bindingPath + "/isEditable"],
					formatter: formatter.formatStatusBooleanValues
				},
				press: function(oEvent) {
					that.onScaleUndo(oEvent);
				}
			});*/

			var oToolbar = new sap.m.Toolbar({
				content: [oScaleLabel, oToolbarSpacer]
			}).addStyleClass("scalesToolBarHeader");
			oScaleTable.setHeaderToolbar(oToolbar);

			oScaleTable.bindAggregation("columns", "oMatSectionModel>" + sPath + "/scaleColumnList", function(index, context) {
				var contextPath = context.getPath();
				var sPath = "oMatSectionModel>" + contextPath;
				var oColumn = new sap.m.Column({
					hAlign: "Center",
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatBooleanValues
					},
					header: new sap.m.Text({
						wrapping: true,
						text: {
							path: sPath + "/scaleColName",
							formatter: formatter.formatScaleColumnWidth
						}
					}).addStyleClass("textClass ")
				});
				return oColumn;
			});

			oScaleTable.bindAggregation("items", "oMatSectionModel>" + sPath + "/scaleDataList", function(index, context) {
				var contextPath = context.getPath();
				var model = context.getModel();
				var property = model.getProperty(contextPath).parameterList;
				if (property) {
					contextPath = contextPath + "/parameterList";
				}
				var sPath = "oMatSectionModel>" + contextPath;
				var cssPath = contextPath.split("/")[10];
				var oRow = new sap.m.ColumnListItem();
				if (cssPath === "0") {
					oRow.addStyleClass("changeAddRowBg");
				}
				oRow.bindAggregation("cells", sPath, function(index, context) {
					var model = context.getModel();
					var contextPath = context.getPath();
					var sPath = "oMatSectionModel>" + contextPath;
					var cuurentObj = model.getProperty(contextPath);
					var fieldVisible = formatter.formatBooleanValues(cuurentObj.isVisible);
					if (fieldVisible) {
						if (cuurentObj.uiFieldType === "Input") {
							if (status === "Update Pending") {
								if (cuurentObj.fieldValueNew === cuurentObj.fieldValue || cuurentObj.fieldValue === "" || cuurentObj.fieldValue === null) {
									var oNewInput = new sap.m.Input({
										value: {
											parts: [sPath + "/fieldValueNew", sPath + "/fieldId"],
											formatter: formatter.comaSeparator
										},
										width: "100%",
										visible: {
											path: sPath + "/isVisible",
											formatter: formatter.formatBooleanValues
										},
										enabled: {
											path: sPath + "/isEditable",
											formatter: formatter.formatBooleanValues
										},
										valueState: {
											path: sPath + "/valueState",
											formatter: formatter.formaValueState
										},
										change: function(oEvent) {
											that.setScaleUndoSpath(oEvent);
										}
									}).addStyleClass("inputBaseClass noBorder apprvInputBaseClass sapUiSizeCompact inputBaseClass1");
									var oNewCustomData = new sap.ui.core.CustomData({
										key: "{" + sPath + "/fieldType}",
										value: "{" + sPath + "/fieldId}"
									});
									oNewInput.addCustomData(oNewCustomData);
									return oNewInput;
								} else {
									var oVBox = new sap.m.VBox();
									var oNewInput = new sap.m.Input({
										value: {
											parts: [sPath + "/fieldValueNew", sPath + "/fieldId"],
											formatter: formatter.comaSeparator
										},
										width: "100%",
										visible: {
											path: sPath + "/isVisible",
											formatter: formatter.formatBooleanValues
										},
										enabled: {
											path: sPath + "/isEditable",
											formatter: formatter.formatBooleanValues
										},
										valueState: {
											path: sPath + "/valueState",
											formatter: formatter.formaValueState
										},
										change: function(oEvent) {
											that.setScaleUndoSpath(oEvent);
										}
									}).addStyleClass("inputBaseClass noBorder apprvInputBaseClass sapUiSizeCompact inputBaseClass1");
									var oNewCustomData = new sap.ui.core.CustomData({
										key: "{" + sPath + "/fieldType}",
										value: "{" + sPath + "/fieldId}"
									});
									oNewInput.addCustomData(oNewCustomData);
									oVBox.addItem(oNewInput);

									var oHBox = new sap.m.HBox();
									oHBox.addStyleClass("horizonatlLineStyleClass");
									oVBox.addItem(oHBox);

									var oOldInput = new sap.m.Input({
										value: {
											parts: [sPath + "/fieldValue", sPath + "/fieldId"],
											formatter: formatter.comaSeparator
										},
										width: "100%",
										visible: {
											path: sPath + "/isVisible",
											formatter: formatter.formatBooleanValues
										},
										enabled: {
											path: sPath + "/isEditable",
											formatter: formatter.formatBooleanValues
										},
										valueState: {
											path: sPath + "/valueState",
											formatter: formatter.formaValueState
										},
										change: function(oEvent) {
											that.setScaleUndoSpath(oEvent);
										}
									}).addStyleClass("inputBaseClass noBorder apprvInputBaseClass sapUiSizeCompact oldValueColor inputBaseClass1");
									var oCustomData = new sap.ui.core.CustomData({
										key: "{" + sPath + "/fieldType}",
										value: "{" + sPath + "/fieldId}"
									});
									oOldInput.addCustomData(oCustomData);
									oVBox.addItem(oOldInput);
									return oVBox;
								}
							} else {
								var oNewInput = new sap.m.Input({
									/*value: {
									                parts: [sPath + "/fieldValueNew", sPath + "/fieldId"],
									                formatter: formatter.comaSeparator
									},*/
									value: "{" + sPath + "/fieldValueNew}",

									width: "100%",
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatBooleanValues
									},
									enabled: {
										path: sPath + "/isEditable",
										formatter: formatter.formatBooleanValues
									},
									valueState: {
										path: sPath + "/valueState",
										formatter: formatter.formaValueState
									},
									change: function(oEvent) {
										that.setScaleUndoSpath(oEvent);
									}
								}).addStyleClass("inputBaseClass1");
								return oNewInput;
							}
						} else if (cuurentObj.uiFieldType === "Button") {
							if (cuurentObj.fieldValue === "sap-icon://add") {
								var oAddButton = new sap.m.Button({
									type: "Transparent",
									icon: "{" + sPath + "/fieldValue}",
									enabled: {
										path: sPath + "/isEditable",
										formatter: formatter.formatBooleanValues
									},
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatBooleanValues
									},
									press: function(oEvent) {
										that.onAddNewScale(oEvent);
									}
								}).addStyleClass("cellBground");
								return oAddButton;
							} else {
								var oHBox = new sap.m.HBox();
								var oDeleteBtn = new sap.m.Button({
									type: "Transparent",
									icon: "{" + sPath + "/fieldValue}",
									enabled: {
										path: sPath + "/isEditable",
										formatter: formatter.formatBooleanValues
									},
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatBooleanValues
									},
									press: function(oEvent) {
										that.onDeleteScale(oEvent);
									}
								}).addStyleClass("cellBground");
								var oEditBtn = new sap.m.Button({
									type: "Transparent",
									icon: "{" + sPath + "/fieldValue1}",
									enabled: {
										path: sPath + "/isEditable",
										formatter: formatter.formatBooleanValues
									},
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatBooleanValues
									},
									press: function(oEvent) {
										that.onEditScale(oEvent);
									}
								}).addStyleClass("cellBground");
								oHBox.addItem(oEditBtn);
								oHBox.addItem(oDeleteBtn);
								return oHBox;
							}

						} else if (cuurentObj.uiFieldType === "vbox") {
							var oImage = new sap.m.Image({
								src: {
									path: sPath + "/colorCode",
									formatter: formatter.setImageColorMode
								},
								tooltip: {
									path: sPath + "/colorCode",
									formatter: formatter.setImageTooltip
								}
							});
							return oImage;
						} else {
							var oText = new sap.m.Text({
								text: ""
							}).addStyleClass("");
							return oText;
						}
					} else {
						var oLabel = new sap.m.Label({
							visible: false
						});
						return oLabel;
					}
				});
				return oRow;
			});
			var oScaleTable1 = oScaleTable;
		},

		onDeleteScale: function(oEvent) {

			var mPath = this.selectedTabSPath;
			var oMatSectionModel = this.oMatSectionModel;
			var bindingContext = oEvent.getSource().getParent().getBindingContext("oMatSectionModel");
			var listPath = bindingContext.sPath.split("/")[6];
			var scalePath = bindingContext.sPath.split("/")[8];
			var length = bindingContext.sPath.split("/").length - 1;
			var sPath = bindingContext.sPath.split("/")[length];
			var scaleDataPath = bindingContext.sPath.split("/")[10];
			var oCondtionTypeRec = oMatSectionModel.getData().conditionTypesRecords.entry[mPath];
			var oCurrRec = oCondtionTypeRec.value.listMatrialInfoRecord[listPath].tableColumnRecords;
			var oRecordNumber = formatter.getConditionConditionRecNo(oCurrRec);
			var oArray = oCurrRec[scalePath].scaleDataList;
			var currentObj = oArray[scaleDataPath].parameterList;
			var oFieldPathIndex = sPath.split("/");
			oFieldPathIndex = oFieldPathIndex[oFieldPathIndex.length - 1];

			if (isNaN(sPath)) {
				var obj = {};
				obj.parameterList = oArray[sPath];
				var oTempArry = [];
				oTempArry.push(obj);
				sPath = 0;
			} else {
				var oTempArry = oArray;
			}

			var oSelectedArry = oTempArry[scaleDataPath].parameterList;
			var bValHardDelete = formatter.validateRecordOnUIDelete(oSelectedArry);
			var bVal = oSelectedArry[0].hasOwnProperty("deletionFlag");
			if (bVal) {
				var obj = oSelectedArry[0];
				if (oSelectedArry[0].changeMode !== "DELETE") {

					if (bValHardDelete) {
						oTempArry.splice(sPath, 1);
						return;
					}
					//Set 'Change Mode' to 'Deleted', when a obj from service is deleted.
					var prevValue = obj.changeMode;
					var undoModel = this.oUndoModel;
					var obj2 = oSelectedArry[1];
					var prevChangeMode = obj2.colorCode;
					oSelectedArry[oSelectedArry.length - 1].isVisible = "false";
					var deleteBtnPath = oEvent.getSource().getBindingContext("oMatSectionModel").getPath();
					obj.deletionFlag = "true";
					obj.fieldValue = "True";
					var prevChangeMode = "";
					if (obj.changeMode === "CREATE") {
						prevChangeMode = "CREATE";
					} else {
						prevChangeMode = obj.changeMode;
					}
					obj.uiPrevValue = prevChangeMode;
					obj.changeMode = "DELETE";
					oSelectedArry[1].colorCode = "DELETED";
					//Disabling the row
					formatter.setConditionRecEditable(oSelectedArry, "false");
					var scalesPath = bindingContext.getPath();
					scalesPath = scalesPath.split("scaleDataList");
					scalesPath = scalesPath[0] + "scaleDataList";
					var scalesData = oMatSectionModel.getProperty(scalesPath);
					formatter.updateSameCondtionRecordScales(scalesPath, scalesData, oRecordNumber, oMatSectionModel, this.selectedTabSPath, oCurrRec[0].changeMode, oCurrRec[1].colorCode,
						undoModel, deleteBtnPath, prevValue, this.selectedIconTab, "DELETE"); 
					formatter.setVersion2ScalesUndo(scalesData, oRecordNumber, scalesPath, oMatSectionModel, oCurrRec[0].changeMode, oCurrRec[1].colorCode, this.selectedTabSPath);
			
					var toastMsg = "DELETE: Scales undone for Condition record "+ oRecordNumber ;
					formatter.setPreviousStateObjects(deleteBtnPath, "oMatSectionModel", prevValue, undoModel, "OBJECT", "DELETE", "", "", true, "", this.selectedIconTab, oRecordNumber, toastMsg);
					undoModel.setProperty("/undoBtnEnabled", true);
				} else {
					return;
				}
			} else {
				oTempArry.splice(sPath, 1);
			}
			oCondtionTypeRec.value.listMatrialInfoRecord[listPath].tableColumnRecords[scalePath].scaleDataList = oTempArry;
			this.setMaximumQuantity(oArray);
			oMatSectionModel.refresh(true);
		},

		//Validate if row cells is not empty, before adding a new row
		onAddNewScale: function(oEvent) {

			var mPath = this.selectedTabSPath;
			var oMatSectionModel = this.oMatSectionModel;
			var bindingContext = oEvent.getSource().getParent().getBindingContext("oMatSectionModel");
			var listPath = bindingContext.sPath.split("/")[6];
			var scalePath = bindingContext.sPath.split("/")[8];
			var length = bindingContext.sPath.split("/").length - 1;
			var sPath = bindingContext.sPath.split("/")[length];
			var scaleDataPath = bindingContext.sPath.split("/")[10];
			var oCondtionTypeRec = oMatSectionModel.getData().conditionTypesRecords.entry[mPath];
			var oCurrRec = oCondtionTypeRec.value.listMatrialInfoRecord[listPath].tableColumnRecords;
			var oRecordNumber = formatter.getConditionConditionRecNo(oCurrRec);
			var oArray = oCurrRec[scalePath].scaleDataList;
			var currentObj = oArray[scaleDataPath].parameterList;

			var evt = oEvent.getSource();
			var count = 0;
			var pPath = evt.getBindingContext("oMatSectionModel").getPath();
			for (var i = 0; i < currentObj.length; i++) {
				if (currentObj[i].valueState === "Error") {
					count++;
				}
			}
			if (count === 0) {
				for (var i = 0; i < currentObj.length; i++) {
					if (currentObj[i].fieldId === "KSTBM") {
						var sortValue = currentObj[i].fieldValueNew;
					}
				}

				var selectedObj = oMatSectionModel.getProperty(pPath);
				selectedObj.isEditable = "false";
				var index = this.sortScaleTableData(sortValue, currentObj, scaleDataPath, oArray);
				currentObj.filter(function(obj1, i1, arr1) {
					if (obj1.fieldId !== "ACTIONS" && obj1.fieldId !== "KMEIN" && obj1.fieldId !== "KONWA") {
						obj1.fieldValueNew = null;
					}
				});

				formatter.formateValueEnable(oArray, scaleDataPath, oMatSectionModel);
				oMatSectionModel.refresh();
			} else {
				var errorText = this.oResourceModel.getText("MINIMUM_QUANTITY_EXIST");
				formatter.toastMessage(errorText);
			}
			
			//Set cond1tion record table 1st column for the images 
			var prevMode = {};
			if(oCurrRec[0].changeMode === "NO_CHANGE"){
				oCurrRec[0].changeMode = "CHANGED";
				oCurrRec[1].colorCode = "CHANGE";
				prevMode.changeMode = "NO_CHANGE";
				prevMode.colorCode = "";
			}else if(oCurrRec[0].changeMode === "CREATE"){
				prevMode.changeMode = "CREATE";
				prevMode.colorCode = "CREATED";
			} else if(oCurrRec[0].changeMode === "CHANGED"){
				prevMode.changeMode = oCurrRec[0].changeMode;
				prevMode.colorCode = oCurrRec[1].colorCode;
				oCurrRec[0].changeMode = "CHANGED";
				oCurrRec[1].colorCode = "CHANGE";
			}else if(oCurrRec[0].changeMode === "UPDATE"){
				prevMode.changeMode = oCurrRec[0].changeMode;
				prevMode.colorCode = oCurrRec[1].colorCode;
				oCurrRec[0].changeMode = "CHANGED";
				oCurrRec[1].colorCode = "CHANGE";
			}
			
			var undoModel = this.oUndoModel;
			var newIndex = bindingContext.getPath().split("/");
			newIndex[newIndex.length - 1] = index;
			newIndex = newIndex.join("/");
			
			var scalesPath = bindingContext.getPath();
			scalesPath = scalesPath.split("scaleDataList");
			scalesPath = scalesPath[0] + "scaleDataList";
			var scalesData = oMatSectionModel.getProperty(scalesPath);
			formatter.updateSameCondtionRecordScales(scalesPath, scalesData, oRecordNumber, oMatSectionModel, this.selectedTabSPath, oCurrRec[0].changeMode, oCurrRec[1].colorCode,
				undoModel, newIndex, prevMode, this.selectedIconTab, "NEW"); 
			formatter.setVersion2ScalesUndo(scalesData, oRecordNumber, scalesPath, oMatSectionModel, oCurrRec[0].changeMode, oCurrRec[1].colorCode, 
			this.selectedTabSPath);
			
			var toastMsg = "Create: Scales undone for Condition record "+ oRecordNumber ;
			formatter.setPreviousStateObjects(newIndex, "oMatSectionModel", prevMode, undoModel, "OBJECT", "NEW", "", "", true, "", this.selectedIconTab, oRecordNumber, toastMsg);
			undoModel.setProperty("/undoBtnEnabled", true);

			oCondtionTypeRec.value.listMatrialInfoRecord[listPath].tableColumnRecords[scalePath].fieldValueNew = ((oArray.length) - 1).toString();
			oMatSectionModel.refresh();
		},

		onEditScale: function(OEvt) {
			var evt = OEvt.getSource();
			var mPath = this.selectedTabSPath;
			var oButtonValue = evt.getIcon();
			var oMatSectionModel = this.oMatSectionModel;
			var undoModel = this.oUndoModel;
			
			var bindingContext = OEvt.getSource().getParent().getBindingContext("oMatSectionModel");
			var listPath = bindingContext.sPath.split("/")[6];
			var scalePath = bindingContext.sPath.split("/")[8];
			var length = bindingContext.sPath.split("/").length - 1;
			var sPath = bindingContext.sPath.split("/")[length];
			var scaleDataPath = bindingContext.sPath.split("/")[10];
			var oCondtionTypeRec = oMatSectionModel.getData().conditionTypesRecords.entry[mPath];
			/*var oArray = oCondtionTypeRec.value.listMatrialInfoRecord[listPath].tableColumnRecords[scalePath].scaleDataList;
			var currentObj = oArray[scaleDataPath].parameterList;*/
			var oCurrRec = oCondtionTypeRec.value.listMatrialInfoRecord[listPath].tableColumnRecords;
			var oRecordNumber = formatter.getConditionConditionRecNo(oCurrRec);
			var oArray = oCurrRec[scalePath].scaleDataList;
			var currentObj = oArray[scaleDataPath].parameterList;
			
			if (oButtonValue === "sap-icon://edit") {
				currentObj.filter(function(obj, i, arr) {
					if (obj.fieldId === "Max_Quantity" || obj.fieldId === "KMEIN" || obj.fieldId === "KONWA") {
						obj.isEditable = "false";
					} else {
						obj.isEditable = "true";
					}

					if (obj.fieldValue1 === oButtonValue) {
						obj.fieldValue1 = "sap-icon://accept";
					}
				});
				var allData = oArray;
				allData.filter(function(obj, i, arr) {
					var Paramdata = obj.parameterList;
					Paramdata.filter(function(obj1, i1, arr1) {
						if (obj1.fieldValue1 === "sap-icon://accept" && obj1.fieldValue === "sap-icon://delete") {
							obj1.isEditable = "true";
						}
						if (obj1.fieldValue1 === "sap-icon://edit" && obj1.fieldValue === "sap-icon://delete") {
							obj1.isEditable = "false";
						}
					});

				});
				var undoObj = {};
				//var editScaleRec = jQuery.extend(true, {}, oArray[scaleDataPath]);
				var editScaleRec = jQuery.extend(true, [], oArray);
				undoObj.prevRec = editScaleRec;
				undoObj.index = scaleDataPath;
				undoObj.sPath = bindingContext.getPath();
				undoModel.setProperty("/scaleEdit", undoObj);
			} else {
				var count = 0;
				for (var i = 0; i < currentObj.length; i++) {
					if (currentObj[i].valueState === "Error") {
						count++;
					}
				}
				if (count === 0) {

					for (var i = 0; i < currentObj.length; i++) {
						if (currentObj[i].fieldId === "KSTBM") {
							var sortValue = currentObj[i].fieldValueNew;
						}
					}

					var index = this.sortScaleTableData(sortValue, currentObj, scaleDataPath, oArray);

					currentObj.filter(function(obj, i, arr) {
						obj.isEditable = "false";
						if (obj.fieldValue1 === oButtonValue) {
							obj.fieldValue1 = "sap-icon://edit";
						}
					});

					var allData = oArray;
					allData.filter(function(obj, i, arr) {
						var Paramdata = obj.parameterList;
						Paramdata.filter(function(obj1, i1, arr1) {
							if (obj1.fieldValue1 === "sap-icon://accept" && obj1.fieldValue === "sap-icon://delete") {
								obj1.isEditable = "false";
							}
							if (obj1.fieldValue1 === "sap-icon://edit" && obj1.fieldValue === "sap-icon://delete") {
								obj1.isEditable = "true";
							}
						});

					});
					oCondtionTypeRec.value.listMatrialInfoRecord[listPath].tableColumnRecords[scalePath].fieldValueNew = ((oArray.length) - 1).toString();
						
					var prevMode = {};
					var prevRec = undoModel.getProperty("/scaleEdit");
					undoModel.setProperty("/scaleEdit", "");
					
					if(oCurrRec[0].changeMode === "NO_CHANGE"){
						oCurrRec[0].changeMode = "CHANGED";
						oCurrRec[1].colorCode = "CHANGE";
						prevRec.changeMode = "NO_CHANGE";
						prevRec.colorCode = "";
					}else if(oCurrRec[0].changeMode === "CREATE"){
						prevRec.changeMode = "CREATE";
						prevRec.colorCode = "CREATED";
					} else if(oCurrRec[0].changeMode === "CHANGED"){
						prevRec.changeMode = oCurrRec[0].changeMode;
						prevRec.colorCode = oCurrRec[1].colorCode;
						oCurrRec[0].changeMode = "CHANGED";
						oCurrRec[1].colorCode = "CHANGE";
					}else if(oCurrRec[0].changeMode === "UPDATE"){
						prevRec.changeMode = oCurrRec[0].changeMode;
						prevRec.colorCode = oCurrRec[1].colorCode;
						oCurrRec[0].changeMode = "CHANGED";
						oCurrRec[1].colorCode = "CHANGE";
					}
					
					var newIndex = bindingContext.getPath().split("/");
					newIndex[newIndex.length - 1] = index;
					newIndex = newIndex.join("/");

					var scalesPath = bindingContext.getPath();
					scalesPath = scalesPath.split("scaleDataList");
					scalesPath = scalesPath[0] + "scaleDataList";
					var scalesData = oMatSectionModel.getProperty(scalesPath);
					formatter.updateSameCondtionRecordScales(scalesPath, scalesData, oRecordNumber, oMatSectionModel, this.selectedTabSPath, oCurrRec[0].changeMode, oCurrRec[1].colorCode,
						undoModel, newIndex, prevRec, this.selectedIconTab, "EDIT"); 
					formatter.setVersion2ScalesUndo(scalesData, oRecordNumber, scalesPath, oMatSectionModel, oCurrRec[0].changeMode, oCurrRec[1].colorCode, this.selectedTabSPath);
			
					var toastMsg = "Edit: Scales undone for Condition record "+ oRecordNumber ;
					formatter.setPreviousStateObjects(newIndex, "oMatSectionModel", prevRec, undoModel, "OBJECT", "EDIT", "", "", true, "", this.selectedIconTab, oRecordNumber, toastMsg);
					undoModel.setProperty("/undoBtnEnabled", true);
				} else {
					var errorText = this.oResourceModel.getText("MINIMUM_QUANTITY_EXIST");
					formatter.toastMessage(errorText);
				}
			}
			oMatSectionModel.refresh();
		},

		sortScaleTableData: function(sortValue, currentObj, selectedIndex, oArray) {
			var oMatSectionModel = this.oMatSectionModel;
			selectedIndex = parseInt(selectedIndex);
			sortValue = parseInt(sortValue);
			for (var i = 0; i < currentObj.length; i++) {
				if (currentObj[i].fieldId === "KSTBM") {
					var currValue = parseInt(currentObj[i].fieldValueNew);
					var currPrevValue = currentObj[i].editValue;
					currentObj[i].editValue = currValue;
				}
				if (currentObj[i].fieldId === "Max_Quantity") {
					var currMaxValue = currentObj[i].fieldValueNew;
				}
			}

			if (currPrevValue === "") {
				currPrevValue = currPrevValue;
			} else {
				currPrevValue = parseInt(currPrevValue);
			}

			if (currPrevValue === "") {
				currMaxValue = currMaxValue;
			} else {
				currMaxValue = parseInt(currMaxValue);
			}

			var currObj = jQuery.extend(true, [], currentObj);
			for (var i = 0; i < oArray.length; i++) {
				var paramData = oArray[i].parameterList;
				var Objects1 = formatter.getMinMaxQuantityObjects(paramData);
				for (var j = 0; j < Objects1.length; j++) {
					if (Objects1[j].fieldId === "KSTBM") {
						var minVal = Objects1[j].fieldValueNew;
						var maxVal = Objects1[j + 1].fieldValueNew;
					}
				}
				if (maxVal === "N") {
					maxVal = 99999999999999;
				} else if (maxVal === null) {
					maxVal = maxVal;
				} else {
					maxVal = parseInt(maxVal);
				}
				if (minVal === null) {
					minVal = minVal;
				} else {
					minVal = parseInt(minVal);
				}

				if (sortValue >= minVal && sortValue < maxVal) {
					var newrr = jQuery.extend(true, [], oArray[i]);
					for (var l = 0; l < newrr.parameterList.length; l++) {
						if (newrr.parameterList[l].fieldId === "KSTBM") {
							newrr.parameterList[l].fieldValueNew = sortValue;
							newrr.parameterList[l].fieldValue = sortValue;
							newrr.parameterList[l].editValue = sortValue;
						}
						if (newrr.parameterList[l].fieldId === "COLOR") {
							newrr.parameterList[l].colorCode = "CREATED";
						}
					}
					for (var l = 0; l < paramData.length; l++) {
						if (paramData[l].fieldId === "COLOR") {
							paramData[l].colorCode = "IMPACTED";
						}
					}
					var len = newrr.parameterList.length;
					var actionButton = newrr.parameterList[len - 1];
					actionButton.isVisible = "true";
					for (var k = 0; k < paramData.length; k++) {
						if (newrr.parameterList[k].fieldId !== "ACTIONS" && newrr.parameterList[k].fieldId !== "Max_Quantity" && newrr.parameterList[k]
							.fieldId !== "KSTBM") {
							newrr.parameterList[k].fieldValueNew = currObj[k].fieldValueNew;
						}
					}

					oArray.splice(i + 1, 0, newrr);
					if (selectedIndex > 0) {
						if (currValue > currPrevValue) {
							if (selectedIndex === i) {
								oArray.splice(selectedIndex + 1, 1);
							} else {
								oArray.splice(selectedIndex, 1);
							}
						} else {
							oArray.splice(selectedIndex + 1, 1);
						}

					}
					this.setMaximumQuantity(oArray);
					return i+1;

				}

			}

			oMatSectionModel.refresh();
		},

		//Function to check if any duplicate row is added
		valScalesDuplicateRow: function(oScaleTablerow) {
			var length = oScaleTablerow.length;
			for (var i = 0; i < length; i++) {
				var list = oScaleTablerow[i].parameterList;
				for (var j = 0; j < list.length; j++) {
					if (list[j].fieldValue === "") {
						return false;
					}
				}
			}
			return true;
		},

		//Function to delete selected rows in scales table
		/*onDeleteScale: function() {

		                var conditionTypePath = this.selectedTabSPath;
		                var oScalePathModel = this.oScalePathModel;
		                var oMatSectionModel = this.oMatSectionModel;
		                var oLinkSpath = oScalePathModel.getData().sPath;
		                var selectedScaleObj = oMatSectionModel.getProperty(oLinkSpath);
		                var oScaleTableData = selectedScaleObj.scaleDataList;
		                var bVal = selectedScaleObj.hasOwnProperty("scaleDataList");
		                if (bVal) {
		                                if (!Array.isArray(oScaleTableData)) {
		                                                var oTempArry = [];
		                                                oTempArry.push(oScaleTableData);
		                                                oScaleTableData = oTempArry;
		                                }
		                } else {
		                                oScaleTableData = oScaleTableData;
		                }
		                oMatSectionModel.refresh();
		                var oMatScaleTable = this._oDialog.getContent()[0].getContent()[0];
		                var selRowsSPath = oMatScaleTable.getSelectedItems();
		                var length = selRowsSPath.length;
		                for (var i = length - 1; i >= 0; i--) {
		                                var selectedPath = selRowsSPath[i].getBindingContext("oMatSectionModel").sPath.split("/");
		                                var index = selectedPath[selectedPath.length - 1];
		                                if (isNaN(parseInt(index))) {
		                                                index = "0";
		                                }
		                                var spliceObj = oScaleTableData.splice(index, 1);
		                }
		                oMatScaleTable.removeSelections(true);
		                oMatSectionModel.getProperty(oLinkSpath).fieldValueNew = oScaleTableData.length.toString();
		                oMatSectionModel.refresh();

		                var undoModel = this.oUndoModel;
		                formatter.setPreviousStateObjects(oLinkSpath, "oMatSectionModel", spliceObj, undoModel, "OBJECT", "DELETE", "", true, false, "",
		                                this.selectedIconTab);
		                undoModel.setProperty("/undoBtnEnabled", true);
		},*/

		//getting a status of active and inactive records
		onStatusUpdate: function(oEvent) {
			var that = this;
			//this.busy.open();
			var oElementVisibleModel = this.oElementVisibleModel;
			var statusText = oEvent.getSource().getKey();
			var oVariableKeyModel = this.getOwnerComponent().getModel("oVariableKeyModel");
			var data = oVariableKeyModel.getData().rows[0];
			var changeRecord = this.isChanged;
			var status = data[(data.length) - 1];

			var oMatSectionModel = this.oMatSectionModel;
			var oTempModel = this.oTempModel;

			if (status === "Update Pending") {
				if (statusText === "Active") {
					this.isActive = "Active";
					this.isChanged = changeRecord;
					oElementVisibleModel.getData().addButton = true;
					oElementVisibleModel.getData().undoButton = true;
				} else {
					this.isActive = "Inactive";
					this.isChanged = changeRecord;
					oElementVisibleModel.getData().addButton = false;
					oElementVisibleModel.getData().undoButton = false;
				}
			} else {
				if (statusText === "Active") {
					this.isActive = "Active";
					oElementVisibleModel.getData().addButton = true;
					oElementVisibleModel.getData().undoButton = true;
					oElementVisibleModel.getData().setStatus = this.isActive;
					oElementVisibleModel.getData().setRecord = this.isChanged;

					oMatSectionModel.setData(oTempModel.getData());
					if (this.oUndoModel.getProperty("/oConditionTypes").length) {
						oElementVisibleModel.getData().undoBtnEnabled = true;
					} else {
						oElementVisibleModel.getData().undoBtnEnabled = false;
					}
					oElementVisibleModel.refresh();
					return;
				} else {
					this.isActive = "Inactive";
					oElementVisibleModel.getData().addButton = false;
					oElementVisibleModel.getData().undoButton = false;
					oTempModel.setData(oMatSectionModel.getData());
				}
			}
			oElementVisibleModel.getData().setStatus = this.isActive;
			oElementVisibleModel.getData().setRecord = this.isChanged;
			oElementVisibleModel.refresh();
			that.getMaterialData();
		},

		//getting a mode of records all and change
		setConditionRecordOnChangeMode: function(oEvent) {

			var that = this;
			var oElementVisibleModel = that.oElementVisibleModel;
			var record = this.isActive;
			var conditionText = oEvent.getSource().getKey();
			if (conditionText === "ALL") {
				this.isActive = record;
				this.isChanged = "ALL";
			} else {
				this.isActive = record;
				this.isChanged = "CHANGE";
			}
			oElementVisibleModel.getData().setStatus = this.isActive;
			oElementVisibleModel.getData().setRecord = this.isChanged;
			oElementVisibleModel.refresh();
			that.getMaterialData();
		},

		//open a line comment popup
		openCommentBox: function(oEvent) {
			var oMatSectionModel = this.oMatSectionModel;
			var sPath = oEvent.getSource().getBindingContext("oMatSectionModel").getPath();
			if (!this.oCommentDialog) {
				this.oCommentDialog = sap.ui.xmlfragment("com.incture.fragment.comments", this);
			}
			this.getView().addDependent(this.oCommentDialog);
			this.createLineComment(sPath);
			this.oCommentDialog.open();
		},

		//On click of ok in comment popup
		onOkCommentBox: function(oEvent) {
			/*var oMatSectionModel = this.oMatSectionModel;
			var conditionRecords = this.conditionRecord;
			var headerData = oMatSectionModel.getData().headerRecords.recordList;
			var status = headerData[(headerData.length) - 1];
			//this.setDataOnCondition(status,conditionRecords);
			oMatSectionModel.refresh(true);*/
			this.oCommentDialog.close();
		},

		//On click of close in comment popup
		onCloseCommentBox: function(oEvent) {
			this.oCommentDialog.close();
		},

		createLineComment: function(pPath) {
			var that = this;
			var oMatSectionModel = that.oMatSectionModel;
			var selectedObj = oMatSectionModel.getProperty(pPath);
			var commentList = selectedObj.hasOwnProperty("commentList");
			if (commentList) {
				if (!Array.isArray(selectedObj.commentList)) {
					var oTempArry = [];
					oTempArry.push(selectedObj.commentList);
					selectedObj.commentList = oTempArry;
				}
			} else {
				selectedObj.commentList = [];
			}
			oMatSectionModel.refresh();

			var oCommentVBox = sap.ui.getCore().byId("LINE_CMNT_BOX");
			oCommentVBox.bindAggregation("items", "oMatSectionModel>" + pPath + "/commentList", function(index, context) {
				var contextPath = context.getPath();
				var oMatSectionModel = context.getModel();
				var sPath = "oMatSectionModel>" + contextPath;
				var oVBox = new sap.m.VBox();
				var oToolbar = new sap.m.Toolbar();
				var oLabel = new sap.m.Label({
					required: {
						path: sPath + "/isMandatory",
						formatter: formatter.formatBooleanValues
					},
					tooltip: "{" + sPath + "/label}",
					text: "{" + sPath + "/label}",
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatBooleanValues
					}
				}).addStyleClass("cmntLblClass");
				oToolbar.addContent(oLabel);
				oToolbar.addStyleClass("toolbarClass");
				oVBox.addItem(oToolbar);
				var oTextArea = new sap.m.TextArea({
					required: {
						path: sPath + "/isMandatory",
						formatter: formatter.formatBooleanValues
					},
					tooltip: "{" + sPath + "/fieldValue}",
					value: "{" + sPath + "/fieldValue}",
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatBooleanValues
					},
					enabled: {
						path: sPath + "/isEditable",
						formatter: formatter.formatBooleanValues
					},
					change: function(oEvent) {
						that.setUndoCommentsSpath(oEvent);
					}
				}).addStyleClass("lineCommentStyleClass");
				oVBox.addItem(oTextArea);
				oVBox.addStyleClass("approverCmntStle");
				return oVBox;
			});
		},

		setUndoCommentsSpath: function(oEvent) {
			var oMatSectionModel = this.oMatSectionModel;
			var sPath = oEvent.getSource().getBindingContext("oMatSectionModel").getPath();
			var selectedObj = oMatSectionModel.getProperty(sPath);
			var undoModel = this.oUndoModel;
			var prevValue = selectedObj.uiPrevValue;
			formatter.setPreviousStateObjects(sPath, "oMatSectionModel", prevValue, undoModel, "PROPERTY", "CHANGE", "fieldValue", true, false,
				"", this.selectedIconTab);
			selectedObj.uiPrevValue = selectedObj.fieldValue;
			undoModel.setProperty("/undoBtnEnabled", true);
		},

		setScaleUndoSpath: function(oEvent) {
			var evt = oEvent.getSource();
			var oValue = evt.getValue();
			var oMatSectionModel = this.oMatSectionModel;
			var sPath = oEvent.getSource().getBindingContext("oMatSectionModel").getPath();
			var selectedObj = oMatSectionModel.getProperty(sPath);

			var mPath = this.selectedTabSPath;
			var bindingContext = oEvent.getSource().getParent().getBindingContext("oMatSectionModel");
			var listPath = bindingContext.sPath.split("/")[6];
			var scalePath = bindingContext.sPath.split("/")[8];
			var length = bindingContext.sPath.split("/").length - 1;
			var pPath = bindingContext.sPath.split("/")[length];
			var scaleDataPath = bindingContext.sPath.split("/")[10];
			var oCondtionTypeRec = oMatSectionModel.getData().conditionTypesRecords.entry[mPath];
			//var oArray = oCondtionTypeRec.value.listMatrialInfoRecord[listPath].tableColumnRecords[scalePath].scaleDataList;
			//var currentObj = oArray[scaleDataPath].parameterList;
				
			var oCurrRec = oCondtionTypeRec.value.listMatrialInfoRecord[listPath].tableColumnRecords;
			var oRecordNumber = formatter.getConditionConditionRecNo(oCurrRec);
			var oArray = oCurrRec[scalePath].scaleDataList;
			var currentObj = oArray[scaleDataPath].parameterList;


			if (selectedObj.fieldId === "KSTBM") {
				formatter.formateValidValue(evt, oArray, oMatSectionModel, pPath, selectedObj);
			}
			if (selectedObj.fieldType === "FLOAT") {
				var regex = "[+-]?([0-9]*[.])?[0-9]+";
				var decimalPosition = "2"; //evt.getCustomData()[0].getValue();
			} else if (selectedObj.fieldType === "INT") {
				var regex = "^[1-9]([0-9]*)$";
			} else if (selectedObj.fieldType === "CHAR") {
				var regex = /^[a-zA-Z]+$/;
			}
			if (!oValue.match(regex)) {
				selectedObj.valueState = "Error";
				this.errorStateBVal = this.errorStateBVal + 1;
			} else {
				if (this.errorStateBVal > 0 && selectedObj.valueState === "Error") {
					this.errorStateBVal = this.errorStateBVal - 1;
					selectedObj.valueState = "None";
				}
			}
			formatter.formateValueEnable(oArray, scaleDataPath, oMatSectionModel);
			oMatSectionModel.refresh();

			/*var getPath = oEvent.getSource().getParent().getBindingContext("oMatSectionModel").getPath();
			var pathArr = getPath.split("/");
			var index = index.pop();
			if(parseInt(index) !== 0){
				var undoModel = this.oUndoModel;
				var prevValue = selectedObj.uiPrevValue;
				var toastMsg = "Edit: Scales undone for Condition record "+ oRecordNumber ;
				formatter.setPreviousStateObjects(sPath, "oMatSectionModel", prevValue, undoModel, "PROPERTY", "CHANGE", "fieldValue", true, true,
					"", this.selectedIconTab, oRecordNumber, toastMsg);
				selectedObj.uiPrevValue = selectedObj.fieldValue;
				undoModel.setProperty("/undoBtnEnabled", true);
			}*/
		},

		createHeaderComment: function() {
			var that = this;
			var oCommentVBox = this.getView().byId("HEADER_CMNT_BOX");
			oCommentVBox.bindAggregation("items", "oMatSectionModel>/headerCommentsList", function(index, context) {
				var contextPath = context.getPath();
				var oMatSectionModel = context.getModel();
				var sPath = "oMatSectionModel>" + contextPath;
				var oVBox = new sap.m.VBox();
				var oToolbar = new sap.m.Toolbar();
				var oLabel = new sap.m.Label({
					required: {
						path: sPath + "/isMandatory",
						formatter: formatter.formatBooleanValues
					},
					tooltip: "{" + sPath + "/label}",
					text: "{" + sPath + "/label}",
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatBooleanValues
					}
				}).addStyleClass("cmntLblClass");
				oToolbar.addContent(oLabel);
				oToolbar.addStyleClass("toolbarClass");
				oVBox.addItem(oToolbar);
				var oTextArea = new sap.m.TextArea({
					required: {
						path: sPath + "/isMandatory",
						formatter: formatter.formatBooleanValues
					},
					tooltip: "{" + sPath + "/fieldValue}",
					value: "{" + sPath + "/fieldValue}",
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatBooleanValues
					},
					enabled: {
						path: sPath + "/isEditable",
						formatter: formatter.formatBooleanValues
					},
					width: {
						path: sPath + "/isVisible",
						formatter: formatter.formatWidth
					}
				}).addStyleClass("");
				oVBox.addItem(oTextArea);
				oVBox.addStyleClass("approverCmntStle");
				return oVBox;
			});
		},

		onClickRevoke: function() {
			var that = this;
			// a callback that will be called when the message box is closed again
			function fnCallbackMessageBox(sResult) {
				if (sResult === "YES") {
					that.revokeProcess();
				}
			}
			// this is required since there is no direct access to the box's icons like MessageBox.Icon.WARNING
			jQuery.sap.require("sap.m.MessageBox");
			// open a fully configured message box
			sap.m.MessageBox.show("Do You Want to Revoke the process?", "",
				"Revoke Confirmation", [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				fnCallbackMessageBox,
				sap.m.MessageBox.Action.YES);
		},

		revokeProcess: function() {
			var that = this;
			var sUrl = "/CWPRICE_WEB/record/revoke";
			var oMatSectionModel = this.oMatSectionModel;
			var requestId = oMatSectionModel.getData().requestId;
			var variableKey = oMatSectionModel.getData().vkey;

			var payload = {
				"requestId": requestId,
				"variableKey": variableKey,
				"requesterDetail": this.getOwnerComponent().getModel("user").getData()
			};

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, JSON.stringify(payload), true, "POST", false, false, that.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					formatter.toastMessage("successfully revoked", that, true);
				} else {
					var errorText = oEvent.getSource().getData().message;
					formatter.toastMessage(errorText, that, true);
				}
			});
			oModel.attachRequestFailed(function(oEvent) {
				var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
				formatter.toastMessage(errorText, that, true);
			});
		},

		fetchBpmworkflowmonitor: function() {

			var that = this;
			this.busy.open();
			var oMatSectionModel = this.oMatSectionModel;
			var instanceId = oMatSectionModel.getData().processId;
			var requestId = oMatSectionModel.getData().requestId;

			var oUrl = "/DEST_BPM_MONITOR/sap/fiori/bpmworkflowmonitor/wfs/v1/xsrf-token";
			var token = formatter.fetchToken(oUrl);
			this.token = token;
			var oPayload = {
				"status": "canceled"
			};
			//var oContextData = oPayload;
			if (this.token) {
				var sUrl = "/DEST_BPM_MONITOR/sap/fiori/bpmworkflowmonitor/wfs/v1/workflow-instances/" + instanceId;
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8",
					"X-CSRF-Token": this.token
				};
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.loadData(sUrl, JSON.stringify(oPayload), true, "POST", false, false, oHeader);
				oModel.attachRequestCompleted(function(oEvent) {
					that.busy.close();
					sap.m.MessageBox.show("Successfully Created with Request ID : " + requestId, {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Success",
						onClose: function(oAction) {
							that.revokeProcess();
						}
					});
				});
				oModel.attachRequestFailed(function(oEvent) {
					that.busy.close();
					sap.m.MessageToast.show("Internal Server Error");
				});
			}

		},

		getNetPrice: function(oEvent) {
			var oTable = this.getView().byId("TABLEOFMATERIAL");
			oTable.setVisible(false);
			var oVBox = this.getView().byId("NETPRICEDATA");
			oVBox.setVisible(true);

			if (!this._oNetPrice) {
				this._oNetPrice = sap.ui.xmlfragment("com.incture.fragment.netPriceAnalysis", this);
			}
			this.getView().addDependent(this._oNetPrice);
			this.getNetPriceData();
			oVBox.addItem(this._oNetPrice);

		},

		getNetPriceData: function() {
			var that = this;
			//this.busy.open();
			var oNetPriceModel = this.oNetPriceModel;
			var sUrl = "/CWPRICE_WEB/record/analytics";
			var payload = {};
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, JSON.stringify(payload), true, "POST", false, false, that.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = oEvent.getSource().getData();
					if (resultData.hasOwnProperty("listOfNetPrice")) {
						if (!Array.isArray(resultData.listOfNetPrice)) {
							var oTempArr = [];
							oTempArr.push(resultData.listOfNetPrice);
							resultData.listOfNetPrice = oTempArr;
						}
					} else {
						resultData.listOfNetPrice = [];
					}
					oNetPriceModel.setData(resultData);
					oNetPriceModel.refresh();
					that.createNetPriceTable();
				} else {
					var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
					formatter.toastMessage(errorText);
					//that.busy.close();
				}
			});
			oModel.attachRequestFailed(function(oEvent) {
				var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
				formatter.toastMessage(errorText);
				that.busy.close();
			});

		},

		backToTable: function(oEvent) {
			var oTable = this.getView().byId("TABLEOFMATERIAL");
			oTable.setVisible(true);
			var oVBox = this.getView().byId("NETPRICEDATA");
			oVBox.setVisible(false);
		},

		createNetPriceTable: function() {
			var oNetPriceModel = this.oNetPriceModel;
			var oSearchLayGrid = sap.ui.getCore().byId("NET_PRICE_BOX");
			oSearchLayGrid.bindAggregation("content", "oNetPriceModel>/listOfData", function(index, context) {
				var contextPath = context.getPath();
				var oNetPriceModel = context.getModel();
				var sPath = "oNetPriceModel>" + contextPath;
				var currentObj = oNetPriceModel.getProperty(contextPath);
				var oVBox = new sap.m.VBox();
				oVBox.addStyleClass("netPriceVboxClass");
				var oTable = new sap.m.Table();
				var oLabel = new sap.m.Label({
					text: "{" + sPath + "/label}"
				}).addStyleClass("inctureNetPrcTxtCls");
				oVBox.addItem(oLabel);
				oTable.bindAggregation("columns", "oNetPriceModel>/listOfParameterColumn", function(index, context) {
					var contextPath = context.getPath();
					var model = context.getModel();
					var sPath = "oNetPriceModel>" + contextPath;
					var oColumn = new sap.m.Column({
						visible: {
							path: sPath + "/isVisible",
							formatter: formatter.formatBooleanValues
						},
						header: new sap.m.Text({
							wrapping: true,
							text: "{" + sPath + "/label}"
						}).addStyleClass("TableHdrTxtClass matTblHdrClass")
					});
					return oColumn;
				});
				oTable.bindAggregation("items", "oNetPriceModel>" + contextPath + "/listOfValues", function(index, context) {
					var contextsPath = context.getPath();
					var model = context.getModel();
					var row = new sap.m.ColumnListItem();
					var sPath = "oNetPriceModel>" + contextsPath + "/parameterList";
					row.bindAggregation("cells", sPath, function(index, context) {
						var model = context.getModel();
						var sPath = context.getPath();
						var bindingPath = "oNetPriceModel>" + sPath;
						var cuurentObj = model.getProperty(sPath);
						var fieldVisible = formatter.formatBooleanValues(cuurentObj.isVisible);
						if (fieldVisible) {
							var oText = new sap.m.Text({
								text: "{" + bindingPath + "/fieldValue}"
							}).addStyleClass("");
							return oText;

						} else {
							var oLabel = new sap.m.Label({
								visible: false
							});
							return oLabel;
						}
						/*var oText = new sap.m.Text({
						                text:"{" + bindingPath + "/fieldValue}"
						}).addStyleClass("");
						return oText;*/
					});
					return row;
				});

				oTable.addStyleClass("materialTblClass sapUiSizeCompact");
				oVBox.addItem(oTable);
				return oVBox;
			});
		},

		undoVersion2Log: function(recordNumber) {
			var oMatSectionModel = this.oMatSectionModel;
			var oVersion2Log = oMatSectionModel.getProperty("/oVersion2Log/entry/" + this.selectedTabSPath + "/value/listMatrialInfoRecord");
			var checkDuplicateRec = formatter.checkDuplicateConditionRec(recordNumber, oVersion2Log);
			if (checkDuplicateRec[0] === true) {
				var index = checkDuplicateRec[1];
				var oPath = "/oVersion2Log/entry/" + this.selectedTabSPath + "/value/listMatrialInfoRecord/" + index;
				var oCurrentObj = oMatSectionModel.getProperty(oPath);
				var oFirstObj = oCurrentObj.tableColumnRecords[0];
				var oSecondObj = oCurrentObj.tableColumnRecords[1];
				if (oFirstObj.changeMode === "CHANGED" || oFirstObj.changeMode === "UPDATE") {
					var oDates = dateFunctions.getStartEndDateObjects(oCurrentObj);
					var startDtObj = oDates[0];
					startDtObj.fieldValue = startDtObj.uiPrevValue;
					startDtObj.fieldValueNew = startDtObj.uiPrevValue;

					var endDtObj = oDates[1];
					endDtObj.fieldValue = endDtObj.uiPrevValue;
					endDtObj.fieldValueNew = endDtObj.uiPrevValue;

					oFirstObj.changeMode = "NO_CHANGE";
					oSecondObj.colorCode = "";
				} else if (oFirstObj.changeMode === "CREATE") {
					oVersion2Log.splice(index, 1);
				}
			}
		},

		onActionUndo: function() {

			var oArray;
			var mPath = this.selectedTabSPath;
			var oUndoModel = this.oUndoModel;
			var selectedIconTab = this.selectedIconTab;

			var oConditionTypes = oUndoModel.getData().oConditionTypes;
			oConditionTypes.forEach(function(obj) {
				if (selectedIconTab === obj.key) {
					oArray = obj.prevStateArray;
				}
			});

			if (oArray.length) {
				var lastObj = oArray.pop();
				var oModel = this.getView().getModel(lastObj.oModel);
				var sPath = lastObj.sPath;
				var objectType = lastObj.objectType;
				var oPrevObj = lastObj.prevData;
				var changedField = lastObj.changedField;
				var changeType = lastObj.changeType;
				var toastMsgBval = lastObj.toastMsgBval;
				var isScales = lastObj.isScales;
				var prevChangeMode = lastObj.prevChangeMode;
				var recordNumber = lastObj.recordNumber;
				var scalesToast = lastObj.scalesToast;

				var oRowNumber = sPath.split("listMatrialInfoRecord/")[1].split("/")[0];
				oRowNumber = parseInt(oRowNumber, 10) + 1;
				oRowNumber = oRowNumber.toString();

				if (objectType === "ARRAY") {
					this.undoVersion2Log(recordNumber);
					var sPathIndex = sPath.split("listMatrialInfoRecord/")[1].split("/")[0];
					sPath = "/conditionTypesRecords/entry/" + mPath + "/value/listMatrialInfoRecord";
					oModel.setProperty(sPath, oPrevObj);

					if (objectType === "ARRAY" && Array.isArray(oPrevObj) && changeType === "NEW") {
						for (var j = oArray.length - 1; j >= 0; j--) {
							var objSpath = oArray[j].sPath;
							objSpath = objSpath.split("listMatrialInfoRecord/")[1].split("/")[0];
							if (sPathIndex === objSpath) {
								oArray.splice(j, 1);
							}
						}
					}
				} else if (objectType === "OBJECT") {
					if (changeType === "NEW") {
						if (toastMsgBval) {
							var oSelectedObj = oModel.getProperty(sPath);
							if (oSelectedObj.hasOwnProperty("scaleDataList")) {
								var scaleDataList = oSelectedObj.scaleDataList;
								var sIndex = scaleDataList.length - 1;
								scaleDataList.splice(sIndex, 1);
								oModel.getProperty(sPath).fieldValueNew = scaleDataList.length;
								var oText = "Newly added scale row reverted for condition number " + oRowNumber;
								formatter.toastMessage(oText);
							}
						} else {
							if(isScales){
								//Revert scales add row 
								formatter.undoScalesOnAdd(lastObj, oModel, this.selectedTabSPath, true, oRowNumber, this.oResourceModel);
								if(oArray.length){
									var m = sPath.split("/");
									var k = m.pop();
									sPath = m.join("/");
									
									var prevObj = oArray[oArray.length - 1];
									var secObjPath = prevObj.sPath;
									var s = secObjPath.split("/");
									var n = s.pop();
									secObjPath = s.join("/");
										
									if(sPath !== secObjPath){
										if (oArray[oArray.length - 1].recordNumber === recordNumber) {
											var obj = oArray.pop();
											formatter.undoScalesOnAdd(obj, oModel, this.selectedTabSPath, false, oRowNumber, this.oResourceModel);											
										}
									}
								}
								formatter.toastMessage(scalesToast);
							}else{
								var sIndex = sPath.charAt(sPath.length - 1);
								var s = "/conditionTypesRecords/entry/" + mPath + "/value/listMatrialInfoRecord";
								var oConditionRec = oModel.getProperty(s);
								oConditionRec.splice(sIndex, 1);	
							}
						}
					} else if (changeType === "CHANGE") {
						var changedObj = oModel.getProperty(sPath);
						changedObj[changedField] = oPrevObj;
					} else if (changeType === "EDIT" && isScales === true) {
						//Revert scales edit
						formatter.undoScalesOnAdd(lastObj, oModel, this.selectedTabSPath, true, oRowNumber, this.oResourceModel);
						if(oArray.length){
							var m = sPath.split("/");
							var k = m.pop();
							sPath = m.join("/");
								
							var prevObj = oArray[oArray.length - 1];
							var secObjPath = prevObj.sPath;
							var s = secObjPath.split("/");
							var n = s.pop();
							secObjPath = s.join("/");
										
							if(sPath !== secObjPath){
								if (oArray[oArray.length - 1].recordNumber === recordNumber) {
									var obj = oArray.pop();
									formatter.undoScalesOnAdd(obj, oModel, this.selectedTabSPath, false, oRowNumber, this.oResourceModel);											
								}
							}
						}
						formatter.toastMessage(scalesToast);
					} else if (changeType === "DELETE") {
						var oSelectedArry = oModel.getProperty(sPath);
						if (!oSelectedArry) {
							var m = sPath.split("/");
							var s = m.splice(m.length - 1, 1);
							var o = m.join("/");
							oSelectedArry = oModel.getProperty(o)[0];
						}
						if (toastMsgBval) {
							if (oSelectedArry.hasOwnProperty("scaleDataList")) {
								var scaleDataList = oSelectedArry.scaleDataList;
								scaleDataList.push(oPrevObj[0]);
								oModel.getProperty(sPath).fieldValueNew = scaleDataList.length;
								var oText = "Scale changes reverted for condition number" + oRowNumber;
								formatter.toastMessage(oText);
							}
						} else {
							if(isScales){
								formatter.undoOnDelete(lastObj, oModel, this.selectedTabSPath, true, oRowNumber, this.oResourceModel);
							if(oArray.length){
								if (oArray[oArray.length - 1].recordNumber === recordNumber) {
									var obj = oArray.pop();
									formatter.undoOnDelete(obj, oModel, this.selectedTabSPath, false, oRowNumber, this.oResourceModel);
									formatter.toastMessage(scalesToast);
								}
							}
							}else{
								formatter.undoOnDelete(lastObj, oModel, this.selectedTabSPath, true, oRowNumber, this.oResourceModel);
							if(oArray.length){
								if (oArray[oArray.length - 1].recordNumber === recordNumber) {
									var obj = oArray.pop();
									formatter.undoOnDelete(obj, oModel, this.selectedTabSPath, false, oRowNumber, this.oResourceModel);
								}
							}
							}
							
						}
					}
				} else if (objectType === "PROPERTY") {
					formatter.undoOnInputField(lastObj, oModel, this.selectedTabSPath, true, oRowNumber, this.oResourceModel);
					if(oArray.length){
						if (oArray[oArray.length - 1].recordNumber === recordNumber) {
							var obj = oArray.pop();
							formatter.undoOnInputField(obj, oModel, this.selectedTabSPath, false, oRowNumber, this.oResourceModel);
						}	
					}
				}
				if (!oArray.length) {
					oUndoModel.setProperty("/undoBtnEnabled", false);
				}
				oModel.refresh();
			}
		},

		fntriggerBPM: function(requestId) {
			var that = this;
			this.busy.open();
			var oVariableKeyModel = this.getOwnerComponent().getModel("oVariableKeyModel");
			var data = oVariableKeyModel.getData().rows[0];
			var userModel = this.getOwnerComponent().getModel("user");
			var decisionTableId = data[0];

			var oUrl = "/destination/bpmworkflowruntime/workflow-service/rest/v1/xsrf-token";
			var token = formatter.fetchToken(oUrl);
			this.token = token;
			var oPayload = {
				"definitionId": "priceupdate", // work flow name
				"context": {
					"request": {
						"requestId": requestId
					},
					"decisionTable": decisionTableId,
					"usage": "A",
					"application": "M",
					"requesterDetail": this.getOwnerComponent().getModel("user").getData(),
					"requestedBy": userModel.getData().name, //firstName,
					"approvars": ["S0016270146"],
					"isApprove": ""
				}
			};
			// var oContextData = oPayload;
			if (this.token) {
				var sUrl = "/destination/bpmworkflowruntime/workflow-service/rest/v1/workflow-instances";
				var oHeader = {
					"Content-Type": "application/json; charset=utf-8",
					"X-CSRF-Token": this.token
				};
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.loadData(sUrl, JSON.stringify(oPayload), true, "POST", false, false, oHeader);
				oModel.attachRequestCompleted(function(oEvent) {
					that.busy.close();
					sap.m.MessageBox.show("Successfully Created with Request ID : " + requestId, {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Success",
						onClose: function(oAction) {
							that.onNavBack(true);
						}
					});
				});
				oModel.attachRequestFailed(function(oEvent) {
					that.busy.close();
					sap.m.MessageToast.show("Internal Server Error");
				});
			}
		},

		getRequestStatus: function(requestId) {

				var sUrl = "/pricemaintainencerest/record/requestStatus/" + requestId;
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.loadData(sUrl, "", true, "GET", false, false, this.oHeader);
				oModel.attachRequestCompleted(function(oEvent) {
					if (oEvent.getParameter("success")) {
						sap.m.MessageBox.show("Successfully Created with Request ID : " + requestId, {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Success",
							onClose: function(oAction) {}
						});
					}
				});
				// });
				oModel.attachRequestFailed(function(oEvent) {
					// var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
					// formatter.toastMessage(errorText);
				});
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf view.Material11
			 */
			// onBeforeRendering: function() {
			//
			// },
			/**
			 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
			 * This hook is the same one that SAPUI5 controls get after being rendered.
			 * @memberOf view.Material11
			 */
			//onAfterRendering: function() {
			//            
			// }
			/**
			 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
			 * @memberOf view.Material11
			 */
			// onExit: function() {
			//
			// }
	});
});