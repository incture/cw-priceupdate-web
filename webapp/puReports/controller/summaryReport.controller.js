sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"PU_Reports/formatter/formatter",
	"sap/m/BusyDialog",
	"sap/ui/model/json/JSONModel",
	"sap/viz/ui5/data/FlattenedDataset",
	"sap/viz/ui5/controls/common/feeds/FeedItem",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format"
], function(Controller, formatter, BusyDialog, JSONModel, FlattenedDataset, FeedItem, ChartFormatter, Format) {
	"use strict";

	return Controller.extend("PU_Reports.controller.summaryReport", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf reports.summaryReport
		 */
		onInit: function() {
            var that = this;
            
			this.oHeader = {
				"Accept": "application/json",
				"Content-Type": "application/json"
			};
			this.busy = new BusyDialog();
			
			this._router = sap.ui.core.UIComponent.getRouterFor(this);
			this._router.attachRoutePatternMatched(function(oEvent) {
				var viewName = oEvent.getParameter("name");
				if ( viewName === "summaryReport") {
					that.routePatternMatched(oEvent);
				}
			});
			
			this.setUiModel();		
		
		},

		setUiModel: function(){
			
            var that = this;
			var oResourceModel = this.getOwnerComponent().getModel("i18n");
			this.oResourceModel = oResourceModel.getResourceBundle();
			
			var oSetVisibleModel = this.getOwnerComponent().getModel("oSetVisibleModel");
			this.oSetVisibleModel = oSetVisibleModel;
			
			oSetVisibleModel.setProperty("/MatSearch", true);
			oSetVisibleModel.setProperty("/advanceMat", false);
			oSetVisibleModel.setProperty("/reportBox", false);
			oSetVisibleModel.setProperty("/detailReport", false);
			oSetVisibleModel.setProperty("/summaryReport", false);
			oSetVisibleModel.setProperty("/selectedkey", "Detailed");
			oSetVisibleModel.refresh();

			var oSearchparameterModel = this.getOwnerComponent().getModel("oSearchparameterModel");
			this.oSearchparameterModel = oSearchparameterModel;

			var oAdvanceSearchModel = this.getOwnerComponent().getModel("oAdvanceSearchModel");
			this.oAdvanceSearchModel = oAdvanceSearchModel;

			var oBussinessObjectModel = this.getOwnerComponent().getModel("oBussinessObjectModel");
			this.oBussinessObjectModel = oBussinessObjectModel;

			var oGraphModel = this.getOwnerComponent().getModel("oGraphModel");
			this.oGraphModel = oGraphModel;

			var oTableModel = this.getOwnerComponent().getModel("oTableModel");
			this.oTableModel = oTableModel;

			var oGraphDataModel = this.getOwnerComponent().getModel("oGraphDataModel");
			this.oGraphDataModel = oGraphDataModel;

			/*Model for lapi services*/
			var oLapiServiceData = this.getOwnerComponent().getModel("oLapiServiceData");
			this.oLapiServiceData = oLapiServiceData;

			var oMatLookupModel = this.getOwnerComponent().getModel("oMatLookupModel");
			this.oMatLookupModel = oMatLookupModel;

			var oVendLookUpModel = this.getOwnerComponent().getModel("oVendLookUpModel");
			this.oVendLookUpModel = oVendLookUpModel;

			var oPlantLookupModel = this.getOwnerComponent().getModel("oPlantLookupModel");
			this.oPlantLookupModel = oPlantLookupModel;

			var oPurchaseOrgModel = this.getOwnerComponent().getModel("oPurchaseOrgModel");
			this.oPurchaseOrgModel = oPurchaseOrgModel;

			var oUPCLookupModel = this.getOwnerComponent().getModel("oUPCLookupModel");
			this.oUPCLookupModel = oUPCLookupModel;
			
			this.bussinessObject = " ";
			this.status = "";
			this.reportFor = "Weekly";
			this.mode = "Basic";

		},
		routePatternMatched: function(oEvent){
			this.getSearchParameters();	
		},

		getSearchParameters: function(oEvent) {
			var that = this;
			that.busy.open();
			var oSearchparameterModel = this.oSearchparameterModel;
			var sUrl = "/CWDPRICE/oneapp/cwpu/Report/getParameters";
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, "", true, "GET", false, false, this.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = oModel.getData();
					if (resultData) {
						var parametersDto = resultData.parametersDto;
						oSearchparameterModel.setProperty("/parametersDto", parametersDto);
						that.getBOLapiData();
						that.getStatusLapiData();
						that.setSearchParameters();
						that.busy.close();
					}
				} else {
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

		setSearchParameters: function(oEvent) {
			var that = this;
			var oSearchLayGrid = this.getView().byId("MATERIAL_SEARCH_BOX");
			oSearchLayGrid.bindAggregation("content", "oSearchparameterModel>/parametersDto", function(index, context) {
				var contextPath = context.getPath();
				var oSearchparameterModel = context.getModel();
				var sPath = "oSearchparameterModel>" + contextPath;
				var combosPath = "oSearchparameterModel>" + contextPath + "/lapiData";
				var currentObj = oSearchparameterModel.getProperty(contextPath);
				var fieldType = currentObj.uiFieldType;
				var fieldVisible = formatter.formatBooleanValues(currentObj.isVisible);
				if (fieldVisible) {
					var oHBoxItem = new sap.m.HBox();
					var oLabel = new sap.m.Label({
						required: {
							path: sPath + "/isMandatory",
							formatter: formatter.formatBooleanValues
						},
						tooltip: "{" + sPath + "/label}",
						text: "{" + sPath + "/label}"
					}).addStyleClass("gridLblClass");
					oHBoxItem.addItem(oLabel);
					if (fieldType === "Input") {
						var oInput = new sap.m.Input({
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
							name: {
								path: sPath + "/label"
							}
						}).addStyleClass("gridInput");
						var oDataTemplate = new sap.ui.core.CustomData({
							key: "{" + sPath + "/fieldId}"
						});
						oDataTemplate.bindProperty("value", "answer");
						oInput.addCustomData(oDataTemplate);
						formatter.onSAPEnter(oInput, that);
						oHBoxItem.addItem(oInput);
						return oHBoxItem;
					} else if (fieldType === "Text") {
						var oText = new sap.m.Text({
							text: "{" + sPath + "/fieldValue}",
							visible: {
								path: sPath + "/isVisible",
								formatter: formatter.formatBooleanValues
							}
						}).addStyleClass("gridInput");
						oHBoxItem.addItem(oText);
						return oHBoxItem;
					} else if (fieldType === "ComboBox") {
						var oComboBox = new sap.m.Select({
							selectedKey: "{" + sPath + "/comboBoxKey}"
						});
						if (currentObj.fieldId === "BO") {
							oComboBox.attachChange(function(evt) {
								that.onSelectBussinessScenario(evt);
							});
						}
						if (currentObj.fieldId === "STATUS") {
							oComboBox.attachChange(function(evt) {
								that.onSelectStatus(evt);
							});
						}
						var oItemSelectTemplate = new sap.ui.core.Item({
							key: "{oSearchparameterModel>objectId}",
							text: "{oSearchparameterModel>objectDesc}"
						}); //Define the template for items, which will be inserted inside a select element
						oComboBox.bindAggregation("items", combosPath, oItemSelectTemplate);
						oComboBox.addStyleClass("gridInput");
						oComboBox.setForceSelection(false);
						oHBoxItem.addItem(oComboBox);
						return oHBoxItem;
					} else if (fieldType === "Date") {
						var oDate = new sap.m.DatePicker({
							displayFormat: "MM/dd/yyyy",
							valueFormat: "MM/dd/yyyy",
							value: "{" + sPath + "/fieldValue}",
							visible: {
								path: sPath + "/isVisible",
								formatter: formatter.formatBooleanValues
							}
						}).addStyleClass("gridInput");
						var oCustomData = new sap.ui.core.CustomData({
							key: "{" + sPath + "/fieldId}"
						});
						oDate.addCustomData(oCustomData);
						oHBoxItem.addItem(oDate);
						return oHBoxItem;
					} else {
						var oText = new sap.m.Text({
							visible: false
						});
						oHBoxItem.addItem(oLabel);
						oHBoxItem.setVisible(false);
						return oText;
					}
				} else {
					var oLabel = new sap.m.Label({
						visible: false
					});
					return oLabel;
				}
			});
		},

		clrSearchParameter: function() {
			this.mode = "Basic";
			var oSearchparameterModel = this.oSearchparameterModel;
			var oSetVisibleModel = this.oSetVisibleModel;
			var oSearchparameter = oSearchparameterModel.getData();
			var bSearchparameter = oSearchparameter.hasOwnProperty("parametersDto");
			var bsearchpanel = oSearchparameter.hasOwnProperty("searchpanel");
			if (bSearchparameter) {
				var oParametersData = oSearchparameter.parametersDto;
				for (var i = 0; i < oParametersData.length; i++) {
					if (oParametersData[i].uiFieldType === "ComboBox") {
						oParametersData[i].comboBoxKey = "";
					} else {
						oParametersData[i].fieldValue = "";
					}
				}
			}
			if (bsearchpanel) {
				var oSearchPanel = oSearchparameter.searchpanel;
				for (var i = 0; i < oSearchPanel.length; i++) {
					oSearchPanel[i].fieldValue = "";
				}
			}
			oSearchparameterModel.refresh();
			oSetVisibleModel.setProperty("/advanceMat", false);
			oSetVisibleModel.setProperty("/reportBox", false);
			oSetVisibleModel.setProperty("/detailReport", false);
			oSetVisibleModel.refresh();
		},

		getBOLapiData: function() {
			var that = this;
			that.busy.open();
			var oSearchparameterModel = this.oSearchparameterModel;
			var oBussinessObjectModel = this.oBussinessObjectModel;
			var sUrl = "/CWDPRICE/oneapp/cwpu/Report/getBusinessObject";
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, "", true, "GET", false, false, this.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = oModel.getData();
					if (resultData) {
						var oItems = resultData.objectDto;
						oBussinessObjectModel.setData(resultData);
						var paramsData = oSearchparameterModel.getProperty("/parametersDto");
						var parametersDto = that.setBOLapiDataForDropdown(paramsData, oItems);
						oSearchparameterModel.setProperty("/parametersDto", parametersDto);
						oSearchparameterModel.refresh();
						that.busy.close();
					}
				} else {
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

		getStatusLapiData: function() {
			var that = this;
			that.busy.open();
			var oSearchparameterModel = this.oSearchparameterModel;
			var sUrl = "/CWDPRICE/oneapp/cwpu/Report/getStatus";
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, "", true, "GET", false, false, this.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = oModel.getData();
					if (resultData) {
						var oItems = resultData.objectDto;
						var paramsData = oSearchparameterModel.getProperty("/parametersDto");
						var parametersDto = that.setStatusLapiDataForDropdown(paramsData, oItems);
						oSearchparameterModel.setProperty("/parametersDto", parametersDto);
						oSearchparameterModel.refresh();
						that.busy.close();
					}
				} else {
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

		setBOLapiDataForDropdown: function(parametersDto, lapiData) {
			parametersDto.filter(function(obj, i, arr) {
				if (obj.hasOwnProperty("fieldId")) {
					if (obj.fieldId === "BO") {
						obj.lapiData = lapiData;
					}
				}
			});
			return parametersDto;
		},

		setStatusLapiDataForDropdown: function(parametersDto, lapiData) {
			parametersDto.filter(function(obj, i, arr) {
				if (obj.hasOwnProperty("fieldId")) {
					if (obj.fieldId === "STATUS") {
						obj.lapiData = lapiData;
					}
				}
			});
			return parametersDto;
		},

		onHandleSuggest: function(oEvent) {
			var that = this;
			var oSearchparameterModel = this.oSearchparameterModel;
			var data = oSearchparameterModel.getData().searchpanel;
			oEvent.getSource().setShowSuggestion(true);
			var oMatLookupModel = this.oMatLookupModel;
			var oVendLookUpModel = this.oVendLookUpModel;
			var oPlantLookupModel = this.oPlantLookupModel;
			var oPurchaseOrgModel = this.oPurchaseOrgModel;
			var oUPCLookupModel = this.oUPCLookupModel;
			var getInput = oEvent.getSource();
			var digitCount = oEvent.getSource().getValue().length;
			var getVal = oEvent.getSource().getValue();
			var count = "";
			var name = "";
			var oKey = oEvent.getSource().getName();
			for (var k in data) {
				if (data[k].label === oKey) {
					count = 3;
					name = data[k].label;
					var path = data[k].lapiUrl;
				}
			}
			if (digitCount > count) {
				oEvent.getSource().setShowSuggestion(true);
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.loadData(path + getVal, null, false);
				var resultData = oModel.getData();
				if (resultData) {
					if (name === "Vendor") {
						oVendLookUpModel.setData(resultData);
						getInput.bindAggregation("suggestionItems", {
							path: "oVendLookUpModel>/Result",
							template: new sap.ui.core.ListItem({
								text: "{oVendLookUpModel>LIFNR}"
							})
						});
					} else if (name === "Material No./Description") {
						oMatLookupModel.setData(resultData);
						getInput.bindAggregation("suggestionItems", {
							path: "oMatLookupModel>/Result",
							template: new sap.ui.core.ListItem({
								text: "{oMatLookupModel>MATNR}",
								additionalText: "{oMatLookupModel>MAKTX}"
							})
						});
					} else if (name === "Plant") {
						oPlantLookupModel.setData(resultData);
						getInput.bindAggregation("suggestionItems", {
							path: "oPlantLookupModel>/Result",
							template: new sap.ui.core.ListItem({
								text: "{oPlantLookupModel>WERKS}",
								additionalText: "{oPlantLookupModel>NAME1}"
							})
						});
					} else if (name === "Purchasing Org") {
						oPurchaseOrgModel.setData(resultData);
						getInput.bindAggregation("suggestionItems", {
							path: "oPurchaseOrgModel>/Result",
							template: new sap.ui.core.ListItem({
								text: "{oPurchaseOrgModel>EKORG}",
								additionalText: "{oPurchaseOrgModel>EKOTX}"
							})
						});
					} else {
						oUPCLookupModel.setData(resultData);
						getInput.bindAggregation("suggestionItems", {
							path: "oUPCLookupModel>/Result",
							template: new sap.ui.core.ListItem({
								text: "{oUPCLookupModel>EAN11}",
								additionalText: "{oUPCLookupModel>MATNR}"
							})
						});
					}
				} else {
					var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
					formatter.toastMessage(errorText);
					//that.busy.close();
				}
			}
		},

		onSelectBussinessScenario: function(oEvent) {
			var oSetVisibleModel = this.oSetVisibleModel;
			oSetVisibleModel.setProperty("/advanceMat", true);
			oSetVisibleModel.setProperty("/reportBox", true);
			oSetVisibleModel.setProperty("/detailReport", true);
			oSetVisibleModel.setProperty("/summaryReport", false);
			oSetVisibleModel.setProperty("/selectedkey", "Detailed");
			oSetVisibleModel.refresh();

			var that = this;
			that.busy.open();
			var oSearchparameterModel = this.oSearchparameterModel;
			this.bussinessObject = oEvent.getSource().getSelectedKey();
			var oKey = this.bussinessObject;
			var sUrl = "/CWDPRICE/oneapp/cwpu/Report/getDecisionTable/" + oKey;
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, "", true, "GET", false, false, this.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = oModel.getData();
					if (resultData) {
						var searchpanel = resultData.searchpanel;
						for (var i = 0; i < searchpanel.length; i++) {
							if (searchpanel[i].isVisible === "false") {
								searchpanel.splice(i, 1);
							}
						}
						oSearchparameterModel.setProperty("/searchpanel", searchpanel);
						oSearchparameterModel.refresh();
						that.setAdvanceSearchParameter(oEvent);
						var payload = that.getPayloadData();
						that.getMaterialTableData(payload);
						that.getGraphData(payload);
						that.busy.close();
					}
				} else {
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

		onSelectStatus: function(oEvent) {
			this.status = oEvent.getSource().getSelectedKey();
		},

		setAdvanceSearchParameter: function(oEvent) {
			var that = this;
			var oSearchLayGrid = this.getView().byId("MAT_ADVANCE_GRID_LAY");
			oSearchLayGrid.bindAggregation("content", "oSearchparameterModel>/searchpanel", function(index, context) {
				var contextPath = context.getPath();
				var oSearchparameterModel = context.getModel();
				var sPath = "oSearchparameterModel>" + contextPath;
				var combosPath = "oSearchparameterModel>" + contextPath + "/lapiData";
				var currentObj = oSearchparameterModel.getProperty(contextPath);
				var fieldType = currentObj.uiFieldType;
				var fieldVisible = formatter.formatBooleanValues(currentObj.isVisible);
				if (fieldVisible) {
					var oHBoxItem = new sap.m.HBox();
					var oLabel = new sap.m.Label({
						required: {
							path: sPath + "/isMandatory",
							formatter: formatter.formatBooleanValues
						},
						tooltip: "{" + sPath + "/label}",
						text: "{" + sPath + "/label}"
					}).addStyleClass("gridLblClass");
					oHBoxItem.addItem(oLabel);

					if (fieldType === "Input") {
						var oInput = new sap.m.Input({
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
							name: {
								path: sPath + "/label"
							},
							maxSuggestionWidth: "400px",
							change: function(oEvent) {
								that.onHandleSuggest(oEvent);
							}
						}).addStyleClass("gridInput");

						var oDataTemplate = new sap.ui.core.CustomData({
							key: "{" + sPath + "/fieldId}"
						});
						oDataTemplate.bindProperty("value", "answer");
						oInput.addCustomData(oDataTemplate);
						formatter.onSAPEnter(oInput, that);
						oHBoxItem.addItem(oInput);
						return oHBoxItem;
					} else if (fieldType === "Text") {
						var oText = new sap.m.Text({
							text: "{" + sPath + "/fieldValue}",
							visible: {
								path: sPath + "/isVisible",
								formatter: formatter.formatBooleanValues
							}
						}).addStyleClass("gridInput");
						oHBoxItem.addItem(oText);
						return oHBoxItem;
					} else if (fieldType === "ComboBox") {
						var oComboBox = new sap.m.Select();
						var oItemSelectTemplate = new sap.ui.core.Item({
							key: "{oSearchparameterModel>key}",
							text: "{oSearchparameterModel>value}"
						}); //Define the template for items, which will be inserted inside a select element
						oComboBox.bindAggregation("items", combosPath, oItemSelectTemplate);
						oComboBox.addStyleClass("comboboxStyle");
						oComboBox.setForceSelection(false);
						oHBoxItem.addItem(oComboBox);
						return oHBoxItem;
					} else if (fieldType === "Date") {
						var oDate = new sap.m.DatePicker({
							displayFormat: "MM/dd/yyyy",
							valueFormat: "MM/dd/yyyy",
							value: "{" + sPath + "/fieldValue}",
							visible: {
								path: sPath + "/isVisible",
								formatter: formatter.formatBooleanValues
							}
						}).addStyleClass("gridInput");
						var oCustomData = new sap.ui.core.CustomData({
							key: "{" + sPath + "/fieldId}"
						});
						oDate.addCustomData(oCustomData);
						oHBoxItem.addItem(oDate);
						return oHBoxItem;
					}
				} else {
					var oLabel = new sap.m.Label({
						visible: false
					});
					return oLabel;
				}
			});
		},

		getMaterialTableData: function(oPayload) {
			var that = this;
			this.busy.open();
			var oTableModel = that.oTableModel;
			var oAdvanceSearchModel = that.oAdvanceSearchModel;
			var sUrl = "/CWDPRICE/oneapp/cwpu/Report/getDetailedReport";
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, JSON.stringify(oPayload), true, "POST", false, false, that.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = oEvent.getSource().getData();
					if (resultData.hasOwnProperty("records")) {
						if (!Array.isArray(resultData.records)) {
							var oTempArr = [];
							oTempArr.push(resultData.records);
							resultData.records = oTempArr;
						}
					} else {
						resultData.records = [];
					}
					oTableModel.setData(resultData);
					var advSearchParams = jQuery.extend(true, {}, resultData);
					oAdvanceSearchModel.setData(advSearchParams);
					that.generateReportTableColumns();
					that.busy.close();
				} else {
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

		generateReportTableColumns: function() {
			
			var oConditionRecordTbl = this.getView().byId("DETAIL_REPORT_TABLE");
			oConditionRecordTbl.bindAggregation("columns", "oTableModel>/metadata", function(index, context) {
				var contextPath = context.getPath();
				var sPath = "oTableModel>" + contextPath;
				var oColumn = new sap.m.Column({
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatBooleanValues
					},
					header: new sap.m.Text({
						wrapping: true,
						text: "{" + sPath + "/label}"
					}).addStyleClass("matTblHdrClass")
				});
				return oColumn;
			});
			oConditionRecordTbl.bindItems("oTableModel>/records", function(index, context) {
				var records = context.getObject().recordList;
				var row = new sap.m.ColumnListItem();
				for (var k in records) {
					row.addCell(new sap.m.Text({
						text: records[k]
					}));
				}
				return row;
			});
		},

		setReportType: function(oEvent) {
			var okey = oEvent.getSource().getKey();
			var oSetVisibleModel = this.oSetVisibleModel;

			if (okey === "Detailed") {
				oSetVisibleModel.setProperty("/detailReport", true);
				oSetVisibleModel.setProperty("/summaryReport", false);
			} else {
				oSetVisibleModel.setProperty("/detailReport", false);
				oSetVisibleModel.setProperty("/summaryReport", true);
			}
			oSetVisibleModel.setProperty("/selectedkey", okey);
			oSetVisibleModel.refresh();
		},

		setConditionRecordOnChangeMode: function(oEvent) {
			var that = this;
			this.reportFor = oEvent.getSource().getKey();
			var oKey = this.reportFor;
			var oGraphDataModel = that.oGraphDataModel;
			var bussinesssData = oGraphDataModel.getData().summaryReportMap.entry;
			for (var j = 0; j < bussinesssData.length; j++) {
				if (bussinesssData[j].key === oKey) {
					var data = bussinesssData[j].value.listStatusCount;
					if (!Array.isArray(data)) {
						var oTempArry = [];
						oTempArry.push(data);
						data = oTempArry;
					}
					that.createGraph(data, oKey);
				}
			}
		},

		getGraphData: function(payload) {
			var that = this;
			that.busy.open();
			var oGraphDataModel = this.oGraphDataModel;
			var sUrl = "/CWDPRICE/oneapp/cwpu/Report/getSummaryReport";
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, JSON.stringify(payload), true, "POST", false, false, that.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = oEvent.getSource().getData();
					var graphData = resultData.summaryReportMap.entry;
					if (!Array.isArray(graphData)) {
						var oTempArry = [];
						oTempArry.push(graphData);
						graphData = oTempArry;
						resultData.summaryReportMap.entry = graphData;
					}
					oGraphDataModel.setData(resultData);
					var data = oGraphDataModel.getData().summaryReportMap.entry[0].value.listStatusCount;
					if (!Array.isArray(data)) {
						var oTempArry = [];
						oTempArry.push(data);
						data = oTempArry;

					}
					that.createGraph(data);
					that.busy.close();
				} else {
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

		createGraph: function(data, oKey) {
			var oGraphModel = this.oGraphModel;
			oGraphModel.getData().data = data;
			var key = this.reportFor;
			var interval = formatter.formatTooltipInterval(key);
			oGraphModel.refresh(true);
			var oVizFrame = this.getView().byId("vizcol1");
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: interval,
					value: "{oGraphModel>date}"
				}, {
					name: "Status",
					value: "{oGraphModel>status}"
				}],

				measures: [{
					name: "Count",
					value: "{oGraphModel>count}"
				}],

				data: {
					path: "oGraphModel>/data"
				}
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setVizType('stacked_column');
			//set  viz properties
			oVizFrame.setVizProperties({
				tooltip: {
					visible: true
				},

				title: {
					visible: false
				},
				valueAxis: {
					title: {
						visible: false
					},
					label: {
						formatString: 0.00
					}
				},
				categoryAxis: {
					label: {
						visible: true
					},
					title: {
						visible: false
					}
				},
				legendGroup: {
					layout: {
						position: "right"
					}
				}
			});
			/*var scales = [{
				'feed': 'color',
				'palette': ['#36a6e3','#55b49b','#67bb3a','#e3df11','#fdc400','#ec1010','#ec10d5']

			}];
			oVizFrame.setVizScales(scales);*/

			var oFeedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["Count"]
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": [interval]
				}),
				feedCategoryAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "color",
					"type": "Dimension",
					"values": ["Status"]
				});
			oVizFrame.destroyFeeds();
			oVizFrame.addFeed(oFeedValueAxis);
			oVizFrame.addFeed(feedCategoryAxis);
			oVizFrame.addFeed(feedCategoryAxis1);
		},

		getPayloadData: function(oEvent) {
			var Mode = this.mode;
			var oSearchparameterModel = this.oSearchparameterModel;
			var searchpanel = oSearchparameterModel.getData().searchpanel;
			var parametersDto = oSearchparameterModel.getData().parametersDto;
			for (var i = 0; i < parametersDto.length; i++) {
				if (parametersDto[i].fieldId === "BO") {
					parametersDto[i].fieldValue = this.bussinessObject;
				}
				if (parametersDto[i].fieldId === "STATUS") {
					parametersDto[i].fieldValue = this.status;
				}
			}
			var oPayload = {
				"searchpanel": searchpanel,
				"parametersDto": parametersDto,
				"mode": Mode
			};
			return oPayload;
		},

		onSearch: function(oEvent) {
			this.mode = "Advance";
			var payload = this.getPayloadData();
			this.getMaterialTableData(payload);
			this.getGraphData(payload);
		},

		onExportToExcel: function(oEvent) {
			var that = this;
			that.busy.open();
			var payload = this.getPayloadData();
			var sUrl = "/CWDPRICE/oneapp/cwpu/Report/getExcel";
			var oExcelModel = new sap.ui.model.json.JSONModel();
			oExcelModel.loadData(sUrl, JSON.stringify(payload), true, "POST", false, false, this.oHeader);
			oExcelModel.attachRequestCompleted(null, function() {
				if (oEvent.getParameter("success")) {
					var apptype = "application/vnd.ms-excel";
					var byteCode = oExcelModel.oData.objectDesc;
					var fileName = oExcelModel.oData.fileName;
					var u8_2 = new Uint8Array(atob(byteCode).split("").map(function(c) { //Conversion
						return c.charCodeAt(0);
					}));
					var a = document.createElement("a");
					document.body.appendChild(a);
					a.style = "display: none";
					var blob = new Blob([u8_2], {
						type: apptype
					});
					if (sap.ui.Device.browser.name == "ie") {
						window.navigator.msSaveBlob(blob, selectedRow.docName);
					} else {
						var url = window.URL.createObjectURL(blob);
						a.href = url;
						a.download = fileName + ".xlsx";
						a.click();
						window.URL.revokeObjectURL(url);
					}
					that.busy.close();
				}else {
					var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
					formatter.toastMessage(errorText);
					that.busy.close();
				}
			});
			oExcelModel.attachRequestFailed(function(oEvent) {
				var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
				formatter.toastMessage(errorText);
				that.busy.close();
			});
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf reports.summaryReport
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf reports.summaryReport
		 */
		/*onAfterRendering: function() {
			
		}*/

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf reports.summaryReport
		 */
		//	onExit: function() {
		//
		//	}
	});
});