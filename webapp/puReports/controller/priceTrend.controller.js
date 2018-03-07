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

	return Controller.extend("PU_Reports.controller.priceTrend", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf puReports.view.priceTrend
		 */

		onInit: function() {
			var that = this;
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this.oHeader = {
				"Accept": "application/json",
				"Content-Type": "application/json"
			};

			this.busy = new BusyDialog();
			this.graphFor = "Annual";
			this.startDate = "firstDataPoint";
			this.endDate = "lastDataPoint";
			this.duration = "YEARLY";

			var newDate = new Date();
			this.year = newDate.getFullYear();
			this.Quarter = "Jan-Mar";
			this.month = "Jan";
			this.compareGraphFor = "YOY";
			this.vizType = "timeseries_line";
			this.dataType = "date";
			this.UID = "timeAxis";
			this.bVal = true;
			this._router.attachRoutePatternMatched(function(oEvent) {
				var viewName = oEvent.getParameter("name");
				if (viewName === "priceTrend") {
					that.routePatternMatched(oEvent);
				}

			});
			//this.setUIModel();
			//this._router = sap.ui.core.UIComponent.getRouterFor(this);
			this.setUIModel();
		},

		setUIModel: function() {
			var that = this;
			var oElementPropertyModel = this.getOwnerComponent().getModel("oElementPropertyModel");
			this.oElementPropertyModel = oElementPropertyModel;

			oElementPropertyModel.setProperty("/tableVisible", false);
			oElementPropertyModel.setProperty("/detailEnable", true);
			oElementPropertyModel.setProperty("/monthCombo", false);
			oElementPropertyModel.setProperty("/quarterCombo", false);
			oElementPropertyModel.setProperty("/durationCombo", true);
			oElementPropertyModel.setProperty("/yearCombo", true);
			oElementPropertyModel.setProperty("/graphGrid", false);

			var oResourceModel = this.getOwnerComponent().getModel("i18n");
			this.oResourceModel = oResourceModel.getResourceBundle();

			var oSearchParamModel = this.getOwnerComponent().getModel("oSearchParamModel");
			this.oSearchParamModel = oSearchParamModel;

			var oPTCompareGraphModel = this.getOwnerComponent().getModel("oPTCompareGraphModel");
			this.oPTCompareGraphModel = oPTCompareGraphModel;

			var oComboLapiDataModel = this.getOwnerComponent().getModel("oComboLapiDataModel");
			this.oComboLapiDataModel = oComboLapiDataModel;

			var oPriceTrendGraphModel = this.getOwnerComponent().getModel("oPriceTrendGraphModel");
			this.oPriceTrendGraphModel = oPriceTrendGraphModel;

			var oPTDetailDataModel = this.getOwnerComponent().getModel("oPTDetailDataModel");
			this.oPTDetailDataModel = oPTDetailDataModel;

		},
		routePatternMatched: function(oEvent) {
			this.getComboBoxData();
			this.getUISearchParameter();
		},

		getComboBoxData: function() {
			var that = this;
			that.busy.open();
			var oComboLapiDataModel = this.oComboLapiDataModel;
			var sUrl = "/CWPRICE_WEB/PricingReport/getKeyValueDuration/PriceTrendAnalysis";
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, "", true, "GET", false, false, this.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = oModel.getData();
					if (resultData) {
						oComboLapiDataModel.setData(resultData);
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

		clrSearchParameter: function() {
			this.mode = "Basic";
			var oSearchParamModel = this.oSearchParamModel;
			var oElementPropertyModel = this.oElementPropertyModel;
			var oSearchparameter = oSearchParamModel.getData();
			var bSearchparameter = oSearchparameter.hasOwnProperty("parameterList");
			if (bSearchparameter) {
				var oParametersData = oSearchparameter.parameterList;
				for (var i = 0; i < oParametersData.length; i++) {
					oParametersData[i].fieldValue = "";
				}
			}
			oSearchParamModel.refresh();

			oElementPropertyModel.setProperty("/graphGrid", false);
			oElementPropertyModel.refresh();
		},

		getUISearchParameter: function() {
			var that = this;
			that.busy.open();
			var oSearchParamModel = this.oSearchParamModel;
			var sUrl = "/CWPRICE_WEB/PricingReport/getReportParameters/PriceTrendAnalysis";
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
						oSearchParamModel.setData(resultData);
						that.setUISearchParameter();
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

		setUISearchParameter: function() {
			var that = this;
			var oSearchParamModel = this.oSearchParamModel;
			var oSearchLayGrid = this.getView().byId("INFO_REC_GRID");
			oSearchLayGrid.bindAggregation("content", "oSearchParamModel>/parameterList", function(index, context) {
				var contextPath = context.getPath();
				var oSearchParamModel = context.getModel();
				var sPath = "oSearchParamModel>" + contextPath;
				var currentObj = oSearchParamModel.getProperty(contextPath);
				var fieldType = currentObj.uiFieldType;
				var fieldVisible = formatter.formatBooleanValues(currentObj.isVisible);
				if (fieldVisible) {
					var oHBoxItem = new sap.m.HBox();
					var oLabel = new sap.m.Label({
						required: {
							path: sPath + "/isMandatory",
							formatter: formatter.formatBooleanValues
						},
						tooltip: "{" + sPath + "/fieldName}",
						text: "{" + sPath + "/fieldName}"
					}).addStyleClass("gridLblClass");
					oHBoxItem.addItem(oLabel);
					if (fieldType === "Input") {
						var oInput = new sap.m.Input({
							value: "{" + sPath + "/fieldValue}",
							//maxLength: { path: sPath + "/fieldLength", formatter: formatter.formatMaxLength},
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
						//formatter.onSAPEnter(oInput, that);
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

		onSearchPriceTrend: function() {
			var oElementPropertyModel = this.oElementPropertyModel;
			var oPayload = this.getPayloadata();
			var data = oPayload.parameterList;
			var vendor, matrialNo, purchaseOrg;
			for (var i = 0; i < data.length; i++) {
				var fId = data[i].fieldId;
				if (fId === "LIFNR") {
					vendor = data[i].fieldValue;
				}
				if (fId === "MATNR") {
					matrialNo = data[i].fieldValue;
				}
				if (fId === "EKORG") {
					purchaseOrg = data[i].fieldValue;
				}
			}
			if (vendor === "" || matrialNo === "" || purchaseOrg === "") {
				var errorText = this.oResourceModel.getText("PLEASE_FILL_ALL_REQUIRED_FEILDS");
				formatter.toastMessage(errorText);
			} else {
				oElementPropertyModel.setProperty("/graphGrid", true);
				oElementPropertyModel.refresh();
				this.getAllGraphData(oPayload);
			}
		},

		getPayloadata: function() {
			var oSearchParamModel = this.oSearchParamModel;
			oSearchParamModel.getData().reportType = "PriceTrendAnalysis";
			var oPayloadData = oSearchParamModel.getData();
			return oPayloadData;
		},

		onSelectDurationType: function(oEvent) {
			var oElementPropertyModel = this.oElementPropertyModel;
			var selDuration = oEvent.getSource().getSelectedKey();
			this.duration = selDuration;
			if (selDuration === "YEARLY") {
				oElementPropertyModel.setProperty("/monthCombo", false);
				oElementPropertyModel.setProperty("/quarterCombo", false);
			} else if (selDuration === "QUARTERLY") {
				oElementPropertyModel.setProperty("/monthCombo", false);
				oElementPropertyModel.setProperty("/quarterCombo", true);
			} else {
				oElementPropertyModel.setProperty("/monthCombo", true);
				oElementPropertyModel.setProperty("/quarterCombo", false);
			}
			oElementPropertyModel.refresh();
			this.onSearchPTGraph();
		},

		onSelectYear: function(oEvent) {
			var selYear = oEvent.getSource().getSelectedKey();
			this.year = selYear;
			this.onSearchPTGraph();
		},

		onSelectQuarter: function(oEvent) {
			var selQuarter = oEvent.getParameters().selectedItem.getText();
			this.Quarter = selQuarter;
			this.onSearchPTGraph();
		},

		onSelectMonth: function(oEvent) {
			var selMonth = oEvent.getSource().getSelectedKey();
			this.month = selMonth;
			this.onSearchPTGraph();
		},

		getAllGraphData: function(oPayload) {
			var that = this;
			that.busy.open();
			var payload = oPayload;
			var oPriceTrendGraphModel = this.oPriceTrendGraphModel;
			var sUrl = "/CWPRICE_WEB/PricingReport/getSummaryReport";
			var jsonModel = new sap.ui.model.json.JSONModel();
			jsonModel.loadData(sUrl, JSON.stringify(payload), true, "POST", false, false, this.oHeader);
			jsonModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = jsonModel.getData();
					if (resultData) {
						var data = resultData.parameterList;
						if (!Array.isArray(data)) {
							var tempArry = [];
							tempArry.push(data);
							resultData.parameterList = tempArry;
						}
						oPriceTrendGraphModel.setData(resultData);
						that.getPriceTrendGraphData();
						that.getPTCompareGraphData();
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
		},

		getPriceTrendGraphData: function() {
			var oPriceTrendGraphModel = this.oPriceTrendGraphModel;
			var showData = oPriceTrendGraphModel.getData().listNetPriceDto;
			this.setPriceTrendGraph(showData);
		},

		getPTCompareGraphData: function() {
			var oPriceTrendGraphModel = this.oPriceTrendGraphModel;
			var key = this.compareGraphFor;
			var start = this.startDate;
			var end = this.endDate;
			var rangeData, level = [];
			if (key === "YOY") {
				rangeData = oPriceTrendGraphModel.getData().listYearlyRangeDto;
				level = ["day", "month"];
				this.dataType = "date";
				this.vizType = "timeseries_line";
				this.UID = "timeAxis";
				this.bVal = true;
			} else if (key === "QOQ") {
				rangeData = oPriceTrendGraphModel.getData().listQuartarRangeDto;
				level = ["week"];
				this.dataType = null;
				this.vizType = "line";
				this.UID = "categoryAxis";
				this.bVal = false;
			} else {
				rangeData = oPriceTrendGraphModel.getData().listMonthRangeDto;
				level = ["week"];
				this.dataType = null;
				this.vizType = "line";
				this.UID = "categoryAxis";
				this.bVal = false;
			}
			this.setPTCompareGraphData(rangeData, level, key);
		},

		setPriceTrendGraph: function(showData) {
			var that = this;
			var formatPattern = ChartFormatter.DefaultPattern;
			var start = this.startDate;
			var end = this.endDate;
			var oPriceTrendGraphModel = this.oPriceTrendGraphModel;
			oPriceTrendGraphModel.getData().priceTrendGraphDataDto = showData;
			var oVizFrame = this.getView().byId("PRICETRENDGRAPH");
			this.oVizFrame = oVizFrame;
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Date",
					value: "{oPriceTrendGraphModel>fromString}",
					dataType: "date"
				}],

				measures: [{
					name: "NetPrice",
					value: "{oPriceTrendGraphModel>netPrice}"
				}],

				data: {
					path: "oPriceTrendGraphModel>/priceTrendGraphDataDto"
				}
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setVizType("timeseries_line");
			//set  viz properties
			oVizFrame.setVizProperties({
				tooltip: {
					visible: true
				},

				title: {
					visible: false
				},
				plotArea: {
					window: {
						start: start,
						end: end
					},
					dataLabel: {
						/*formatString:ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,*/
						visible: true,
						showRecap: true
					}
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
					},

					levels: ["day", "month"]

				},
				legendGroup: {
					layout: {
						position: "top"
					}
				},
				interaction: {
					syncValueAxis: false
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
				"values": ["NetPrice"]
			});

			var feedCategoryAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "timeAxis",
				"type": "Dimension",
				"values": ["Date"]
			});
			oVizFrame.destroyFeeds();
			oVizFrame.addFeed(oFeedValueAxis);
			oVizFrame.addFeed(feedCategoryAxis1);

			this.initPTSetting();
		},

		initPTSetting: function() {

			// try to load sap.suite.ui.commons for using ChartContainer
			// sap.suite.ui.commons is available in sapui5-sdk-dist but not in demokit
			var libraries = sap.ui.getVersionInfo().libraries || [];
			var bSuiteAvailable = libraries.some(function(lib) {
				return lib.name.indexOf("sap.suite.ui.commons") > -1;
			});
			if (bSuiteAvailable) {
				jQuery.sap.require("sap/suite/ui/commons/ChartContainer");
				var vizframe = this.getView().byId("PRICETRENDGRAPH");
				var oChartContainerContent = new sap.suite.ui.commons.ChartContainerContent({
					icon: "sap-icon://vertical-waterfall-chart",
					title: "vizFrame Waterfall Chart Sample",
					content: [vizframe]
				});
				var oChartContainer = new sap.suite.ui.commons.ChartContainer({
					content: [oChartContainerContent]
				});
				oChartContainer.setShowFullScreen(true);
				oChartContainer.setAutoAdjustHeight(true);
				this.getView().byId("chartFixFlex").setFlexContent(oChartContainer);
			}
		},

		setCompareGraphDuration: function(oEvent) {
			this.compareGraphFor = oEvent.getSource().getKey();
			this.getPTCompareGraphData();
		},

		setPTCompareGraphData: function(rangeData, level, key) {
			var that = this;
			var formatPattern = ChartFormatter.DefaultPattern;
			var dType = this.dataType;
			var vType = this.vizType;
			var start = this.startDate;
			var end = this.endDate;
			var uID = this.UID;
			var bVal = this.bVal;
			var oPTCompareGraphModel = this.oPTCompareGraphModel;
			var dateLength = rangeData.length;
			var listArray = [];
			if (key === "QOQ" || key === "MOM") {
				for (var i = 0; i <= dateLength - 1; i++) {
					var vendorsLength = rangeData[i].listNetPriceDto.length;
					for (var j = 0; j <= vendorsLength - 1; j++) {
						rangeData[i].listNetPriceDto[j].from = j + 1;
						listArray.push(rangeData[i].listNetPriceDto[j]);
						/*listArray.push(rangeData[i].listNetPriceDto[j].fromString = j);*/
					}
				}
			} else {
				for (var i = 0; i <= dateLength - 1; i++) {
					var vendorsLength = rangeData[i].listNetPriceDto.length;
					for (var j = 0; j <= vendorsLength - 1; j++) {
						listArray.push(rangeData[i].listNetPriceDto[j]);
					}
				}
			}

			oPTCompareGraphModel.getData().priceTrendGraphDataDto = listArray;
			var oVizFrame = this.getView().byId("PRCTRDCOMPAREGRAPH");
			this.oVizFrame1 = oVizFrame;
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Date",
					value: "{oPTCompareGraphModel>from}",
					dataType: dType
				}, {
					name: "Duration",
					value: "{oPTCompareGraphModel>duration}"
				}],

				measures: [{
					name: "NetPrice",
					value: "{oPTCompareGraphModel>netPrice}"
				}],

				data: {
					path: "oPTCompareGraphModel>/priceTrendGraphDataDto"
				}
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setVizType(vType);
			//set  viz properties
			oVizFrame.setVizProperties({
				title: {
					visible: false
				},
				plotArea: {
					window: {
						start: start,
						end: end
					},
					dataLabel: {
						/*formatString: ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,*/
						visible: true
					}
				},
				valueAxis: {
					title: {
						visible: false
					},
					label: {

					}
				},
				categoryAxis: {
					visible: bVal
				},
				timeAxis: {
					title: {
						visible: false
					},
					interval: {
						unit: ""
					},
					levels: level

				},
				legendGroup: {
					layout: {
						position: "top"
					}
				},
				interaction: {
					syncValueAxis: false
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
				"values": ["NetPrice"]
			});

			var feedCategoryAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": uID,
				"type": "Dimension",
				"values": ["Date"]
			});

			var feedCategoryAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "color",
				"type": "Dimension",
				"values": ["Duration"]
			});
			oVizFrame.destroyFeeds();
			oVizFrame.addFeed(oFeedValueAxis);
			oVizFrame.addFeed(feedCategoryAxis1);
			oVizFrame.addFeed(feedCategoryAxis2);

			this.initPTComSetting();
		},

		initPTComSetting: function() {

			// try to load sap.suite.ui.commons for using ChartContainer
			// sap.suite.ui.commons is available in sapui5-sdk-dist but not in demokit
			var libraries = sap.ui.getVersionInfo().libraries || [];
			var bSuiteAvailable = libraries.some(function(lib) {
				return lib.name.indexOf("sap.suite.ui.commons") > -1;
			});
			if (bSuiteAvailable) {
				jQuery.sap.require("sap/suite/ui/commons/ChartContainer");
				var vizframe = this.getView().byId("PRCTRDCOMPAREGRAPH");
				var oChartContainerContent = new sap.suite.ui.commons.ChartContainerContent({
					icon: "sap-icon://vertical-waterfall-chart",
					title: "vizFrame Waterfall Chart Sample",
					content: [vizframe]
				});
				var oChartContainer = new sap.suite.ui.commons.ChartContainer({
					content: [oChartContainerContent]
				});
				oChartContainer.setShowFullScreen(true);
				oChartContainer.setAutoAdjustHeight(true);
				this.getView().byId("chartFixFlex1").setFlexContent(oChartContainer);
			}

		},

		onSearchPTGraph: function() {
			var oPayloadData = this.getPayloadata();
			var durationType = this.duration;
			var year = this.year;
			var quartar = this.Quarter;
			var month = this.month;
			if (durationType === "YEARLY") {
				oPayloadData.durationType = durationType;
				oPayloadData.year = year;
			} else if (durationType === "QUARTERLY") {
				oPayloadData.durationType = durationType;
				oPayloadData.year = year;
				oPayloadData.quartar = quartar;
			} else {
				oPayloadData.durationType = durationType;
				oPayloadData.year = year;
				oPayloadData.month = month;
			}
			this.getConditionGraphData(oPayloadData);
		},

		getConditionGraphData: function(oPayloadData) {
			var that = this;
			that.busy.open();
			var payload = oPayloadData;
			var oPriceTrendGraphModel = this.oPriceTrendGraphModel;
			var sUrl = "/CWPRICE_WEB/PricingReport/getDurationDataReport";
			var jsonModel = new sap.ui.model.json.JSONModel();
			jsonModel.loadData(sUrl, JSON.stringify(payload), true, "POST", false, false, this.oHeader);
			jsonModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = jsonModel.getData();
					if (resultData) {
						//oPriceTrendGraphModel.setData(resultData);
						var data = resultData.listNetPriceDto;
						if (!Array.isArray(data)) {
							var tempArry = [];
							tempArry.push(data);
							resultData.listNetPriceDto = tempArry;
						}
						var showdata = resultData.listNetPriceDto;

						that.setPriceTrendGraph(showdata);
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
		},

		onSelectGraphPoint: function(data) {
			var oPriceTrendGraphModel = this.oPriceTrendGraphModel;
			var date = data.getParameters().data[0].data.Date;
			var obj = {};
			var dataDto = oPriceTrendGraphModel.getData().priceTrendGraphDataDto;
			for (var i = 0; i < dataDto.length; i++) {
				if (dataDto[i].fromString === date) {
					obj = dataDto[i];
				}
			}
			var evt = data;
			this.getDetailedData(obj, evt);
			this.cretePopOver(evt);
		},

		onSelectPTCGraphPoint: function(data) {
			var key = this.compareGraphFor;
			var oPTCompareGraphModel = this.oPTCompareGraphModel;
			var date = data.getParameters().data[0].data.Date;
			var duration = data.getParameters().data[0].data.Duration;
			var obj = {};
			var dataDto = oPTCompareGraphModel.getData().priceTrendGraphDataDto;
			for (var i = 0; i < dataDto.length; i++) {
				if (dataDto[i].from === date && dataDto[i].duration === duration) {
					obj = dataDto[i];
				}
			}
			var evt = data;
			this.getDetailedData(obj, evt);
			this.cretePopOver(evt);
		},

		cretePopOver: function(evt) {
			var oEvent = evt;
			if (!this.oPopOver) {
				this.oPopOver = sap.ui.xmlfragment("PU_Reports.fragment.popover", this);
				this.getView().addDependent(this.oPopOver);
			}
			this.oPopOver.setModel(this.getView().getModel("oPTDetailDataModel"));
			this.oPopOver.openBy(oEvent.getParameter("data")[0].target);
		},

		getDetailedData: function(obj, evt) {
			var that = this,
				vendor;
			that.busy.close();
			var oPTDetailDataModel = this.oPTDetailDataModel;
			var payload = this.getPayloadata();
			payload.listOfNetPrice = obj;
			var data = payload.parameterList;
			for (var i = 0; i < data.length; i++) {
				var fId = data[i].fieldId;
				if (fId === "LIFNR") {
					vendor = data[i].fieldValue;
				}
			}
			payload.listOfNetPrice.vendor = vendor;
			
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
						oPTDetailDataModel.setData(resultData);
						that.creteDetailReport();
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
		},

		creteDetailReport: function() {
			var that = this;
			var oPTDetailDataModel = this.oPTDetailDataModel;
			var vInfoData = oPTDetailDataModel.getData();
			var vInfo = vInfoData.vendorInfo;
			var oVizFrame = this.oVizFrame;
			for (var i = 0; i < vInfo.length; i++) {
				var newData = vInfo[i].conditionTypes;
				if (!Array.isArray(newData)) {
					var tempArry = [];
					tempArry.push(newData);
					vInfoData.vendorInfo[i].conditionTypes = tempArry;
				}
				oPTDetailDataModel.setData(vInfoData);
			}
			oPTDetailDataModel.refresh();
		},

		onClosePopOver: function() {
			var oPTDetailDataModel = this.oPTDetailDataModel;
			oPTDetailDataModel.setData([]);
			this.oPopOver.close();
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf puReports.view.priceTrend
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf puReports.view.priceTrend
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf puReports.view.priceTrend
		 */
		//	onExit: function() {
		//
		//	}

	});
});