// AMD
(function(){

// JSON stringify
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
if (!window.JSON) {
  window.JSON = {
    parse: function (sJSON) { return eval("(" + sJSON + ")"); },
    stringify: function (vContent) {
      if (vContent instanceof Object) {
        var sOutput = "";
        if (vContent.constructor === Array) {
          for (var nId = 0; nId < vContent.length; sOutput += this.stringify(vContent[nId]) + ",", nId++);
          return "[" + sOutput.substr(0, sOutput.length - 1) + "]";
        }
        if (vContent.toString !== Object.prototype.toString) { return "\"" + vContent.toString().replace(/"/g, "\\$&") + "\""; }
        for (var sProp in vContent) { sOutput += "\"" + sProp.replace(/"/g, "\\$&") + "\":" + this.stringify(vContent[sProp]) + ","; }
        return "{" + sOutput.substr(0, sOutput.length - 1) + "}";
      }
      return typeof vContent === "string" ? "\"" + vContent.replace(/"/g, "\\$&") + "\"" : String(vContent);
    }
  };
}



// Trimming space from both side of the string
String.prototype.trim = function() {
	return String(this).replace(/^\s+|\s+$/g,"");
}
 
// Trimming space from left side of the string
String.prototype.ltrim = function() {
	return String(this).replace(/^\s+/,"");
}
 
// Trimming space from right side of the string
String.prototype.rtrim = function() {
	return String(this).replace(/\s+$/,"");
}

String.prototype.times = function(times){
    var ret = "";
    for (var i=0; i<times; i++)
      ret += String(this);
    return ret;
}
// pads left
String.prototype.lpad = function(padString, length) {
	var str = String(this);
	while (str.length < length)
		str = padString + str;
	return str;
}

// pads right
String.prototype.rpad = function(padString, length) {
	var str = String(this);
	while (str.length < length)
		str = str + padString;
	return str;
}

String.prototype.getBytes = function () {
  var ch, st, re = [];
  for (var i = 0; i < String(this).length; i++ ) {
    ch = String(this).charCodeAt(i);  // get char 
    st = [];                 // set up "stack"
    do {
      st.push( ch & 0xFF );  // push byte to stack
      ch = ch >> 8;          // shift value down by 1 byte
    }  
    while ( ch );
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat( st.reverse() );
  }
  // return an array of bytes
  return re;
}

String.prototype.isNumber = function () {
  return !isNaN(parseFloat(this)) && isFinite(this);
}

// var n = 112312; // var is needed, 1.times() not work
Number.prototype.times = function(func, scope){
    var v = this.valueOf();
    for (var i=0; i < v; i++){
        func.call(scope||window,i);
    }
};

// "1234" --> "1,234"
Number.prototype.comma = splitNumComma;
String.prototype.comma = splitNumComma;
function splitNumComma() {
    var to = String(this);
    var tmp = "";
    while (to != (tmp = to.replace(/^([+-]?\d+)(\d\d\d)/,"$1,$2"))){
        to = tmp;
    }
    return to;
}

// "abc
// \ttt" --> "abc\n\\ttt"
String.prototype.oneLine = function(){
	return String(this).replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/\"/g,"\\\"").replace(/\t/g,"\\t");
}


})();// End AMD