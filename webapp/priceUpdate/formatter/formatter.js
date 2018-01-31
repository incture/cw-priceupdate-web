jQuery.sap.declare("com.incture.formatter.formatter");
com.incture.formatter.formatter = {

	onSAPEnter: function(inputField, controller) {
		var that = this;
		inputField.onsapenter = (function(oEvent) {
			if (navigator.onLine) {
				sap.m.InputBase.prototype.onsapenter.apply(inputField, arguments);
				controller.onSearch();
			} else {
				setTimeout(function() {
					inputField.focus();
				}, 1200);
			}
		}).bind(that);
	},

	formaValueState: function(evt) {
		if (evt === "Error") {
			this.removeStyleClass("inputBaseClass1");
			this.addStyleClass("formatErrorClass");
			return evt;
		} else {
			this.removeStyleClass("formatErrorClass");
			this.addStyleClass("inputBaseClass1");
			return "None";
		}
	},

	formatBooleanValues: function(evt) {
		var oBoolean = typeof(evt);
		if (oBoolean === "boolean") {
			return evt;
		} else if (oBoolean === "string") {
			if (evt === "true") {
				return true;
			} else {
				return false;
			}
		}
	},

	formatMaxLength: function(evt) {
		if (evt) {
			return parseInt(evt);
		}
	},

	toastMessage: function(message, cntrl, bVal) {
		var that = this;
		sap.m.MessageToast.show(message, {
			duration: 4000,
			width: "20em",
			my: "center center",
			at: "center center",
			of: window,
			offset: "0 0",
			onClose: that.onCloseToastMessage(cntrl, bVal),
			collision: "fit fit",
			autoClose: true,
			animationTimingFunction: "ease",
			animationDuration: 1000,
			closeOnBrowserNavigation: true
		});
	},
	onCloseToastMessage: function(cntrl, bVal) {
		if (bVal === true) {
			jQuery.sap.delayedCall(2000, null, function() {
				cntrl.onNavBack();
			});
		} else {
			return null;
		}
	},

	setSearchParams: function(fieldValue, fieldId, oAdvanceSearchModel) {

		var oSearchArray = oAdvanceSearchModel.getData().searchpanel;
		oSearchArray.filter(function(obj, i, arr) {
			if (obj.fieldId === fieldId) {
				obj.fieldValue = fieldValue;
			}
		});
	},

	setBusinessContextParams: function(oEvent, oMatSectionModel, oBusinessContextModel) {

		var oContextData = oEvent.getSource().getBindingContext("oMatSectionModel");
		var sPath = oContextData.getPath();
		var oCurrentObj = oMatSectionModel.getProperty(sPath);
		var oValue = oCurrentObj.fieldValueNew;

		var fieldId = oEvent.getSource().getCustomData()[0].getKey();
		var oContextArray = oBusinessContextModel.getData().businessObjectList;
		oContextArray.filter(function(obj, i, arr) {
			if (obj.hasOwnProperty("boList")) {
				var boList = obj.boList;
				if (Array.isArray(boList)) {
					boList.filter(function(object) {
						if (object.fieldId === fieldId) {
							object.fieldValueNew = oValue;
						}
					});
				} else {
					if (obj.boList.fieldId === fieldId) {
						obj.boList.fieldValueNew = oValue;
					}
				}
			}
		});
	},

	onTableFilter: function(oEvent, oTable, oBindingPaths) {

		var aFilters = [];
		var sQuery = "";
		if (oEvent) {
			sQuery = oEvent.getSource().getValue();
		}
		var filterArry = [];
		if (sQuery && sQuery.length > 0) {
			for (var i = 0; i < oBindingPaths.length; i++) {
				var bindingName = oBindingPaths[i];
				filterArry.push(new sap.ui.model.Filter(bindingName, sap.ui.model.FilterOperator.Contains, sQuery));
			}

			var filter = new sap.ui.model.Filter(filterArry, false);
			aFilters.push(filter);
		}

		var binding = oTable.getBinding("items");
		binding.filter(aFilters, "Application");
	},

	formatPageNumber: function(evt) {
		if (evt) {
			return "Page : " + evt;
		}
	},

	formatWidth: function(bval) {
		var oMatSectionModel = this.getModel("oVariableKeyModel");
		var data = oMatSectionModel.getData().rows[0];
		var length = data.length;
		var status = data[length - 1];
		if (status === "Update Pending") {
			/*this.addStyleClass("lineCommentBoxStyle");*/
			this.addStyleClass("lineCommentBoxStyleAvail");
		} else {
			this.addStyleClass("lineCommentBoxStyleAvail");
		}
	},

	commentIconChang: function(val) {
		var oMatSectionModel = this.getModel("oMatSectionModel");
		var sPath = this.getBindingContext("oMatSectionModel").sPath;
		var data = oMatSectionModel.getProperty(sPath);
		var value = data.commentList;
		var count = 0;

		if (!Array.isArray(value)) {
			var oTempArry = [];
			oTempArry.push(value);
			value = oTempArry;
		}
		value.filter(function(obj, i, arr) {
			if (obj.fieldId === "REQUESTER_COMMENTS" || obj.fieldId === "APPROVER_COMMENTS") {
				if (obj.fieldValue === "") {
					return;
				} else {
					count++;
				}
			}
		});
		if (count == 0) {
			return "sap-icon://post";
		} else {
			return "sap-icon://comment";
		}
	},

	setColorMode: function(val) {
		if (val === "CREATED") {
			this.addStyleClass("colorforCreted");
			return true;
		} else if (val === "CHANGE") {
			this.addStyleClass("colorforChanged");
			return true;
		} else if (val === "IMPACTED") {
			this.addStyleClass("colorforImpacted");
			return true;
		} else if (val === "DELETED") {
			this.addStyleClass("colorforDeleted");
			return true;
		} else {
			this.addStyleClass("colorforOthers");
			return true;
		}
	},

	setDatePickerDisabled: function(evt, datePicker) {
		if (evt.target.id.search("icon") === -1) {
			var id = "#" + evt.target.id;
			$(id).attr('readonly', true);
			var iconId = "#" + evt.target.id.split("-inner")[0] + "-icon";
			$(iconId).trigger("click");
		}
	},

	setPreviousStateObjects: function(sPath, oModel, selectedObj, oUndoModel, objectType, changeType, fieldId, toastMsgBval, isScales,
		prevChangeMode, selectedTab) {

		var oArray;
		var oConditionTypes = oUndoModel.getData().oConditionTypes;
		oConditionTypes.forEach(function(obj) {
			if (selectedTab === obj.key) {
				oArray = obj.prevStateArray;
			}
		});

		var oTempObj = {};
		oTempObj.sPath = sPath;
		oTempObj.oModel = oModel;
		oTempObj.prevData = selectedObj;
		oTempObj.objectType = objectType;
		oTempObj.changedField = fieldId;
		oTempObj.changeType = changeType;
		oTempObj.toastMsgBval = toastMsgBval;
		oTempObj.isScales = isScales;
		oTempObj.prevChangeMode = prevChangeMode;
		oArray.push(oTempObj);
		// oUndoModel.getData().prevStateArray = oArray;
		oUndoModel.refresh();
	},

	setConditionRecEditable: function(oArray, bVal) {

		var that = this;
		oArray.forEach(function(obj) {
			if (obj.hasOwnProperty("isEditable")) {
				if (obj.hasOwnProperty("isDefaultEditable")) {
					var bValEditable = that.formatBooleanValues(obj.isDefaultEditable);
					if (bValEditable) {
						obj.isEditable = bVal;
					}
				}
				/*if(obj.hasOwnProperty("commentList")){
					var commentList = obj.commentList;//Array
					if(!Array.isArray(commentList)){
						var oTempArry = [];
						oTempArry.push(commentList);
						commentList = oTempArry;
					} 
					commentList.forEach(function(obj){
						if(obj.hasOwnProperty("isEditable")){
							if(obj.hasOwnProperty("isDefaultEditable")){
								var bValEditable = that.formatBooleanValues(obj.isDefaultEditable);
								if(bValEditable){
									obj.isEditable = bVal;
								}
							}
						}
					});
				}*/
				if (obj.hasOwnProperty("scaleDataList")) {
					obj.isEditable = bVal;
					var scaleDataList = obj.scaleDataList; //Array
					if (!Array.isArray(scaleDataList)) {
						var oTempArry = [scaleDataList];
						scaleDataList = oTempArry;
					}
					scaleDataList.forEach(function(obj) {
						if(obj){
						var parameterList = obj.parameterList;
						parameterList.forEach(function(obj) {
							if (obj.hasOwnProperty("isEditable")) {
								if (obj.hasOwnProperty("isDefaultEditable")) {
									var bValEditable = that.formatBooleanValues(obj.isDefaultEditable);
									if (bValEditable) {
										obj.isEditable = bVal;
									}
								}
							}
						});	
						}
					});
				}
			}
		});
	},

	formatColumnWidth: function(label) {
		if (label === "") {
			this.getParent().setWidth("2rem");
		}
		if (label === "Action") {
			this.getParent().setWidth("3rem");
		}
		if (label === "Scales") {
			this.getParent().setWidth("3rem");
		}
		return label;
	},

	formatStatusBooleanValues: function(oVal, bVal) {
		bVal = com.incture.formatter.formatter.formatBooleanValues(bVal);
		if (oVal === "Available" && bVal) {
			return true;
		} else {
			return false;
		}
	},

	formatDateEnable: function(sPath, model) {
		var count = 0;
		var sPath = sPath;
		var oModel = model;
		var entryIndex = parseInt(sPath.split("/")[3]);
		var recordIndex = parseInt(sPath.split("/")[6]);
		var oValue = oModel.getData().conditionTypesRecords.entry[entryIndex].value;
		if (recordIndex >= 0) {
			var currentObj = oValue.listMatrialInfoRecord[recordIndex].tableColumnRecords;
		} else {
			var currentObj = oValue.listMatrialInfoRecord.tableColumnRecords;
		}
		if (currentObj[0].changeMode === "DELETE") {
			return false;
		}

		var selectedObj = oModel.getProperty(sPath);
		var firstObjSpath = sPath.split("/").slice(0, -1).join("/") + "/0";
		var getFirstObj = oModel.getProperty(firstObjSpath);
		var oValue1 = selectedObj.fieldValueNew;
		var oValue2 = selectedObj.fieldValue;

		var secondObjSpath = sPath.split("/").slice(0, -1).join("/") + "/1";
		var getSecondObj = oModel.getProperty(secondObjSpath);
		var prevChangeMode = getSecondObj.colorCode;

		var bVal = false;
		if (oValue1 != oValue2) {
			if (getFirstObj.hasOwnProperty("changeMode")) {
				if (getFirstObj.changeMode !== "CREATE") {
					getFirstObj.changeMode = "UPDATE";
					bVal = true;
				}
			}
		}

		var rate, currency, pricingUnit, unitMeasure, rateValState, currencyValState, unitValState, uomValstate;
		currentObj.filter(function(obj, i, arr) {
			var fieldId = obj.fieldId;
			if (fieldId === "KBETR") {
				rate = obj.fieldValueNew;
				rateValState = obj.valueState;
			}
			if (fieldId === "KONWA") {
				currency = obj.fieldValueNew;
				currencyValState = obj.valueState;
			}
			if (fieldId === "KPEIN") {
				pricingUnit = obj.fieldValueNew;
				unitValState = obj.valueState;
			}
			if (fieldId === "KMEIN") {
				unitMeasure = obj.fieldValueNew;
				uomValstate = obj.valueState;
			}
			if (fieldId === "COLOR") {
				if (bVal) {
					obj.colorCode = "CHANGE";
				}
			}
		});

		var getDateObjects = com.incture.formatter.dateFunctions.getStartEndDateObjects(currentObj);
		if (rate === "" || currency === "" || pricingUnit === "" || unitMeasure === "" || rateValState === "Error" ||
			currencyValState === "Error" || unitValState === "Error" || uomValstate === "Error") {
			getDateObjects[0].isEditable = "false";
			getDateObjects[1].isEditable = "false";
		} else {
			getDateObjects[0].isEditable = "true";
			getDateObjects[1].isEditable = "true";
		}
		oModel.refresh();
	},

	addConditionRecArray: function(oMatSectionModel, oUndoModel) {

		var oUndoConditionTypes = []; //Set empty array for undo model	
		var conditionTypesRecords = {};
		conditionTypesRecords.entry = [];
		var oConditionTypes = oMatSectionModel.getProperty("/conditionTypes");
		var oConditionRecords = oMatSectionModel.getProperty("/conditionTypesRecords");

		if (oConditionRecords) {
			var conditionRec = oConditionRecords.entry;
			var conditionRecordsLength = conditionRec.length;
			var conditionTypesLength = oConditionTypes.length;
			if (conditionTypesLength !== conditionRecordsLength) {
				for (var i = 0; i < conditionTypesLength; i++) {
					var key = oConditionTypes[i].conditionId;
					var oConditionId = oConditionTypes[i].conditionId;
					var oUndoTempObj = {
						prevStateArray: [],
						key: key
					}
					oUndoConditionTypes.push(oUndoTempObj);
					if (conditionRec[i] === undefined) {
						var value = {};
						value.listMatrialInfoRecord = [];
						var oTempObj = {};
						oTempObj.value = value;
						oTempObj.key = key;
						conditionRec[i] = oTempObj;
					}
				}
			}
		} else if (oConditionRecords === null) {
			if (Array.isArray(oConditionTypes)) {
				for (var i = 0; i < oConditionTypes.length; i++) {
					var value = {};
					var key = oConditionTypes[i].conditionId;
					value.listMatrialInfoRecord = [];
					var oTempObj = {};
					oTempObj.value = value;
					oTempObj.key = key;
					conditionTypesRecords.entry.push(oTempObj);

					var oUndoTempObj = {
						prevStateArray: [],
						key: key
					};
					oUndoConditionTypes.push(oUndoTempObj);
				}
				oMatSectionModel.setProperty("/conditionTypesRecords", conditionTypesRecords);
			}
		}
		oUndoModel.setProperty("/undoBtnEnabled", false);
		oUndoModel.setProperty("/oConditionTypes", oUndoConditionTypes);
	},

	//Below function checks if the newly created row has values entered in each cell, else hard delete from UI
	validateRecordOnUIDelete: function(createdRow) {

		var count = 0;
		var that = this;
		var visibleCount = 0;
		var oLength = createdRow.length;
		for (var i = 0; i < oLength; i++) {
			var oCurrentObj = createdRow[i];
			var fieldVisible = that.formatBooleanValues(oCurrentObj.isVisible);
			var fieldValue = oCurrentObj.fieldValueNew;
			var fieldId = oCurrentObj.fieldId;
			if (fieldId !== "DATAB" || fieldId !== "Scales" || fieldId !== "Comment" || fieldId !== "COLOR") {
				if (fieldVisible) {
					visibleCount = visibleCount + 1;
					if (!fieldValue) {
						count = count + 1;
					}
				}
			}
		}

		if (visibleCount === count) {
			return true;
		} else {
			return false;
		}
	},

	setScaleColumnVisible: function(bVal, fieldId, selectedTab) {
		var value = JSON.parse(bVal);
		if (fieldId === "Scales") {
			if (selectedTab === "PB00") {
				return true;
			} else {
				return false;
			}
		} else {
			return value;
		}
	},

	setUserDialogColVisible: function( oTblCol, bVal) {
		oTblCol.filter(function(obj, i, arr) {
			var field = obj.fieldId;
			if(obj.label === ""){
				obj.isVisible = bVal;	
			}else if(field === "Scales" || field === "ACTIONS" || field === "Comment"){
				obj.isVisible = bVal;
			}
		});
		return oTblCol;
	}
};