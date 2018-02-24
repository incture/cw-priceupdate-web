sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/incture/formatter/formatter",
	"sap/m/BusyDialog"
], function(Controller, formatter, BusyDialog) {

	return Controller.extend("com.incture.controller.dashboard", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf view.Details
		 */
		onInit: function() {

			var that = this;
			this.init = true;
			this.busy = new BusyDialog();
			this.oHeader = {
				"Accept": "application/json",
				"Content-Type": "application/json"
			};

			this._router = sap.ui.core.UIComponent.getRouterFor(this);
			this._router.attachRoutePatternMatched(function(oEvent) {
				var viewName = oEvent.getParameter("name");
				if ( viewName === "dashboard" || viewName === "master") {
					that.routePatternMatched(oEvent);
				}
			});
		},
		/**
		 * Perform activities to be done when navigating to details page.
		 */
		routePatternMatched: function() {

			var oPayloadModel = this.getOwnerComponent().getModel('oPayloadModel');
			oPayloadModel.setData({
				oPayLoad: []
			});

			var oResourceModel = this.getOwnerComponent().getModel('i18n');
			this.oResourceModel = oResourceModel.getResourceBundle();

			var oPaginationModel = this.getOwnerComponent().getModel('oPaginationModel');
			this.oPaginationModel = oPaginationModel;

			var oAdvanceSearchModel = this.getOwnerComponent().getModel('oAdvanceSearchModel');
			this.oAdvanceSearchModel = oAdvanceSearchModel;

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

			var oMatBox = this.getView().byId("MATERIAL_SEARCH_BOX");
			oMatBox.setVisible(false);
			//this.getMaterialDetails();
			this.getBusinessObjectList();
		},
		
		getBusinessObjectList: function(){
			
			var that = this;
			this.busy.open();
			var sUrl = "/CWPRICE_WEB/condition/records/getBusinessObject";
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, "", true, "GET", false, false, that.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = oEvent.getSource().getData();
					that.getMaterialDetails();
				} else {
					var errorText = oEvent.getParameters().errorobject.statusText;
					formatter.toastMessage(errorText);
					that.busy.close();
				}
			});
			
			oModel.attachRequestFailed(function(oEvent) {
				var errorText = oEvent.getParameters().errorobject.statusText;
				formatter.toastMessage(errorText);
				that.busy.close();
			});
		},
		
		setMaterialSearchPayload: function(searchType) {

			var oPayload = {
				"contextMetadata": {
					"decisionTable": [
						"A017",
						"A018"
					],
					"businessObjectId": "PIRPS",
					"businessObject": "",
					"application": "",
					"usage": ""
				},
				"searchType": searchType,
				"uiId": 1
			};
			return oPayload;
		},

		// Function to search the list of materials,Payload is hardcoded will change in future
		getMaterialDetails: function() {
			var oPayload = this.setMaterialSearchPayload("Basic");
			oPayload.upperLimitInfoDto = [{
					"tableName": "A018",
					"lowerLimit": 1
				}, {
					"tableName": "A017",
					"lowerLimit": 1
				}];
			this.getMaterialData(oPayload, "1", false);
		},

		//Function to search list of materials
		getMaterialData: function(oPayload, pageNumber, bValPagination) {
			var that = this;
			this.busy.open();
			var oMatSearchModel = this.getOwnerComponent().getModel("oMatSearchModel");
			var oAdvanceSearchModel = this.oAdvanceSearchModel;
			var oSearchModel = this.getOwnerComponent().getModel("oSearchModel");
			var sUrl = "/CWPRICE_WEB/condition/records/search/page/" + pageNumber;
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, JSON.stringify(oPayload), true, "POST", false, false, that.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					var resultData = oEvent.getSource().getData();
					if (resultData.hasOwnProperty("tableRecords")) {
						if (!Array.isArray(resultData.tableRecords)) {
							var oTempArr = [];
							oTempArr.push(resultData.tableRecords);
							resultData.tableRecords = oTempArr;
						}
					} else {
						resultData.tableRecords = [];
					}
					oMatSearchModel.setData(resultData);
					var advSearchParams = jQuery.extend(true, {}, resultData);
					oAdvanceSearchModel.setData(advSearchParams);

					//Deleting Objects having "isVisible" property "false", 
					//Aggregation binding on Grid Layout, with controls invisible creates placeholder. 
					var oListParameter = oMatSearchModel.getData().searchpanel;
					var length = oListParameter.length;
					for (var i = length - 1; i >= 0; i--) {
						if (oListParameter[i].isVisible === "false" || oListParameter[i].isVisible === false) {
							oListParameter.splice(i, 1);
						}
					}

					if (!oSearchModel.getData().searchpanel) {
						oSearchModel.setData({
							searchpanel: oListParameter
						});
					}
					that.setMaterialTableData();
					if (that.init) {
						that.createAdvancedSearch();
						that.init = false;
					}
					if (!bValPagination) {
						that.generatePagination();
					}
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
		},

		//Function to set the table dynamic
		setMaterialTableData: function() {

			var oConditionRecordTbl = this.getView().byId("MATERIAL_RESULTS_TBL");
			oConditionRecordTbl.bindAggregation("columns", "oMatSearchModel>/metadata", function(index, context) {
				var contextPath = context.getPath();
				var sPath = "oMatSearchModel>" + contextPath;
				var oColumn = new sap.m.Column({
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatBooleanValues
					},
					header: new sap.m.Text({
						wrapping: true,
						text: {
							path: sPath + "/label",
							formatter: formatter.formatColumnWidth
						}
					}).addStyleClass("matTblHdrClass")
				});
				return oColumn;
			});

			oConditionRecordTbl.bindItems("oMatSearchModel>/tableRecords", function(index, context) {
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

		//Function to set the grid layout content dynamic
		createAdvancedSearch: function() {

			var that = this;
			var oSearchLayGrid = this.getView().byId("MAT_ADVANCE_GRID_LAY");
			oSearchLayGrid.bindAggregation("content", "oSearchModel>/searchpanel", function(index, context) {
				var contextPath = context.getPath();
				var oSearchModel = context.getModel();
				var sPath = "oSearchModel>" + contextPath;
				var combosPath = "oSearchModel>" + contextPath + "/listStatus" + "/entry";
				var currentObj = oSearchModel.getProperty(contextPath);
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
						text: "{" + sPath + "/label}" + ":"
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
							maxSuggestionWidth: "250px",
							change: function(oEvent) {
								var oVal = this.getValue();
								var oId = this.getCustomData()[0].getKey();
								that.onHandleSuggest(oEvent);
								that.setSearchPayLoad(oVal, oId);
								formatter.setSearchParams(oVal, oId, that.oAdvanceSearchModel);
							}
						}).addStyleClass('gridInput');

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
						}).addStyleClass('gridInput');
						oHBoxItem.addItem(oText);
						return oHBoxItem;
					} else if (fieldType === "ComboBox") {
						var oComboBox = new sap.m.Select("iStatusId");
						var oItemSelectTemplate = new sap.ui.core.Item({
							key: "{oSearchModel>key}",
							text: "{oSearchModel>value}"
						}); //Define the template for items, which will be inserted inside a select element
						oComboBox.bindAggregation("items", combosPath, oItemSelectTemplate);
						oComboBox.addStyleClass('comboboxStyle');
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
							},
							change: function(oEvent) {
								var oVal = this.getValue();
								var oId = this.getCustomData()[0].getKey();
								//that.onChangeSAPDatePicker(oEvent);
								formatter.setSearchParams(oVal, oId, that.oAdvanceSearchModel);
							}
						}).addStyleClass('gridInput PUDatePickerClass');
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

		onHandleSuggest: function(oEvent) {
			var that = this;
			oEvent.getSource().setShowSuggestion(true);
			var url = "/LookUp/oneapplookup/lookupdetails";
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
			var path;

			if (oEvent.getSource().getName() === "Vendor Material No.") {
				count = 3;
				name = "Vendor Material No.";
				path = url + "/Vendor?searchText=";
			} else if (oEvent.getSource().getName() === "Material No./Description") {
				count = 3;
				name = "Material Number";
				path = url + "/Material?searchText=";
			} else if (oEvent.getSource().getName() === "Plant") {
				count = 2;
				name = "Plant";
				path = url + "/Plants?searchText=";
			} else if (oEvent.getSource().getName() === "Purchasing Org") {
				name = "Purchasing Organization";
				count = 2;
				path = url + "/Purhcase_Organization?searchText=";
			} else {
				count = 2;
				name = "EAN/UPC";
				path = url + "/UPC?searchText=";
			}
			if (digitCount > count) {
				oEvent.getSource().setShowSuggestion(true);
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.loadData(path + getVal, null, false);
				var resultData = oModel.getData();
				if (resultData) {

					if (name === "Vendor Material No.") {
						oVendLookUpModel.setData(resultData);
						getInput.bindAggregation("suggestionItems", {
							path: "oVendLookUpModel>/Result",
							template: new sap.ui.core.ListItem({
								text: "{oVendLookUpModel>LIFNR}"
							})
						});
					} else if (name === "Material Number") {
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
					} else if (name === "Purchasing Organization") {
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
					that.busy.close();
				}
			}
		},

		//Function to select a specific row in a table
		onRowSelect: function(oEvent) {
			var sPath = oEvent.getParameter("listItem").getBindingContextPath().split("/")[2];
			var object = this.getOwnerComponent().getModel("oMatSearchModel").getData().tableRecords[sPath].recordList;
			var metaData = this.getOwnerComponent().getModel("oMatSearchModel").getData().metadata;
			var oVariableModel = this.getOwnerComponent().getModel("oVariableKeyModel");
			oVariableModel.getData().columns = metaData;
			oVariableModel.getData().rows = [object];
			this._router.navTo("materialDetails");
		},

		//Function to set the payload for the advance  search
		setSearchPayLoad: function(fieldValue, fieldId) {
			var oPayloadModel = this.getOwnerComponent().getModel("oPayloadModel");
			var oPayLoad = oPayloadModel.getData().oPayLoad;
			var length = oPayLoad.length;
			var oDuplicateItem = false;

			if (oPayLoad.length) {
				for (var i = 0; i < length; i++) {
					if (oPayLoad[i].fieldId === fieldId) {
						if (!fieldValue) {
							oDuplicateItem = true;
							oPayLoad.splice(i, 1);
							break;
						} else {
							oDuplicateItem = true;
							oPayLoad[i].fieldValue = fieldValue;
							oPayloadModel.getData().oPayLoad = oPayLoad;
						}
					}
				}
			}

			if (oDuplicateItem === false) {
				var oTempObj = {
					"fieldValue": fieldValue,
					"fieldId": fieldId
				};
				oPayloadModel.getData().oPayLoad.push(oTempObj);
			}
			oPayloadModel.refresh();
		},

		//Function to set the payload for the advance search,Payload is hardcoded will change in future
		onSearch: function(oEvent) {
			var oPaginationModel = this.oPaginationModel;
			var selectedPage = oPaginationModel.getProperty("/selectedPage");
			var oPayloadModel = this.oAdvanceSearchModel;
			var oSearchArry = oPayloadModel.getData().searchpanel;
			var additionalField = oPayloadModel.getData().additionalField;
			var oPayload = this.setMaterialSearchPayload("Advance");
			oPayload.searchCriteria = oSearchArry;
			var status = sap.ui.getCore().byId("iStatusId");
			var value = status._getSelectedItemText();
			var len = oSearchArry.length;
			for (var i = 0; i < len; i++) {
				if (oSearchArry[i].fieldId === "Status") {
					oSearchArry[i].fieldValue = value;
				}
			}
			oPayload.status = value;
			oPayload.additionalField = additionalField;
			this.getMaterialData(oPayload, selectedPage, false);
			this.setSearchCrtieria();

		},

		setSearchCrtieria: function() {
			var oSearchModel = this.getOwnerComponent().getModel("oSearchModel");
			var oDisplaySearchModel = this.getOwnerComponent().getModel("oDisplaySearchModel");
			var oListParameters = oSearchModel.getData().searchpanel;
			var oLength = oListParameters.length;
			var tempArray = [];
			var count = oLength;
			for (var i = 0; i < oLength; i++) {
				var obj = {};
				if (oListParameters[i].fieldValue && oListParameters[i].label) {
					obj.fieldValue = oListParameters[i].fieldValue;
					obj.label = oListParameters[i].label;
					tempArray.push(obj);
					obj = tempArray;
				} else if (oListParameters[i].uiFieldType === "ComboBox") {
					var status = sap.ui.getCore().byId("iStatusId");
					var value = status._getSelectedItemText();
					obj.fieldValue = value;
					obj.label = oListParameters[i].label;
					tempArray.push(obj);
					obj = tempArray;
				}

			}
			oDisplaySearchModel.setData([]);
			oDisplaySearchModel.setData({
				"displayData": tempArray
			});
			oDisplaySearchModel.refresh(true);
			//set search parameter box visibility
			var oMatBox = this.getView().byId("MATERIAL_SEARCH_BOX");
			if (count !== 0) {
				oMatBox.setVisible(true);
			} else {
				oMatBox.setVisible(false);
			}
		},

		//Function to get the entire list of Materials on the press of cancel,Payload is hardcoded will change in future
		onCancel: function() {
			var oDisplaySearchModel = this.getOwnerComponent().getModel("oDisplaySearchModel");
			var oSearchModel = this.getOwnerComponent().getModel("oSearchModel");
			var oListParameters = oSearchModel.getData().searchpanel;
			var oLength = oListParameters.length;
			var tempArray = [];
			for (var i = 0; i < oLength; i++) {
				oListParameters[i].fieldValue = "";
				var obj = {};
				obj.fieldValue = "";
				obj.label = "";
				tempArray.push(obj);
			}
			oSearchModel.refresh();
			oDisplaySearchModel.setData({
				"displayData": tempArray
			});
			oDisplaySearchModel.refresh(true);
			var status = sap.ui.getCore().byId("iStatusId");
			status.setSelectedKey("All");
			var oMatBox = this.getView().byId("MATERIAL_SEARCH_BOX");
			oMatBox.setVisible(false);
			var oPayloadModel = this.getOwnerComponent().getModel("oPayloadModel");
			oPayloadModel.getData().oPayLoad = [];
			oPayloadModel.refresh(true);

			var oPayload = this.setMaterialSearchPayload("Basic");
			oPayload.upperLimitInfoDto = [{
					"tableName": "A018",
					"lowerLimit": 1
				}, {
					"tableName": "A017",
					"lowerLimit": 1
			}];
			oPayload.searchCriteria = [];
			this.getMaterialData(oPayload, "1", false);
			var oPaginationModel = this.oPaginationModel;
			oPaginationModel.setProperty("/selectedPage", "1");
		},

		getTableBindingPaths: function(oEvent) {
			var oTable = this.getView().byId("MATERIAL_RESULTS_TBL");
			var oBindingPaths = ["1", "2", "3", "4"];
			formatter.onTableFilter(oEvent, oTable, oBindingPaths);
		},

		onPageClick: function(oEvent) {

			var bVal = false;
			var oPaginationModel = this.oPaginationModel;
			var oPageNumber = oEvent.getSource().getText();
			oPaginationModel.setProperty("/selectedPage", oPageNumber);

			var oAdvanceSearchModel = this.oAdvanceSearchModel;
			var oSearchArry = oAdvanceSearchModel.getData().searchpanel;
			for (var i = 0; i < oSearchArry.length; i++) {
				if (oSearchArry[i].fieldValue) {
					bVal = true;
				}
			}

			var oPayload;
			if (bVal) {
				oPayload = this.setMaterialSearchPayload("Advance");
				var status = sap.ui.getCore().byId("iStatusId");
				var value = status._getSelectedItemText();
				oPayload.status = value;
				oPayload.searchCriteria = oSearchArry;
				oPayload.additionalField = this.oAdvanceSearchModel.getData().additionalField;
			} else {
				oPayload = this.setMaterialSearchPayload("Basic");
				oPayload.searchCriteria = [];
			}
			this.getMaterialData(oPayload, oPageNumber, true);
		},

		generatePagination: function() {

			var oPaginationModel = this.oPaginationModel;
			var oMatSearchModel = this.getView().getModel("oMatSearchModel");
			var countPerPage = oMatSearchModel.getProperty("/pageSize");
			var totalResults = oMatSearchModel.getProperty("/totalResults");

			oPaginationModel.setProperty("/prevBtnVisible", false);
			oPaginationModel.setProperty("/nextBtnVisible", true);

			var pageCount = parseInt(totalResults / countPerPage);
			if (totalResults % countPerPage !== 0) {
				pageCount = pageCount + 1;
			}
			oPaginationModel.setProperty("/numberOfPages", pageCount);

			var array = [];
			//var oSelectedPage = "1";
			if (pageCount > 5) {
				pageCount = 5;
			} else {
				oPaginationModel.setProperty("/nextBtnVisible", false);
			}

			for (var i = 1; i <= pageCount; i++) {
				var object = {
					"text": i
				};
				array.push(object);
			}

			oPaginationModel.setProperty("/counters", array);
			oPaginationModel.setProperty("/selectedPage", "1");
			oPaginationModel.refresh(true);
		},

		onScrollLeft: function() {

			var oPaginationModel = this.oPaginationModel;
			oPaginationModel.setProperty("/prevBtnVisible", true);
			oPaginationModel.setProperty("/nextBtnVisible", true);

			var paginatedData = oPaginationModel.getProperty("/counters");
			var selectedPage = parseInt(oPaginationModel.getProperty("/selectedPage"));
			var startValue = parseInt(paginatedData[0].text);
			var startNumber = 1;
			var array = [];

			if ((startValue - 1) === 1) {
				startNumber = 1;
				oPaginationModel.setProperty("/prevBtnVisible", false);
			} else {
				startNumber = selectedPage - 3;
			}

			for (var i = startNumber; i <= (startNumber + 4); i++) {
				var object = {
					"text": i
				};
				array.push(object);
			}
			oPaginationModel.setProperty('/counters', array);
			oPaginationModel.setProperty("/selectedPage", (selectedPage - 1));
		},

		onScrollRight: function() {

			var oPaginationModel = this.oPaginationModel;
			oPaginationModel.setProperty("/prevBtnVisible", true);
			oPaginationModel.setProperty("/nextBtnVisible", true);

			var selectedPage = parseInt(oPaginationModel.getProperty("/selectedPage"));
			var startNumber = 1;
			var array = [];
			if (selectedPage > 2) {
				if ((selectedPage + 3) >= oPaginationModel.getProperty("/numberOfPages")) {
					oPaginationModel.setProperty("/nextBtnVisible", false);
					startNumber = parseInt(oPaginationModel.getProperty("/numberOfPages")) - 4;
				} else {
					startNumber = selectedPage - 1;
				}
			} else {
				oPaginationModel.setProperty("/prevBtnVisible", false);
			}
			for (var i = startNumber; i <= (startNumber + 4); i++) {
				var object = {
					"text": i
				};
				array.push(object);
			}
			oPaginationModel.setProperty('/counters', array);
			oPaginationModel.setProperty("/selectedPage", (selectedPage + 1));
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf view.Dashboard11
		 */
		// onBeforeRendering: function() {
		//
		// },

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf view.Dashboard11
		 */
		// onAfterRendering: function() {
		//
		// },

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf view.Dashboard11
		 */
		// onExit: function() {
		//
		// }
	});
});