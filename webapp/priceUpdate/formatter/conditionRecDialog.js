jQuery.sap.declare("com.incture.formatter.conditionRecDialog");
com.incture.formatter.conditionRecDialog = {
		
	showChangedConditionRec: function(oParamObject, oSplitRecordsModel, oMatSectionModel, detailsController, sPath, currentObject){
		
		this.formatter = com.incture.formatter.formatter;
		if(oParamObject.indices.length){
			var items = [];
			var that = this;
			var oChangeType = oParamObject.changeType;
			var oColumnHeader = oMatSectionModel.getData().pricelistTblCol;
			
			switch (oChangeType){
			case "OVERLAP": 
				var oTempObj1 = {};
				oTempObj1.tableVisible = true;
				oTempObj1.radioBtnSelected = true;
				oTempObj1.radioBtnText = "Overwrite the existing condition record";
				oTempObj1.rows = oParamObject.affectedRecords;
				oTempObj1.columns = oColumnHeader;
				oTempObj1.newConditionRecords = oParamObject.newConditionRecords;
				oTempObj1.currentObject = currentObject;
				oTempObj1.type = "OVERLAP";
				items.push(oTempObj1);
					
				var oTempObj2 = {};
				oTempObj2.tableVisible = true;
				oTempObj2.radioBtnSelected = false;
				oTempObj2.radioBtnText = "Keep the existing condition record as is and ignore the  new entry";
				oTempObj2.rows = oParamObject.exisitngRecords;
				oTempObj2.columns = oColumnHeader;
				if(oParamObject.bVal){
					oTempObj2.newConditionRecords = oParamObject.unchangedRecords;	
				}else{
					oTempObj2.newConditionRecords = oParamObject.exisitngRecords;
				}
				items.push(oTempObj2);
				break;
				
			case "NEW_RECORD":
				var oTempObj1 = {};
				oTempObj1.tableVisible = true;
				oTempObj1.radioBtnSelected = true;
				oTempObj1.radioBtnText = "New condition record is added";
				oTempObj1.rows = oParamObject.affectedRecords;
				oTempObj1.columns = oColumnHeader;
				oTempObj1.newConditionRecords = oParamObject.newConditionRecords;
				oTempObj1.currentObject = currentObject;
				oTempObj1.type = "NEW_RECORD";
				items.push(oTempObj1);
					
				var oTempObj2 = {};
				oTempObj2.radioBtnSelected = false;
				if(oParamObject.bVal){
					oTempObj2.newConditionRecords = oParamObject.unchangedRecords;	
				}else{
					oTempObj2.newConditionRecords = oParamObject.exisitngRecords;
				}
				
				if(oTempObj2.newConditionRecords.length){
					oTempObj2.tableVisible = true;
					oTempObj2.radioBtnText = "Keep the existing condition record as is and ignore the  new entry";
					oTempObj2.rows = oParamObject.exisitngRecords;
					oTempObj2.columns = oColumnHeader;
					items.push(oTempObj2);
				}else{
					oTempObj2.tableVisible = false;
					oTempObj2.radioBtnText = "Ignore the  new entry";
					items.push(oTempObj2);
				}
				break;
				
			case "PARTIAL_OVERLAP":
				var oTempObj1 = {};
				oTempObj1.tableVisible = true;
				oTempObj1.radioBtnSelected = true;
				oTempObj1.radioBtnText = "Extending the existing condition record's start date";
				oTempObj1.rows = oParamObject.affectedRecords;
				oTempObj1.columns = oColumnHeader;
				oTempObj1.newConditionRecords = oParamObject.newConditionRecords;
				oTempObj1.currentObject = currentObject;
				oTempObj1.type = "PARTIAL_OVERLAP";
				items.push(oTempObj1);
				
				var oTempObj2 = {};
				oTempObj2.tableVisible = true;
				oTempObj2.radioBtnSelected = false;
				oTempObj2.radioBtnText = "Keep the existing condition record as is and ignore the  new entry";
				oTempObj2.rows = oParamObject.exisitngRecords;
				oTempObj2.columns = oColumnHeader;
				if(oParamObject.bVal){
					oTempObj2.newConditionRecords = oParamObject.unchangedRecords;	
				}else{
					oTempObj2.newConditionRecords = oParamObject.exisitngRecords;
				}
				items.push(oTempObj2);
				break;
					
			case "SPLIT_RECORD":
				var oTempObj1 = {};
				oTempObj1.tableVisible = true;
				oTempObj1.radioBtnSelected = true;
				oTempObj1.radioBtnText = "Existing condition record is split";
				oTempObj1.rows = oParamObject.affectedRecords;
				oTempObj1.columns = oColumnHeader;
				oTempObj1.newConditionRecords = oParamObject.newConditionRecords;
				oTempObj1.currentObject = currentObject;
				oTempObj1.type = "SPLIT_RECORD";
				items.push(oTempObj1);
					
				var oTempObj2 = {};
				oTempObj2.tableVisible = true;
				oTempObj2.radioBtnSelected = false;
				oTempObj2.radioBtnText = "Keep the existing condition record as is and ignore the  new entry";
				oTempObj2.rows = oParamObject.exisitngRecords;
				oTempObj2.columns = oColumnHeader;
				if(oParamObject.bVal){
					oTempObj2.newConditionRecords = oParamObject.unchangedRecords;	
				}else{
					oTempObj2.newConditionRecords = oParamObject.exisitngRecords;
				}
				items.push(oTempObj2);
				break;
			};
			
			//store sPath in undo model to do undo
			var selectedIconTab = detailsController.selectedIconTab;
			var undoModel = detailsController.oUndoModel;
			var oPrevStateObj = jQuery.extend(true,[],oTempObj2.newConditionRecords);
			var oRecordNumber = com.incture.formatter.formatter.getConditionConditionRecNo(currentObject.tableColumnRecords);
			that.formatter.setPreviousStateObjects(sPath, "oMatSectionModel", oPrevStateObj, undoModel, "ARRAY", "NEW", "", "", "", "", selectedIconTab, oRecordNumber);
			undoModel.setProperty("/undoBtnEnabled", true);
			
			//oSplitRecordsModel.setProperty("/items", items);
			oSplitRecordsModel.getData().items = items;
			oSplitRecordsModel.refresh(true);
			
			var oFragContent = this.generateFragmentView(oSplitRecordsModel);
			if (!detailsController.priceList) {
				detailsController.priceList = sap.ui.xmlfragment('com.incture.fragment.priceList', detailsController);
				detailsController.getView().addDependent(detailsController.priceList);
			}
			detailsController.priceList.addContent(oFragContent);
			detailsController.priceList.open();
		}
	},
		
	generateFragmentView: function(oSplitRecordsModel){
			
		var that = this;
		var oVBox = new sap.m.VBox();
		oVBox.setModel(oSplitRecordsModel, "oSplitRecordsModel");
		oVBox.bindAggregation("items", "oSplitRecordsModel>/items", function(index, context) {
			var contextPath = context.getPath();
			var oVbox = new sap.m.VBox();
			var oRadioBtn = new sap.m.RadioButton({
				text: "{oSplitRecordsModel>radioBtnText}",
				selected: "{oSplitRecordsModel>radioBtnSelected}"	
			}); 
			oVbox.addItem(oRadioBtn);
			
			var oTable = new sap.m.Table({
				visible:"{oSplitRecordsModel>tableVisible}"
			});
			oTable.bindAggregation("columns", "oSplitRecordsModel>columns", function(index, context){
				var contextPath = context.getPath();
				var model = context.getModel();
				var sPath = "oSplitRecordsModel>" + contextPath;
				if(model.getProperty(contextPath).label === "Action"){
					var oColumn = new sap.m.Column({ 
						hAlign: "Center", visible: false,
						header: new sap.m.Text({
							wrapping: true,
							text: "{" + sPath + "/label}"
						}).addStyleClass("textClass")
					});
					return oColumn;
				}
				var oColumn = new sap.m.Column({
					hAlign: "Center",
					visible: { path: sPath + "/isVisible", formatter: that.formatter.formatBooleanValues},
					header: new sap.m.Text({
						wrapping: true,
						text: "{" + sPath + "/label}"
					}).addStyleClass("textClass")
				});
				return oColumn;
			});
				
			oTable.bindAggregation("items", "oSplitRecordsModel>rows", function(index, context){
				var contextPath = context.getPath();
				var oModel = context.getModel();
				var property = oModel.getProperty(contextPath).tableColumnRecords;
				if(property){
					contextPath = contextPath + "/tableColumnRecords";
				}
				var row = new sap.m.ColumnListItem();
				var sPath = "oSplitRecordsModel>" + contextPath;
				row.bindAggregation("cells", sPath, function(index, context){
					var oModel = context.getModel();
					var sPath = context.getPath();
					oModel.getProperty(sPath).status = "Available";
					oModel.getProperty(sPath).modelName = "oSplitRecordsModel";
					oModel.refresh();
					var bindingPath = "oSplitRecordsModel>" + sPath;
					var cuurentObj = oModel.getProperty(sPath);
					var fieldVisible = that.formatter.formatBooleanValues(cuurentObj.isVisible);
					if(fieldVisible){
						if(cuurentObj.uiFieldType === "Input"){
							var oInput = new sap.m.Input({
								value: "{" + bindingPath + "/fieldValueNew}", editable: false,
								maxLength: { path: bindingPath + "/fieldLength", formatter: that.formatter.formatMaxLength},
								visible: { path: bindingPath + "/isVisible", formatter: that.formatter.formatBooleanValues},
								showSuggestion: { path: bindingPath + "/isLookup", formatter: that.formatter.formatBooleanValues},
								valueState: { path: bindingPath + "/valueState", formatter: that.formatter.formaValueState},
								change: function(evt){
									that.onChangeSAPInput(evt);
								}
							}).addStyleClass("inputBaseClass inputBaseClass1");
							
							var oCustomData = new sap.ui.core.CustomData({
								key: "{" + bindingPath + "/fieldType}",
								value: "{" + bindingPath + "/fieldId}"
							});
							oInput.addCustomData(oCustomData);
							return oInput;
						}else if(cuurentObj.uiFieldType ==="Link"){
							var oLink = new sap.m.Link({
								text: "{" + bindingPath + "/fieldValueNew}",
								visible: { path: bindingPath + "/isVisible", formatter: that.formatter.formatBooleanValues},
								editable: false,
								press: function(oEvent){
									that.openScaleDetails(oEvent);
								}
							}).addStyleClass("inputBaseClass inputBaseClass1");
							return oLink;
						}else if(cuurentObj.uiFieldType ==="Text"){
							var oText = new sap.m.Text({
								text:"{" + bindingPath + "/fieldValueNew}",
								visible: { path: bindingPath + "/isVisible", formatter: that.formatter.formatBooleanValues},
							}).addStyleClass("inputBaseClass inputBaseClass1");
							return oText;
						}else if(cuurentObj.uiFieldType ==="Date"){
							var oDate = new sap.m.DatePicker({
								editable: false,
								value: "{" + bindingPath + "/fieldValueNew}",
								//value: {  parts : [ bindingPath + "/fieldValueNew", bindingPath + "/status", bindingPath + "/modelName"], formatter: that.formatter.formatDateValues},
								visible: { path: bindingPath + "/isVisible", formatter: that.formatter.formatBooleanValues},
								valueState: { path: bindingPath + "/valueState", formatter: that.formatter.formaValueState},
								change: function(oEvent){
									that.onChangeSAPDatePicker(oEvent);
								}
							}).addStyleClass("inputBaseClass inputBaseClass1");
							var oCustomData = new sap.ui.core.CustomData({
								key: "{" + bindingPath + "/dateOrder}"
							});
							oDate.addCustomData(oCustomData);
							return oDate;
						}else if(cuurentObj.uiFieldType ==="Button"){
							var oDeleteBtn = new sap.m.Button({
								type: "Transparent", icon: "sap-icon://delete",
							}).addStyleClass("inputBaseClass inputBaseClass1");
							return oDeleteBtn;
						}else if(cuurentObj.fieldId ==="COLOR"){
							var oLabel = new sap.m.Label({visible:false});
							return oLabel;
						}
					}else{
						var oLabel = new sap.m.Label({visible:false});
						return oLabel;
					}
				});
				return row;
			});
			oVbox.addItem(oTable);
			
			var oHorizontalLine = new sap.ui.core.HTML({ class: "horizontalLine1" });
			oVbox.addItem(oHorizontalLine);
			return oVbox
		});
		return oVBox;
	}
};