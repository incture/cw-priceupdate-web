sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/BusyDialog",
	"sap/ui/core/format/DateFormat"
], function(Controller, BusyDialog, oDateFormat) {
	"use strict";
	return Controller.extend("controller.ApprovalDetail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf price_update.detail
		 */
		onInit: function(oEvent) {
			this.busy = new BusyDialog();
			this.oHeader = {
				"Accept": "application/json",
				"Content-Type": "application/json"
			};
			this.setViewModel();
		},

		setViewModel: function(oEvent) {

			var oApprovalMatSectionModel = sap.ui.getCore().getModel("oApprovalMatSectionModel");
			this.oApprovalMatSectionModel = oApprovalMatSectionModel;

			var oAppDetModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oAppDetModel, "oAppDetModel");
			this.oAppDetModel = oAppDetModel;

			var oApprovalBusinessContextModel = sap.ui.getCore().getModel("oApprovalBusinessContextModel");
			this.oApprovalBusinessContextModel = oApprovalBusinessContextModel;

			var oNetPriceModel = sap.ui.getCore().getModel("oNetPriceModel");
			this.oNetPriceModel = oNetPriceModel;

			var oApprovalScaleModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oApprovalScaleModel, "oApprovalScaleModel");
			this.oApprovalScaleModel = oApprovalScaleModel;

			var oApprovalLineCmntModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oApprovalLineCmntModel, "oApprovalLineCmntModel");
			this.oApprovalLineCmntModel = oApprovalLineCmntModel;

			var i18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "./i18n/i18n.properties"
			});
			this.oResourceModel = i18nModel.getResourceBundle();

			this.selectedTabSPath = "";
			this.errorStateBVal = 0;
			this.selectedIconTab = "";
			this.isActive = "Active";
			this.isChanged = "eccView";
			this.conditionRecord = "";
		},

		getMaterialData: function(payload) {

			var that = this;
			this.oPayload = payload;
			var oApprovalMatSectionModel = this.oApprovalMatSectionModel;

			var oAppDetModel = this.oAppDetModel;
			oAppDetModel.setData(oApprovalMatSectionModel.getData());
			oAppDetModel.refresh();

			//Set first tab as default in condition record tab view on load.
			//	this.conditionRecord = oAppDetModel.getData().conditionTypes[0].conditionId;
			this.conditionRecord = oAppDetModel.getProperty("/conditionTypes/0/conditionId");
			that.setUIBusinessContext();
			that.getVariableKeyData();
			that.generateMatTableColumns();
			that.onIconBarSelect(this.conditionRecord);
			that.createHeaderComment();
		},

		//Binding contents for "Purchase Info Record" grid layout
		setUIBusinessContext: function() {

			var that = this;
			var oApprovalMatSectionModel = this.oApprovalMatSectionModel;
			var oAppDetModel = this.oAppDetModel;
			var oApprovalBusinessContextModel = this.oApprovalBusinessContextModel;
			var oInfoRecGrid = this.getView().byId("INFO_REC_GRID");
			oInfoRecGrid.bindAggregation("content", "oAppDetModel>/businessObjectList", function(index, context) {
				var contextPath = context.getPath();
				var oAppDetModel1 = context.getModel();
				var bindingPath = "oAppDetModel>" + contextPath;
				var sPath = "oAppDetModel>" + contextPath + "/boList";
				var currentObj = oAppDetModel1.getProperty(contextPath);

				var hasLabel = currentObj.hasOwnProperty("label");
				var hasFieldInput = currentObj.hasOwnProperty("boList");
				var fieldVisible = formatter.formatter.formatBooleanValues(currentObj.isVisible);

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
							formatter: formatter.formatter.formatBooleanValues
						},
						tooltip: "{" + bindingPath + "/label}",
						text: "{" + bindingPath + "/label}" + ":"
					}).addStyleClass('gridLblClass');
					oHBox.addItem(oLabel);

					var oItems = new sap.m.HBox();
					oItems.bindAggregation("items", sPath, function(index, context, currentObj) {
						var contextPath = context.getPath();
						var oAppDetModel1 = context.getModel();
						var sPath = "oAppDetModel>" + contextPath;
						var currentObj = oAppDetModel1.getProperty(contextPath);
						var fieldType = currentObj.uiFieldType;
						var index = "/" + contextPath.split("/")[1] + "/" + contextPath.split("/")[2];
						var parentObj = oAppDetModel1.getProperty(index);

						if (fieldType === "Text") {
							if (currentObj.fieldValueNew === currentObj.fieldValue) {
								var oVBox = new sap.m.VBox();
								var oNewText = new sap.m.Label({
									text: "{" + sPath + "/fieldValueNew}",
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatter.formatBooleanValues
									}
								}).addStyleClass("businessContextTextClass");
								oVBox.addItem(oNewText);
								return oVBox;
							} else {
								var oVBox = new sap.m.VBox();
								var oNewText = new sap.m.Label({
									text: "{" + sPath + "/fieldValueNew}",
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatter.formatBooleanValues
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
										formatter: formatter.formatter.formatBooleanValues
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

		getVariableKeyData: function() {

			var that = this;
			var oConditionRecordTbl = this.getView().byId("VARIABLE_KEY_TBL");
			// var oApprovalMatSectionModel = this.oApprovalMatSectionModel; commented by pavithra
			/** by pavithra-- to get the context properly**/
			var oAppDetModel = this.oAppDetModel;
			// 	oAppDetModel.setData(this.oApprovalMatSectionModel.getData());
			// oAppDetModel.refresh(true);
			oConditionRecordTbl.setModel(oAppDetModel);
			oConditionRecordTbl.bindAggregation("columns", "oAppDetModel>/headerListDto", function(index, context) {

				var contextPath = context.getPath();
				var oModel = context.getModel();
				var sPath = "oAppDetModel>" + contextPath;
				var currentObj = oModel.getProperty(contextPath);
				var fieldType = currentObj.uiFieldType;
				var fieldVisible = formatter.formatter.formatBooleanValues(currentObj.isVisible);
				var oColumn = new sap.m.Column({
					header: new sap.m.Text({
						text: "{" + sPath + "/label}"
					}).addStyleClass("matTblHdrClass"),
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatter.formatBooleanValues
					}
				});
				return oColumn;
			});

			oConditionRecordTbl.bindItems("oAppDetModel>/headerRecords", function(index, context) {
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

		generateMatTableColumns: function() {

			var that = this;
			// var oApprovalMatSectionModel = this.oApprovalMatSectionModel;//commented by pavithra 
			var oAppDetModel = this.oAppDetModel;

			var oMatTable = this.getView().byId("PRICE_UPDATE_MAT_TABLE");
			oMatTable.setModel("oAppDetModel");
			oMatTable.bindAggregation("columns", "oAppDetModel>/tableColumn", function(index, context) {

				var contextPath = context.getPath();
				var model = context.getModel();
				var sPath = "oAppDetModel>" + contextPath;
				var oColumn = new sap.m.Column({
					hAlign: "Center",
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatter.formatBooleanValues
					},
					header: new sap.m.Text({
						wrapping: true,
						text: {
							path: sPath + "/label",
							formatter: formatter.formatter.formatColumnWidth
						}
					}).addStyleClass("TableHdrTxtClass")
				});
				return oColumn;
			});
		},

		onIconBarSelect: function(oEvent) {

			var that = this;
			if (typeof(oEvent) === "string") {
				var selectedIconTab = oEvent;
				this.selectedIconTab = selectedIconTab;
			} else {
				var selectedIconTab = oEvent.getSource().getSelectedKey();
				this.selectedIconTab = selectedIconTab;
			}
			this.conditionRecord = this.selectedIconTab;
			// var oApprovalMatSectionModel = this.oApprovalMatSectionModel;
			var oAppDetModel = this.oAppDetModel;
			// 	var oAppDetModel = this.getView().getModel("oAppDetModel");
			// 	oAppDetModel.setData(this.oApprovalMatSectionModel.getData());
			// oAppDetModel.refresh(true);

			var oMatTable = this.getView().byId("PRICE_UPDATE_MAT_TABLE");
			var getSelectedTabSPath = this.getSelectedTabSPath(selectedIconTab);
			if (getSelectedTabSPath.length) {
				var sPath = getSelectedTabSPath[0];
				this.selectedTabSPath = sPath;
				oMatTable.bindAggregation("items", "oAppDetModel>/conditionTypesRecords/entry/" + sPath + "/value/listMatrialInfoRecord",
					function(index, context) {
						var contextPath = context.getPath();
						var model = context.getModel();
						var property = model.getProperty(contextPath).tableColumnRecords;
						if (property) {
							contextPath = contextPath + "/tableColumnRecords";
						}
						var row = new sap.m.ColumnListItem();
						var sPath = "oAppDetModel>" + contextPath;
						row.bindAggregation("cells", sPath, function(index, context) {
							var model = context.getModel();
							var sPath = context.getPath();
							var bindingPath = "oAppDetModel>" + sPath;
							var cuurentObj = model.getProperty(sPath);
							var fieldVisible = formatter.formatter.formatBooleanValues(cuurentObj.isVisible);
							if (fieldVisible) {
								if (cuurentObj.uiFieldType === "Input") {
									if (cuurentObj.fieldValueNew === cuurentObj.fieldValue) {
										var oNewInput = new sap.m.Input({
											value: "{" + bindingPath + "/fieldValueNew}",
											maxLength: {
												path: bindingPath + "/fieldLength",
												formatter: formatter.formatter.formatMaxLength
											},
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatter.formatBooleanValues
											},
											showSuggestion: {
												path: bindingPath + "/isLookup",
												formatter: formatter.formatter.formatBooleanValues
											},
											valueState: {
												path: bindingPath + "/valueState",
												formatter: formatter.formatter.formaValueState
											},
											width: "100%"
										}).addStyleClass("inputBaseClass noBorder apprvInputBaseClass sapUiSizeCompact");
										var oCustomData = new sap.ui.core.CustomData({
											key: "{" + bindingPath + "/fieldType}",
											value: "{" + bindingPath + "/fieldId}"
										});
										oNewInput.addCustomData(oCustomData);
										return oNewInput;
									} else {
										var oVBox = new sap.m.VBox();
										var oNewInput = new sap.m.Input({
											value: "{" + bindingPath + "/fieldValueNew}",
											maxLength: {
												path: bindingPath + "/fieldLength",
												formatter: formatter.formatter.formatMaxLength
											},
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatter.formatBooleanValues
											},
											showSuggestion: {
												path: bindingPath + "/isLookup",
												formatter: formatter.formatter.formatBooleanValues
											},
											valueState: {
												path: bindingPath + "/valueState",
												formatter: formatter.formatter.formaValueState
											},
											width: "100%"
										}).addStyleClass("inputBaseClass noBorder apprvInputBaseClass sapUiSizeCompact");

										var oNewCustomData = new sap.ui.core.CustomData({
											key: "{" + bindingPath + "/fieldType}",
											value: "{" + bindingPath + "/fieldId}"
										});
										oNewInput.addCustomData(oNewCustomData);
										oVBox.addItem(oNewInput);

										var oHBox = new sap.m.HBox();
										oHBox.addStyleClass("horizonatlLineStyleClass");
										oVBox.addItem(oHBox);

										var oInput = new sap.m.Input({
											value: "{" + bindingPath + "/fieldValue}",
											maxLength: {
												path: bindingPath + "/fieldLength",
												formatter: formatter.formatter.formatMaxLength
											},
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatter.formatBooleanValues
											},
											showSuggestion: {
												path: bindingPath + "/isLookup",
												formatter: formatter.formatter.formatBooleanValues
											},
											valueState: {
												path: bindingPath + "/valueState",
												formatter: formatter.formatter.formaValueState
											},
											width: "100%"
										}).addStyleClass("inputBaseClass noBorder apprvInputBaseClass sapUiSizeCompact oldValueColor");

										var oCustomData = new sap.ui.core.CustomData({
											key: "{" + bindingPath + "/fieldType}",
											value: "{" + bindingPath + "/fieldId}"
										});
										oInput.addCustomData(oCustomData);
										oVBox.addItem(oInput);
										return oVBox;
									}
								} else if (cuurentObj.uiFieldType === "Link") {
									var oVBox = new sap.m.VBox();
									var oNewLink = new sap.m.Link({
										text: "{" + bindingPath + "/fieldValueNew}",
										visible: {
											path: bindingPath + "/isVisible",
											formatter: formatter.formatter.formatBooleanValues
										},
										enabled: {
											path: bindingPath + "/isEditable",
											formatter: formatter.formatter.formatBooleanValues
										}
									}).addStyleClass("cellBground");
									oVBox.addItem(oNewLink);

									var oHBox = new sap.m.HBox();
									oHBox.addStyleClass("horizonatlLineStyleClass");
									oVBox.addItem(oHBox);

									var oLink = new sap.m.Link({
										text: "{" + bindingPath + "/fieldValue}",
										visible: {
											path: bindingPath + "/isVisible",
											formatter: formatter.formatter.formatBooleanValues
										},
										enabled: {
											path: bindingPath + "/isEditable",
											formatter: formatter.formatter.formatBooleanValues
										}
									}).addStyleClass("cellBground oldValueColor");
									oVBox.addItem(oLink);
									oVBox.onclick = function(oEvent) {
										that.openScaleDetails(oEvent);
									};
									return oVBox;
								} else if (cuurentObj.uiFieldType === "Vbox") {
									var oImage = new sap.m.Image({
										src: {
											path: bindingPath + "/colorCode",
											formatter: formatter.formatter.setImageColorMode
										}
									});
									return oImage;
								} else if (cuurentObj.uiFieldType === "Button") {
									if (cuurentObj.fieldId === "Comment") {
										var oCmntBtn = new sap.m.Button({
											type: "Transparent",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatter.formatBooleanValues
											},
											icon: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatter.commentIconChang
											},
											press: function(oEvent) {
												that.openCommentBox(oEvent);
											}
										}).addStyleClass("cellBground");
										return oCmntBtn;
									} else {
										var oButton = new sap.m.Button({
											type: "Transparent",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatter.formatBooleanValues
											}

										}).addStyleClass("cellBground");
										return oButton;
									}
								} else if (cuurentObj.uiFieldType === "Text") {
									if (cuurentObj.fieldValueNew === cuurentObj.fieldValue) {
										var oNewText = new sap.m.Text({
											text: "{" + bindingPath + "/fieldValueNew}",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatter.formatBooleanValues
											}
										}).addStyleClass("cellBground");
										return oNewText;
									} else {
										var oVBox = new sap.m.VBox();
										var oNewText = new sap.m.Text({
											text: "{" + bindingPath + "/fieldValueNew}",
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatter.formatBooleanValues
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
												formatter: formatter.formatter.formatBooleanValues
											}
										}).addStyleClass("cellBground oldValueColor");
										oVBox.addItem(oText);
										return oVBox;
									}
								} else if (cuurentObj.uiFieldType === "Date") {
									if (cuurentObj.fieldValueNew === cuurentObj.fieldValue) {
										var oNewDate = new sap.m.DatePicker({
											displayFormat: "MM/dd/yyyy",
											value: {
												path: bindingPath + "/fieldValueNew",
												formatter: formatter.formatter.formatApprovalDateValues
											},
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatter.formatBooleanValues
											},
											valueState: {
												path: bindingPath + "/valueState",
												formatter: formatter.formatter.formaValueState
											}
										}).addStyleClass("forDateCSS noBorder sapUiSizeCompact apprvInputBaseClass");
										var oNewCustomData = new sap.ui.core.CustomData({
											key: "{" + bindingPath + "/dateOrder}"
										});
										oNewDate.addCustomData(oNewCustomData);
										return oNewDate;
									} else {
										var oVBox = new sap.m.VBox();
										var oNewDate = new sap.m.DatePicker({
											displayFormat: "MM/dd/yyyy",
											value: {
												path: bindingPath + "/fieldValueNew",
												formatter: formatter.formatter.formatApprovalDateValues
											},
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatter.formatBooleanValues
											},
											valueState: {
												path: bindingPath + "/valueState",
												formatter: formatter.formatter.formaValueState
											}
										}).addStyleClass("forDateCSS noBorder sapUiSizeCompact apprvInputBaseClass");
										var oNewCustomData = new sap.ui.core.CustomData({
											key: "{" + bindingPath + "/dateOrder}"
										});
										oNewDate.addCustomData(oNewCustomData);
										oVBox.addItem(oNewDate);

										var oHBox = new sap.m.HBox();
										oHBox.addStyleClass("horizonatlLineStyleClass");
										oVBox.addItem(oHBox);

										var oDate = new sap.m.DatePicker({
											displayFormat: "MM/dd/yyyy",
											value: {
												path: bindingPath + "/fieldValue",
												formatter: formatter.formatter.formatApprovalDateValues
											},
											visible: {
												path: bindingPath + "/isVisible",
												formatter: formatter.formatter.formatBooleanValues
											},
											enabled: {
												path: bindingPath + "/isEditable",
												formatter: formatter.formatter.formatBooleanValues
											},
											valueState: {
												path: bindingPath + "/valueState",
												formatter: formatter.formatter.formaValueState
											}
										}).addStyleClass("forDateCSS noBorder sapUiSizeCompact oldValueColor apprvInputBaseClass");
										var oCustomData = new sap.ui.core.CustomData({
											key: "{" + bindingPath + "/dateOrder}"
										});
										oDate.addCustomData(oCustomData);
										oVBox.addItem(oDate);
										return oVBox;
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

		getSelectedTabSPath: function(selIconTab) {
			// var oApprovalMatSectionModel = this.oApprovalMatSectionModel;
			var oAppDetModel = this.oAppDetModel;
			// 	oAppDetModel.setData(this.oApprovalMatSectionModel.getData());
			// oAppDetModel.refresh(true);

			var oSearchArry = oAppDetModel.getData().conditionTypesRecords.entry;
			if (oSearchArry) {
				for (var i = 0; i < oSearchArry.length; i++) {
					if (selIconTab === oSearchArry[i].key) {
						return [i, true];
					}
				}
				return false;
			}
		},

		openScaleDetails: function(oEvent) {

			// var oApprovalMatSectionModel = this.oApprovalMatSectionModel;
			var oAppDetModel = this.oAppDetModel;
			var oApprovalScaleModel = this.oApprovalScaleModel;
			var sPath = oEvent.srcControl.getBindingContext("oAppDetModel").sPath;
			oApprovalScaleModel.getData().sPath = sPath;
			oApprovalScaleModel.refresh(true);
			var selectedObj = oAppDetModel.getProperty(sPath);
			var bVal = selectedObj.hasOwnProperty("scaleDataList");
			if (bVal) {
				if (!this._oDialog) {
					this._oDialog = sap.ui.xmlfragment("fragment.approvalScales", this);
				}

				this.setScaleDialogTableData(sPath);
				this.getView().addDependent(this._oDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
				this._oDialog.open();
			} else {
				sap.m.MessageToast.show("No Scale Data");
			}

		},

		setScaleDialogTableData: function(sPath) {

			var that = this;
			// var oApprovalMatSectionModel = this.oApprovalMatSectionModel;
			var oAppDetModel = this.oAppDetModel;
			var oScaleTable = this._oDialog.getContent()[0].getContent()[0];
			oScaleTable.bindAggregation("columns", "oAppDetModel>" + sPath + "/scaleColumnList", function(index, context) {
				var contextPath = context.getPath();
				var sPath = "oAppDetModel>" + contextPath;
				var oColumn = new sap.m.Column({
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatter.formatBooleanValues
					},
					header: new sap.m.Text({
						wrapping: true,
						text: "{" + sPath + "/scaleColName}"
					}).addStyleClass("scaleColHdrStyle")
				});
				return oColumn;
			});

			oScaleTable.bindAggregation("items", "oAppDetModel>" + sPath + "/scaleDataList", function(index, context) {
				var contextPath = context.getPath();
				var model = context.getModel();
				var property = model.getProperty(contextPath).parameterList;
				if (property) {
					contextPath = contextPath + "/parameterList";
				}
				var sPath = "oAppDetModel>" + contextPath;

				var oRow = new sap.m.ColumnListItem();
				oRow.bindAggregation("cells", sPath, function(index, context) {
					var model = context.getModel();
					var contextPath = context.getPath();
					var sPath = "oAppDetModel>" + contextPath;
					var cuurentObj = model.getProperty(contextPath);
					var fieldVisible = formatter.formatter.formatBooleanValues(cuurentObj.isVisible);
					if (fieldVisible) {
						if (cuurentObj.uiFieldType === "Input") {

							if (cuurentObj.fieldValueNew === cuurentObj.fieldValue || cuurentObj.fieldValue === "") {
								var oNewInput = new sap.m.Input({
									value: "{" + sPath + "/fieldValueNew}",
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatter.formatBooleanValues
									},
									enabled: {
										path: sPath + "/isEditable",
										formatter: formatter.formatter.formatBooleanValues
									},
									width: "100%"
								}).addStyleClass("inputBaseClass noBorder apprvInputBaseClass sapUiSizeCompact");
								var oNewCustomData = new sap.ui.core.CustomData({
									key: "{" + sPath + "/fieldType}",
									value: "{" + sPath + "/fieldId}"
								});
								oNewInput.addCustomData(oNewCustomData);
								return oNewInput;
							} else {
								var oVBox = new sap.m.VBox();
								var oNewInput = new sap.m.Input({
									value: "{" + sPath + "/fieldValueNew}",
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatter.formatBooleanValues
									},
									enabled: {
										path: sPath + "/isEditable",
										formatter: formatter.formatter.formatBooleanValues
									},
									width: "100%"
								}).addStyleClass("inputBaseClass noBorder apprvInputBaseClass sapUiSizeCompact");

								var oNewCustomData = new sap.ui.core.CustomData({
									key: "{" + sPath + "/fieldType}",
									value: "{" + sPath + "/fieldId}"
								});
								oNewInput.addCustomData(oNewCustomData);
								oVBox.addItem(oNewInput);
								var oHBox = new sap.m.HBox();
								oHBox.addStyleClass("horizonatlLineStyleClass");
								oVBox.addItem(oHBox);

								var oInput = new sap.m.Input({
									value: "{" + sPath + "/fieldValue}",
									visible: {
										path: sPath + "/isVisible",
										formatter: formatter.formatter.formatBooleanValues
									},
									enabled: {
										path: sPath + "/isEditable",
										formatter: formatter.formatter.formatBooleanValues
									},
									width: "100%"
								}).addStyleClass("inputBaseClass noBorder apprvInputBaseClass sapUiSizeCompact oldValueColor");

								var oCustomData = new sap.ui.core.CustomData({
									key: "{" + sPath + "/fieldType}",
									value: "{" + sPath + "/fieldId}"
								});
								oInput.addCustomData(oCustomData);
								oVBox.addItem(oInput);
								return oVBox;
							}

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
		},

		onCloseFilterOptionsDialogConfirm: function() {
			this._oDialog.close();
		},

		setConditionRecordOnChangeMode: function(oEvent) {

			var that = this;
			var record = this.isActive;
			var conditionText = oEvent.getSource().getKey();
			if (conditionText === "ALL") {
				this.isActive = record;
				this.isChanged = "ALL";
			} else if (conditionText === "ECC_RECORDS") {
				this.isActive = record;
				this.isChanged = "eccView";
			} else if (conditionText === "Change") {
				this.isActive = record;
				this.isChanged = "CHANGE";
			}

			var oMasterController = that.getView().getParent().getParent().getMasterPage("APPRV_MASTER").getController();
			oMasterController.setPayloadData(that.isActive, that.isChanged);
		},

		onStatusUpdate: function(oEvent) {
			var that = this;
			//this.busy.open();
			var statusText = oEvent.getSource().getKey();

			var changeRecord = this.isChanged;
			if (statusText === "Active") {
				this.isActive = "Active";
				this.isChanged = changeRecord;
			} else {
				this.isActive = "Inactive";
				this.isChanged = changeRecord;
			}

			var oMasterController = that.getView().getParent().getParent().getMasterPage("APPRV_MASTER").getController();
			oMasterController.setPayloadData(that.isActive, that.isChanged);
		},

		openCommentBox: function(oEvent) {
			// var oApprovalMatSectionModel = this.oApprovalMatSectionModel;
			var oAppDetModel = this.oAppDetModel;
			var oApprovalLineCmntModel = this.oApprovalLineCmntModel;
			var sPath = oEvent.getSource().getBindingContext("oAppDetModel").getPath();
			var selectedObj = oAppDetModel.getProperty(sPath);
			var commentList = selectedObj.commentList;
			if (!Array.isArray(commentList)) {
				var oTempArry = [];
				oTempArry.push(commentList);
				commentList = oTempArry;
			}

			oApprovalLineCmntModel.getData().commentList = commentList;
			oApprovalLineCmntModel.getData().sPath = sPath;
			if (!this._oCommentDialog) {
				this._oCommentDialog = sap.ui.xmlfragment("fragment.comments", this);
			}
			this.getView().addDependent(this._oCommentDialog);
			this.createLineComment();
			this._oCommentDialog.open();
		},

		onOkCommentBox: function(oEvent) {
			// var oApprovalMatSectionModel = this.oApprovalMatSectionModel;
			var oAppDetModel = this.oAppDetModel;
			var conditionRecords = this.conditionRecord;
			this.onIconBarSelect(conditionRecords);
			this._oCommentDialog.close();
		},

		onCloseCommentBox: function(oEvent) {
			this._oCommentDialog.close();
		},

		createLineComment: function() {
			var that = this;
			var oApprovalMatSectionModel = that.oApprovalMatSectionModel;
			var oApprovalLineCmntModel = that.oApprovalLineCmntModel;
			var oCommentVBox = sap.ui.getCore().byId("LINE_CMNT_BOX");
			oCommentVBox.bindAggregation("items", "oApprovalLineCmntModel>/commentList", function(index, context) {
				var contextPath = context.getPath();
				var oApprovalLineCmntModel = context.getModel();
				var sPath = "oApprovalLineCmntModel>" + contextPath;
				var oVBox = new sap.m.VBox();
				var oToolbar = new sap.m.Toolbar();
				var oLabel = new sap.m.Label({
					required: {
						path: sPath + "/isMandatory",
						formatter: formatter.formatter.formatBooleanValues
					},
					tooltip: "{" + sPath + "/label}",
					text: "{" + sPath + "/label}",
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatter.formatBooleanValues
					}
				}).addStyleClass("cmntLblClass");
				oToolbar.addContent(oLabel);
				oToolbar.addStyleClass("toolbarClass");
				oVBox.addItem(oToolbar);
				var oTextArea = new sap.m.TextArea({
					required: {
						path: sPath + "/isMandatory",
						formatter: formatter.formatter.formatBooleanValues
					},
					tooltip: "{" + sPath + "/fieldValue}",
					value: "{" + sPath + "/fieldValue}",
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatter.formatBooleanValues
					},
					enabled: {
						path: sPath + "/isEditable",
						formatter: formatter.formatter.formatBooleanValues
					}
				}).addStyleClass("lineCommentBoxStyle");
				oVBox.addItem(oTextArea);
				oVBox.addStyleClass("approverCmntStle");
				return oVBox;
			});
		},

		createHeaderComment: function() {
			var that = this;
			var oAppDetModel = this.oAppDetModel;
			var oCommentVBox = this.getView().byId("HEADER_CMNT_BOX");
			oCommentVBox.bindAggregation("items", "oAppDetModel>/headerCommentsList", function(index, context) {
				var contextPath = context.getPath();
				var oApprovalMatSectionModel = context.getModel(); //please use oAppDetModel if daata is not coming 
				var sPath = "oAppDetModel>" + contextPath;
				var oVBox = new sap.m.VBox({
					width: "50%"
				});
				var oToolbar = new sap.m.Toolbar();
				var oLabel = new sap.m.Label({
					required: {
						path: sPath + "/isMandatory",
						formatter: formatter.formatter.formatBooleanValues
					},
					tooltip: "{" + sPath + "/label}",
					text: "{" + sPath + "/label}",
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatter.formatBooleanValues
					}
				}).addStyleClass("cmntLblClass");
				oToolbar.addContent(oLabel);
				oToolbar.addStyleClass("toolbarClass");
				oVBox.addItem(oToolbar);
				var oTextArea = new sap.m.TextArea({
					width: "75%",
					required: {
						path: sPath + "/isMandatory",
						formatter: formatter.formatter.formatBooleanValues
					},
					tooltip: "{" + sPath + "/fieldValue}",
					value: "{" + sPath + "/fieldValue}",
					visible: {
						path: sPath + "/isVisible",
						formatter: formatter.formatter.formatBooleanValues
					},
					enabled: {
						path: sPath + "/isEditable",
						formatter: formatter.formatter.formatBooleanValues
					}
				}).addStyleClass("commentBoxStyle sapUiSizeCompact");
				oVBox.addItem(oTextArea);
				oVBox.addStyleClass("approverCmntStle");
				return oVBox;
			});
		},

		getNetPrice: function(oEvent) {
			var oTable = this.getView().byId("TABLEOFMATERIAL");
			oTable.setVisible(false);
			var oVBox = this.getView().byId("NETPRICEDATA");
			oVBox.setVisible(true);

			if (!this._oNetPrice) {
				this._oNetPrice = sap.ui.xmlfragment("fragment.netPriceAnalysis", this);
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
					formatter.formatter.toastMessage(errorText);
					//that.busy.close();
				}
			});
			oModel.attachRequestFailed(function(oEvent) {
				var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
				formatter.formatter.toastMessage(errorText);
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
						header: new sap.m.Text({
							wrapping: true,
							text: "{" + sPath + "/label}"
						}).addStyleClass("TableHdrTxtClass matTblHdrClass")
					});
					return oColumn;
				});
				oTable.bindItems("oNetPriceModel>" + contextPath + "/listOfValues", function(index, context) {
					var contextsPath = context.getPath();
					var model = context.getModel();
					var row = new sap.m.ColumnListItem();
					var sPath = "oNetPriceModel>" + contextsPath + "/parameterList";
					row.bindAggregation("cells", sPath, function(index, context) {
						var model = context.getModel();
						var sPath = context.getPath();
						var bindingPath = "oNetPriceModel>" + sPath;
						var cuurentObj = model.getProperty(sPath);
						var fieldVisible = formatter.formatter.formatBooleanValues(cuurentObj.isVisible);
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
					});
					return row;
				});
				oTable.addStyleClass("materialTblClass sapUiSizeCompact");
				oVBox.addItem(oTable);
				return oVBox;
			});

		},

		getPayloadData: function() {
			var payload = this.oPayload;
			var oPayload = {
				"requestId": payload.requestId,
				"variableKey": payload.vkey
			};
			return oPayload;
		},

		onValidateECC: function() {

			var that = this;
			this.busy.open();
			var payload = this.oPayload;

			var sUrl = "/CWPRICE_WEB/record/validate";
			var oPayload = {};
			oPayload.requestId = payload.requestId;
			oPayload.inputList = [{
				"decisionTable": "A017",
				"variableKey": payload.vkey
			}];

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(sUrl, JSON.stringify(oPayload), true, "POST", false, false, that.oHeader);
			oModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					that.onCompleteTask(true);
				} else {
					var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
					formatter.formatter.toastMessage(errorText);
				}
				that.busy.close();
			});

			oModel.attachRequestFailed(function(oEvent) {
				var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
				formatter.formatter.toastMessage(errorText);
				that.busy.close();
			});
		},

		onApproveRejectTask: function(oEvent) {
			var oBtnText = oEvent.getSource().getText();
			if (oBtnText === "Approve") {
				this.onValidateECC();
			} else {
				this.onCompleteTask(false);
			}
		},

		_fetchToken: function() {
			var token;
			$.ajax({
				url: "/destination/bpmworkflowruntime/workflow-service/rest/v1/xsrf-token",
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function(result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
				}
			});
			return token;
		},

		onCompleteTask: function(bValApprvReject) {

			var that = this;
			var token = this._fetchToken();
			var taskId = jQuery.sap.getUriParameters().mParams.taskId[0];
			var requestId = jQuery.sap.getUriParameters().mParams.requestId[0];

			/*var data = {
				"context": {
					"requestId": "21",
					"decisionTable": "table",
					"usage": "A",
					"application": "M",
					"requestedBy": "approved",
					"approvars": ["S0016270146"],
					"isApprove": true
				}
			};*/

			var oUserModel = sap.ui.getCore().getModel("user");
			var data = {
				"context": {
					"isApproved": bValApprvReject
				},
				"status": "COMPLETED",
				"approverDetail": oUserModel.getData()
			};

			$.ajax({
				url: "/destination/bpmworkflowruntime/workflow-service/rest/v1/task-instances/" + taskId,
				method: "PATCH",
				contentType: "application/json",
				async: true,
				data: data, //"{\"status\": \"COMPLETED\", \"context\": {\"isApproved\":" + bValApprvReject + "}}",
				headers: {
					"X-CSRF-Token": token
				},
				success: function() {
					// that.updateStatus(approvalStatus);
					if (bValApprvReject === true) {
						var statusText = that.oResourceModel.getText("TASK_APPROVED");
						formatter.formatter.toastMessage(statusText);
						that.updateJavaLayer("approve", requestId);
					} else {
						var statusText = that.oResourceModel.getText("TASK_REJECTED");
						formatter.formatter.toastMessage(statusText);
						that.updateJavaLayer("reject", requestId);
					}
				},
				error: function(errMsg) {
					var msg = errMsg.statusText;
					formatter.formatter.toastMessage("XSRF token request didn't work: " + msg);
				}
			});
		},

		//Called on approve/reject of the task to update the java layer
		updateJavaLayer: function(serviceType, requestId) {

				var that = this;
				this.busy.open();
				var sUrl = "/CWPRICE_WEB/record/" + serviceType;
				var oApprovalMatSectionModel = this.oApprovalMatSectionModel;
				var variableKey = oApprovalMatSectionModel.getData().vkey;
				var oUserModel = sap.ui.getCore().getModel("user");

				var oPayload = {
					"requestId": requestId,
					"variableKey": variableKey,
					"approverDetail": oUserModel.getData()
				};

				var oModel = new sap.ui.model.json.JSONModel();
				oModel.loadData(sUrl, JSON.stringify(oPayload), true, "POST", false, false, that.oHeader);
				oModel.attachRequestCompleted(function(oEvent) {
					if (oEvent.getParameter("success")) {

					}
					that.busy.close();
				});

				oModel.attachRequestFailed(function(oEvent) {
					var errorText = that.oResourceModel.getText("INTERNAL_SERVER_ERROR");
					formatter.formatter.toastMessage(errorText);
					that.busy.close();
				});
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf price_update.detail
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf price_update.detail
		 */
		/*	onAfterRendering: function() {
		}*/
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf price_update.detail
		 */
		//	onExit: function() {
		//
		//	}
	});
});