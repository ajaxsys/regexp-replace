/*
** Add a simple dialog to the page, 
** and move element into the dialog(Keep events).
** 
** Usage:

$("textarea").simpleDialog({
	option: {
		toggle: true, // auto move element to dialog
		show: true // auto show
	},
	onLoad: function(d){
		//show textBox to dialog
	},
	onClose: function(){
		//return textBox value to page
	}
});
** Notice: NOT support "Quirks" mode in IE8 (F12, alt+Q)
** Author : javaeecoding (at) gmail.com
** Licence: Free to use it. (No responsable)
*/

$.fn.extend({

"simpleDialog" : function (param){
	// =================================================================================== //
	// =============== Dom element funtion ( this===DOM element ) ======================== //
	// =================================================================================== //
	//console.log($(this)[0].outerHTML);
	var element = this;

	var $simpleDialog = getDialogFrame(); // Not $("#simple_dialog_outer")

	// Ignore if the same element fired (IE bugs)
	if ($simpleDialog.isSameDialog(element))
		return;

	// ReOpen if need
	if ($simpleDialog.isOpen()) 
		$simpleDialog.close(element);

	// Save params
	param = initParam(param);
	$simpleDialog.saveEnv(element, param);

	if (param.options.show)
		$simpleDialog.open(element);
	return $simpleDialog;

	// =================================================================================== //
	// =============== SimpleDialog funtions( this===$simpleDialog ) ===================== //
	// =================================================================================== //
	function saveEnv(thisElement, thisParam){
		this._callback = thisParam;
		this._opt = thisParam.options;
		// Keep this element & options
		this.data("thisElement",thisElement);
		this.data("thisParam",thisParam);
	}

	function isSameDialog(thisElement){
		return ( this.isOpen() &&
			this.data("thisElement") && 
			this.data("thisElement")[0]===thisElement[0]
		);
	}

	function open(element){
		this.data("thisElement").show();// Show before onLoad, problems with other plugins(like,code mirror).
		this._resizeOn();
		this.show();// outer div show
		this.focus();
		this.toggleContent();// move this element into dialog
		this._callback.onLoad(this.$content);
	}

	function close(element){
		this.data("thisElement").hide();
		this._callback.onClose(this.$content);
		this._resizeOff();
		this.hide();// inner div show
		this.toggleContent();// move this element to original place
		this.$content.empty();
	}

	function isOpen(){
		return this.is(":visible");
	}

	function resizeDialogOn(){
		$(window).bind("resize",resizeDialog);
		resizeDialog();
	}

	function resizeDialogOff(){
		$(window).unbind("resize",resizeDialog);
	}

	function resizeDialog(){
		// this not points to dialog when bind to DOM events
		$simpleDialog.$layout.height(parseInt( $(window).height(),10)-100);// minus padding
		$simpleDialog.height($(document).height());
	}

	function toggleContent(){
		if ( !this._opt.toggle==true ) return;

		var tmpId = "simple_dialog_tmp_this_element";
		if (this.isOpen()) {
			// keep events
			var thisElement = this.data("thisElement");

			// Keep a local copy
			var dummy = $(thisElement).clone(false);
			// Original dialog contents clone.
			dummy.attr("id",tmpId).find("*").removeAttr("id").hide();
			$(thisElement).after(dummy);

			// Move to simple_dialog_inner
			this.$content.append($(thisElement).detach());

		} else {
			$("#"+tmpId).replaceWith(this.data("thisElement"));
		}
	}


	// =============== Private funtions ==================== //
	function getDialogFrame() {
		var $dialog = $("#simple_dialog_outer");
		if ($dialog.length == 0) {
			// create a dialog : need to give the div a tabindex so it can receive focus.
			var $dlgOut = $('<div id="simple_dialog_outer" tabindex="1983" style="clear:both;position:fixed;bottom:0px;top:0px;left:0px;right:0px;margin:0px;padding: 0px;height:100%;width:100%;background-color:gray;display:none;background-color:rgba(0,0,0,0.5);filter: progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr=\'#80000000\', EndColorStr=\'#80000000\');"></div>'),
			    $dlgMid = $('<div id="simple_dialog_mid" style="margin:50px;"></div>'),
			    $dlgIn = $('<div id="simple_dialog_inner" tabindex="1981" style="height:85%;overflow: auto;border: 3px solid green;background-color: #FFF;"></div>');
			$("body").append($dlgOut.append($dlgMid.append($dlgIn)));

			$dialog = $dlgOut;
			$dialog.$layout = $dlgMid;
			$dialog.$content = $dlgIn;

			registMethods($dialog);
			initEvents($dialog);
			// Keep dialog with events.Note that $("#simple_dialog_outer") will create antoher object without registed & inited events.
			$dialog.data("thisDialog",$dialog);
		}

		return $dialog.data("thisDialog");
	}

	function initEvents($dialog) {
		$dialog.on("keydown",function(event){
			if (event.keyCode==27) {
				$dialog.close();
			}
		}).click(function(){
			$dialog.close();
		});

		// Not use parent events
		$dialog.$content.click(function(event){
			event.stopPropagation();
		});
	}

	function registMethods($dialog){
		$dialog._resizeOn = resizeDialogOn;  // _ means private
		$dialog._resizeOff = resizeDialogOff;
		$dialog.close = close;
		$dialog.isSameDialog = isSameDialog;
		$dialog.isOpen = isOpen;
		$dialog.open = open;
		$dialog.saveEnv = saveEnv;
		$dialog.toggleContent = toggleContent;
	}

	// Use defaultParam as a template & set param to it
	function initParam(param){
		var defaultParam={
			options: {
				toggle: true, // auto move element to dialog
				show: true // auto show
			},
			onLoad: function(d){},
			onClose: function(d){}
		};

		// supported parm == null 
		$.extend(true, defaultParam, param);
		return defaultParam;

/*		// my $.extend
		if (param==null) {
			return defaultParam;
		}
		var checkSubObjects = function (defaultParam,param){
			for (var i in defaultParam) {
				if (typeof defaultParam[i] == typeof param[i]) {
					if (typeof defaultParam[i] == "object") {
						checkSubObjects(defaultParam[i], param[i]);// recursive
					} else {
						defaultParam[i]=param[i];
					}
				}
				
			}
		};
		checkSubObjects(defaultParam,param);
		return defaultParam;
*/
	}


}//end of plugin


});//end fn.extend
