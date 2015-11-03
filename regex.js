$(function(){

// --------------- Rules Controller----------------
(function(){
	$("#regexChangeForms").submit(function(){
		//取得转换内容
		var	doc = $("#source").val(),
			froms = $(".from"),
			tos = $(".to"),
			ignores = $(".ignore"),
			multilines = $(".multiline"),
			list_from=[],
			list_to=[],
			list_to_fn=[];

		// Check From/To inputs
		for (var i=0;i<froms.length;i++){
			// From
			var pram = "g";
			if ($(ignores[i]).attr("checked"))
				pram += "i";
			if ($(multilines[i]).attr("checked"))
				pram += "m";

			try {
				list_from[i] = new RegExp($(froms[i]).val(),pram);
			} catch(e){
				alert("Row "+(i+1)+" [From] is invalid RegExp! "+e);
				return false;
			}

			// To
			list_to[i] = $(tos[i]).val();
			try {
				// Check if is a function.Closure needs () to avoid error! 
				if (/^\s*\bfunction\b.*?\(/.test(list_to[i])){
					list_to_fn[i] = eval("list_to_fn["+i+"] = ("+list_to[i] + ")");
				}
			} catch(e){
				// To function check (1): static. if is "  function abc ( ..."
				alert("Row No."+(i+1)+" [To] is invalid function!\n"+e);
				return false;
			}
		}

		// Process (Update DOM immediately)
		$("#infos").text(" Processing... ");
		setTimeout(function(){
			for (var i=0;i<froms.length;i++){
				if (typeof list_to_fn[i]=="function"){
					try {
						doc=doc.replace(list_from[i],list_to_fn[i]);
					} catch(e){
						// To function check (2): dynamic
						alert("Row No."+(i+1)+" [To] is invalid function(Runtime)!\n"+e);
						doc="";
						break;
					}
				} else {
					doc=doc.replace(list_from[i],list_to[i]);
				}
			}
			//填入
			$("#target").val(doc);
			$("#infos").empty();
		}, 50);

		return false;
	});

	// Add more rules
	$("#addRules").click(function(){
		var newRule = $("#rules").children(":last").clone(true);
		$("textarea",newRule).val("");// ie: value is cloned
		$("#rules").append(newRule);
	});

	// Save the rules
	$("#saveRules").click(function(){
		var r = "{\n";
		$("#rules").children().each(function(i){
			r += "\""+i+"\":\n{\n";
			r += "\"from\":\""+$(".from",this).val().oneLine()+"\",\n";
			r += "\"to\":\""+$(".to",this).val().oneLine()+"\",\n";
			r += "\"ignore\":"+$(".ignore",this).prop("checked")+",\n";
			r += "\"multiline\":"+$(".multiline",this).prop("checked")+"\n";
			r += "},\n";
		});
		r = r.substring(0,r.length-2);// remove last [,\n]
		r += "\n}";
		$("#backup").val(r.replace(/\n/g,""));// remove all debug \n
	});
	
	
	// Restore the rules
	$("#restoreRules").click(function(){
		var r = $("#backup").val();
		try{
		 	r = $.parseJSON(r);
		 	//r = eval("r = ("+r+")");
		}catch(e){
			alert("Rules is invalid JSON type!\n "+e);
			return false;
		}
		var template = $("#rules").children(":first").clone(true);
		// Empty only when json contains sub-objects
		for (var i in r) {
			$("#rules").empty();
			break;
		}
		for (var i in r) {
			var li = $(template).clone(true);
			$(".from", li).val(r[i].from);
			$(".to", li).val(r[i].to);
			$(".ignore", li).attr("checked",r[i].ignore);
			if (r[i].multiline) $(".multiline", li).attr("checked",r[i].multiline);
			$("#rules").append(li);
		}
	});

})();


// --------------- Rules Navi----------------
(function(){

	/* Rules background-colors
	$(".rules").on("mouseenter",function (){
		$(this).css("background-color","#EFE");
	}).on("mouseleave",function (){
		console.log("leave");
		$(this).css("background-color","#FFF");
	});*/

	// Rules switchers
	$(".functionSwitch").on("mouseenter",function(){
		clearTimeout($(this).data("hideTimer"));
		$(this).html("☂");
		$(this).parent().find(".functionArea").show();
	}).on("mouseleave",function(){
		var $focusedFS = $(this);
		var hideSwitch = function (){
			$focusedFS.html("☄");
			$focusedFS.parent().find(".functionArea").hide("slow");
		}
		// hide it after 2secs
		$focusedFS.data("hideTimer",setTimeout(hideSwitch, 2000));
		$focusedFS.parent().find(".functionArea")
		.one("mouseenter",function(){
				clearTimeout($focusedFS.data("hideTimer")); 
			})
		.one("mouseleave",function(){
				$focusedFS.data("hideTimer",setTimeout(hideSwitch, 2000));
			});
	});

	// Delete the rules
	$(".del").on("click",function(){
		var thisLI = $(this).parents("li");
		if (thisLI.siblings().length > 0)
			thisLI.remove();
	});

	$(".up").on("click",function(){
		var thisLI = $(this).parents("li");
		if (thisLI.prevAll().length > 0) 
			swapLI(thisLI, thisLI.prev());
	});

	$(".down").on("click",function(){
		var thisLI = $(this).parents("li");
		if (thisLI.nextAll().length > 0)
			swapLI(thisLI, thisLI.next());
	});

	$(".copy_and_up_case").on("click",function(){
		newRuleThen($(this), function(v){
			return v.toUpperCase();
		});
	});

	$(".copy_and_low_case").on("click",function(){
		newRuleThen($(this), function(v){
			return v.toLowerCase();
		});
	});

	$(".copy_and_cap").on("click",function(){
		newRuleThen($(this), function(s){
			var c = s.charAt(0);
			return (c===c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()) + s.slice(1);
		});
	});

	$(".copy_and_camel").on("click",function(){
		newRuleThen($(this), function(v){
			// abcDef <-> abc_def
			return  v.contains('_') ? 
				v.replace(/_([a-zA-Z])/g, function (g) { return g[1].toUpperCase(); }) :
				v.replace(/([a-z][A-Z])/g, function (g) { return g[0] + '_' + g[1]; }) ;
		});
	});

	function newRuleThen($this, fn){
		var $current=$this.parents("li"),
		    $from=$(".from",$current),
		    $to=$(".to",$current),
		    $newRule = $current.clone(true),
		    $newFrom=$(".from",$newRule),
		    $newTo=$(".to",$newRule);

		$newFrom.val(fn($from.val()));
		$newTo.val(fn($to.val()));

		$("#rules").append($newRule);
	}

	function swapLI(a, b){
		swapVal(a.find(".from"), b.find(".from"));
		swapVal(a.find(".to"), b.find(".to"));
		b.animateHighlight();
	}

	function swapVal(a,b){
		var tmp=a.val();
		a.val(b.val());
		b.val(tmp);
	}

})();

// --------------- DB ----------------
(function(){
	var ajaxURL="/regex",
	    hasChanged = false;

	if (window.location.href.indexOf("file:///") >= 0 ) {
		// Use "--allow-file-access-from-files" to ON localfile ajax in chrome
		var ajaxURL="regex.txt";
	}

	function doAjax(type,data,btn){
		$.ajax({
			type: type,
			url: ajaxURL,
			dataType : "text",
			data: data,
			beforeSend : function(){
			   hasChanged = false;
			   $(btn).attr("disabled",true);
			},
			success: function(msg){
				$(btn).attr("disabled",false);
				//$("#backup").val( msg );
				var allRules;
				eval("allRules="+msg.replace(/\n/g,""));
				$("#rules_div").empty();
				for (var m in allRules) {
					var r = $("<label><input type='radio' name='rulesgroup'>"+m+"</label>").attr("id",m)
						.click(function(){
							$("#backup").val( JSON.stringify(allRules[$(this).attr("id")]) );
						})
						.dblclick(function(){
							$("#backup").val( JSON.stringify(allRules[$(this).attr("id")]) );
							$("#restoreRules").trigger("click");
							$("#applyRegex").trigger("click");
						});
					$("#rules_div").append(r).append("<br />");
					//$("#backup").before(JSON.stringify(allRules[m]));
				}
		   }
		});
	}
	
	// Restore the rules
	$("#search").click(function(){
		doAjax("GET",{"name" : $("#ruleName").val()},this);
	});
	$("#list").click(function(){
		doAjax("GET",{"name" : "all"},this);
	});
	
	// Restore the rules
	$("#save").click(function(){
		if ($("#ruleName").val()==""){
			alert("No title!");
			return;
		} else if (hasChanged==false) {
			alert("No changed!");
			return;
		}
		doAjax("POST",{
		   name :$("#ruleName").val(),
		   context :$("#backup").val()
	   },this);
	});
	$("#delete").click(function(){
		doAjax("PUT",{"name" : $("#ruleName").val()},this);
	});
		

	$("#backup").change(function(){
		hasChanged = true;
	});

})();


// --------------- Others ----------------
(function(){
	// focus enhance
	$("#source,#target").click(function(){this.select();})
	$("#source").eraseSA();
	$("#ruleSample,#ruleName,#trExecResult,#trIsMatched,#trVisualResult,#trTestResult").click(function(){
		$(this).selectAll();
	});

	// Ajust the mouse events: select all before right click 
	$("textarea").mousedown(function(event) {
		switch (event.which) {
			case 1:
			//alert('Left mouse button pressed');
			break;
			case 2:
			//alert('Middle mouse button pressed');
			break;
			case 3:
			//alert('Right mouse button pressed');
				$(this).select();
			break;
			default:
			//alert('You have a strange mouse');
		}
	});
})();

// --------------- JS Editor ----------------
(function(){
	// CodeMirror
	var codemirror = CodeMirror.fromTextArea(document.getElementById("code"), {
		lineNumbers: true,
		matchBrackets: true
	});
	codemirror.setSize("100%","90%");

	$("#source,#backup,#rulesArea textarea").on("dblclick",function(){
		var $clicked=$(this);
		$("#jseditor").simpleDialog({
			onLoad: function(x){
				//textBoxの内容がDialogに表示され。
				codemirror.setValue($clicked.val());
				codemirror.focus();
				codemirror.refresh();
			},
			onClose: function(){
				//textBoxの内容がDialogに戻す。
				$clicked.val(codemirror.getValue());
				$clicked.focus();
			}
		});
	});
})();

// --------------- Try Regex ----------------
(function(){

$("#tryRegexLink").click(function(){
	$("#tryRegexArea").simpleDialog();
});

$("#trGetRowText").toggle(function(){
	$(".trInfos").show();
},function(){
	$(".trInfos").hide();
});

$("#trHideNonHighlight").toggle(function(){
	$(this).data("originalHtml", $("#trVisualResult").html());
	//Find text node
	$("#trVisualResult").contents().filter(function(){ return this.nodeType == 3; }).replaceWith(" ");// or remove()
},function(){
	$("#trVisualResult").html($(this).data("originalHtml"));
});

$("#tryRegexArea input[type=text],#tryRegexArea textarea").eraseSA();

$("#tryRegexArea").submit(function(){
	try {
		doRegex($("#trInput").val(), getRegex());
	}catch(e) {
		alert(e);
	}
});

$("#trGoKeep").click(function(){
	try {
		doRegex($("#trInput").val(), getRegex(), "keepCrLf");
	}catch(e) {
		alert(e);
	}
});

function getRegex(isSelectedAll){
	var flg = "", regexStr = $("#trRegex").val();
	if ($("#trIgnore").prop("checked")) flg += "i";
	if ($("#trGlobal").prop("checked")) flg += "g";
	if ($("#trMultiline").prop("checked")) flg += "m";

	if (isSelectedAll) 
		regexStr = "(" + regexStr + ")";
	var re = null;
	try {
		re = new RegExp(regexStr, flg);
	}catch(e){
		throw "RegExp format error!"
	}
	return re;
}

function doRegex(str, re, isKeep) {
	// 1) test only
	$("#trTestResult").html(""+re.test(str));

	// 2) lastindex changed when [test] execute before [exec]
	re.lastIndex=0;

	var msg = '';
	if (isKeep) {
		var ss = str.split('\n');
		for (var i in ss) {
			var tmp=doRegexMatchOnce(ss[i], re)
			if (tmp) msg+=tmp; else msg+="<br />";
		}
	} else {
		msg=doRegexMatchOnce(str, re);
	}
	if (msg.replace(/<br \/>|\n/g,'')==='')
		$("#trExecResult").html('UNMATCH');
	else
		$("#trExecResult").html(msg);

	// 3) get multi result at once
	var match = str.match(re);
	match ? $("#trIsMatched").html("Matched:"+match.length + " [" + match + "]") : $("#trIsMatched").html("Unmatch");

	// 4) replace
	$("#trVisualResult").html(  str.replace( getRegex(true), "<span style='background-color:yellow'>$1</span>").replace(/\n/g,"<br />")  );
}

function doRegexMatchOnce(str, re){
	// Use exec to get each matched info 
	var m, msg = "",c=1;
	while (m = re.exec(str)) // null "" false... or it will loop endless
	{
		// escape html tag in m[0]
		msg += "<span class='trInfos' style='display:none;'>No."+(c++)+" Found [</span>" + $("<div></div>").text(m[0]).html() + "<span class='trInfos' style='display:none;'>] at " + m.index;
		msg += ". Next match starts at " + re.lastIndex;
		msg += "</span>";
		if (!re.global)
			break;
		else
			msg +=", "
	}
	return msg.replace(/, $/, '') + "<br />";
}


doRegex($("#trInput").val(), getRegex());

})();


});// End $.onReady



// --------------- jQuery extends (this ==> jQuery object) ----------------
$.fn.animateHighlight = function (highlightColor, duration) {
	var $this = this;
	var highlightBg = highlightColor || "#FFFF9C";
	var animateMs = duration || 1000;
	var originalBg = $this.css("background-color");

	if (!originalBg || originalBg == highlightBg)
		originalBg = "#FFFFFF"; // default to white

	$this.css("backgroundColor", highlightBg)
		.animate({ backgroundColor: originalBg }, animateMs, null, function () {
			$this.css("backgroundColor", originalBg); 
		});
};

$.fn.selectAll = function () {
	var el = this.get(0); // Only one can be selected
	if ($(el).val()){
		// Input tag support(NOT string empty | null | 0| undefined)
		$(el).select();
	} else
	if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
		// Non IE
		var range = document.createRange();
		range.selectNodeContents(el);
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	} else
	if (typeof document.selection != "undefined" && typeof document.body.createTextRange != "undefined") {
		// IE
		var textRange = document.body.createTextRange();
		textRange.moveToElementText(el);
		textRange.select();
	}
}

// Erase textbox default value: like `placeholder` attributes in html5
$.fn.eraseSA = function () {
	$(this).on("focus blur", function(){
		var obj = this;
		if (obj.value == obj.defaultValue) {
			obj.value = "";
			return;
		}
		if (obj.value == "") obj.value = obj.defaultValue;
	});
}
