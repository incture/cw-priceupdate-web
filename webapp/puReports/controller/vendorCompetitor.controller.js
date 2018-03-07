sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"PU_Reports/formatter/formatter",
	"sap/m/BusyDialog"
], function(Controller, formatter, BusyDialog) {
	"use strict";

	return Controller.extend("PU_Reports.controller.vendorCompetitor", {

		onInit: function() {

			var that = this;
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this.busy = new BusyDialog();
			this.oHeader = {
				"Accept": "application/json",
				"Content-Type": "application/json"
			};
			//	this._router = sap.ui.core.UIComponent.getRouterFor(this);
			this._router.attachRoutePatternMatched(function(oEvent) {
				var viewName = oEvent.getParameter("name");
				if (viewName === "vendorCompetitor") {
					that.routePatternMatched(oEvent);
				}
			});
			this.period = "";
			this.specificDate = "";
			this.setUiModel();

		},

		setUiModel: function() {
			var that = this;
			var oResourceModel = this.getOwnerComponent().getModel("i18n");
			this.oResourceModel = oResourceModel.getResourceBundle();

			var oNewVendorComboListModel = this.getOwnerComponent().getModel("oNewVendorComboListModel");
			this.oNewVendorComboListModel = oNewVendorComboListModel;

			var oNewSearchparameterModel = this.getOwnerComponent().getModel("oNewSearchparameterModel");
			this.oNewSearchparameterModel = oNewSearchparameterModel;

			var oElementPropertyModel = this.getOwnerComponent().getModel("oElementPropertyModel");
			this.oElementPropertyModel = oElementPropertyModel;

			var oMultiInputModel = this.getOwnerComponent().getModel("oMultiInputModel");
			this.oMultiInputModel = oMultiInputModel;

			var oVendorComparisonModel = this.getOwnerComponent().getModel("oVendorComparisonModel");
			this.oVendorComparisonModel = oVendorComparisonModel;

			var oDetailedCompareModel = this.getOwnerComponent().getModel("oDetailedCompareModel");
			this.oDetailedCompareModel = oDetailedCompareModel;

			var oBindSearchParamModel = this.getOwnerComponent().getModel("oBindSearchParamModel");
			this.oBindSearchParamModel = oBindSearchParamModel;

			var oVendorsGraphModel = this.getOwnerComponent().getModel("oVendorsGraphModel");
			this.oVendorsGraphModel = oVendorsGraphModel;

			var oGraphPopOverModel = this.getOwnerComponent().getModel("oGraphPopOverModel");
			this.oGraphPopOverModel = oGraphPopOverModel;

			oElementPropertyModel.setProperty("/MaterialSearch", true);
			oElementPropertyModel.setProperty("/MaterialClear", true);
			oElementPropertyModel.setProperty("/mainVbox", false);
			oElementPropertyModel.setProperty("/mainVboxSD", false);
			oElementPropertyModel.setProperty("/multiInput", false);
			oElementPropertyModel.setProperty("/detailedCompare", false);
			oElementPropertyModel.setProperty("/viewDetailCompare", false);
			oElementPropertyModel.setProperty("/viewBackDetail", false);
			oElementPropertyModel.setProperty("/SegmentedButton", true);
			oElementPropertyModel.setProperty("/selectedComboBox", true);
			oElementPropertyModel.setProperty("/yearCombo", true);
			oElementPropertyModel.setProperty("/graphGrid", false);
			oElementPropertyModel.setProperty("/vendorPanel", false);
			oElementPropertyModel.setProperty("/oMPanelExpanded", true);
			oElementPropertyModel.setProperty("/oVPanelExpanded", false);
			oElementPropertyModel.setProperty("/oVPanelExpandAnimation", false);
			oElementPropertyModel.setProperty("/durationBox", true);
			oElementPropertyModel.setProperty("/dateVisible", false);
			oElementPropertyModel.setProperty("/legendBPImage", false);

			this.duration = "";
			this.dateValue = "";

		},
		routePatternMatched: function(oEvent) {
			this.getSearchParameters();
		},

		getSearchParameters: function() {
			var that = this;
			that.busy.open();
			var oNewSearchparameterModel = this.oNewSearchparameterModel;
			var sUrl = "/CWPRICE_WEB/PricingReport/getReportParameters/VendorCompetitorAnalysis";
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, "", true, "GET", false, false, this.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = oModel.getData();
					if (resultData) {
						var data = resultData.parameterList;
						if (!Array.isArray(data)) {
							var tempArry = [];
							tempArry.push(data);
							resultData.parameterList = tempArry;
						}
						oNewSearchparameterModel.setData(resultData);
						that.busy.close();
						that.setDataForSection();

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

		setDataForSection: function() {
			var oNewSearchparameterModel = this.oNewSearchparameterModel;
			var oBindSearchParamModel = this.oBindSearchParamModel;
			var resultData = oNewSearchparameterModel.getData().parameterList;
			var parameterData = resultData;
			var matSearchArr = [];
			var vendSearchArr = [];
			parameterData.filter(function(obj, index, array) {
				if (obj.section === "A") {
					matSearchArr.push(obj);
				} else {
					vendSearchArr.push(obj);
				}
			});
			oBindSearchParamModel.setProperty("/matSearchParam", matSearchArr);
			oBindSearchParamModel.setProperty("/vendSearchParam", vendSearchArr);
			this.setMatSearchParameters();
		},

		setMatSearchParameters: function() {
			var that = this;
			var oBindSearchParamModel = this.oBindSearchParamModel;
			var oSearchLayGrid = this.getView().byId("MATERIAL_SEARCH_BOX");
			oSearchLayGrid.bindAggregation("content", "oBindSearchParamModel>/matSearchParam", function(index, context) {
				var contextPath = context.getPath();
				var sPath = "oBindSearchParamModel>" + contextPath;
				var currentObj = oBindSearchParamModel.getProperty(contextPath);
				var fieldType = currentObj.uiFieldType;

				var oHBoxItem = new sap.m.HBox();
				var oLabel = new sap.m.Label({
					text: "{" + sPath + "/fieldName}"
				}).addStyleClass("gridLblClass");
				oHBoxItem.addItem(oLabel);

				if (fieldType === "Input") {
					var oInput = new sap.m.Input({
						value: "{" + sPath + "/fieldValue}"
					});
					oHBoxItem.addItem(oInput);
					return oHBoxItem;
				} else {
					var oEmpLabel = new sap.m.Label({
						visible: false
					});
					return oEmpLabel;
				}
			});

		},

		onMaterialSearch: function(oEvent) {
			var oElementPropertyModel = this.oElementPropertyModel;
			oElementPropertyModel.setProperty("/vendorPanel", true);
			oElementPropertyModel.setProperty("/oMPanelExpanded", false);
			oElementPropertyModel.setProperty("/oVPanelExpanded", true);
			oElementPropertyModel.setProperty("/oVPanelExpandAnimation", true);
			oElementPropertyModel.setProperty("/MaterialSearch", false);
			oElementPropertyModel.setProperty("/MaterialClear", false);
			oElementPropertyModel.refresh();

			this.getAllVendorData();
		},

		getAllVendorData: function() {
			var that = this;
			that.busy.open();
			var oNewSearchparameterModel = this.oNewSearchparameterModel;
			var oNewVendorComboListModel = this.oNewVendorComboListModel;
			var payload = oNewSearchparameterModel.getData();
			var sUrl = "/CWPRICE_WEB/PricingReport/getAllVendorsByParameters";
			var jsonModel = new sap.ui.model.json.JSONModel();
			jsonModel.loadData(sUrl, JSON.stringify(payload), true, "POST", false, false, this.oHeader);
			jsonModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = jsonModel.getData();
					if (resultData) {
						var Count = resultData.count;
						if (Count > 1) {
							var valueList = resultData.result;
							if (!Array.isArray(valueList)) {
								var tempArry = [];
								tempArry.push(valueList);
								resultData.result = tempArry;
							}
							oNewVendorComboListModel.setData(resultData);
							oNewVendorComboListModel.refresh();
							that.setVendorSearchParameters();
							that.busy.close();
						}
					}
				} else {
					var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
					formatter.toastMessage(errorText);
					that.busy.close();
				}
			});
			jsonModel.attachRequestFailed(function(oEvent) {
				var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
				formatter.toastMessage(errorText);
				that.busy.close();
			});

		},

		getPayloadData: function() {
			var that = this;
			var oNewSearchparameterModel = this.oNewSearchparameterModel;
			oNewSearchparameterModel.getData().reportType = "VendorCompetitorAnalysis";
			oNewSearchparameterModel.getData().result = this.tempVendorArray;
			var parameterList = oNewSearchparameterModel.getData().parameterList;
			for (var i = 0; i < parameterList.length; i++) {
				if (parameterList[i].fieldId === "DATE/PERIOD") {
					parameterList[i].fieldValue = this.duration;
				}
			}
			var searchParameterData = oNewSearchparameterModel.getData();
			var oPayload = searchParameterData;
			try {
				if (this.tempVendorArray.length === 1) {
					var errorText = that.oResourceModel.getText("PLEASE_SELECT_VENDOR_MORE");
					formatter.toastMessage(errorText);

				} else {
					return oPayload;
				}
			} catch (error) {
				var errorText = that.oResourceModel.getText("PLEASE_SELECT_VENDOR_MORE");
				formatter.toastMessage(errorText);
			}

		},

		setVendorSearchParameters: function(valueList) {
			var that = this;
			var oSearchLayGrid = this.getView().byId("VENDORS_SEARCH_GRID");
			oSearchLayGrid.bindAggregation("content", "oBindSearchParamModel>/vendSearchParam", function(index, context) {
				var contextPath = context.getPath();
				var oBindSearchParamModel = context.getModel();
				var sPath = "oBindSearchParamModel>" + contextPath;
				var currentObj = oBindSearchParamModel.getProperty(contextPath);
				var combosPath = "oBindSearchParamModel>" + contextPath + "/dropDownData";
				var fieldType = currentObj.uiFieldType;
				var fieldId = currentObj.fieldId;

				var oLabel = new sap.m.Label({
					text: "{" + sPath + "/fieldName}"
				}).addStyleClass("gridLblClass");
				if (fieldType === "Input") {
					var oHBoxItem = new sap.m.HBox();
					var oInput = new sap.m.Input({
						value: "{" + sPath + "/fieldValue}"
					});
					oHBoxItem.addItem(oLabel);
					oHBoxItem.addItem(oInput);
					return oHBoxItem;
				} else if (fieldType === "ComboBox") {
					if (fieldId === "DATE/PERIOD") {
						var oHBoxItem = new sap.m.HBox();
						var oComboBox = new sap.m.Select({
							"change": function(oEvent) {
								that.onChangeDuration(oEvent);
							},
							forceSelection: false
						});
						var oDataTemplate = new sap.ui.core.CustomData({
							key: "PeriodComboBox"
						});
						var oItemSelectTemplate = new sap.ui.core.Item({
							key: "{oBindSearchParamModel>key}",
							text: "{oBindSearchParamModel>value}"
						});
						oComboBox.bindAggregation("items", combosPath, oItemSelectTemplate);
						oComboBox.addStyleClass("comboboxStyle");
						oComboBox.addCustomData(oDataTemplate);
						oHBoxItem.addItem(oLabel);
						oHBoxItem.addItem(oComboBox);
						return oHBoxItem;
					}
					if (fieldId === "LIFNR") {
						var oHBoxItem = new sap.m.HBox();
						var oMultiComboBox = new sap.m.MultiComboBox();
						var oDataTemplate = new sap.ui.core.CustomData({
							key: "vendorMultiComboBox"
						});
						var oItemSelectTemplate = new sap.ui.core.Item({
							key: "{oNewVendorComboListModel>key}",
							text: "{oNewVendorComboListModel>value}"
						});
						oMultiComboBox.bindAggregation("items", "oNewVendorComboListModel>/result", oItemSelectTemplate);
						oMultiComboBox.attachSelectionFinish(function(oEvent) {
							that.vendorEvent = oEvent;
							var selection = oMultiComboBox.getSelectedItems().length;
							if (selection !== 0) {
								that.vendorsArray(that.vendorEvent);
							} else {
								var errorText = that.oResourceModel.getText("PLEASE_SELECT_VENDOR");
								formatter.toastMessage(errorText);
							}
						});
						that.vendorSelectArray = [];
						oMultiComboBox.attachSelectionChange(function(event) {
							var selectedLength = event.getSource().getSelectedKeys().length;
							var selectedItem = event.getParameter("changedItem").getKey();
							var selectionLength = that.vendorSelectArray.length;
							if (selectedLength > 8) {
								oMultiComboBox.clearSelection();
								for (var i = 0; i <= selectionLength - 1; i++) {
									oMultiComboBox.addSelectedKeys(that.vendorSelectArray[i]);
								}
								var errorText = that.oResourceModel.getText("CANT_SELECT_MORE_8");
								formatter.toastMessage(errorText);
							} else {
								that.vendorSelectArray.push(selectedItem);
							}

						});
						oDataTemplate.bindProperty("value", "answer");
						oMultiComboBox.addCustomData(oDataTemplate);
						oMultiComboBox.addStyleClass("comboboxStyle");
						oHBoxItem.addItem(oLabel);
						oHBoxItem.addItem(oMultiComboBox);
						return oHBoxItem;
					}

				} else if (fieldType === "Date") {
					var oHBoxItem = new sap.m.HBox({
						visible: "{oElementPropertyModel>/dateVisible}"
					});
					var oDate = new sap.m.DatePicker({
						valueFormat: "MM/dd/yyyy",
						displayFormat: "MM/dd/yyyy",
						value: "{" + sPath + "/fieldValue}",
						change: function(oEvent) {
							var selectedValue = oEvent.getSource().getValue();
							that.specificDate = selectedValue;
						}
					});
					oDate.addStyleClass("datePickerStyle");
					oHBoxItem.addItem(oLabel);
					oHBoxItem.addItem(oDate);
					return oHBoxItem;
				} else {
					var oLabel = new sap.m.Label({
						visible: false
					});
					return oLabel;
				}

			});
		},

		onChangeDuration: function(oEvent) {
			var oElementPropertyModel = this.oElementPropertyModel;
			var selectedValue = oEvent.getSource().getSelectedKey();
			this.duration = selectedValue;
			this.period = selectedValue;
			if (selectedValue === "Specific_Date") {
				oElementPropertyModel.setProperty("/dateVisible", true);
			} else {
				oElementPropertyModel.setProperty("/dateVisible", false);
				this.specificDate = "";
			}
			oElementPropertyModel.refresh();
		},

		vendorsArray: function(vendorEvent) {
			var oMultiInputModel = this.oMultiInputModel;
			var oElementPropertyModel = this.oElementPropertyModel;
			var vendorListLength = vendorEvent.getParameters().selectedItems.length;
			var oArray = [];
			for (var i = 0; i <= vendorListLength - 1; i++) {
				var vendorName = vendorEvent.getParameters().selectedItems[i].getText();
				var vendorKey = vendorEvent.getParameters().selectedItems[i].getKey();
				oArray.push({
					"value": vendorName,
					"key": vendorKey
				});
			}
			this.tempVendorArray = oArray;
			oMultiInputModel.setData([]);
			oMultiInputModel.getData().data = oArray;
			oElementPropertyModel.setProperty("/multiInput", true);
			oElementPropertyModel.refresh();
			this.createMultiInput();
		},

		createMultiInput: function() {
			var that = this;
			var oMultiInputBox = this.getView().byId("multiInput");
			var oItemSelectTemplate = new sap.m.Token({
				text: "{oMultiInputModel>value}",
				key: "{oMultiInputModel>key}",
				delete: function(oEvent) {
					that.deleteVendorInput(oEvent);
				}
			});
			oMultiInputBox.bindAggregation("tokens", "oMultiInputModel>/data", oItemSelectTemplate);
			oMultiInputBox.addStyleClass("multiInputClasss");
			this.onVendorsSearch();
		},

		deleteVendorInput: function(oEvent) {
			var oElementPropertyModel = this.oElementPropertyModel;
			var tempVendorArray = this.tempVendorArray;
			var selectionLen = tempVendorArray.length;
			var oMultiInputModel = this.oMultiInputModel;
			var sPathVendor = oEvent.getSource().getBindingContext("oMultiInputModel").getPath().split("/")[2];
			sPathVendor = parseInt(sPathVendor);
			this.getView().getModel("oMultiInputModel").getProperty("/data").splice(sPathVendor, 1);
			oMultiInputModel.refresh();
			var gridContent = this.getView().byId("VENDORS_SEARCH_GRID").getContent();
			for (var i = 0; i <= gridContent.length - 1; i++) {
				var oVendorBox = gridContent[i].getItems()[1];
				try {
					var customdata = oVendorBox.getCustomData()[0].getKey();
				} catch (error) {
					continue;
				}
				if (customdata === "vendorMultiComboBox") {
					var delKey = oEvent.getSource().getKey();
					oVendorBox.removeSelectedKeys([delKey]);
				}
			}
			if (selectionLen === 1) {
				oElementPropertyModel.setProperty("/multiInput", false);
			}
			this.onVendorsSearch();
			oElementPropertyModel.refresh();
		},

		onVendorsSearch: function(oEvent) {
			var that = this;
			var tempVendorArray = this.tempVendorArray;
			var sUrl, errorText;
			var oElementPropertyModel = this.oElementPropertyModel;
			var expended = oElementPropertyModel.getProperty("/oMPanelExpanded");
			if (expended) {
				oElementPropertyModel.setProperty("/oMPanelExpanded", false);
				oElementPropertyModel.setProperty("/MaterialSearch", false);
				oElementPropertyModel.setProperty("/MaterialClear", false);
			}
			if (tempVendorArray) {
				var len = tempVendorArray.length;
				if (len >= 2) {
					if (this.duration === "Specific_Date") {
						var checkSD = this.specificDate;
						if (checkSD === "") {
							errorText = that.oResourceModel.getText("PLEASE_FILl_ALL_REQUIRED_FIELDS");
							formatter.toastMessage(errorText);
						} else {
							sUrl = "/CWPRICE_WEB/PricingReport/getSummaryReportByDate";
							that.getSummaryData(sUrl);
						}
					} else {
						var checkPeriod = this.period;
						if (checkPeriod === "") {
							errorText = that.oResourceModel.getText("PLEASE_FILl_ALL_REQUIRED_FIELDS");
							formatter.toastMessage(errorText);
						} else {
							sUrl = "/CWPRICE_WEB/PricingReport/getSummaryReport";
							that.getSummaryData(sUrl);
						}
					}
				} else {
					errorText = that.oResourceModel.getText("PLEASE_SELECT_VENDOR_MORE");
					formatter.toastMessage(errorText);
				}

			} else {
				errorText = that.oResourceModel.getText("PLEASE_SELECT_VENDOR");
				formatter.toastMessage(errorText);
			}
			oElementPropertyModel.refresh();
		},

		getSummaryData: function(sUrl) {
			var that = this,
				errorText;
			this.busy.open();
			var oElementPropertyModel = this.oElementPropertyModel;
			var payload = this.getPayloadData();
			var jsonModel = new sap.ui.model.json.JSONModel();
			jsonModel.loadData(sUrl, JSON.stringify(payload), true, "POST", false, false, this.oHeader);
			jsonModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = jsonModel.getData();
					if (resultData) {
						var checkSD = that.specificDate;
						if (checkSD === "") {
							oElementPropertyModel.setProperty("/mainVbox", true);
							oElementPropertyModel.setProperty("/mainVboxSD", false);
							oElementPropertyModel.refresh();
							var oVendorComparisonModel = that.oVendorComparisonModel;
							oVendorComparisonModel.setData(resultData);
							if (that.tempVendorArray.length > 1) {
								that.setGraphData();
								that.setDetailData();
								that.busy.close();
							} else {
								errorText = that.oResourceModel.getText("PLEASE_SELECT_VENDOR_MORE");
								formatter.toastMessage(errorText);
								that.busy.close();
							}
						} else {
							oElementPropertyModel.setProperty("/mainVboxSD", true);
							oElementPropertyModel.setProperty("/mainVbox", false);
							oElementPropertyModel.refresh();
							var oVendorComparisonModel = that.oVendorComparisonModel;
							oVendorComparisonModel.setData(resultData);
							if (that.tempVendorArray.length > 1) {
								that.setGraphData();
								that.setDetailedPageUI();
								that.busy.close();
							} else {
								errorText = that.oResourceModel.getText("PLEASE_SELECT_VENDOR_MORE");
								formatter.toastMessage(errorText);
								that.busy.close();
							}
						}

					}
				} else {
					errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
					formatter.toastMessage(errorText);
					that.busy.close();
				}
			});
			jsonModel.attachRequestFailed(function(oEvent) {
				errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
				formatter.toastMessage(errorText);
				that.busy.close();
			});
		},

		setGraphData: function() {
			var that = this;
			var oVendorComparisonModel = this.oVendorComparisonModel;
			this.getView().setModel(oVendorComparisonModel, "oVendorComparisonModel");
			var oVendorsGraphModel = this.oVendorsGraphModel;
			var oVizFrame = this.getView().byId("vendorsGraph");

			var checkSD = this.specificDate;
			if (checkSD === "") {
				var oVendorComparisonData = oVendorComparisonModel.getData().listDateRangeDto;
				var dateLength = oVendorComparisonData.length;
				var vendorsLength = oVendorComparisonData[0].listNetPriceDto.length;
				var listArray = [];
				for (var i = 0; i <= dateLength - 1; i++) {
					for (var j = 0; j <= vendorsLength - 1; j++) {
						listArray.push(oVendorComparisonData[i].listNetPriceDto[j]);
					}
				}
				oVendorsGraphModel.getData().oVendorComparisonListData = listArray;

				var oVizFrame = this.getView().byId("vendorsGraph");
				var oDataset = new sap.viz.ui5.data.FlattenedDataset({
					dimensions: [{
						name: "Date",
						value: "{oVendorsGraphModel>fromString}",
						dataType: "date"
					}, {
						name: "Vendors",
						value: "{oVendorsGraphModel>vendor}"
					}],

					measures: [{
						name: "NetPrice",
						value: "{oVendorsGraphModel>netPrice}"
					}],

					data: {
						path: "oVendorsGraphModel>/oVendorComparisonListData"
					}
				});
				oVizFrame.setDataset(oDataset);
				oVizFrame.setVizType("line");
				//set  viz properties
				oVizFrame.setVizProperties({
					tooltip: {
						visible: false
					},

					title: {
						visible: false
					},
					valueAxis: {
						title: {
							visible: false
						},
						label: {

						}
					},
					timeAxis: {
						title: {
							visible: false
						},
						interval: {
							unit: ""
						}
					},
					legendGroup: {
						layout: {
							position: "right"
						}
					},
					interaction: {
						syncValueAxis: false
					}
				});
				var scales = [{
					'feed': 'color',
					'palette': ['#36a6e3', '#55b49b', '#67bb3a', '#e3df11', '#fdc400', '#ec1010', '#ec10d5']

				}];
				oVizFrame.setVizScales(scales);

				var oFeedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["NetPrice"]
				});

				var feedCategoryAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Date"]
				});

				var feedCategoryAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "color",
					"type": "Dimension",
					"values": ["Vendors"]
				});
				oVizFrame.destroyFeeds();
				oVizFrame.addFeed(oFeedValueAxis);
				oVizFrame.addFeed(feedCategoryAxis1);
				oVizFrame.addFeed(feedCategoryAxis2);
			} else {
				var vendorInfo = oVendorComparisonModel.getData().vendorInfo;
				var vendorLength = oVendorComparisonModel.getData().vendorInfo.length;
				var listArray = [];
				for (i = 0; i <= vendorLength - 1; i++) {
					var tempObj = {};
					tempObj.vendorName = vendorInfo[i].vendorName;
					tempObj.netPrice = vendorInfo[i].netPrice;
					listArray.push(tempObj);
				}
				oVendorsGraphModel.getData().oVendorComparisonListData = listArray;

				var oVizFrame = this.getView().byId("vendorsGraphSD");
				var oDataset = new sap.viz.ui5.data.FlattenedDataset({
					dimensions: [{
						name: "Vendors",
						value: "{oVendorsGraphModel>vendorName}"
					}],

					measures: [{
						name: "NetPrice",
						value: "{oVendorsGraphModel>netPrice}"
					}],

					data: {
						path: "oVendorsGraphModel>/oVendorComparisonListData"
					}
				});
				oVizFrame.setDataset(oDataset);
				oVizFrame.setVizType("column");
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

						}
					},
					timeAxis: {
						title: {
							visible: false
						},
						interval: {
							unit: ""
						}
					},
					legendGroup: {
						layout: {
							position: "right"
						}
					},
					interaction: {
						syncValueAxis: false
					}
				});
				var scales = [{
					'feed': 'color',
					'palette': ['#36a6e3', '#55b49b', '#67bb3a', '#e3df11', '#fdc400', '#ec1010', '#ec10d5']

				}];
				oVizFrame.setVizScales(scales);

				var oFeedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["NetPrice"]
				});

				var feedCategoryAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "color",
					"type": "Dimension",
					"values": ["Vendors"]
				});
				oVizFrame.destroyFeeds();
				oVizFrame.addFeed(oFeedValueAxis);
				oVizFrame.addFeed(feedCategoryAxis1);
			}
		},
		
		sortDetailData: function(){
			var oVendorComparisonModel = this.oVendorComparisonModel;
			var listRangData = oVendorComparisonModel.getData().listDateRangeDto;
			//var listNewRangData = jQuery.extend(true, [], listRangData);
			for(var i = 0; i<listRangData.length; i++){
				var listNetPriceData = listRangData[i].listNetPriceDto;
				listNetPriceData.sort(function(a,b){
				 return parseInt(a.netPrice) - parseInt(b.netPrice);
			});
			}
		},

		setDetailData: function() {
			this.sortDetailData();
			var that = this;
			var oElementPropertyModel = this.oElementPropertyModel;
			var vendorNetpriceGrid = this.getView().byId("VENDORS_NETPRICES_GRID");
			vendorNetpriceGrid.bindAggregation("content", "oVendorComparisonModel>/listDateRangeDto", function(index, context) {
				var contextPath = context.getPath();
				var sPath = "oVendorComparisonModel>" + contextPath;
				var HBox = new sap.m.HBox();
				HBox.addStyleClass("NetPriceHboxClass priceUpdateHdrBoxClass");
				var dateVbox = new sap.m.VBox();
				dateVbox.addStyleClass("dateVboxClass");
				var netPriceVbox = new sap.m.VBox();
				var fromMonthText = new sap.m.Label({
					text: {
						path: sPath + "/fromString",
						formatter: formatter.formatMonthfirst
					}
				});
				fromMonthText.addStyleClass("MonthClass");
				var fromDateText = new sap.m.Label({
					text: {
						path: sPath + "/fromString",
						formatter: formatter.formatDatefirst
					}
				});
				fromDateText.addStyleClass("DateClass");
				var fromYearText = new sap.m.Label({
					text: {
						path: sPath + "/fromString",
						formatter: formatter.formatYearfirst
					}
				});
				fromYearText.addStyleClass("yearClass");
				var spaceHbox = new sap.m.HBox();
				spaceHbox.addStyleClass("spaceHboxClass");
				var toMonthText = new sap.m.Label({
					text: {
						path: sPath + "/toString",
						formatter: formatter.formatMonthfirst
					}
				});
				toMonthText.addStyleClass("MonthClass");
				var toDateText = new sap.m.Label({
					text: {
						path: sPath + "/toString",
						formatter: formatter.formatDatefirst
					}
				});
				toDateText.addStyleClass("DateClass");
				var toYearText = new sap.m.Label({
					text: {
						path: sPath + "/toString",
						formatter: formatter.formatYearfirst
					}
				});
				toYearText.addStyleClass("yearClass");

				var netPricesGrid = new sap.ui.layout.Grid({
					defaultSpan: "XL3 L3 M6 S12"
				});
				netPricesGrid.addStyleClass("netPricesGrid");
				var netPricePath = "oVendorComparisonModel>" + contextPath + "/listNetPriceDto";
				netPricesGrid.bindAggregation("content", netPricePath, function(index, oContext) {
					var oContentPath = oContext.getPath();
					var vendorsPath = "oVendorComparisonModel>" + oContentPath;
					var gridHbox = new sap.m.HBox();
					var vBoxinner1 = new sap.m.VBox();
					vBoxinner1.addStyleClass("vBoxinner1Class");
					var vBoxinner2 = new sap.m.VBox();
					var checkBoxHbox = new sap.m.HBox();
					checkBoxHbox.addStyleClass("checkBoxHboxClass");
					var hBoxinnervBox2 = new sap.m.HBox();
					hBoxinnervBox2.addStyleClass("hBoxinnervBox2");
					gridHbox.addStyleClass("gridHboxClass");
					var vendorName = new sap.m.Label({
						text: "{" + vendorsPath + "/vendor}"
					});
					vendorName.addStyleClass("vendorNameClass");
					var vendorNetprice = new sap.m.Label({
						text: "{" + vendorsPath + "/netPrice}"
					});
					vendorNetprice.addStyleClass("vendorNPClass");
					var vendorNpCurr = new sap.m.Label({
						text: "{" + vendorsPath + "/currency}"
					});
					vendorNpCurr.addStyleClass("vendorNpCurrClass");
					var legendBestPrice = new sap.m.Image({
						src: "images/LegendBestPrice.png",
						visible: "{oElementPropertyModel>/legendBPImage}"
					});
					legendBestPrice.addStyleClass("legendBPriceClass");
					hBoxinnervBox2.addItem(vendorNetprice);
					hBoxinnervBox2.addItem(vendorNpCurr);
					vBoxinner1.addItem(vendorName);
					hBoxinnervBox2.addItem(legendBestPrice);
					vBoxinner2.addItem(checkBoxHbox);
					vBoxinner2.addItem(hBoxinnervBox2);
					vendorNetprice.addStyleClass("vendorNPClass");
					gridHbox.addItem(vBoxinner1);
					gridHbox.addItem(vBoxinner2);
					return gridHbox;
				});
				dateVbox.addItem(fromMonthText);
				dateVbox.addItem(fromDateText);
				dateVbox.addItem(fromYearText);
				dateVbox.addItem(spaceHbox);
				dateVbox.addItem(toMonthText);
				dateVbox.addItem(toDateText);
				dateVbox.addItem(toYearText);
				netPriceVbox.addItem(netPricesGrid);
				netPriceVbox.addStyleClass("detailedNpVboxClass");
				HBox.addItem(dateVbox);
				HBox.addItem(netPriceVbox);
				return HBox;
			});
			var toggleButton = this.getView().byId("toggleButtonId");
			var buttonPress = toggleButton.getPressed();
			if (buttonPress === true) {
				toggleButton.setText("select");
				oElementPropertyModel.setProperty("/viewDetailCompare", false);
				toggleButton.setPressed(false);
				oElementPropertyModel.refresh();
			}
		},

		selectionTextChange: function(oEvent) {
			var vendorNetpriceGrid = this.getView().byId("VENDORS_NETPRICES_GRID");
			var vendorNetpriceGridLen = vendorNetpriceGrid.getContent().length;
			var selectionArray = [];
			for (var i = 0; i <= vendorNetpriceGridLen - 1; i++) {
				var netpricegrid = vendorNetpriceGrid.getContent()[i].getItems()[1].getItems()[0];
				var vBoxsLen = netpricegrid.getContent().length;
				for (var j = 0; j <= vBoxsLen - 1; j++) {
					var GridBox = netpricegrid.getContent()[j];
					var vBoxinner2 = GridBox.getItems()[1];
					var checkBox = vBoxinner2.getItems()[0].getItems()[0];
					var selected = checkBox.getSelected();
					if (selected) {
						var selectedVendorData = GridBox.getParent().getBindingContext("oVendorComparisonModel").getObject().listNetPriceDto[j];
						selectionArray.push(selectedVendorData);
					}
				}
			}
			var len = selectionArray.length;

			if (len > 1) {
				var button = this.getView().byId("DetailCompareId");
				button.setText("Click to compare");
			} else if (len <= 1) {
				var button = this.getView().byId("DetailCompareId");
				button.setText("Select Vendors");
			}
		},

		onSwitchView: function(evt) {
			var oElementPropertyModel = this.oElementPropertyModel;
			var checkSD = this.specificDate;
			if (checkSD === "") {
				var oElementPropertyModel = this.oElementPropertyModel;
				oElementPropertyModel.getData().detailedCompare = true;
				var lineIcon = evt.getSource().getIcon();
				var selectButtonvis = oElementPropertyModel.getProperty("/detailedCompare");
				var toggleButton = this.getView().byId("toggleButtonId");
				var toggleButtonText = toggleButton.getText();
				var buttonPress = toggleButton.getPressed();
				if (lineIcon === "sap-icon://line-chart") {
					var BackButtonVis = oElementPropertyModel.getProperty("/viewBackDetail");
					var DetailCompButtonVis = oElementPropertyModel.getProperty("/viewDetailCompare");
					if (BackButtonVis === true || DetailCompButtonVis === true || selectButtonvis === true) {
						oElementPropertyModel.setProperty("/viewBackDetail", false);
						oElementPropertyModel.setProperty("/viewDetailCompare", false);
						oElementPropertyModel.setProperty("/detailedCompare", false);
					}
				} else {
					if (buttonPress === true) {
						oElementPropertyModel.setProperty("/viewBackDetail", false);
						oElementPropertyModel.setProperty("/viewDetailCompare", true);
						oElementPropertyModel.setProperty("/detailedCompare", true);
					}
				}
				var navCon = this.getView().byId("navCon");
				var target = evt.getSource().data("target");
				if (target) {
					var animation = "flip";
					navCon.to(this.getView().byId(target), animation);
				} else {
					navCon.back();
				}
			} else {
				var navConSD = this.getView().byId("navConSD");
				var target = evt.getSource().data("targetSD");
				if (target) {
					var animation = "flip";
					navConSD.to(this.getView().byId(target), animation);
				} else {
					navConSD.back();
				}
			}
			oElementPropertyModel.refresh();
		},
		onTogglePress: function(oEvent) {
			var that = this;
			var oElementPropertyModel = this.oElementPropertyModel;
			var Button = oEvent.getSource();
			var ButtonPress = Button.getPressed();
			var vendorNetpriceGrid = this.getView().byId("VENDORS_NETPRICES_GRID");
			var vendorNetpriceGridLen = vendorNetpriceGrid.getContent().length;
			if (ButtonPress === true) {
				Button.setText("Clear");
				for (var i = 0; i <= vendorNetpriceGridLen - 1; i++) {
					var netpricegrid = vendorNetpriceGrid.getContent()[i].getItems()[1].getItems()[0];
					var vBoxsLen = netpricegrid.getContent().length;
					for (var j = 0; j <= vBoxsLen - 1; j++) {
						var GridBox = netpricegrid.getContent()[j];
						var vBoxinner2 = GridBox.getItems()[1];
						var checkBoxHbox = vBoxinner2.getItems()[0];
						var GridCheckBox = new sap.m.CheckBox({
							select: function(oEvent) {
								that.selectionTextChange(oEvent);
							}
						});
						checkBoxHbox.addStyleClass("checkBoxStyle");
						checkBoxHbox.addItem(GridCheckBox);
					}
				}
				oElementPropertyModel.setProperty("/viewDetailCompare", true);
			} else {
				Button.setText("select");
				for (var k = 0; k <= vendorNetpriceGridLen - 1; k++) {
					var netpricegrid = vendorNetpriceGrid.getContent()[k].getItems()[1].getItems()[0];
					var vBoxsLen = netpricegrid.getContent().length;
					for (var j = 0; j <= vBoxsLen - 1; j++) {
						var GridBox = netpricegrid.getContent()[j];
						var vBoxinner2 = GridBox.getItems()[1];
						var checkBoxHbox = vBoxinner2.getItems()[0];
						var GridCheckBoxb = checkBoxHbox.getItems()[0];
						checkBoxHbox.removeItem(GridCheckBoxb);
					}
				}
				oElementPropertyModel.setProperty("/viewDetailCompare", false);
			}
			oElementPropertyModel.refresh();
		},

		onDetailCompare: function(evt) {
			var oElementPropertyModel = this.oElementPropertyModel;
			var vendorNetpriceGrid = this.getView().byId("VENDORS_NETPRICES_GRID");
			var vendorNetpriceGridLen = vendorNetpriceGrid.getContent().length;
			var oDetailedCompareModel = this.oDetailedCompareModel;
			var buttonVis = oElementPropertyModel.getProperty("/viewDetailCompare");
			this.tmpArray = [];
			if (buttonVis === true) {
				for (var i = 0; i <= vendorNetpriceGridLen - 1; i++) {
					var netpricegrid = vendorNetpriceGrid.getContent()[i].getItems()[1].getItems()[0];
					var vBoxsLen = netpricegrid.getContent().length;
					for (var j = 0; j <= vBoxsLen - 1; j++) {
						var GridBox = netpricegrid.getContent()[j];
						var vBoxinner2 = GridBox.getItems()[1];
						var checkBox = vBoxinner2.getItems()[0].getItems()[0];
						var selected = checkBox.getSelected();
						if (selected) {
							var selectedVendorData = GridBox.getParent().getBindingContext("oVendorComparisonModel").getObject().listNetPriceDto[j];
							this.tmpArray.push(selectedVendorData);
						}
					}
				}
				var len = this.tmpArray.length;
				if (len === 0) {
					var errorText = this.oResourceModel.getText("NO_VENDOR_SELECTED");
					formatter.toastMessage(errorText);
				}
				this.getCompareVendors(evt);
			} else {
				oElementPropertyModel.setProperty("/detailedCompare", true);
				var navCon = this.getView().byId("navCon");
				var target = evt.getSource().data("target");
				if (target) {
					navCon.back();
				}
				oDetailedCompareModel.setData([]);
				oElementPropertyModel.setProperty("/viewDetailCompare", true);
				oElementPropertyModel.setProperty("/viewBackDetail", false);
				oElementPropertyModel.setProperty("/SegmentedButton", true);
			}
			oElementPropertyModel.refresh();
		},

		getCompareVendors: function(evt) {
			var that = this;
			var oDetailedCompareModel = that.oDetailedCompareModel;
			var oElementPropertyModel = that.oElementPropertyModel;
			var payload = this.getDetailedPayloadData();
			if (this.tmpArray.length === 0) {
				var errorText = that.oResourceModel.getText("PLEASE_SELECT_VENDOR");
				formatter.toastMessage(errorText);
			} else {
				this.busy.open();
				var sUrl = "/CWPRICE_WEB/PricingReport/VCADetailed";
				var jsonModel = new sap.ui.model.json.JSONModel();
				jsonModel.loadData(sUrl, JSON.stringify(payload), true, "POST", false, false, this.oHeader);
				jsonModel.attachRequestCompleted(function(oEvent) {
					if (oEvent.getParameter("success")) {
						var resultData = jsonModel.getData();
						if (resultData) {
							var newData = resultData.vendorInfo;
							if (!Array.isArray(newData)) {
								var tempArry = [];
								tempArry.push(newData);
								resultData.vendorInfo = tempArry;
							}
							oDetailedCompareModel.setData(resultData);
							that.setDetailedPageUI();
							that.busy.close();
						}
					} else {
						var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
						formatter.toastMessage(errorText);
						that.busy.close();
					}
				});
				jsonModel.attachRequestFailed(function(oEvent) {
					var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
					formatter.toastMessage(errorText);
					that.busy.close();
				});
				var navCon = this.getView().byId("navCon");
				var target = evt.getSource().data("target");
				if (target) {
					var animation = "slide";
					navCon.to(this.getView().byId(target), animation);
				} else {
					navCon.back();
				}
				oElementPropertyModel.setProperty("/detailedCompare", false);
				oElementPropertyModel.setProperty("/viewDetailCompare", false);
				oElementPropertyModel.setProperty("/viewBackDetail", true);
				oElementPropertyModel.setProperty("/SegmentedButton", false);
			}
			oElementPropertyModel.refresh();
		},

		getDetailedPayloadData: function() {
			var oNewSearchparameterModel = this.oNewSearchparameterModel;
			var parameterList = oNewSearchparameterModel.getData().parameterList;
			var DetailedPayLoadData = {};
			DetailedPayLoadData.listOfNetPrice = this.tmpArray;
			DetailedPayLoadData.parameterList = parameterList;
			return DetailedPayLoadData;
		},

		setDetailedPageUI: function() {

			var checkSD = this.specificDate;
			if (checkSD === "") {
				var oDetailedCompareModel = this.oDetailedCompareModel;
				var vInfoData = oDetailedCompareModel.getData();
				var vInfo = vInfoData.vendorInfo;
				for (var i = 0; i < vInfo.length; i++) {
					var newData = vInfo[i].conditionTypes;
					if (!Array.isArray(newData)) {
						var tempArry = [];
						tempArry.push(newData);
						vInfoData.vendorInfo[i].conditionTypes = tempArry;
					}
					oDetailedCompareModel.setData(vInfoData);
				}
				oDetailedCompareModel.refresh();
				//var vendorInfo = oDetailedCompareModel.getData().vendorInfo;
				//var vendorsLen = vendorInfo.length;
				var CardHbox = this.getView().byId("VendorCompareDataId");
				CardHbox.bindAggregation("items", "oDetailedCompareModel>/vendorInfo", function(index, context) {
					var profileVBox = new sap.m.VBox();
					var ProfilePic = new sap.m.Image({
						src: "images/user.png"
					});
					profileVBox.addStyleClass("VendorProfile");
					var contextPath = context.getPath();
					//var oDetailedCompareModel = context.getModel();
					var sPath = "oDetailedCompareModel>" + contextPath;
					var oInnerBox = new sap.m.VBox();
					var oVInfoBox = new sap.m.VBox();
					oVInfoBox.addStyleClass("oVInfoBoxClass");
					var oVName = new sap.m.Label({
						text: "{" + sPath + "/vendorName}"
					});
					oVName.addStyleClass("oCardDataClass");
					var oNPrice = new sap.m.Label({
						text: "{" + sPath + "/netPrice}"
					});
					oNPrice.addStyleClass("oCardDataClass");
					profileVBox.addItem(ProfilePic);
					oVInfoBox.addItem(oVName);
					oVInfoBox.addItem(oNPrice);
					var oCTypesBox = new sap.m.VBox();
					oCTypesBox.addStyleClass("oVInfoBoxClass");
					oCTypesBox.bindAggregation("items", sPath + "/conditionTypes", function(index, context1) {
						var contextPath1 = context1.getPath();
						//var oDetailedCompareModel = context.getModel();
						var bindPath = "oDetailedCompareModel>" + contextPath1;
						//	var currentObj = oDetailedCompareModel.getProperty(contextPath1);
						//var label = currentObj.conditionLabel;
						var oCInnerBox = new sap.m.VBox();
						var cValue = new sap.m.Label({
							required: {
								path: bindPath + "/average",
								formatter: formatter.formatBooleanValues
							},
							text: "{" + bindPath + "/conditionValue}" + "{" + bindPath + "/currency}"
						});
						cValue.addStyleClass("oCardDataClass");
						oCInnerBox.addItem(cValue);
						return oCInnerBox;
					});
					oInnerBox.addItem(profileVBox);
					oInnerBox.addItem(oVInfoBox);
					oInnerBox.addItem(oCTypesBox);
					oInnerBox.addStyleClass("cardBoxClass");
					return oInnerBox;
				});
				return CardHbox;
			} else {
				var oVendorComparisonModel = this.oVendorComparisonModel;
				var vInfoData = oVendorComparisonModel.getData();
				var vInfo = vInfoData.vendorInfo;
				for (var i = 0; i < vInfo.length; i++) {
					var newData = vInfo[i].conditionTypes;
					if (!Array.isArray(newData)) {
						var tempArry = [];
						tempArry.push(newData);
						vInfoData.vendorInfo[i].conditionTypes = tempArry;
					}
					oVendorComparisonModel.setData(vInfoData);
				}
				oVendorComparisonModel.refresh();
				//var vendorInfo = oDetailedCompareModel.getData().vendorInfo;
				//var vendorsLen = vendorInfo.length;
				var CardHbox = this.getView().byId("VendorCompareDataSDId");
				CardHbox.bindAggregation("items", "oVendorComparisonModel>/vendorInfo", function(index, context) {
					var profileVBox = new sap.m.VBox();
					var ProfilePic = new sap.m.Image({
						src: "images/user.png"
					});
					profileVBox.addStyleClass("VendorProfile");
					var contextPath = context.getPath();
					//var oDetailedCompareModel = context.getModel();
					var sPath = "oVendorComparisonModel>" + contextPath;
					var oInnerBox = new sap.m.VBox();
					var oVInfoBox = new sap.m.VBox();
					oVInfoBox.addStyleClass("oVInfoBoxClass");
					var oVName = new sap.m.Label({
						text: "{" + sPath + "/vendorName}"
					});
					oVName.addStyleClass("oCardDataClass");
					var oNPrice = new sap.m.Label({
						text: "{" + sPath + "/netPrice}"
					});
					oNPrice.addStyleClass("oCardDataClass");
					profileVBox.addItem(ProfilePic);
					oVInfoBox.addItem(oVName);
					oVInfoBox.addItem(oNPrice);
					var oCTypesBox = new sap.m.VBox();
					oCTypesBox.addStyleClass("oVInfoBoxClass");
					oCTypesBox.bindAggregation("items", sPath + "/conditionTypes", function(index, context1) {
						var contextPath1 = context1.getPath();
						//var oDetailedCompareModel = context.getModel();
						var bindPath = "oVendorComparisonModel>" + contextPath1;
						//	var currentObj = oDetailedCompareModel.getProperty(contextPath1);
						//var label = currentObj.conditionLabel;
						var oCInnerBox = new sap.m.VBox();
						var cValue = new sap.m.Label({
							required: {
								path: bindPath + "/average",
								formatter: formatter.formatBooleanValues
							},
							text: "{" + bindPath + "/conditionValue}" + "{" + bindPath + "/currency}"
						});
						cValue.addStyleClass("oCardDataClass");
						oCInnerBox.addItem(cValue);
						return oCInnerBox;
					});
					oInnerBox.addItem(profileVBox);
					oInnerBox.addItem(oVInfoBox);
					oInnerBox.addItem(oCTypesBox);
					oInnerBox.addStyleClass("cardBoxClass");
					return oInnerBox;
				});
				return CardHbox;

			}
		},

		onClearCompare: function(oEvent) {
			var oElementPropertyModel = this.oElementPropertyModel;
			var oBindSearchParamModel = this.oBindSearchParamModel;
			var oVendorsGraphModel = this.oVendorsGraphModel;
			var oVendorComparisonModel = this.oVendorComparisonModel;
			var gridContent = this.getView().byId("VENDORS_SEARCH_GRID").getContent();
			var gridHboxLength = gridContent.length;
			var multiInput = this.getView().byId("multiInput");
			for (var i = 0; i <= gridHboxLength - 1; i++) {
				var oVendorBox = gridContent[i].getItems()[1];
				try {
					var customdata = oVendorBox.getCustomData()[0].getKey();
				} catch (error) {
					continue;
				}
				if (customdata === "vendorMultiComboBox") {
					oVendorBox.removeAllSelectedItems();
					multiInput.removeAllTokens();
					oElementPropertyModel.setProperty("/multiInput", false);
					this.tempVendorArray = [];
				}
				if (customdata === "PeriodComboBox") {
					oVendorBox.setSelectedKey("");
				}
			}
			oVendorsGraphModel.setData({});
			oVendorComparisonModel.setData({});
			oElementPropertyModel.setProperty("/mainVbox", false);
			oElementPropertyModel.setProperty("/mainVboxSD", false);
			this.period = "";
			this.specificDate = "";
			var vendSearchLen = oBindSearchParamModel.getData().vendSearchParam.length;
			for (i = 0; i <= vendSearchLen - 1; i++) {
				var fieldId = oBindSearchParamModel.getData().vendSearchParam[i].fieldId;
				if (fieldId === "SELECT_DATE") {
					oBindSearchParamModel.getData().vendSearchParam[i].fieldValue = "";
				}
			}
			oElementPropertyModel.setProperty("/dateVisible", false);
			oElementPropertyModel.refresh();
			oBindSearchParamModel.refresh();
		},

		onClearMaterial: function() {
			var oElementPropertyModel = this.oElementPropertyModel;
			var oNewSearchparameterModel = this.oNewSearchparameterModel;
			var perListData = oNewSearchparameterModel.getData().parameterList;
			for (var i = 0; i <= perListData.length - 1; i++) {
				if(perListData[i].fieldId === "DATE/PERIOD"){
					perListData[i].fieldValue = "";
				}
			}
			oNewSearchparameterModel.getData().result = [];
			var materialSearch = oElementPropertyModel.getProperty("/MaterialSearch");
			if (materialSearch === false) {
				oElementPropertyModel.setProperty("/MaterialSearch", true);
			}
			this.onClearCompare();
			oElementPropertyModel.setProperty("/vendorPanel", false);
			oElementPropertyModel.refresh();
		},

		onexpand: function(oEvent) {
			var oElementPropertyModel = this.oElementPropertyModel;
			var expended = oElementPropertyModel.getProperty("/oMPanelExpanded");
			if (oEvent.getParameters().triggeredByInteraction) {
				if (expended) {
					oElementPropertyModel.setProperty("/MaterialSearch", false);
					oElementPropertyModel.setProperty("/MaterialClear", true);
				} else {
					oElementPropertyModel.setProperty("/MaterialSearch", false);
					oElementPropertyModel.setProperty("/MaterialClear", false);
				}
			} else {
				oElementPropertyModel.setProperty("/MaterialSearch", true);
				oElementPropertyModel.setProperty("/MaterialClear", true);
			}
			oElementPropertyModel.refresh();
			/*	if (this.getView().byId("VendorCompareBtn").getText() === "Vendors") {
					if (oEvent.getParameters().triggeredByInteraction) {
						oEvent.getSource().setExpandAnimation(false);
						oEvent.getSource().setExpanded(false);
					}
					
				}*/
		},

		onSelectGraphPoint: function(data) {
			var oVendorsGraphModel = this.oVendorsGraphModel;
			var oGraphPopOverModel = this.oGraphPopOverModel;
			var date = data.getParameters().data[0].data.Date;
			var Vendor = data.getParameters().data[0].data.Vendors;
			var dataDto = oVendorsGraphModel.getData().oVendorComparisonListData;
			var obj = {};
			for (var i = 0; i < dataDto.length; i++) {
				if (dataDto[i].fromString === date && dataDto[i].vendor === Vendor) {
					obj = dataDto[i];
				}
			}
			oGraphPopOverModel.setData(obj);
			var evt = data;
			this.createPopOver(evt);
		},

		createPopOver: function(evt) {
			var oEvent = evt;
			if (!this.oPopOver) {
				this.oPopOver = sap.ui.xmlfragment("PU_Reports.fragment.VCApopover", this);
				this.getView().addDependent(this.oPopOver);
			}
			this.oPopOver.setModel(this.getView().getModel("oGraphPopOverModel"));
			this.oPopOver.openBy(oEvent.getParameter("data")[0].target);
		},

		onClosePopOver: function() {
				var oGraphPopOverModel = this.oGraphPopOverModel;
				oGraphPopOverModel.setData({});
				this.oPopOver.close();
			}
			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * @memberOf view.vendoreCompebest
			 */
			//	onInit: function() {
			//
			//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf view.vendoreCompebest
		 */
		//	onBeforeRendering: function() {
		//
		//	},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf view.vendoreCompebest
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf view.vendoreCompebest
		 */
		//	onExit: function() {
		//
		//	}

	});

});