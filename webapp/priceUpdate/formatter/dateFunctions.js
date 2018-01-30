jQuery.sap.declare("com.incture.formatter.dateFunctions");
com.incture.formatter.dateFunctions = {
	
	//Below function forms the input parameters for the other functions, that will be called.
	checkCondtionRecCase: function(selectedTabPath, selectedRowPath, oMatSectionModel, oDateFormat){
		
		this.oDateFormat = oDateFormat;
		var oCondtionTypeRec = oMatSectionModel.getData().conditionTypesRecords.entry[selectedTabPath];
		var oArray = oCondtionTypeRec.value.listMatrialInfoRecord.tableColumnRecords;
		if(!oArray){
			oArray = oCondtionTypeRec.value.listMatrialInfoRecord;
		}
		if(oArray.length){ 
			if(!oArray[0].tableColumnRecords){
				var obj = {};
				obj.tableColumnRecords = oArray;
				var oTempArry = [];
				oTempArry.push(obj);
				oArray = oTempArry;
       		}	
		}else{
			oArray = []; 
		}
		
		var oContionRecord = oArray.splice(selectedRowPath, 1);
		var dates = this.getStartEndDateObjects(oContionRecord[0]);
		var validityStart = new Date(dates[0].uiFieldValue);
		var validityEnd = new Date(dates[1].uiFieldValue);
		var oLength = oArray.length;
		var getDelectedRec = this.removeDeletedRecords(oArray);
		oArray = getDelectedRec.oArray;
		
		if(oLength){
			if(oLength > 1){
				oArray = this.sortConditionRecords(oArray);
				var oNewCondtionRec = this.compareMultipleCondRec(validityStart, validityEnd, oContionRecord, oArray);
				
				var newConditionRecords = oNewCondtionRec.newConditionRecords;
				newConditionRecords = this.pushCondtionRecObjects(getDelectedRec.oDeletecRec ,newConditionRecords);
				newConditionRecords = this.sortConditionRecords(newConditionRecords);
				oNewCondtionRec.newConditionRecords = newConditionRecords;
				
				var unchangedRecords = oNewCondtionRec.unchangedRecords;
				unchangedRecords = this.pushCondtionRecObjects(getDelectedRec.oDeletecRec ,unchangedRecords);
				unchangedRecords = this.sortConditionRecords(unchangedRecords);
				oNewCondtionRec.unchangedRecords = unchangedRecords;
				
				return oNewCondtionRec;
			}else{
				var oValidateRec = oArray[0];
				var oValidateRecDates = this.getStartEndDateObjects(oValidateRec);
				var oStartDate = new Date(oValidateRecDates[0].uiFieldValue);
				var oEndDate = new Date(oValidateRecDates[1].uiFieldValue);
				var oNewCondtionRec = this.compareAndValDates(validityStart, validityEnd, oStartDate, oEndDate,
						oContionRecord, oArray[0]);
				return oNewCondtionRec;
			}
		}else{
			var getDates = this.getStartEndDateObjects(oContionRecord[0]);
			var oStartDate = new Date(getDates[0].uiFieldValue);
			var oEndDate = new Date(getDates[1].uiFieldValue);
			var oParamObject = this.setDialogBoxParams(["0"], "NEW_RECORD", oContionRecord, [], oContionRecord);
			return oParamObject;
		}
	},
	
	removeDeletedRecords: function(oArray){
		var oDeletecRec = [];
		var length = oArray.length - 1;
		for(var j = length; j >= 0; j--){
			var firstObj = oArray[j].tableColumnRecords[0];
			var changeMode = firstObj.changeMode;
			if(changeMode === 'DELETE'){
				var obj = oArray.splice(j,1);
				oDeletecRec.push(obj[0]);
			}
		}
		var oTempObj = {};
		oTempObj.oArray = oArray;
		oTempObj.oDeletecRec = oDeletecRec;
		return oTempObj;
	},
	
	pushCondtionRecObjects: function(oArray, conditionRec){
		var length = oArray.length;
		for(var i=0; i<length; i++){
			conditionRec.push(oArray[i]);
		}
		return conditionRec;
	},
	
	//****************************** Below validations are applied on multiple condition records ******************************//

	compareMultipleCondRec: function(validityStart, validityEnd, oContionRecord, oArray){
	
		var oTempArry = [];
		var oMergeIndices = [];
		var oLoopParamObject = {}; //Used only in 'for' loop, for returning the parameters for dialog box
		var arrLength = oArray.length; //Total number of condition records
		var oRecords = jQuery.extend(true, [], oArray); //Duplicate of existing condition records
		var oNewConditionRec = jQuery.extend(true, [], oArray); //Duplicate of existing condition records
		var unchangedConditionRec = jQuery.extend(true, [], oArray); //Duplicate of existing condition records
		this.bValArraySplit = false;
		this.case3Split = false;
		this.case9Split = false; 
		this.startDateInRange = false;
		this.endDateInRange = false;
		
		//case9Split: If 'true', the date lies inside existing record, works only on case 9 
		//case9Split: If 'false', the date lies in between two existing records
		
		//Validations of the first object of 'oArray'
		var oFirstObj = oArray[0];
		var oFDateObjects = this.getStartEndDateObjects(oFirstObj);
		var oFStartDate = new Date(oFDateObjects[0].uiFieldValue);
		var oFEndDate = new Date(oFDateObjects[1].uiFieldValue);
		
		var bValStartDate = this.checkTwoDatesIsEqual(validityStart, oFStartDate);
		var bValEndDate = this.checkTwoDatesIsEqual(validityEnd, oFEndDate);
		var bValStartEndDate = this.checkTwoDatesIsEqual(validityEnd, oFStartDate);
		
		if(bValStartDate && bValEndDate){
			oRecords.splice(0,1);
			oRecords.push(oContionRecord[0]);
			oTempArry = oRecords;
			oTempArry = this.sortConditionRecords(oTempArry);
			this.bValArraySplit = false;
			var oParamObject = this.setDialogBoxParams(["0"], "OVERLAP", [oContionRecord[0]], [oArray[0]], oTempArry, true, unchangedConditionRec);
			return oParamObject;
		}else if(validityStart < oFStartDate && bValEndDate){
			oRecords.splice(0,1);
			oRecords.push(oContionRecord[0]);
			oTempArry = oRecords;
			oTempArry = this.sortConditionRecords(oTempArry);
			this.bValArraySplit = false;
			var oParamObject = this.setDialogBoxParams(["0"], "PARTIAL_OVERLAP", [oContionRecord[0]], [oArray[0]], oTempArry, true, unchangedConditionRec);
			return oParamObject;
		}else if(validityStart > oFStartDate && bValEndDate){
			var oParamObject = this.compareAndValDates(validityStart, validityEnd, oFStartDate, oFEndDate, oContionRecord, oFirstObj);
			oParamObject.bVal = true;
			var oTempConditionRec = oParamObject.affectedRecords;
			oRecords.splice(0,1);
			oTempArry = oTempConditionRec.concat(oRecords);
			oTempArry = this.sortConditionRecords(oTempArry);
			oParamObject.newConditionRecords = oTempArry;
			oParamObject.unchangedRecords = unchangedConditionRec;
			this.bValArraySplit = false;
			return oParamObject;
		}else if((validityStart < oFStartDate && validityEnd < oFEndDate)||
				 (validityStart > oFStartDate && validityEnd < oFEndDate)){
			var oParamObject = this.compareAndValDates(validityStart, validityEnd, oFStartDate, oFEndDate, oContionRecord, oFirstObj);
			oParamObject.bVal = true;
			var oTempConditionRec = oParamObject.affectedRecords;
			if(bValStartEndDate){
				oRecords.splice(0,1);	
			}else if(validityEnd < oFStartDate){
				
			}else{
				oRecords.splice(0,1);	
			}
			oTempArry = oTempConditionRec.concat(oRecords);
			oTempArry = this.sortConditionRecords(oTempArry);
			oParamObject.newConditionRecords = oTempArry;
			oParamObject.unchangedRecords = unchangedConditionRec;
			this.bValArraySplit = false;
			return oParamObject;
		}
		
		//Validations of the last object of 'oArray'
		var oLastObj = oArray[oArray.length - 1];
		var oLDateObjects = this.getStartEndDateObjects(oLastObj);
		var oLStartDate = new Date(oLDateObjects[0].uiFieldValue);
		var oLEndDate = new Date(oLDateObjects[1].uiFieldValue);
		var bVal = this.checkTwoDatesIsEqual(validityEnd, oLEndDate);
		var bValLStartDate = this.checkTwoDatesIsEqual(validityStart, oLStartDate);
		var bValLEndDate = this.checkTwoDatesIsEqual(validityEnd, oLEndDate);
	    if((validityStart > oLStartDate && validityEnd > oLEndDate) ||
	    	(bValLStartDate && bValLEndDate)){
	    	var oParamObject = this.compareAndValDates(validityStart, validityEnd, oLStartDate, oLEndDate, oContionRecord, oLastObj);
			var oTempConditionRec = oParamObject.newConditionRecords;
			oRecords.splice(oRecords.length-1,1);
			if(Array.isArray(oTempConditionRec)){
				oTempArry = oTempConditionRec.concat(oRecords);
				oTempArry = this.sortConditionRecords(oTempArry);
			}else{
				oRecords.push(oTempConditionRec);
				oTempArry = this.sortConditionRecords(oRecords);
			}
			oParamObject.bVal = true;
			oParamObject.newConditionRecords = oTempArry;
			oParamObject.unchangedRecords = unchangedConditionRec;
			this.bValArraySplit = false;
			return oParamObject;			
		}
		
	    //Overlap case, where the existing records date ranges lies inside the range of entered date range
	    if((validityStart < oFStartDate && oLEndDate < validityEnd) || (bValStartDate && bVal)){
	    	oTempArry = this.case4EqualDates(validityStart, validityEnd, "", "", oContionRecord[0], "");
	    	var oParamObject = this.setDialogBoxParams(["0"], "OVERLAP", [oContionRecord[0]], oArray, oTempArry, true, unchangedConditionRec);
	    	this.bValArraySplit = false;
	    	return oParamObject;
	    }
		
		//Check if the given condition record's validity date range is in between the available condition records.
		for(var i=0; i<arrLength; i++){
			if(oArray[i +1]){
				var oNextConditRec = oArray[i +1];	
			}else{
				var oNextConditRec = "";
			}
			
			var oValue = this.checkInDateRange(oContionRecord, oArray[i], oNextConditRec, oArray, i);
			var selectedArry = this.getStartEndDateObjects(oArray[i]);
			var oStartDate = new Date(selectedArry[0].uiFieldValue);
			var oEndDate = new Date(selectedArry[1].uiFieldValue);
			switch(oValue){
			
			case "01": 
				var oSplitRecords = this.case1SplitRecords(oContionRecord[0], oArray[i], validityStart, validityEnd);
				oTempArry = oTempArry.concat(oSplitRecords);
				oLoopParamObject = this.setDialogBoxParams(["0"], "SPLIT_RECORD", oSplitRecords, unchangedConditionRec[i], oTempArry, true, unchangedConditionRec);
				this.bValArraySplit = true;
				break;
				
			case "02":
				var oExtEndDateRec = this.case2ExtendEndDate(validityStart, validityEnd, oStartDate, oEndDate, oContionRecord[0], oArray[i]);
				oTempArry = oTempArry.concat(oExtEndDateRec);
				oLoopParamObject = this.setDialogBoxParams(["0"], "PARTIAL_OVERLAP", oExtEndDateRec, unchangedConditionRec[i], oTempArry, true, unchangedConditionRec);
				this.bValArraySplit = true;
				break;
				
			case "03":
				var oExtStartDateRec = this.case3ExtendStartDate(validityStart, validityEnd, oStartDate, oEndDate, oContionRecord[0], oArray[i]);
				oTempArry = oTempArry.concat(oExtStartDateRec);
				oLoopParamObject = this.setDialogBoxParams(["0"], "PARTIAL_OVERLAP", oExtStartDateRec, unchangedConditionRec[i], oTempArry, true, unchangedConditionRec);
				this.bValArraySplit = true;
				this.case3Split = true;
				break;
				
			case "04":
				var oMergeRec = this.case4EqualDates(validityStart, validityEnd, oStartDate, oEndDate, oContionRecord[0], oArray[i]);
				oTempArry.push(oMergeRec);
				oLoopParamObject = this.setDialogBoxParams(["0"], "OVERLAP", oMergeRec, unchangedConditionRec[i], oTempArry, true, unchangedConditionRec);
				this.bValArraySplit = true;
				break;
				
			case "05":
				oMergeIndices.push(i);
				if(this.bValArraySplit){
					oTempArry.push(oArray[i]);
				}else{
					oTempArry.push(oRecords.splice(0,1)[0]);
				}
				break;
						
			case "06":
				var oCondRec = this.case6DatesInDiffRec(validityStart, validityEnd, oStartDate, oEndDate, oContionRecord[0], oArray[i], oNextConditRec);
				var length = oNewConditionRec.length;
				for(var j = length-1; j >= 0; j--){
					if(j===i || j=== i+1){
						oNewConditionRec.splice(j,1);
					} 
				}
				oTempArry = oCondRec.concat(oNewConditionRec);
				oTempArry = this.sortConditionRecords(oTempArry);
				var affectedRec = [unchangedConditionRec[i], unchangedConditionRec[i+1]];
				oLoopParamObject = this.setDialogBoxParams(["0"], "PARTIAL_OVERLAP", oCondRec, affectedRec, oTempArry, true, unchangedConditionRec);
				this.bValArraySplit = false;
				return oLoopParamObject;
			//	break;
			
			case "07":
				var oMergeRecords = [oArray[i], oContionRecord[0]];	
				oTempArry = oTempArry.concat(oMergeRecords);
				oTempArry = this.sortConditionRecords(oTempArry);
				oLoopParamObject = this.setDialogBoxParams(["0"], "NEW_RECORD", oContionRecord, oMergeRecords, oTempArry, true, unchangedConditionRec);
				this.bValArraySplit = true;
				break;
				
			case "08":
				oLoopParamObject = this.compareAndValDates(validityStart, validityEnd, oStartDate, oEndDate, oContionRecord, oArray[i]);
				var oTempArrLen = oTempArry.length;
				var index = oTempArrLen - 1;
				if(oTempArrLen){
					var oLTempArryObj = oTempArry[oTempArry.length-1];
					var oLTempArryDates = this.getStartEndDateObjects(oLTempArryObj);
					var oLTempStartDate = new Date(oLTempArryDates[0].uiFieldValue);
					var oLTempEndDate = new Date(oLTempArryDates[1].uiFieldValue);
					var bValLTempStartEndDate = this.checkTwoDatesIsEqual(validityEnd, oLTempStartDate);
					if((validityEnd > oLTempStartDate) || bValLTempStartEndDate ){
						var oDays = this.getNumberOfDays(oLTempEndDate, validityStart);
						if(oDays <= 0){
							this.case3ExtendStartDate(validityStart, validityEnd, oLTempStartDate, oLTempEndDate, "" , oLTempArryObj);							
							//oTempArry.splice(index, 1);
						}
					}else{
						oTempArry.splice(index, 1);
					}
				}
				
				if(this.startDateInRange){
					oTempArry.splice(index, 1);
					var oTempLastObjLen = oTempArry.length -1; 
					var oTemplastArry = oTempArry[oTempLastObjLen];
					if(oTemplastArry){
						var oTemplastArryDates = this.getStartEndDateObjects(oTemplastArry);
						var oTempStartDate = new Date(oTemplastArryDates[0].uiFieldValue);
						var oTempEndDate = new Date(oTemplastArryDates[1].uiFieldValue);
						var affectedRecord = oLoopParamObject.affectedRecords[0];
						if(affectedRecord){
							var affectedRecDates = this.getStartEndDateObjects(affectedRecord);
							var affectedRecStart = new Date(affectedRecDates[0].uiFieldValue);
							var affectedRecEnd = new Date(affectedRecDates[1].uiFieldValue);
							if(oTempStartDate < affectedRecStart && affectedRecStart < oTempEndDate){
								var affectedRecEnd1 = new Date(affectedRecStart);
								var dateOffset = (24*60*60*1000) * 1;
								affectedRecEnd1.setTime(affectedRecStart.getTime() - dateOffset);
								
								var dateTimeInst = this.oDateFormat.getDateTimeInstance({pattern: "MM/dd/yyyy"});
								oTemplastArry.tableColumnRecords.filter(function(obj, i, arr){
									if(obj.hasOwnProperty("dateOrder")){
										if(obj.dateOrder === "End"){
											var oDate = dateTimeInst.format(affectedRecEnd1);
											obj.fieldValueNew = oDate;
											obj.fieldValue = oDate;
											obj.uiFieldValue = oDate;
										}
									}
								});

							}
						}
					}
				}
				
				oTempArry = oTempArry.concat(oLoopParamObject.affectedRecords);
				oLoopParamObject.bVal = true;		
				oLoopParamObject.newConditionRecords = oTempArry;
				oLoopParamObject.unchangedRecords = unchangedConditionRec;
				oTempArry = this.sortConditionRecords(oTempArry);
				this.bValArraySplit = true;
				break;
				
			case "09":
				var newConditionRecs = [];
				var oSelectedRecords = this.removeCase9CondRecords(validityStart, validityEnd, oRecords);
				var indices = oSelectedRecords[0];
				var oAffectedRec = [];
				for(var j = indices.length-1; j >= 0; j--){
					oAffectedRec.push(oRecords[indices[j]]);
					oRecords.splice(indices[j],1);
				}
				if(oSelectedRecords[1]){
					if(typeof oSelectedRecords[1] === "object"){
						var oExtEndDateRec = this.case9OverLapStartDate(validityStart, validityEnd, oStartDate, oEndDate, oContionRecord[0], oSelectedRecords[1]);	
					}else{
						var oExtEndDateRec = this.case9OverLapStartDate(validityStart, validityEnd, oStartDate, oEndDate, oContionRecord[0]);
					}
				}else{
					var oExtEndDateRec = this.case9OverLapStartDate(validityStart, validityEnd, oStartDate, oEndDate, oContionRecord[0]);
				}

				if(this.case9Split){
					if(oTempArry.length){
						var firstObj = oTempArry[oTempArry.length-1];
						var firstObjDates = this.getStartEndDateObjects(firstObj);
						var oFirstObjSDate = new Date(firstObjDates[0].uiFieldValue);
						var oFirstObjEDate = new Date(firstObjDates[1].uiFieldValue);
						
						var secondObj = oExtEndDateRec[0];
						var secondObjDates = this.getStartEndDateObjects(secondObj);
						var oSecObjSDate = new Date(secondObjDates[0].uiFieldValue);
						var oSecObjEDate = new Date(secondObjDates[1].uiFieldValue);
						
						var mergeRecds = this.case3ExtendStartDate(oSecObjSDate, oSecObjEDate, oFirstObjSDate, oFirstObjEDate, secondObj, firstObj);
						oTempArry.splice(oTempArry.length-1);
						oExtEndDateRec.splice(0,1);
						
						oTempArry = mergeRecds.concat(oExtEndDateRec).concat(oTempArry).concat(oRecords);
						oLoopParamObject = this.setDialogBoxParams(["0"], "PARTIAL_OVERLAP", oContionRecord, oAffectedRec, oTempArry, true, unchangedConditionRec);
						oTempArry = this.sortConditionRecords(oTempArry);
						this.bValArraySplit = false;
						return oLoopParamObject;
					}
				}
				
				if(oRecords.length){
					newConditionRecs = oRecords.concat(oExtEndDateRec);
				}else{
					newConditionRecs = oExtEndDateRec;
				}
				oTempArry = oTempArry.concat(newConditionRecs);
				//oTempArry = this.sortConditionRecords(oTempArry);
				oLoopParamObject = this.setDialogBoxParams(["0"], "PARTIAL_OVERLAP", oContionRecord, oAffectedRec, oTempArry, true, unchangedConditionRec);
				this.bValArraySplit = false;
				return oLoopParamObject;
			//	break;
			}	
		}
		this.bValArraySplit = false;
		oLoopParamObject.newConditionRecords = oTempArry;
		return oLoopParamObject;
	},

	//Below function forms parameters for the confirmation dialog box
	setDialogBoxParams: function(indices, type, affectedRecs, exisitingRecs, oNewCondRec, bVal, unchangedRecords){
		var oParamObject = {};
		oParamObject.bVal = bVal;
		oParamObject.indices = indices;
		oParamObject.changeType = type;
		oParamObject.affectedRecords = affectedRecs;
		oParamObject.exisitngRecords = exisitingRecs;
		oParamObject.newConditionRecords = oNewCondRec;
		if(bVal){
			oParamObject.unchangedRecords = unchangedRecords;
		}
		return oParamObject;
	},
	
	//Called only in case 9 condition, to remove unwanted records from existing records
	removeCase9CondRecords: function(validityStart, validityEnd, oArray){
		
		var oTempObj;
		var indices = [];
		var length = oArray.length;
		var oRecords = jQuery.extend(true, [], oArray);
		for(var i=0; i<length; i++){
			var currentObj = this.getStartEndDateObjects(oArray[i]);
			var oStartDate = new Date(currentObj[0].uiFieldValue);
			var oEndDate = new Date(currentObj[1].uiFieldValue);
			
			var bValStartDate = this.checkTwoDatesIsEqual(validityStart, oStartDate);
			var bValEndDate = this.checkTwoDatesIsEqual(validityEnd, oEndDate);
			var bValNStartEndDate = this.checkTwoDatesIsEqual(validityEnd, oEndDate);
			var bValNEndStartDate = this.checkTwoDatesIsEqual(validityEnd, oStartDate);
			
			if(validityStart < oStartDate &&  oEndDate < validityEnd){
				indices.push(i);
			}else if(validityStart < oStartDate){
				if(bValEndDate){
					indices.push(i);
					return [indices];
				}else if(bValNEndStartDate){
					indices.push(i);
					return [indices, oArray[i]];
				}else if(oStartDate > validityEnd &&  oEndDate > validityEnd){
					return [indices, true];
				}else if( oEndDate > validityEnd){
					indices.push(i);
					return [indices, oArray[i]];
				}
			}else if(validityStart > oStartDate){
				if(oEndDate < validityEnd){
					indices.push(i);
					return [indices, oArray[i]];
				}
			}
		}
		
		var oLength = oArray.length-1;
		if(indices.length !== oArray.length){
			indices.push(oLength);
			return [indices, oArray[oLength]];
		}else{
			return [indices];
		}
	},
	
	//****************************** Key values maintained for split and merge of condition records in case of multiple records. ******************************//
	// '01' -- If both start and end date are in the range of the validity period of the a condition record. [Split]
	// '02' -- If start date is in the range of the validity period of the a condition record. [Reduce end date of record under comparison]
	// '03' -- If end date is in the range of the validity period of the a condition record.
	// '04' -- If both start and date date greater than the range of the validity period of the a condition record on both sides. [Merge]
	// '05' -- If given date range is >> the validity period of record under consideration.
	// '06' -- If the start date lies in the record under consideration and end date lies in next condition record.
	// '07' -- If the given condition record lies in between 2 existing conditions records
	// '08' -- If start date of new record is less than or greater than existing record, and has both end dates equal.
	// '09' -- Multiple Overlap case
	// Below function checks the date range for the condition that has to be applied on multiple condition records
	// nValidityStart, nValidityEnd, nValidateRec -- Dates entered by the user (New Record).
	// oStartDate, oEndDate, oValidateRec -- Dates picked up for comparison (Existing Record).
	//************************************************************ ****************************** *************************************************************//
	
	checkInDateRange: function(nValidateRec, oValidateRec, oNextConditRec, oArray, i){
		
		var firstRecDates = this.getStartEndDateObjects(nValidateRec[0]);
		var nValidityStart = new Date(firstRecDates[0].uiFieldValue); // From date of nValidateRec record
		var nValidityEnd = new Date(firstRecDates[1].uiFieldValue); // To date of nValidateRec record
		
		var lastRecDates = this.getStartEndDateObjects(oValidateRec);
		var oStartDate = new Date(lastRecDates[0].uiFieldValue); // From date of oValidateRec record
		var oEndDate = new Date(lastRecDates[1].uiFieldValue); // To date of oValidateRec record
		
		var bValEqStartEndDate = this.checkTwoDatesIsEqual(nValidityStart, nValidityEnd); //nValidityEnd === nValidityEnd
		var bValStartDate = this.checkTwoDatesIsEqual(nValidityStart, oStartDate); //nValidityStart === oStartDate
		var bValEndDate = this.checkTwoDatesIsEqual(nValidityStart, oEndDate); //nValidityStart === oEndDate
		var bValStartEndDate = this.checkTwoDatesIsEqual(nValidityStart, oEndDate); //nValidityStart === oEndDate
		var bValEndStartDate = this.checkTwoDatesIsEqual(nValidityEnd, oStartDate); //nValidityEnd === oStartDate
		var bValEqEndDates = this.checkTwoDatesIsEqual(nValidityEnd, oEndDate);
		
		if(bValStartDate && bValEndDate){
			return "04";
		}
		if(oNextConditRec){
			var oNextRecDates = this.getStartEndDateObjects(oNextConditRec);
			var oNextRecStartDate = new Date(oNextRecDates[0].uiFieldValue);
			var oNextRecEndDate = new Date(oNextRecDates[1].uiFieldValue);
			
			var bValNRecSDate = this.checkTwoDatesIsEqual(nValidityStart, oNextRecStartDate); //nValidityStart === oNextRecStartDate
			var bValNRecEDate = this.checkTwoDatesIsEqual(nValidityStart, oNextRecEndDate); //nValidityStart === oNextRecEndDate
			var bValNRecSEDate = this.checkTwoDatesIsEqual(nValidityStart, oNextRecEndDate); //nValidityStart === oNextRecEndDate
			var bValNRecESDate = this.checkTwoDatesIsEqual(nValidityEnd, oNextRecStartDate); //nValidityEnd === oNextRecStartDate
			
			if(bValNRecSDate || bValNRecEDate || bValNRecSEDate || 
				(bValEqStartEndDate && bValNRecSEDate)){
				return "05";
			}else if(bValNRecESDate){
				return "05";
			}
			//If the start date lies in the 'oValidateRec' and end date lies in 'oNextConditRec'
			else if((oStartDate < nValidityStart && oEndDate > nValidityStart) &&
					(oNextRecStartDate < nValidityEnd && oNextRecEndDate > nValidityEnd)){
				return "06";
			}
			else if((oStartDate < nValidityStart && oEndDate < nValidityStart) &&
					(oNextRecStartDate > nValidityEnd && oNextRecEndDate > nValidityEnd)){
				if(nValidityStart > oEndDate && nValidityEnd < oNextRecStartDate){
					return "07";
				}
			}
			else if(bValStartDate && bValEqEndDates){
				return "04";
			}
			else if((nValidityStart > oStartDate) && bValEqEndDates){
				return "03";
			}
			//Both start entered start and end date lies in same month
			else if((oStartDate < nValidityStart && oEndDate > nValidityStart) &&
				(oStartDate < nValidityEnd && oEndDate > nValidityEnd)){
				return "01";
			}
			//Case 2
			else if(nValidityStart > oEndDate && nValidityEnd > oNextRecStartDate && nValidityEnd < oNextRecEndDate){
				return "05";
			}
			//Case 3
			else if(nValidityStart > oStartDate && nValidityStart < oEndDate && nValidityEnd < oNextRecStartDate){
				return "03";
			}
			else if(this.case3Split === false){
				if((nValidityStart < oStartDate && (oStartDate < nValidityEnd &&  nValidityEnd < oEndDate)) || //(oStartDate < nValidityEnd < oEndDate)) ||
						((nValidityStart < oStartDate) && bValEqEndDates)){
					if(this.bValArraySplit){
						return "05";
					}else{
						return "09";						
					}
				}
			}
		}
		if(nValidityStart > oStartDate && bValEndStartDate){
			return "08";
		}else if(nValidityStart < oStartDate && bValEndStartDate){
			return "08";
		}
		else if(nValidityStart < oStartDate && nValidityEnd < oEndDate){
			if(nValidityEnd < oStartDate){
				return "05";
			}else if(nValidityEnd > oStartDate){
				return "02";
			}
		}else if(nValidityStart < oStartDate && nValidityEnd > oEndDate){
			if(i >= 1){
				var oPreviousRec = oArray[i-1];
				var prevRecDates = this.getStartEndDateObjects(oPreviousRec);
				var oPrevStartDate = new Date(prevRecDates[0].uiFieldValue);
				var oPrevEndDate = new Date(prevRecDates[1].uiFieldValue);
				if(oPrevStartDate < nValidityStart && nValidityStart < oPrevEndDate){
					if(oNextConditRec){
						this.case9Split = true;
						return "09";
					}else{
						return "08";
					}
				}else if(oPrevEndDate < nValidityStart && nValidityStart < oStartDate){
					if(oNextConditRec){
						this.case9Split = false;
						return "09";
					}else{
						return "08";
					}
				}else{
					return "08";
				}
			}else {
				return "09";//"04";
			}
		}else if(nValidityStart > oStartDate && nValidityEnd < oEndDate){
			return "01";
		}else if(nValidityStart > oStartDate && nValidityEnd > oEndDate){
			if(nValidityStart < oEndDate){
				if(oNextConditRec){
					if(nValidityStart < oNextRecStartDate && nValidityEnd > oNextRecEndDate){
						this.startDateInRange = true;
						return "05";
					}else{
						return "01";
					}
				}else{
					return "03";
				}
			}else if(nValidityStart > oEndDate || bValEndDate){
				return "05";
			}
		}else if((nValidityStart < oStartDate && (oStartDate < nValidityEnd < oEndDate)) ||
				((nValidityStart < oStartDate) && bValEqEndDates)){
			return "09";
		}
	},
	//****************************** End of validations applied on multiple condition records ******************************//
	
	//****************************** Below are the validations applied on single condition records ******************************//
	// Below function checks the date range for the condition that has to be applied
	// nValidityStart, nValidityEnd, nValidateRec -- Dates entered by the user (New Record).
	// oStartDate, oEndDate, oValidateRec -- Dates picked up for comparison (Existing Record).
	//****************************** ********************************************************************************************//
	
	compareAndValDates: function(nValidityStart, nValidityEnd, oStartDate, oEndDate, nValidateRec, oValidateRec){

		var unChangedOValidateRec = jQuery.extend(true, [], oValidateRec);
		var unChangedNValidateRec = jQuery.extend(true, [], nValidateRec);
		var bValStartDate = this.checkTwoDatesIsEqual(nValidityStart, oStartDate);
		var bValEndDate = this.checkTwoDatesIsEqual(nValidityEnd, oEndDate);
		var bValStartEndDate = this.checkTwoDatesIsEqual(nValidityStart, oEndDate); //nValidityStart === oEndDate
		var bValEndStartDate = this.checkTwoDatesIsEqual(nValidityEnd, oStartDate); //nValidityEnd === oStartDate
		
		//Case: If the date ranges are equal.
		if(bValStartDate && bValEndDate){
			var oNewCondRec = this.case4EqualDates(nValidityStart, nValidityEnd, oStartDate, oEndDate, nValidateRec[0], oValidateRec);
			var oParamObject = this.setDialogBoxParams(["0"], "OVERLAP", [oNewCondRec], [oValidateRec], oNewCondRec, false);
			return oParamObject;
		}
		else{
			if(nValidityStart < oStartDate && bValEndDate){
				var oNewCondRec = this.case4EqualDates(nValidityStart, nValidityEnd, oStartDate, oEndDate, nValidateRec[0], oValidateRec);
				var oParamObject = this.setDialogBoxParams(["0"], "OVERLAP", [oNewCondRec], [oValidateRec], oNewCondRec, false);
				return oParamObject;
			}
			else if(nValidityStart < oStartDate && nValidityEnd < oEndDate){
				//If entered end date === existing record's start date
				if(bValEndStartDate || (nValidityEnd > oStartDate)){
					var oNewCondRec = this.case2ExtendEndDate(nValidityStart, nValidityEnd, oStartDate, oEndDate, nValidateRec[0], oValidateRec);
					var oParamObject = this.setDialogBoxParams(["0"], "PARTIAL_OVERLAP", oNewCondRec, [unChangedOValidateRec], oNewCondRec, false);
					return oParamObject;
				}
				//Given date range lies before the existing condition record range. [A new record is created] 
				else if(nValidityEnd < oStartDate){
					this.setConditionRecMode(nValidateRec, oValidateRec);
					var oParamObject = this.setDialogBoxParams(["0"], "NEW_RECORD", nValidateRec, [oValidateRec], [nValidateRec[0], oValidateRec], false);
					return oParamObject;
				}
			}
			//Merge of records. [Function called 'case4EqualDates'] 
			else if(nValidityStart < oStartDate && nValidityEnd > oEndDate){
				var oNewCondRec = this.case4EqualDates(nValidityStart, nValidityEnd, oStartDate, oEndDate, nValidateRec[0], oValidateRec);
				var oParamObject = this.setDialogBoxParams(["0"], "OVERLAP", [oNewCondRec], [oValidateRec], oNewCondRec);
				return oParamObject;
			}
			//If both start dates are equal. [Function called 'case3ExtendStartDate'] 
			else if(nValidityStart > oStartDate && (bValStartEndDate || bValEndDate)){
				var oNewCondRec = this.case3ExtendStartDate(nValidityStart, nValidityEnd, oStartDate, oEndDate, nValidateRec[0], oValidateRec);
				var oParamObject = this.setDialogBoxParams(["0"], "PARTIAL_OVERLAP", oNewCondRec, [unChangedOValidateRec], oNewCondRec, false);
				return oParamObject;
			}
			//Split of records. [Function called 'case1SplitRecords']
			else if(nValidityStart > oStartDate && nValidityEnd < oEndDate){
				var oNewConditionRec = this.case1SplitRecords(nValidateRec[0], oValidateRec, nValidityStart, nValidityEnd);
				var oParamObject = this.setDialogBoxParams(["0"], "SPLIT_RECORD", oNewConditionRec, [oValidateRec], oNewConditionRec, false);
				return oParamObject;
			}
			else if(nValidityStart > oStartDate && nValidityEnd > oEndDate){
				//If the date range is greater than the existing record. [A new record is created]
				if(nValidityStart > oEndDate){
					this.setConditionRecMode(nValidateRec, oValidateRec);
					var oTempArry = [];
					oTempArry.push(oValidateRec);
					oTempArry.push(nValidateRec[0]);
					var oParamObject = this.setDialogBoxParams(["0"], "NEW_RECORD", nValidateRec, [oValidateRec], oTempArry, false);
					return oParamObject;
				}
				//Extend of Start date. [Function called 'case3ExtendStartDate'] 
				else if(nValidityStart < oEndDate){
					var oNewCondRec = this.case3ExtendStartDate(nValidityStart, nValidityEnd, oStartDate, oEndDate, nValidateRec[0], oValidateRec);
					var oParamObject = this.setDialogBoxParams(["0"], "PARTIAL_OVERLAP", oNewCondRec, [unChangedOValidateRec], oNewCondRec, false);
					return oParamObject;
				}
			}
		}
	},
	//****************************** End of validations applied on single condition records ******************************//
	
	//case1: If a newly created condition record's date range is between any existing date range, splitting of records is done.
	case1SplitRecords: function(oNewConditionRec, oArray, validityStart, validityEnd, oNextConditRec){
		
		var tableColumnRecords = [];
		var conditionRec = oArray.tableColumnRecords;
		var condtionRec1 = jQuery.extend(true, [], conditionRec); 
		var condtionRec2 = jQuery.extend(true, [], conditionRec); 
		var dateObjects = this.getStartEndDateObjects(conditionRec);
		var startDate = new Date(dateObjects[0].uiFieldValue);
		var endDate = new Date(dateObjects[1].uiFieldValue);
			
		var tempObj1 = {};
		var record1EndDate = new Date(validityStart);
		var dateOffset = (24*60*60*1000) * 1;
		record1EndDate.setTime(validityStart.getTime() - dateOffset);
		var dateTimeInst = this.oDateFormat.getDateTimeInstance({pattern: "MM/dd/yyyy"});
		
		condtionRec1.filter(function(obj, i, arr){
			if(obj.hasOwnProperty("dateOrder")){
				if(obj.dateOrder === "End"){
					var oDate = dateTimeInst.format(record1EndDate);
					obj.fieldValueNew = oDate;
					obj.fieldValue = oDate;
					obj.uiFieldValue = oDate;
				}
			}
		});
		condtionRec1[0].changeMode = "UPDATE";
		condtionRec1[0].isSplit = "true";
		tempObj1.tableColumnRecords = condtionRec1;
		tempObj1.tableColumnRecords[1].colorCode = "IMPACTED";
		
		oNewConditionRec.tableColumnRecords.filter(function(obj, i, arr){
			if(obj.hasOwnProperty("dateOrder")){
				if(obj.dateOrder === "End"){
					var oDate = dateTimeInst.format(new Date(obj.uiFieldValue));
					obj.fieldValueNew = oDate;
					obj.fieldValue = oDate;
					obj.uiFieldValue = oDate;
				}
			}
		});
		oNewConditionRec.tableColumnRecords[0].changeMode = "CREATE";
		oNewConditionRec.tableColumnRecords[0].isSplit = "true";
		oNewConditionRec.tableColumnRecords[1].uiFieldType = "Vbox";
		oNewConditionRec.tableColumnRecords[1].colorCode = "CREATED";
		
		tableColumnRecords.push(tempObj1);
		tableColumnRecords.push(oNewConditionRec);
		
		if(oNextConditRec){
			var oTempDtObj = this.getStartEndDateObjects(oNewConditionRec);
			var oNxtRecStartDt = new Date(oTempDtObj[1].uiFieldValue);
			var dateOffset = (24*60*60*1000) * 1;
			oNxtRecStartDt.setTime(oNxtRecStartDt.getTime() + dateOffset);
			oNextConditRec.tableColumnRecords.filter(function(obj, i, arr){
				if(obj.hasOwnProperty("dateOrder")){
					if(obj.dateOrder === "Start"){
						var oDate = dateTimeInst.format(oNxtRecStartDt);
						obj.fieldValueNew = oDate;
						obj.fieldValue = oDate;
						obj.uiFieldValue = oDate;
					}
				}
			});
			oNextConditRec.tableColumnRecords[0].changeMode = "CREATE";
			oNextConditRec.tableColumnRecords[0].isSplit = "true";
			oNextConditRec.tableColumnRecords[1].colorCode = "CREATED";
			tableColumnRecords.push(oNextConditRec);
		}else{
			var tempObj2 = {};
			var record1StartDate = new Date(validityEnd);
			var dateOffset = (24*60*60*1000) * 1;
			record1StartDate.setTime(validityEnd.getTime() + dateOffset);
			condtionRec2.filter(function(obj, i, arr){
				if(obj.hasOwnProperty("dateOrder")){
					if(obj.dateOrder === "Start"){
						var oDate = dateTimeInst.format(record1StartDate);
						obj.fieldValueNew = oDate;
						obj.fieldValue = oDate;
						obj.uiFieldValue = oDate;
					}
				}
			});
			condtionRec2[0].changeMode = "UPDATE";
			condtionRec2[0].isSplit = "true";
			tempObj2.tableColumnRecords = condtionRec2;
			tempObj2.tableColumnRecords[1].colorCode = "IMPACTED";
			tableColumnRecords.push(tempObj2);
		}
		return tableColumnRecords;
	},
	
	//Case2: If start date is before the existing record range, but the end date is in existing record range.
	case2ExtendEndDate: function(nValidityStart, nValidityEnd, oStartDate, oEndDate, nValidateRec, oValidateRec){
		
		var dateTimeInst = this.oDateFormat.getDateTimeInstance({pattern: "MM/dd/yyyy"});		
		var oStrtDate2 = new Date(nValidityEnd);
		var dateOffset = (24*60*60*1000) * 1;
		oStrtDate2.setTime(oStrtDate2.getTime() + dateOffset);
		
		var bValEqualDates = this.checkTwoDatesIsEqual(oStrtDate2, oEndDate);
		if(oStrtDate2 < oEndDate || bValEqualDates){
			oValidateRec.tableColumnRecords.filter(function(obj, i, arr){
				if(obj.hasOwnProperty("dateOrder")){
					if(obj.dateOrder === "Start"){
						var oDate = dateTimeInst.format(oStrtDate2);
						obj.fieldValueNew = oDate;
						obj.fieldValue = oDate;
						obj.uiFieldValue = oDate;
					}
					if(obj.dateOrder === "End"){
						var oDate = dateTimeInst.format(oEndDate);
						obj.fieldValueNew = oDate;
						obj.fieldValue = oDate;
						obj.uiFieldValue = oDate;
					}
				}
			});
			this.setConditionRecMode(nValidateRec, oValidateRec);
			return [nValidateRec, oValidateRec];
		}
		if(nValidateRec && !oValidateRec){
			this.setConditionRecMode("", oValidateRec);
			return nValidateRec;
		}else if(!nValidateRec && oValidateRec){
			this.setConditionRecMode(nValidateRec, "");
			return oValidateRec;
		}
	},
	
	//Case3: If start date is in the existing record range, but the end date greater than existing record range.
	case3ExtendStartDate: function(nValidityStart, nValidityEnd, oStartDate, oEndDate, nValidateRec, oValidateRec, oLastRecord){
		
		var dateTimeInst = this.oDateFormat.getDateTimeInstance({pattern: "MM/dd/yyyy"});		
		if(oLastRecord){
			var dateObjects = this.getStartEndDateObjects(oLastRecord);
			var startDate = new Date(dateObjects[1].uiFieldValue);
			var dateOffset = (24*60*60*1000) * 1;
			startDate.setTime(startDate.getTime() + dateOffset);
			
			var oEndDate1 = new Date(oEndDate);
			oValidateRec.tableColumnRecords.filter(function(obj, i, arr){
				if(obj.hasOwnProperty("dateOrder")){
					if(obj.dateOrder === "Start"){
						var oDate = dateTimeInst.format(startDate);
						obj.fieldValueNew = oDate;
						obj.fieldValue = oDate;
						obj.uiFieldValue = oDate;
					}
					if(obj.dateOrder === "End"){
						var oDate = dateTimeInst.format(oEndDate1);
						obj.fieldValueNew = oDate;
						obj.fieldValue = oDate;
						obj.uiFieldValue = oDate;
					}
				}
			});
			this.setConditionRecMode("", oValidateRec);
			return oValidateRec;
		}
		else{
			var oStrtDate1= new Date(oStartDate);
			var oEndDate1 = new Date(nValidityStart);
			var dateOffset = (24*60*60*1000) * 1;
			oEndDate1.setTime(oEndDate1.getTime() - dateOffset);
			
			if(oValidateRec){
				oValidateRec.tableColumnRecords.filter(function(obj, i, arr){
					if(obj.hasOwnProperty("dateOrder")){
						if(obj.dateOrder === "Start"){
							var oDate = dateTimeInst.format(oStrtDate1);
							obj.fieldValueNew = oDate;
							obj.fieldValue = oDate;
							obj.uiFieldValue = oDate;
						}
						if(obj.dateOrder === "End"){
							var oDate = dateTimeInst.format(oEndDate1);
							obj.fieldValueNew = oDate;
							obj.fieldValue = oDate;
							obj.uiFieldValue = oDate;
						}
					}
				});
			}
			
			if(nValidateRec){
				var oStrtDate2 = new Date(nValidityStart);
				nValidateRec.tableColumnRecords.filter(function(obj, i, arr){
					if(obj.hasOwnProperty("dateOrder")){
						if(obj.dateOrder === "Start"){
							var oDate = dateTimeInst.format(oStrtDate2);
							obj.fieldValueNew = oDate;
							obj.fieldValue = oDate;
							obj.uiFieldValue = oDate;
						}
						if(obj.dateOrder === "End"){
							var oDate = dateTimeInst.format(nValidityEnd);
							obj.fieldValueNew = oDate;
							obj.fieldValue = oDate;
							obj.uiFieldValue = oDate;
						}
					}
				});
			}
			
			if(oValidateRec && nValidateRec){
				this.setConditionRecMode(nValidateRec, oValidateRec);
				return [oValidateRec, nValidateRec];
			}else if(oValidateRec){
				this.setConditionRecMode("", oValidateRec);
				return [oValidateRec];
			}else{
				this.setConditionRecMode(nValidateRec, "");
				return [nValidateRec];
			}
		}		
	},
	
	//case4: If dates are equal, or Merge records for bigger date range.
	case4EqualDates: function(nValidityStart, nValidityEnd, oStartDate, oEndDate, nValidateRec, oValidateRec){
		
		var dateTimeInst = this.oDateFormat.getDateTimeInstance({pattern: "MM/dd/yyyy"});
		nValidateRec.tableColumnRecords.filter(function(obj, i, arr){
			if(obj.hasOwnProperty("dateOrder")){
				if(obj.dateOrder === "Start"){
					var oDate = dateTimeInst.format(nValidityStart);
					obj.fieldValueNew = oDate;
					obj.fieldValue = oDate;
					obj.uiFieldValue = oDate;
				}
				if(obj.dateOrder === "End"){
					var oDate = dateTimeInst.format(nValidityEnd);
					obj.fieldValueNew = oDate;
					obj.fieldValue = oDate;
					obj.uiFieldValue = oDate;
				}
			}
		});
		this.setConditionRecMode(nValidateRec, "");
		return nValidateRec;
	},
	
	//case8: If the start date lies in the record under consideration and end date lies in next condition record.
	case6DatesInDiffRec: function(nValidityStart, nValidityEnd, oStartDate, oEndDate, nValidateRec, oValidateRec, oNextConditRec){
			
		var dateTimeInst = this.oDateFormat.getDateTimeInstance({pattern: "MM/dd/yyyy"});
		var oNextRecDates = this.getStartEndDateObjects(oNextConditRec);
		var oNextRecStartDate = new Date(oNextRecDates[0].uiFieldValue);
		var oNextRecEndDate = new Date(oNextRecDates[1].uiFieldValue);
		
		var oEndDate1 = new Date(nValidityStart);
		var dateOffset = (24*60*60*1000) * 1;
		oEndDate1.setTime(oEndDate1.getTime() - dateOffset);
		oValidateRec.tableColumnRecords.filter(function(obj, i, arr){
			if(obj.hasOwnProperty("dateOrder")){
				if(obj.dateOrder === "End"){
					var oDate = dateTimeInst.format(oEndDate1);
					obj.fieldValueNew = oDate;
					obj.fieldValue = oDate;
					obj.uiFieldValue = oDate;
				}
			}
		});
		
		var oStartDate1 = new Date(nValidityEnd);
		var dateOffset = (24*60*60*1000) * 1;
		oStartDate1.setTime(oStartDate1.getTime() + dateOffset);
		
		oNextConditRec.tableColumnRecords.filter(function(obj, i, arr){
			if(obj.hasOwnProperty("dateOrder")){
				if(obj.dateOrder === "Start"){
					var oDate = dateTimeInst.format(oStartDate1);
					obj.fieldValueNew = oDate;
					obj.fieldValue = oDate;
					obj.uiFieldValue = oDate;
				}
			}
		});
		
		var oNextRecDates = this.getStartEndDateObjects(oNextConditRec);
		var oNextRecStartDate = new Date(oNextRecDates[0].uiFieldValue);
		var oNextRecEndDate = new Date(oNextRecDates[1].uiFieldValue);
		if(oNextRecStartDate > oNextRecEndDate){
			this.setConditionRecMode(nValidateRec, oValidateRec);
			return [oValidateRec, nValidateRec];
		}else{
			this.setConditionRecMode(nValidateRec, oValidateRec, oNextConditRec);
			return [oValidateRec, nValidateRec, oNextConditRec];
		}
	},
	
	//Case9: If start date is in the existing record range, but the end date greater than existing record range.
	case9OverLapStartDate: function(nValidityStart, nValidityEnd, oStartDate, oEndDate, nValidateRec, oValidateRec){

		var dateTimeInst = this.oDateFormat.getDateTimeInstance({pattern: "MM/dd/yyyy"});	
		if(oValidateRec){
			var oStrtDate1 = new Date(nValidityStart);
			nValidateRec.tableColumnRecords.filter(function(obj){
				if(obj.hasOwnProperty("dateOrder")){
					var oDate;
					if(obj.dateOrder === "Start"){
						oDate = dateTimeInst.format(oStrtDate1);
						obj.fieldValueNew = oDate;
						obj.fieldValue = oDate;
						obj.uiFieldValue = oDate;
					}
					if(obj.dateOrder === "End"){
						oDate = dateTimeInst.format(nValidityEnd);
						obj.fieldValueNew = oDate;
						obj.fieldValue = oDate;
						obj.uiFieldValue = oDate;
					}
				}
			});
			
			var oStrtDate2 = new Date(nValidityEnd);
			var dateOffset = (24*60*60*1000) * 1;
			oStrtDate2.setTime(oStrtDate2.getTime() + dateOffset);
			
			oValidateRec.tableColumnRecords.filter(function(obj){
				if(obj.hasOwnProperty("dateOrder")){
					if(obj.dateOrder === "Start"){
						var oDate = dateTimeInst.format(oStrtDate2);
						obj.fieldValueNew = oDate;
						obj.fieldValue = oDate;
						obj.uiFieldValue = oDate;
					}
				}
			});
			this.setConditionRecMode(nValidateRec, oValidateRec);
			return [nValidateRec, oValidateRec];
		}else{
			nValidateRec.tableColumnRecords.filter(function(obj){
				if(obj.hasOwnProperty("dateOrder")){
					if(obj.dateOrder === "End"){
						var oDate = dateTimeInst.format(nValidityEnd);
						obj.fieldValueNew = oDate;
						obj.fieldValue = oDate;
						obj.uiFieldValue = oDate;
					}
				}
			});
			this.setConditionRecMode(nValidateRec, "");
			return [nValidateRec];
		}
	},
		
	//For a given condition record, the below function returns the start and end date objects.
	getStartEndDateObjects: function(conditionRec){
		
		var cellsArray;
		var oDateArray = [];
		cellsArray = conditionRec.tableColumnRecords;
		if(!cellsArray){
			cellsArray = conditionRec;
		}
		cellsArray.filter(function(obj){
			if(obj.hasOwnProperty("dateOrder")){
				if(obj.fieldId === "DATAB" || obj.fieldId === "DATBI"){
					oDateArray.push(obj);
				}
			}
		});
		return oDateArray;
	},
		
	//Sorting 'Condition Records' based on validity start date.
	sortConditionRecords: function(oArray){
		var that = this;
		if(oArray.length > 1){
			oArray.sort(function(record1, record2) {
				
				var obj1 = record1.tableColumnRecords;
			    var obj2 = record2.tableColumnRecords;
			    
			    var dateObjects1 = that.getStartEndDateObjects(obj1);
				var startDate1 = new Date(dateObjects1[0].uiFieldValue);
				var endDate1 = new Date(dateObjects1[1].uiFieldValue);
				
				var dateObjects2 = that.getStartEndDateObjects(obj2);
				var startDate2 = new Date(dateObjects2[0].uiFieldValue);
				var endDate2 = new Date(dateObjects2[1].uiFieldValue);
				
				if (startDate1 < startDate2 && endDate1 < endDate2) {
			        return -1;
			    } else if (startDate1 === startDate2 && endDate1 === endDate2) {
			        return 0;
			    } else {
			        return 1;
			    }
			});
			return oArray;
		}
	},
	
	//Below function checks if the given two dates are equal. Comparison based on Day,Month,Year. [Time is not compared]
	checkTwoDatesIsEqual: function(oDate1, oDate2){
		
		var dd1 = oDate1.getDate();
		var mm1 = oDate1.getMonth();
		var yy1 = oDate1.getFullYear();
		
		var dd2 = oDate2.getDate();
		var mm2 = oDate2.getMonth();
		var yy2 = oDate2.getFullYear();
		
		if(dd1 === dd2 && mm1 === mm2 && yy1 === yy2){
			return true;
		}else{
			return false;
		}
	},
	
	//Get number of days between two dates
	getNumberOfDays: function(oDate1, oDate2){
		
		var oneDay = 1000*60*60*24;
		var oDate1_ms = oDate1.getTime();
		var oDate2_ms = oDate2.getTime();	
		var oDiff_ms = oDate2_ms - oDate1_ms;
		var oDays = Math.round(oDiff_ms/oneDay); 
		return oDays;
	},
	
	setConditionRecMode: function(nValidateRec, oValidateRec, oNextConditionRec){
		if(nValidateRec){
			if(Array.isArray(nValidateRec)){
				nValidateRec[0].tableColumnRecords[0].changeMode = "CREATE";
				nValidateRec[0].tableColumnRecords[1].colorCode = "CREATED";
			}else{
				nValidateRec.tableColumnRecords[0].changeMode = "CREATE";
				nValidateRec.tableColumnRecords[1].colorCode = "CREATED";
			}
		}
		
		if(oValidateRec){
			if(Array.isArray(oValidateRec)){
				oValidateRec[0].tableColumnRecords[0].changeMode = "UPDATE";
				oValidateRec[0].tableColumnRecords[1].colorCode = "IMPACTED";
			}else{
				oValidateRec.tableColumnRecords[0].changeMode = "UPDATE";
				oValidateRec.tableColumnRecords[1].colorCode = "IMPACTED";
			}
		}
		
		if(oNextConditionRec){
			if(Array.isArray(oNextConditionRec)){
				oNextConditionRec[0].tableColumnRecords[0].changeMode = "CREATE";
				oNextConditionRec[0].tableColumnRecords[1].colorCode = "CREATED";
			}else{
				oNextConditionRec.tableColumnRecords[0].changeMode = "CREATE";
				oNextConditionRec.tableColumnRecords[1].colorCode = "CREATED";
			}	
		}
	},
	
	getValidityDateInRange: function(oArray, startDate, endDate){
		
		for(var i=0; i<oArray.length; i++){
			var oConditionRec = oArray[i];
			var oDates = this.getStartEndDateObjects(oConditionRec);
		}
		
	}
};