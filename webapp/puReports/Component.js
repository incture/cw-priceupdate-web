sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"PU_Reports/model/models",
	"sap/ui/core/IconPool",
    "sap/ui/model/json/JSONModel"
], function(UIComponent, Device, models , IconPool, JSONModel) {
	"use strict";

	return UIComponent.extend("PU_Reports.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			
			UIComponent.prototype.init.apply(this, arguments);
			this._router = this.getRouter();

			// initialize the router
			this._router.initialize();
			
			var oDeviceModel = new JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.setModel(oDeviceModel, "device");
		          
	        IconPool.addIcon("tachometer", "fa", {
	        	fontFamily:"FontAwesome",
	        	content:"f0e4"
	        });
	        
	        IconPool.addIcon("user", "fa", {
	        	fontFamily:"FontAwesome",
	        	content:"f007"
	        });
	        
	        IconPool.addIcon("creditCard", "fa", {
	        	fontFamily:"FontAwesome",
	        	content:"f09d"
	        });
	        
	        IconPool.addIcon("trophy", "fa", {
	        	fontFamily:"FontAwesome",
	        	content:"f091"
	        });
		}
	});
});