(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {
  'use strict';

  var xhr = require('xhr');
  var hasClass = require('has-class');
  var addClass = require('add-class');
  var removeClass = require('remove-class');
  var Parallax = require('parallax-scroll');

  var menu = require('fws-navigation');
  var nav = require('fws-scrollnav');
  var glossary = require('fws-glossary');
  var highlighter = require('fws-highlighter');

  var baseUrl = document.body.getAttribute('data-root');


  var parallax = new Parallax('.parallax', {
    speed: 0.5
  });
  parallax.animate();

  var terms;

  var lunrIndex = function () {
    this.field('name', { boost: 10 });
    this.field('description');
    this.field('related', { boost: 5 });
    this.field('acronym', { boost: 3 });
    this.ref('id');
  };

  xhr.get(baseUrl + 'data/terms.js', function (err, res, body) {
    terms = JSON.parse(body);

    nav.init({
      content: document.getElementById('content'),
      insertTarget: document.querySelector('.side-nav'),
      showHeadline: false,
      scrollOffset: 55
    });

    highlighter.init({
      words: terms.map(function (term) {
        return term.name;
      }),
      wordsOnly: true,
      content: document.querySelector('#content')
    });

    menu.init({
      toggleClass: 'fws-menu-trigger',
      position: 'left'
    });

    glossary.init({
      terms: terms,
      lunrIndex: lunrIndex,
      toggleClass: 'highlight',
      position: 'left'
    });

    document.querySelector('.glossary-trigger').addEventListener('click', glossary.toggle);
    document.querySelector('.fws-menu-trigger').addEventListener('click', menu.show);
    document.getElementById('search-trigger').addEventListener('click', menu.toggleSearch);
    document.querySelector('.toggle-contact').addEventListener('click', function () {
      toggleActiveClass(document.querySelector('.contact-drawer'));
    });

    document.querySelector('.toggle-share').addEventListener('click', function () {
      toggleActiveClass(document.querySelector('.share-drawer'));
    });

    var drawerToggles = document.querySelectorAll('.close-drawer');

    for (var i = 0; i < drawerToggles.length; i++) {
      drawerToggles[i].addEventListener('click', removeActiveClassFromDrawer);
    }

    function removeActiveClassFromDrawer (e) {
      var parent = e.target.parentNode;
      if (parent) removeClass(parent, 'active');
    }

    var scrollNav = document.querySelector('.scroll-nav');
    scrollNav.addEventListener('click', toggleScrollNav);

    function toggleScrollNav() {
      if ( hasClass(scrollNav, 'open') ) removeClass(scrollNav, 'open');
      else addClass(scrollNav, 'open');
    }

    function toggleActiveClass(el, theClass) {
      var activeClass = theClass || 'active';
      if ( hasClass(el, activeClass) ) removeClass(el, activeClass);
      else addClass(el, activeClass);
    }
  });

})();

},{"add-class":2,"fws-glossary":6,"fws-highlighter":7,"fws-navigation":8,"fws-scrollnav":9,"has-class":11,"parallax-scroll":28,"remove-class":61,"xhr":63}],2:[function(require,module,exports){
'use strict';
var objType = require('obj-type');
var arrayUnion = require('array-union');

function add(el, str) {
	if (el.classList) {
		el.classList.add(str);
		return;
	}

	var cn = el.className.split(' ').filter(function (x) {
		return x !== '';
	});

	el.className = arrayUnion(cn, str.trim()).join(' ');
}

module.exports = function (el, str) {
	if (objType(el).indexOf('element') === -1 && objType(el) !== 'nodelist') {
		throw new TypeError('Expected HTML DOM element(s) as first argument');
	}

	if (typeof str !== 'string') {
		throw new TypeError('Expected a string as second argument');
	}

	if (objType(el).indexOf('element') !== -1) {
		add(el, str);
		return;
	}

	for (var i = 0; i < el.length; i++) {
		add(el[i], str);
	}
};

},{"array-union":3,"obj-type":26}],3:[function(require,module,exports){
'use strict';
var arrayUniq = require('array-uniq');

module.exports = function () {
	return arrayUniq([].concat.apply([], arguments));
};

},{"array-uniq":4}],4:[function(require,module,exports){
(function (global){
'use strict';

// there's 3 implementations written in increasing order of efficiency

// 1 - no Set type is defined
function uniqNoSet(arr) {
	var ret = [];

	for (var i = 0; i < arr.length; i++) {
		if (ret.indexOf(arr[i]) === -1) {
			ret.push(arr[i]);
		}
	}

	return ret;
}

// 2 - a simple Set type is defined
function uniqSet(arr) {
	var seen = new Set();
	return arr.filter(function (el) {
		if (!seen.has(el)) {
			seen.add(el);
			return true;
		}
	});
}

// 3 - a standard Set type is defined and it has a forEach method
function uniqSetWithForEach(arr) {
	var ret = [];

	(new Set(arr)).forEach(function (el) {
		ret.push(el);
	});

	return ret;
}

// V8 currently has a broken implementation
// https://github.com/joyent/node/issues/8449
function doesForEachActuallyWork() {
	var ret = false;

	(new Set([true])).forEach(function (el) {
		ret = el;
	});

	return ret === true;
}

if ('Set' in global) {
	if (typeof Set.prototype.forEach === 'function' && doesForEachActuallyWork()) {
		module.exports = uniqSetWithForEach;
	} else {
		module.exports = uniqSet;
	}
} else {
	module.exports = uniqNoSet;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":12}],6:[function(require,module,exports){
(function (global){
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.Glossary=t()}}(function(){var t;return function e(t,n,r){function i(s,a){if(!n[s]){if(!t[s]){var u="function"==typeof require&&require;if(!a&&u)return u(s,!0);if(o)return o(s,!0);var l=new Error("Cannot find module '"+s+"'");throw l.code="MODULE_NOT_FOUND",l}var c=n[s]={exports:{}};t[s][0].call(c.exports,function(e){var n=t[s][1][e];return i(n?n:e)},c,c.exports,e,t,n,r)}return n[s].exports}for(var o="function"==typeof require&&require,s=0;s<r.length;s++)i(r[s]);return i}({1:[function(){},{}],2:[function(t,e){e.exports=function(t){return t&&"object"==typeof t?window&&"object"==typeof window.Node?t instanceof window.Node:"number"==typeof t.nodeType&&"string"==typeof t.nodeName:!1}},{}],3:[function(e,n,r){(function(i){!function(e){if("object"==typeof r&&"undefined"!=typeof n)n.exports=e();else if("function"==typeof t&&t.amd)t([],e);else{var o;o="undefined"!=typeof window?window:"undefined"!=typeof i?i:"undefined"!=typeof self?self:this,o.jade=e()}}(function(){return function t(n,r,i){function o(a,u){if(!r[a]){if(!n[a]){var l="function"==typeof e&&e;if(!u&&l)return l(a,!0);if(s)return s(a,!0);var c=new Error("Cannot find module '"+a+"'");throw c.code="MODULE_NOT_FOUND",c}var f=r[a]={exports:{}};n[a][0].call(f.exports,function(t){var e=n[a][1][t];return o(e?e:t)},f,f.exports,t,n,r,i)}return r[a].exports}for(var s="function"==typeof e&&e,a=0;a<i.length;a++)o(i[a]);return o}({1:[function(t,e,n){"use strict";function r(t){return null!=t&&""!==t}function i(t){return(Array.isArray(t)?t.map(i):t&&"object"==typeof t?Object.keys(t).filter(function(e){return t[e]}):[t]).filter(r).join(" ")}function o(t){return a[t]||t}function s(t){var e=String(t).replace(u,o);return e===""+t?t:e}n.merge=function l(t,e){if(1===arguments.length){for(var n=t[0],i=1;i<t.length;i++)n=l(n,t[i]);return n}var o=t["class"],s=e["class"];(o||s)&&(o=o||[],s=s||[],Array.isArray(o)||(o=[o]),Array.isArray(s)||(s=[s]),t["class"]=o.concat(s).filter(r));for(var a in e)"class"!=a&&(t[a]=e[a]);return t},n.joinClasses=i,n.cls=function(t,e){for(var r=[],o=0;o<t.length;o++)r.push(e&&e[o]?n.escape(i([t[o]])):i(t[o]));var s=i(r);return s.length?' class="'+s+'"':""},n.style=function(t){return t&&"object"==typeof t?Object.keys(t).map(function(e){return e+":"+t[e]}).join(";"):t},n.attr=function(t,e,r,i){return"style"===t&&(e=n.style(e)),"boolean"==typeof e||null==e?e?" "+(i?t:t+'="'+t+'"'):"":0==t.indexOf("data")&&"string"!=typeof e?(-1!==JSON.stringify(e).indexOf("&")&&console.warn("Since Jade 2.0.0, ampersands (`&`) in data attributes will be escaped to `&amp;`"),e&&"function"==typeof e.toISOString&&console.warn("Jade will eliminate the double quotes around dates in ISO form after 2.0.0")," "+t+"='"+JSON.stringify(e).replace(/'/g,"&apos;")+"'"):r?(e&&"function"==typeof e.toISOString&&console.warn("Jade will stringify dates in ISO form after 2.0.0")," "+t+'="'+n.escape(e)+'"'):(e&&"function"==typeof e.toISOString&&console.warn("Jade will stringify dates in ISO form after 2.0.0")," "+t+'="'+e+'"')},n.attrs=function(t,e){var r=[],o=Object.keys(t);if(o.length)for(var s=0;s<o.length;++s){var a=o[s],u=t[a];"class"==a?(u=i(u))&&r.push(" "+a+'="'+u+'"'):r.push(n.attr(a,u,!1,e))}return r.join("")};var a={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"},u=/[&<>"]/g;n.escape=s,n.rethrow=function c(e,n,r,i){if(!(e instanceof Error))throw e;if(!("undefined"==typeof window&&n||i))throw e.message+=" on line "+r,e;try{i=i||t("fs").readFileSync(n,"utf8")}catch(o){c(e,null,r)}var s=3,a=i.split("\n"),u=Math.max(r-s,0),l=Math.min(a.length,r+s),s=a.slice(u,l).map(function(t,e){var n=e+u+1;return(n==r?"  > ":"    ")+n+"| "+t}).join("\n");throw e.path=n,e.message=(n||"Jade")+":"+r+"\n"+s+"\n\n"+e.message,e},n.DebugItem=function(t,e){this.lineno=t,this.filename=e}},{fs:2}],2:[function(){},{}]},{},[1])(1)})}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{fs:1}],4:[function(t,e){function n(t,e){return t="number"==typeof t||g.test(t)?+t:-1,e=null==e?v:e,t>-1&&t%1==0&&e>t}function r(t,e,n){var r=t[e];(!u(r,n)||u(r,w[e])&&!S.call(t,e)||void 0===n&&!(e in t))&&(t[e]=n)}function i(t){return function(e){return null==e?void 0:e[t]}}function o(t,e,n,i){n||(n={});for(var o=-1,s=e.length;++o<s;){var a=e[o],u=i?i(n[a],t[a],a,n,t):t[a];r(n,a,u)}return n}function s(t){return p(function(e,n){var r=-1,i=n.length,o=i>1?n[i-1]:void 0,s=i>2?n[2]:void 0;for(o="function"==typeof o?(i--,o):void 0,s&&a(n[0],n[1],s)&&(o=3>i?void 0:o,i=1),e=Object(e);++r<i;){var u=n[r];u&&t(e,u,r,o)}return e})}function a(t,e,r){if(!h(r))return!1;var i=typeof e;return("number"==i?l(r)&&n(e,r.length):"string"==i&&e in r)?u(r[e],t):!1}function u(t,e){return t===e||t!==t&&e!==e}function l(t){return null!=t&&!("function"==typeof t&&c(t))&&f(x(t))}function c(t){var e=h(t)?b.call(t):"";return e==y||e==m}function f(t){return"number"==typeof t&&t>-1&&t%1==0&&v>=t}function h(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}var d=t("lodash.keysin"),p=t("lodash.rest"),v=9007199254740991,y="[object Function]",m="[object GeneratorFunction]",g=/^(?:0|[1-9]\d*)$/,w=Object.prototype,S=w.hasOwnProperty,b=w.toString,x=i("length"),k=s(function(t,e,n,r){o(e,d(e),t,r)});e.exports=k},{"lodash.keysin":7,"lodash.rest":8}],5:[function(t,e){function n(t,e,n){var r=n.length;switch(r){case 0:return t.call(e);case 1:return t.call(e,n[0]);case 2:return t.call(e,n[0],n[1]);case 3:return t.call(e,n[0],n[1],n[2])}return t.apply(e,n)}function r(t,e,n,r){return void 0===t||i(t,a[n])&&!u.call(r,n)?e:t}function i(t,e){return t===e||t!==t&&e!==e}var o=t("lodash.assigninwith"),s=t("lodash.rest"),a=Object.prototype,u=a.hasOwnProperty,l=s(function(t){return t.push(void 0,r),n(o,void 0,t)});e.exports=l},{"lodash.assigninwith":4,"lodash.rest":8}],6:[function(t,e){var n=Array.isArray;e.exports=n},{}],7:[function(t,e,n){(function(t){function r(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r}function i(t){return t&&t.Object===Object?t:null}function o(t,e){return t="number"==typeof t||O.test(t)?+t:-1,e=null==e?S:e,t>-1&&t%1==0&&e>t}function s(t){for(var e,n=[];!(e=t.next()).done;)n.push(e.value);return n}function a(t){t=null==t?t:Object(t);var e=[];for(var n in t)e.push(n);return e}function u(t){return function(e){return null==e?void 0:e[t]}}function l(t){var e=t?t.length:void 0;return v(e)&&(R(t)||g(t)||f(t))?r(e,String):null}function c(t){var e=t&&t.constructor,n="function"==typeof e&&e.prototype||L;return t===n}function f(t){return d(t)&&$.call(t,"callee")&&(!M.call(t,"callee")||P.call(t)==b)}function h(t){return null!=t&&!("function"==typeof t&&p(t))&&v(z(t))}function d(t){return m(t)&&h(t)}function p(t){var e=y(t)?P.call(t):"";return e==x||e==k}function v(t){return"number"==typeof t&&t>-1&&t%1==0&&S>=t}function y(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function m(t){return!!t&&"object"==typeof t}function g(t){return"string"==typeof t||!R(t)&&m(t)&&P.call(t)==E}function w(t){for(var e=-1,n=c(t),r=a(t),i=r.length,s=l(t),u=!!s,f=s||[],h=f.length;++e<i;){var d=r[e];u&&("length"==d||o(d,h))||"constructor"==d&&(n||!$.call(t,d))||f.push(d)}return f}var S=9007199254740991,b="[object Arguments]",x="[object Function]",k="[object GeneratorFunction]",E="[object String]",O=/^(?:0|[1-9]\d*)$/,j={"function":!0,object:!0},C=j[typeof n]&&n&&!n.nodeType?n:null,N=j[typeof e]&&e&&!e.nodeType?e:null,_=i(C&&N&&"object"==typeof t&&t),A=i(j[typeof self]&&self),F=i(j[typeof window]&&window),T=i(j[typeof this]&&this),I=_||F!==(T&&T.window)&&F||A||T||Function("return this")(),L=Object.prototype,$=L.hasOwnProperty,P=L.toString,V=I.Reflect,J=V?V.enumerate:void 0,M=L.propertyIsEnumerable;J&&!M.call({valueOf:1},"valueOf")&&(a=function(t){return s(J(t))});var z=u("length"),R=Array.isArray;e.exports=w}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],8:[function(t,e){function n(t,e,n){var r=n.length;switch(r){case 0:return t.call(e);case 1:return t.call(e,n[0]);case 2:return t.call(e,n[0],n[1]);case 3:return t.call(e,n[0],n[1],n[2])}return t.apply(e,n)}function r(t,e){if("function"!=typeof t)throw new TypeError(u);return e=b(void 0===e?t.length-1:s(e),0),function(){for(var r=arguments,i=-1,o=b(r.length-e,0),s=Array(o);++i<o;)s[i]=r[e+i];switch(e){case 0:return t.call(this,s);case 1:return t.call(this,r[0],s);case 2:return t.call(this,r[0],r[1],s)}var a=Array(e+1);for(i=-1;++i<e;)a[i]=r[i];return a[e]=s,n(t,this,a)}}function i(t){var e=o(t)?S.call(t):"";return e==h||e==d}function o(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function s(t){if(!t)return 0===t?t:0;if(t=a(t),t===l||t===-l){var e=0>t?-1:1;return e*c}var n=t%1;return t===t?n?t-n:t:0}function a(t){if(o(t)){var e=i(t.valueOf)?t.valueOf():t;t=o(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(p,"");var n=y.test(t);return n||m.test(t)?g(t.slice(2),n?2:8):v.test(t)?f:+t}var u="Expected a function",l=1/0,c=1.7976931348623157e308,f=0/0,h="[object Function]",d="[object GeneratorFunction]",p=/^\s+|\s+$/g,v=/^[-+]0x[0-9a-f]+$/i,y=/^0b[01]+$/i,m=/^0o[0-7]+$/i,g=parseInt,w=Object.prototype,S=w.toString,b=Math.max;e.exports=r},{}],9:[function(e,n,r){!function(){var e=function(t){var n=new e.Index;return n.pipeline.add(e.trimmer,e.stopWordFilter,e.stemmer),t&&t.call(n,n),n};e.version="0.6.0",e.utils={},e.utils.warn=function(t){return function(e){t.console&&console.warn&&console.warn(e)}}(this),e.utils.asString=function(t){return void 0===t||null===t?"":t.toString()},e.EventEmitter=function(){this.events={}},e.EventEmitter.prototype.addListener=function(){var t=Array.prototype.slice.call(arguments),e=t.pop(),n=t;if("function"!=typeof e)throw new TypeError("last argument must be a function");n.forEach(function(t){this.hasHandler(t)||(this.events[t]=[]),this.events[t].push(e)},this)},e.EventEmitter.prototype.removeListener=function(t,e){if(this.hasHandler(t)){var n=this.events[t].indexOf(e);this.events[t].splice(n,1),this.events[t].length||delete this.events[t]}},e.EventEmitter.prototype.emit=function(t){if(this.hasHandler(t)){var e=Array.prototype.slice.call(arguments,1);this.events[t].forEach(function(t){t.apply(void 0,e)})}},e.EventEmitter.prototype.hasHandler=function(t){return t in this.events},e.tokenizer=function(t){return arguments.length&&null!=t&&void 0!=t?Array.isArray(t)?t.map(function(t){return e.utils.asString(t).toLowerCase()}):t.toString().trim().toLowerCase().split(e.tokenizer.seperator):[]},e.tokenizer.seperator=/[\s\-]+/,e.Pipeline=function(){this._stack=[]},e.Pipeline.registeredFunctions={},e.Pipeline.registerFunction=function(t,n){n in this.registeredFunctions&&e.utils.warn("Overwriting existing registered function: "+n),t.label=n,e.Pipeline.registeredFunctions[t.label]=t},e.Pipeline.warnIfFunctionNotRegistered=function(t){var n=t.label&&t.label in this.registeredFunctions;n||e.utils.warn("Function is not registered with pipeline. This may cause problems when serialising the index.\n",t)},e.Pipeline.load=function(t){var n=new e.Pipeline;return t.forEach(function(t){var r=e.Pipeline.registeredFunctions[t];if(!r)throw new Error("Cannot load un-registered function: "+t);n.add(r)}),n},e.Pipeline.prototype.add=function(){var t=Array.prototype.slice.call(arguments);t.forEach(function(t){e.Pipeline.warnIfFunctionNotRegistered(t),this._stack.push(t)},this)},e.Pipeline.prototype.after=function(t,n){e.Pipeline.warnIfFunctionNotRegistered(n);var r=this._stack.indexOf(t);if(-1==r)throw new Error("Cannot find existingFn");r+=1,this._stack.splice(r,0,n)},e.Pipeline.prototype.before=function(t,n){e.Pipeline.warnIfFunctionNotRegistered(n);var r=this._stack.indexOf(t);if(-1==r)throw new Error("Cannot find existingFn");this._stack.splice(r,0,n)},e.Pipeline.prototype.remove=function(t){var e=this._stack.indexOf(t);-1!=e&&this._stack.splice(e,1)},e.Pipeline.prototype.run=function(t){for(var e=[],n=t.length,r=this._stack.length,i=0;n>i;i++){for(var o=t[i],s=0;r>s&&(o=this._stack[s](o,i,t),void 0!==o&&""!==o);s++);void 0!==o&&""!==o&&e.push(o)}return e},e.Pipeline.prototype.reset=function(){this._stack=[]},e.Pipeline.prototype.toJSON=function(){return this._stack.map(function(t){return e.Pipeline.warnIfFunctionNotRegistered(t),t.label})},e.Vector=function(){this._magnitude=null,this.list=void 0,this.length=0},e.Vector.Node=function(t,e,n){this.idx=t,this.val=e,this.next=n},e.Vector.prototype.insert=function(t,n){this._magnitude=void 0;var r=this.list;if(!r)return this.list=new e.Vector.Node(t,n,r),this.length++;if(t<r.idx)return this.list=new e.Vector.Node(t,n,r),this.length++;for(var i=r,o=r.next;void 0!=o;){if(t<o.idx)return i.next=new e.Vector.Node(t,n,o),this.length++;i=o,o=o.next}return i.next=new e.Vector.Node(t,n,o),this.length++},e.Vector.prototype.magnitude=function(){if(this._magnitude)return this._magnitude;for(var t,e=this.list,n=0;e;)t=e.val,n+=t*t,e=e.next;return this._magnitude=Math.sqrt(n)},e.Vector.prototype.dot=function(t){for(var e=this.list,n=t.list,r=0;e&&n;)e.idx<n.idx?e=e.next:e.idx>n.idx?n=n.next:(r+=e.val*n.val,e=e.next,n=n.next);return r},e.Vector.prototype.similarity=function(t){return this.dot(t)/(this.magnitude()*t.magnitude())},e.SortedSet=function(){this.length=0,this.elements=[]},e.SortedSet.load=function(t){var e=new this;return e.elements=t,e.length=t.length,e},e.SortedSet.prototype.add=function(){var t,e;for(t=0;t<arguments.length;t++)e=arguments[t],~this.indexOf(e)||this.elements.splice(this.locationFor(e),0,e);this.length=this.elements.length},e.SortedSet.prototype.toArray=function(){return this.elements.slice()},e.SortedSet.prototype.map=function(t,e){return this.elements.map(t,e)},e.SortedSet.prototype.forEach=function(t,e){return this.elements.forEach(t,e)},e.SortedSet.prototype.indexOf=function(t){for(var e=0,n=this.elements.length,r=n-e,i=e+Math.floor(r/2),o=this.elements[i];r>1;){if(o===t)return i;t>o&&(e=i),o>t&&(n=i),r=n-e,i=e+Math.floor(r/2),o=this.elements[i]}return o===t?i:-1},e.SortedSet.prototype.locationFor=function(t){for(var e=0,n=this.elements.length,r=n-e,i=e+Math.floor(r/2),o=this.elements[i];r>1;)t>o&&(e=i),o>t&&(n=i),r=n-e,i=e+Math.floor(r/2),o=this.elements[i];return o>t?i:t>o?i+1:void 0},e.SortedSet.prototype.intersect=function(t){for(var n=new e.SortedSet,r=0,i=0,o=this.length,s=t.length,a=this.elements,u=t.elements;;){if(r>o-1||i>s-1)break;a[r]!==u[i]?a[r]<u[i]?r++:a[r]>u[i]&&i++:(n.add(a[r]),r++,i++)}return n},e.SortedSet.prototype.clone=function(){var t=new e.SortedSet;return t.elements=this.toArray(),t.length=t.elements.length,t},e.SortedSet.prototype.union=function(t){var e,n,r;return this.length>=t.length?(e=this,n=t):(e=t,n=this),r=e.clone(),r.add.apply(r,n.toArray()),r},e.SortedSet.prototype.toJSON=function(){return this.toArray()},e.Index=function(){this._fields=[],this._ref="id",this.pipeline=new e.Pipeline,this.documentStore=new e.Store,this.tokenStore=new e.TokenStore,this.corpusTokens=new e.SortedSet,this.eventEmitter=new e.EventEmitter,this._idfCache={},this.on("add","remove","update",function(){this._idfCache={}}.bind(this))},e.Index.prototype.on=function(){var t=Array.prototype.slice.call(arguments);return this.eventEmitter.addListener.apply(this.eventEmitter,t)},e.Index.prototype.off=function(t,e){return this.eventEmitter.removeListener(t,e)},e.Index.load=function(t){t.version!==e.version&&e.utils.warn("version mismatch: current "+e.version+" importing "+t.version);var n=new this;return n._fields=t.fields,n._ref=t.ref,n.documentStore=e.Store.load(t.documentStore),n.tokenStore=e.TokenStore.load(t.tokenStore),n.corpusTokens=e.SortedSet.load(t.corpusTokens),n.pipeline=e.Pipeline.load(t.pipeline),n},e.Index.prototype.field=function(t,e){var e=e||{},n={name:t,boost:e.boost||1};return this._fields.push(n),this},e.Index.prototype.ref=function(t){return this._ref=t,this},e.Index.prototype.add=function(t,n){var r={},i=new e.SortedSet,o=t[this._ref],n=void 0===n?!0:n;this._fields.forEach(function(n){var o=this.pipeline.run(e.tokenizer(t[n.name]));r[n.name]=o,e.SortedSet.prototype.add.apply(i,o)},this),this.documentStore.set(o,i),e.SortedSet.prototype.add.apply(this.corpusTokens,i.toArray());for(var s=0;s<i.length;s++){var a=i.elements[s],u=this._fields.reduce(function(t,e){var n=r[e.name].length;if(!n)return t;var i=r[e.name].filter(function(t){return t===a}).length;return t+i/n*e.boost},0);this.tokenStore.add(a,{ref:o,tf:u})}n&&this.eventEmitter.emit("add",t,this)},e.Index.prototype.remove=function(t,e){var n=t[this._ref],e=void 0===e?!0:e;if(this.documentStore.has(n)){var r=this.documentStore.get(n);this.documentStore.remove(n),r.forEach(function(t){this.tokenStore.remove(t,n)},this),e&&this.eventEmitter.emit("remove",t,this)}},e.Index.prototype.update=function(t,e){var e=void 0===e?!0:e;this.remove(t,!1),this.add(t,!1),e&&this.eventEmitter.emit("update",t,this)},e.Index.prototype.idf=function(t){var e="@"+t;if(Object.prototype.hasOwnProperty.call(this._idfCache,e))return this._idfCache[e];var n=this.tokenStore.count(t),r=1;return n>0&&(r=1+Math.log(this.documentStore.length/n)),this._idfCache[e]=r},e.Index.prototype.search=function(t){var n=this.pipeline.run(e.tokenizer(t)),r=new e.Vector,i=[],o=this._fields.reduce(function(t,e){return t+e.boost},0),s=n.some(function(t){return this.tokenStore.has(t)},this);if(!s)return[];n.forEach(function(t,n,s){var a=1/s.length*this._fields.length*o,u=this,l=this.tokenStore.expand(t).reduce(function(n,i){var o=u.corpusTokens.indexOf(i),s=u.idf(i),l=1,c=new e.SortedSet;if(i!==t){var f=Math.max(3,i.length-t.length);l=1/Math.log(f)}o>-1&&r.insert(o,a*s*l);for(var h=u.tokenStore.get(i),d=Object.keys(h),p=d.length,v=0;p>v;v++)c.add(h[d[v]].ref);return n.union(c)},new e.SortedSet);i.push(l)},this);var a=i.reduce(function(t,e){return t.intersect(e)});return a.map(function(t){return{ref:t,score:r.similarity(this.documentVector(t))}},this).sort(function(t,e){return e.score-t.score})},e.Index.prototype.documentVector=function(t){for(var n=this.documentStore.get(t),r=n.length,i=new e.Vector,o=0;r>o;o++){var s=n.elements[o],a=this.tokenStore.get(s)[t].tf,u=this.idf(s);i.insert(this.corpusTokens.indexOf(s),a*u)}return i},e.Index.prototype.toJSON=function(){return{version:e.version,fields:this._fields,ref:this._ref,documentStore:this.documentStore.toJSON(),tokenStore:this.tokenStore.toJSON(),corpusTokens:this.corpusTokens.toJSON(),pipeline:this.pipeline.toJSON()}},e.Index.prototype.use=function(t){var e=Array.prototype.slice.call(arguments,1);e.unshift(this),t.apply(this,e)},e.Store=function(){this.store={},this.length=0},e.Store.load=function(t){var n=new this;return n.length=t.length,n.store=Object.keys(t.store).reduce(function(n,r){return n[r]=e.SortedSet.load(t.store[r]),n},{}),n},e.Store.prototype.set=function(t,e){this.has(t)||this.length++,this.store[t]=e},e.Store.prototype.get=function(t){return this.store[t]},e.Store.prototype.has=function(t){return t in this.store},e.Store.prototype.remove=function(t){this.has(t)&&(delete this.store[t],this.length--)},e.Store.prototype.toJSON=function(){return{store:this.store,length:this.length}},e.stemmer=function(){var t={ational:"ate",tional:"tion",enci:"ence",anci:"ance",izer:"ize",bli:"ble",alli:"al",entli:"ent",eli:"e",ousli:"ous",ization:"ize",ation:"ate",ator:"ate",alism:"al",iveness:"ive",fulness:"ful",ousness:"ous",aliti:"al",iviti:"ive",biliti:"ble",logi:"log"},e={icate:"ic",ative:"",alize:"al",iciti:"ic",ical:"ic",ful:"",ness:""},n="[^aeiou]",r="[aeiouy]",i=n+"[^aeiouy]*",o=r+"[aeiou]*",s="^("+i+")?"+o+i,a="^("+i+")?"+o+i+"("+o+")?$",u="^("+i+")?"+o+i+o+i,l="^("+i+")?"+r,c=new RegExp(s),f=new RegExp(u),h=new RegExp(a),d=new RegExp(l),p=/^(.+?)(ss|i)es$/,v=/^(.+?)([^s])s$/,y=/^(.+?)eed$/,m=/^(.+?)(ed|ing)$/,g=/.$/,w=/(at|bl|iz)$/,S=new RegExp("([^aeiouylsz])\\1$"),b=new RegExp("^"+i+r+"[^aeiouwxy]$"),x=/^(.+?[^aeiou])y$/,k=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,E=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,O=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,j=/^(.+?)(s|t)(ion)$/,C=/^(.+?)e$/,N=/ll$/,_=new RegExp("^"+i+r+"[^aeiouwxy]$"),A=function(n){var r,i,o,s,a,u,l;if(n.length<3)return n;if(o=n.substr(0,1),"y"==o&&(n=o.toUpperCase()+n.substr(1)),s=p,a=v,s.test(n)?n=n.replace(s,"$1$2"):a.test(n)&&(n=n.replace(a,"$1$2")),s=y,a=m,s.test(n)){var A=s.exec(n);s=c,s.test(A[1])&&(s=g,n=n.replace(s,""))}else if(a.test(n)){var A=a.exec(n);r=A[1],a=d,a.test(r)&&(n=r,a=w,u=S,l=b,a.test(n)?n+="e":u.test(n)?(s=g,n=n.replace(s,"")):l.test(n)&&(n+="e"))}if(s=x,s.test(n)){var A=s.exec(n);r=A[1],n=r+"i"}if(s=k,s.test(n)){var A=s.exec(n);r=A[1],i=A[2],s=c,s.test(r)&&(n=r+t[i])}if(s=E,s.test(n)){var A=s.exec(n);r=A[1],i=A[2],s=c,s.test(r)&&(n=r+e[i])}if(s=O,a=j,s.test(n)){var A=s.exec(n);r=A[1],s=f,s.test(r)&&(n=r)}else if(a.test(n)){var A=a.exec(n);r=A[1]+A[2],a=f,a.test(r)&&(n=r)}if(s=C,s.test(n)){var A=s.exec(n);r=A[1],s=f,a=h,u=_,(s.test(r)||a.test(r)&&!u.test(r))&&(n=r)}return s=N,a=f,s.test(n)&&a.test(n)&&(s=g,n=n.replace(s,"")),"y"==o&&(n=o.toLowerCase()+n.substr(1)),n};return A}(),e.Pipeline.registerFunction(e.stemmer,"stemmer"),e.generateStopWordFilter=function(t){var e=t.reduce(function(t,e){return t[e]=e,t},{});return function(t){return t&&e[t]!==t?t:void 0}},e.stopWordFilter=e.generateStopWordFilter(["a","able","about","across","after","all","almost","also","am","among","an","and","any","are","as","at","be","because","been","but","by","can","cannot","could","dear","did","do","does","either","else","ever","every","for","from","get","got","had","has","have","he","her","hers","him","his","how","however","i","if","in","into","is","it","its","just","least","let","like","likely","may","me","might","most","must","my","neither","no","nor","not","of","off","often","on","only","or","other","our","own","rather","said","say","says","she","should","since","so","some","than","that","the","their","them","then","there","these","they","this","tis","to","too","twas","us","wants","was","we","were","what","when","where","which","while","who","whom","why","will","with","would","yet","you","your"]),e.Pipeline.registerFunction(e.stopWordFilter,"stopWordFilter"),e.trimmer=function(t){return t.replace(/^\W+/,"").replace(/\W+$/,"")},e.Pipeline.registerFunction(e.trimmer,"trimmer"),e.TokenStore=function(){this.root={docs:{}},this.length=0},e.TokenStore.load=function(t){var e=new this;return e.root=t.root,e.length=t.length,e},e.TokenStore.prototype.add=function(t,e,n){var n=n||this.root,r=t.charAt(0),i=t.slice(1);return r in n||(n[r]={docs:{}}),0===i.length?(n[r].docs[e.ref]=e,void(this.length+=1)):this.add(i,e,n[r])},e.TokenStore.prototype.has=function(t){if(!t)return!1;for(var e=this.root,n=0;n<t.length;n++){if(!e[t.charAt(n)])return!1;e=e[t.charAt(n)]}return!0},e.TokenStore.prototype.getNode=function(t){if(!t)return{};for(var e=this.root,n=0;n<t.length;n++){if(!e[t.charAt(n)])return{};e=e[t.charAt(n)]}return e},e.TokenStore.prototype.get=function(t,e){return this.getNode(t,e).docs||{}},e.TokenStore.prototype.count=function(t,e){return Object.keys(this.get(t,e)).length},e.TokenStore.prototype.remove=function(t,e){if(t){for(var n=this.root,r=0;r<t.length;r++){if(!(t.charAt(r)in n))return;n=n[t.charAt(r)]}delete n.docs[e]}},e.TokenStore.prototype.expand=function(t,e){var n=this.getNode(t),r=n.docs||{},e=e||[];return Object.keys(r).length&&e.push(t),Object.keys(n).forEach(function(n){"docs"!==n&&e.concat(this.expand(t+n,e))},this),e},e.TokenStore.prototype.toJSON=function(){return{root:this.root,length:this.length}},function(e,i){"function"==typeof t&&t.amd?t(i):"object"==typeof r?n.exports=i():e.lunr=i()}(this,function(){return e})}()},{}],10:[function(t,e,n){!function(){"use strict";function e(t){x=S.defaults(t,k),r(),i(),o(),a(x.terms)}function r(){var t="glossary-"+x.position;if("string"==typeof x.target)x.target=document.querySelector(x.target);else if(!S.isNode(x.target))throw new Error("You must provide a DOM node or CSS selector to append the container");x.container=S.create("aside",x.containerClass,x.target),S.addClass(x.container,t),x.input=S.create("input","glossary-search",x.container),x.input.setAttribute("type","search"),x.close=S.create("button","",x.container),x.close.innerHTML=x.closeText,x.list=S.create("ol","glossary-list",x.container),x.target.appendChild(x.container),x.active&&d()}function i(){g=w(x.lunrIndex),x.terms.forEach(function(t,e){g.add({id:e,name:t.name,description:t.description,related:JSON.stringify(t.related)})})}function o(){x.input.addEventListener("keyup",l),x.list.addEventListener("click",f),x.close.addEventListener("click",p),document.body.addEventListener("click",c),document.body.addEventListener("keyup",h)}function s(){x.input.removeEventListener("keyup",l),x.list.removeEventListener("click",f),x.close.removeEventListener("click",p),document.body.removeEventListener("click",c),document.body.removeEventListener("keyup",h),S.remove(x.container)}function a(t){x.list.innerHTML=b({terms:t})}function u(t){var e=[];return g.search(t).forEach(function(t){e.push(x.terms[t.ref])}),e}function l(){var t=x.input.value;0===t.length&&a(x.terms),t.length<x.minLength||a(u(t))}function c(t){var e=S.hasClass(t.target,x.toggleClass);e&&(y(t.target.textContent),v())}function f(t){var e=S.hasClass(t.target,"related-term"),n=t.target.innerHTML;e&&(x.input.value=n,a(u(n)))}function h(t){var e=t.which||t.keyCode||0;27===e&&p()}function d(){x.active=!0,S.addClass(x.container,x.activeClass),x.input.focus()}function p(){x.active=!1,S.removeClass(x.container,x.activeClass)}function v(){x.active?p():d()}function y(t){x.input.value=t,a(u(t))}function m(t){if(x[t])return x[t];throw new Error("Option ["+t+"] does not exist")}var g,w=t("lunr"),S=t("./util"),b=t("./templates/term.jade"),x={},k={active:!1,activeClass:"active",target:document.body,toggleClass:"glossary-toggle",containerClass:"glossary-container",closeText:"Close",position:"right",terms:[],minLength:2};n.init=e,n.destroy=s,n.show=d,n.hide=p,n.toggle=v,n.setValue=y,n._getOption=m}()},{"./templates/term.jade":11,"./util":12,lunr:9}],11:[function(t,e){var n=t("jade/runtime");e.exports=function(t){var e,r=[],i=t||{};return function(t){(function(){var i=t;if("number"==typeof i.length)for(var o=0,s=i.length;s>o;o++){var a=i[o];r.push('<li class="glossary-term"><h2>'+n.escape(null==(e=a.name)?"":e)+"</h2><p>"+(null==(e=a.description)?"":e)+'</p><ul class="glossary-related-terms">'),function(){var t=a.related;if("number"==typeof t.length)for(var i=0,o=t.length;o>i;i++){var s=t[i];r.push('<li class="related-term">'+n.escape(null==(e=s)?"":e)+"</li>")}else{var o=0;for(var i in t){o++;var s=t[i];r.push('<li class="related-term">'+n.escape(null==(e=s)?"":e)+"</li>")}}}.call(this),r.push("</ul></li>")}else{var s=0;for(var o in i){s++;var a=i[o];r.push('<li class="glossary-term"><h2>'+n.escape(null==(e=a.name)?"":e)+"</h2><p>"+(null==(e=a.description)?"":e)+'</p><ul class="glossary-related-terms">'),function(){var t=a.related;if("number"==typeof t.length)for(var i=0,o=t.length;o>i;i++){var s=t[i];r.push('<li class="related-term">'+n.escape(null==(e=s)?"":e)+"</li>")}else{var o=0;for(var i in t){o++;var s=t[i];r.push('<li class="related-term">'+n.escape(null==(e=s)?"":e)+"</li>")}}}.call(this),r.push("</ul></li>")}}}).call(this)}.call(this,"terms"in i?i.terms:"undefined"!=typeof terms?terms:void 0,"undefined"in i?i.undefined:void 0),r.join("")}},{"jade/runtime":3}],12:[function(t,e){!function(){"use strict";e.exports={defaults:t("lodash.defaults"),isArray:t("lodash.isArray"),isNode:t("is-dom"),create:function(t,e,n){var r=document.createElement(t);return r.className=e,n&&n.appendChild(r),r},remove:function(t){var e=t.parentNode;e&&e.removeChild(t)},hasClass:function(t,e){if(void 0!==t.classList)return t.classList.contains(e);var n=this.getClass(t);return n.length>0&&new RegExp("(^|\\s)"+e+"(\\s|$)").test(n)},addClass:function(t,e){if(void 0!==t.classList)for(var n=this.splitWords(e),r=0,i=n.length;i>r;r++)t.classList.add(n[r]);else if(!this.hasClass(t,e)){var o=this.getClass(t);this.setClass(t,(o?o+" ":"")+e)}},removeClass:function(t,e){void 0!==t.classList?t.classList.remove(e):this.setClass(t,trim((" "+this.getClass(t)+" ").replace(" "+e+" "," ")))},setClass:function(t,e){void 0===t.className.baseVal?t.className=e:t.className.baseVal=e},splitWords:function(t){return this.trim(t).split(/\s+/)},trim:function(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")},getClass:function(t){return void 0===t.className.baseVal?t.className:t.className.baseVal}}}()},{"is-dom":2,"lodash.defaults":5,"lodash.isArray":6}]},{},[10])(10)});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
// Adapted from: https://github.com/knownasilya/jquery-highlight
(function () {
  'use strict';

  var _ = {
    each: require('lodash.forEach'),
    isArray: require('lodash.isArray'),
    defaults: require('lodash.defaults'),
    filter: require('lodash.filter'),
    map: require('lodash.map')
  };

  var options;

  var defaults = {
    content: document.body,
    class: 'highlight',
    tag: 'span',
    skipTags: /(a|h1|h2|h3|h4|h5|h6|script|form|style)/i,
    caseSensitive: false,
    wordsOnly: false,
    wordsBoundary: '\\b'
  };

  function init(opts) {
    options = _.defaults(opts, defaults);
    if ( !_.isArray(options.words) )
      throw new Error('You must provide an array of terms to highlight.');
    buildRegEx();
    highlight(options.content, options.regex, options.tag, options.class);
  }

  function buildRegEx() {
    options.words = _.filter(options.words,  function(word){
      return word !== '';
    });

    options.words = _.map(options.words, function(word) {
      return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    });

    var flag = options.caseSensitive ? '' : 'i';
    // The capture parenthesis will make sure we can match only the matching word
    var pattern = '(' + options.words.join('|') + ')';
    if (options.wordsOnly) {
       pattern = options.wordsBoundary + pattern + options.wordsBoundary;
    }
    options.regex = new RegExp(pattern, flag);
  }

  // recursively apply word highlighting
  function highlight(node, re, nodeName, className) {
    if (node.nodeType === 3) {
      var match = node.data.match(re);
      if (match) {
        // The new highlight Element Node
        var highlightedTerm = document.createElement(options.tag);
        highlightedTerm.className = options.class;
        // Note that we use the captured value to find the real index
        // of the match. This is because we do not want to include the matching word boundaries
        var capturePos = node.data.indexOf( match[1] , match.index );

        // Split the node and replace the matching wordnode
        // with the highlighted node
        var wordNode = node.splitText(capturePos);
        wordNode.splitText(match[1].length);

        var wordClone = wordNode.cloneNode(true);
        highlightedTerm.appendChild(wordClone);
        wordNode.parentNode.replaceChild(highlightedTerm, wordNode);
        return 1; //skip added node in parent
      }
    } else if ( (node.nodeType === 1 && node.childNodes) && // only element nodes that have children
      !options.skipTags.test(node.tagName) && // ignore script, style, and form nodes
      !(node.tagName === nodeName.toUpperCase() && node.className === options.class)) { // skip if already highlighted
      for (var i = 0; i < node.childNodes.length; i++) {
        i += highlight(node.childNodes[i], re, nodeName, className);
      }
    }
    return 0;
  }

  function unhighlight() {
    var highlightedTerms = document.querySelectorAll('.' + options.class);

    _.each(highlightedTerms, function (term) {
      var parent = term.parentNode;
      parent.replaceChild(term.firstChild, term);
      parent.normalize();
    });
  }

  module.exports.init = init;
  module.exports.highlight = highlight;
  module.exports.unhighlight = unhighlight;
})();

},{"lodash.defaults":19,"lodash.filter":20,"lodash.forEach":21,"lodash.isArray":22,"lodash.map":24}],8:[function(require,module,exports){
(function (global){
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.Menu=t()}}(function(){return function t(e,n,r){function o(i,a){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!a&&c)return c(i,!0);if(u)return u(i,!0);var f=new Error("Cannot find module '"+i+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[i]={exports:{}};e[i][0].call(l.exports,function(t){var n=e[i][1][t];return o(n?n:t)},l,l.exports,t,e,n,r)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<r.length;i++)o(r[i]);return o}({1:[function(t,e){e.exports=function(t){return t&&"object"==typeof t?window&&"object"==typeof window.Node?t instanceof window.Node:"number"==typeof t.nodeType&&"string"==typeof t.nodeName:!1}},{}],2:[function(t,e){function n(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r}function r(t,e){return t&&I(t,e,w)}function o(t,e){return k.call(t,e)||"object"==typeof t&&e in t&&null===f(t)}function u(t){return $(Object(t))}function i(t){return function(e){return null==e?void 0:e[t]}}function a(t,e){return function(n,r){if(null==n)return n;if(!v(n))return t(n,r);for(var o=n.length,u=e?o:-1,i=Object(n);(e?u--:++u<o)&&r(i[u],u,i)!==!1;);return n}}function c(t){return function(e,n,r){for(var o=-1,u=Object(e),i=r(e),a=i.length;a--;){var c=i[t?a:++o];if(n(u[c],c,u)===!1)break}return e}}function f(t){return F(Object(t))}function l(t){var e=t?t.length:void 0;return b(e)&&(M(t)||m(t)||d(t))?n(e,String):null}function s(t,e){return e=null==e?j:e,!!e&&("number"==typeof t||A.test(t))&&t>-1&&t%1==0&&e>t}function p(t){var e=t&&t.constructor,n="function"==typeof e&&e.prototype||E;return t===n}function d(t){return h(t)&&k.call(t,"callee")&&(!L.call(t,"callee")||N.call(t)==C)}function v(t){return null!=t&&b(T(t))&&!y(t)}function h(t){return _(t)&&v(t)}function y(t){var e=g(t)?N.call(t):"";return e==O||e==x}function b(t){return"number"==typeof t&&t>-1&&t%1==0&&j>=t}function g(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function _(t){return!!t&&"object"==typeof t}function m(t){return"string"==typeof t||!M(t)&&_(t)&&N.call(t)==S}function w(t){var e=p(t);if(!e&&!v(t))return u(t);var n=l(t),r=!!n,i=n||[],a=i.length;for(var c in t)!o(t,c)||r&&("length"==c||s(c,a))||e&&"constructor"==c||i.push(c);return i}var j=9007199254740991,C="[object Arguments]",O="[object Function]",x="[object GeneratorFunction]",S="[object String]",A=/^(?:0|[1-9]\d*)$/,E=Object.prototype,k=E.hasOwnProperty,N=E.toString,L=E.propertyIsEnumerable,F=Object.getPrototypeOf,$=Object.keys,q=a(r),I=c(),T=i("length"),M=Array.isArray;e.exports=q},{}],3:[function(t,e,n){(function(r){function o(t,e){for(var n=-1,r=t.length,o=Array(r);++n<r;)o[n]=e(t[n],n,t);return o}function u(t,e){for(var n=-1,r=t.length;++n<r;)if(e(t[n],n,t))return!0;return!1}function i(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r}function a(t,e){return o(e,function(e){return[e,t[e]]})}function c(t){return t&&t.Object===Object?t:null}function f(t){var e=!1;if(null!=t&&"function"!=typeof t.toString)try{e=!!(t+"")}catch(n){}return e}function l(t){var e=-1,n=Array(t.size);return t.forEach(function(t,r){n[++e]=[r,t]}),n}function s(t){var e=-1,n=Array(t.size);return t.forEach(function(t){n[++e]=t}),n}function p(t){var e=-1,n=Array(t.size);return t.forEach(function(t){n[++e]=[t,t]}),n}function d(t){var e=-1,n=t?t.length:0;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function v(){this.__data__=We?We(null):{}}function h(t){return this.has(t)&&delete this.__data__[t]}function y(t){var e=this.__data__;if(We){var n=e[t];return n===Pt?void 0:n}return $e.call(e,t)?e[t]:void 0}function b(t){var e=this.__data__;return We?void 0!==e[t]:$e.call(e,t)}function g(t,e){var n=this.__data__;return n[t]=We&&void 0===e?Pt:e,this}function _(t){var e=-1,n=t?t.length:0;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function m(){this.__data__=[]}function w(t){var e=this.__data__,n=D(e,t);if(0>n)return!1;var r=e.length-1;return n==r?e.pop():Ue.call(e,n,1),!0}function j(t){var e=this.__data__,n=D(e,t);return 0>n?void 0:e[n][1]}function C(t){return D(this.__data__,t)>-1}function O(t,e){var n=this.__data__,r=D(n,t);return 0>r?n.push([t,e]):n[r][1]=e,this}function x(t){var e=-1,n=t?t.length:0;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function S(){this.__data__={hash:new d,map:new(ze||_),string:new d}}function A(t){return ot(this,t)["delete"](t)}function E(t){return ot(this,t).get(t)}function k(t){return ot(this,t).has(t)}function N(t,e){return ot(this,t).set(t,e),this}function L(t){var e=-1,n=t?t.length:0;for(this.__data__=new x;++e<n;)this.add(t[e])}function F(t){return this.__data__.set(t,Pt),this}function $(t){return this.__data__.has(t)}function q(t){this.__data__=new _(t)}function I(){this.__data__=new _}function T(t){return this.__data__["delete"](t)}function M(t){return this.__data__.get(t)}function P(t){return this.__data__.has(t)}function U(t,e){var n=this.__data__;return n instanceof _&&n.__data__.length==Mt&&(n=this.__data__=new x(n.__data__)),n.set(t,e),this}function D(t,e){for(var n=t.length;n--;)if(_t(t[n][0],e))return n;return-1}function B(t,e){e=pt(e,t)?[e]:Z(e);for(var n=0,r=e.length;null!=t&&r>n;)t=t[bt(e[n++])];return n&&n==r?t:void 0}function V(t,e){return $e.call(t,e)||"object"==typeof t&&e in t&&null===at(t)}function z(t,e){return e in Object(t)}function G(t,e,n,r,o){return t===e?!0:null==t||null==e||!xt(t)&&!St(e)?t!==t&&e!==e:R(t,e,G,n,r,o)}function R(t,e,n,r,o,u){var i=nn(t),a=nn(e),c=Gt,l=Gt;i||(c=ct(t),c=c==zt?Yt:c),a||(l=ct(e),l=l==zt?Yt:l);var s=c==Yt&&!f(t),p=l==Yt&&!f(e),d=c==l;if(d&&!s)return u||(u=new q),i||Nt(t)?et(t,e,n,r,o,u):nt(t,e,c,n,r,o,u);if(!(o&Dt)){var v=s&&$e.call(t,"__wrapped__"),h=p&&$e.call(e,"__wrapped__");if(v||h){var y=v?t.value():t,b=h?e.value():e;return u||(u=new q),n(y,b,r,o,u)}}return d?(u||(u=new q),rt(t,e,n,r,o,u)):!1}function H(t,e,n,r){var o=n.length,u=o,i=!r;if(null==t)return!u;for(t=Object(t);o--;){var a=n[o];if(i&&a[2]?a[1]!==t[a[0]]:!(a[0]in t))return!1}for(;++o<u;){a=n[o];var c=a[0],f=t[c],l=a[1];if(i&&a[2]){if(void 0===f&&!(c in t))return!1}else{var s=new q;if(r)var p=r(f,l,c,t,e,s);if(!(void 0===p?G(l,f,r,Ut|Dt,s):p))return!1}}return!0}function W(t){return"function"==typeof t?t:null==t?qt:"object"==typeof t?nn(t)?Q(t[0],t[1]):K(t):It(t)}function J(t){return Be(Object(t))}function K(t){var e=ut(t);return 1==e.length&&e[0][2]?yt(e[0][0],e[0][1]):function(n){return n===t||H(n,t,e)}}function Q(t,e){return pt(t)&&ht(e)?yt(bt(t),e):function(n){var r=Lt(n,t);return void 0===r&&r===e?Ft(n,t):G(e,r,void 0,Ut|Dt)}}function X(t){return function(e){return null==e?void 0:e[t]}}function Y(t){return function(e){return B(e,t)}}function Z(t){return nn(t)?t:Tt(t)}function tt(t){return function(e){var n=ct(e);return n==Qt?l(e):n==ee?p(e):a(e,t(e))}}function et(t,e,n,r,o,i){var a=o&Dt,c=t.length,f=e.length;if(c!=f&&!(a&&f>c))return!1;var l=i.get(t);if(l)return l==e;var s=-1,p=!0,d=o&Ut?new L:void 0;for(i.set(t,e);++s<c;){var v=t[s],h=e[s];if(r)var y=a?r(h,v,s,e,t,i):r(v,h,s,t,e,i);if(void 0!==y){if(y)continue;p=!1;break}if(d){if(!u(e,function(t,e){return d.has(e)||v!==t&&!n(v,t,r,o,i)?void 0:d.add(e)})){p=!1;break}}else if(v!==h&&!n(v,h,r,o,i)){p=!1;break}}return i["delete"](t),p}function nt(t,e,n,r,o,u,i){switch(n){case ie:if(t.byteLength!=e.byteLength||t.byteOffset!=e.byteOffset)return!1;t=t.buffer,e=e.buffer;case ue:return t.byteLength==e.byteLength&&r(new Me(t),new Me(e))?!0:!1;case Rt:case Ht:return+t==+e;case Wt:return t.name==e.name&&t.message==e.message;case Xt:return t!=+t?e!=+e:t==+e;case te:case ne:return t==e+"";case Qt:var a=l;case ee:var c=u&Dt;if(a||(a=s),t.size!=e.size&&!c)return!1;var f=i.get(t);return f?f==e:(u|=Ut,i.set(t,e),et(a(t),a(e),r,o,u,i));case re:if(tn)return tn.call(t)==tn.call(e)}return!1}function rt(t,e,n,r,o,u){var i=o&Dt,a=$t(t),c=a.length,f=$t(e),l=f.length;if(c!=l&&!i)return!1;for(var s=c;s--;){var p=a[s];if(!(i?p in e:V(e,p)))return!1}var d=u.get(t);if(d)return d==e;var v=!0;u.set(t,e);for(var h=i;++s<c;){p=a[s];var y=t[p],b=e[p];if(r)var g=i?r(b,y,p,e,t,u):r(y,b,p,t,e,u);if(!(void 0===g?y===b||n(y,b,r,o,u):g)){v=!1;break}h||(h="constructor"==p)}if(v&&!h){var _=t.constructor,m=e.constructor;_!=m&&"constructor"in t&&"constructor"in e&&!("function"==typeof _&&_ instanceof _&&"function"==typeof m&&m instanceof m)&&(v=!1)}return u["delete"](t),v}function ot(t,e){var n=t.__data__;return dt(e)?n["string"==typeof e?"string":"hash"]:n.map}function ut(t){for(var e=rn(t),n=e.length;n--;)e[n][2]=ht(e[n][1]);return e}function it(t,e){var n=t[e];return At(n)?n:void 0}function at(t){return De(Object(t))}function ct(t){return qe.call(t)}function ft(t,e,n){e=pt(e,t)?[e]:Z(e);for(var r,o=-1,u=e.length;++o<u;){var i=bt(e[o]);if(!(r=null!=t&&n(t,i)))break;t=t[i]}if(r)return r;var u=t?t.length:0;return!!u&&Ot(u)&&st(i,u)&&(nn(t)||Et(t)||mt(t))}function lt(t){var e=t?t.length:void 0;return Ot(e)&&(nn(t)||Et(t)||mt(t))?i(e,String):null}function st(t,e){return e=null==e?Vt:e,!!e&&("number"==typeof t||me.test(t))&&t>-1&&t%1==0&&e>t}function pt(t,e){if(nn(t))return!1;var n=typeof t;return"number"==n||"symbol"==n||"boolean"==n||null==t||kt(t)?!0:be.test(t)||!ye.test(t)||null!=e&&t in Object(e)}function dt(t){var e=typeof t;return"string"==e||"number"==e||"symbol"==e||"boolean"==e?"__proto__"!==t:null===t}function vt(t){var e=t&&t.constructor,n="function"==typeof e&&e.prototype||Le;return t===n}function ht(t){return t===t&&!xt(t)}function yt(t,e){return function(n){return null==n?!1:n[t]===e&&(void 0!==e||t in Object(n))}}function bt(t){if("string"==typeof t||kt(t))return t;var e=t+"";return"0"==e&&1/t==-Bt?"-0":e}function gt(t){if(null!=t){try{return Fe.call(t)}catch(e){}try{return t+""}catch(e){}}return""}function _t(t,e){return t===e||t!==t&&e!==e}function mt(t){return jt(t)&&$e.call(t,"callee")&&(!Pe.call(t,"callee")||qe.call(t)==zt)}function wt(t){return null!=t&&Ot(en(t))&&!Ct(t)}function jt(t){return St(t)&&wt(t)}function Ct(t){var e=xt(t)?qe.call(t):"";return e==Jt||e==Kt}function Ot(t){return"number"==typeof t&&t>-1&&t%1==0&&Vt>=t}function xt(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function St(t){return!!t&&"object"==typeof t}function At(t){if(!xt(t))return!1;var e=Ct(t)||f(t)?Ie:_e;return e.test(gt(t))}function Et(t){return"string"==typeof t||!nn(t)&&St(t)&&qe.call(t)==ne}function kt(t){return"symbol"==typeof t||St(t)&&qe.call(t)==re}function Nt(t){return St(t)&&Ot(t.length)&&!!we[qe.call(t)]}function Lt(t,e,n){var r=null==t?void 0:B(t,e);return void 0===r?n:r}function Ft(t,e){return null!=t&&ft(t,e,z)}function $t(t){var e=vt(t);if(!e&&!wt(t))return J(t);var n=lt(t),r=!!n,o=n||[],u=o.length;for(var i in t)!V(t,i)||r&&("length"==i||st(i,u))||e&&"constructor"==i||o.push(i);return o}function qt(t){return t}function It(t){return pt(t)?X(bt(t)):Y(t)}var Tt=t("lodash._stringtopath"),Mt=200,Pt="__lodash_hash_undefined__",Ut=1,Dt=2,Bt=1/0,Vt=9007199254740991,zt="[object Arguments]",Gt="[object Array]",Rt="[object Boolean]",Ht="[object Date]",Wt="[object Error]",Jt="[object Function]",Kt="[object GeneratorFunction]",Qt="[object Map]",Xt="[object Number]",Yt="[object Object]",Zt="[object Promise]",te="[object RegExp]",ee="[object Set]",ne="[object String]",re="[object Symbol]",oe="[object WeakMap]",ue="[object ArrayBuffer]",ie="[object DataView]",ae="[object Float32Array]",ce="[object Float64Array]",fe="[object Int8Array]",le="[object Int16Array]",se="[object Int32Array]",pe="[object Uint8Array]",de="[object Uint8ClampedArray]",ve="[object Uint16Array]",he="[object Uint32Array]",ye=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,be=/^\w*$/,ge=/[\\^$.*+?()[\]{}|]/g,_e=/^\[object .+?Constructor\]$/,me=/^(?:0|[1-9]\d*)$/,we={};we[ae]=we[ce]=we[fe]=we[le]=we[se]=we[pe]=we[de]=we[ve]=we[he]=!0,we[zt]=we[Gt]=we[ue]=we[Rt]=we[ie]=we[Ht]=we[Wt]=we[Jt]=we[Qt]=we[Xt]=we[Yt]=we[te]=we[ee]=we[ne]=we[oe]=!1;var je={"function":!0,object:!0},Ce=je[typeof n]&&n&&!n.nodeType?n:void 0,Oe=je[typeof e]&&e&&!e.nodeType?e:void 0,xe=c(Ce&&Oe&&"object"==typeof r&&r),Se=c(je[typeof self]&&self),Ae=c(je[typeof window]&&window),Ee=c(je[typeof this]&&this),ke=xe||Ae!==(Ee&&Ee.window)&&Ae||Se||Ee||Function("return this")(),Ne=Array.prototype,Le=Object.prototype,Fe=Function.prototype.toString,$e=Le.hasOwnProperty,qe=Le.toString,Ie=RegExp("^"+Fe.call($e).replace(ge,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),Te=ke.Symbol,Me=ke.Uint8Array,Pe=Le.propertyIsEnumerable,Ue=Ne.splice,De=Object.getPrototypeOf,Be=Object.keys,Ve=it(ke,"DataView"),ze=it(ke,"Map"),Ge=it(ke,"Promise"),Re=it(ke,"Set"),He=it(ke,"WeakMap"),We=it(Object,"create"),Je=gt(Ve),Ke=gt(ze),Qe=gt(Ge),Xe=gt(Re),Ye=gt(He),Ze=Te?Te.prototype:void 0,tn=Ze?Ze.valueOf:void 0;d.prototype.clear=v,d.prototype["delete"]=h,d.prototype.get=y,d.prototype.has=b,d.prototype.set=g,_.prototype.clear=m,_.prototype["delete"]=w,_.prototype.get=j,_.prototype.has=C,_.prototype.set=O,x.prototype.clear=S,x.prototype["delete"]=A,x.prototype.get=E,x.prototype.has=k,x.prototype.set=N,L.prototype.add=L.prototype.push=F,L.prototype.has=$,q.prototype.clear=I,q.prototype["delete"]=T,q.prototype.get=M,q.prototype.has=P,q.prototype.set=U;var en=X("length");(Ve&&ct(new Ve(new ArrayBuffer(1)))!=ie||ze&&ct(new ze)!=Qt||Ge&&ct(Ge.resolve())!=Zt||Re&&ct(new Re)!=ee||He&&ct(new He)!=oe)&&(ct=function(t){var e=qe.call(t),n=e==Yt?t.constructor:void 0,r=n?gt(n):void 0;if(r)switch(r){case Je:return ie;case Ke:return Qt;case Qe:return Zt;case Xe:return ee;case Ye:return oe}return e});var nn=Array.isArray,rn=tt($t);e.exports=W}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"lodash._stringtopath":5}],4:[function(t,e,n){(function(t){function r(t){return t&&t.Object===Object?t:null}function o(t){if("string"==typeof t)return t;if(i(t))return w?w.call(t):"";var e=t+"";return"0"==e&&1/t==-a?"-0":e}function u(t){return!!t&&"object"==typeof t}function i(t){return"symbol"==typeof t||u(t)&&g.call(t)==c}var a=1/0,c="[object Symbol]",f={"function":!0,object:!0},l=f[typeof n]&&n&&!n.nodeType?n:void 0,s=f[typeof e]&&e&&!e.nodeType?e:void 0,p=r(l&&s&&"object"==typeof t&&t),d=r(f[typeof self]&&self),v=r(f[typeof window]&&window),h=r(f[typeof this]&&this),y=p||v!==(h&&h.window)&&v||d||h||Function("return this")(),b=Object.prototype,g=b.toString,_=y.Symbol,m=_?_.prototype:void 0,w=m?m.toString:void 0;e.exports=o}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],5:[function(t,e,n){(function(r){function o(t){return t&&t.Object===Object?t:null}function u(t){var e=!1;if(null!=t&&"function"!=typeof t.toString)try{e=!!(t+"")}catch(n){}return e}function i(t){var e=-1,n=t?t.length:0;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function a(){this.__data__=it?it(null):{}}function c(t){return this.has(t)&&delete this.__data__[t]}function f(t){var e=this.__data__;if(it){var n=e[t];return n===M?void 0:n}return et.call(e,t)?e[t]:void 0}function l(t){var e=this.__data__;return it?void 0!==e[t]:et.call(e,t)}function s(t,e){var n=this.__data__;return n[t]=it&&void 0===e?M:e,this}function p(t){var e=-1,n=t?t.length:0;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function d(){this.__data__=[]}function v(t){var e=this.__data__,n=O(e,t);if(0>n)return!1;var r=e.length-1;return n==r?e.pop():ot.call(e,n,1),!0}function h(t){var e=this.__data__,n=O(e,t);return 0>n?void 0:e[n][1]}function y(t){return O(this.__data__,t)>-1}function b(t,e){var n=this.__data__,r=O(n,t);return 0>r?n.push([t,e]):n[r][1]=e,this}function g(t){var e=-1,n=t?t.length:0;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function _(){this.__data__={hash:new i,map:new(ut||p),string:new i}}function m(t){return x(this,t)["delete"](t)}function w(t){return x(this,t).get(t)}function j(t){return x(this,t).has(t)}function C(t,e){return x(this,t).set(t,e),this}function O(t,e){for(var n=t.length;n--;)if(N(t[n][0],e))return n;return-1}function x(t,e){var n=t.__data__;return A(e)?n["string"==typeof e?"string":"hash"]:n.map}function S(t,e){var n=t[e];return $(n)?n:void 0}function A(t){var e=typeof t;return"string"==e||"number"==e||"symbol"==e||"boolean"==e?"__proto__"!==t:null===t}function E(t){if(null!=t){try{return tt.call(t)}catch(e){}try{return t+""}catch(e){}}return""}function k(t,e){if("function"!=typeof t||e&&"function"!=typeof e)throw new TypeError(T);var n=function(){var r=arguments,o=e?e.apply(this,r):r[0],u=n.cache;if(u.has(o))return u.get(o);var i=t.apply(this,r);return n.cache=u.set(o,i),i};return n.cache=new(k.Cache||g),n}function N(t,e){return t===e||t!==t&&e!==e}function L(t){var e=F(t)?nt.call(t):"";return e==P||e==U}function F(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function $(t){if(!F(t))return!1;var e=L(t)||u(t)?rt:z;return e.test(E(t))}function q(t){return null==t?"":I(t)}var I=t("lodash._basetostring"),T="Expected a function",M="__lodash_hash_undefined__",P="[object Function]",U="[object GeneratorFunction]",D=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]/g,B=/[\\^$.*+?()[\]{}|]/g,V=/\\(\\)?/g,z=/^\[object .+?Constructor\]$/,G={"function":!0,object:!0},R=G[typeof n]&&n&&!n.nodeType?n:void 0,H=G[typeof e]&&e&&!e.nodeType?e:void 0,W=o(R&&H&&"object"==typeof r&&r),J=o(G[typeof self]&&self),K=o(G[typeof window]&&window),Q=o(G[typeof this]&&this),X=W||K!==(Q&&Q.window)&&K||J||Q||Function("return this")(),Y=Array.prototype,Z=Object.prototype,tt=Function.prototype.toString,et=Z.hasOwnProperty,nt=Z.toString,rt=RegExp("^"+tt.call(et).replace(B,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),ot=Y.splice,ut=S(X,"Map"),it=S(Object,"create");i.prototype.clear=a,i.prototype["delete"]=c,i.prototype.get=f,i.prototype.has=l,i.prototype.set=s,p.prototype.clear=d,p.prototype["delete"]=v,p.prototype.get=h,p.prototype.has=y,p.prototype.set=b,g.prototype.clear=_,g.prototype["delete"]=m,g.prototype.get=w,g.prototype.has=j,g.prototype.set=C;var at=k(function(t){var e=[];return q(t).replace(D,function(t,n,r,o){e.push(r?o.replace(V,"$1"):n||t)}),e});k.Cache=g,e.exports=at}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"lodash._basetostring":4}],6:[function(t,e){function n(t,e,n){var r=t[e];m.call(t,e)&&c(r,n)&&(void 0!==n||e in t)||(t[e]=n)}function r(t){return function(e){return null==e?void 0:e[t]}}function o(t,e,r,o){r||(r={});for(var u=-1,i=e.length;++u<i;){var a=e[u],c=o?o(r[a],t[a],a,r,t):t[a];n(r,a,c)}return r}function u(t){return v(function(e,n){var r=-1,o=n.length,u=o>1?n[o-1]:void 0,i=o>2?n[2]:void 0;for(u=t.length>3&&"function"==typeof u?(o--,u):void 0,i&&a(n[0],n[1],i)&&(u=3>o?void 0:u,o=1),e=Object(e);++r<o;){var c=n[r];c&&t(e,c,r,u)}return e})}function i(t,e){return e=null==e?h:e,!!e&&("number"==typeof t||g.test(t))&&t>-1&&t%1==0&&e>t}function a(t,e,n){if(!p(n))return!1;var r=typeof e;return("number"==r?f(n)&&i(e,n.length):"string"==r&&e in n)?c(n[e],t):!1}function c(t,e){return t===e||t!==t&&e!==e}function f(t){return null!=t&&s(j(t))&&!l(t)}function l(t){var e=p(t)?w.call(t):"";return e==y||e==b}function s(t){return"number"==typeof t&&t>-1&&t%1==0&&h>=t}function p(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}var d=t("lodash.keysin"),v=t("lodash.rest"),h=9007199254740991,y="[object Function]",b="[object GeneratorFunction]",g=/^(?:0|[1-9]\d*)$/,_=Object.prototype,m=_.hasOwnProperty,w=_.toString,j=r("length"),C=u(function(t,e,n,r){o(e,d(e),t,r)});e.exports=C},{"lodash.keysin":9,"lodash.rest":10}],7:[function(t,e){function n(t,e,n){var r=n.length;switch(r){case 0:return t.call(e);case 1:return t.call(e,n[0]);case 2:return t.call(e,n[0],n[1]);case 3:return t.call(e,n[0],n[1],n[2])}return t.apply(e,n)}function r(t,e,n,r){return void 0===t||o(t,a[n])&&!c.call(r,n)?e:t}function o(t,e){return t===e||t!==t&&e!==e}var u=t("lodash.assigninwith"),i=t("lodash.rest"),a=Object.prototype,c=a.hasOwnProperty,f=i(function(t){return t.push(void 0,r),n(u,void 0,t)});e.exports=f},{"lodash.assigninwith":6,"lodash.rest":10}],8:[function(t,e){function n(t,e){for(var n=-1,r=t.length;++n<r&&e(t[n],n,t)!==!1;);return t}function r(t,e){var r=i(t)?n:o;return r(t,u(e,3))}var o=t("lodash._baseeach"),u=t("lodash._baseiteratee"),i=Array.isArray;e.exports=r},{"lodash._baseeach":2,"lodash._baseiteratee":3}],9:[function(t,e,n){(function(t){function r(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r}function o(t){return t&&t.Object===Object?t:null}function u(t){for(var e,n=[];!(e=t.next()).done;)n.push(e.value);return n}function i(t){t=null==t?t:Object(t);var e=[];for(var n in t)e.push(n);return e}function a(t){return function(e){return null==e?void 0:e[t]}}function c(t){var e=t?t.length:void 0;return h(e)&&(B(t)||g(t)||s(t))?r(e,String):null}function f(t,e){return e=null==e?m:e,!!e&&("number"==typeof t||x.test(t))&&t>-1&&t%1==0&&e>t}function l(t){var e=t&&t.constructor,n="function"==typeof e&&e.prototype||q;return t===n}function s(t){return d(t)&&I.call(t,"callee")&&(!U.call(t,"callee")||T.call(t)==w)}function p(t){return null!=t&&h(D(t))&&!v(t)}function d(t){return b(t)&&p(t)}function v(t){var e=y(t)?T.call(t):"";return e==j||e==C}function h(t){return"number"==typeof t&&t>-1&&t%1==0&&m>=t}function y(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function b(t){return!!t&&"object"==typeof t}function g(t){return"string"==typeof t||!B(t)&&b(t)&&T.call(t)==O}function _(t){for(var e=-1,n=l(t),r=i(t),o=r.length,u=c(t),a=!!u,s=u||[],p=s.length;++e<o;){var d=r[e];a&&("length"==d||f(d,p))||"constructor"==d&&(n||!I.call(t,d))||s.push(d)}return s}var m=9007199254740991,w="[object Arguments]",j="[object Function]",C="[object GeneratorFunction]",O="[object String]",x=/^(?:0|[1-9]\d*)$/,S={"function":!0,object:!0},A=S[typeof n]&&n&&!n.nodeType?n:void 0,E=S[typeof e]&&e&&!e.nodeType?e:void 0,k=o(A&&E&&"object"==typeof t&&t),N=o(S[typeof self]&&self),L=o(S[typeof window]&&window),F=o(S[typeof this]&&this),$=k||L!==(F&&F.window)&&L||N||F||Function("return this")(),q=Object.prototype,I=q.hasOwnProperty,T=q.toString,M=$.Reflect,P=M?M.enumerate:void 0,U=q.propertyIsEnumerable;P&&!U.call({valueOf:1},"valueOf")&&(i=function(t){return u(P(t))});var D=a("length"),B=Array.isArray;e.exports=_}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],10:[function(t,e){function n(t,e,n){var r=n.length;switch(r){case 0:return t.call(e);case 1:return t.call(e,n[0]);case 2:return t.call(e,n[0],n[1]);case 3:return t.call(e,n[0],n[1],n[2])}return t.apply(e,n)}function r(t,e){if("function"!=typeof t)throw new TypeError(s);return e=x(void 0===e?t.length-1:f(e),0),function(){for(var r=arguments,o=-1,u=x(r.length-e,0),i=Array(u);++o<u;)i[o]=r[e+o];switch(e){case 0:return t.call(this,i);case 1:return t.call(this,r[0],i);case 2:return t.call(this,r[0],r[1],i)}var a=Array(e+1);for(o=-1;++o<e;)a[o]=r[o];return a[e]=i,n(t,this,a)}}function o(t){var e=u(t)?O.call(t):"";return e==h||e==y}function u(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function i(t){return!!t&&"object"==typeof t}function a(t){return"symbol"==typeof t||i(t)&&O.call(t)==b}function c(t){if(!t)return 0===t?t:0;if(t=l(t),t===p||t===-p){var e=0>t?-1:1;return e*d}return t===t?t:0}function f(t){var e=c(t),n=e%1;return e===e?n?e-n:e:0}function l(t){if("number"==typeof t)return t;if(a(t))return v;if(u(t)){var e=o(t.valueOf)?t.valueOf():t;t=u(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(g,"");var n=m.test(t);return n||w.test(t)?j(t.slice(2),n?2:8):_.test(t)?v:+t}var s="Expected a function",p=1/0,d=1.7976931348623157e308,v=0/0,h="[object Function]",y="[object GeneratorFunction]",b="[object Symbol]",g=/^\s+|\s+$/g,_=/^[-+]0x[0-9a-f]+$/i,m=/^0b[01]+$/i,w=/^0o[0-7]+$/i,j=parseInt,C=Object.prototype,O=C.toString,x=Math.max;e.exports=r},{}],11:[function(t,e){"use strict";function n(t,e){function n(r){function o(){var o=arguments.length,u=[].concat(r);return o&&u.push.apply(u,arguments),u.length<e?n(u):t.apply(this,u)}return o}return"number"!=typeof e&&(e=t.length),n([])}e.exports=n},{}],12:[function(t,e){"use strict";var n,r=t("./curry");e.exports=r(function(e,r){for(n=n||t("./matches");r=r.parentElement;)if(n.call(r,e))return r})},{"./curry":11,"./matches":13}],13:[function(t,e){"use strict";var n=Element.prototype,r=n.matches||n.mozMatchesSelector||n.msMatchesSelector||n.oMatchesSelector||n.webkitMatchesSelector;e.exports=r},{}],14:[function(t,e){function n(t){if(t===document.documentElement)return!1;if(t.tabbableCacheIndex)return r[t.tabbableCacheIndex];var e=!1,u=window.getComputedStyle(t);return"hidden"===u.visibility||"none"===u.display?e=!0:t.parentNode&&(e=n(t.parentNode)),t.tabbableCacheIndex=o,r[t.tabbableCacheIndex]=e,o++,e}e.exports=function(t){for(var e,r,o=[],u=[],i=t.querySelectorAll("input, select, a, textarea, button, [tabindex]"),a=Array.prototype.slice.call(i),c=0,f=a.length;f>c;c++)e=a[c],r=e.tabIndex,0>r||"INPUT"===e.tagName&&"hidden"===e.type||"A"===e.tagName&&!e.href&&!e.tabIndex||e.disabled||n(e)||(0===r?o.push(e):u.push({tabIndex:r,node:e}));var l=u.sort(function(t,e){return t.tabIndex-e.tabIndex}).map(function(t){return t.node});return Array.prototype.push.apply(l,o),l};var r={},o=1},{}],15:[function(t,e){!function(){"use strict";function n(t){N=L.defaults({},t,F),N.menu=L.find(N.menu),N.search=N.menu.querySelector("input[type=search]"),N.active&&L.addClass(N.menu,N.activeClass),N.close=L.create("button","fws-menu-close",N.menu),N.close.innerHTML="&times;",N.menu.setAttribute("role","navigation"),L.addClass(N.menu.querySelector("ul"),N.rootUlClass),k(),u(),r()}function r(){document.body.addEventListener("click",O),document.body.addEventListener("keyup",j),N.menu.addEventListener("click",b),N.menu.addEventListener("click",_),N.close.addEventListener("click",E)}function o(){document.body.removeEventListener("click",O),document.body.removeEventListener("keyup",j),N.menu.removeEventListener("click",b),N.menu.removeEventListener("click",_),N.close.removeEventListener("click",E)}function u(){var t=N.menu.querySelector("ul"),e=t.querySelectorAll("ul");L.each(e,function(t){var e=L.closest("li",t);L.addClass(e,"has-children"),L.removeClass(t,"move-out"),L.addClass(t,N.subMenuClass+" menu-hidden"),c(t)})}function i(){var t=L.create("li","menu-back back-block");return t.innerHTML="Back",t}function a(){var t=L.create("li"),e=L.create("a","menu-back",t);return e.innerHTML="Back",e.setAttribute("href","#back"),t}function c(t){var e=t.querySelector("li"),n=a(),r=i();t.insertBefore(n,e),t.appendChild(r)}function f(){var t=N.menu.querySelector(".menu-active");l(),t&&s(t)}function l(){var t=N.menu.querySelectorAll("a");L.each(t,function(t){t.setAttribute("tabindex",-1)})}function s(t){var e=p(t);L.each(e,function(t){t.setAttribute("tabindex",0)})}function p(t){var e=t.children,n=[];return L.each(e,function(t){var e=t.children;L.each(e,function(t){"A"===t.nodeName&&n.push(t)})}),n}function d(t){L.addClass(t,"move-out"),L.removeClass(t,"menu-active")}function v(t){L.removeClass(t,"move-out"),L.addClass(t,"menu-active"),t.querySelector("a").focus()}function h(t){L.addClass(t,"menu-hidden"),L.removeClass(t,"menu-active")}function y(t){L.addClass(t,"menu-active"),L.removeClass(t,"menu-hidden"),t.querySelector("a").focus()}function b(t){if("UL"!==t.target.nodeName&&L.hasClass(t.target.parentNode,"has-children")){var e=t.target.parentNode.querySelector("ul"),n=L.closest("ul",t.target);g(n,e)}}function g(t,e){d(t),y(e),f()}function _(t){if(L.hasClass(t.target,"menu-back")){t.preventDefault();var e=L.closest("ul",t.target);m(e)}}function m(t){var e=L.closest("ul.move-out",t);e&&v(e),h(t),f()}function w(){L.each(N.menu.querySelectorAll(".sub-menu"),m)}function j(t){if(N.active){var e,n;27===t.keyCode&&E(),40===t.keyCode&&C("next"),38===t.keyCode&&C("last"),37===t.keyCode&&m(N.menu.querySelector(".menu-active")),39===t.keyCode&&L.hasClass(t.target.parentNode,"has-children")&&(e=L.closest("ul",t.target),n=t.target.parentNode.querySelector("ul"),g(e,n))}}function C(t){var e,n,r=L.tabbable(N.menu);if("next"===t)n=1;else{if("last"!==t)throw new Error("Direction for _goToTabbableElement must be 'next' or 'last'.");n=-1}return L.hasClass(document.activeElement,N.toggleClass)?void r[0].focus():(L.each(r,function(t,r){document.activeElement===t&&(e=r+n)}),-1===e?e=0:e===r.length&&(e-=1),void r[e].focus())}function O(t){L.hasClass(t.target,N.toggleClass)&&S()}function x(){N.active||(A(),setTimeout(function(){N.search.focus()},400))}function S(){N.active?E():A()}function A(){N.active=!0;var t=N.menu.querySelector("."+N.rootUlClass);L.addClass(N.menu,N.activeClass),L.addClass(t,"menu-active"),f()}function E(){N.active=!1;var t=N.menu.querySelector("."+N.rootUlClass);L.removeClass(N.menu,N.activeClass),L.removeClass(t,"menu-active"),w()}function k(){var t=["left","right"];if(!(t.indexOf(N.position)>=0))throw new Error("Invalid position.  Must be one of: "+vaildPositions.join(", "));L.addClass(N.menu,"menu-"+N.position)}var N,L=t("./util"),F={active:!1,menu:".fws-menu",position:"right",navClass:"fws-menu",toggleClass:"menu-toggle",subMenuClass:"sub-menu",activeClass:"fws-menu-active",rootUlClass:"fws-menu-content"};e.exports.init=n,e.exports.toggle=S,e.exports.show=A,e.exports.hide=E,e.exports.destroy=o,e.exports.toggleSearch=x}()},{"./util":16}],16:[function(t,e){!function(){"use strict";function n(t){if(b.isDom(t))return t;if(t=document.querySelector(t),b.isDom(t))return t;throw new Error("Could not find element.")}function r(t){return"string"==typeof t?document.getElementById(t):t}function o(t,e){var n=t.style[e]||t.currentStyle&&t.currentStyle[e];if((!n||"auto"===n)&&document.defaultView){var r=document.defaultView.getComputedStyle(t,null);n=r?r[e]:null}return"auto"===n?null:n}function u(t,e,n){var r=document.createElement(t);return e&&(r.className=e),n&&n.appendChild(r),r}function i(t){var e=t.parentNode;e&&e.removeChild(t)}function a(t){for(;t.firstChild;)t.removeChild(t.firstChild)}function c(t){t.parentNode.appendChild(t)}function f(t){var e=t.parentNode;e.insertBefore(t,e.firstChild)}function l(t,e){if(void 0!==t.classList)return t.classList.contains(e);var n=y(t);return n.length>0&&new RegExp("(^|\\s)"+e+"(\\s|$)").test(n)}function s(t){return p(t).split(/\s+/)}function p(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}function d(t,e){if(void 0!==t.classList)for(var n=s(e),r=0,o=n.length;o>r;r++)t.classList.add(n[r]);else if(!l(t,e)){var u=y(t);h(t,(u?u+" ":"")+e)}}function v(t,e){void 0!==t.classList?t.classList.remove(e):h(t,p((" "+y(t)+" ").replace(" "+e+" "," ")))}function h(t,e){void 0===t.className.baseVal?t.className=e:t.className.baseVal=e}function y(t){return void 0===t.className.baseVal?t.className:t.className.baseVal}var b={defaults:t("lodash.defaults"),each:t("lodash.foreach"),closest:t("select-parent"),isDom:t("is-dom"),tabbable:t("tabbable"),find:n,get:r,getStyle:o,create:u,remove:i,empty:a,toFront:c,toBack:f,hasClass:l,splitWords:s,trim:p,addClass:d,removeClass:v,setClass:h,getClass:y};e.exports=b}()},{"is-dom":1,"lodash.defaults":7,"lodash.foreach":8,"select-parent":12,tabbable:14}]},{},[15])(15)});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],9:[function(require,module,exports){
(function (global){
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n;n="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,n.Scrollnav=t()}}(function(){return function t(n,e,r){function o(u,a){if(!e[u]){if(!n[u]){var c="function"==typeof require&&require;if(!a&&c)return c(u,!0);if(i)return i(u,!0);var s=new Error("Cannot find module '"+u+"'");throw s.code="MODULE_NOT_FOUND",s}var f=e[u]={exports:{}};n[u][0].call(f.exports,function(t){var e=n[u][1][t];return o(e?e:t)},f,f.exports,t,n,e,r)}return e[u].exports}for(var i="function"==typeof require&&require,u=0;u<r.length;u++)o(r[u]);return o}({1:[function(t,n){function e(t){switch(r(t)){case"object":var n={};for(var o in t)t.hasOwnProperty(o)&&(n[o]=e(t[o]));return n;case"array":for(var n=new Array(t.length),i=0,u=t.length;u>i;i++)n[i]=e(t[i]);return n;case"regexp":var a="";return a+=t.multiline?"m":"",a+=t.global?"g":"",a+=t.ignoreCase?"i":"",new RegExp(t.source,a);case"date":return new Date(t.getTime());default:return t}}var r;try{r=t("component-type")}catch(o){r=t("type")}n.exports=e},{"component-type":5,type:5}],2:[function(t,n,e){function r(t){var n=(new Date).getTime(),e=Math.max(0,16-(n-o)),r=setTimeout(t,e);return o=n,r}e=n.exports=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||r;var o=(new Date).getTime(),i=window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||window.clearTimeout;e.cancel=function(t){i.call(window,t)}},{}],3:[function(t,n){function e(t){return this instanceof e?(this._from=t,this.ease("linear"),void this.duration(500)):new e(t)}var r=t("emitter"),o=t("clone"),i=t("type"),u=t("ease");n.exports=e,r(e.prototype),e.prototype.reset=function(){return this.isArray="array"===i(this._from),this._curr=o(this._from),this._done=!1,this._start=Date.now(),this},e.prototype.to=function(t){return this.reset(),this._to=t,this},e.prototype.duration=function(t){return this._duration=t,this},e.prototype.ease=function(t){if(t="function"==typeof t?t:u[t],!t)throw new TypeError("invalid easing function");return this._ease=t,this},e.prototype.stop=function(){return this.stopped=!0,this._done=!0,this.emit("stop"),this.emit("end"),this},e.prototype.step=function(){if(!this._done){var t=this._duration,n=Date.now(),e=n-this._start,r=e>=t;if(r)return this._from=this._to,this._update(this._to),this._done=!0,this.emit("end"),this;var o=this._from,i=this._to,u=this._curr,a=this._ease,c=(n-this._start)/t,s=a(c);if(this.isArray){for(var f=0;f<o.length;++f)u[f]=o[f]+(i[f]-o[f])*s;return this._update(u),this}for(var l in o)u[l]=o[l]+(i[l]-o[l])*s;return this._update(u),this}},e.prototype.update=function(t){return 0==arguments.length?this.step():(this._update=t,this)}},{clone:1,ease:6,emitter:4,type:5}],4:[function(t,n){function e(t){return t?r(t):void 0}function r(t){for(var n in e.prototype)t[n]=e.prototype[n];return t}n.exports=e,e.prototype.on=e.prototype.addEventListener=function(t,n){return this._callbacks=this._callbacks||{},(this._callbacks["$"+t]=this._callbacks["$"+t]||[]).push(n),this},e.prototype.once=function(t,n){function e(){this.off(t,e),n.apply(this,arguments)}return e.fn=n,this.on(t,e),this},e.prototype.off=e.prototype.removeListener=e.prototype.removeAllListeners=e.prototype.removeEventListener=function(t,n){if(this._callbacks=this._callbacks||{},0==arguments.length)return this._callbacks={},this;var e=this._callbacks["$"+t];if(!e)return this;if(1==arguments.length)return delete this._callbacks["$"+t],this;for(var r,o=0;o<e.length;o++)if(r=e[o],r===n||r.fn===n){e.splice(o,1);break}return this},e.prototype.emit=function(t){this._callbacks=this._callbacks||{};var n=[].slice.call(arguments,1),e=this._callbacks["$"+t];if(e){e=e.slice(0);for(var r=0,o=e.length;o>r;++r)e[r].apply(this,n)}return this},e.prototype.listeners=function(t){return this._callbacks=this._callbacks||{},this._callbacks["$"+t]||[]},e.prototype.hasListeners=function(t){return!!this.listeners(t).length}},{}],5:[function(t,n){var e=Object.prototype.toString;n.exports=function(t){switch(e.call(t)){case"[object Date]":return"date";case"[object RegExp]":return"regexp";case"[object Arguments]":return"arguments";case"[object Array]":return"array";case"[object Error]":return"error"}return null===t?"null":void 0===t?"undefined":t!==t?"nan":t&&1===t.nodeType?"element":(t=t.valueOf?t.valueOf():Object.prototype.valueOf.apply(t),typeof t)}},{}],6:[function(t,n,e){e.linear=function(t){return t},e.inQuad=function(t){return t*t},e.outQuad=function(t){return t*(2-t)},e.inOutQuad=function(t){return t*=2,1>t?.5*t*t:-.5*(--t*(t-2)-1)},e.inCube=function(t){return t*t*t},e.outCube=function(t){return--t*t*t+1},e.inOutCube=function(t){return t*=2,1>t?.5*t*t*t:.5*((t-=2)*t*t+2)},e.inQuart=function(t){return t*t*t*t},e.outQuart=function(t){return 1- --t*t*t*t},e.inOutQuart=function(t){return t*=2,1>t?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2)},e.inQuint=function(t){return t*t*t*t*t},e.outQuint=function(t){return--t*t*t*t*t+1},e.inOutQuint=function(t){return t*=2,1>t?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2)},e.inSine=function(t){return 1-Math.cos(t*Math.PI/2)},e.outSine=function(t){return Math.sin(t*Math.PI/2)},e.inOutSine=function(t){return.5*(1-Math.cos(Math.PI*t))},e.inExpo=function(t){return 0==t?0:Math.pow(1024,t-1)},e.outExpo=function(t){return 1==t?t:1-Math.pow(2,-10*t)},e.inOutExpo=function(t){return 0==t?0:1==t?1:(t*=2)<1?.5*Math.pow(1024,t-1):.5*(-Math.pow(2,-10*(t-1))+2)},e.inCirc=function(t){return 1-Math.sqrt(1-t*t)},e.outCirc=function(t){return Math.sqrt(1- --t*t)},e.inOutCirc=function(t){return t*=2,1>t?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)},e.inBack=function(t){var n=1.70158;return t*t*((n+1)*t-n)},e.outBack=function(t){var n=1.70158;return--t*t*((n+1)*t+n)+1},e.inOutBack=function(t){var n=2.5949095;return(t*=2)<1?.5*t*t*((n+1)*t-n):.5*((t-=2)*t*((n+1)*t+n)+2)},e.inBounce=function(t){return 1-e.outBounce(1-t)},e.outBounce=function(t){return 1/2.75>t?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375},e.inOutBounce=function(t){return.5>t?.5*e.inBounce(2*t):.5*e.outBounce(2*t-1)+.5},e["in-quad"]=e.inQuad,e["out-quad"]=e.outQuad,e["in-out-quad"]=e.inOutQuad,e["in-cube"]=e.inCube,e["out-cube"]=e.outCube,e["in-out-cube"]=e.inOutCube,e["in-quart"]=e.inQuart,e["out-quart"]=e.outQuart,e["in-out-quart"]=e.inOutQuart,e["in-quint"]=e.inQuint,e["out-quint"]=e.outQuint,e["in-out-quint"]=e.inOutQuint,e["in-sine"]=e.inSine,e["out-sine"]=e.outSine,e["in-out-sine"]=e.inOutSine,e["in-expo"]=e.inExpo,e["out-expo"]=e.outExpo,e["in-out-expo"]=e.inOutExpo,e["in-circ"]=e.inCirc,e["out-circ"]=e.outCirc,e["in-out-circ"]=e.inOutCirc,e["in-back"]=e.inBack,e["out-back"]=e.outBack,e["in-out-back"]=e.inOutBack,e["in-bounce"]=e.inBounce,e["out-bounce"]=e.outBounce,e["in-out-bounce"]=e.inOutBounce},{}],7:[function(t,n){n.exports=function(t){return t&&"object"==typeof t?window&&"object"==typeof window.Node?t instanceof window.Node:"number"==typeof t.nodeType&&"string"==typeof t.nodeName:!1}},{}],8:[function(t,n){function e(t,n){for(var e=-1,r=t.length;++e<r&&n(t[e],e,t)!==!1;);return t}n.exports=e},{}],9:[function(t,n){(function(e){function r(t,n){return t&&b(t,n,l)}function o(t){return function(n){return null==n?void 0:n[t]}}function i(t,n){return function(e,r){if(null==e)return e;if(!a(e))return t(e,r);for(var o=e.length,i=n?o:-1,u=Object(e);(n?i--:++i<o)&&r(u[i],i,u)!==!1;);return e}}function u(t){return function(n,e,r){for(var o=-1,i=Object(n),u=r(n),a=u.length;a--;){var c=u[t?a:++o];if(e(i[c],c,i)===!1)break}return n}}function a(t){return null!=t&&!("function"==typeof t&&c(t))&&s(m(t))}function c(t){var n=f(t)?y.call(t):"";return n==d||n==h}function s(t){return"number"==typeof t&&t>-1&&t%1==0&&p>=t}function f(t){var n=typeof t;return!!t&&("object"==n||"function"==n)}var l=t("lodash.keys"),p=9007199254740991,d="[object Function]",h="[object GeneratorFunction]",v=e.Object.prototype,y=v.toString,g=i(r),b=u(),m=o("length");n.exports=g}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"lodash.keys":10}],10:[function(t,n){(function(t){function e(t,n){for(var e=-1,r=Array(t);++e<t;)r[e]=n(e);return r}function r(t,n){return t="number"==typeof t||O.test(t)?+t:-1,n=null==n?b:n,t>-1&&t%1==0&&n>t}function o(t,n){return C.call(t,n)||"object"==typeof t&&n in t&&null===S(t)}function i(t){return k(Object(t))}function u(t){return function(n){return null==n?void 0:n[t]}}function a(t){var n=t?t.length:void 0;return d(n)&&(N(t)||y(t)||s(t))?e(n,String):null}function c(t){var n=t&&t.constructor,e="function"==typeof n&&n.prototype||x;return t===e}function s(t){return l(t)&&C.call(t,"callee")&&(!E.call(t,"callee")||A.call(t)==m)}function f(t){return null!=t&&!("function"==typeof t&&p(t))&&d(T(t))}function l(t){return v(t)&&f(t)}function p(t){var n=h(t)?A.call(t):"";return n==w||n==_}function d(t){return"number"==typeof t&&t>-1&&t%1==0&&b>=t}function h(t){var n=typeof t;return!!t&&("object"==n||"function"==n)}function v(t){return!!t&&"object"==typeof t}function y(t){return"string"==typeof t||!N(t)&&v(t)&&A.call(t)==j}function g(t){var n=c(t);if(!n&&!f(t))return i(t);var e=a(t),u=!!e,s=e||[],l=s.length;for(var p in t)!o(t,p)||u&&("length"==p||r(p,l))||n&&"constructor"==p||s.push(p);return s}var b=9007199254740991,m="[object Arguments]",w="[object Function]",_="[object GeneratorFunction]",j="[object String]",O=/^(?:0|[1-9]\d*)$/,x=t.Object.prototype,C=x.hasOwnProperty,A=x.toString,S=Object.getPrototypeOf,E=x.propertyIsEnumerable,k=Object.keys,T=u("length"),N=Array.isArray;n.exports=g}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],11:[function(t,n){function e(t,n){var e=[];return r(t,function(t,r,o){n(t,r,o)&&e.push(t)}),e}var r=t("lodash._baseeach");n.exports=e},{"lodash._baseeach":12}],12:[function(t,n){function e(t,n){for(var e=-1,r=Array(t);++e<t;)r[e]=n(e);return r}function r(t,n){return t="number"==typeof t||S.test(t)?+t:-1,n=null==n?j:n,t>-1&&t%1==0&&n>t}function o(t,n){return t&&q(t,n,_)}function i(t,n){return k.call(t,n)||"object"==typeof t&&n in t&&null===f(t)}function u(t){return F(Object(t))}function a(t){return function(n){return null==n?void 0:n[t]}}function c(t,n){return function(e,r){if(null==e)return e;if(!h(e))return t(e,r);for(var o=e.length,i=n?o:-1,u=Object(e);(n?i--:++i<o)&&r(u[i],i,u)!==!1;);return e}}function s(t){return function(n,e,r){for(var o=-1,i=Object(n),u=r(n),a=u.length;a--;){var c=u[t?a:++o];if(e(i[c],c,i)===!1)break}return n}}function f(t){return $(Object(t))}function l(t){var n=t?t.length:void 0;return g(n)&&(B(t)||w(t)||d(t))?e(n,String):null}function p(t){var n=t&&t.constructor,e="function"==typeof n&&n.prototype||E;return t===e}function d(t){return v(t)&&k.call(t,"callee")&&(!N.call(t,"callee")||T.call(t)==O)}function h(t){return null!=t&&g(L(t))&&!y(t)}function v(t){return m(t)&&h(t)}function y(t){var n=b(t)?T.call(t):"";return n==x||n==C}function g(t){return"number"==typeof t&&t>-1&&t%1==0&&j>=t}function b(t){var n=typeof t;return!!t&&("object"==n||"function"==n)}function m(t){return!!t&&"object"==typeof t}function w(t){return"string"==typeof t||!B(t)&&m(t)&&T.call(t)==A}function _(t){var n=p(t);if(!n&&!h(t))return u(t);var e=l(t),o=!!e,a=e||[],c=a.length;for(var s in t)!i(t,s)||o&&("length"==s||r(s,c))||n&&"constructor"==s||a.push(s);return a}var j=9007199254740991,O="[object Arguments]",x="[object Function]",C="[object GeneratorFunction]",A="[object String]",S=/^(?:0|[1-9]\d*)$/,E=Object.prototype,k=E.hasOwnProperty,T=E.toString,N=E.propertyIsEnumerable,$=Object.getPrototypeOf,F=Object.keys,M=c(o),q=s(),L=a("length"),B=Array.isArray;n.exports=M},{}],13:[function(t,n,e){(function(r){function o(t,n){for(var e=-1,r=t.length,o=Array(r);++e<r;)o[e]=n(t[e],e,t);return o}function i(t,n){for(var e=-1,r=t.length;++e<r;)if(n(t[e],e,t))return!0;return!1}function u(t,n){for(var e=-1,r=Array(t);++e<t;)r[e]=n(e);return r}function a(t,n){return o(n,function(n){return[n,t[n]]})}function c(t){return t&&t.Object===Object?t:null}function s(t){var n=!1;if(null!=t&&"function"!=typeof t.toString)try{n=!!(t+"")}catch(e){}return n}function f(t,n){return t="number"==typeof t||ln.test(t)?+t:-1,n=null==n?$t:n,t>-1&&t%1==0&&n>t}function l(t){var n=-1,e=Array(t.size);return t.forEach(function(t,r){e[++n]=[r,t]}),e}function p(t){var n=-1,e=Array(t.size);return t.forEach(function(t){e[++n]=t}),e}function d(){}function h(t,n){return y(t,n)&&delete t[n]}function v(t,n){if(Hn){var e=t[n];return e===kt?void 0:e}return xn.call(t,n)?t[n]:void 0}function y(t,n){return Hn?void 0!==t[n]:xn.call(t,n)}function g(t,n,e){t[n]=Hn&&void 0===e?kt:e}function b(t){var n=-1,e=t?t.length:0;for(this.clear();++n<e;){var r=t[n];this.set(r[0],r[1])}}function m(){this.__data__={hash:new d,map:Mn?new Mn:[],string:new d}}function w(t){var n=this.__data__;return ot(t)?h("string"==typeof t?n.string:n.hash,t):Mn?n.map["delete"](t):T(n.map,t)}function _(t){var n=this.__data__;return ot(t)?v("string"==typeof t?n.string:n.hash,t):Mn?n.map.get(t):N(n.map,t)}function j(t){var n=this.__data__;return ot(t)?y("string"==typeof t?n.string:n.hash,t):Mn?n.map.has(t):$(n.map,t)}function O(t,n){var e=this.__data__;return ot(t)?g("string"==typeof t?e.string:e.hash,t,n):Mn?e.map.set(t,n):M(e.map,t,n),this}function x(t){var n=-1,e=t?t.length:0;for(this.clear();++n<e;){var r=t[n];this.set(r[0],r[1])}}function C(){this.__data__={array:[],map:null}}function A(t){var n=this.__data__,e=n.array;return e?T(e,t):n.map["delete"](t)}function S(t){var n=this.__data__,e=n.array;return e?N(e,t):n.map.get(t)}function E(t){var n=this.__data__,e=n.array;return e?$(e,t):n.map.has(t)}function k(t,n){var e=this.__data__,r=e.array;r&&(r.length<Et-1?M(r,t,n):(e.array=null,e.map=new b(r)));var o=e.map;return o&&o.set(t,n),this}function T(t,n){var e=F(t,n);if(0>e)return!1;var r=t.length-1;return e==r?t.pop():Tn.call(t,e,1),!0}function N(t,n){var e=F(t,n);return 0>e?void 0:t[e][1]}function $(t,n){return F(t,n)>-1}function F(t,n){for(var e=t.length;e--;)if(st(t[e][0],n))return e;return-1}function M(t,n,e){var r=F(t,n);0>r?t.push([n,e]):t[r][1]=e}function q(t){return Gn(t)?t:St(t)}function L(t,n){n=rt(n,t)?[n]:q(n);for(var e=0,r=n.length;null!=t&&r>e;)t=t[n[e++]];return e&&e==r?t:void 0}function B(t,n){return xn.call(t,n)||"object"==typeof t&&n in t&&null===Z(t)}function H(t,n){return n in Object(t)}function P(t,n,e,r,o){return t===n?!0:null==t||null==n||!vt(t)&&!yt(n)?t!==t&&n!==n:Q(t,n,P,e,r,o)}function Q(t,n,e,r,o,i){var u=Gn(t),a=Gn(n),c=Mt,f=Mt;u||(c=tt(t),c=c==Ft?It:c),a||(f=tt(n),f=f==Ft?It:f);var l=c==It&&!s(t),p=f==It&&!s(n),d=c==f;if(d&&!l)return i||(i=new x),u||wt(t)?V(t,n,e,r,o,i):Y(t,n,c,e,r,o,i);if(!(o&Nt)){var h=l&&xn.call(t,"__wrapped__"),v=p&&xn.call(n,"__wrapped__");if(h||v){var y=h?t.value():t,g=v?n.value():n;return i||(i=new x),e(y,g,r,o,i)}}return d?(i||(i=new x),X(t,n,e,r,o,i)):!1}function D(t,n,e,r){var o=e.length,i=o,u=!r;if(null==t)return!i;for(t=Object(t);o--;){var a=e[o];if(u&&a[2]?a[1]!==t[a[0]]:!(a[0]in t))return!1}for(;++o<i;){a=e[o];var c=a[0],s=t[c],f=a[1];if(u&&a[2]){if(void 0===s&&!(c in t))return!1}else{var l=new x;if(r)var p=r(s,f,c,t,n,l);if(!(void 0===p?P(f,s,r,Tt|Nt,l):p))return!1}}return!0}function I(t){return"function"==typeof t?t:null==t?Ct:"object"==typeof t?Gn(t)?W(t[0],t[1]):U(t):At(t)}function R(t){return $n(Object(t))}function U(t){var n=J(t);return 1==n.length&&n[0][2]?at(n[0][0],n[0][1]):function(e){return e===t||D(e,t,n)}}function W(t,n){return rt(t)&&ut(n)?at(t,n):function(e){var r=_t(e,t);return void 0===r&&r===n?jt(e,t):P(n,r,void 0,Tt|Nt)}}function z(t){return function(n){return null==n?void 0:n[t]}}function G(t){return function(n){return L(n,t)}}function V(t,n,e,r,o,u){var a=-1,c=o&Nt,s=o&Tt,f=t.length,l=n.length;if(f!=l&&!(c&&l>f))return!1;var p=u.get(t);if(p)return p==n;var d=!0;for(u.set(t,n);++a<f;){var h=t[a],v=n[a];if(r)var y=c?r(v,h,a,n,t,u):r(h,v,a,t,n,u);if(void 0!==y){if(y)continue;d=!1;break}if(s){if(!i(n,function(t){return h===t||e(h,t,r,o,u)})){d=!1;break}}else if(h!==v&&!e(h,v,r,o,u)){d=!1;break}}return u["delete"](t),d}function Y(t,n,e,r,o,i,u){switch(e){case Xt:if(t.byteLength!=n.byteLength||t.byteOffset!=n.byteOffset)return!1;t=t.buffer,n=n.buffer;case Yt:return t.byteLength==n.byteLength&&r(new En(t),new En(n))?!0:!1;case qt:case Lt:return+t==+n;case Bt:return t.name==n.name&&t.message==n.message;case Dt:return t!=+t?n!=+n:t==+n;case Ut:case zt:return t==n+"";case Qt:var a=l;case Wt:var c=i&Nt;if(a||(a=p),t.size!=n.size&&!c)return!1;var s=u.get(t);return s?s==n:(i|=Tt,u.set(t,n),V(a(t),a(n),r,o,i,u));case Gt:if(Wn)return Wn.call(t)==Wn.call(n)}return!1}function X(t,n,e,r,o,i){var u=o&Nt,a=Ot(t),c=a.length,s=Ot(n),f=s.length;if(c!=f&&!u)return!1;for(var l=c;l--;){var p=a[l];if(!(u?p in n:B(n,p)))return!1}var d=i.get(t);if(d)return d==n;var h=!0;i.set(t,n);for(var v=u;++l<c;){p=a[l];var y=t[p],g=n[p];if(r)var b=u?r(g,y,p,n,t,i):r(y,g,p,t,n,i);if(!(void 0===b?y===g||e(y,g,r,o,i):b)){h=!1;break}v||(v="constructor"==p)}if(h&&!v){var m=t.constructor,w=n.constructor;m!=w&&"constructor"in t&&"constructor"in n&&!("function"==typeof m&&m instanceof m&&"function"==typeof w&&w instanceof w)&&(h=!1)}return i["delete"](t),h}function J(t){for(var n=xt(t),e=n.length;e--;)n[e][2]=ut(n[e][1]);return n}function K(t,n){var e=t[n];return gt(e)?e:void 0}function Z(t){return Nn(Object(t))}function tt(t){return Cn.call(t)}function nt(t,n,e){n=rt(n,t)?[n]:q(n);for(var r,o=-1,i=n.length;++o<i;){var u=n[o];if(!(r=null!=t&&e(t,u)))break;t=t[u]}if(r)return r;var i=t?t.length:0;return!!i&&ht(i)&&f(u,i)&&(Gn(t)||bt(t)||ft(t))}function et(t){var n=t?t.length:void 0;return ht(n)&&(Gn(t)||bt(t)||ft(t))?u(n,String):null}function rt(t,n){var e=typeof t;return"number"==e||"symbol"==e?!0:!Gn(t)&&(mt(t)||cn.test(t)||!an.test(t)||null!=n&&t in Object(n))}function ot(t){var n=typeof t;return"number"==n||"boolean"==n||"string"==n&&"__proto__"!=t||null==t}function it(t){var n=t&&t.constructor,e="function"==typeof n&&n.prototype||jn;return t===e}function ut(t){return t===t&&!vt(t)}function at(t,n){return function(e){return null==e?!1:e[t]===n&&(void 0!==n||t in Object(e))}}function ct(t){if(null!=t){try{return On.call(t)}catch(n){}try{return t+""}catch(n){}}return""}function st(t,n){return t===n||t!==t&&n!==n}function ft(t){return pt(t)&&xn.call(t,"callee")&&(!kn.call(t,"callee")||Cn.call(t)==Ft)}function lt(t){return null!=t&&ht(zn(t))&&!dt(t)}function pt(t){return yt(t)&&lt(t)}function dt(t){var n=vt(t)?Cn.call(t):"";return n==Ht||n==Pt}function ht(t){return"number"==typeof t&&t>-1&&t%1==0&&$t>=t}function vt(t){var n=typeof t;return!!t&&("object"==n||"function"==n)}function yt(t){return!!t&&"object"==typeof t}function gt(t){if(!vt(t))return!1;var n=dt(t)||s(t)?An:fn;return n.test(ct(t))}function bt(t){return"string"==typeof t||!Gn(t)&&yt(t)&&Cn.call(t)==zt}function mt(t){return"symbol"==typeof t||yt(t)&&Cn.call(t)==Gt}function wt(t){return yt(t)&&ht(t.length)&&!!pn[Cn.call(t)]}function _t(t,n,e){var r=null==t?void 0:L(t,n);return void 0===r?e:r}function jt(t,n){return null!=t&&nt(t,n,H)}function Ot(t){var n=it(t);if(!n&&!lt(t))return R(t);var e=et(t),r=!!e,o=e||[],i=o.length;for(var u in t)!B(t,u)||r&&("length"==u||f(u,i))||n&&"constructor"==u||o.push(u);return o}function xt(t){return a(t,Ot(t))}function Ct(t){return t}function At(t){return rt(t)?z(t):G(t)}var St=t("lodash._stringtopath"),Et=200,kt="__lodash_hash_undefined__",Tt=1,Nt=2,$t=9007199254740991,Ft="[object Arguments]",Mt="[object Array]",qt="[object Boolean]",Lt="[object Date]",Bt="[object Error]",Ht="[object Function]",Pt="[object GeneratorFunction]",Qt="[object Map]",Dt="[object Number]",It="[object Object]",Rt="[object Promise]",Ut="[object RegExp]",Wt="[object Set]",zt="[object String]",Gt="[object Symbol]",Vt="[object WeakMap]",Yt="[object ArrayBuffer]",Xt="[object DataView]",Jt="[object Float32Array]",Kt="[object Float64Array]",Zt="[object Int8Array]",tn="[object Int16Array]",nn="[object Int32Array]",en="[object Uint8Array]",rn="[object Uint8ClampedArray]",on="[object Uint16Array]",un="[object Uint32Array]",an=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,cn=/^\w*$/,sn=/[\\^$.*+?()[\]{}|]/g,fn=/^\[object .+?Constructor\]$/,ln=/^(?:0|[1-9]\d*)$/,pn={};pn[Jt]=pn[Kt]=pn[Zt]=pn[tn]=pn[nn]=pn[en]=pn[rn]=pn[on]=pn[un]=!0,pn[Ft]=pn[Mt]=pn[Yt]=pn[qt]=pn[Xt]=pn[Lt]=pn[Bt]=pn[Ht]=pn[Qt]=pn[Dt]=pn[It]=pn[Ut]=pn[Wt]=pn[zt]=pn[Vt]=!1;var dn={"function":!0,object:!0},hn=dn[typeof e]&&e&&!e.nodeType?e:void 0,vn=dn[typeof n]&&n&&!n.nodeType?n:void 0,yn=c(hn&&vn&&"object"==typeof r&&r),gn=c(dn[typeof self]&&self),bn=c(dn[typeof window]&&window),mn=c(dn[typeof this]&&this),wn=yn||bn!==(mn&&mn.window)&&bn||gn||mn||Function("return this")(),_n=Array.prototype,jn=Object.prototype,On=Function.prototype.toString,xn=jn.hasOwnProperty,Cn=jn.toString,An=RegExp("^"+On.call(xn).replace(sn,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),Sn=wn.Symbol,En=wn.Uint8Array,kn=jn.propertyIsEnumerable,Tn=_n.splice,Nn=Object.getPrototypeOf,$n=Object.keys,Fn=K(wn,"DataView"),Mn=K(wn,"Map"),qn=K(wn,"Promise"),Ln=K(wn,"Set"),Bn=K(wn,"WeakMap"),Hn=K(Object,"create"),Pn=ct(Fn),Qn=ct(Mn),Dn=ct(qn),In=ct(Ln),Rn=ct(Bn),Un=Sn?Sn.prototype:void 0,Wn=Un?Un.valueOf:void 0;d.prototype=Hn?Hn(null):jn,b.prototype.clear=m,b.prototype["delete"]=w,b.prototype.get=_,b.prototype.has=j,b.prototype.set=O,x.prototype.clear=C,x.prototype["delete"]=A,x.prototype.get=S,x.prototype.has=E,x.prototype.set=k;var zn=z("length");(Fn&&tt(new Fn(new ArrayBuffer(1)))!=Xt||Mn&&tt(new Mn)!=Qt||qn&&tt(qn.resolve())!=Rt||Ln&&tt(new Ln)!=Wt||Bn&&tt(new Bn)!=Vt)&&(tt=function(t){var n=Cn.call(t),e=n==It?t.constructor:void 0,r=e?ct(e):void 0;if(r)switch(r){case Pn:return Xt;case Qn:return Qt;case Dn:return Rt;case In:return Wt;case Rn:return Vt}return n});var Gn=Array.isArray;n.exports=I}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"lodash._stringtopath":14}],14:[function(t,n,e){(function(t){function r(t){return t&&t.Object===Object?t:null}function o(t){var n=!1;if(null!=t&&"function"!=typeof t.toString)try{n=!!(t+"")}catch(e){}return n}function i(){}function u(t,n){return c(t,n)&&delete t[n]}function a(t,n){if(it){var e=t[n];return e===F?void 0:e}return Z.call(t,n)?t[n]:void 0}function c(t,n){return it?void 0!==t[n]:Z.call(t,n)}function s(t,n,e){t[n]=it&&void 0===e?F:e}function f(t){var n=-1,e=t?t.length:0;for(this.clear();++n<e;){var r=t[n];this.set(r[0],r[1])}}function l(){this.__data__={hash:new i,map:ot?new ot:[],string:new i}}function p(t){var n=this.__data__;return j(t)?u("string"==typeof t?n.string:n.hash,t):ot?n.map["delete"](t):y(n.map,t)}function d(t){var n=this.__data__;return j(t)?a("string"==typeof t?n.string:n.hash,t):ot?n.map.get(t):g(n.map,t)}function h(t){var n=this.__data__;return j(t)?c("string"==typeof t?n.string:n.hash,t):ot?n.map.has(t):b(n.map,t)}function v(t,n){var e=this.__data__;return j(t)?s("string"==typeof t?e.string:e.hash,t,n):ot?e.map.set(t,n):w(e.map,t,n),this}function y(t,n){var e=m(t,n);if(0>e)return!1;var r=t.length-1;return e==r?t.pop():rt.call(t,e,1),!0}function g(t,n){var e=m(t,n);return 0>e?void 0:t[e][1]}function b(t,n){return m(t,n)>-1}function m(t,n){for(var e=t.length;e--;)if(C(t[e][0],n))return e;return-1}function w(t,n,e){var r=m(t,n);0>r?t.push([n,e]):t[r][1]=e}function _(t,n){var e=t[n];return k(e)?e:void 0}function j(t){var n=typeof t;return"number"==n||"boolean"==n||"string"==n&&"__proto__"!=t||null==t}function O(t){if(null!=t){try{return K.call(t)}catch(n){}try{return t+""}catch(n){}}return""}function x(t,n){if("function"!=typeof t||n&&"function"!=typeof n)throw new TypeError($);var e=function(){var r=arguments,o=n?n.apply(this,r):r[0],i=e.cache;if(i.has(o))return i.get(o);var u=t.apply(this,r);return e.cache=i.set(o,u),u};return e.cache=new(x.Cache||f),e}function C(t,n){return t===n||t!==t&&n!==n}function A(t){var n=S(t)?tt.call(t):"";return n==q||n==L}function S(t){var n=typeof t;return!!t&&("object"==n||"function"==n)}function E(t){return!!t&&"object"==typeof t}function k(t){if(!S(t))return!1;var n=A(t)||o(t)?nt:D;return n.test(O(t))}function T(t){return"symbol"==typeof t||E(t)&&tt.call(t)==B}function N(t){if("string"==typeof t)return t;if(null==t)return"";if(T(t))return at?at.call(t):"";var n=t+"";return"0"==n&&1/t==-M?"-0":n}var $="Expected a function",F="__lodash_hash_undefined__",M=1/0,q="[object Function]",L="[object GeneratorFunction]",B="[object Symbol]",H=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]/g,P=/[\\^$.*+?()[\]{}|]/g,Q=/\\(\\)?/g,D=/^\[object .+?Constructor\]$/,I={"function":!0,object:!0},R=I[typeof e]&&e&&!e.nodeType?e:void 0,U=I[typeof n]&&n&&!n.nodeType?n:void 0,W=r(R&&U&&"object"==typeof t&&t),z=r(I[typeof self]&&self),G=r(I[typeof window]&&window),V=r(I[typeof this]&&this),Y=W||G!==(V&&V.window)&&G||z||V||Function("return this")(),X=Array.prototype,J=Object.prototype,K=Function.prototype.toString,Z=J.hasOwnProperty,tt=J.toString,nt=RegExp("^"+K.call(Z).replace(P,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),et=Y.Symbol,rt=X.splice,ot=_(Y,"Map"),it=_(Object,"create"),ut=et?et.prototype:void 0,at=ut?ut.toString:void 0;i.prototype=it?it(null):J,f.prototype.clear=l,f.prototype["delete"]=p,f.prototype.get=d,f.prototype.has=h,f.prototype.set=v;var ct=x(function(t){var n=[];return N(t).replace(H,function(t,e,r,o){n.push(r?o.replace(Q,"$1"):e||t)}),n});x.Cache=f,n.exports=ct}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],15:[function(t,n){(function(e){function r(t,n){return t="number"==typeof t||m.test(t)?+t:-1,n=null==n?y:n,t>-1&&t%1==0&&n>t}function o(t,n,e){var r=t[n];(!s(r,e)||s(r,w[n])&&!_.call(t,n)||void 0===e&&!(n in t))&&(t[n]=e)}function i(t){return function(n){return null==n?void 0:n[t]}}function u(t,n,e,r){e||(e={});for(var i=-1,u=n.length;++i<u;){var a=n[i],c=r?r(e[a],t[a],a,e,t):t[a];o(e,a,c)}return e}function a(t){return v(function(n,e){var r=-1,o=e.length,i=o>1?e[o-1]:void 0,u=o>2?e[2]:void 0;for(i="function"==typeof i?(o--,i):void 0,u&&c(e[0],e[1],u)&&(i=3>o?void 0:i,o=1),n=Object(n);++r<o;){var a=e[r];a&&t(n,a,i)}return n})}function c(t,n,e){if(!d(e))return!1;var o=typeof n;return("number"==o?f(e)&&r(n,e.length):"string"==o&&n in e)?s(e[n],t):!1}function s(t,n){return t===n||t!==t&&n!==n}function f(t){return null!=t&&!("function"==typeof t&&l(t))&&p(O(t))}function l(t){var n=d(t)?j.call(t):"";return n==g||n==b}function p(t){return"number"==typeof t&&t>-1&&t%1==0&&y>=t}function d(t){var n=typeof t;return!!t&&("object"==n||"function"==n)}var h=t("lodash.keysin"),v=t("lodash.rest"),y=9007199254740991,g="[object Function]",b="[object GeneratorFunction]",m=/^(?:0|[1-9]\d*)$/,w=e.Object.prototype,_=w.hasOwnProperty,j=w.toString,O=i("length"),x=a(function(t,n,e){u(n,h(n),t,e)});n.exports=x}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"lodash.keysin":16,"lodash.rest":22}],16:[function(t,n){(function(t){function e(t,n){for(var e=-1,r=Array(t);++e<t;)r[e]=n(e);return r}function r(t,n){return t="number"==typeof t||O.test(t)?+t:-1,n=null==n?b:n,t>-1&&t%1==0&&n>t}function o(t){for(var n,e=[];!(n=t.next()).done;)e.push(n.value);return e}function i(t){t=null==t?t:Object(t);var n=[];for(var e in t)n.push(e);return n}function u(t){return function(n){return null==n?void 0:n[t]}}function a(t){var n=t?t.length:void 0;return d(n)&&(N(t)||y(t)||s(t))?e(n,String):null}function c(t){var n=t&&t.constructor,e="function"==typeof n&&n.prototype||x;return t===e}function s(t){return l(t)&&C.call(t,"callee")&&(!k.call(t,"callee")||A.call(t)==m)}function f(t){return null!=t&&!("function"==typeof t&&p(t))&&d(T(t))}function l(t){return v(t)&&f(t)}function p(t){var n=h(t)?A.call(t):"";return n==w||n==_}function d(t){return"number"==typeof t&&t>-1&&t%1==0&&b>=t}function h(t){var n=typeof t;return!!t&&("object"==n||"function"==n)}function v(t){return!!t&&"object"==typeof t}function y(t){return"string"==typeof t||!N(t)&&v(t)&&A.call(t)==j}function g(t){for(var n=-1,e=c(t),o=i(t),u=o.length,s=a(t),f=!!s,l=s||[],p=l.length;++n<u;){var d=o[n];f&&("length"==d||r(d,p))||"constructor"==d&&(e||!C.call(t,d))||l.push(d)}return l}var b=9007199254740991,m="[object Arguments]",w="[object Function]",_="[object GeneratorFunction]",j="[object String]",O=/^(?:0|[1-9]\d*)$/,x=t.Object.prototype,C=x.hasOwnProperty,A=x.toString,S=t.Reflect,E=S?S.enumerate:void 0,k=x.propertyIsEnumerable;E&&!k.call({valueOf:1},"valueOf")&&(i=function(t){return o(E(t))});var T=u("length"),N=Array.isArray;n.exports=g}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],17:[function(t,n){function e(t,n,e){function r(){m&&clearTimeout(m),d&&clearTimeout(d),_=0,p=d=y=m=w=void 0}function a(n,e){e&&clearTimeout(e),d=m=w=void 0,n&&(_=b(),h=t.apply(y,p),m||d||(p=y=void 0))}function c(){var t=n-(b()-v);0>=t||t>n?a(w,d):m=setTimeout(c,t)}function s(){return(m&&w||d&&x)&&(h=t.apply(y,p)),r(),h}function f(){a(x,m)}function l(){if(p=arguments,v=b(),y=this,w=x&&(m||!j),O===!1)var e=j&&!m;else{_||d||j||(_=v);var r=O-(v-_),o=(0>=r||r>O)&&(j||d);o?(d&&(d=clearTimeout(d)),_=v,h=t.apply(y,p)):d||(d=setTimeout(f,r))}return o&&m?m=clearTimeout(m):m||n===O||(m=setTimeout(c,n)),e&&(o=!0,h=t.apply(y,p)),!o||m||d||(p=y=void 0),h}var p,d,h,v,y,m,w,_=0,j=!1,O=!1,x=!0;if("function"!=typeof t)throw new TypeError(u);return n=i(n)||0,o(e)&&(j=!!e.leading,O="maxWait"in e&&g(i(e.maxWait)||0,n),x="trailing"in e?!!e.trailing:x),l.cancel=r,l.flush=s,l}function r(t){var n=o(t)?y.call(t):"";return n==c||n==s}function o(t){var n=typeof t;return!!t&&("object"==n||"function"==n)}function i(t){if(o(t)){var n=r(t.valueOf)?t.valueOf():t;t=o(n)?n+"":n}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(f,"");var e=p.test(t);return e||d.test(t)?h(t.slice(2),e?2:8):l.test(t)?a:+t}var u="Expected a function",a=0/0,c="[object Function]",s="[object GeneratorFunction]",f=/^\s+|\s+$/g,l=/^[-+]0x[0-9a-f]+$/i,p=/^0b[01]+$/i,d=/^0o[0-7]+$/i,h=parseInt,v=Object.prototype,y=v.toString,g=Math.max,b=Date.now;n.exports=e},{}],18:[function(t,n){(function(e){function r(t,n,e){var r=e?e.length:0;switch(r){case 0:return t.call(n);case 1:return t.call(n,e[0]);case 2:return t.call(n,e[0],e[1]);case 3:return t.call(n,e[0],e[1],e[2])}return t.apply(n,e)}function o(t,n,e,r){return void 0===t||i(t,c[e])&&!s.call(r,e)?n:t}function i(t,n){return t===n||t!==t&&n!==n}var u=t("lodash.assigninwith"),a=t("lodash.rest"),c=e.Object.prototype,s=c.hasOwnProperty,f=a(function(t){return t.push(void 0,o),r(u,void 0,t)});n.exports=f}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"lodash.assigninwith":15,"lodash.rest":22}],19:[function(t,n){function e(t,n){for(var e=-1,r=t.length,o=0,i=[];++e<r;){var u=t[e];n(u,e,t)&&(i[o++]=u)}return i}function r(t,n){var r=u(t)?e:o;return r(t,i(n,3))}var o=t("lodash._basefilter"),i=t("lodash._baseiteratee"),u=Array.isArray;n.exports=r},{"lodash._basefilter":11,"lodash._baseiteratee":13}],20:[function(t,n){function e(t){return"function"==typeof t?t:o}function r(t,n){return"function"==typeof n&&a(t)?i(t,n):u(t,e(n))}function o(t){return t}var i=t("lodash._arrayeach"),u=t("lodash._baseeach"),a=Array.isArray;n.exports=r},{"lodash._arrayeach":8,"lodash._baseeach":9}],21:[function(t,n){var e=Array.isArray;n.exports=e},{}],22:[function(t,n){(function(t){function e(t,n,e){var r=e?e.length:0;switch(r){case 0:return t.call(n);case 1:return t.call(n,e[0]);case 2:return t.call(n,e[0],e[1]);case 3:return t.call(n,e[0],e[1],e[2])}return t.apply(n,e);

}function r(t,n){if("function"!=typeof t)throw new TypeError(c);return n=_(void 0===n?t.length-1:u(n),0),function(){for(var r=arguments,o=-1,i=_(r.length-n,0),u=Array(i);++o<i;)u[o]=r[n+o];switch(n){case 0:return t.call(this,u);case 1:return t.call(this,r[0],u);case 2:return t.call(this,r[0],r[1],u)}var a=Array(n+1);for(o=-1;++o<n;)a[o]=r[o];return a[n]=u,e(t,this,a)}}function o(t){var n=i(t)?w.call(t):"";return n==p||n==d}function i(t){var n=typeof t;return!!t&&("object"==n||"function"==n)}function u(t){if(!t)return 0===t?t:0;if(t=a(t),t===s||t===-s){var n=0>t?-1:1;return n*f}var e=t%1;return t===t?e?t-e:t:0}function a(t){if(i(t)){var n=o(t.valueOf)?t.valueOf():t;t=i(n)?n+"":n}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(h,"");var e=y.test(t);return e||g.test(t)?b(t.slice(2),e?2:8):v.test(t)?l:+t}var c="Expected a function",s=1/0,f=1.7976931348623157e308,l=0/0,p="[object Function]",d="[object GeneratorFunction]",h=/^\s+|\s+$/g,v=/^[-+]0x[0-9a-f]+$/i,y=/^0b[01]+$/i,g=/^0o[0-7]+$/i,b=parseInt,m=t.Object.prototype,w=m.toString,_=Math.max;n.exports=r}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],23:[function(t,n){function e(t,n,e){var r=document.body,o=document.documentElement,i=t.getBoundingClientRect(),u=o.clientHeight,a=Math.max(r.scrollHeight,r.offsetHeight,o.clientHeight,o.scrollHeight,o.offsetHeight);n=n||0;var c;c="bottom"===e?i.bottom-u:"middle"===e?i.bottom-u/2-i.height/2:i.top;var s=a-u;return Math.min(c+n+window.pageYOffset,s)}var r=t("scroll-to");n.exports=function(t,n){return n=n||{},"string"==typeof t&&(t=document.querySelector(t)),t?r(0,e(t,n.offset,n.align),n):void 0}},{"scroll-to":24}],24:[function(t,n){function e(t,n,e){function u(){i(u),c.update()}e=e||{};var a=r(),c=o(a).ease(e.ease||"out-circ").to({top:n,left:t}).duration(e.duration||1e3);return c.update(function(t){window.scrollTo(0|t.left,0|t.top)}),c.on("end",function(){u=function(){}}),u(),c}function r(){var t=window.pageYOffset||document.documentElement.scrollTop,n=window.pageXOffset||document.documentElement.scrollLeft;return{top:t,left:n}}var o=t("tween"),i=t("raf");n.exports=e},{raf:2,tween:3}],25:[function(t,n){!function(){"use strict";function e(t){if(v.settings=h.defaults({},t,y),p("loading"),h.isDom(v.settings.container)||(v.settings.container=document.querySelector(v.settings.container)),null===v.settings.container||"string"==typeof v.settings.container)throw new Error("Could not find the content container.  Make sure you passed in a valid Dom node or CSS selector.");f(v.settings.container),l(v.sections.raw),s(v.sections.data),c(),a(),u(),r()}function r(){window.addEventListener("scroll",h.debounce(u,v.settings.debounceTimer)),window.addEventListener("resize",o),v.nav.addEventListener("click",i)}function o(){h.debounce(function(){a(),u()},v.settings.debounceTimer)}function i(t){if("A"===t.target.nodeName){var n=t.target.getAttribute("href");d(n,{offset:-45})}}function u(){var t=window.pageYOffset,n=t+v.settings.scrollOffset,e=t+v.dims.vpHeight-v.settings.scrollOffset,r=[],o=[];t>v.dims.navOffset-v.settings.fixedMargin?h.addClass(v.nav,"fixed"):h.removeClass(v.nav,"fixed");var i=function(t){return t.topOffset>=n&&t.topOffset<=e||t.bottomOffset>n&&t.bottomOffset<e||t.topOffset<n&&t.bottomOffset>e};h.each(v.sections.data,function(t){i(t)&&r.push(t),h.each(t.subSections,function(){i(t)&&o.push(t)})});var u=v.nav.getElementsByClassName(v.settings.className+"__item");h.each(u,function(t){h.removeClass(t,"active"),h.removeClass(t,"in-view")});var a=v.nav.getElementsByClassName(v.settings.className+"__sub-item");h.each(a,function(t){h.removeClass(t,"active"),h.removeClass(t,"in-view")}),h.each(r,function(t,n){var e,r;0===n?(e=v.nav.querySelector('a[href="#'+t.id+'"]'),r=h.parents(e,v.settings.className+"__item"),h.each(r,function(t){h.addClass(t,"active"),h.addClass(t,"in-view")})):(e=v.nav.querySelector('a[href="#'+t.id+'"]'),r=h.parents(e,v.settings.className+"__item"),h.each(r,function(t){h.addClass(t,"in-view")}))}),v.sections.active=r,h.each(o,function(t){var n,e;0===t?(n=v.nav.querySelector('a[href="#'+this.id+'"]'),e=h.parents(n,v.settings.className+"__sub-item"),_each(e,function(t){h.addClass(t,"active"),h.addClass(t,"in-view")})):(n=v.nav.querySelector('a[href="#'+this.id+'"]'),e=h.parents(v.settings.className+"__sub-item"),_each(e,function(t){h.addClass(t,"in-view")}))})}function a(){var t=h.getWindowSize().height,n=h.offset(v.nav).top,e=function(t){var n=document.getElementById(t.id);t.topOffset=h.offset(n).top,t.bottomOffset=t.topOffset+n.clientHeight};h.each(v.sections.data,function(t){e(t),h.each(t.subSections,function(t){e(t)})}),v.dims={vpHeight:t,navOffset:n}}function c(){h.isDom(v.settings.insertTarget)?v.settings.insertTarget.appendChild(v.nav):document.querySelector(v.settings.insertTarget).appendChild(v.nav)}function s(t){var n=h.create("ol",v.settings.className+"__list"),e=h.create("span",v.settings.className+"__heading"),r=h.create("div",v.settings.className+"__wrapper"),o=h.create("nav",v.settings.className);o.setAttribute("role","navigation"),e.innerHTML=v.settings.headlineText,h.each(t,function(t,e){var r,o=0===e?h.create("li",v.settings.className+"__item active",n):h.create("li",v.settings.className+"__item",n),i=h.create("a",v.settings.className+"__link",o);i.setAttribute("href","#"+t.id),i.innerHTML=t.text,t.subSections.length>0&&(h.addClass(o,"is-parent-item"),r=h.create("ol",v.settings.className+"__sub-list",o),h.each(t.subSections,function(t){var n=h.create("li",v.settings.className+"__sub-item",r),e=h.create("a",v.settings.className+"__sub-link",n);e.innerHTML=t.text,e.setAttribute("href","#"+t.id)}))}),v.settings.showHeadline?(r.appendChild(e),r.appendChild(n),o.appendChild(r)):o.appendChild(r.appendChild(n)),v.nav=o}function f(t){var n,e,r=v.settings.sections,o=[],i=t.querySelectorAll(r);v.settings.showTopLink&&(e=t.firstChild,h.is(e,r)||(n=h.nextUntil(e,r),n.unshift(e),o.push(n))),h.each(i,function(t){n=h.nextUntil(t,r),n.unshift(t),o.push(n)}),v.sections={raw:o}}function l(t){function n(t){var n=h.filter(t,function(t){return t.nodeName===v.settings.sections.toUpperCase()});return 1===n.length?n[0].innerHTML:void console.error("Found more than one heading in this section")}var e=[];h.each(t,function(t,r){var o=[],i="scrollNav-"+(r+1),u=function(){return 0===r},a=function(){return!h.is(t[0],v.settings.sections)},c=v.settings.showTopLink&&u()&&a()?v.settings.topLinkText:n(t);h.wrapAll({elms:t,wrapEl:v.settings.sectionElem,id:i,"class":v.settings.className+"__section"}),e.push({id:i,text:c,subSections:o})}),v.sections.data=e}function p(t){var n=document.body;"loading"===t?h.addClass(n,v.classes.loading):"success"===t?(h.removeClass(n,v.classes.loading),h.addClass(n,v.classes.success)):(h.removeClass(n,v.classes.loading),h.addClass(bodyS.classes.failed))}var d=t("scroll-to-element"),h=t("./util"),v={classes:{loading:"sn-loading",failed:"sn-failed",success:"sn-active"}},y={className:"scroll-nav",container:document.querySelector(".container"),debounceTimer:10,headlineText:"Scroll To",insertTarget:document.body,sections:"h2",sectionElem:"section",showHeadline:!0,subSections:!0,fixedMargin:40,scrollOffset:40};n.exports.init=e}()},{"./util":26,"scroll-to-element":23}],26:[function(t,n){!function(){"use strict";function e(t,n){var e=[];return b.isArray(t)||(t=[t]),b.each(t,function(t){b.hasClass(t.parentNode,n)&&e.push(t.parentNode)}),e}function r(t,n){[].some.call(t,function(t){return t.matches(n)})}function o(t,n){for(var e=[],r=!0;t=t.nextElementSibling;)r&&t&&!t.matches(n)?e.push(t):r=!1;return e}function i(t){for(var n=t.parentNode;t.firstChild;)n.insertBefore(t.firstChild,t);n.removeChild(t)}function u(t){var n=document.createElement(t.wrapEl);return n.setAttribute("id",t.id),p(n,t["class"]),t.elms[0].parentNode.appendChild(n),b.each(t.elms,function(t){n.appendChild(t)}),n}function a(t,n){void 0!==t.classList?t.classList.remove(n):d(t,l((" "+h(t)+" ").replace(" "+n+" "," ")))}function c(t){var n=t.parentNode;n&&n.removeChild(t)}function s(t,n){if(void 0!==t.classList)return t.classList.contains(n);var e=h(t);return e.length>0&&new RegExp("(^|\\s)"+n+"(\\s|$)").test(e)}function f(t){return l(t).split(/\s+/)}function l(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}function p(t,n){if(void 0!==t.classList)for(var e=f(n),r=0,o=e.length;o>r;r++)t.classList.add(e[r]);else if(!s(t,n)){var i=h(t);d(t,(i?i+" ":"")+n)}}function d(t,n){void 0===t.className.baseVal?t.className=n:t.className.baseVal=n}function h(t){return void 0===t.className.baseVal?t.className:t.className.baseVal}function v(t,n,e){var r=document.createElement(t);return r.className=n,e&&e.appendChild(r),r}function y(){function t(){var t,n=document,e=n.createElement("div");return e.style.height="50000px",n.body.insertBefore(e,n.body.firstChild),t=n.documentElement.clientHeight>49e3,n.body.removeChild(e),t}var n=document.documentElement,e=n&&0===n.clientHeight,r=document.body;return"number"==typeof document.clientWidth?{width:document.clientWidth,height:document.clientHeight}:e||t()?{width:r.clientWidth,height:r.clientHeight}:{width:n.clientWidth,height:n.clientHeight}}function g(t){var n=t.getBoundingClientRect(),e=window.pageXOffset||document.documentElement.scrollLeft,r=window.pageYOffset||document.documentElement.scrollTop;return{top:n.top+r,left:n.left+e}}var b={each:t("lodash.forEach"),filter:t("lodash.filter"),isDom:t("is-dom"),debounce:t("lodash.debounce"),defaults:t("lodash.defaults"),isArray:t("lodash.isArray"),parents:e,offset:g,remove:c,removeClass:a,getWindowSize:y,is:r,nextUntil:o,unwrap:i,wrapAll:u,hasClass:s,addClass:p,splitWords:f,trim:l,setClass:d,getClass:h,create:v};n.exports=b}()},{"is-dom":7,"lodash.debounce":17,"lodash.defaults":18,"lodash.filter":19,"lodash.forEach":20,"lodash.isArray":21}]},{},[25])(25)});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],10:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],11:[function(require,module,exports){
'use strict';
var objType = require('obj-type');

module.exports = function (el, str) {
	if (objType(el).indexOf('element') === -1) {
		throw new TypeError('Expected an HTML DOM element as first argument');
	}

	if (typeof str !== 'string') {
		throw new TypeError('Expected a string as second argument');
	}

	if (el.classList) {
		return el.classList.contains(str);
	}

	return new RegExp('(^| )' + str + '( |$)', 'gi').test(el.className);
};

},{"obj-type":26}],12:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],13:[function(require,module,exports){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    stringTag = '[object String]';

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetPrototype = Object.getPrototypeOf,
    nativeKeys = Object.keys;

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = createBaseEach(baseForOwn);

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

/**
 * The base implementation of `_.has` without support for deep paths.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHas(object, key) {
  // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
  // that are composed entirely of index properties, return `false` for
  // `hasOwnProperty` checks of them.
  return hasOwnProperty.call(object, key) ||
    (typeof object == 'object' && key in object && getPrototype(object) === null);
}

/**
 * The base implementation of `_.keys` which doesn't skip the constructor
 * property of prototypes or treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  return nativeKeys(Object(object));
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a
 * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
 * Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Gets the `[[Prototype]]` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {null|Object} Returns the `[[Prototype]]`.
 */
function getPrototype(value) {
  return nativeGetPrototype(Object(value));
}

/**
 * Creates an array of index keys for `object` values of arrays,
 * `arguments` objects, and strings, otherwise `null` is returned.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array|null} Returns index keys, else `null`.
 */
function indexKeys(object) {
  var length = object ? object.length : undefined;
  if (isLength(length) &&
      (isArray(object) || isString(object) || isArguments(object))) {
    return baseTimes(length, String);
  }
  return null;
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @type {Function}
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value)) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length,
 *  else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  var isProto = isPrototype(object);
  if (!(isProto || isArrayLike(object))) {
    return baseKeys(object);
  }
  var indexes = indexKeys(object),
      skipIndexes = !!indexes,
      result = indexes || [],
      length = result.length;

  for (var key in object) {
    if (baseHas(object, key) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length))) &&
        !(isProto && key == 'constructor')) {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseEach;

},{}],14:[function(require,module,exports){
/**
 * lodash 4.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseEach = require('lodash._baseeach');

/**
 * The base implementation of `_.filter` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function baseFilter(collection, predicate) {
  var result = [];
  baseEach(collection, function(value, index, collection) {
    if (predicate(value, index, collection)) {
      result.push(value);
    }
  });
  return result;
}

module.exports = baseFilter;

},{"lodash._baseeach":13}],15:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var stringToPath = require('lodash._stringtopath');

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to compose bitmasks for comparison styles. */
var UNORDERED_COMPARE_FLAG = 1,
    PARTIAL_COMPARE_FLAG = 2;

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Used to determine if values are of the language type `Object`. */
var objectTypes = {
  'function': true,
  'object': true
};

/** Detect free variable `exports`. */
var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
  ? exports
  : undefined;

/** Detect free variable `module`. */
var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
  ? module
  : undefined;

/** Detect free variable `global` from Node.js. */
var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

/** Detect free variable `self`. */
var freeSelf = checkGlobal(objectTypes[typeof self] && self);

/** Detect free variable `window`. */
var freeWindow = checkGlobal(objectTypes[typeof window] && window);

/** Detect `this` as the global object. */
var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

/**
 * Used as a reference to the global object.
 *
 * The `this` value is used if it's the global object to avoid Greasemonkey's
 * restricted `window` object, otherwise the `window` object is used.
 */
var root = freeGlobal ||
  ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
    freeSelf || thisGlobal || Function('return this')();

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.toPairs` and `_.toPairsIn` which creates an array
 * of key-value pairs for `object` corresponding to the property names of `props`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the key-value pairs.
 */
function baseToPairs(object, props) {
  return arrayMap(props, function(key) {
    return [key, object[key]];
  });
}

/**
 * Checks if `value` is a global object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
 */
function checkGlobal(value) {
  return (value && value.Object === Object) ? value : null;
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/**
 * Converts `set` to its value-value pairs.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the value-value pairs.
 */
function setToPairs(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = [value, value];
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetPrototype = Object.getPrototypeOf,
    nativeKeys = Object.keys;

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values ? values.length : 0;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache && cache.__data__.length == LARGE_ARRAY_SIZE) {
    cache = this.__data__ = new MapCache(cache.__data__);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = isKey(path, object) ? [path] : castPath(path);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

/**
 * The base implementation of `_.has` without support for deep paths.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHas(object, key) {
  // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
  // that are composed entirely of index properties, return `false` for
  // `hasOwnProperty` checks of them.
  return hasOwnProperty.call(object, key) ||
    (typeof object == 'object' && key in object && getPrototype(object) === null);
}

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return key in Object(object);
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {boolean} [bitmask] The bitmask of comparison flags.
 *  The bitmask may be composed of the following flags:
 *     1 - Unordered comparison
 *     2 - Partial comparison
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, customizer, bitmask, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = arrayTag,
      othTag = arrayTag;

  if (!objIsArr) {
    objTag = getTag(object);
    objTag = objTag == argsTag ? objectTag : objTag;
  }
  if (!othIsArr) {
    othTag = getTag(other);
    othTag = othTag == argsTag ? objectTag : othTag;
  }
  var objIsObj = objTag == objectTag && !isHostObject(object),
      othIsObj = othTag == objectTag && !isHostObject(other),
      isSameTag = objTag == othTag;

  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
      : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
  }
  if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
}

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == 'object') {
    return isArray(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

/**
 * The base implementation of `_.keys` which doesn't skip the constructor
 * property of prototypes or treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  return nativeKeys(Object(object));
}

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
  };
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value) {
  return isArray(value) ? value : stringToPath(value);
}

/**
 * Creates a `_.toPairs` or `_.toPairsIn` function.
 *
 * @private
 * @param {Function} keysFunc The function to get the keys of a given object.
 * @returns {Function} Returns the new pairs function.
 */
function createToPairs(keysFunc) {
  return function(object) {
    var tag = getTag(object);
    if (tag == mapTag) {
      return mapToArray(object);
    }
    if (tag == setTag) {
      return setToPairs(object);
    }
    return baseToPairs(object, keysFunc(object));
  };
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & UNORDERED_COMPARE_FLAG) ? new SetCache : undefined;

  stack.set(array, other);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!seen.has(othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
              return seen.add(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, customizer, bitmask, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
      // Coerce dates and booleans to numbers, dates to milliseconds and
      // booleans to `1` or `0` treating invalid dates coerced to `NaN` as
      // not equal.
      return +object == +other;

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case numberTag:
      // Treat `NaN` vs. `NaN` as equal.
      return (object != +object) ? other != +other : object == +other;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/6.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= UNORDERED_COMPARE_FLAG;
      stack.set(object, other);

      // Recursively compare objects (susceptible to call stack limits).
      return equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      objProps = keys(object),
      objLength = objProps.length,
      othProps = keys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : baseHas(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  return result;
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a
 * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
 * Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = toPairs(object),
      length = result.length;

  while (length--) {
    result[length][2] = isStrictComparable(result[length][1]);
  }
  return result;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Gets the `[[Prototype]]` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {null|Object} Returns the `[[Prototype]]`.
 */
function getPrototype(value) {
  return nativeGetPrototype(Object(value));
}

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function getTag(value) {
  return objectToString.call(value);
}

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = isKey(path, object) ? [path] : castPath(path);

  var result,
      index = -1,
      length = path.length;

  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result) {
    return result;
  }
  var length = object ? object.length : 0;
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray(object) || isString(object) || isArguments(object));
}

/**
 * Creates an array of index keys for `object` values of arrays,
 * `arguments` objects, and strings, otherwise `null` is returned.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array|null} Returns index keys, else `null`.
 */
function indexKeys(object) {
  var length = object ? object.length : undefined;
  if (isLength(length) &&
      (isArray(object) || isString(object) || isArguments(object))) {
    return baseTimes(length, String);
  }
  return null;
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'user': 'fred' };
 * var other = { 'user': 'fred' };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @type {Function}
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value)) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length,
 *  else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (!isObject(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
function isTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is used in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  var isProto = isPrototype(object);
  if (!(isProto || isArrayLike(object))) {
    return baseKeys(object);
  }
  var indexes = indexKeys(object),
      skipIndexes = !!indexes,
      result = indexes || [],
      length = result.length;

  for (var key in object) {
    if (baseHas(object, key) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length))) &&
        !(isProto && key == 'constructor')) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates an array of own enumerable string keyed-value pairs for `object`
 * which can be consumed by `_.fromPairs`. If `object` is a map or set, its
 * entries are returned.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @alias entries
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the key-value pairs.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.toPairs(new Foo);
 * // => [['a', 1], ['b', 2]] (iteration order is not guaranteed)
 */
var toPairs = createToPairs(keys);

/**
 * This method returns the first argument given to it.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

module.exports = baseIteratee;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"lodash._stringtopath":17}],16:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to determine if values are of the language type `Object`. */
var objectTypes = {
  'function': true,
  'object': true
};

/** Detect free variable `exports`. */
var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
  ? exports
  : undefined;

/** Detect free variable `module`. */
var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
  ? module
  : undefined;

/** Detect free variable `global` from Node.js. */
var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

/** Detect free variable `self`. */
var freeSelf = checkGlobal(objectTypes[typeof self] && self);

/** Detect free variable `window`. */
var freeWindow = checkGlobal(objectTypes[typeof window] && window);

/** Detect `this` as the global object. */
var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

/**
 * Used as a reference to the global object.
 *
 * The `this` value is used if it's the global object to avoid Greasemonkey's
 * restricted `window` object, otherwise the `window` object is used.
 */
var root = freeGlobal ||
  ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
    freeSelf || thisGlobal || Function('return this')();

/**
 * Checks if `value` is a global object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
 */
function checkGlobal(value) {
  return (value && value.Object === Object) ? value : null;
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var Symbol = root.Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

module.exports = baseToString;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],17:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var baseToString = require('lodash._basetostring');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]/g;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to determine if values are of the language type `Object`. */
var objectTypes = {
  'function': true,
  'object': true
};

/** Detect free variable `exports`. */
var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
  ? exports
  : undefined;

/** Detect free variable `module`. */
var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
  ? module
  : undefined;

/** Detect free variable `global` from Node.js. */
var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

/** Detect free variable `self`. */
var freeSelf = checkGlobal(objectTypes[typeof self] && self);

/** Detect free variable `window`. */
var freeWindow = checkGlobal(objectTypes[typeof window] && window);

/** Detect `this` as the global object. */
var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

/**
 * Used as a reference to the global object.
 *
 * The `this` value is used if it's the global object to avoid Greasemonkey's
 * restricted `window` object, otherwise the `window` object is used.
 */
var root = freeGlobal ||
  ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
    freeSelf || thisGlobal || Function('return this')();

/**
 * Checks if `value` is a global object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
 */
function checkGlobal(value) {
  return (value && value.Object === Object) ? value : null;
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var splice = arrayProto.splice;

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map'),
    nativeCreate = getNative(Object, 'create');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoize(function(string) {
  var result = [];
  toString(string).replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'user': 'fred' };
 * var other = { 'user': 'fred' };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (!isObject(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = stringToPath;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"lodash._basetostring":16}],18:[function(require,module,exports){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var keysIn = require('lodash.keysin'),
    rest = require('lodash.rest');

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : source[key];

    assignValue(object, key, newValue);
  }
  return object;
}

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return rest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a
 * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
 * Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'user': 'fred' };
 * var other = { 'user': 'fred' };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value)) && !isFunction(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length,
 *  else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * This method is like `_.assignIn` except that it accepts `customizer`
 * which is invoked to produce the assigned values. If `customizer` returns
 * `undefined`, assignment is handled by the method instead. The `customizer`
 * is invoked with five arguments: (objValue, srcValue, key, object, source).
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @alias extendWith
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} sources The source objects.
 * @param {Function} [customizer] The function to customize assigned values.
 * @returns {Object} Returns `object`.
 * @see _.assignWith
 * @example
 *
 * function customizer(objValue, srcValue) {
 *   return _.isUndefined(objValue) ? srcValue : objValue;
 * }
 *
 * var defaults = _.partialRight(_.assignInWith, customizer);
 *
 * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
 * // => { 'a': 1, 'b': 2 }
 */
var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
  copyObject(source, keysIn(source), object, customizer);
});

module.exports = assignInWith;

},{"lodash.keysin":23,"lodash.rest":25}],19:[function(require,module,exports){
/**
 * lodash 4.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var assignInWith = require('lodash.assigninwith'),
    rest = require('lodash.rest');

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {...*} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  var length = args.length;
  switch (length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used by `_.defaults` to customize its `_.assignIn` use.
 *
 * @private
 * @param {*} objValue The destination value.
 * @param {*} srcValue The source value.
 * @param {string} key The key of the property to assign.
 * @param {Object} object The parent object of `objValue`.
 * @returns {*} Returns the value to assign.
 */
function assignInDefaults(objValue, srcValue, key, object) {
  if (objValue === undefined ||
      (eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key))) {
    return srcValue;
  }
  return objValue;
}

/**
 * Performs a [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'user': 'fred' };
 * var other = { 'user': 'fred' };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Assigns own and inherited enumerable properties of source objects to the
 * destination object for all destination properties that resolve to `undefined`.
 * Source objects are applied from left to right. Once a property is set,
 * additional values of the same property are ignored.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
 * // => { 'user': 'barney', 'age': 36 }
 */
var defaults = rest(function(args) {
  args.push(undefined, assignInDefaults);
  return apply(assignInWith, undefined, args);
});

module.exports = defaults;

},{"lodash.assigninwith":18,"lodash.rest":25}],20:[function(require,module,exports){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var baseFilter = require('lodash._basefilter'),
    baseIteratee = require('lodash._baseiteratee');

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/**
 * Iterates over elements of `collection`, returning an array of all elements
 * `predicate` returns truthy for. The predicate is invoked with three
 * arguments: (value, index|key, collection).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Array|Function|Object|string} [predicate=_.identity]
 *  The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 * @see _.reject
 * @example
 *
 * var users = [
 *   { 'user': 'barney', 'age': 36, 'active': true },
 *   { 'user': 'fred',   'age': 40, 'active': false }
 * ];
 *
 * _.filter(users, function(o) { return !o.active; });
 * // => objects for ['fred']
 *
 * // The `_.matches` iteratee shorthand.
 * _.filter(users, { 'age': 36, 'active': true });
 * // => objects for ['barney']
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.filter(users, ['active', false]);
 * // => objects for ['fred']
 *
 * // The `_.property` iteratee shorthand.
 * _.filter(users, 'active');
 * // => objects for ['barney']
 */
function filter(collection, predicate) {
  var func = isArray(collection) ? arrayFilter : baseFilter;
  return func(collection, baseIteratee(predicate, 3));
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @type {Function}
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = filter;

},{"lodash._basefilter":14,"lodash._baseiteratee":15}],21:[function(require,module,exports){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var baseEach = require('lodash._baseeach'),
    baseIteratee = require('lodash._baseiteratee');

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Iterates over elements of `collection` and invokes `iteratee` for each element.
 * The iteratee is invoked with three arguments: (value, index|key, collection).
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length"
 * property are iterated like arrays. To avoid this behavior use `_.forIn`
 * or `_.forOwn` for object iteration.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @alias each
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 * @see _.forEachRight
 * @example
 *
 * _([1, 2]).forEach(function(value) {
 *   console.log(value);
 * });
 * // => Logs `1` then `2`.
 *
 * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forEach(collection, iteratee) {
  var func = isArray(collection) ? arrayEach : baseEach;
  return func(collection, baseIteratee(iteratee, 3));
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @type {Function}
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = forEach;

},{"lodash._baseeach":13,"lodash._baseiteratee":15}],22:[function(require,module,exports){
/**
 * lodash 4.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;

},{}],23:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    stringTag = '[object String]';

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to determine if values are of the language type `Object`. */
var objectTypes = {
  'function': true,
  'object': true
};

/** Detect free variable `exports`. */
var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
  ? exports
  : undefined;

/** Detect free variable `module`. */
var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
  ? module
  : undefined;

/** Detect free variable `global` from Node.js. */
var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

/** Detect free variable `self`. */
var freeSelf = checkGlobal(objectTypes[typeof self] && self);

/** Detect free variable `window`. */
var freeWindow = checkGlobal(objectTypes[typeof window] && window);

/** Detect `this` as the global object. */
var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

/**
 * Used as a reference to the global object.
 *
 * The `this` value is used if it's the global object to avoid Greasemonkey's
 * restricted `window` object, otherwise the `window` object is used.
 */
var root = freeGlobal ||
  ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
    freeSelf || thisGlobal || Function('return this')();

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Checks if `value` is a global object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
 */
function checkGlobal(value) {
  return (value && value.Object === Object) ? value : null;
}

/**
 * Converts `iterator` to an array.
 *
 * @private
 * @param {Object} iterator The iterator to convert.
 * @returns {Array} Returns the converted array.
 */
function iteratorToArray(iterator) {
  var data,
      result = [];

  while (!(data = iterator.next()).done) {
    result.push(data.value);
  }
  return result;
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var Reflect = root.Reflect,
    enumerate = Reflect ? Reflect.enumerate : undefined,
    propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * The base implementation of `_.keysIn` which doesn't skip the constructor
 * property of prototypes or treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  object = object == null ? object : Object(object);

  var result = [];
  for (var key in object) {
    result.push(key);
  }
  return result;
}

// Fallback for IE < 9 with es6-shim.
if (enumerate && !propertyIsEnumerable.call({ 'valueOf': 1 }, 'valueOf')) {
  baseKeysIn = function(object) {
    return iteratorToArray(enumerate(object));
  };
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a
 * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
 * Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Creates an array of index keys for `object` values of arrays,
 * `arguments` objects, and strings, otherwise `null` is returned.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array|null} Returns index keys, else `null`.
 */
function indexKeys(object) {
  var length = object ? object.length : undefined;
  if (isLength(length) &&
      (isArray(object) || isString(object) || isArguments(object))) {
    return baseTimes(length, String);
  }
  return null;
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @type {Function}
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value)) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length,
 *  else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
}

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  var index = -1,
      isProto = isPrototype(object),
      props = baseKeysIn(object),
      propsLength = props.length,
      indexes = indexKeys(object),
      skipIndexes = !!indexes,
      result = indexes || [],
      length = result.length;

  while (++index < propsLength) {
    var key = props[index];
    if (!(skipIndexes && (key == 'length' || isIndex(key, length))) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keysIn;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],24:[function(require,module,exports){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var baseEach = require('lodash._baseeach'),
    baseIteratee = require('lodash._baseiteratee');

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * The base implementation of `_.map` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function baseMap(collection, iteratee) {
  var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function(value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a
 * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
 * Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Creates an array of values by running each element in `collection` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, index|key, collection).
 *
 * Many lodash methods are guarded to work as iteratees for methods like
 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
 *
 * The guarded methods are:
 * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
 * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
 * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
 * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Array|Function|Object|string} [iteratee=_.identity]
 *  The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 * @example
 *
 * function square(n) {
 *   return n * n;
 * }
 *
 * _.map([4, 8], square);
 * // => [16, 64]
 *
 * _.map({ 'a': 4, 'b': 8 }, square);
 * // => [16, 64] (iteration order is not guaranteed)
 *
 * var users = [
 *   { 'user': 'barney' },
 *   { 'user': 'fred' }
 * ];
 *
 * // The `_.property` iteratee shorthand.
 * _.map(users, 'user');
 * // => ['barney', 'fred']
 */
function map(collection, iteratee) {
  var func = isArray(collection) ? arrayMap : baseMap;
  return func(collection, baseIteratee(iteratee, 3));
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @type {Function}
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value)) && !isFunction(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length,
 *  else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = map;

},{"lodash._baseeach":13,"lodash._baseiteratee":15}],25:[function(require,module,exports){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e+308,
    NAN = 0 / 0;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  var length = args.length;
  switch (length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a function that invokes `func` with the `this` binding of the
 * created function and arguments from `start` and beyond provided as
 * an array.
 *
 * **Note:** This method is based on the
 * [rest parameter](https://mdn.io/rest_parameters).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Function
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var say = _.rest(function(what, names) {
 *   return what + ' ' + _.initial(names).join(', ') +
 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
 * });
 *
 * say('hello', 'fred', 'barney', 'pebbles');
 * // => 'hello fred, barney, & pebbles'
 */
function rest(func, start) {
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  start = nativeMax(start === undefined ? (func.length - 1) : toInteger(start), 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    switch (start) {
      case 0: return func.call(this, array);
      case 1: return func.call(this, args[0], array);
      case 2: return func.call(this, args[0], args[1], array);
    }
    var otherArgs = Array(start + 1);
    index = -1;
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

/**
 * Converts `value` to an integer.
 *
 * **Note:** This function is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger(value) {
  var result = toFinite(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = isFunction(value.valueOf) ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = rest;

},{}],26:[function(require,module,exports){
'use strict';
module.exports = function (obj) {
	return Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, '$1').toLowerCase();
};

},{}],27:[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('core-js/modules/es6.object.assign');

require('core-js/modules/es6.array.from');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Parallax = function () {
  function Parallax(selector, options) {
    _classCallCheck(this, Parallax);

    this.lastPosition = -1;

    // Establish default settings
    this.settings = Object.assign({
      speed: 0.2
    }, options);

    if (typeof selector === 'string') {
      this.elems = Array.from(document.querySelectorAll(selector));
    } else if (Array.isArray(selector)) {
      this.elems = selector;
    } else {
      this.elems = [selector];
    }
  }

  _createClass(Parallax, [{
    key: 'updatePosition',
    value: function updatePosition() {
      var _this = this;

      this.elems.forEach(function (elem) {
        var offset = elem.getBoundingClientRect().top + _this.lastPosition;
        var yPosition = Math.round((offset - _this.lastPosition) * _this.settings.speed);

        // Apply the y-axis transform
        elem.style.transform = 'translate3d(0, ' + yPosition * -1 + 'px, 0)'; // eslint-disable-line
      });
    }
  }, {
    key: 'animate',
    value: function animate() {
      var _this2 = this;

      // If the offset position hasn't changed, skip this frame
      if (this.lastPosition === window.pageYOffset) {
        window.requestAnimationFrame(function () {
          _this2.animate();
        });

        return false;
      }

      // Save the new offset position
      this.lastPosition = window.pageYOffset;

      this.updatePosition();

      return window.requestAnimationFrame(function () {
        _this2.animate();
      });
    }
  }]);

  return Parallax;
}();

exports.default = Parallax;
module.exports = exports['default'];

},{"core-js/modules/es6.array.from":58,"core-js/modules/es6.object.assign":59}],29:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],30:[function(require,module,exports){
var isObject = require('./$.is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./$.is-object":43}],31:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./$.cof')
  , TAG = require('./$.wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./$.cof":32,"./$.wks":56}],32:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],33:[function(require,module,exports){
var core = module.exports = {version: '1.2.6'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],34:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./$.a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./$.a-function":29}],35:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],36:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./$.fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./$.fails":38}],37:[function(require,module,exports){
var global    = require('./$.global')
  , core      = require('./$.core')
  , hide      = require('./$.hide')
  , redefine  = require('./$.redefine')
  , ctx       = require('./$.ctx')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE]
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE] || (exports[PROTOTYPE] = {})
    , key, own, out, exp;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && key in target;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if(target && !own)redefine(target, key, out);
    // export
    if(exports[key] != out)hide(exports, key, exp);
    if(IS_PROTO && expProto[key] != out)expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;  // forced
$export.G = 2;  // global
$export.S = 4;  // static
$export.P = 8;  // proto
$export.B = 16; // bind
$export.W = 32; // wrap
module.exports = $export;
},{"./$.core":33,"./$.ctx":34,"./$.global":39,"./$.hide":40,"./$.redefine":50}],38:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],39:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],40:[function(require,module,exports){
var $          = require('./$')
  , createDesc = require('./$.property-desc');
module.exports = require('./$.descriptors') ? function(object, key, value){
  return $.setDesc(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./$":47,"./$.descriptors":36,"./$.property-desc":49}],41:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./$.cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./$.cof":32}],42:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./$.iterators')
  , ITERATOR   = require('./$.wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./$.iterators":46,"./$.wks":56}],43:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],44:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./$.an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./$.an-object":30}],45:[function(require,module,exports){
var ITERATOR     = require('./$.wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":56}],46:[function(require,module,exports){
module.exports = {};
},{}],47:[function(require,module,exports){
var $Object = Object;
module.exports = {
  create:     $Object.create,
  getProto:   $Object.getPrototypeOf,
  isEnum:     {}.propertyIsEnumerable,
  getDesc:    $Object.getOwnPropertyDescriptor,
  setDesc:    $Object.defineProperty,
  setDescs:   $Object.defineProperties,
  getKeys:    $Object.keys,
  getNames:   $Object.getOwnPropertyNames,
  getSymbols: $Object.getOwnPropertySymbols,
  each:       [].forEach
};
},{}],48:[function(require,module,exports){
// 19.1.2.1 Object.assign(target, source, ...)
var $        = require('./$')
  , toObject = require('./$.to-object')
  , IObject  = require('./$.iobject');

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = require('./$.fails')(function(){
  var a = Object.assign
    , A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return a({}, A)[S] != 7 || Object.keys(a({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , $$    = arguments
    , $$len = $$.length
    , index = 1
    , getKeys    = $.getKeys
    , getSymbols = $.getSymbols
    , isEnum     = $.isEnum;
  while($$len > index){
    var S      = IObject($$[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  }
  return T;
} : Object.assign;
},{"./$":47,"./$.fails":38,"./$.iobject":41,"./$.to-object":54}],49:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],50:[function(require,module,exports){
// add fake Function#toString
// for correct work wrapped methods / constructors with methods like LoDash isNative
var global    = require('./$.global')
  , hide      = require('./$.hide')
  , SRC       = require('./$.uid')('src')
  , TO_STRING = 'toString'
  , $toString = Function[TO_STRING]
  , TPL       = ('' + $toString).split(TO_STRING);

require('./$.core').inspectSource = function(it){
  return $toString.call(it);
};

(module.exports = function(O, key, val, safe){
  if(typeof val == 'function'){
    val.hasOwnProperty(SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
    val.hasOwnProperty('name') || hide(val, 'name', key);
  }
  if(O === global){
    O[key] = val;
  } else {
    if(!safe)delete O[key];
    hide(O, key, val);
  }
})(Function.prototype, TO_STRING, function toString(){
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
},{"./$.core":33,"./$.global":39,"./$.hide":40,"./$.uid":55}],51:[function(require,module,exports){
var global = require('./$.global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./$.global":39}],52:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],53:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./$.to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./$.to-integer":52}],54:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./$.defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./$.defined":35}],55:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],56:[function(require,module,exports){
var store  = require('./$.shared')('wks')
  , uid    = require('./$.uid')
  , Symbol = require('./$.global').Symbol;
module.exports = function(name){
  return store[name] || (store[name] =
    Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
};
},{"./$.global":39,"./$.shared":51,"./$.uid":55}],57:[function(require,module,exports){
var classof   = require('./$.classof')
  , ITERATOR  = require('./$.wks')('iterator')
  , Iterators = require('./$.iterators');
module.exports = require('./$.core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./$.classof":31,"./$.core":33,"./$.iterators":46,"./$.wks":56}],58:[function(require,module,exports){
'use strict';
var ctx         = require('./$.ctx')
  , $export     = require('./$.export')
  , toObject    = require('./$.to-object')
  , call        = require('./$.iter-call')
  , isArrayIter = require('./$.is-array-iter')
  , toLength    = require('./$.to-length')
  , getIterFn   = require('./core.get-iterator-method');
$export($export.S + $export.F * !require('./$.iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , $$      = arguments
      , $$len   = $$.length
      , mapfn   = $$len > 1 ? $$[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, $$len > 2 ? $$[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        result[index] = mapping ? mapfn(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});

},{"./$.ctx":34,"./$.export":37,"./$.is-array-iter":42,"./$.iter-call":44,"./$.iter-detect":45,"./$.to-length":53,"./$.to-object":54,"./core.get-iterator-method":57}],59:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./$.export');

$export($export.S + $export.F, 'Object', {assign: require('./$.object-assign')});
},{"./$.export":37,"./$.object-assign":48}],60:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":5,"trim":62}],61:[function(require,module,exports){
'use strict';
var objType = require('obj-type');

function remove(el, str) {
	if (el.classList) {
		el.classList.remove(str);
		return;
	}

	el.className = el.className.split(' ').filter(function (x) {
		return x !== '' && x !== str.trim();
	}).join(' ');
}

module.exports = function (el, str) {
	if (objType(el).indexOf('element') === -1 && objType(el) !== 'nodelist') {
		throw new TypeError('Expected HTML DOM element(s) as first argument');
	}

	if (typeof str !== 'string') {
		throw new TypeError('Expected a string as second argument');
	}

	if (objType(el).indexOf('element') !== -1) {
		remove(el, str);
	}

	for (var i = 0; i < el.length; i++) {
		remove(el[i], str);
	}
};

},{"obj-type":26}],62:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],63:[function(require,module,exports){
"use strict";
var window = require("global/window")
var once = require("once")
var isFunction = require("is-function")
var parseHeaders = require("parse-headers")
var xtend = require("xtend")

module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
        options = initParams(uri, options, callback)
        options.method = method.toUpperCase()
        return _createXHR(options)
    }
})

function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
        iterator(array[i])
    }
}

function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function initParams(uri, options, callback) {
    var params = uri

    if (isFunction(options)) {
        callback = options
        if (typeof uri === "string") {
            params = {uri:uri}
        }
    } else {
        params = xtend(options, {uri: uri})
    }

    params.callback = callback
    return params
}

function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback)
    return _createXHR(options)
}

function _createXHR(options) {
    var callback = options.callback
    if(typeof callback === "undefined"){
        throw new Error("callback argument missing")
    }
    callback = once(callback)

    function readystatechange() {
        if (xhr.readyState === 4) {
            loadFunc()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === "text" || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    var failureResponse = {
                body: undefined,
                headers: {},
                statusCode: 0,
                method: method,
                url: uri,
                rawRequest: xhr
            }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        callback(err, response, response.body)

    }

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data || null
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer

    if ("json" in options) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            aborted=true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr


}

function noop() {}

},{"global/window":10,"is-function":12,"once":27,"parse-headers":60,"xtend":64}],64:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hZGQtY2xhc3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXJyYXktdW5pb24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXJyYXktdW5pcS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9mb3ItZWFjaC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9md3MtZ2xvc3NhcnkvZGlzdC9nbG9zc2FyeS5qcyIsIm5vZGVfbW9kdWxlcy9md3MtaGlnaGxpZ2h0ZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZndzLW5hdmlnYXRpb24vZGlzdC9tZW51LmpzIiwibm9kZV9tb2R1bGVzL2Z3cy1zY3JvbGxuYXYvZGlzdC9zY3JvbGwtbmF2LmpzIiwibm9kZV9tb2R1bGVzL2dsb2JhbC93aW5kb3cuanMiLCJub2RlX21vZHVsZXMvaGFzLWNsYXNzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWZ1bmN0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWVhY2gvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlZmlsdGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWl0ZXJhdGVlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZXRvc3RyaW5nL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5fc3RyaW5ndG9wYXRoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5hc3NpZ25pbndpdGgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmRlZmF1bHRzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5maWx0ZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmZvckVhY2gvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmlzQXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmtleXNpbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gubWFwL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5yZXN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iai10eXBlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29uY2Uvb25jZS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxheC1zY3JvbGwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcGFyYWxsYXgtc2Nyb2xsL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hLWZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGF4LXNjcm9sbC9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYW4tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGF4LXNjcm9sbC9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY2xhc3NvZi5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxheC1zY3JvbGwvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvZi5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxheC1zY3JvbGwvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvcmUuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsYXgtc2Nyb2xsL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jdHguanMiLCJub2RlX21vZHVsZXMvcGFyYWxsYXgtc2Nyb2xsL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5kZWZpbmVkLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGF4LXNjcm9sbC9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZGVzY3JpcHRvcnMuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsYXgtc2Nyb2xsL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5leHBvcnQuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsYXgtc2Nyb2xsL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5mYWlscy5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxheC1zY3JvbGwvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmdsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxheC1zY3JvbGwvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmhpZGUuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsYXgtc2Nyb2xsL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGF4LXNjcm9sbC9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaXMtYXJyYXktaXRlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxheC1zY3JvbGwvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmlzLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxheC1zY3JvbGwvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXItY2FsbC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxheC1zY3JvbGwvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXItZGV0ZWN0LmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGF4LXNjcm9sbC9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaXRlcmF0b3JzLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGF4LXNjcm9sbC9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsYXgtc2Nyb2xsL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5vYmplY3QtYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGF4LXNjcm9sbC9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQucHJvcGVydHktZGVzYy5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxheC1zY3JvbGwvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnJlZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGF4LXNjcm9sbC9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuc2hhcmVkLmpzIiwibm9kZV9tb2R1bGVzL3BhcmFsbGF4LXNjcm9sbC9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudG8taW50ZWdlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxheC1zY3JvbGwvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnRvLWxlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxheC1zY3JvbGwvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnRvLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxheC1zY3JvbGwvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnVpZC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxheC1zY3JvbGwvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLndrcy5qcyIsIm5vZGVfbW9kdWxlcy9wYXJhbGxheC1zY3JvbGwvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QuanMiLCJub2RlX21vZHVsZXMvcGFyYWxsYXgtc2Nyb2xsL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZyb20uanMiLCJub2RlX21vZHVsZXMvcGFyYWxsYXgtc2Nyb2xsL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm9iamVjdC5hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9wYXJzZS1oZWFkZXJzLmpzIiwibm9kZV9tb2R1bGVzL3JlbW92ZS1jbGFzcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3hoci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy94dGVuZC9pbW11dGFibGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM5Q0E7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDaEdBOzs7OztBQ0FBO0FBQ0E7QUFDQTs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDaG5FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN6SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3R1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgeGhyID0gcmVxdWlyZSgneGhyJyk7XG4gIHZhciBoYXNDbGFzcyA9IHJlcXVpcmUoJ2hhcy1jbGFzcycpO1xuICB2YXIgYWRkQ2xhc3MgPSByZXF1aXJlKCdhZGQtY2xhc3MnKTtcbiAgdmFyIHJlbW92ZUNsYXNzID0gcmVxdWlyZSgncmVtb3ZlLWNsYXNzJyk7XG4gIHZhciBQYXJhbGxheCA9IHJlcXVpcmUoJ3BhcmFsbGF4LXNjcm9sbCcpO1xuXG4gIHZhciBtZW51ID0gcmVxdWlyZSgnZndzLW5hdmlnYXRpb24nKTtcbiAgdmFyIG5hdiA9IHJlcXVpcmUoJ2Z3cy1zY3JvbGxuYXYnKTtcbiAgdmFyIGdsb3NzYXJ5ID0gcmVxdWlyZSgnZndzLWdsb3NzYXJ5Jyk7XG4gIHZhciBoaWdobGlnaHRlciA9IHJlcXVpcmUoJ2Z3cy1oaWdobGlnaHRlcicpO1xuXG4gIHZhciBiYXNlVXJsID0gZG9jdW1lbnQuYm9keS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcm9vdCcpO1xuXG5cbiAgdmFyIHBhcmFsbGF4ID0gbmV3IFBhcmFsbGF4KCcucGFyYWxsYXgnLCB7XG4gICAgc3BlZWQ6IDAuNVxuICB9KTtcbiAgcGFyYWxsYXguYW5pbWF0ZSgpO1xuXG4gIHZhciB0ZXJtcztcblxuICB2YXIgbHVuckluZGV4ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZmllbGQoJ25hbWUnLCB7IGJvb3N0OiAxMCB9KTtcbiAgICB0aGlzLmZpZWxkKCdkZXNjcmlwdGlvbicpO1xuICAgIHRoaXMuZmllbGQoJ3JlbGF0ZWQnLCB7IGJvb3N0OiA1IH0pO1xuICAgIHRoaXMuZmllbGQoJ2Fjcm9ueW0nLCB7IGJvb3N0OiAzIH0pO1xuICAgIHRoaXMucmVmKCdpZCcpO1xuICB9O1xuXG4gIHhoci5nZXQoYmFzZVVybCArICdkYXRhL3Rlcm1zLmpzJywgZnVuY3Rpb24gKGVyciwgcmVzLCBib2R5KSB7XG4gICAgdGVybXMgPSBKU09OLnBhcnNlKGJvZHkpO1xuXG4gICAgbmF2LmluaXQoe1xuICAgICAgY29udGVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbnQnKSxcbiAgICAgIGluc2VydFRhcmdldDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpZGUtbmF2JyksXG4gICAgICBzaG93SGVhZGxpbmU6IGZhbHNlLFxuICAgICAgc2Nyb2xsT2Zmc2V0OiA1NVxuICAgIH0pO1xuXG4gICAgaGlnaGxpZ2h0ZXIuaW5pdCh7XG4gICAgICB3b3JkczogdGVybXMubWFwKGZ1bmN0aW9uICh0ZXJtKSB7XG4gICAgICAgIHJldHVybiB0ZXJtLm5hbWU7XG4gICAgICB9KSxcbiAgICAgIHdvcmRzT25seTogdHJ1ZSxcbiAgICAgIGNvbnRlbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZW50JylcbiAgICB9KTtcblxuICAgIG1lbnUuaW5pdCh7XG4gICAgICB0b2dnbGVDbGFzczogJ2Z3cy1tZW51LXRyaWdnZXInLFxuICAgICAgcG9zaXRpb246ICdsZWZ0J1xuICAgIH0pO1xuXG4gICAgZ2xvc3NhcnkuaW5pdCh7XG4gICAgICB0ZXJtczogdGVybXMsXG4gICAgICBsdW5ySW5kZXg6IGx1bnJJbmRleCxcbiAgICAgIHRvZ2dsZUNsYXNzOiAnaGlnaGxpZ2h0JyxcbiAgICAgIHBvc2l0aW9uOiAnbGVmdCdcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5nbG9zc2FyeS10cmlnZ2VyJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBnbG9zc2FyeS50b2dnbGUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5md3MtbWVudS10cmlnZ2VyJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBtZW51LnNob3cpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2gtdHJpZ2dlcicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbWVudS50b2dnbGVTZWFyY2gpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b2dnbGUtY29udGFjdCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgdG9nZ2xlQWN0aXZlQ2xhc3MoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRhY3QtZHJhd2VyJykpO1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvZ2dsZS1zaGFyZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgdG9nZ2xlQWN0aXZlQ2xhc3MoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNoYXJlLWRyYXdlcicpKTtcbiAgICB9KTtcblxuICAgIHZhciBkcmF3ZXJUb2dnbGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNsb3NlLWRyYXdlcicpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcmF3ZXJUb2dnbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBkcmF3ZXJUb2dnbGVzW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcmVtb3ZlQWN0aXZlQ2xhc3NGcm9tRHJhd2VyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVBY3RpdmVDbGFzc0Zyb21EcmF3ZXIgKGUpIHtcbiAgICAgIHZhciBwYXJlbnQgPSBlLnRhcmdldC5wYXJlbnROb2RlO1xuICAgICAgaWYgKHBhcmVudCkgcmVtb3ZlQ2xhc3MocGFyZW50LCAnYWN0aXZlJyk7XG4gICAgfVxuXG4gICAgdmFyIHNjcm9sbE5hdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY3JvbGwtbmF2Jyk7XG4gICAgc2Nyb2xsTmF2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlU2Nyb2xsTmF2KTtcblxuICAgIGZ1bmN0aW9uIHRvZ2dsZVNjcm9sbE5hdigpIHtcbiAgICAgIGlmICggaGFzQ2xhc3Moc2Nyb2xsTmF2LCAnb3BlbicpICkgcmVtb3ZlQ2xhc3Moc2Nyb2xsTmF2LCAnb3BlbicpO1xuICAgICAgZWxzZSBhZGRDbGFzcyhzY3JvbGxOYXYsICdvcGVuJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9nZ2xlQWN0aXZlQ2xhc3MoZWwsIHRoZUNsYXNzKSB7XG4gICAgICB2YXIgYWN0aXZlQ2xhc3MgPSB0aGVDbGFzcyB8fCAnYWN0aXZlJztcbiAgICAgIGlmICggaGFzQ2xhc3MoZWwsIGFjdGl2ZUNsYXNzKSApIHJlbW92ZUNsYXNzKGVsLCBhY3RpdmVDbGFzcyk7XG4gICAgICBlbHNlIGFkZENsYXNzKGVsLCBhY3RpdmVDbGFzcyk7XG4gICAgfVxuICB9KTtcblxufSkoKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBvYmpUeXBlID0gcmVxdWlyZSgnb2JqLXR5cGUnKTtcbnZhciBhcnJheVVuaW9uID0gcmVxdWlyZSgnYXJyYXktdW5pb24nKTtcblxuZnVuY3Rpb24gYWRkKGVsLCBzdHIpIHtcblx0aWYgKGVsLmNsYXNzTGlzdCkge1xuXHRcdGVsLmNsYXNzTGlzdC5hZGQoc3RyKTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHR2YXIgY24gPSBlbC5jbGFzc05hbWUuc3BsaXQoJyAnKS5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcblx0XHRyZXR1cm4geCAhPT0gJyc7XG5cdH0pO1xuXG5cdGVsLmNsYXNzTmFtZSA9IGFycmF5VW5pb24oY24sIHN0ci50cmltKCkpLmpvaW4oJyAnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZWwsIHN0cikge1xuXHRpZiAob2JqVHlwZShlbCkuaW5kZXhPZignZWxlbWVudCcpID09PSAtMSAmJiBvYmpUeXBlKGVsKSAhPT0gJ25vZGVsaXN0Jykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIEhUTUwgRE9NIGVsZW1lbnQocykgYXMgZmlyc3QgYXJndW1lbnQnKTtcblx0fVxuXG5cdGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgc3RyaW5nIGFzIHNlY29uZCBhcmd1bWVudCcpO1xuXHR9XG5cblx0aWYgKG9ialR5cGUoZWwpLmluZGV4T2YoJ2VsZW1lbnQnKSAhPT0gLTEpIHtcblx0XHRhZGQoZWwsIHN0cik7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbC5sZW5ndGg7IGkrKykge1xuXHRcdGFkZChlbFtpXSwgc3RyKTtcblx0fVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhcnJheVVuaXEgPSByZXF1aXJlKCdhcnJheS11bmlxJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gYXJyYXlVbmlxKFtdLmNvbmNhdC5hcHBseShbXSwgYXJndW1lbnRzKSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyB0aGVyZSdzIDMgaW1wbGVtZW50YXRpb25zIHdyaXR0ZW4gaW4gaW5jcmVhc2luZyBvcmRlciBvZiBlZmZpY2llbmN5XG5cbi8vIDEgLSBubyBTZXQgdHlwZSBpcyBkZWZpbmVkXG5mdW5jdGlvbiB1bmlxTm9TZXQoYXJyKSB7XG5cdHZhciByZXQgPSBbXTtcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuXHRcdGlmIChyZXQuaW5kZXhPZihhcnJbaV0pID09PSAtMSkge1xuXHRcdFx0cmV0LnB1c2goYXJyW2ldKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gcmV0O1xufVxuXG4vLyAyIC0gYSBzaW1wbGUgU2V0IHR5cGUgaXMgZGVmaW5lZFxuZnVuY3Rpb24gdW5pcVNldChhcnIpIHtcblx0dmFyIHNlZW4gPSBuZXcgU2V0KCk7XG5cdHJldHVybiBhcnIuZmlsdGVyKGZ1bmN0aW9uIChlbCkge1xuXHRcdGlmICghc2Vlbi5oYXMoZWwpKSB7XG5cdFx0XHRzZWVuLmFkZChlbCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0pO1xufVxuXG4vLyAzIC0gYSBzdGFuZGFyZCBTZXQgdHlwZSBpcyBkZWZpbmVkIGFuZCBpdCBoYXMgYSBmb3JFYWNoIG1ldGhvZFxuZnVuY3Rpb24gdW5pcVNldFdpdGhGb3JFYWNoKGFycikge1xuXHR2YXIgcmV0ID0gW107XG5cblx0KG5ldyBTZXQoYXJyKSkuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcblx0XHRyZXQucHVzaChlbCk7XG5cdH0pO1xuXG5cdHJldHVybiByZXQ7XG59XG5cbi8vIFY4IGN1cnJlbnRseSBoYXMgYSBicm9rZW4gaW1wbGVtZW50YXRpb25cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvODQ0OVxuZnVuY3Rpb24gZG9lc0ZvckVhY2hBY3R1YWxseVdvcmsoKSB7XG5cdHZhciByZXQgPSBmYWxzZTtcblxuXHQobmV3IFNldChbdHJ1ZV0pKS5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuXHRcdHJldCA9IGVsO1xuXHR9KTtcblxuXHRyZXR1cm4gcmV0ID09PSB0cnVlO1xufVxuXG5pZiAoJ1NldCcgaW4gZ2xvYmFsKSB7XG5cdGlmICh0eXBlb2YgU2V0LnByb3RvdHlwZS5mb3JFYWNoID09PSAnZnVuY3Rpb24nICYmIGRvZXNGb3JFYWNoQWN0dWFsbHlXb3JrKCkpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IHVuaXFTZXRXaXRoRm9yRWFjaDtcblx0fSBlbHNlIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IHVuaXFTZXQ7XG5cdH1cbn0gZWxzZSB7XG5cdG1vZHVsZS5leHBvcnRzID0gdW5pcU5vU2V0O1xufVxuIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCdpcy1mdW5jdGlvbicpXG5cbm1vZHVsZS5leHBvcnRzID0gZm9yRWFjaFxuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG5cbmZ1bmN0aW9uIGZvckVhY2gobGlzdCwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoIWlzRnVuY3Rpb24oaXRlcmF0b3IpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2l0ZXJhdG9yIG11c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgfVxuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgICAgIGNvbnRleHQgPSB0aGlzXG4gICAgfVxuICAgIFxuICAgIGlmICh0b1N0cmluZy5jYWxsKGxpc3QpID09PSAnW29iamVjdCBBcnJheV0nKVxuICAgICAgICBmb3JFYWNoQXJyYXkobGlzdCwgaXRlcmF0b3IsIGNvbnRleHQpXG4gICAgZWxzZSBpZiAodHlwZW9mIGxpc3QgPT09ICdzdHJpbmcnKVxuICAgICAgICBmb3JFYWNoU3RyaW5nKGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KVxuICAgIGVsc2VcbiAgICAgICAgZm9yRWFjaE9iamVjdChsaXN0LCBpdGVyYXRvciwgY29udGV4dClcbn1cblxuZnVuY3Rpb24gZm9yRWFjaEFycmF5KGFycmF5LCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChhcnJheSwgaSkpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KVxuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmb3JFYWNoU3RyaW5nKHN0cmluZywgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc3RyaW5nLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIC8vIG5vIHN1Y2ggdGhpbmcgYXMgYSBzcGFyc2Ugc3RyaW5nLlxuICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHN0cmluZy5jaGFyQXQoaSksIGksIHN0cmluZylcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGZvckVhY2hPYmplY3Qob2JqZWN0LCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGZvciAodmFyIGsgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgaykpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqZWN0W2tdLCBrLCBvYmplY3QpXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIhZnVuY3Rpb24odCl7aWYoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGUpbW9kdWxlLmV4cG9ydHM9dCgpO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShbXSx0KTtlbHNle3ZhciBlO2U9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGY/c2VsZjp0aGlzLGUuR2xvc3Nhcnk9dCgpfX0oZnVuY3Rpb24oKXt2YXIgdDtyZXR1cm4gZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gaShzLGEpe2lmKCFuW3NdKXtpZighdFtzXSl7dmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighYSYmdSlyZXR1cm4gdShzLCEwKTtpZihvKXJldHVybiBvKHMsITApO3ZhciBsPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrcytcIidcIik7dGhyb3cgbC5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGx9dmFyIGM9bltzXT17ZXhwb3J0czp7fX07dFtzXVswXS5jYWxsKGMuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W3NdWzFdW2VdO3JldHVybiBpKG4/bjplKX0sYyxjLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bc10uZXhwb3J0c31mb3IodmFyIG89XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxzPTA7czxyLmxlbmd0aDtzKyspaShyW3NdKTtyZXR1cm4gaX0oezE6W2Z1bmN0aW9uKCl7fSx7fV0sMjpbZnVuY3Rpb24odCxlKXtlLmV4cG9ydHM9ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwib2JqZWN0XCI9PXR5cGVvZiB0P3dpbmRvdyYmXCJvYmplY3RcIj09dHlwZW9mIHdpbmRvdy5Ob2RlP3QgaW5zdGFuY2VvZiB3aW5kb3cuTm9kZTpcIm51bWJlclwiPT10eXBlb2YgdC5ub2RlVHlwZSYmXCJzdHJpbmdcIj09dHlwZW9mIHQubm9kZU5hbWU6ITF9fSx7fV0sMzpbZnVuY3Rpb24oZSxuLHIpeyhmdW5jdGlvbihpKXshZnVuY3Rpb24oZSl7aWYoXCJvYmplY3RcIj09dHlwZW9mIHImJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBuKW4uZXhwb3J0cz1lKCk7ZWxzZSBpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiZ0LmFtZCl0KFtdLGUpO2Vsc2V7dmFyIG87bz1cInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3dpbmRvdzpcInVuZGVmaW5lZFwiIT10eXBlb2YgaT9pOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmP3NlbGY6dGhpcyxvLmphZGU9ZSgpfX0oZnVuY3Rpb24oKXtyZXR1cm4gZnVuY3Rpb24gdChuLHIsaSl7ZnVuY3Rpb24gbyhhLHUpe2lmKCFyW2FdKXtpZighblthXSl7dmFyIGw9XCJmdW5jdGlvblwiPT10eXBlb2YgZSYmZTtpZighdSYmbClyZXR1cm4gbChhLCEwKTtpZihzKXJldHVybiBzKGEsITApO3ZhciBjPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrYStcIidcIik7dGhyb3cgYy5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGN9dmFyIGY9clthXT17ZXhwb3J0czp7fX07blthXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbih0KXt2YXIgZT1uW2FdWzFdW3RdO3JldHVybiBvKGU/ZTp0KX0sZixmLmV4cG9ydHMsdCxuLHIsaSl9cmV0dXJuIHJbYV0uZXhwb3J0c31mb3IodmFyIHM9XCJmdW5jdGlvblwiPT10eXBlb2YgZSYmZSxhPTA7YTxpLmxlbmd0aDthKyspbyhpW2FdKTtyZXR1cm4gb30oezE6W2Z1bmN0aW9uKHQsZSxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKHQpe3JldHVybiBudWxsIT10JiZcIlwiIT09dH1mdW5jdGlvbiBpKHQpe3JldHVybihBcnJheS5pc0FycmF5KHQpP3QubWFwKGkpOnQmJlwib2JqZWN0XCI9PXR5cGVvZiB0P09iamVjdC5rZXlzKHQpLmZpbHRlcihmdW5jdGlvbihlKXtyZXR1cm4gdFtlXX0pOlt0XSkuZmlsdGVyKHIpLmpvaW4oXCIgXCIpfWZ1bmN0aW9uIG8odCl7cmV0dXJuIGFbdF18fHR9ZnVuY3Rpb24gcyh0KXt2YXIgZT1TdHJpbmcodCkucmVwbGFjZSh1LG8pO3JldHVybiBlPT09XCJcIit0P3Q6ZX1uLm1lcmdlPWZ1bmN0aW9uIGwodCxlKXtpZigxPT09YXJndW1lbnRzLmxlbmd0aCl7Zm9yKHZhciBuPXRbMF0saT0xO2k8dC5sZW5ndGg7aSsrKW49bChuLHRbaV0pO3JldHVybiBufXZhciBvPXRbXCJjbGFzc1wiXSxzPWVbXCJjbGFzc1wiXTsob3x8cykmJihvPW98fFtdLHM9c3x8W10sQXJyYXkuaXNBcnJheShvKXx8KG89W29dKSxBcnJheS5pc0FycmF5KHMpfHwocz1bc10pLHRbXCJjbGFzc1wiXT1vLmNvbmNhdChzKS5maWx0ZXIocikpO2Zvcih2YXIgYSBpbiBlKVwiY2xhc3NcIiE9YSYmKHRbYV09ZVthXSk7cmV0dXJuIHR9LG4uam9pbkNsYXNzZXM9aSxuLmNscz1mdW5jdGlvbih0LGUpe2Zvcih2YXIgcj1bXSxvPTA7bzx0Lmxlbmd0aDtvKyspci5wdXNoKGUmJmVbb10/bi5lc2NhcGUoaShbdFtvXV0pKTppKHRbb10pKTt2YXIgcz1pKHIpO3JldHVybiBzLmxlbmd0aD8nIGNsYXNzPVwiJytzKydcIic6XCJcIn0sbi5zdHlsZT1mdW5jdGlvbih0KXtyZXR1cm4gdCYmXCJvYmplY3RcIj09dHlwZW9mIHQ/T2JqZWN0LmtleXModCkubWFwKGZ1bmN0aW9uKGUpe3JldHVybiBlK1wiOlwiK3RbZV19KS5qb2luKFwiO1wiKTp0fSxuLmF0dHI9ZnVuY3Rpb24odCxlLHIsaSl7cmV0dXJuXCJzdHlsZVwiPT09dCYmKGU9bi5zdHlsZShlKSksXCJib29sZWFuXCI9PXR5cGVvZiBlfHxudWxsPT1lP2U/XCIgXCIrKGk/dDp0Kyc9XCInK3QrJ1wiJyk6XCJcIjowPT10LmluZGV4T2YoXCJkYXRhXCIpJiZcInN0cmluZ1wiIT10eXBlb2YgZT8oLTEhPT1KU09OLnN0cmluZ2lmeShlKS5pbmRleE9mKFwiJlwiKSYmY29uc29sZS53YXJuKFwiU2luY2UgSmFkZSAyLjAuMCwgYW1wZXJzYW5kcyAoYCZgKSBpbiBkYXRhIGF0dHJpYnV0ZXMgd2lsbCBiZSBlc2NhcGVkIHRvIGAmYW1wO2BcIiksZSYmXCJmdW5jdGlvblwiPT10eXBlb2YgZS50b0lTT1N0cmluZyYmY29uc29sZS53YXJuKFwiSmFkZSB3aWxsIGVsaW1pbmF0ZSB0aGUgZG91YmxlIHF1b3RlcyBhcm91bmQgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjBcIiksXCIgXCIrdCtcIj0nXCIrSlNPTi5zdHJpbmdpZnkoZSkucmVwbGFjZSgvJy9nLFwiJmFwb3M7XCIpK1wiJ1wiKTpyPyhlJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBlLnRvSVNPU3RyaW5nJiZjb25zb2xlLndhcm4oXCJKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wXCIpLFwiIFwiK3QrJz1cIicrbi5lc2NhcGUoZSkrJ1wiJyk6KGUmJlwiZnVuY3Rpb25cIj09dHlwZW9mIGUudG9JU09TdHJpbmcmJmNvbnNvbGUud2FybihcIkphZGUgd2lsbCBzdHJpbmdpZnkgZGF0ZXMgaW4gSVNPIGZvcm0gYWZ0ZXIgMi4wLjBcIiksXCIgXCIrdCsnPVwiJytlKydcIicpfSxuLmF0dHJzPWZ1bmN0aW9uKHQsZSl7dmFyIHI9W10sbz1PYmplY3Qua2V5cyh0KTtpZihvLmxlbmd0aClmb3IodmFyIHM9MDtzPG8ubGVuZ3RoOysrcyl7dmFyIGE9b1tzXSx1PXRbYV07XCJjbGFzc1wiPT1hPyh1PWkodSkpJiZyLnB1c2goXCIgXCIrYSsnPVwiJyt1KydcIicpOnIucHVzaChuLmF0dHIoYSx1LCExLGUpKX1yZXR1cm4gci5qb2luKFwiXCIpfTt2YXIgYT17XCImXCI6XCImYW1wO1wiLFwiPFwiOlwiJmx0O1wiLFwiPlwiOlwiJmd0O1wiLCdcIic6XCImcXVvdDtcIn0sdT0vWyY8PlwiXS9nO24uZXNjYXBlPXMsbi5yZXRocm93PWZ1bmN0aW9uIGMoZSxuLHIsaSl7aWYoIShlIGluc3RhbmNlb2YgRXJyb3IpKXRocm93IGU7aWYoIShcInVuZGVmaW5lZFwiPT10eXBlb2Ygd2luZG93JiZufHxpKSl0aHJvdyBlLm1lc3NhZ2UrPVwiIG9uIGxpbmUgXCIrcixlO3RyeXtpPWl8fHQoXCJmc1wiKS5yZWFkRmlsZVN5bmMobixcInV0ZjhcIil9Y2F0Y2gobyl7YyhlLG51bGwscil9dmFyIHM9MyxhPWkuc3BsaXQoXCJcXG5cIiksdT1NYXRoLm1heChyLXMsMCksbD1NYXRoLm1pbihhLmxlbmd0aCxyK3MpLHM9YS5zbGljZSh1LGwpLm1hcChmdW5jdGlvbih0LGUpe3ZhciBuPWUrdSsxO3JldHVybihuPT1yP1wiICA+IFwiOlwiICAgIFwiKStuK1wifCBcIit0fSkuam9pbihcIlxcblwiKTt0aHJvdyBlLnBhdGg9bixlLm1lc3NhZ2U9KG58fFwiSmFkZVwiKStcIjpcIityK1wiXFxuXCIrcytcIlxcblxcblwiK2UubWVzc2FnZSxlfSxuLkRlYnVnSXRlbT1mdW5jdGlvbih0LGUpe3RoaXMubGluZW5vPXQsdGhpcy5maWxlbmFtZT1lfX0se2ZzOjJ9XSwyOltmdW5jdGlvbigpe30se31dfSx7fSxbMV0pKDEpfSl9KS5jYWxsKHRoaXMsXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGY/c2VsZjpcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3dpbmRvdzp7fSl9LHtmczoxfV0sNDpbZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBuKHQsZSl7cmV0dXJuIHQ9XCJudW1iZXJcIj09dHlwZW9mIHR8fGcudGVzdCh0KT8rdDotMSxlPW51bGw9PWU/djplLHQ+LTEmJnQlMT09MCYmZT50fWZ1bmN0aW9uIHIodCxlLG4pe3ZhciByPXRbZV07KCF1KHIsbil8fHUocix3W2VdKSYmIVMuY2FsbCh0LGUpfHx2b2lkIDA9PT1uJiYhKGUgaW4gdCkpJiYodFtlXT1uKX1mdW5jdGlvbiBpKHQpe3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gbnVsbD09ZT92b2lkIDA6ZVt0XX19ZnVuY3Rpb24gbyh0LGUsbixpKXtufHwobj17fSk7Zm9yKHZhciBvPS0xLHM9ZS5sZW5ndGg7KytvPHM7KXt2YXIgYT1lW29dLHU9aT9pKG5bYV0sdFthXSxhLG4sdCk6dFthXTtyKG4sYSx1KX1yZXR1cm4gbn1mdW5jdGlvbiBzKHQpe3JldHVybiBwKGZ1bmN0aW9uKGUsbil7dmFyIHI9LTEsaT1uLmxlbmd0aCxvPWk+MT9uW2ktMV06dm9pZCAwLHM9aT4yP25bMl06dm9pZCAwO2ZvcihvPVwiZnVuY3Rpb25cIj09dHlwZW9mIG8/KGktLSxvKTp2b2lkIDAscyYmYShuWzBdLG5bMV0scykmJihvPTM+aT92b2lkIDA6byxpPTEpLGU9T2JqZWN0KGUpOysrcjxpOyl7dmFyIHU9bltyXTt1JiZ0KGUsdSxyLG8pfXJldHVybiBlfSl9ZnVuY3Rpb24gYSh0LGUscil7aWYoIWgocikpcmV0dXJuITE7dmFyIGk9dHlwZW9mIGU7cmV0dXJuKFwibnVtYmVyXCI9PWk/bChyKSYmbihlLHIubGVuZ3RoKTpcInN0cmluZ1wiPT1pJiZlIGluIHIpP3UocltlXSx0KTohMX1mdW5jdGlvbiB1KHQsZSl7cmV0dXJuIHQ9PT1lfHx0IT09dCYmZSE9PWV9ZnVuY3Rpb24gbCh0KXtyZXR1cm4gbnVsbCE9dCYmIShcImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiZjKHQpKSYmZih4KHQpKX1mdW5jdGlvbiBjKHQpe3ZhciBlPWgodCk/Yi5jYWxsKHQpOlwiXCI7cmV0dXJuIGU9PXl8fGU9PW19ZnVuY3Rpb24gZih0KXtyZXR1cm5cIm51bWJlclwiPT10eXBlb2YgdCYmdD4tMSYmdCUxPT0wJiZ2Pj10fWZ1bmN0aW9uIGgodCl7dmFyIGU9dHlwZW9mIHQ7cmV0dXJuISF0JiYoXCJvYmplY3RcIj09ZXx8XCJmdW5jdGlvblwiPT1lKX12YXIgZD10KFwibG9kYXNoLmtleXNpblwiKSxwPXQoXCJsb2Rhc2gucmVzdFwiKSx2PTkwMDcxOTkyNTQ3NDA5OTEseT1cIltvYmplY3QgRnVuY3Rpb25dXCIsbT1cIltvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dXCIsZz0vXig/OjB8WzEtOV1cXGQqKSQvLHc9T2JqZWN0LnByb3RvdHlwZSxTPXcuaGFzT3duUHJvcGVydHksYj13LnRvU3RyaW5nLHg9aShcImxlbmd0aFwiKSxrPXMoZnVuY3Rpb24odCxlLG4scil7byhlLGQoZSksdCxyKX0pO2UuZXhwb3J0cz1rfSx7XCJsb2Rhc2gua2V5c2luXCI6NyxcImxvZGFzaC5yZXN0XCI6OH1dLDU6W2Z1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gbih0LGUsbil7dmFyIHI9bi5sZW5ndGg7c3dpdGNoKHIpe2Nhc2UgMDpyZXR1cm4gdC5jYWxsKGUpO2Nhc2UgMTpyZXR1cm4gdC5jYWxsKGUsblswXSk7Y2FzZSAyOnJldHVybiB0LmNhbGwoZSxuWzBdLG5bMV0pO2Nhc2UgMzpyZXR1cm4gdC5jYWxsKGUsblswXSxuWzFdLG5bMl0pfXJldHVybiB0LmFwcGx5KGUsbil9ZnVuY3Rpb24gcih0LGUsbixyKXtyZXR1cm4gdm9pZCAwPT09dHx8aSh0LGFbbl0pJiYhdS5jYWxsKHIsbik/ZTp0fWZ1bmN0aW9uIGkodCxlKXtyZXR1cm4gdD09PWV8fHQhPT10JiZlIT09ZX12YXIgbz10KFwibG9kYXNoLmFzc2lnbmlud2l0aFwiKSxzPXQoXCJsb2Rhc2gucmVzdFwiKSxhPU9iamVjdC5wcm90b3R5cGUsdT1hLmhhc093blByb3BlcnR5LGw9cyhmdW5jdGlvbih0KXtyZXR1cm4gdC5wdXNoKHZvaWQgMCxyKSxuKG8sdm9pZCAwLHQpfSk7ZS5leHBvcnRzPWx9LHtcImxvZGFzaC5hc3NpZ25pbndpdGhcIjo0LFwibG9kYXNoLnJlc3RcIjo4fV0sNjpbZnVuY3Rpb24odCxlKXt2YXIgbj1BcnJheS5pc0FycmF5O2UuZXhwb3J0cz1ufSx7fV0sNzpbZnVuY3Rpb24odCxlLG4peyhmdW5jdGlvbih0KXtmdW5jdGlvbiByKHQsZSl7Zm9yKHZhciBuPS0xLHI9QXJyYXkodCk7KytuPHQ7KXJbbl09ZShuKTtyZXR1cm4gcn1mdW5jdGlvbiBpKHQpe3JldHVybiB0JiZ0Lk9iamVjdD09PU9iamVjdD90Om51bGx9ZnVuY3Rpb24gbyh0LGUpe3JldHVybiB0PVwibnVtYmVyXCI9PXR5cGVvZiB0fHxPLnRlc3QodCk/K3Q6LTEsZT1udWxsPT1lP1M6ZSx0Pi0xJiZ0JTE9PTAmJmU+dH1mdW5jdGlvbiBzKHQpe2Zvcih2YXIgZSxuPVtdOyEoZT10Lm5leHQoKSkuZG9uZTspbi5wdXNoKGUudmFsdWUpO3JldHVybiBufWZ1bmN0aW9uIGEodCl7dD1udWxsPT10P3Q6T2JqZWN0KHQpO3ZhciBlPVtdO2Zvcih2YXIgbiBpbiB0KWUucHVzaChuKTtyZXR1cm4gZX1mdW5jdGlvbiB1KHQpe3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gbnVsbD09ZT92b2lkIDA6ZVt0XX19ZnVuY3Rpb24gbCh0KXt2YXIgZT10P3QubGVuZ3RoOnZvaWQgMDtyZXR1cm4gdihlKSYmKFIodCl8fGcodCl8fGYodCkpP3IoZSxTdHJpbmcpOm51bGx9ZnVuY3Rpb24gYyh0KXt2YXIgZT10JiZ0LmNvbnN0cnVjdG9yLG49XCJmdW5jdGlvblwiPT10eXBlb2YgZSYmZS5wcm90b3R5cGV8fEw7cmV0dXJuIHQ9PT1ufWZ1bmN0aW9uIGYodCl7cmV0dXJuIGQodCkmJiQuY2FsbCh0LFwiY2FsbGVlXCIpJiYoIU0uY2FsbCh0LFwiY2FsbGVlXCIpfHxQLmNhbGwodCk9PWIpfWZ1bmN0aW9uIGgodCl7cmV0dXJuIG51bGwhPXQmJiEoXCJmdW5jdGlvblwiPT10eXBlb2YgdCYmcCh0KSkmJnYoeih0KSl9ZnVuY3Rpb24gZCh0KXtyZXR1cm4gbSh0KSYmaCh0KX1mdW5jdGlvbiBwKHQpe3ZhciBlPXkodCk/UC5jYWxsKHQpOlwiXCI7cmV0dXJuIGU9PXh8fGU9PWt9ZnVuY3Rpb24gdih0KXtyZXR1cm5cIm51bWJlclwiPT10eXBlb2YgdCYmdD4tMSYmdCUxPT0wJiZTPj10fWZ1bmN0aW9uIHkodCl7dmFyIGU9dHlwZW9mIHQ7cmV0dXJuISF0JiYoXCJvYmplY3RcIj09ZXx8XCJmdW5jdGlvblwiPT1lKX1mdW5jdGlvbiBtKHQpe3JldHVybiEhdCYmXCJvYmplY3RcIj09dHlwZW9mIHR9ZnVuY3Rpb24gZyh0KXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdHx8IVIodCkmJm0odCkmJlAuY2FsbCh0KT09RX1mdW5jdGlvbiB3KHQpe2Zvcih2YXIgZT0tMSxuPWModCkscj1hKHQpLGk9ci5sZW5ndGgscz1sKHQpLHU9ISFzLGY9c3x8W10saD1mLmxlbmd0aDsrK2U8aTspe3ZhciBkPXJbZV07dSYmKFwibGVuZ3RoXCI9PWR8fG8oZCxoKSl8fFwiY29uc3RydWN0b3JcIj09ZCYmKG58fCEkLmNhbGwodCxkKSl8fGYucHVzaChkKX1yZXR1cm4gZn12YXIgUz05MDA3MTk5MjU0NzQwOTkxLGI9XCJbb2JqZWN0IEFyZ3VtZW50c11cIix4PVwiW29iamVjdCBGdW5jdGlvbl1cIixrPVwiW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl1cIixFPVwiW29iamVjdCBTdHJpbmddXCIsTz0vXig/OjB8WzEtOV1cXGQqKSQvLGo9e1wiZnVuY3Rpb25cIjohMCxvYmplY3Q6ITB9LEM9alt0eXBlb2Ygbl0mJm4mJiFuLm5vZGVUeXBlP246bnVsbCxOPWpbdHlwZW9mIGVdJiZlJiYhZS5ub2RlVHlwZT9lOm51bGwsXz1pKEMmJk4mJlwib2JqZWN0XCI9PXR5cGVvZiB0JiZ0KSxBPWkoalt0eXBlb2Ygc2VsZl0mJnNlbGYpLEY9aShqW3R5cGVvZiB3aW5kb3ddJiZ3aW5kb3cpLFQ9aShqW3R5cGVvZiB0aGlzXSYmdGhpcyksST1ffHxGIT09KFQmJlQud2luZG93KSYmRnx8QXx8VHx8RnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpLEw9T2JqZWN0LnByb3RvdHlwZSwkPUwuaGFzT3duUHJvcGVydHksUD1MLnRvU3RyaW5nLFY9SS5SZWZsZWN0LEo9Vj9WLmVudW1lcmF0ZTp2b2lkIDAsTT1MLnByb3BlcnR5SXNFbnVtZXJhYmxlO0omJiFNLmNhbGwoe3ZhbHVlT2Y6MX0sXCJ2YWx1ZU9mXCIpJiYoYT1mdW5jdGlvbih0KXtyZXR1cm4gcyhKKHQpKX0pO3ZhciB6PXUoXCJsZW5ndGhcIiksUj1BcnJheS5pc0FycmF5O2UuZXhwb3J0cz13fSkuY2FsbCh0aGlzLFwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWw/Z2xvYmFsOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmP3NlbGY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6e30pfSx7fV0sODpbZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBuKHQsZSxuKXt2YXIgcj1uLmxlbmd0aDtzd2l0Y2gocil7Y2FzZSAwOnJldHVybiB0LmNhbGwoZSk7Y2FzZSAxOnJldHVybiB0LmNhbGwoZSxuWzBdKTtjYXNlIDI6cmV0dXJuIHQuY2FsbChlLG5bMF0sblsxXSk7Y2FzZSAzOnJldHVybiB0LmNhbGwoZSxuWzBdLG5bMV0sblsyXSl9cmV0dXJuIHQuYXBwbHkoZSxuKX1mdW5jdGlvbiByKHQsZSl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgdCl0aHJvdyBuZXcgVHlwZUVycm9yKHUpO3JldHVybiBlPWIodm9pZCAwPT09ZT90Lmxlbmd0aC0xOnMoZSksMCksZnVuY3Rpb24oKXtmb3IodmFyIHI9YXJndW1lbnRzLGk9LTEsbz1iKHIubGVuZ3RoLWUsMCkscz1BcnJheShvKTsrK2k8bzspc1tpXT1yW2UraV07c3dpdGNoKGUpe2Nhc2UgMDpyZXR1cm4gdC5jYWxsKHRoaXMscyk7Y2FzZSAxOnJldHVybiB0LmNhbGwodGhpcyxyWzBdLHMpO2Nhc2UgMjpyZXR1cm4gdC5jYWxsKHRoaXMsclswXSxyWzFdLHMpfXZhciBhPUFycmF5KGUrMSk7Zm9yKGk9LTE7KytpPGU7KWFbaV09cltpXTtyZXR1cm4gYVtlXT1zLG4odCx0aGlzLGEpfX1mdW5jdGlvbiBpKHQpe3ZhciBlPW8odCk/Uy5jYWxsKHQpOlwiXCI7cmV0dXJuIGU9PWh8fGU9PWR9ZnVuY3Rpb24gbyh0KXt2YXIgZT10eXBlb2YgdDtyZXR1cm4hIXQmJihcIm9iamVjdFwiPT1lfHxcImZ1bmN0aW9uXCI9PWUpfWZ1bmN0aW9uIHModCl7aWYoIXQpcmV0dXJuIDA9PT10P3Q6MDtpZih0PWEodCksdD09PWx8fHQ9PT0tbCl7dmFyIGU9MD50Py0xOjE7cmV0dXJuIGUqY312YXIgbj10JTE7cmV0dXJuIHQ9PT10P24/dC1uOnQ6MH1mdW5jdGlvbiBhKHQpe2lmKG8odCkpe3ZhciBlPWkodC52YWx1ZU9mKT90LnZhbHVlT2YoKTp0O3Q9byhlKT9lK1wiXCI6ZX1pZihcInN0cmluZ1wiIT10eXBlb2YgdClyZXR1cm4gMD09PXQ/dDordDt0PXQucmVwbGFjZShwLFwiXCIpO3ZhciBuPXkudGVzdCh0KTtyZXR1cm4gbnx8bS50ZXN0KHQpP2codC5zbGljZSgyKSxuPzI6OCk6di50ZXN0KHQpP2Y6K3R9dmFyIHU9XCJFeHBlY3RlZCBhIGZ1bmN0aW9uXCIsbD0xLzAsYz0xLjc5NzY5MzEzNDg2MjMxNTdlMzA4LGY9MC8wLGg9XCJbb2JqZWN0IEZ1bmN0aW9uXVwiLGQ9XCJbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXVwiLHA9L15cXHMrfFxccyskL2csdj0vXlstK10weFswLTlhLWZdKyQvaSx5PS9eMGJbMDFdKyQvaSxtPS9eMG9bMC03XSskL2ksZz1wYXJzZUludCx3PU9iamVjdC5wcm90b3R5cGUsUz13LnRvU3RyaW5nLGI9TWF0aC5tYXg7ZS5leHBvcnRzPXJ9LHt9XSw5OltmdW5jdGlvbihlLG4scil7IWZ1bmN0aW9uKCl7dmFyIGU9ZnVuY3Rpb24odCl7dmFyIG49bmV3IGUuSW5kZXg7cmV0dXJuIG4ucGlwZWxpbmUuYWRkKGUudHJpbW1lcixlLnN0b3BXb3JkRmlsdGVyLGUuc3RlbW1lciksdCYmdC5jYWxsKG4sbiksbn07ZS52ZXJzaW9uPVwiMC42LjBcIixlLnV0aWxzPXt9LGUudXRpbHMud2Fybj1mdW5jdGlvbih0KXtyZXR1cm4gZnVuY3Rpb24oZSl7dC5jb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybihlKX19KHRoaXMpLGUudXRpbHMuYXNTdHJpbmc9ZnVuY3Rpb24odCl7cmV0dXJuIHZvaWQgMD09PXR8fG51bGw9PT10P1wiXCI6dC50b1N0cmluZygpfSxlLkV2ZW50RW1pdHRlcj1mdW5jdGlvbigpe3RoaXMuZXZlbnRzPXt9fSxlLkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI9ZnVuY3Rpb24oKXt2YXIgdD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLGU9dC5wb3AoKSxuPXQ7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgZSl0aHJvdyBuZXcgVHlwZUVycm9yKFwibGFzdCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb25cIik7bi5mb3JFYWNoKGZ1bmN0aW9uKHQpe3RoaXMuaGFzSGFuZGxlcih0KXx8KHRoaXMuZXZlbnRzW3RdPVtdKSx0aGlzLmV2ZW50c1t0XS5wdXNoKGUpfSx0aGlzKX0sZS5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyPWZ1bmN0aW9uKHQsZSl7aWYodGhpcy5oYXNIYW5kbGVyKHQpKXt2YXIgbj10aGlzLmV2ZW50c1t0XS5pbmRleE9mKGUpO3RoaXMuZXZlbnRzW3RdLnNwbGljZShuLDEpLHRoaXMuZXZlbnRzW3RdLmxlbmd0aHx8ZGVsZXRlIHRoaXMuZXZlbnRzW3RdfX0sZS5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQ9ZnVuY3Rpb24odCl7aWYodGhpcy5oYXNIYW5kbGVyKHQpKXt2YXIgZT1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMSk7dGhpcy5ldmVudHNbdF0uZm9yRWFjaChmdW5jdGlvbih0KXt0LmFwcGx5KHZvaWQgMCxlKX0pfX0sZS5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmhhc0hhbmRsZXI9ZnVuY3Rpb24odCl7cmV0dXJuIHQgaW4gdGhpcy5ldmVudHN9LGUudG9rZW5pemVyPWZ1bmN0aW9uKHQpe3JldHVybiBhcmd1bWVudHMubGVuZ3RoJiZudWxsIT10JiZ2b2lkIDAhPXQ/QXJyYXkuaXNBcnJheSh0KT90Lm1hcChmdW5jdGlvbih0KXtyZXR1cm4gZS51dGlscy5hc1N0cmluZyh0KS50b0xvd2VyQ2FzZSgpfSk6dC50b1N0cmluZygpLnRyaW0oKS50b0xvd2VyQ2FzZSgpLnNwbGl0KGUudG9rZW5pemVyLnNlcGVyYXRvcik6W119LGUudG9rZW5pemVyLnNlcGVyYXRvcj0vW1xcc1xcLV0rLyxlLlBpcGVsaW5lPWZ1bmN0aW9uKCl7dGhpcy5fc3RhY2s9W119LGUuUGlwZWxpbmUucmVnaXN0ZXJlZEZ1bmN0aW9ucz17fSxlLlBpcGVsaW5lLnJlZ2lzdGVyRnVuY3Rpb249ZnVuY3Rpb24odCxuKXtuIGluIHRoaXMucmVnaXN0ZXJlZEZ1bmN0aW9ucyYmZS51dGlscy53YXJuKFwiT3ZlcndyaXRpbmcgZXhpc3RpbmcgcmVnaXN0ZXJlZCBmdW5jdGlvbjogXCIrbiksdC5sYWJlbD1uLGUuUGlwZWxpbmUucmVnaXN0ZXJlZEZ1bmN0aW9uc1t0LmxhYmVsXT10fSxlLlBpcGVsaW5lLndhcm5JZkZ1bmN0aW9uTm90UmVnaXN0ZXJlZD1mdW5jdGlvbih0KXt2YXIgbj10LmxhYmVsJiZ0LmxhYmVsIGluIHRoaXMucmVnaXN0ZXJlZEZ1bmN0aW9ucztufHxlLnV0aWxzLndhcm4oXCJGdW5jdGlvbiBpcyBub3QgcmVnaXN0ZXJlZCB3aXRoIHBpcGVsaW5lLiBUaGlzIG1heSBjYXVzZSBwcm9ibGVtcyB3aGVuIHNlcmlhbGlzaW5nIHRoZSBpbmRleC5cXG5cIix0KX0sZS5QaXBlbGluZS5sb2FkPWZ1bmN0aW9uKHQpe3ZhciBuPW5ldyBlLlBpcGVsaW5lO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCl7dmFyIHI9ZS5QaXBlbGluZS5yZWdpc3RlcmVkRnVuY3Rpb25zW3RdO2lmKCFyKXRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBsb2FkIHVuLXJlZ2lzdGVyZWQgZnVuY3Rpb246IFwiK3QpO24uYWRkKHIpfSksbn0sZS5QaXBlbGluZS5wcm90b3R5cGUuYWRkPWZ1bmN0aW9uKCl7dmFyIHQ9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTt0LmZvckVhY2goZnVuY3Rpb24odCl7ZS5QaXBlbGluZS53YXJuSWZGdW5jdGlvbk5vdFJlZ2lzdGVyZWQodCksdGhpcy5fc3RhY2sucHVzaCh0KX0sdGhpcyl9LGUuUGlwZWxpbmUucHJvdG90eXBlLmFmdGVyPWZ1bmN0aW9uKHQsbil7ZS5QaXBlbGluZS53YXJuSWZGdW5jdGlvbk5vdFJlZ2lzdGVyZWQobik7dmFyIHI9dGhpcy5fc3RhY2suaW5kZXhPZih0KTtpZigtMT09cil0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBleGlzdGluZ0ZuXCIpO3IrPTEsdGhpcy5fc3RhY2suc3BsaWNlKHIsMCxuKX0sZS5QaXBlbGluZS5wcm90b3R5cGUuYmVmb3JlPWZ1bmN0aW9uKHQsbil7ZS5QaXBlbGluZS53YXJuSWZGdW5jdGlvbk5vdFJlZ2lzdGVyZWQobik7dmFyIHI9dGhpcy5fc3RhY2suaW5kZXhPZih0KTtpZigtMT09cil0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBleGlzdGluZ0ZuXCIpO3RoaXMuX3N0YWNrLnNwbGljZShyLDAsbil9LGUuUGlwZWxpbmUucHJvdG90eXBlLnJlbW92ZT1mdW5jdGlvbih0KXt2YXIgZT10aGlzLl9zdGFjay5pbmRleE9mKHQpOy0xIT1lJiZ0aGlzLl9zdGFjay5zcGxpY2UoZSwxKX0sZS5QaXBlbGluZS5wcm90b3R5cGUucnVuPWZ1bmN0aW9uKHQpe2Zvcih2YXIgZT1bXSxuPXQubGVuZ3RoLHI9dGhpcy5fc3RhY2subGVuZ3RoLGk9MDtuPmk7aSsrKXtmb3IodmFyIG89dFtpXSxzPTA7cj5zJiYobz10aGlzLl9zdGFja1tzXShvLGksdCksdm9pZCAwIT09byYmXCJcIiE9PW8pO3MrKyk7dm9pZCAwIT09byYmXCJcIiE9PW8mJmUucHVzaChvKX1yZXR1cm4gZX0sZS5QaXBlbGluZS5wcm90b3R5cGUucmVzZXQ9ZnVuY3Rpb24oKXt0aGlzLl9zdGFjaz1bXX0sZS5QaXBlbGluZS5wcm90b3R5cGUudG9KU09OPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3N0YWNrLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gZS5QaXBlbGluZS53YXJuSWZGdW5jdGlvbk5vdFJlZ2lzdGVyZWQodCksdC5sYWJlbH0pfSxlLlZlY3Rvcj1mdW5jdGlvbigpe3RoaXMuX21hZ25pdHVkZT1udWxsLHRoaXMubGlzdD12b2lkIDAsdGhpcy5sZW5ndGg9MH0sZS5WZWN0b3IuTm9kZT1mdW5jdGlvbih0LGUsbil7dGhpcy5pZHg9dCx0aGlzLnZhbD1lLHRoaXMubmV4dD1ufSxlLlZlY3Rvci5wcm90b3R5cGUuaW5zZXJ0PWZ1bmN0aW9uKHQsbil7dGhpcy5fbWFnbml0dWRlPXZvaWQgMDt2YXIgcj10aGlzLmxpc3Q7aWYoIXIpcmV0dXJuIHRoaXMubGlzdD1uZXcgZS5WZWN0b3IuTm9kZSh0LG4sciksdGhpcy5sZW5ndGgrKztpZih0PHIuaWR4KXJldHVybiB0aGlzLmxpc3Q9bmV3IGUuVmVjdG9yLk5vZGUodCxuLHIpLHRoaXMubGVuZ3RoKys7Zm9yKHZhciBpPXIsbz1yLm5leHQ7dm9pZCAwIT1vOyl7aWYodDxvLmlkeClyZXR1cm4gaS5uZXh0PW5ldyBlLlZlY3Rvci5Ob2RlKHQsbixvKSx0aGlzLmxlbmd0aCsrO2k9byxvPW8ubmV4dH1yZXR1cm4gaS5uZXh0PW5ldyBlLlZlY3Rvci5Ob2RlKHQsbixvKSx0aGlzLmxlbmd0aCsrfSxlLlZlY3Rvci5wcm90b3R5cGUubWFnbml0dWRlPWZ1bmN0aW9uKCl7aWYodGhpcy5fbWFnbml0dWRlKXJldHVybiB0aGlzLl9tYWduaXR1ZGU7Zm9yKHZhciB0LGU9dGhpcy5saXN0LG49MDtlOyl0PWUudmFsLG4rPXQqdCxlPWUubmV4dDtyZXR1cm4gdGhpcy5fbWFnbml0dWRlPU1hdGguc3FydChuKX0sZS5WZWN0b3IucHJvdG90eXBlLmRvdD1mdW5jdGlvbih0KXtmb3IodmFyIGU9dGhpcy5saXN0LG49dC5saXN0LHI9MDtlJiZuOyllLmlkeDxuLmlkeD9lPWUubmV4dDplLmlkeD5uLmlkeD9uPW4ubmV4dDoocis9ZS52YWwqbi52YWwsZT1lLm5leHQsbj1uLm5leHQpO3JldHVybiByfSxlLlZlY3Rvci5wcm90b3R5cGUuc2ltaWxhcml0eT1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5kb3QodCkvKHRoaXMubWFnbml0dWRlKCkqdC5tYWduaXR1ZGUoKSl9LGUuU29ydGVkU2V0PWZ1bmN0aW9uKCl7dGhpcy5sZW5ndGg9MCx0aGlzLmVsZW1lbnRzPVtdfSxlLlNvcnRlZFNldC5sb2FkPWZ1bmN0aW9uKHQpe3ZhciBlPW5ldyB0aGlzO3JldHVybiBlLmVsZW1lbnRzPXQsZS5sZW5ndGg9dC5sZW5ndGgsZX0sZS5Tb3J0ZWRTZXQucHJvdG90eXBlLmFkZD1mdW5jdGlvbigpe3ZhciB0LGU7Zm9yKHQ9MDt0PGFyZ3VtZW50cy5sZW5ndGg7dCsrKWU9YXJndW1lbnRzW3RdLH50aGlzLmluZGV4T2YoZSl8fHRoaXMuZWxlbWVudHMuc3BsaWNlKHRoaXMubG9jYXRpb25Gb3IoZSksMCxlKTt0aGlzLmxlbmd0aD10aGlzLmVsZW1lbnRzLmxlbmd0aH0sZS5Tb3J0ZWRTZXQucHJvdG90eXBlLnRvQXJyYXk9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lbGVtZW50cy5zbGljZSgpfSxlLlNvcnRlZFNldC5wcm90b3R5cGUubWFwPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMuZWxlbWVudHMubWFwKHQsZSl9LGUuU29ydGVkU2V0LnByb3RvdHlwZS5mb3JFYWNoPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMuZWxlbWVudHMuZm9yRWFjaCh0LGUpfSxlLlNvcnRlZFNldC5wcm90b3R5cGUuaW5kZXhPZj1mdW5jdGlvbih0KXtmb3IodmFyIGU9MCxuPXRoaXMuZWxlbWVudHMubGVuZ3RoLHI9bi1lLGk9ZStNYXRoLmZsb29yKHIvMiksbz10aGlzLmVsZW1lbnRzW2ldO3I+MTspe2lmKG89PT10KXJldHVybiBpO3Q+byYmKGU9aSksbz50JiYobj1pKSxyPW4tZSxpPWUrTWF0aC5mbG9vcihyLzIpLG89dGhpcy5lbGVtZW50c1tpXX1yZXR1cm4gbz09PXQ/aTotMX0sZS5Tb3J0ZWRTZXQucHJvdG90eXBlLmxvY2F0aW9uRm9yPWZ1bmN0aW9uKHQpe2Zvcih2YXIgZT0wLG49dGhpcy5lbGVtZW50cy5sZW5ndGgscj1uLWUsaT1lK01hdGguZmxvb3Ioci8yKSxvPXRoaXMuZWxlbWVudHNbaV07cj4xOyl0Pm8mJihlPWkpLG8+dCYmKG49aSkscj1uLWUsaT1lK01hdGguZmxvb3Ioci8yKSxvPXRoaXMuZWxlbWVudHNbaV07cmV0dXJuIG8+dD9pOnQ+bz9pKzE6dm9pZCAwfSxlLlNvcnRlZFNldC5wcm90b3R5cGUuaW50ZXJzZWN0PWZ1bmN0aW9uKHQpe2Zvcih2YXIgbj1uZXcgZS5Tb3J0ZWRTZXQscj0wLGk9MCxvPXRoaXMubGVuZ3RoLHM9dC5sZW5ndGgsYT10aGlzLmVsZW1lbnRzLHU9dC5lbGVtZW50czs7KXtpZihyPm8tMXx8aT5zLTEpYnJlYWs7YVtyXSE9PXVbaV0/YVtyXTx1W2ldP3IrKzphW3JdPnVbaV0mJmkrKzoobi5hZGQoYVtyXSkscisrLGkrKyl9cmV0dXJuIG59LGUuU29ydGVkU2V0LnByb3RvdHlwZS5jbG9uZT1mdW5jdGlvbigpe3ZhciB0PW5ldyBlLlNvcnRlZFNldDtyZXR1cm4gdC5lbGVtZW50cz10aGlzLnRvQXJyYXkoKSx0Lmxlbmd0aD10LmVsZW1lbnRzLmxlbmd0aCx0fSxlLlNvcnRlZFNldC5wcm90b3R5cGUudW5pb249ZnVuY3Rpb24odCl7dmFyIGUsbixyO3JldHVybiB0aGlzLmxlbmd0aD49dC5sZW5ndGg/KGU9dGhpcyxuPXQpOihlPXQsbj10aGlzKSxyPWUuY2xvbmUoKSxyLmFkZC5hcHBseShyLG4udG9BcnJheSgpKSxyfSxlLlNvcnRlZFNldC5wcm90b3R5cGUudG9KU09OPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudG9BcnJheSgpfSxlLkluZGV4PWZ1bmN0aW9uKCl7dGhpcy5fZmllbGRzPVtdLHRoaXMuX3JlZj1cImlkXCIsdGhpcy5waXBlbGluZT1uZXcgZS5QaXBlbGluZSx0aGlzLmRvY3VtZW50U3RvcmU9bmV3IGUuU3RvcmUsdGhpcy50b2tlblN0b3JlPW5ldyBlLlRva2VuU3RvcmUsdGhpcy5jb3JwdXNUb2tlbnM9bmV3IGUuU29ydGVkU2V0LHRoaXMuZXZlbnRFbWl0dGVyPW5ldyBlLkV2ZW50RW1pdHRlcix0aGlzLl9pZGZDYWNoZT17fSx0aGlzLm9uKFwiYWRkXCIsXCJyZW1vdmVcIixcInVwZGF0ZVwiLGZ1bmN0aW9uKCl7dGhpcy5faWRmQ2FjaGU9e319LmJpbmQodGhpcykpfSxlLkluZGV4LnByb3RvdHlwZS5vbj1mdW5jdGlvbigpe3ZhciB0PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7cmV0dXJuIHRoaXMuZXZlbnRFbWl0dGVyLmFkZExpc3RlbmVyLmFwcGx5KHRoaXMuZXZlbnRFbWl0dGVyLHQpfSxlLkluZGV4LnByb3RvdHlwZS5vZmY9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5ldmVudEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIodCxlKX0sZS5JbmRleC5sb2FkPWZ1bmN0aW9uKHQpe3QudmVyc2lvbiE9PWUudmVyc2lvbiYmZS51dGlscy53YXJuKFwidmVyc2lvbiBtaXNtYXRjaDogY3VycmVudCBcIitlLnZlcnNpb24rXCIgaW1wb3J0aW5nIFwiK3QudmVyc2lvbik7dmFyIG49bmV3IHRoaXM7cmV0dXJuIG4uX2ZpZWxkcz10LmZpZWxkcyxuLl9yZWY9dC5yZWYsbi5kb2N1bWVudFN0b3JlPWUuU3RvcmUubG9hZCh0LmRvY3VtZW50U3RvcmUpLG4udG9rZW5TdG9yZT1lLlRva2VuU3RvcmUubG9hZCh0LnRva2VuU3RvcmUpLG4uY29ycHVzVG9rZW5zPWUuU29ydGVkU2V0LmxvYWQodC5jb3JwdXNUb2tlbnMpLG4ucGlwZWxpbmU9ZS5QaXBlbGluZS5sb2FkKHQucGlwZWxpbmUpLG59LGUuSW5kZXgucHJvdG90eXBlLmZpZWxkPWZ1bmN0aW9uKHQsZSl7dmFyIGU9ZXx8e30sbj17bmFtZTp0LGJvb3N0OmUuYm9vc3R8fDF9O3JldHVybiB0aGlzLl9maWVsZHMucHVzaChuKSx0aGlzfSxlLkluZGV4LnByb3RvdHlwZS5yZWY9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX3JlZj10LHRoaXN9LGUuSW5kZXgucHJvdG90eXBlLmFkZD1mdW5jdGlvbih0LG4pe3ZhciByPXt9LGk9bmV3IGUuU29ydGVkU2V0LG89dFt0aGlzLl9yZWZdLG49dm9pZCAwPT09bj8hMDpuO3RoaXMuX2ZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uKG4pe3ZhciBvPXRoaXMucGlwZWxpbmUucnVuKGUudG9rZW5pemVyKHRbbi5uYW1lXSkpO3Jbbi5uYW1lXT1vLGUuU29ydGVkU2V0LnByb3RvdHlwZS5hZGQuYXBwbHkoaSxvKX0sdGhpcyksdGhpcy5kb2N1bWVudFN0b3JlLnNldChvLGkpLGUuU29ydGVkU2V0LnByb3RvdHlwZS5hZGQuYXBwbHkodGhpcy5jb3JwdXNUb2tlbnMsaS50b0FycmF5KCkpO2Zvcih2YXIgcz0wO3M8aS5sZW5ndGg7cysrKXt2YXIgYT1pLmVsZW1lbnRzW3NdLHU9dGhpcy5fZmllbGRzLnJlZHVjZShmdW5jdGlvbih0LGUpe3ZhciBuPXJbZS5uYW1lXS5sZW5ndGg7aWYoIW4pcmV0dXJuIHQ7dmFyIGk9cltlLm5hbWVdLmZpbHRlcihmdW5jdGlvbih0KXtyZXR1cm4gdD09PWF9KS5sZW5ndGg7cmV0dXJuIHQraS9uKmUuYm9vc3R9LDApO3RoaXMudG9rZW5TdG9yZS5hZGQoYSx7cmVmOm8sdGY6dX0pfW4mJnRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoXCJhZGRcIix0LHRoaXMpfSxlLkluZGV4LnByb3RvdHlwZS5yZW1vdmU9ZnVuY3Rpb24odCxlKXt2YXIgbj10W3RoaXMuX3JlZl0sZT12b2lkIDA9PT1lPyEwOmU7aWYodGhpcy5kb2N1bWVudFN0b3JlLmhhcyhuKSl7dmFyIHI9dGhpcy5kb2N1bWVudFN0b3JlLmdldChuKTt0aGlzLmRvY3VtZW50U3RvcmUucmVtb3ZlKG4pLHIuZm9yRWFjaChmdW5jdGlvbih0KXt0aGlzLnRva2VuU3RvcmUucmVtb3ZlKHQsbil9LHRoaXMpLGUmJnRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoXCJyZW1vdmVcIix0LHRoaXMpfX0sZS5JbmRleC5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKHQsZSl7dmFyIGU9dm9pZCAwPT09ZT8hMDplO3RoaXMucmVtb3ZlKHQsITEpLHRoaXMuYWRkKHQsITEpLGUmJnRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoXCJ1cGRhdGVcIix0LHRoaXMpfSxlLkluZGV4LnByb3RvdHlwZS5pZGY9ZnVuY3Rpb24odCl7dmFyIGU9XCJAXCIrdDtpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5faWRmQ2FjaGUsZSkpcmV0dXJuIHRoaXMuX2lkZkNhY2hlW2VdO3ZhciBuPXRoaXMudG9rZW5TdG9yZS5jb3VudCh0KSxyPTE7cmV0dXJuIG4+MCYmKHI9MStNYXRoLmxvZyh0aGlzLmRvY3VtZW50U3RvcmUubGVuZ3RoL24pKSx0aGlzLl9pZGZDYWNoZVtlXT1yfSxlLkluZGV4LnByb3RvdHlwZS5zZWFyY2g9ZnVuY3Rpb24odCl7dmFyIG49dGhpcy5waXBlbGluZS5ydW4oZS50b2tlbml6ZXIodCkpLHI9bmV3IGUuVmVjdG9yLGk9W10sbz10aGlzLl9maWVsZHMucmVkdWNlKGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQrZS5ib29zdH0sMCkscz1uLnNvbWUoZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMudG9rZW5TdG9yZS5oYXModCl9LHRoaXMpO2lmKCFzKXJldHVybltdO24uZm9yRWFjaChmdW5jdGlvbih0LG4scyl7dmFyIGE9MS9zLmxlbmd0aCp0aGlzLl9maWVsZHMubGVuZ3RoKm8sdT10aGlzLGw9dGhpcy50b2tlblN0b3JlLmV4cGFuZCh0KS5yZWR1Y2UoZnVuY3Rpb24obixpKXt2YXIgbz11LmNvcnB1c1Rva2Vucy5pbmRleE9mKGkpLHM9dS5pZGYoaSksbD0xLGM9bmV3IGUuU29ydGVkU2V0O2lmKGkhPT10KXt2YXIgZj1NYXRoLm1heCgzLGkubGVuZ3RoLXQubGVuZ3RoKTtsPTEvTWF0aC5sb2coZil9bz4tMSYmci5pbnNlcnQobyxhKnMqbCk7Zm9yKHZhciBoPXUudG9rZW5TdG9yZS5nZXQoaSksZD1PYmplY3Qua2V5cyhoKSxwPWQubGVuZ3RoLHY9MDtwPnY7disrKWMuYWRkKGhbZFt2XV0ucmVmKTtyZXR1cm4gbi51bmlvbihjKX0sbmV3IGUuU29ydGVkU2V0KTtpLnB1c2gobCl9LHRoaXMpO3ZhciBhPWkucmVkdWNlKGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQuaW50ZXJzZWN0KGUpfSk7cmV0dXJuIGEubWFwKGZ1bmN0aW9uKHQpe3JldHVybntyZWY6dCxzY29yZTpyLnNpbWlsYXJpdHkodGhpcy5kb2N1bWVudFZlY3Rvcih0KSl9fSx0aGlzKS5zb3J0KGZ1bmN0aW9uKHQsZSl7cmV0dXJuIGUuc2NvcmUtdC5zY29yZX0pfSxlLkluZGV4LnByb3RvdHlwZS5kb2N1bWVudFZlY3Rvcj1mdW5jdGlvbih0KXtmb3IodmFyIG49dGhpcy5kb2N1bWVudFN0b3JlLmdldCh0KSxyPW4ubGVuZ3RoLGk9bmV3IGUuVmVjdG9yLG89MDtyPm87bysrKXt2YXIgcz1uLmVsZW1lbnRzW29dLGE9dGhpcy50b2tlblN0b3JlLmdldChzKVt0XS50Zix1PXRoaXMuaWRmKHMpO2kuaW5zZXJ0KHRoaXMuY29ycHVzVG9rZW5zLmluZGV4T2YocyksYSp1KX1yZXR1cm4gaX0sZS5JbmRleC5wcm90b3R5cGUudG9KU09OPWZ1bmN0aW9uKCl7cmV0dXJue3ZlcnNpb246ZS52ZXJzaW9uLGZpZWxkczp0aGlzLl9maWVsZHMscmVmOnRoaXMuX3JlZixkb2N1bWVudFN0b3JlOnRoaXMuZG9jdW1lbnRTdG9yZS50b0pTT04oKSx0b2tlblN0b3JlOnRoaXMudG9rZW5TdG9yZS50b0pTT04oKSxjb3JwdXNUb2tlbnM6dGhpcy5jb3JwdXNUb2tlbnMudG9KU09OKCkscGlwZWxpbmU6dGhpcy5waXBlbGluZS50b0pTT04oKX19LGUuSW5kZXgucHJvdG90eXBlLnVzZT1mdW5jdGlvbih0KXt2YXIgZT1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMSk7ZS51bnNoaWZ0KHRoaXMpLHQuYXBwbHkodGhpcyxlKX0sZS5TdG9yZT1mdW5jdGlvbigpe3RoaXMuc3RvcmU9e30sdGhpcy5sZW5ndGg9MH0sZS5TdG9yZS5sb2FkPWZ1bmN0aW9uKHQpe3ZhciBuPW5ldyB0aGlzO3JldHVybiBuLmxlbmd0aD10Lmxlbmd0aCxuLnN0b3JlPU9iamVjdC5rZXlzKHQuc3RvcmUpLnJlZHVjZShmdW5jdGlvbihuLHIpe3JldHVybiBuW3JdPWUuU29ydGVkU2V0LmxvYWQodC5zdG9yZVtyXSksbn0se30pLG59LGUuU3RvcmUucHJvdG90eXBlLnNldD1mdW5jdGlvbih0LGUpe3RoaXMuaGFzKHQpfHx0aGlzLmxlbmd0aCsrLHRoaXMuc3RvcmVbdF09ZX0sZS5TdG9yZS5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLnN0b3JlW3RdfSxlLlN0b3JlLnByb3RvdHlwZS5oYXM9ZnVuY3Rpb24odCl7cmV0dXJuIHQgaW4gdGhpcy5zdG9yZX0sZS5TdG9yZS5wcm90b3R5cGUucmVtb3ZlPWZ1bmN0aW9uKHQpe3RoaXMuaGFzKHQpJiYoZGVsZXRlIHRoaXMuc3RvcmVbdF0sdGhpcy5sZW5ndGgtLSl9LGUuU3RvcmUucHJvdG90eXBlLnRvSlNPTj1mdW5jdGlvbigpe3JldHVybntzdG9yZTp0aGlzLnN0b3JlLGxlbmd0aDp0aGlzLmxlbmd0aH19LGUuc3RlbW1lcj1mdW5jdGlvbigpe3ZhciB0PXthdGlvbmFsOlwiYXRlXCIsdGlvbmFsOlwidGlvblwiLGVuY2k6XCJlbmNlXCIsYW5jaTpcImFuY2VcIixpemVyOlwiaXplXCIsYmxpOlwiYmxlXCIsYWxsaTpcImFsXCIsZW50bGk6XCJlbnRcIixlbGk6XCJlXCIsb3VzbGk6XCJvdXNcIixpemF0aW9uOlwiaXplXCIsYXRpb246XCJhdGVcIixhdG9yOlwiYXRlXCIsYWxpc206XCJhbFwiLGl2ZW5lc3M6XCJpdmVcIixmdWxuZXNzOlwiZnVsXCIsb3VzbmVzczpcIm91c1wiLGFsaXRpOlwiYWxcIixpdml0aTpcIml2ZVwiLGJpbGl0aTpcImJsZVwiLGxvZ2k6XCJsb2dcIn0sZT17aWNhdGU6XCJpY1wiLGF0aXZlOlwiXCIsYWxpemU6XCJhbFwiLGljaXRpOlwiaWNcIixpY2FsOlwiaWNcIixmdWw6XCJcIixuZXNzOlwiXCJ9LG49XCJbXmFlaW91XVwiLHI9XCJbYWVpb3V5XVwiLGk9bitcIlteYWVpb3V5XSpcIixvPXIrXCJbYWVpb3VdKlwiLHM9XCJeKFwiK2krXCIpP1wiK28raSxhPVwiXihcIitpK1wiKT9cIitvK2krXCIoXCIrbytcIik/JFwiLHU9XCJeKFwiK2krXCIpP1wiK28raStvK2ksbD1cIl4oXCIraStcIik/XCIrcixjPW5ldyBSZWdFeHAocyksZj1uZXcgUmVnRXhwKHUpLGg9bmV3IFJlZ0V4cChhKSxkPW5ldyBSZWdFeHAobCkscD0vXiguKz8pKHNzfGkpZXMkLyx2PS9eKC4rPykoW15zXSlzJC8seT0vXiguKz8pZWVkJC8sbT0vXiguKz8pKGVkfGluZykkLyxnPS8uJC8sdz0vKGF0fGJsfGl6KSQvLFM9bmV3IFJlZ0V4cChcIihbXmFlaW91eWxzel0pXFxcXDEkXCIpLGI9bmV3IFJlZ0V4cChcIl5cIitpK3IrXCJbXmFlaW91d3h5XSRcIikseD0vXiguKz9bXmFlaW91XSl5JC8saz0vXiguKz8pKGF0aW9uYWx8dGlvbmFsfGVuY2l8YW5jaXxpemVyfGJsaXxhbGxpfGVudGxpfGVsaXxvdXNsaXxpemF0aW9ufGF0aW9ufGF0b3J8YWxpc218aXZlbmVzc3xmdWxuZXNzfG91c25lc3N8YWxpdGl8aXZpdGl8YmlsaXRpfGxvZ2kpJC8sRT0vXiguKz8pKGljYXRlfGF0aXZlfGFsaXplfGljaXRpfGljYWx8ZnVsfG5lc3MpJC8sTz0vXiguKz8pKGFsfGFuY2V8ZW5jZXxlcnxpY3xhYmxlfGlibGV8YW50fGVtZW50fG1lbnR8ZW50fG91fGlzbXxhdGV8aXRpfG91c3xpdmV8aXplKSQvLGo9L14oLis/KShzfHQpKGlvbikkLyxDPS9eKC4rPyllJC8sTj0vbGwkLyxfPW5ldyBSZWdFeHAoXCJeXCIraStyK1wiW15hZWlvdXd4eV0kXCIpLEE9ZnVuY3Rpb24obil7dmFyIHIsaSxvLHMsYSx1LGw7aWYobi5sZW5ndGg8MylyZXR1cm4gbjtpZihvPW4uc3Vic3RyKDAsMSksXCJ5XCI9PW8mJihuPW8udG9VcHBlckNhc2UoKStuLnN1YnN0cigxKSkscz1wLGE9dixzLnRlc3Qobik/bj1uLnJlcGxhY2UocyxcIiQxJDJcIik6YS50ZXN0KG4pJiYobj1uLnJlcGxhY2UoYSxcIiQxJDJcIikpLHM9eSxhPW0scy50ZXN0KG4pKXt2YXIgQT1zLmV4ZWMobik7cz1jLHMudGVzdChBWzFdKSYmKHM9ZyxuPW4ucmVwbGFjZShzLFwiXCIpKX1lbHNlIGlmKGEudGVzdChuKSl7dmFyIEE9YS5leGVjKG4pO3I9QVsxXSxhPWQsYS50ZXN0KHIpJiYobj1yLGE9dyx1PVMsbD1iLGEudGVzdChuKT9uKz1cImVcIjp1LnRlc3Qobik/KHM9ZyxuPW4ucmVwbGFjZShzLFwiXCIpKTpsLnRlc3QobikmJihuKz1cImVcIikpfWlmKHM9eCxzLnRlc3Qobikpe3ZhciBBPXMuZXhlYyhuKTtyPUFbMV0sbj1yK1wiaVwifWlmKHM9ayxzLnRlc3Qobikpe3ZhciBBPXMuZXhlYyhuKTtyPUFbMV0saT1BWzJdLHM9YyxzLnRlc3QocikmJihuPXIrdFtpXSl9aWYocz1FLHMudGVzdChuKSl7dmFyIEE9cy5leGVjKG4pO3I9QVsxXSxpPUFbMl0scz1jLHMudGVzdChyKSYmKG49citlW2ldKX1pZihzPU8sYT1qLHMudGVzdChuKSl7dmFyIEE9cy5leGVjKG4pO3I9QVsxXSxzPWYscy50ZXN0KHIpJiYobj1yKX1lbHNlIGlmKGEudGVzdChuKSl7dmFyIEE9YS5leGVjKG4pO3I9QVsxXStBWzJdLGE9ZixhLnRlc3QocikmJihuPXIpfWlmKHM9QyxzLnRlc3Qobikpe3ZhciBBPXMuZXhlYyhuKTtyPUFbMV0scz1mLGE9aCx1PV8sKHMudGVzdChyKXx8YS50ZXN0KHIpJiYhdS50ZXN0KHIpKSYmKG49cil9cmV0dXJuIHM9TixhPWYscy50ZXN0KG4pJiZhLnRlc3QobikmJihzPWcsbj1uLnJlcGxhY2UocyxcIlwiKSksXCJ5XCI9PW8mJihuPW8udG9Mb3dlckNhc2UoKStuLnN1YnN0cigxKSksbn07cmV0dXJuIEF9KCksZS5QaXBlbGluZS5yZWdpc3RlckZ1bmN0aW9uKGUuc3RlbW1lcixcInN0ZW1tZXJcIiksZS5nZW5lcmF0ZVN0b3BXb3JkRmlsdGVyPWZ1bmN0aW9uKHQpe3ZhciBlPXQucmVkdWNlKGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbZV09ZSx0fSx7fSk7cmV0dXJuIGZ1bmN0aW9uKHQpe3JldHVybiB0JiZlW3RdIT09dD90OnZvaWQgMH19LGUuc3RvcFdvcmRGaWx0ZXI9ZS5nZW5lcmF0ZVN0b3BXb3JkRmlsdGVyKFtcImFcIixcImFibGVcIixcImFib3V0XCIsXCJhY3Jvc3NcIixcImFmdGVyXCIsXCJhbGxcIixcImFsbW9zdFwiLFwiYWxzb1wiLFwiYW1cIixcImFtb25nXCIsXCJhblwiLFwiYW5kXCIsXCJhbnlcIixcImFyZVwiLFwiYXNcIixcImF0XCIsXCJiZVwiLFwiYmVjYXVzZVwiLFwiYmVlblwiLFwiYnV0XCIsXCJieVwiLFwiY2FuXCIsXCJjYW5ub3RcIixcImNvdWxkXCIsXCJkZWFyXCIsXCJkaWRcIixcImRvXCIsXCJkb2VzXCIsXCJlaXRoZXJcIixcImVsc2VcIixcImV2ZXJcIixcImV2ZXJ5XCIsXCJmb3JcIixcImZyb21cIixcImdldFwiLFwiZ290XCIsXCJoYWRcIixcImhhc1wiLFwiaGF2ZVwiLFwiaGVcIixcImhlclwiLFwiaGVyc1wiLFwiaGltXCIsXCJoaXNcIixcImhvd1wiLFwiaG93ZXZlclwiLFwiaVwiLFwiaWZcIixcImluXCIsXCJpbnRvXCIsXCJpc1wiLFwiaXRcIixcIml0c1wiLFwianVzdFwiLFwibGVhc3RcIixcImxldFwiLFwibGlrZVwiLFwibGlrZWx5XCIsXCJtYXlcIixcIm1lXCIsXCJtaWdodFwiLFwibW9zdFwiLFwibXVzdFwiLFwibXlcIixcIm5laXRoZXJcIixcIm5vXCIsXCJub3JcIixcIm5vdFwiLFwib2ZcIixcIm9mZlwiLFwib2Z0ZW5cIixcIm9uXCIsXCJvbmx5XCIsXCJvclwiLFwib3RoZXJcIixcIm91clwiLFwib3duXCIsXCJyYXRoZXJcIixcInNhaWRcIixcInNheVwiLFwic2F5c1wiLFwic2hlXCIsXCJzaG91bGRcIixcInNpbmNlXCIsXCJzb1wiLFwic29tZVwiLFwidGhhblwiLFwidGhhdFwiLFwidGhlXCIsXCJ0aGVpclwiLFwidGhlbVwiLFwidGhlblwiLFwidGhlcmVcIixcInRoZXNlXCIsXCJ0aGV5XCIsXCJ0aGlzXCIsXCJ0aXNcIixcInRvXCIsXCJ0b29cIixcInR3YXNcIixcInVzXCIsXCJ3YW50c1wiLFwid2FzXCIsXCJ3ZVwiLFwid2VyZVwiLFwid2hhdFwiLFwid2hlblwiLFwid2hlcmVcIixcIndoaWNoXCIsXCJ3aGlsZVwiLFwid2hvXCIsXCJ3aG9tXCIsXCJ3aHlcIixcIndpbGxcIixcIndpdGhcIixcIndvdWxkXCIsXCJ5ZXRcIixcInlvdVwiLFwieW91clwiXSksZS5QaXBlbGluZS5yZWdpc3RlckZ1bmN0aW9uKGUuc3RvcFdvcmRGaWx0ZXIsXCJzdG9wV29yZEZpbHRlclwiKSxlLnRyaW1tZXI9ZnVuY3Rpb24odCl7cmV0dXJuIHQucmVwbGFjZSgvXlxcVysvLFwiXCIpLnJlcGxhY2UoL1xcVyskLyxcIlwiKX0sZS5QaXBlbGluZS5yZWdpc3RlckZ1bmN0aW9uKGUudHJpbW1lcixcInRyaW1tZXJcIiksZS5Ub2tlblN0b3JlPWZ1bmN0aW9uKCl7dGhpcy5yb290PXtkb2NzOnt9fSx0aGlzLmxlbmd0aD0wfSxlLlRva2VuU3RvcmUubG9hZD1mdW5jdGlvbih0KXt2YXIgZT1uZXcgdGhpcztyZXR1cm4gZS5yb290PXQucm9vdCxlLmxlbmd0aD10Lmxlbmd0aCxlfSxlLlRva2VuU3RvcmUucHJvdG90eXBlLmFkZD1mdW5jdGlvbih0LGUsbil7dmFyIG49bnx8dGhpcy5yb290LHI9dC5jaGFyQXQoMCksaT10LnNsaWNlKDEpO3JldHVybiByIGluIG58fChuW3JdPXtkb2NzOnt9fSksMD09PWkubGVuZ3RoPyhuW3JdLmRvY3NbZS5yZWZdPWUsdm9pZCh0aGlzLmxlbmd0aCs9MSkpOnRoaXMuYWRkKGksZSxuW3JdKX0sZS5Ub2tlblN0b3JlLnByb3RvdHlwZS5oYXM9ZnVuY3Rpb24odCl7aWYoIXQpcmV0dXJuITE7Zm9yKHZhciBlPXRoaXMucm9vdCxuPTA7bjx0Lmxlbmd0aDtuKyspe2lmKCFlW3QuY2hhckF0KG4pXSlyZXR1cm4hMTtlPWVbdC5jaGFyQXQobildfXJldHVybiEwfSxlLlRva2VuU3RvcmUucHJvdG90eXBlLmdldE5vZGU9ZnVuY3Rpb24odCl7aWYoIXQpcmV0dXJue307Zm9yKHZhciBlPXRoaXMucm9vdCxuPTA7bjx0Lmxlbmd0aDtuKyspe2lmKCFlW3QuY2hhckF0KG4pXSlyZXR1cm57fTtlPWVbdC5jaGFyQXQobildfXJldHVybiBlfSxlLlRva2VuU3RvcmUucHJvdG90eXBlLmdldD1mdW5jdGlvbih0LGUpe3JldHVybiB0aGlzLmdldE5vZGUodCxlKS5kb2NzfHx7fX0sZS5Ub2tlblN0b3JlLnByb3RvdHlwZS5jb3VudD1mdW5jdGlvbih0LGUpe3JldHVybiBPYmplY3Qua2V5cyh0aGlzLmdldCh0LGUpKS5sZW5ndGh9LGUuVG9rZW5TdG9yZS5wcm90b3R5cGUucmVtb3ZlPWZ1bmN0aW9uKHQsZSl7aWYodCl7Zm9yKHZhciBuPXRoaXMucm9vdCxyPTA7cjx0Lmxlbmd0aDtyKyspe2lmKCEodC5jaGFyQXQocilpbiBuKSlyZXR1cm47bj1uW3QuY2hhckF0KHIpXX1kZWxldGUgbi5kb2NzW2VdfX0sZS5Ub2tlblN0b3JlLnByb3RvdHlwZS5leHBhbmQ9ZnVuY3Rpb24odCxlKXt2YXIgbj10aGlzLmdldE5vZGUodCkscj1uLmRvY3N8fHt9LGU9ZXx8W107cmV0dXJuIE9iamVjdC5rZXlzKHIpLmxlbmd0aCYmZS5wdXNoKHQpLE9iamVjdC5rZXlzKG4pLmZvckVhY2goZnVuY3Rpb24obil7XCJkb2NzXCIhPT1uJiZlLmNvbmNhdCh0aGlzLmV4cGFuZCh0K24sZSkpfSx0aGlzKSxlfSxlLlRva2VuU3RvcmUucHJvdG90eXBlLnRvSlNPTj1mdW5jdGlvbigpe3JldHVybntyb290OnRoaXMucm9vdCxsZW5ndGg6dGhpcy5sZW5ndGh9fSxmdW5jdGlvbihlLGkpe1wiZnVuY3Rpb25cIj09dHlwZW9mIHQmJnQuYW1kP3QoaSk6XCJvYmplY3RcIj09dHlwZW9mIHI/bi5leHBvcnRzPWkoKTplLmx1bnI9aSgpfSh0aGlzLGZ1bmN0aW9uKCl7cmV0dXJuIGV9KX0oKX0se31dLDEwOltmdW5jdGlvbih0LGUsbil7IWZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gZSh0KXt4PVMuZGVmYXVsdHModCxrKSxyKCksaSgpLG8oKSxhKHgudGVybXMpfWZ1bmN0aW9uIHIoKXt2YXIgdD1cImdsb3NzYXJ5LVwiK3gucG9zaXRpb247aWYoXCJzdHJpbmdcIj09dHlwZW9mIHgudGFyZ2V0KXgudGFyZ2V0PWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoeC50YXJnZXQpO2Vsc2UgaWYoIVMuaXNOb2RlKHgudGFyZ2V0KSl0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBwcm92aWRlIGEgRE9NIG5vZGUgb3IgQ1NTIHNlbGVjdG9yIHRvIGFwcGVuZCB0aGUgY29udGFpbmVyXCIpO3guY29udGFpbmVyPVMuY3JlYXRlKFwiYXNpZGVcIix4LmNvbnRhaW5lckNsYXNzLHgudGFyZ2V0KSxTLmFkZENsYXNzKHguY29udGFpbmVyLHQpLHguaW5wdXQ9Uy5jcmVhdGUoXCJpbnB1dFwiLFwiZ2xvc3Nhcnktc2VhcmNoXCIseC5jb250YWluZXIpLHguaW5wdXQuc2V0QXR0cmlidXRlKFwidHlwZVwiLFwic2VhcmNoXCIpLHguY2xvc2U9Uy5jcmVhdGUoXCJidXR0b25cIixcIlwiLHguY29udGFpbmVyKSx4LmNsb3NlLmlubmVySFRNTD14LmNsb3NlVGV4dCx4Lmxpc3Q9Uy5jcmVhdGUoXCJvbFwiLFwiZ2xvc3NhcnktbGlzdFwiLHguY29udGFpbmVyKSx4LnRhcmdldC5hcHBlbmRDaGlsZCh4LmNvbnRhaW5lcikseC5hY3RpdmUmJmQoKX1mdW5jdGlvbiBpKCl7Zz13KHgubHVuckluZGV4KSx4LnRlcm1zLmZvckVhY2goZnVuY3Rpb24odCxlKXtnLmFkZCh7aWQ6ZSxuYW1lOnQubmFtZSxkZXNjcmlwdGlvbjp0LmRlc2NyaXB0aW9uLHJlbGF0ZWQ6SlNPTi5zdHJpbmdpZnkodC5yZWxhdGVkKX0pfSl9ZnVuY3Rpb24gbygpe3guaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsbCkseC5saXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLGYpLHguY2xvc2UuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIscCksZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIixjKSxkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLGgpfWZ1bmN0aW9uIHMoKXt4LmlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLGwpLHgubGlzdC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIixmKSx4LmNsb3NlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHApLGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsYyksZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5dXBcIixoKSxTLnJlbW92ZSh4LmNvbnRhaW5lcil9ZnVuY3Rpb24gYSh0KXt4Lmxpc3QuaW5uZXJIVE1MPWIoe3Rlcm1zOnR9KX1mdW5jdGlvbiB1KHQpe3ZhciBlPVtdO3JldHVybiBnLnNlYXJjaCh0KS5mb3JFYWNoKGZ1bmN0aW9uKHQpe2UucHVzaCh4LnRlcm1zW3QucmVmXSl9KSxlfWZ1bmN0aW9uIGwoKXt2YXIgdD14LmlucHV0LnZhbHVlOzA9PT10Lmxlbmd0aCYmYSh4LnRlcm1zKSx0Lmxlbmd0aDx4Lm1pbkxlbmd0aHx8YSh1KHQpKX1mdW5jdGlvbiBjKHQpe3ZhciBlPVMuaGFzQ2xhc3ModC50YXJnZXQseC50b2dnbGVDbGFzcyk7ZSYmKHkodC50YXJnZXQudGV4dENvbnRlbnQpLHYoKSl9ZnVuY3Rpb24gZih0KXt2YXIgZT1TLmhhc0NsYXNzKHQudGFyZ2V0LFwicmVsYXRlZC10ZXJtXCIpLG49dC50YXJnZXQuaW5uZXJIVE1MO2UmJih4LmlucHV0LnZhbHVlPW4sYSh1KG4pKSl9ZnVuY3Rpb24gaCh0KXt2YXIgZT10LndoaWNofHx0LmtleUNvZGV8fDA7Mjc9PT1lJiZwKCl9ZnVuY3Rpb24gZCgpe3guYWN0aXZlPSEwLFMuYWRkQ2xhc3MoeC5jb250YWluZXIseC5hY3RpdmVDbGFzcykseC5pbnB1dC5mb2N1cygpfWZ1bmN0aW9uIHAoKXt4LmFjdGl2ZT0hMSxTLnJlbW92ZUNsYXNzKHguY29udGFpbmVyLHguYWN0aXZlQ2xhc3MpfWZ1bmN0aW9uIHYoKXt4LmFjdGl2ZT9wKCk6ZCgpfWZ1bmN0aW9uIHkodCl7eC5pbnB1dC52YWx1ZT10LGEodSh0KSl9ZnVuY3Rpb24gbSh0KXtpZih4W3RdKXJldHVybiB4W3RdO3Rocm93IG5ldyBFcnJvcihcIk9wdGlvbiBbXCIrdCtcIl0gZG9lcyBub3QgZXhpc3RcIil9dmFyIGcsdz10KFwibHVuclwiKSxTPXQoXCIuL3V0aWxcIiksYj10KFwiLi90ZW1wbGF0ZXMvdGVybS5qYWRlXCIpLHg9e30saz17YWN0aXZlOiExLGFjdGl2ZUNsYXNzOlwiYWN0aXZlXCIsdGFyZ2V0OmRvY3VtZW50LmJvZHksdG9nZ2xlQ2xhc3M6XCJnbG9zc2FyeS10b2dnbGVcIixjb250YWluZXJDbGFzczpcImdsb3NzYXJ5LWNvbnRhaW5lclwiLGNsb3NlVGV4dDpcIkNsb3NlXCIscG9zaXRpb246XCJyaWdodFwiLHRlcm1zOltdLG1pbkxlbmd0aDoyfTtuLmluaXQ9ZSxuLmRlc3Ryb3k9cyxuLnNob3c9ZCxuLmhpZGU9cCxuLnRvZ2dsZT12LG4uc2V0VmFsdWU9eSxuLl9nZXRPcHRpb249bX0oKX0se1wiLi90ZW1wbGF0ZXMvdGVybS5qYWRlXCI6MTEsXCIuL3V0aWxcIjoxMixsdW5yOjl9XSwxMTpbZnVuY3Rpb24odCxlKXt2YXIgbj10KFwiamFkZS9ydW50aW1lXCIpO2UuZXhwb3J0cz1mdW5jdGlvbih0KXt2YXIgZSxyPVtdLGk9dHx8e307cmV0dXJuIGZ1bmN0aW9uKHQpeyhmdW5jdGlvbigpe3ZhciBpPXQ7aWYoXCJudW1iZXJcIj09dHlwZW9mIGkubGVuZ3RoKWZvcih2YXIgbz0wLHM9aS5sZW5ndGg7cz5vO28rKyl7dmFyIGE9aVtvXTtyLnB1c2goJzxsaSBjbGFzcz1cImdsb3NzYXJ5LXRlcm1cIj48aDI+JytuLmVzY2FwZShudWxsPT0oZT1hLm5hbWUpP1wiXCI6ZSkrXCI8L2gyPjxwPlwiKyhudWxsPT0oZT1hLmRlc2NyaXB0aW9uKT9cIlwiOmUpKyc8L3A+PHVsIGNsYXNzPVwiZ2xvc3NhcnktcmVsYXRlZC10ZXJtc1wiPicpLGZ1bmN0aW9uKCl7dmFyIHQ9YS5yZWxhdGVkO2lmKFwibnVtYmVyXCI9PXR5cGVvZiB0Lmxlbmd0aClmb3IodmFyIGk9MCxvPXQubGVuZ3RoO28+aTtpKyspe3ZhciBzPXRbaV07ci5wdXNoKCc8bGkgY2xhc3M9XCJyZWxhdGVkLXRlcm1cIj4nK24uZXNjYXBlKG51bGw9PShlPXMpP1wiXCI6ZSkrXCI8L2xpPlwiKX1lbHNle3ZhciBvPTA7Zm9yKHZhciBpIGluIHQpe28rKzt2YXIgcz10W2ldO3IucHVzaCgnPGxpIGNsYXNzPVwicmVsYXRlZC10ZXJtXCI+JytuLmVzY2FwZShudWxsPT0oZT1zKT9cIlwiOmUpK1wiPC9saT5cIil9fX0uY2FsbCh0aGlzKSxyLnB1c2goXCI8L3VsPjwvbGk+XCIpfWVsc2V7dmFyIHM9MDtmb3IodmFyIG8gaW4gaSl7cysrO3ZhciBhPWlbb107ci5wdXNoKCc8bGkgY2xhc3M9XCJnbG9zc2FyeS10ZXJtXCI+PGgyPicrbi5lc2NhcGUobnVsbD09KGU9YS5uYW1lKT9cIlwiOmUpK1wiPC9oMj48cD5cIisobnVsbD09KGU9YS5kZXNjcmlwdGlvbik/XCJcIjplKSsnPC9wPjx1bCBjbGFzcz1cImdsb3NzYXJ5LXJlbGF0ZWQtdGVybXNcIj4nKSxmdW5jdGlvbigpe3ZhciB0PWEucmVsYXRlZDtpZihcIm51bWJlclwiPT10eXBlb2YgdC5sZW5ndGgpZm9yKHZhciBpPTAsbz10Lmxlbmd0aDtvPmk7aSsrKXt2YXIgcz10W2ldO3IucHVzaCgnPGxpIGNsYXNzPVwicmVsYXRlZC10ZXJtXCI+JytuLmVzY2FwZShudWxsPT0oZT1zKT9cIlwiOmUpK1wiPC9saT5cIil9ZWxzZXt2YXIgbz0wO2Zvcih2YXIgaSBpbiB0KXtvKys7dmFyIHM9dFtpXTtyLnB1c2goJzxsaSBjbGFzcz1cInJlbGF0ZWQtdGVybVwiPicrbi5lc2NhcGUobnVsbD09KGU9cyk/XCJcIjplKStcIjwvbGk+XCIpfX19LmNhbGwodGhpcyksci5wdXNoKFwiPC91bD48L2xpPlwiKX19fSkuY2FsbCh0aGlzKX0uY2FsbCh0aGlzLFwidGVybXNcImluIGk/aS50ZXJtczpcInVuZGVmaW5lZFwiIT10eXBlb2YgdGVybXM/dGVybXM6dm9pZCAwLFwidW5kZWZpbmVkXCJpbiBpP2kudW5kZWZpbmVkOnZvaWQgMCksci5qb2luKFwiXCIpfX0se1wiamFkZS9ydW50aW1lXCI6M31dLDEyOltmdW5jdGlvbih0LGUpeyFmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2UuZXhwb3J0cz17ZGVmYXVsdHM6dChcImxvZGFzaC5kZWZhdWx0c1wiKSxpc0FycmF5OnQoXCJsb2Rhc2guaXNBcnJheVwiKSxpc05vZGU6dChcImlzLWRvbVwiKSxjcmVhdGU6ZnVuY3Rpb24odCxlLG4pe3ZhciByPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodCk7cmV0dXJuIHIuY2xhc3NOYW1lPWUsbiYmbi5hcHBlbmRDaGlsZChyKSxyfSxyZW1vdmU6ZnVuY3Rpb24odCl7dmFyIGU9dC5wYXJlbnROb2RlO2UmJmUucmVtb3ZlQ2hpbGQodCl9LGhhc0NsYXNzOmZ1bmN0aW9uKHQsZSl7aWYodm9pZCAwIT09dC5jbGFzc0xpc3QpcmV0dXJuIHQuY2xhc3NMaXN0LmNvbnRhaW5zKGUpO3ZhciBuPXRoaXMuZ2V0Q2xhc3ModCk7cmV0dXJuIG4ubGVuZ3RoPjAmJm5ldyBSZWdFeHAoXCIoXnxcXFxccylcIitlK1wiKFxcXFxzfCQpXCIpLnRlc3Qobil9LGFkZENsYXNzOmZ1bmN0aW9uKHQsZSl7aWYodm9pZCAwIT09dC5jbGFzc0xpc3QpZm9yKHZhciBuPXRoaXMuc3BsaXRXb3JkcyhlKSxyPTAsaT1uLmxlbmd0aDtpPnI7cisrKXQuY2xhc3NMaXN0LmFkZChuW3JdKTtlbHNlIGlmKCF0aGlzLmhhc0NsYXNzKHQsZSkpe3ZhciBvPXRoaXMuZ2V0Q2xhc3ModCk7dGhpcy5zZXRDbGFzcyh0LChvP28rXCIgXCI6XCJcIikrZSl9fSxyZW1vdmVDbGFzczpmdW5jdGlvbih0LGUpe3ZvaWQgMCE9PXQuY2xhc3NMaXN0P3QuY2xhc3NMaXN0LnJlbW92ZShlKTp0aGlzLnNldENsYXNzKHQsdHJpbSgoXCIgXCIrdGhpcy5nZXRDbGFzcyh0KStcIiBcIikucmVwbGFjZShcIiBcIitlK1wiIFwiLFwiIFwiKSkpfSxzZXRDbGFzczpmdW5jdGlvbih0LGUpe3ZvaWQgMD09PXQuY2xhc3NOYW1lLmJhc2VWYWw/dC5jbGFzc05hbWU9ZTp0LmNsYXNzTmFtZS5iYXNlVmFsPWV9LHNwbGl0V29yZHM6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMudHJpbSh0KS5zcGxpdCgvXFxzKy8pfSx0cmltOmZ1bmN0aW9uKHQpe3JldHVybiB0LnRyaW0/dC50cmltKCk6dC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLFwiXCIpfSxnZXRDbGFzczpmdW5jdGlvbih0KXtyZXR1cm4gdm9pZCAwPT09dC5jbGFzc05hbWUuYmFzZVZhbD90LmNsYXNzTmFtZTp0LmNsYXNzTmFtZS5iYXNlVmFsfX19KCl9LHtcImlzLWRvbVwiOjIsXCJsb2Rhc2guZGVmYXVsdHNcIjo1LFwibG9kYXNoLmlzQXJyYXlcIjo2fV19LHt9LFsxMF0pKDEwKX0pOyIsIi8vIEFkYXB0ZWQgZnJvbTogaHR0cHM6Ly9naXRodWIuY29tL2tub3duYXNpbHlhL2pxdWVyeS1oaWdobGlnaHRcbihmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgXyA9IHtcbiAgICBlYWNoOiByZXF1aXJlKCdsb2Rhc2guZm9yRWFjaCcpLFxuICAgIGlzQXJyYXk6IHJlcXVpcmUoJ2xvZGFzaC5pc0FycmF5JyksXG4gICAgZGVmYXVsdHM6IHJlcXVpcmUoJ2xvZGFzaC5kZWZhdWx0cycpLFxuICAgIGZpbHRlcjogcmVxdWlyZSgnbG9kYXNoLmZpbHRlcicpLFxuICAgIG1hcDogcmVxdWlyZSgnbG9kYXNoLm1hcCcpXG4gIH07XG5cbiAgdmFyIG9wdGlvbnM7XG5cbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGNvbnRlbnQ6IGRvY3VtZW50LmJvZHksXG4gICAgY2xhc3M6ICdoaWdobGlnaHQnLFxuICAgIHRhZzogJ3NwYW4nLFxuICAgIHNraXBUYWdzOiAvKGF8aDF8aDJ8aDN8aDR8aDV8aDZ8c2NyaXB0fGZvcm18c3R5bGUpL2ksXG4gICAgY2FzZVNlbnNpdGl2ZTogZmFsc2UsXG4gICAgd29yZHNPbmx5OiBmYWxzZSxcbiAgICB3b3Jkc0JvdW5kYXJ5OiAnXFxcXGInXG4gIH07XG5cbiAgZnVuY3Rpb24gaW5pdChvcHRzKSB7XG4gICAgb3B0aW9ucyA9IF8uZGVmYXVsdHMob3B0cywgZGVmYXVsdHMpO1xuICAgIGlmICggIV8uaXNBcnJheShvcHRpb25zLndvcmRzKSApXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IHByb3ZpZGUgYW4gYXJyYXkgb2YgdGVybXMgdG8gaGlnaGxpZ2h0LicpO1xuICAgIGJ1aWxkUmVnRXgoKTtcbiAgICBoaWdobGlnaHQob3B0aW9ucy5jb250ZW50LCBvcHRpb25zLnJlZ2V4LCBvcHRpb25zLnRhZywgb3B0aW9ucy5jbGFzcyk7XG4gIH1cblxuICBmdW5jdGlvbiBidWlsZFJlZ0V4KCkge1xuICAgIG9wdGlvbnMud29yZHMgPSBfLmZpbHRlcihvcHRpb25zLndvcmRzLCAgZnVuY3Rpb24od29yZCl7XG4gICAgICByZXR1cm4gd29yZCAhPT0gJyc7XG4gICAgfSk7XG5cbiAgICBvcHRpb25zLndvcmRzID0gXy5tYXAob3B0aW9ucy53b3JkcywgZnVuY3Rpb24od29yZCkge1xuICAgICAgcmV0dXJuIHdvcmQucmVwbGFjZSgvWy1bXFxde30oKSorPy4sXFxcXF4kfCNcXHNdL2csICdcXFxcJCYnKTtcbiAgICB9KTtcblxuICAgIHZhciBmbGFnID0gb3B0aW9ucy5jYXNlU2Vuc2l0aXZlID8gJycgOiAnaSc7XG4gICAgLy8gVGhlIGNhcHR1cmUgcGFyZW50aGVzaXMgd2lsbCBtYWtlIHN1cmUgd2UgY2FuIG1hdGNoIG9ubHkgdGhlIG1hdGNoaW5nIHdvcmRcbiAgICB2YXIgcGF0dGVybiA9ICcoJyArIG9wdGlvbnMud29yZHMuam9pbignfCcpICsgJyknO1xuICAgIGlmIChvcHRpb25zLndvcmRzT25seSkge1xuICAgICAgIHBhdHRlcm4gPSBvcHRpb25zLndvcmRzQm91bmRhcnkgKyBwYXR0ZXJuICsgb3B0aW9ucy53b3Jkc0JvdW5kYXJ5O1xuICAgIH1cbiAgICBvcHRpb25zLnJlZ2V4ID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBmbGFnKTtcbiAgfVxuXG4gIC8vIHJlY3Vyc2l2ZWx5IGFwcGx5IHdvcmQgaGlnaGxpZ2h0aW5nXG4gIGZ1bmN0aW9uIGhpZ2hsaWdodChub2RlLCByZSwgbm9kZU5hbWUsIGNsYXNzTmFtZSkge1xuICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICB2YXIgbWF0Y2ggPSBub2RlLmRhdGEubWF0Y2gocmUpO1xuICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIC8vIFRoZSBuZXcgaGlnaGxpZ2h0IEVsZW1lbnQgTm9kZVxuICAgICAgICB2YXIgaGlnaGxpZ2h0ZWRUZXJtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChvcHRpb25zLnRhZyk7XG4gICAgICAgIGhpZ2hsaWdodGVkVGVybS5jbGFzc05hbWUgPSBvcHRpb25zLmNsYXNzO1xuICAgICAgICAvLyBOb3RlIHRoYXQgd2UgdXNlIHRoZSBjYXB0dXJlZCB2YWx1ZSB0byBmaW5kIHRoZSByZWFsIGluZGV4XG4gICAgICAgIC8vIG9mIHRoZSBtYXRjaC4gVGhpcyBpcyBiZWNhdXNlIHdlIGRvIG5vdCB3YW50IHRvIGluY2x1ZGUgdGhlIG1hdGNoaW5nIHdvcmQgYm91bmRhcmllc1xuICAgICAgICB2YXIgY2FwdHVyZVBvcyA9IG5vZGUuZGF0YS5pbmRleE9mKCBtYXRjaFsxXSAsIG1hdGNoLmluZGV4ICk7XG5cbiAgICAgICAgLy8gU3BsaXQgdGhlIG5vZGUgYW5kIHJlcGxhY2UgdGhlIG1hdGNoaW5nIHdvcmRub2RlXG4gICAgICAgIC8vIHdpdGggdGhlIGhpZ2hsaWdodGVkIG5vZGVcbiAgICAgICAgdmFyIHdvcmROb2RlID0gbm9kZS5zcGxpdFRleHQoY2FwdHVyZVBvcyk7XG4gICAgICAgIHdvcmROb2RlLnNwbGl0VGV4dChtYXRjaFsxXS5sZW5ndGgpO1xuXG4gICAgICAgIHZhciB3b3JkQ2xvbmUgPSB3b3JkTm9kZS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIGhpZ2hsaWdodGVkVGVybS5hcHBlbmRDaGlsZCh3b3JkQ2xvbmUpO1xuICAgICAgICB3b3JkTm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChoaWdobGlnaHRlZFRlcm0sIHdvcmROb2RlKTtcbiAgICAgICAgcmV0dXJuIDE7IC8vc2tpcCBhZGRlZCBub2RlIGluIHBhcmVudFxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIChub2RlLm5vZGVUeXBlID09PSAxICYmIG5vZGUuY2hpbGROb2RlcykgJiYgLy8gb25seSBlbGVtZW50IG5vZGVzIHRoYXQgaGF2ZSBjaGlsZHJlblxuICAgICAgIW9wdGlvbnMuc2tpcFRhZ3MudGVzdChub2RlLnRhZ05hbWUpICYmIC8vIGlnbm9yZSBzY3JpcHQsIHN0eWxlLCBhbmQgZm9ybSBub2Rlc1xuICAgICAgIShub2RlLnRhZ05hbWUgPT09IG5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgJiYgbm9kZS5jbGFzc05hbWUgPT09IG9wdGlvbnMuY2xhc3MpKSB7IC8vIHNraXAgaWYgYWxyZWFkeSBoaWdobGlnaHRlZFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2RlLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaSArPSBoaWdobGlnaHQobm9kZS5jaGlsZE5vZGVzW2ldLCByZSwgbm9kZU5hbWUsIGNsYXNzTmFtZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5oaWdobGlnaHQoKSB7XG4gICAgdmFyIGhpZ2hsaWdodGVkVGVybXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuJyArIG9wdGlvbnMuY2xhc3MpO1xuXG4gICAgXy5lYWNoKGhpZ2hsaWdodGVkVGVybXMsIGZ1bmN0aW9uICh0ZXJtKSB7XG4gICAgICB2YXIgcGFyZW50ID0gdGVybS5wYXJlbnROb2RlO1xuICAgICAgcGFyZW50LnJlcGxhY2VDaGlsZCh0ZXJtLmZpcnN0Q2hpbGQsIHRlcm0pO1xuICAgICAgcGFyZW50Lm5vcm1hbGl6ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgbW9kdWxlLmV4cG9ydHMuaW5pdCA9IGluaXQ7XG4gIG1vZHVsZS5leHBvcnRzLmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcbiAgbW9kdWxlLmV4cG9ydHMudW5oaWdobGlnaHQgPSB1bmhpZ2hsaWdodDtcbn0pKCk7XG4iLCIhZnVuY3Rpb24odCl7aWYoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGUpbW9kdWxlLmV4cG9ydHM9dCgpO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShbXSx0KTtlbHNle3ZhciBlO2U9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGY/c2VsZjp0aGlzLGUuTWVudT10KCl9fShmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbiB0KGUsbixyKXtmdW5jdGlvbiBvKGksYSl7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFhJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKHQpe3ZhciBuPWVbaV1bMV1bdF07cmV0dXJuIG8obj9uOnQpfSxsLGwuZXhwb3J0cyx0LGUsbixyKX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHIubGVuZ3RoO2krKylvKHJbaV0pO3JldHVybiBvfSh7MTpbZnVuY3Rpb24odCxlKXtlLmV4cG9ydHM9ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwib2JqZWN0XCI9PXR5cGVvZiB0P3dpbmRvdyYmXCJvYmplY3RcIj09dHlwZW9mIHdpbmRvdy5Ob2RlP3QgaW5zdGFuY2VvZiB3aW5kb3cuTm9kZTpcIm51bWJlclwiPT10eXBlb2YgdC5ub2RlVHlwZSYmXCJzdHJpbmdcIj09dHlwZW9mIHQubm9kZU5hbWU6ITF9fSx7fV0sMjpbZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBuKHQsZSl7Zm9yKHZhciBuPS0xLHI9QXJyYXkodCk7KytuPHQ7KXJbbl09ZShuKTtyZXR1cm4gcn1mdW5jdGlvbiByKHQsZSl7cmV0dXJuIHQmJkkodCxlLHcpfWZ1bmN0aW9uIG8odCxlKXtyZXR1cm4gay5jYWxsKHQsZSl8fFwib2JqZWN0XCI9PXR5cGVvZiB0JiZlIGluIHQmJm51bGw9PT1mKHQpfWZ1bmN0aW9uIHUodCl7cmV0dXJuICQoT2JqZWN0KHQpKX1mdW5jdGlvbiBpKHQpe3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gbnVsbD09ZT92b2lkIDA6ZVt0XX19ZnVuY3Rpb24gYSh0LGUpe3JldHVybiBmdW5jdGlvbihuLHIpe2lmKG51bGw9PW4pcmV0dXJuIG47aWYoIXYobikpcmV0dXJuIHQobixyKTtmb3IodmFyIG89bi5sZW5ndGgsdT1lP286LTEsaT1PYmplY3Qobik7KGU/dS0tOisrdTxvKSYmcihpW3VdLHUsaSkhPT0hMTspO3JldHVybiBufX1mdW5jdGlvbiBjKHQpe3JldHVybiBmdW5jdGlvbihlLG4scil7Zm9yKHZhciBvPS0xLHU9T2JqZWN0KGUpLGk9cihlKSxhPWkubGVuZ3RoO2EtLTspe3ZhciBjPWlbdD9hOisrb107aWYobih1W2NdLGMsdSk9PT0hMSlicmVha31yZXR1cm4gZX19ZnVuY3Rpb24gZih0KXtyZXR1cm4gRihPYmplY3QodCkpfWZ1bmN0aW9uIGwodCl7dmFyIGU9dD90Lmxlbmd0aDp2b2lkIDA7cmV0dXJuIGIoZSkmJihNKHQpfHxtKHQpfHxkKHQpKT9uKGUsU3RyaW5nKTpudWxsfWZ1bmN0aW9uIHModCxlKXtyZXR1cm4gZT1udWxsPT1lP2o6ZSwhIWUmJihcIm51bWJlclwiPT10eXBlb2YgdHx8QS50ZXN0KHQpKSYmdD4tMSYmdCUxPT0wJiZlPnR9ZnVuY3Rpb24gcCh0KXt2YXIgZT10JiZ0LmNvbnN0cnVjdG9yLG49XCJmdW5jdGlvblwiPT10eXBlb2YgZSYmZS5wcm90b3R5cGV8fEU7cmV0dXJuIHQ9PT1ufWZ1bmN0aW9uIGQodCl7cmV0dXJuIGgodCkmJmsuY2FsbCh0LFwiY2FsbGVlXCIpJiYoIUwuY2FsbCh0LFwiY2FsbGVlXCIpfHxOLmNhbGwodCk9PUMpfWZ1bmN0aW9uIHYodCl7cmV0dXJuIG51bGwhPXQmJmIoVCh0KSkmJiF5KHQpfWZ1bmN0aW9uIGgodCl7cmV0dXJuIF8odCkmJnYodCl9ZnVuY3Rpb24geSh0KXt2YXIgZT1nKHQpP04uY2FsbCh0KTpcIlwiO3JldHVybiBlPT1PfHxlPT14fWZ1bmN0aW9uIGIodCl7cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIHQmJnQ+LTEmJnQlMT09MCYmaj49dH1mdW5jdGlvbiBnKHQpe3ZhciBlPXR5cGVvZiB0O3JldHVybiEhdCYmKFwib2JqZWN0XCI9PWV8fFwiZnVuY3Rpb25cIj09ZSl9ZnVuY3Rpb24gXyh0KXtyZXR1cm4hIXQmJlwib2JqZWN0XCI9PXR5cGVvZiB0fWZ1bmN0aW9uIG0odCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHR8fCFNKHQpJiZfKHQpJiZOLmNhbGwodCk9PVN9ZnVuY3Rpb24gdyh0KXt2YXIgZT1wKHQpO2lmKCFlJiYhdih0KSlyZXR1cm4gdSh0KTt2YXIgbj1sKHQpLHI9ISFuLGk9bnx8W10sYT1pLmxlbmd0aDtmb3IodmFyIGMgaW4gdCkhbyh0LGMpfHxyJiYoXCJsZW5ndGhcIj09Y3x8cyhjLGEpKXx8ZSYmXCJjb25zdHJ1Y3RvclwiPT1jfHxpLnB1c2goYyk7cmV0dXJuIGl9dmFyIGo9OTAwNzE5OTI1NDc0MDk5MSxDPVwiW29iamVjdCBBcmd1bWVudHNdXCIsTz1cIltvYmplY3QgRnVuY3Rpb25dXCIseD1cIltvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dXCIsUz1cIltvYmplY3QgU3RyaW5nXVwiLEE9L14oPzowfFsxLTldXFxkKikkLyxFPU9iamVjdC5wcm90b3R5cGUsaz1FLmhhc093blByb3BlcnR5LE49RS50b1N0cmluZyxMPUUucHJvcGVydHlJc0VudW1lcmFibGUsRj1PYmplY3QuZ2V0UHJvdG90eXBlT2YsJD1PYmplY3Qua2V5cyxxPWEociksST1jKCksVD1pKFwibGVuZ3RoXCIpLE09QXJyYXkuaXNBcnJheTtlLmV4cG9ydHM9cX0se31dLDM6W2Z1bmN0aW9uKHQsZSxuKXsoZnVuY3Rpb24ocil7ZnVuY3Rpb24gbyh0LGUpe2Zvcih2YXIgbj0tMSxyPXQubGVuZ3RoLG89QXJyYXkocik7KytuPHI7KW9bbl09ZSh0W25dLG4sdCk7cmV0dXJuIG99ZnVuY3Rpb24gdSh0LGUpe2Zvcih2YXIgbj0tMSxyPXQubGVuZ3RoOysrbjxyOylpZihlKHRbbl0sbix0KSlyZXR1cm4hMDtyZXR1cm4hMX1mdW5jdGlvbiBpKHQsZSl7Zm9yKHZhciBuPS0xLHI9QXJyYXkodCk7KytuPHQ7KXJbbl09ZShuKTtyZXR1cm4gcn1mdW5jdGlvbiBhKHQsZSl7cmV0dXJuIG8oZSxmdW5jdGlvbihlKXtyZXR1cm5bZSx0W2VdXX0pfWZ1bmN0aW9uIGModCl7cmV0dXJuIHQmJnQuT2JqZWN0PT09T2JqZWN0P3Q6bnVsbH1mdW5jdGlvbiBmKHQpe3ZhciBlPSExO2lmKG51bGwhPXQmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIHQudG9TdHJpbmcpdHJ5e2U9ISEodCtcIlwiKX1jYXRjaChuKXt9cmV0dXJuIGV9ZnVuY3Rpb24gbCh0KXt2YXIgZT0tMSxuPUFycmF5KHQuc2l6ZSk7cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0LHIpe25bKytlXT1bcix0XX0pLG59ZnVuY3Rpb24gcyh0KXt2YXIgZT0tMSxuPUFycmF5KHQuc2l6ZSk7cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0KXtuWysrZV09dH0pLG59ZnVuY3Rpb24gcCh0KXt2YXIgZT0tMSxuPUFycmF5KHQuc2l6ZSk7cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0KXtuWysrZV09W3QsdF19KSxufWZ1bmN0aW9uIGQodCl7dmFyIGU9LTEsbj10P3QubGVuZ3RoOjA7Zm9yKHRoaXMuY2xlYXIoKTsrK2U8bjspe3ZhciByPXRbZV07dGhpcy5zZXQoclswXSxyWzFdKX19ZnVuY3Rpb24gdigpe3RoaXMuX19kYXRhX189V2U/V2UobnVsbCk6e319ZnVuY3Rpb24gaCh0KXtyZXR1cm4gdGhpcy5oYXModCkmJmRlbGV0ZSB0aGlzLl9fZGF0YV9fW3RdfWZ1bmN0aW9uIHkodCl7dmFyIGU9dGhpcy5fX2RhdGFfXztpZihXZSl7dmFyIG49ZVt0XTtyZXR1cm4gbj09PVB0P3ZvaWQgMDpufXJldHVybiAkZS5jYWxsKGUsdCk/ZVt0XTp2b2lkIDB9ZnVuY3Rpb24gYih0KXt2YXIgZT10aGlzLl9fZGF0YV9fO3JldHVybiBXZT92b2lkIDAhPT1lW3RdOiRlLmNhbGwoZSx0KX1mdW5jdGlvbiBnKHQsZSl7dmFyIG49dGhpcy5fX2RhdGFfXztyZXR1cm4gblt0XT1XZSYmdm9pZCAwPT09ZT9QdDplLHRoaXN9ZnVuY3Rpb24gXyh0KXt2YXIgZT0tMSxuPXQ/dC5sZW5ndGg6MDtmb3IodGhpcy5jbGVhcigpOysrZTxuOyl7dmFyIHI9dFtlXTt0aGlzLnNldChyWzBdLHJbMV0pfX1mdW5jdGlvbiBtKCl7dGhpcy5fX2RhdGFfXz1bXX1mdW5jdGlvbiB3KHQpe3ZhciBlPXRoaXMuX19kYXRhX18sbj1EKGUsdCk7aWYoMD5uKXJldHVybiExO3ZhciByPWUubGVuZ3RoLTE7cmV0dXJuIG49PXI/ZS5wb3AoKTpVZS5jYWxsKGUsbiwxKSwhMH1mdW5jdGlvbiBqKHQpe3ZhciBlPXRoaXMuX19kYXRhX18sbj1EKGUsdCk7cmV0dXJuIDA+bj92b2lkIDA6ZVtuXVsxXX1mdW5jdGlvbiBDKHQpe3JldHVybiBEKHRoaXMuX19kYXRhX18sdCk+LTF9ZnVuY3Rpb24gTyh0LGUpe3ZhciBuPXRoaXMuX19kYXRhX18scj1EKG4sdCk7cmV0dXJuIDA+cj9uLnB1c2goW3QsZV0pOm5bcl1bMV09ZSx0aGlzfWZ1bmN0aW9uIHgodCl7dmFyIGU9LTEsbj10P3QubGVuZ3RoOjA7Zm9yKHRoaXMuY2xlYXIoKTsrK2U8bjspe3ZhciByPXRbZV07dGhpcy5zZXQoclswXSxyWzFdKX19ZnVuY3Rpb24gUygpe3RoaXMuX19kYXRhX189e2hhc2g6bmV3IGQsbWFwOm5ldyh6ZXx8Xyksc3RyaW5nOm5ldyBkfX1mdW5jdGlvbiBBKHQpe3JldHVybiBvdCh0aGlzLHQpW1wiZGVsZXRlXCJdKHQpfWZ1bmN0aW9uIEUodCl7cmV0dXJuIG90KHRoaXMsdCkuZ2V0KHQpfWZ1bmN0aW9uIGsodCl7cmV0dXJuIG90KHRoaXMsdCkuaGFzKHQpfWZ1bmN0aW9uIE4odCxlKXtyZXR1cm4gb3QodGhpcyx0KS5zZXQodCxlKSx0aGlzfWZ1bmN0aW9uIEwodCl7dmFyIGU9LTEsbj10P3QubGVuZ3RoOjA7Zm9yKHRoaXMuX19kYXRhX189bmV3IHg7KytlPG47KXRoaXMuYWRkKHRbZV0pfWZ1bmN0aW9uIEYodCl7cmV0dXJuIHRoaXMuX19kYXRhX18uc2V0KHQsUHQpLHRoaXN9ZnVuY3Rpb24gJCh0KXtyZXR1cm4gdGhpcy5fX2RhdGFfXy5oYXModCl9ZnVuY3Rpb24gcSh0KXt0aGlzLl9fZGF0YV9fPW5ldyBfKHQpfWZ1bmN0aW9uIEkoKXt0aGlzLl9fZGF0YV9fPW5ldyBffWZ1bmN0aW9uIFQodCl7cmV0dXJuIHRoaXMuX19kYXRhX19bXCJkZWxldGVcIl0odCl9ZnVuY3Rpb24gTSh0KXtyZXR1cm4gdGhpcy5fX2RhdGFfXy5nZXQodCl9ZnVuY3Rpb24gUCh0KXtyZXR1cm4gdGhpcy5fX2RhdGFfXy5oYXModCl9ZnVuY3Rpb24gVSh0LGUpe3ZhciBuPXRoaXMuX19kYXRhX187cmV0dXJuIG4gaW5zdGFuY2VvZiBfJiZuLl9fZGF0YV9fLmxlbmd0aD09TXQmJihuPXRoaXMuX19kYXRhX189bmV3IHgobi5fX2RhdGFfXykpLG4uc2V0KHQsZSksdGhpc31mdW5jdGlvbiBEKHQsZSl7Zm9yKHZhciBuPXQubGVuZ3RoO24tLTspaWYoX3QodFtuXVswXSxlKSlyZXR1cm4gbjtyZXR1cm4tMX1mdW5jdGlvbiBCKHQsZSl7ZT1wdChlLHQpP1tlXTpaKGUpO2Zvcih2YXIgbj0wLHI9ZS5sZW5ndGg7bnVsbCE9dCYmcj5uOyl0PXRbYnQoZVtuKytdKV07cmV0dXJuIG4mJm49PXI/dDp2b2lkIDB9ZnVuY3Rpb24gVih0LGUpe3JldHVybiAkZS5jYWxsKHQsZSl8fFwib2JqZWN0XCI9PXR5cGVvZiB0JiZlIGluIHQmJm51bGw9PT1hdCh0KX1mdW5jdGlvbiB6KHQsZSl7cmV0dXJuIGUgaW4gT2JqZWN0KHQpfWZ1bmN0aW9uIEcodCxlLG4scixvKXtyZXR1cm4gdD09PWU/ITA6bnVsbD09dHx8bnVsbD09ZXx8IXh0KHQpJiYhU3QoZSk/dCE9PXQmJmUhPT1lOlIodCxlLEcsbixyLG8pfWZ1bmN0aW9uIFIodCxlLG4scixvLHUpe3ZhciBpPW5uKHQpLGE9bm4oZSksYz1HdCxsPUd0O2l8fChjPWN0KHQpLGM9Yz09enQ/WXQ6YyksYXx8KGw9Y3QoZSksbD1sPT16dD9ZdDpsKTt2YXIgcz1jPT1ZdCYmIWYodCkscD1sPT1ZdCYmIWYoZSksZD1jPT1sO2lmKGQmJiFzKXJldHVybiB1fHwodT1uZXcgcSksaXx8TnQodCk/ZXQodCxlLG4scixvLHUpOm50KHQsZSxjLG4scixvLHUpO2lmKCEobyZEdCkpe3ZhciB2PXMmJiRlLmNhbGwodCxcIl9fd3JhcHBlZF9fXCIpLGg9cCYmJGUuY2FsbChlLFwiX193cmFwcGVkX19cIik7aWYodnx8aCl7dmFyIHk9dj90LnZhbHVlKCk6dCxiPWg/ZS52YWx1ZSgpOmU7cmV0dXJuIHV8fCh1PW5ldyBxKSxuKHksYixyLG8sdSl9fXJldHVybiBkPyh1fHwodT1uZXcgcSkscnQodCxlLG4scixvLHUpKTohMX1mdW5jdGlvbiBIKHQsZSxuLHIpe3ZhciBvPW4ubGVuZ3RoLHU9byxpPSFyO2lmKG51bGw9PXQpcmV0dXJuIXU7Zm9yKHQ9T2JqZWN0KHQpO28tLTspe3ZhciBhPW5bb107aWYoaSYmYVsyXT9hWzFdIT09dFthWzBdXTohKGFbMF1pbiB0KSlyZXR1cm4hMX1mb3IoOysrbzx1Oyl7YT1uW29dO3ZhciBjPWFbMF0sZj10W2NdLGw9YVsxXTtpZihpJiZhWzJdKXtpZih2b2lkIDA9PT1mJiYhKGMgaW4gdCkpcmV0dXJuITF9ZWxzZXt2YXIgcz1uZXcgcTtpZihyKXZhciBwPXIoZixsLGMsdCxlLHMpO2lmKCEodm9pZCAwPT09cD9HKGwsZixyLFV0fER0LHMpOnApKXJldHVybiExfX1yZXR1cm4hMH1mdW5jdGlvbiBXKHQpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHQ/dDpudWxsPT10P3F0Olwib2JqZWN0XCI9PXR5cGVvZiB0P25uKHQpP1EodFswXSx0WzFdKTpLKHQpOkl0KHQpfWZ1bmN0aW9uIEoodCl7cmV0dXJuIEJlKE9iamVjdCh0KSl9ZnVuY3Rpb24gSyh0KXt2YXIgZT11dCh0KTtyZXR1cm4gMT09ZS5sZW5ndGgmJmVbMF1bMl0/eXQoZVswXVswXSxlWzBdWzFdKTpmdW5jdGlvbihuKXtyZXR1cm4gbj09PXR8fEgobix0LGUpfX1mdW5jdGlvbiBRKHQsZSl7cmV0dXJuIHB0KHQpJiZodChlKT95dChidCh0KSxlKTpmdW5jdGlvbihuKXt2YXIgcj1MdChuLHQpO3JldHVybiB2b2lkIDA9PT1yJiZyPT09ZT9GdChuLHQpOkcoZSxyLHZvaWQgMCxVdHxEdCl9fWZ1bmN0aW9uIFgodCl7cmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiBudWxsPT1lP3ZvaWQgMDplW3RdfX1mdW5jdGlvbiBZKHQpe3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gQihlLHQpfX1mdW5jdGlvbiBaKHQpe3JldHVybiBubih0KT90OlR0KHQpfWZ1bmN0aW9uIHR0KHQpe3JldHVybiBmdW5jdGlvbihlKXt2YXIgbj1jdChlKTtyZXR1cm4gbj09UXQ/bChlKTpuPT1lZT9wKGUpOmEoZSx0KGUpKX19ZnVuY3Rpb24gZXQodCxlLG4scixvLGkpe3ZhciBhPW8mRHQsYz10Lmxlbmd0aCxmPWUubGVuZ3RoO2lmKGMhPWYmJiEoYSYmZj5jKSlyZXR1cm4hMTt2YXIgbD1pLmdldCh0KTtpZihsKXJldHVybiBsPT1lO3ZhciBzPS0xLHA9ITAsZD1vJlV0P25ldyBMOnZvaWQgMDtmb3IoaS5zZXQodCxlKTsrK3M8Yzspe3ZhciB2PXRbc10saD1lW3NdO2lmKHIpdmFyIHk9YT9yKGgsdixzLGUsdCxpKTpyKHYsaCxzLHQsZSxpKTtpZih2b2lkIDAhPT15KXtpZih5KWNvbnRpbnVlO3A9ITE7YnJlYWt9aWYoZCl7aWYoIXUoZSxmdW5jdGlvbih0LGUpe3JldHVybiBkLmhhcyhlKXx8diE9PXQmJiFuKHYsdCxyLG8saSk/dm9pZCAwOmQuYWRkKGUpfSkpe3A9ITE7YnJlYWt9fWVsc2UgaWYodiE9PWgmJiFuKHYsaCxyLG8saSkpe3A9ITE7YnJlYWt9fXJldHVybiBpW1wiZGVsZXRlXCJdKHQpLHB9ZnVuY3Rpb24gbnQodCxlLG4scixvLHUsaSl7c3dpdGNoKG4pe2Nhc2UgaWU6aWYodC5ieXRlTGVuZ3RoIT1lLmJ5dGVMZW5ndGh8fHQuYnl0ZU9mZnNldCE9ZS5ieXRlT2Zmc2V0KXJldHVybiExO3Q9dC5idWZmZXIsZT1lLmJ1ZmZlcjtjYXNlIHVlOnJldHVybiB0LmJ5dGVMZW5ndGg9PWUuYnl0ZUxlbmd0aCYmcihuZXcgTWUodCksbmV3IE1lKGUpKT8hMDohMTtjYXNlIFJ0OmNhc2UgSHQ6cmV0dXJuK3Q9PStlO2Nhc2UgV3Q6cmV0dXJuIHQubmFtZT09ZS5uYW1lJiZ0Lm1lc3NhZ2U9PWUubWVzc2FnZTtjYXNlIFh0OnJldHVybiB0IT0rdD9lIT0rZTp0PT0rZTtjYXNlIHRlOmNhc2UgbmU6cmV0dXJuIHQ9PWUrXCJcIjtjYXNlIFF0OnZhciBhPWw7Y2FzZSBlZTp2YXIgYz11JkR0O2lmKGF8fChhPXMpLHQuc2l6ZSE9ZS5zaXplJiYhYylyZXR1cm4hMTt2YXIgZj1pLmdldCh0KTtyZXR1cm4gZj9mPT1lOih1fD1VdCxpLnNldCh0LGUpLGV0KGEodCksYShlKSxyLG8sdSxpKSk7Y2FzZSByZTppZih0bilyZXR1cm4gdG4uY2FsbCh0KT09dG4uY2FsbChlKX1yZXR1cm4hMX1mdW5jdGlvbiBydCh0LGUsbixyLG8sdSl7dmFyIGk9byZEdCxhPSR0KHQpLGM9YS5sZW5ndGgsZj0kdChlKSxsPWYubGVuZ3RoO2lmKGMhPWwmJiFpKXJldHVybiExO2Zvcih2YXIgcz1jO3MtLTspe3ZhciBwPWFbc107aWYoIShpP3AgaW4gZTpWKGUscCkpKXJldHVybiExfXZhciBkPXUuZ2V0KHQpO2lmKGQpcmV0dXJuIGQ9PWU7dmFyIHY9ITA7dS5zZXQodCxlKTtmb3IodmFyIGg9aTsrK3M8Yzspe3A9YVtzXTt2YXIgeT10W3BdLGI9ZVtwXTtpZihyKXZhciBnPWk/cihiLHkscCxlLHQsdSk6cih5LGIscCx0LGUsdSk7aWYoISh2b2lkIDA9PT1nP3k9PT1ifHxuKHksYixyLG8sdSk6Zykpe3Y9ITE7YnJlYWt9aHx8KGg9XCJjb25zdHJ1Y3RvclwiPT1wKX1pZih2JiYhaCl7dmFyIF89dC5jb25zdHJ1Y3RvcixtPWUuY29uc3RydWN0b3I7XyE9bSYmXCJjb25zdHJ1Y3RvclwiaW4gdCYmXCJjb25zdHJ1Y3RvclwiaW4gZSYmIShcImZ1bmN0aW9uXCI9PXR5cGVvZiBfJiZfIGluc3RhbmNlb2YgXyYmXCJmdW5jdGlvblwiPT10eXBlb2YgbSYmbSBpbnN0YW5jZW9mIG0pJiYodj0hMSl9cmV0dXJuIHVbXCJkZWxldGVcIl0odCksdn1mdW5jdGlvbiBvdCh0LGUpe3ZhciBuPXQuX19kYXRhX187cmV0dXJuIGR0KGUpP25bXCJzdHJpbmdcIj09dHlwZW9mIGU/XCJzdHJpbmdcIjpcImhhc2hcIl06bi5tYXB9ZnVuY3Rpb24gdXQodCl7Zm9yKHZhciBlPXJuKHQpLG49ZS5sZW5ndGg7bi0tOyllW25dWzJdPWh0KGVbbl1bMV0pO3JldHVybiBlfWZ1bmN0aW9uIGl0KHQsZSl7dmFyIG49dFtlXTtyZXR1cm4gQXQobik/bjp2b2lkIDB9ZnVuY3Rpb24gYXQodCl7cmV0dXJuIERlKE9iamVjdCh0KSl9ZnVuY3Rpb24gY3QodCl7cmV0dXJuIHFlLmNhbGwodCl9ZnVuY3Rpb24gZnQodCxlLG4pe2U9cHQoZSx0KT9bZV06WihlKTtmb3IodmFyIHIsbz0tMSx1PWUubGVuZ3RoOysrbzx1Oyl7dmFyIGk9YnQoZVtvXSk7aWYoIShyPW51bGwhPXQmJm4odCxpKSkpYnJlYWs7dD10W2ldfWlmKHIpcmV0dXJuIHI7dmFyIHU9dD90Lmxlbmd0aDowO3JldHVybiEhdSYmT3QodSkmJnN0KGksdSkmJihubih0KXx8RXQodCl8fG10KHQpKX1mdW5jdGlvbiBsdCh0KXt2YXIgZT10P3QubGVuZ3RoOnZvaWQgMDtyZXR1cm4gT3QoZSkmJihubih0KXx8RXQodCl8fG10KHQpKT9pKGUsU3RyaW5nKTpudWxsfWZ1bmN0aW9uIHN0KHQsZSl7cmV0dXJuIGU9bnVsbD09ZT9WdDplLCEhZSYmKFwibnVtYmVyXCI9PXR5cGVvZiB0fHxtZS50ZXN0KHQpKSYmdD4tMSYmdCUxPT0wJiZlPnR9ZnVuY3Rpb24gcHQodCxlKXtpZihubih0KSlyZXR1cm4hMTt2YXIgbj10eXBlb2YgdDtyZXR1cm5cIm51bWJlclwiPT1ufHxcInN5bWJvbFwiPT1ufHxcImJvb2xlYW5cIj09bnx8bnVsbD09dHx8a3QodCk/ITA6YmUudGVzdCh0KXx8IXllLnRlc3QodCl8fG51bGwhPWUmJnQgaW4gT2JqZWN0KGUpfWZ1bmN0aW9uIGR0KHQpe3ZhciBlPXR5cGVvZiB0O3JldHVyblwic3RyaW5nXCI9PWV8fFwibnVtYmVyXCI9PWV8fFwic3ltYm9sXCI9PWV8fFwiYm9vbGVhblwiPT1lP1wiX19wcm90b19fXCIhPT10Om51bGw9PT10fWZ1bmN0aW9uIHZ0KHQpe3ZhciBlPXQmJnQuY29uc3RydWN0b3Isbj1cImZ1bmN0aW9uXCI9PXR5cGVvZiBlJiZlLnByb3RvdHlwZXx8TGU7cmV0dXJuIHQ9PT1ufWZ1bmN0aW9uIGh0KHQpe3JldHVybiB0PT09dCYmIXh0KHQpfWZ1bmN0aW9uIHl0KHQsZSl7cmV0dXJuIGZ1bmN0aW9uKG4pe3JldHVybiBudWxsPT1uPyExOm5bdF09PT1lJiYodm9pZCAwIT09ZXx8dCBpbiBPYmplY3QobikpfX1mdW5jdGlvbiBidCh0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdHx8a3QodCkpcmV0dXJuIHQ7dmFyIGU9dCtcIlwiO3JldHVyblwiMFwiPT1lJiYxL3Q9PS1CdD9cIi0wXCI6ZX1mdW5jdGlvbiBndCh0KXtpZihudWxsIT10KXt0cnl7cmV0dXJuIEZlLmNhbGwodCl9Y2F0Y2goZSl7fXRyeXtyZXR1cm4gdCtcIlwifWNhdGNoKGUpe319cmV0dXJuXCJcIn1mdW5jdGlvbiBfdCh0LGUpe3JldHVybiB0PT09ZXx8dCE9PXQmJmUhPT1lfWZ1bmN0aW9uIG10KHQpe3JldHVybiBqdCh0KSYmJGUuY2FsbCh0LFwiY2FsbGVlXCIpJiYoIVBlLmNhbGwodCxcImNhbGxlZVwiKXx8cWUuY2FsbCh0KT09enQpfWZ1bmN0aW9uIHd0KHQpe3JldHVybiBudWxsIT10JiZPdChlbih0KSkmJiFDdCh0KX1mdW5jdGlvbiBqdCh0KXtyZXR1cm4gU3QodCkmJnd0KHQpfWZ1bmN0aW9uIEN0KHQpe3ZhciBlPXh0KHQpP3FlLmNhbGwodCk6XCJcIjtyZXR1cm4gZT09SnR8fGU9PUt0fWZ1bmN0aW9uIE90KHQpe3JldHVyblwibnVtYmVyXCI9PXR5cGVvZiB0JiZ0Pi0xJiZ0JTE9PTAmJlZ0Pj10fWZ1bmN0aW9uIHh0KHQpe3ZhciBlPXR5cGVvZiB0O3JldHVybiEhdCYmKFwib2JqZWN0XCI9PWV8fFwiZnVuY3Rpb25cIj09ZSl9ZnVuY3Rpb24gU3QodCl7cmV0dXJuISF0JiZcIm9iamVjdFwiPT10eXBlb2YgdH1mdW5jdGlvbiBBdCh0KXtpZigheHQodCkpcmV0dXJuITE7dmFyIGU9Q3QodCl8fGYodCk/SWU6X2U7cmV0dXJuIGUudGVzdChndCh0KSl9ZnVuY3Rpb24gRXQodCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHR8fCFubih0KSYmU3QodCkmJnFlLmNhbGwodCk9PW5lfWZ1bmN0aW9uIGt0KHQpe3JldHVyblwic3ltYm9sXCI9PXR5cGVvZiB0fHxTdCh0KSYmcWUuY2FsbCh0KT09cmV9ZnVuY3Rpb24gTnQodCl7cmV0dXJuIFN0KHQpJiZPdCh0Lmxlbmd0aCkmJiEhd2VbcWUuY2FsbCh0KV19ZnVuY3Rpb24gTHQodCxlLG4pe3ZhciByPW51bGw9PXQ/dm9pZCAwOkIodCxlKTtyZXR1cm4gdm9pZCAwPT09cj9uOnJ9ZnVuY3Rpb24gRnQodCxlKXtyZXR1cm4gbnVsbCE9dCYmZnQodCxlLHopfWZ1bmN0aW9uICR0KHQpe3ZhciBlPXZ0KHQpO2lmKCFlJiYhd3QodCkpcmV0dXJuIEoodCk7dmFyIG49bHQodCkscj0hIW4sbz1ufHxbXSx1PW8ubGVuZ3RoO2Zvcih2YXIgaSBpbiB0KSFWKHQsaSl8fHImJihcImxlbmd0aFwiPT1pfHxzdChpLHUpKXx8ZSYmXCJjb25zdHJ1Y3RvclwiPT1pfHxvLnB1c2goaSk7cmV0dXJuIG99ZnVuY3Rpb24gcXQodCl7cmV0dXJuIHR9ZnVuY3Rpb24gSXQodCl7cmV0dXJuIHB0KHQpP1goYnQodCkpOlkodCl9dmFyIFR0PXQoXCJsb2Rhc2guX3N0cmluZ3RvcGF0aFwiKSxNdD0yMDAsUHQ9XCJfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fXCIsVXQ9MSxEdD0yLEJ0PTEvMCxWdD05MDA3MTk5MjU0NzQwOTkxLHp0PVwiW29iamVjdCBBcmd1bWVudHNdXCIsR3Q9XCJbb2JqZWN0IEFycmF5XVwiLFJ0PVwiW29iamVjdCBCb29sZWFuXVwiLEh0PVwiW29iamVjdCBEYXRlXVwiLFd0PVwiW29iamVjdCBFcnJvcl1cIixKdD1cIltvYmplY3QgRnVuY3Rpb25dXCIsS3Q9XCJbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXVwiLFF0PVwiW29iamVjdCBNYXBdXCIsWHQ9XCJbb2JqZWN0IE51bWJlcl1cIixZdD1cIltvYmplY3QgT2JqZWN0XVwiLFp0PVwiW29iamVjdCBQcm9taXNlXVwiLHRlPVwiW29iamVjdCBSZWdFeHBdXCIsZWU9XCJbb2JqZWN0IFNldF1cIixuZT1cIltvYmplY3QgU3RyaW5nXVwiLHJlPVwiW29iamVjdCBTeW1ib2xdXCIsb2U9XCJbb2JqZWN0IFdlYWtNYXBdXCIsdWU9XCJbb2JqZWN0IEFycmF5QnVmZmVyXVwiLGllPVwiW29iamVjdCBEYXRhVmlld11cIixhZT1cIltvYmplY3QgRmxvYXQzMkFycmF5XVwiLGNlPVwiW29iamVjdCBGbG9hdDY0QXJyYXldXCIsZmU9XCJbb2JqZWN0IEludDhBcnJheV1cIixsZT1cIltvYmplY3QgSW50MTZBcnJheV1cIixzZT1cIltvYmplY3QgSW50MzJBcnJheV1cIixwZT1cIltvYmplY3QgVWludDhBcnJheV1cIixkZT1cIltvYmplY3QgVWludDhDbGFtcGVkQXJyYXldXCIsdmU9XCJbb2JqZWN0IFVpbnQxNkFycmF5XVwiLGhlPVwiW29iamVjdCBVaW50MzJBcnJheV1cIix5ZT0vXFwufFxcWyg/OlteW1xcXV0qfChbXCInXSkoPzooPyFcXDEpW15cXFxcXXxcXFxcLikqP1xcMSlcXF0vLGJlPS9eXFx3KiQvLGdlPS9bXFxcXF4kLiorPygpW1xcXXt9fF0vZyxfZT0vXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvLG1lPS9eKD86MHxbMS05XVxcZCopJC8sd2U9e307d2VbYWVdPXdlW2NlXT13ZVtmZV09d2VbbGVdPXdlW3NlXT13ZVtwZV09d2VbZGVdPXdlW3ZlXT13ZVtoZV09ITAsd2VbenRdPXdlW0d0XT13ZVt1ZV09d2VbUnRdPXdlW2llXT13ZVtIdF09d2VbV3RdPXdlW0p0XT13ZVtRdF09d2VbWHRdPXdlW1l0XT13ZVt0ZV09d2VbZWVdPXdlW25lXT13ZVtvZV09ITE7dmFyIGplPXtcImZ1bmN0aW9uXCI6ITAsb2JqZWN0OiEwfSxDZT1qZVt0eXBlb2Ygbl0mJm4mJiFuLm5vZGVUeXBlP246dm9pZCAwLE9lPWplW3R5cGVvZiBlXSYmZSYmIWUubm9kZVR5cGU/ZTp2b2lkIDAseGU9YyhDZSYmT2UmJlwib2JqZWN0XCI9PXR5cGVvZiByJiZyKSxTZT1jKGplW3R5cGVvZiBzZWxmXSYmc2VsZiksQWU9YyhqZVt0eXBlb2Ygd2luZG93XSYmd2luZG93KSxFZT1jKGplW3R5cGVvZiB0aGlzXSYmdGhpcyksa2U9eGV8fEFlIT09KEVlJiZFZS53aW5kb3cpJiZBZXx8U2V8fEVlfHxGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCksTmU9QXJyYXkucHJvdG90eXBlLExlPU9iamVjdC5wcm90b3R5cGUsRmU9RnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLCRlPUxlLmhhc093blByb3BlcnR5LHFlPUxlLnRvU3RyaW5nLEllPVJlZ0V4cChcIl5cIitGZS5jYWxsKCRlKS5yZXBsYWNlKGdlLFwiXFxcXCQmXCIpLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csXCIkMS4qP1wiKStcIiRcIiksVGU9a2UuU3ltYm9sLE1lPWtlLlVpbnQ4QXJyYXksUGU9TGUucHJvcGVydHlJc0VudW1lcmFibGUsVWU9TmUuc3BsaWNlLERlPU9iamVjdC5nZXRQcm90b3R5cGVPZixCZT1PYmplY3Qua2V5cyxWZT1pdChrZSxcIkRhdGFWaWV3XCIpLHplPWl0KGtlLFwiTWFwXCIpLEdlPWl0KGtlLFwiUHJvbWlzZVwiKSxSZT1pdChrZSxcIlNldFwiKSxIZT1pdChrZSxcIldlYWtNYXBcIiksV2U9aXQoT2JqZWN0LFwiY3JlYXRlXCIpLEplPWd0KFZlKSxLZT1ndCh6ZSksUWU9Z3QoR2UpLFhlPWd0KFJlKSxZZT1ndChIZSksWmU9VGU/VGUucHJvdG90eXBlOnZvaWQgMCx0bj1aZT9aZS52YWx1ZU9mOnZvaWQgMDtkLnByb3RvdHlwZS5jbGVhcj12LGQucHJvdG90eXBlW1wiZGVsZXRlXCJdPWgsZC5wcm90b3R5cGUuZ2V0PXksZC5wcm90b3R5cGUuaGFzPWIsZC5wcm90b3R5cGUuc2V0PWcsXy5wcm90b3R5cGUuY2xlYXI9bSxfLnByb3RvdHlwZVtcImRlbGV0ZVwiXT13LF8ucHJvdG90eXBlLmdldD1qLF8ucHJvdG90eXBlLmhhcz1DLF8ucHJvdG90eXBlLnNldD1PLHgucHJvdG90eXBlLmNsZWFyPVMseC5wcm90b3R5cGVbXCJkZWxldGVcIl09QSx4LnByb3RvdHlwZS5nZXQ9RSx4LnByb3RvdHlwZS5oYXM9ayx4LnByb3RvdHlwZS5zZXQ9TixMLnByb3RvdHlwZS5hZGQ9TC5wcm90b3R5cGUucHVzaD1GLEwucHJvdG90eXBlLmhhcz0kLHEucHJvdG90eXBlLmNsZWFyPUkscS5wcm90b3R5cGVbXCJkZWxldGVcIl09VCxxLnByb3RvdHlwZS5nZXQ9TSxxLnByb3RvdHlwZS5oYXM9UCxxLnByb3RvdHlwZS5zZXQ9VTt2YXIgZW49WChcImxlbmd0aFwiKTsoVmUmJmN0KG5ldyBWZShuZXcgQXJyYXlCdWZmZXIoMSkpKSE9aWV8fHplJiZjdChuZXcgemUpIT1RdHx8R2UmJmN0KEdlLnJlc29sdmUoKSkhPVp0fHxSZSYmY3QobmV3IFJlKSE9ZWV8fEhlJiZjdChuZXcgSGUpIT1vZSkmJihjdD1mdW5jdGlvbih0KXt2YXIgZT1xZS5jYWxsKHQpLG49ZT09WXQ/dC5jb25zdHJ1Y3Rvcjp2b2lkIDAscj1uP2d0KG4pOnZvaWQgMDtpZihyKXN3aXRjaChyKXtjYXNlIEplOnJldHVybiBpZTtjYXNlIEtlOnJldHVybiBRdDtjYXNlIFFlOnJldHVybiBadDtjYXNlIFhlOnJldHVybiBlZTtjYXNlIFllOnJldHVybiBvZX1yZXR1cm4gZX0pO3ZhciBubj1BcnJheS5pc0FycmF5LHJuPXR0KCR0KTtlLmV4cG9ydHM9V30pLmNhbGwodGhpcyxcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP2dsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZj9zZWxmOlwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93Ont9KX0se1wibG9kYXNoLl9zdHJpbmd0b3BhdGhcIjo1fV0sNDpbZnVuY3Rpb24odCxlLG4peyhmdW5jdGlvbih0KXtmdW5jdGlvbiByKHQpe3JldHVybiB0JiZ0Lk9iamVjdD09PU9iamVjdD90Om51bGx9ZnVuY3Rpb24gbyh0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdClyZXR1cm4gdDtpZihpKHQpKXJldHVybiB3P3cuY2FsbCh0KTpcIlwiO3ZhciBlPXQrXCJcIjtyZXR1cm5cIjBcIj09ZSYmMS90PT0tYT9cIi0wXCI6ZX1mdW5jdGlvbiB1KHQpe3JldHVybiEhdCYmXCJvYmplY3RcIj09dHlwZW9mIHR9ZnVuY3Rpb24gaSh0KXtyZXR1cm5cInN5bWJvbFwiPT10eXBlb2YgdHx8dSh0KSYmZy5jYWxsKHQpPT1jfXZhciBhPTEvMCxjPVwiW29iamVjdCBTeW1ib2xdXCIsZj17XCJmdW5jdGlvblwiOiEwLG9iamVjdDohMH0sbD1mW3R5cGVvZiBuXSYmbiYmIW4ubm9kZVR5cGU/bjp2b2lkIDAscz1mW3R5cGVvZiBlXSYmZSYmIWUubm9kZVR5cGU/ZTp2b2lkIDAscD1yKGwmJnMmJlwib2JqZWN0XCI9PXR5cGVvZiB0JiZ0KSxkPXIoZlt0eXBlb2Ygc2VsZl0mJnNlbGYpLHY9cihmW3R5cGVvZiB3aW5kb3ddJiZ3aW5kb3cpLGg9cihmW3R5cGVvZiB0aGlzXSYmdGhpcykseT1wfHx2IT09KGgmJmgud2luZG93KSYmdnx8ZHx8aHx8RnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpLGI9T2JqZWN0LnByb3RvdHlwZSxnPWIudG9TdHJpbmcsXz15LlN5bWJvbCxtPV8/Xy5wcm90b3R5cGU6dm9pZCAwLHc9bT9tLnRvU3RyaW5nOnZvaWQgMDtlLmV4cG9ydHM9b30pLmNhbGwodGhpcyxcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP2dsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZj9zZWxmOlwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93Ont9KX0se31dLDU6W2Z1bmN0aW9uKHQsZSxuKXsoZnVuY3Rpb24ocil7ZnVuY3Rpb24gbyh0KXtyZXR1cm4gdCYmdC5PYmplY3Q9PT1PYmplY3Q/dDpudWxsfWZ1bmN0aW9uIHUodCl7dmFyIGU9ITE7aWYobnVsbCE9dCYmXCJmdW5jdGlvblwiIT10eXBlb2YgdC50b1N0cmluZyl0cnl7ZT0hISh0K1wiXCIpfWNhdGNoKG4pe31yZXR1cm4gZX1mdW5jdGlvbiBpKHQpe3ZhciBlPS0xLG49dD90Lmxlbmd0aDowO2Zvcih0aGlzLmNsZWFyKCk7KytlPG47KXt2YXIgcj10W2VdO3RoaXMuc2V0KHJbMF0sclsxXSl9fWZ1bmN0aW9uIGEoKXt0aGlzLl9fZGF0YV9fPWl0P2l0KG51bGwpOnt9fWZ1bmN0aW9uIGModCl7cmV0dXJuIHRoaXMuaGFzKHQpJiZkZWxldGUgdGhpcy5fX2RhdGFfX1t0XX1mdW5jdGlvbiBmKHQpe3ZhciBlPXRoaXMuX19kYXRhX187aWYoaXQpe3ZhciBuPWVbdF07cmV0dXJuIG49PT1NP3ZvaWQgMDpufXJldHVybiBldC5jYWxsKGUsdCk/ZVt0XTp2b2lkIDB9ZnVuY3Rpb24gbCh0KXt2YXIgZT10aGlzLl9fZGF0YV9fO3JldHVybiBpdD92b2lkIDAhPT1lW3RdOmV0LmNhbGwoZSx0KX1mdW5jdGlvbiBzKHQsZSl7dmFyIG49dGhpcy5fX2RhdGFfXztyZXR1cm4gblt0XT1pdCYmdm9pZCAwPT09ZT9NOmUsdGhpc31mdW5jdGlvbiBwKHQpe3ZhciBlPS0xLG49dD90Lmxlbmd0aDowO2Zvcih0aGlzLmNsZWFyKCk7KytlPG47KXt2YXIgcj10W2VdO3RoaXMuc2V0KHJbMF0sclsxXSl9fWZ1bmN0aW9uIGQoKXt0aGlzLl9fZGF0YV9fPVtdfWZ1bmN0aW9uIHYodCl7dmFyIGU9dGhpcy5fX2RhdGFfXyxuPU8oZSx0KTtpZigwPm4pcmV0dXJuITE7dmFyIHI9ZS5sZW5ndGgtMTtyZXR1cm4gbj09cj9lLnBvcCgpOm90LmNhbGwoZSxuLDEpLCEwfWZ1bmN0aW9uIGgodCl7dmFyIGU9dGhpcy5fX2RhdGFfXyxuPU8oZSx0KTtyZXR1cm4gMD5uP3ZvaWQgMDplW25dWzFdfWZ1bmN0aW9uIHkodCl7cmV0dXJuIE8odGhpcy5fX2RhdGFfXyx0KT4tMX1mdW5jdGlvbiBiKHQsZSl7dmFyIG49dGhpcy5fX2RhdGFfXyxyPU8obix0KTtyZXR1cm4gMD5yP24ucHVzaChbdCxlXSk6bltyXVsxXT1lLHRoaXN9ZnVuY3Rpb24gZyh0KXt2YXIgZT0tMSxuPXQ/dC5sZW5ndGg6MDtmb3IodGhpcy5jbGVhcigpOysrZTxuOyl7dmFyIHI9dFtlXTt0aGlzLnNldChyWzBdLHJbMV0pfX1mdW5jdGlvbiBfKCl7dGhpcy5fX2RhdGFfXz17aGFzaDpuZXcgaSxtYXA6bmV3KHV0fHxwKSxzdHJpbmc6bmV3IGl9fWZ1bmN0aW9uIG0odCl7cmV0dXJuIHgodGhpcyx0KVtcImRlbGV0ZVwiXSh0KX1mdW5jdGlvbiB3KHQpe3JldHVybiB4KHRoaXMsdCkuZ2V0KHQpfWZ1bmN0aW9uIGoodCl7cmV0dXJuIHgodGhpcyx0KS5oYXModCl9ZnVuY3Rpb24gQyh0LGUpe3JldHVybiB4KHRoaXMsdCkuc2V0KHQsZSksdGhpc31mdW5jdGlvbiBPKHQsZSl7Zm9yKHZhciBuPXQubGVuZ3RoO24tLTspaWYoTih0W25dWzBdLGUpKXJldHVybiBuO3JldHVybi0xfWZ1bmN0aW9uIHgodCxlKXt2YXIgbj10Ll9fZGF0YV9fO3JldHVybiBBKGUpP25bXCJzdHJpbmdcIj09dHlwZW9mIGU/XCJzdHJpbmdcIjpcImhhc2hcIl06bi5tYXB9ZnVuY3Rpb24gUyh0LGUpe3ZhciBuPXRbZV07cmV0dXJuICQobik/bjp2b2lkIDB9ZnVuY3Rpb24gQSh0KXt2YXIgZT10eXBlb2YgdDtyZXR1cm5cInN0cmluZ1wiPT1lfHxcIm51bWJlclwiPT1lfHxcInN5bWJvbFwiPT1lfHxcImJvb2xlYW5cIj09ZT9cIl9fcHJvdG9fX1wiIT09dDpudWxsPT09dH1mdW5jdGlvbiBFKHQpe2lmKG51bGwhPXQpe3RyeXtyZXR1cm4gdHQuY2FsbCh0KX1jYXRjaChlKXt9dHJ5e3JldHVybiB0K1wiXCJ9Y2F0Y2goZSl7fX1yZXR1cm5cIlwifWZ1bmN0aW9uIGsodCxlKXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiB0fHxlJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBlKXRocm93IG5ldyBUeXBlRXJyb3IoVCk7dmFyIG49ZnVuY3Rpb24oKXt2YXIgcj1hcmd1bWVudHMsbz1lP2UuYXBwbHkodGhpcyxyKTpyWzBdLHU9bi5jYWNoZTtpZih1LmhhcyhvKSlyZXR1cm4gdS5nZXQobyk7dmFyIGk9dC5hcHBseSh0aGlzLHIpO3JldHVybiBuLmNhY2hlPXUuc2V0KG8saSksaX07cmV0dXJuIG4uY2FjaGU9bmV3KGsuQ2FjaGV8fGcpLG59ZnVuY3Rpb24gTih0LGUpe3JldHVybiB0PT09ZXx8dCE9PXQmJmUhPT1lfWZ1bmN0aW9uIEwodCl7dmFyIGU9Rih0KT9udC5jYWxsKHQpOlwiXCI7cmV0dXJuIGU9PVB8fGU9PVV9ZnVuY3Rpb24gRih0KXt2YXIgZT10eXBlb2YgdDtyZXR1cm4hIXQmJihcIm9iamVjdFwiPT1lfHxcImZ1bmN0aW9uXCI9PWUpfWZ1bmN0aW9uICQodCl7aWYoIUYodCkpcmV0dXJuITE7dmFyIGU9TCh0KXx8dSh0KT9ydDp6O3JldHVybiBlLnRlc3QoRSh0KSl9ZnVuY3Rpb24gcSh0KXtyZXR1cm4gbnVsbD09dD9cIlwiOkkodCl9dmFyIEk9dChcImxvZGFzaC5fYmFzZXRvc3RyaW5nXCIpLFQ9XCJFeHBlY3RlZCBhIGZ1bmN0aW9uXCIsTT1cIl9fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX19cIixQPVwiW29iamVjdCBGdW5jdGlvbl1cIixVPVwiW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl1cIixEPS9bXi5bXFxdXSt8XFxbKD86KC0/XFxkKyg/OlxcLlxcZCspPyl8KFtcIiddKSgoPzooPyFcXDIpW15cXFxcXXxcXFxcLikqPylcXDIpXFxdL2csQj0vW1xcXFxeJC4qKz8oKVtcXF17fXxdL2csVj0vXFxcXChcXFxcKT8vZyx6PS9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC8sRz17XCJmdW5jdGlvblwiOiEwLG9iamVjdDohMH0sUj1HW3R5cGVvZiBuXSYmbiYmIW4ubm9kZVR5cGU/bjp2b2lkIDAsSD1HW3R5cGVvZiBlXSYmZSYmIWUubm9kZVR5cGU/ZTp2b2lkIDAsVz1vKFImJkgmJlwib2JqZWN0XCI9PXR5cGVvZiByJiZyKSxKPW8oR1t0eXBlb2Ygc2VsZl0mJnNlbGYpLEs9byhHW3R5cGVvZiB3aW5kb3ddJiZ3aW5kb3cpLFE9byhHW3R5cGVvZiB0aGlzXSYmdGhpcyksWD1XfHxLIT09KFEmJlEud2luZG93KSYmS3x8Snx8UXx8RnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpLFk9QXJyYXkucHJvdG90eXBlLFo9T2JqZWN0LnByb3RvdHlwZSx0dD1GdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcsZXQ9Wi5oYXNPd25Qcm9wZXJ0eSxudD1aLnRvU3RyaW5nLHJ0PVJlZ0V4cChcIl5cIit0dC5jYWxsKGV0KS5yZXBsYWNlKEIsXCJcXFxcJCZcIikucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZyxcIiQxLio/XCIpK1wiJFwiKSxvdD1ZLnNwbGljZSx1dD1TKFgsXCJNYXBcIiksaXQ9UyhPYmplY3QsXCJjcmVhdGVcIik7aS5wcm90b3R5cGUuY2xlYXI9YSxpLnByb3RvdHlwZVtcImRlbGV0ZVwiXT1jLGkucHJvdG90eXBlLmdldD1mLGkucHJvdG90eXBlLmhhcz1sLGkucHJvdG90eXBlLnNldD1zLHAucHJvdG90eXBlLmNsZWFyPWQscC5wcm90b3R5cGVbXCJkZWxldGVcIl09dixwLnByb3RvdHlwZS5nZXQ9aCxwLnByb3RvdHlwZS5oYXM9eSxwLnByb3RvdHlwZS5zZXQ9YixnLnByb3RvdHlwZS5jbGVhcj1fLGcucHJvdG90eXBlW1wiZGVsZXRlXCJdPW0sZy5wcm90b3R5cGUuZ2V0PXcsZy5wcm90b3R5cGUuaGFzPWosZy5wcm90b3R5cGUuc2V0PUM7dmFyIGF0PWsoZnVuY3Rpb24odCl7dmFyIGU9W107cmV0dXJuIHEodCkucmVwbGFjZShELGZ1bmN0aW9uKHQsbixyLG8pe2UucHVzaChyP28ucmVwbGFjZShWLFwiJDFcIik6bnx8dCl9KSxlfSk7ay5DYWNoZT1nLGUuZXhwb3J0cz1hdH0pLmNhbGwodGhpcyxcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP2dsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZj9zZWxmOlwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93Ont9KX0se1wibG9kYXNoLl9iYXNldG9zdHJpbmdcIjo0fV0sNjpbZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBuKHQsZSxuKXt2YXIgcj10W2VdO20uY2FsbCh0LGUpJiZjKHIsbikmJih2b2lkIDAhPT1ufHxlIGluIHQpfHwodFtlXT1uKX1mdW5jdGlvbiByKHQpe3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gbnVsbD09ZT92b2lkIDA6ZVt0XX19ZnVuY3Rpb24gbyh0LGUscixvKXtyfHwocj17fSk7Zm9yKHZhciB1PS0xLGk9ZS5sZW5ndGg7Kyt1PGk7KXt2YXIgYT1lW3VdLGM9bz9vKHJbYV0sdFthXSxhLHIsdCk6dFthXTtuKHIsYSxjKX1yZXR1cm4gcn1mdW5jdGlvbiB1KHQpe3JldHVybiB2KGZ1bmN0aW9uKGUsbil7dmFyIHI9LTEsbz1uLmxlbmd0aCx1PW8+MT9uW28tMV06dm9pZCAwLGk9bz4yP25bMl06dm9pZCAwO2Zvcih1PXQubGVuZ3RoPjMmJlwiZnVuY3Rpb25cIj09dHlwZW9mIHU/KG8tLSx1KTp2b2lkIDAsaSYmYShuWzBdLG5bMV0saSkmJih1PTM+bz92b2lkIDA6dSxvPTEpLGU9T2JqZWN0KGUpOysrcjxvOyl7dmFyIGM9bltyXTtjJiZ0KGUsYyxyLHUpfXJldHVybiBlfSl9ZnVuY3Rpb24gaSh0LGUpe3JldHVybiBlPW51bGw9PWU/aDplLCEhZSYmKFwibnVtYmVyXCI9PXR5cGVvZiB0fHxnLnRlc3QodCkpJiZ0Pi0xJiZ0JTE9PTAmJmU+dH1mdW5jdGlvbiBhKHQsZSxuKXtpZighcChuKSlyZXR1cm4hMTt2YXIgcj10eXBlb2YgZTtyZXR1cm4oXCJudW1iZXJcIj09cj9mKG4pJiZpKGUsbi5sZW5ndGgpOlwic3RyaW5nXCI9PXImJmUgaW4gbik/YyhuW2VdLHQpOiExfWZ1bmN0aW9uIGModCxlKXtyZXR1cm4gdD09PWV8fHQhPT10JiZlIT09ZX1mdW5jdGlvbiBmKHQpe3JldHVybiBudWxsIT10JiZzKGoodCkpJiYhbCh0KX1mdW5jdGlvbiBsKHQpe3ZhciBlPXAodCk/dy5jYWxsKHQpOlwiXCI7cmV0dXJuIGU9PXl8fGU9PWJ9ZnVuY3Rpb24gcyh0KXtyZXR1cm5cIm51bWJlclwiPT10eXBlb2YgdCYmdD4tMSYmdCUxPT0wJiZoPj10fWZ1bmN0aW9uIHAodCl7dmFyIGU9dHlwZW9mIHQ7cmV0dXJuISF0JiYoXCJvYmplY3RcIj09ZXx8XCJmdW5jdGlvblwiPT1lKX12YXIgZD10KFwibG9kYXNoLmtleXNpblwiKSx2PXQoXCJsb2Rhc2gucmVzdFwiKSxoPTkwMDcxOTkyNTQ3NDA5OTEseT1cIltvYmplY3QgRnVuY3Rpb25dXCIsYj1cIltvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dXCIsZz0vXig/OjB8WzEtOV1cXGQqKSQvLF89T2JqZWN0LnByb3RvdHlwZSxtPV8uaGFzT3duUHJvcGVydHksdz1fLnRvU3RyaW5nLGo9cihcImxlbmd0aFwiKSxDPXUoZnVuY3Rpb24odCxlLG4scil7byhlLGQoZSksdCxyKX0pO2UuZXhwb3J0cz1DfSx7XCJsb2Rhc2gua2V5c2luXCI6OSxcImxvZGFzaC5yZXN0XCI6MTB9XSw3OltmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIG4odCxlLG4pe3ZhciByPW4ubGVuZ3RoO3N3aXRjaChyKXtjYXNlIDA6cmV0dXJuIHQuY2FsbChlKTtjYXNlIDE6cmV0dXJuIHQuY2FsbChlLG5bMF0pO2Nhc2UgMjpyZXR1cm4gdC5jYWxsKGUsblswXSxuWzFdKTtjYXNlIDM6cmV0dXJuIHQuY2FsbChlLG5bMF0sblsxXSxuWzJdKX1yZXR1cm4gdC5hcHBseShlLG4pfWZ1bmN0aW9uIHIodCxlLG4scil7cmV0dXJuIHZvaWQgMD09PXR8fG8odCxhW25dKSYmIWMuY2FsbChyLG4pP2U6dH1mdW5jdGlvbiBvKHQsZSl7cmV0dXJuIHQ9PT1lfHx0IT09dCYmZSE9PWV9dmFyIHU9dChcImxvZGFzaC5hc3NpZ25pbndpdGhcIiksaT10KFwibG9kYXNoLnJlc3RcIiksYT1PYmplY3QucHJvdG90eXBlLGM9YS5oYXNPd25Qcm9wZXJ0eSxmPWkoZnVuY3Rpb24odCl7cmV0dXJuIHQucHVzaCh2b2lkIDAsciksbih1LHZvaWQgMCx0KX0pO2UuZXhwb3J0cz1mfSx7XCJsb2Rhc2guYXNzaWduaW53aXRoXCI6NixcImxvZGFzaC5yZXN0XCI6MTB9XSw4OltmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIG4odCxlKXtmb3IodmFyIG49LTEscj10Lmxlbmd0aDsrK248ciYmZSh0W25dLG4sdCkhPT0hMTspO3JldHVybiB0fWZ1bmN0aW9uIHIodCxlKXt2YXIgcj1pKHQpP246bztyZXR1cm4gcih0LHUoZSwzKSl9dmFyIG89dChcImxvZGFzaC5fYmFzZWVhY2hcIiksdT10KFwibG9kYXNoLl9iYXNlaXRlcmF0ZWVcIiksaT1BcnJheS5pc0FycmF5O2UuZXhwb3J0cz1yfSx7XCJsb2Rhc2guX2Jhc2VlYWNoXCI6MixcImxvZGFzaC5fYmFzZWl0ZXJhdGVlXCI6M31dLDk6W2Z1bmN0aW9uKHQsZSxuKXsoZnVuY3Rpb24odCl7ZnVuY3Rpb24gcih0LGUpe2Zvcih2YXIgbj0tMSxyPUFycmF5KHQpOysrbjx0OylyW25dPWUobik7cmV0dXJuIHJ9ZnVuY3Rpb24gbyh0KXtyZXR1cm4gdCYmdC5PYmplY3Q9PT1PYmplY3Q/dDpudWxsfWZ1bmN0aW9uIHUodCl7Zm9yKHZhciBlLG49W107IShlPXQubmV4dCgpKS5kb25lOyluLnB1c2goZS52YWx1ZSk7cmV0dXJuIG59ZnVuY3Rpb24gaSh0KXt0PW51bGw9PXQ/dDpPYmplY3QodCk7dmFyIGU9W107Zm9yKHZhciBuIGluIHQpZS5wdXNoKG4pO3JldHVybiBlfWZ1bmN0aW9uIGEodCl7cmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiBudWxsPT1lP3ZvaWQgMDplW3RdfX1mdW5jdGlvbiBjKHQpe3ZhciBlPXQ/dC5sZW5ndGg6dm9pZCAwO3JldHVybiBoKGUpJiYoQih0KXx8Zyh0KXx8cyh0KSk/cihlLFN0cmluZyk6bnVsbH1mdW5jdGlvbiBmKHQsZSl7cmV0dXJuIGU9bnVsbD09ZT9tOmUsISFlJiYoXCJudW1iZXJcIj09dHlwZW9mIHR8fHgudGVzdCh0KSkmJnQ+LTEmJnQlMT09MCYmZT50fWZ1bmN0aW9uIGwodCl7dmFyIGU9dCYmdC5jb25zdHJ1Y3RvcixuPVwiZnVuY3Rpb25cIj09dHlwZW9mIGUmJmUucHJvdG90eXBlfHxxO3JldHVybiB0PT09bn1mdW5jdGlvbiBzKHQpe3JldHVybiBkKHQpJiZJLmNhbGwodCxcImNhbGxlZVwiKSYmKCFVLmNhbGwodCxcImNhbGxlZVwiKXx8VC5jYWxsKHQpPT13KX1mdW5jdGlvbiBwKHQpe3JldHVybiBudWxsIT10JiZoKEQodCkpJiYhdih0KX1mdW5jdGlvbiBkKHQpe3JldHVybiBiKHQpJiZwKHQpfWZ1bmN0aW9uIHYodCl7dmFyIGU9eSh0KT9ULmNhbGwodCk6XCJcIjtyZXR1cm4gZT09anx8ZT09Q31mdW5jdGlvbiBoKHQpe3JldHVyblwibnVtYmVyXCI9PXR5cGVvZiB0JiZ0Pi0xJiZ0JTE9PTAmJm0+PXR9ZnVuY3Rpb24geSh0KXt2YXIgZT10eXBlb2YgdDtyZXR1cm4hIXQmJihcIm9iamVjdFwiPT1lfHxcImZ1bmN0aW9uXCI9PWUpfWZ1bmN0aW9uIGIodCl7cmV0dXJuISF0JiZcIm9iamVjdFwiPT10eXBlb2YgdH1mdW5jdGlvbiBnKHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0fHwhQih0KSYmYih0KSYmVC5jYWxsKHQpPT1PfWZ1bmN0aW9uIF8odCl7Zm9yKHZhciBlPS0xLG49bCh0KSxyPWkodCksbz1yLmxlbmd0aCx1PWModCksYT0hIXUscz11fHxbXSxwPXMubGVuZ3RoOysrZTxvOyl7dmFyIGQ9cltlXTthJiYoXCJsZW5ndGhcIj09ZHx8ZihkLHApKXx8XCJjb25zdHJ1Y3RvclwiPT1kJiYobnx8IUkuY2FsbCh0LGQpKXx8cy5wdXNoKGQpfXJldHVybiBzfXZhciBtPTkwMDcxOTkyNTQ3NDA5OTEsdz1cIltvYmplY3QgQXJndW1lbnRzXVwiLGo9XCJbb2JqZWN0IEZ1bmN0aW9uXVwiLEM9XCJbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXVwiLE89XCJbb2JqZWN0IFN0cmluZ11cIix4PS9eKD86MHxbMS05XVxcZCopJC8sUz17XCJmdW5jdGlvblwiOiEwLG9iamVjdDohMH0sQT1TW3R5cGVvZiBuXSYmbiYmIW4ubm9kZVR5cGU/bjp2b2lkIDAsRT1TW3R5cGVvZiBlXSYmZSYmIWUubm9kZVR5cGU/ZTp2b2lkIDAsaz1vKEEmJkUmJlwib2JqZWN0XCI9PXR5cGVvZiB0JiZ0KSxOPW8oU1t0eXBlb2Ygc2VsZl0mJnNlbGYpLEw9byhTW3R5cGVvZiB3aW5kb3ddJiZ3aW5kb3cpLEY9byhTW3R5cGVvZiB0aGlzXSYmdGhpcyksJD1rfHxMIT09KEYmJkYud2luZG93KSYmTHx8Tnx8Rnx8RnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpLHE9T2JqZWN0LnByb3RvdHlwZSxJPXEuaGFzT3duUHJvcGVydHksVD1xLnRvU3RyaW5nLE09JC5SZWZsZWN0LFA9TT9NLmVudW1lcmF0ZTp2b2lkIDAsVT1xLnByb3BlcnR5SXNFbnVtZXJhYmxlO1AmJiFVLmNhbGwoe3ZhbHVlT2Y6MX0sXCJ2YWx1ZU9mXCIpJiYoaT1mdW5jdGlvbih0KXtyZXR1cm4gdShQKHQpKX0pO3ZhciBEPWEoXCJsZW5ndGhcIiksQj1BcnJheS5pc0FycmF5O2UuZXhwb3J0cz1ffSkuY2FsbCh0aGlzLFwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWw/Z2xvYmFsOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmP3NlbGY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6e30pfSx7fV0sMTA6W2Z1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gbih0LGUsbil7dmFyIHI9bi5sZW5ndGg7c3dpdGNoKHIpe2Nhc2UgMDpyZXR1cm4gdC5jYWxsKGUpO2Nhc2UgMTpyZXR1cm4gdC5jYWxsKGUsblswXSk7Y2FzZSAyOnJldHVybiB0LmNhbGwoZSxuWzBdLG5bMV0pO2Nhc2UgMzpyZXR1cm4gdC5jYWxsKGUsblswXSxuWzFdLG5bMl0pfXJldHVybiB0LmFwcGx5KGUsbil9ZnVuY3Rpb24gcih0LGUpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIHQpdGhyb3cgbmV3IFR5cGVFcnJvcihzKTtyZXR1cm4gZT14KHZvaWQgMD09PWU/dC5sZW5ndGgtMTpmKGUpLDApLGZ1bmN0aW9uKCl7Zm9yKHZhciByPWFyZ3VtZW50cyxvPS0xLHU9eChyLmxlbmd0aC1lLDApLGk9QXJyYXkodSk7KytvPHU7KWlbb109cltlK29dO3N3aXRjaChlKXtjYXNlIDA6cmV0dXJuIHQuY2FsbCh0aGlzLGkpO2Nhc2UgMTpyZXR1cm4gdC5jYWxsKHRoaXMsclswXSxpKTtjYXNlIDI6cmV0dXJuIHQuY2FsbCh0aGlzLHJbMF0sclsxXSxpKX12YXIgYT1BcnJheShlKzEpO2ZvcihvPS0xOysrbzxlOylhW29dPXJbb107cmV0dXJuIGFbZV09aSxuKHQsdGhpcyxhKX19ZnVuY3Rpb24gbyh0KXt2YXIgZT11KHQpP08uY2FsbCh0KTpcIlwiO3JldHVybiBlPT1ofHxlPT15fWZ1bmN0aW9uIHUodCl7dmFyIGU9dHlwZW9mIHQ7cmV0dXJuISF0JiYoXCJvYmplY3RcIj09ZXx8XCJmdW5jdGlvblwiPT1lKX1mdW5jdGlvbiBpKHQpe3JldHVybiEhdCYmXCJvYmplY3RcIj09dHlwZW9mIHR9ZnVuY3Rpb24gYSh0KXtyZXR1cm5cInN5bWJvbFwiPT10eXBlb2YgdHx8aSh0KSYmTy5jYWxsKHQpPT1ifWZ1bmN0aW9uIGModCl7aWYoIXQpcmV0dXJuIDA9PT10P3Q6MDtpZih0PWwodCksdD09PXB8fHQ9PT0tcCl7dmFyIGU9MD50Py0xOjE7cmV0dXJuIGUqZH1yZXR1cm4gdD09PXQ/dDowfWZ1bmN0aW9uIGYodCl7dmFyIGU9Yyh0KSxuPWUlMTtyZXR1cm4gZT09PWU/bj9lLW46ZTowfWZ1bmN0aW9uIGwodCl7aWYoXCJudW1iZXJcIj09dHlwZW9mIHQpcmV0dXJuIHQ7aWYoYSh0KSlyZXR1cm4gdjtpZih1KHQpKXt2YXIgZT1vKHQudmFsdWVPZik/dC52YWx1ZU9mKCk6dDt0PXUoZSk/ZStcIlwiOmV9aWYoXCJzdHJpbmdcIiE9dHlwZW9mIHQpcmV0dXJuIDA9PT10P3Q6K3Q7dD10LnJlcGxhY2UoZyxcIlwiKTt2YXIgbj1tLnRlc3QodCk7cmV0dXJuIG58fHcudGVzdCh0KT9qKHQuc2xpY2UoMiksbj8yOjgpOl8udGVzdCh0KT92Oit0fXZhciBzPVwiRXhwZWN0ZWQgYSBmdW5jdGlvblwiLHA9MS8wLGQ9MS43OTc2OTMxMzQ4NjIzMTU3ZTMwOCx2PTAvMCxoPVwiW29iamVjdCBGdW5jdGlvbl1cIix5PVwiW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl1cIixiPVwiW29iamVjdCBTeW1ib2xdXCIsZz0vXlxccyt8XFxzKyQvZyxfPS9eWy0rXTB4WzAtOWEtZl0rJC9pLG09L14wYlswMV0rJC9pLHc9L14wb1swLTddKyQvaSxqPXBhcnNlSW50LEM9T2JqZWN0LnByb3RvdHlwZSxPPUMudG9TdHJpbmcseD1NYXRoLm1heDtlLmV4cG9ydHM9cn0se31dLDExOltmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCxlKXtmdW5jdGlvbiBuKHIpe2Z1bmN0aW9uIG8oKXt2YXIgbz1hcmd1bWVudHMubGVuZ3RoLHU9W10uY29uY2F0KHIpO3JldHVybiBvJiZ1LnB1c2guYXBwbHkodSxhcmd1bWVudHMpLHUubGVuZ3RoPGU/bih1KTp0LmFwcGx5KHRoaXMsdSl9cmV0dXJuIG99cmV0dXJuXCJudW1iZXJcIiE9dHlwZW9mIGUmJihlPXQubGVuZ3RoKSxuKFtdKX1lLmV4cG9ydHM9bn0se31dLDEyOltmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO3ZhciBuLHI9dChcIi4vY3VycnlcIik7ZS5leHBvcnRzPXIoZnVuY3Rpb24oZSxyKXtmb3Iobj1ufHx0KFwiLi9tYXRjaGVzXCIpO3I9ci5wYXJlbnRFbGVtZW50OylpZihuLmNhbGwocixlKSlyZXR1cm4gcn0pfSx7XCIuL2N1cnJ5XCI6MTEsXCIuL21hdGNoZXNcIjoxM31dLDEzOltmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO3ZhciBuPUVsZW1lbnQucHJvdG90eXBlLHI9bi5tYXRjaGVzfHxuLm1vek1hdGNoZXNTZWxlY3Rvcnx8bi5tc01hdGNoZXNTZWxlY3Rvcnx8bi5vTWF0Y2hlc1NlbGVjdG9yfHxuLndlYmtpdE1hdGNoZXNTZWxlY3RvcjtlLmV4cG9ydHM9cn0se31dLDE0OltmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIG4odCl7aWYodD09PWRvY3VtZW50LmRvY3VtZW50RWxlbWVudClyZXR1cm4hMTtpZih0LnRhYmJhYmxlQ2FjaGVJbmRleClyZXR1cm4gclt0LnRhYmJhYmxlQ2FjaGVJbmRleF07dmFyIGU9ITEsdT13aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0KTtyZXR1cm5cImhpZGRlblwiPT09dS52aXNpYmlsaXR5fHxcIm5vbmVcIj09PXUuZGlzcGxheT9lPSEwOnQucGFyZW50Tm9kZSYmKGU9bih0LnBhcmVudE5vZGUpKSx0LnRhYmJhYmxlQ2FjaGVJbmRleD1vLHJbdC50YWJiYWJsZUNhY2hlSW5kZXhdPWUsbysrLGV9ZS5leHBvcnRzPWZ1bmN0aW9uKHQpe2Zvcih2YXIgZSxyLG89W10sdT1bXSxpPXQucXVlcnlTZWxlY3RvckFsbChcImlucHV0LCBzZWxlY3QsIGEsIHRleHRhcmVhLCBidXR0b24sIFt0YWJpbmRleF1cIiksYT1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChpKSxjPTAsZj1hLmxlbmd0aDtmPmM7YysrKWU9YVtjXSxyPWUudGFiSW5kZXgsMD5yfHxcIklOUFVUXCI9PT1lLnRhZ05hbWUmJlwiaGlkZGVuXCI9PT1lLnR5cGV8fFwiQVwiPT09ZS50YWdOYW1lJiYhZS5ocmVmJiYhZS50YWJJbmRleHx8ZS5kaXNhYmxlZHx8bihlKXx8KDA9PT1yP28ucHVzaChlKTp1LnB1c2goe3RhYkluZGV4OnIsbm9kZTplfSkpO3ZhciBsPXUuc29ydChmdW5jdGlvbih0LGUpe3JldHVybiB0LnRhYkluZGV4LWUudGFiSW5kZXh9KS5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQubm9kZX0pO3JldHVybiBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShsLG8pLGx9O3ZhciByPXt9LG89MX0se31dLDE1OltmdW5jdGlvbih0LGUpeyFmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7Tj1MLmRlZmF1bHRzKHt9LHQsRiksTi5tZW51PUwuZmluZChOLm1lbnUpLE4uc2VhcmNoPU4ubWVudS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbdHlwZT1zZWFyY2hdXCIpLE4uYWN0aXZlJiZMLmFkZENsYXNzKE4ubWVudSxOLmFjdGl2ZUNsYXNzKSxOLmNsb3NlPUwuY3JlYXRlKFwiYnV0dG9uXCIsXCJmd3MtbWVudS1jbG9zZVwiLE4ubWVudSksTi5jbG9zZS5pbm5lckhUTUw9XCImdGltZXM7XCIsTi5tZW51LnNldEF0dHJpYnV0ZShcInJvbGVcIixcIm5hdmlnYXRpb25cIiksTC5hZGRDbGFzcyhOLm1lbnUucXVlcnlTZWxlY3RvcihcInVsXCIpLE4ucm9vdFVsQ2xhc3MpLGsoKSx1KCkscigpfWZ1bmN0aW9uIHIoKXtkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLE8pLGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsaiksTi5tZW51LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLGIpLE4ubWVudS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIixfKSxOLmNsb3NlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLEUpfWZ1bmN0aW9uIG8oKXtkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLE8pLGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsaiksTi5tZW51LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLGIpLE4ubWVudS5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIixfKSxOLmNsb3NlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLEUpfWZ1bmN0aW9uIHUoKXt2YXIgdD1OLm1lbnUucXVlcnlTZWxlY3RvcihcInVsXCIpLGU9dC5xdWVyeVNlbGVjdG9yQWxsKFwidWxcIik7TC5lYWNoKGUsZnVuY3Rpb24odCl7dmFyIGU9TC5jbG9zZXN0KFwibGlcIix0KTtMLmFkZENsYXNzKGUsXCJoYXMtY2hpbGRyZW5cIiksTC5yZW1vdmVDbGFzcyh0LFwibW92ZS1vdXRcIiksTC5hZGRDbGFzcyh0LE4uc3ViTWVudUNsYXNzK1wiIG1lbnUtaGlkZGVuXCIpLGModCl9KX1mdW5jdGlvbiBpKCl7dmFyIHQ9TC5jcmVhdGUoXCJsaVwiLFwibWVudS1iYWNrIGJhY2stYmxvY2tcIik7cmV0dXJuIHQuaW5uZXJIVE1MPVwiQmFja1wiLHR9ZnVuY3Rpb24gYSgpe3ZhciB0PUwuY3JlYXRlKFwibGlcIiksZT1MLmNyZWF0ZShcImFcIixcIm1lbnUtYmFja1wiLHQpO3JldHVybiBlLmlubmVySFRNTD1cIkJhY2tcIixlLnNldEF0dHJpYnV0ZShcImhyZWZcIixcIiNiYWNrXCIpLHR9ZnVuY3Rpb24gYyh0KXt2YXIgZT10LnF1ZXJ5U2VsZWN0b3IoXCJsaVwiKSxuPWEoKSxyPWkoKTt0Lmluc2VydEJlZm9yZShuLGUpLHQuYXBwZW5kQ2hpbGQocil9ZnVuY3Rpb24gZigpe3ZhciB0PU4ubWVudS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYWN0aXZlXCIpO2woKSx0JiZzKHQpfWZ1bmN0aW9uIGwoKXt2YXIgdD1OLm1lbnUucXVlcnlTZWxlY3RvckFsbChcImFcIik7TC5lYWNoKHQsZnVuY3Rpb24odCl7dC5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLC0xKX0pfWZ1bmN0aW9uIHModCl7dmFyIGU9cCh0KTtMLmVhY2goZSxmdW5jdGlvbih0KXt0LnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsMCl9KX1mdW5jdGlvbiBwKHQpe3ZhciBlPXQuY2hpbGRyZW4sbj1bXTtyZXR1cm4gTC5lYWNoKGUsZnVuY3Rpb24odCl7dmFyIGU9dC5jaGlsZHJlbjtMLmVhY2goZSxmdW5jdGlvbih0KXtcIkFcIj09PXQubm9kZU5hbWUmJm4ucHVzaCh0KX0pfSksbn1mdW5jdGlvbiBkKHQpe0wuYWRkQ2xhc3ModCxcIm1vdmUtb3V0XCIpLEwucmVtb3ZlQ2xhc3ModCxcIm1lbnUtYWN0aXZlXCIpfWZ1bmN0aW9uIHYodCl7TC5yZW1vdmVDbGFzcyh0LFwibW92ZS1vdXRcIiksTC5hZGRDbGFzcyh0LFwibWVudS1hY3RpdmVcIiksdC5xdWVyeVNlbGVjdG9yKFwiYVwiKS5mb2N1cygpfWZ1bmN0aW9uIGgodCl7TC5hZGRDbGFzcyh0LFwibWVudS1oaWRkZW5cIiksTC5yZW1vdmVDbGFzcyh0LFwibWVudS1hY3RpdmVcIil9ZnVuY3Rpb24geSh0KXtMLmFkZENsYXNzKHQsXCJtZW51LWFjdGl2ZVwiKSxMLnJlbW92ZUNsYXNzKHQsXCJtZW51LWhpZGRlblwiKSx0LnF1ZXJ5U2VsZWN0b3IoXCJhXCIpLmZvY3VzKCl9ZnVuY3Rpb24gYih0KXtpZihcIlVMXCIhPT10LnRhcmdldC5ub2RlTmFtZSYmTC5oYXNDbGFzcyh0LnRhcmdldC5wYXJlbnROb2RlLFwiaGFzLWNoaWxkcmVuXCIpKXt2YXIgZT10LnRhcmdldC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoXCJ1bFwiKSxuPUwuY2xvc2VzdChcInVsXCIsdC50YXJnZXQpO2cobixlKX19ZnVuY3Rpb24gZyh0LGUpe2QodCkseShlKSxmKCl9ZnVuY3Rpb24gXyh0KXtpZihMLmhhc0NsYXNzKHQudGFyZ2V0LFwibWVudS1iYWNrXCIpKXt0LnByZXZlbnREZWZhdWx0KCk7dmFyIGU9TC5jbG9zZXN0KFwidWxcIix0LnRhcmdldCk7bShlKX19ZnVuY3Rpb24gbSh0KXt2YXIgZT1MLmNsb3Nlc3QoXCJ1bC5tb3ZlLW91dFwiLHQpO2UmJnYoZSksaCh0KSxmKCl9ZnVuY3Rpb24gdygpe0wuZWFjaChOLm1lbnUucXVlcnlTZWxlY3RvckFsbChcIi5zdWItbWVudVwiKSxtKX1mdW5jdGlvbiBqKHQpe2lmKE4uYWN0aXZlKXt2YXIgZSxuOzI3PT09dC5rZXlDb2RlJiZFKCksNDA9PT10LmtleUNvZGUmJkMoXCJuZXh0XCIpLDM4PT09dC5rZXlDb2RlJiZDKFwibGFzdFwiKSwzNz09PXQua2V5Q29kZSYmbShOLm1lbnUucXVlcnlTZWxlY3RvcihcIi5tZW51LWFjdGl2ZVwiKSksMzk9PT10LmtleUNvZGUmJkwuaGFzQ2xhc3ModC50YXJnZXQucGFyZW50Tm9kZSxcImhhcy1jaGlsZHJlblwiKSYmKGU9TC5jbG9zZXN0KFwidWxcIix0LnRhcmdldCksbj10LnRhcmdldC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoXCJ1bFwiKSxnKGUsbikpfX1mdW5jdGlvbiBDKHQpe3ZhciBlLG4scj1MLnRhYmJhYmxlKE4ubWVudSk7aWYoXCJuZXh0XCI9PT10KW49MTtlbHNle2lmKFwibGFzdFwiIT09dCl0aHJvdyBuZXcgRXJyb3IoXCJEaXJlY3Rpb24gZm9yIF9nb1RvVGFiYmFibGVFbGVtZW50IG11c3QgYmUgJ25leHQnIG9yICdsYXN0Jy5cIik7bj0tMX1yZXR1cm4gTC5oYXNDbGFzcyhkb2N1bWVudC5hY3RpdmVFbGVtZW50LE4udG9nZ2xlQ2xhc3MpP3ZvaWQgclswXS5mb2N1cygpOihMLmVhY2gocixmdW5jdGlvbih0LHIpe2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQ9PT10JiYoZT1yK24pfSksLTE9PT1lP2U9MDplPT09ci5sZW5ndGgmJihlLT0xKSx2b2lkIHJbZV0uZm9jdXMoKSl9ZnVuY3Rpb24gTyh0KXtMLmhhc0NsYXNzKHQudGFyZ2V0LE4udG9nZ2xlQ2xhc3MpJiZTKCl9ZnVuY3Rpb24geCgpe04uYWN0aXZlfHwoQSgpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtOLnNlYXJjaC5mb2N1cygpfSw0MDApKX1mdW5jdGlvbiBTKCl7Ti5hY3RpdmU/RSgpOkEoKX1mdW5jdGlvbiBBKCl7Ti5hY3RpdmU9ITA7dmFyIHQ9Ti5tZW51LnF1ZXJ5U2VsZWN0b3IoXCIuXCIrTi5yb290VWxDbGFzcyk7TC5hZGRDbGFzcyhOLm1lbnUsTi5hY3RpdmVDbGFzcyksTC5hZGRDbGFzcyh0LFwibWVudS1hY3RpdmVcIiksZigpfWZ1bmN0aW9uIEUoKXtOLmFjdGl2ZT0hMTt2YXIgdD1OLm1lbnUucXVlcnlTZWxlY3RvcihcIi5cIitOLnJvb3RVbENsYXNzKTtMLnJlbW92ZUNsYXNzKE4ubWVudSxOLmFjdGl2ZUNsYXNzKSxMLnJlbW92ZUNsYXNzKHQsXCJtZW51LWFjdGl2ZVwiKSx3KCl9ZnVuY3Rpb24gaygpe3ZhciB0PVtcImxlZnRcIixcInJpZ2h0XCJdO2lmKCEodC5pbmRleE9mKE4ucG9zaXRpb24pPj0wKSl0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHBvc2l0aW9uLiAgTXVzdCBiZSBvbmUgb2Y6IFwiK3ZhaWxkUG9zaXRpb25zLmpvaW4oXCIsIFwiKSk7TC5hZGRDbGFzcyhOLm1lbnUsXCJtZW51LVwiK04ucG9zaXRpb24pfXZhciBOLEw9dChcIi4vdXRpbFwiKSxGPXthY3RpdmU6ITEsbWVudTpcIi5md3MtbWVudVwiLHBvc2l0aW9uOlwicmlnaHRcIixuYXZDbGFzczpcImZ3cy1tZW51XCIsdG9nZ2xlQ2xhc3M6XCJtZW51LXRvZ2dsZVwiLHN1Yk1lbnVDbGFzczpcInN1Yi1tZW51XCIsYWN0aXZlQ2xhc3M6XCJmd3MtbWVudS1hY3RpdmVcIixyb290VWxDbGFzczpcImZ3cy1tZW51LWNvbnRlbnRcIn07ZS5leHBvcnRzLmluaXQ9bixlLmV4cG9ydHMudG9nZ2xlPVMsZS5leHBvcnRzLnNob3c9QSxlLmV4cG9ydHMuaGlkZT1FLGUuZXhwb3J0cy5kZXN0cm95PW8sZS5leHBvcnRzLnRvZ2dsZVNlYXJjaD14fSgpfSx7XCIuL3V0aWxcIjoxNn1dLDE2OltmdW5jdGlvbih0LGUpeyFmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7aWYoYi5pc0RvbSh0KSlyZXR1cm4gdDtpZih0PWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodCksYi5pc0RvbSh0KSlyZXR1cm4gdDt0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgZmluZCBlbGVtZW50LlwiKX1mdW5jdGlvbiByKHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0P2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKHQpOnR9ZnVuY3Rpb24gbyh0LGUpe3ZhciBuPXQuc3R5bGVbZV18fHQuY3VycmVudFN0eWxlJiZ0LmN1cnJlbnRTdHlsZVtlXTtpZigoIW58fFwiYXV0b1wiPT09bikmJmRvY3VtZW50LmRlZmF1bHRWaWV3KXt2YXIgcj1kb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKHQsbnVsbCk7bj1yP3JbZV06bnVsbH1yZXR1cm5cImF1dG9cIj09PW4/bnVsbDpufWZ1bmN0aW9uIHUodCxlLG4pe3ZhciByPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodCk7cmV0dXJuIGUmJihyLmNsYXNzTmFtZT1lKSxuJiZuLmFwcGVuZENoaWxkKHIpLHJ9ZnVuY3Rpb24gaSh0KXt2YXIgZT10LnBhcmVudE5vZGU7ZSYmZS5yZW1vdmVDaGlsZCh0KX1mdW5jdGlvbiBhKHQpe2Zvcig7dC5maXJzdENoaWxkOyl0LnJlbW92ZUNoaWxkKHQuZmlyc3RDaGlsZCl9ZnVuY3Rpb24gYyh0KXt0LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodCl9ZnVuY3Rpb24gZih0KXt2YXIgZT10LnBhcmVudE5vZGU7ZS5pbnNlcnRCZWZvcmUodCxlLmZpcnN0Q2hpbGQpfWZ1bmN0aW9uIGwodCxlKXtpZih2b2lkIDAhPT10LmNsYXNzTGlzdClyZXR1cm4gdC5jbGFzc0xpc3QuY29udGFpbnMoZSk7dmFyIG49eSh0KTtyZXR1cm4gbi5sZW5ndGg+MCYmbmV3IFJlZ0V4cChcIihefFxcXFxzKVwiK2UrXCIoXFxcXHN8JClcIikudGVzdChuKX1mdW5jdGlvbiBzKHQpe3JldHVybiBwKHQpLnNwbGl0KC9cXHMrLyl9ZnVuY3Rpb24gcCh0KXtyZXR1cm4gdC50cmltP3QudHJpbSgpOnQucmVwbGFjZSgvXlxccyt8XFxzKyQvZyxcIlwiKX1mdW5jdGlvbiBkKHQsZSl7aWYodm9pZCAwIT09dC5jbGFzc0xpc3QpZm9yKHZhciBuPXMoZSkscj0wLG89bi5sZW5ndGg7bz5yO3IrKyl0LmNsYXNzTGlzdC5hZGQobltyXSk7ZWxzZSBpZighbCh0LGUpKXt2YXIgdT15KHQpO2godCwodT91K1wiIFwiOlwiXCIpK2UpfX1mdW5jdGlvbiB2KHQsZSl7dm9pZCAwIT09dC5jbGFzc0xpc3Q/dC5jbGFzc0xpc3QucmVtb3ZlKGUpOmgodCxwKChcIiBcIit5KHQpK1wiIFwiKS5yZXBsYWNlKFwiIFwiK2UrXCIgXCIsXCIgXCIpKSl9ZnVuY3Rpb24gaCh0LGUpe3ZvaWQgMD09PXQuY2xhc3NOYW1lLmJhc2VWYWw/dC5jbGFzc05hbWU9ZTp0LmNsYXNzTmFtZS5iYXNlVmFsPWV9ZnVuY3Rpb24geSh0KXtyZXR1cm4gdm9pZCAwPT09dC5jbGFzc05hbWUuYmFzZVZhbD90LmNsYXNzTmFtZTp0LmNsYXNzTmFtZS5iYXNlVmFsfXZhciBiPXtkZWZhdWx0czp0KFwibG9kYXNoLmRlZmF1bHRzXCIpLGVhY2g6dChcImxvZGFzaC5mb3JlYWNoXCIpLGNsb3Nlc3Q6dChcInNlbGVjdC1wYXJlbnRcIiksaXNEb206dChcImlzLWRvbVwiKSx0YWJiYWJsZTp0KFwidGFiYmFibGVcIiksZmluZDpuLGdldDpyLGdldFN0eWxlOm8sY3JlYXRlOnUscmVtb3ZlOmksZW1wdHk6YSx0b0Zyb250OmMsdG9CYWNrOmYsaGFzQ2xhc3M6bCxzcGxpdFdvcmRzOnMsdHJpbTpwLGFkZENsYXNzOmQscmVtb3ZlQ2xhc3M6dixzZXRDbGFzczpoLGdldENsYXNzOnl9O2UuZXhwb3J0cz1ifSgpfSx7XCJpcy1kb21cIjoxLFwibG9kYXNoLmRlZmF1bHRzXCI6NyxcImxvZGFzaC5mb3JlYWNoXCI6OCxcInNlbGVjdC1wYXJlbnRcIjoxMix0YWJiYWJsZToxNH1dfSx7fSxbMTVdKSgxNSl9KTsiLCIhZnVuY3Rpb24odCl7aWYoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGUpbW9kdWxlLmV4cG9ydHM9dCgpO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShbXSx0KTtlbHNle3ZhciBuO249XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGY/c2VsZjp0aGlzLG4uU2Nyb2xsbmF2PXQoKX19KGZ1bmN0aW9uKCl7cmV0dXJuIGZ1bmN0aW9uIHQobixlLHIpe2Z1bmN0aW9uIG8odSxhKXtpZighZVt1XSl7aWYoIW5bdV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWEmJmMpcmV0dXJuIGModSwhMCk7aWYoaSlyZXR1cm4gaSh1LCEwKTt2YXIgcz1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK3UrXCInXCIpO3Rocm93IHMuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixzfXZhciBmPWVbdV09e2V4cG9ydHM6e319O25bdV1bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24odCl7dmFyIGU9blt1XVsxXVt0XTtyZXR1cm4gbyhlP2U6dCl9LGYsZi5leHBvcnRzLHQsbixlLHIpfXJldHVybiBlW3VdLmV4cG9ydHN9Zm9yKHZhciBpPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsdT0wO3U8ci5sZW5ndGg7dSsrKW8oclt1XSk7cmV0dXJuIG99KHsxOltmdW5jdGlvbih0LG4pe2Z1bmN0aW9uIGUodCl7c3dpdGNoKHIodCkpe2Nhc2VcIm9iamVjdFwiOnZhciBuPXt9O2Zvcih2YXIgbyBpbiB0KXQuaGFzT3duUHJvcGVydHkobykmJihuW29dPWUodFtvXSkpO3JldHVybiBuO2Nhc2VcImFycmF5XCI6Zm9yKHZhciBuPW5ldyBBcnJheSh0Lmxlbmd0aCksaT0wLHU9dC5sZW5ndGg7dT5pO2krKyluW2ldPWUodFtpXSk7cmV0dXJuIG47Y2FzZVwicmVnZXhwXCI6dmFyIGE9XCJcIjtyZXR1cm4gYSs9dC5tdWx0aWxpbmU/XCJtXCI6XCJcIixhKz10Lmdsb2JhbD9cImdcIjpcIlwiLGErPXQuaWdub3JlQ2FzZT9cImlcIjpcIlwiLG5ldyBSZWdFeHAodC5zb3VyY2UsYSk7Y2FzZVwiZGF0ZVwiOnJldHVybiBuZXcgRGF0ZSh0LmdldFRpbWUoKSk7ZGVmYXVsdDpyZXR1cm4gdH19dmFyIHI7dHJ5e3I9dChcImNvbXBvbmVudC10eXBlXCIpfWNhdGNoKG8pe3I9dChcInR5cGVcIil9bi5leHBvcnRzPWV9LHtcImNvbXBvbmVudC10eXBlXCI6NSx0eXBlOjV9XSwyOltmdW5jdGlvbih0LG4sZSl7ZnVuY3Rpb24gcih0KXt2YXIgbj0obmV3IERhdGUpLmdldFRpbWUoKSxlPU1hdGgubWF4KDAsMTYtKG4tbykpLHI9c2V0VGltZW91dCh0LGUpO3JldHVybiBvPW4scn1lPW4uZXhwb3J0cz13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lfHxyO3ZhciBvPShuZXcgRGF0ZSkuZ2V0VGltZSgpLGk9d2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lfHx3aW5kb3cud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWV8fHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZXx8d2luZG93LmNsZWFyVGltZW91dDtlLmNhbmNlbD1mdW5jdGlvbih0KXtpLmNhbGwod2luZG93LHQpfX0se31dLDM6W2Z1bmN0aW9uKHQsbil7ZnVuY3Rpb24gZSh0KXtyZXR1cm4gdGhpcyBpbnN0YW5jZW9mIGU/KHRoaXMuX2Zyb209dCx0aGlzLmVhc2UoXCJsaW5lYXJcIiksdm9pZCB0aGlzLmR1cmF0aW9uKDUwMCkpOm5ldyBlKHQpfXZhciByPXQoXCJlbWl0dGVyXCIpLG89dChcImNsb25lXCIpLGk9dChcInR5cGVcIiksdT10KFwiZWFzZVwiKTtuLmV4cG9ydHM9ZSxyKGUucHJvdG90eXBlKSxlLnByb3RvdHlwZS5yZXNldD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmlzQXJyYXk9XCJhcnJheVwiPT09aSh0aGlzLl9mcm9tKSx0aGlzLl9jdXJyPW8odGhpcy5fZnJvbSksdGhpcy5fZG9uZT0hMSx0aGlzLl9zdGFydD1EYXRlLm5vdygpLHRoaXN9LGUucHJvdG90eXBlLnRvPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLnJlc2V0KCksdGhpcy5fdG89dCx0aGlzfSxlLnByb3RvdHlwZS5kdXJhdGlvbj1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5fZHVyYXRpb249dCx0aGlzfSxlLnByb3RvdHlwZS5lYXNlPWZ1bmN0aW9uKHQpe2lmKHQ9XCJmdW5jdGlvblwiPT10eXBlb2YgdD90OnVbdF0sIXQpdGhyb3cgbmV3IFR5cGVFcnJvcihcImludmFsaWQgZWFzaW5nIGZ1bmN0aW9uXCIpO3JldHVybiB0aGlzLl9lYXNlPXQsdGhpc30sZS5wcm90b3R5cGUuc3RvcD1mdW5jdGlvbigpe3JldHVybiB0aGlzLnN0b3BwZWQ9ITAsdGhpcy5fZG9uZT0hMCx0aGlzLmVtaXQoXCJzdG9wXCIpLHRoaXMuZW1pdChcImVuZFwiKSx0aGlzfSxlLnByb3RvdHlwZS5zdGVwPWZ1bmN0aW9uKCl7aWYoIXRoaXMuX2RvbmUpe3ZhciB0PXRoaXMuX2R1cmF0aW9uLG49RGF0ZS5ub3coKSxlPW4tdGhpcy5fc3RhcnQscj1lPj10O2lmKHIpcmV0dXJuIHRoaXMuX2Zyb209dGhpcy5fdG8sdGhpcy5fdXBkYXRlKHRoaXMuX3RvKSx0aGlzLl9kb25lPSEwLHRoaXMuZW1pdChcImVuZFwiKSx0aGlzO3ZhciBvPXRoaXMuX2Zyb20saT10aGlzLl90byx1PXRoaXMuX2N1cnIsYT10aGlzLl9lYXNlLGM9KG4tdGhpcy5fc3RhcnQpL3Qscz1hKGMpO2lmKHRoaXMuaXNBcnJheSl7Zm9yKHZhciBmPTA7ZjxvLmxlbmd0aDsrK2YpdVtmXT1vW2ZdKyhpW2ZdLW9bZl0pKnM7cmV0dXJuIHRoaXMuX3VwZGF0ZSh1KSx0aGlzfWZvcih2YXIgbCBpbiBvKXVbbF09b1tsXSsoaVtsXS1vW2xdKSpzO3JldHVybiB0aGlzLl91cGRhdGUodSksdGhpc319LGUucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbih0KXtyZXR1cm4gMD09YXJndW1lbnRzLmxlbmd0aD90aGlzLnN0ZXAoKToodGhpcy5fdXBkYXRlPXQsdGhpcyl9fSx7Y2xvbmU6MSxlYXNlOjYsZW1pdHRlcjo0LHR5cGU6NX1dLDQ6W2Z1bmN0aW9uKHQsbil7ZnVuY3Rpb24gZSh0KXtyZXR1cm4gdD9yKHQpOnZvaWQgMH1mdW5jdGlvbiByKHQpe2Zvcih2YXIgbiBpbiBlLnByb3RvdHlwZSl0W25dPWUucHJvdG90eXBlW25dO3JldHVybiB0fW4uZXhwb3J0cz1lLGUucHJvdG90eXBlLm9uPWUucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI9ZnVuY3Rpb24odCxuKXtyZXR1cm4gdGhpcy5fY2FsbGJhY2tzPXRoaXMuX2NhbGxiYWNrc3x8e30sKHRoaXMuX2NhbGxiYWNrc1tcIiRcIit0XT10aGlzLl9jYWxsYmFja3NbXCIkXCIrdF18fFtdKS5wdXNoKG4pLHRoaXN9LGUucHJvdG90eXBlLm9uY2U9ZnVuY3Rpb24odCxuKXtmdW5jdGlvbiBlKCl7dGhpcy5vZmYodCxlKSxuLmFwcGx5KHRoaXMsYXJndW1lbnRzKX1yZXR1cm4gZS5mbj1uLHRoaXMub24odCxlKSx0aGlzfSxlLnByb3RvdHlwZS5vZmY9ZS5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI9ZS5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzPWUucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXI9ZnVuY3Rpb24odCxuKXtpZih0aGlzLl9jYWxsYmFja3M9dGhpcy5fY2FsbGJhY2tzfHx7fSwwPT1hcmd1bWVudHMubGVuZ3RoKXJldHVybiB0aGlzLl9jYWxsYmFja3M9e30sdGhpczt2YXIgZT10aGlzLl9jYWxsYmFja3NbXCIkXCIrdF07aWYoIWUpcmV0dXJuIHRoaXM7aWYoMT09YXJndW1lbnRzLmxlbmd0aClyZXR1cm4gZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tcIiRcIit0XSx0aGlzO2Zvcih2YXIgcixvPTA7bzxlLmxlbmd0aDtvKyspaWYocj1lW29dLHI9PT1ufHxyLmZuPT09bil7ZS5zcGxpY2UobywxKTticmVha31yZXR1cm4gdGhpc30sZS5wcm90b3R5cGUuZW1pdD1mdW5jdGlvbih0KXt0aGlzLl9jYWxsYmFja3M9dGhpcy5fY2FsbGJhY2tzfHx7fTt2YXIgbj1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKSxlPXRoaXMuX2NhbGxiYWNrc1tcIiRcIit0XTtpZihlKXtlPWUuc2xpY2UoMCk7Zm9yKHZhciByPTAsbz1lLmxlbmd0aDtvPnI7KytyKWVbcl0uYXBwbHkodGhpcyxuKX1yZXR1cm4gdGhpc30sZS5wcm90b3R5cGUubGlzdGVuZXJzPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9jYWxsYmFja3M9dGhpcy5fY2FsbGJhY2tzfHx7fSx0aGlzLl9jYWxsYmFja3NbXCIkXCIrdF18fFtdfSxlLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnM9ZnVuY3Rpb24odCl7cmV0dXJuISF0aGlzLmxpc3RlbmVycyh0KS5sZW5ndGh9fSx7fV0sNTpbZnVuY3Rpb24odCxuKXt2YXIgZT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO24uZXhwb3J0cz1mdW5jdGlvbih0KXtzd2l0Y2goZS5jYWxsKHQpKXtjYXNlXCJbb2JqZWN0IERhdGVdXCI6cmV0dXJuXCJkYXRlXCI7Y2FzZVwiW29iamVjdCBSZWdFeHBdXCI6cmV0dXJuXCJyZWdleHBcIjtjYXNlXCJbb2JqZWN0IEFyZ3VtZW50c11cIjpyZXR1cm5cImFyZ3VtZW50c1wiO2Nhc2VcIltvYmplY3QgQXJyYXldXCI6cmV0dXJuXCJhcnJheVwiO2Nhc2VcIltvYmplY3QgRXJyb3JdXCI6cmV0dXJuXCJlcnJvclwifXJldHVybiBudWxsPT09dD9cIm51bGxcIjp2b2lkIDA9PT10P1widW5kZWZpbmVkXCI6dCE9PXQ/XCJuYW5cIjp0JiYxPT09dC5ub2RlVHlwZT9cImVsZW1lbnRcIjoodD10LnZhbHVlT2Y/dC52YWx1ZU9mKCk6T2JqZWN0LnByb3RvdHlwZS52YWx1ZU9mLmFwcGx5KHQpLHR5cGVvZiB0KX19LHt9XSw2OltmdW5jdGlvbih0LG4sZSl7ZS5saW5lYXI9ZnVuY3Rpb24odCl7cmV0dXJuIHR9LGUuaW5RdWFkPWZ1bmN0aW9uKHQpe3JldHVybiB0KnR9LGUub3V0UXVhZD1mdW5jdGlvbih0KXtyZXR1cm4gdCooMi10KX0sZS5pbk91dFF1YWQ9ZnVuY3Rpb24odCl7cmV0dXJuIHQqPTIsMT50Py41KnQqdDotLjUqKC0tdCoodC0yKS0xKX0sZS5pbkN1YmU9ZnVuY3Rpb24odCl7cmV0dXJuIHQqdCp0fSxlLm91dEN1YmU9ZnVuY3Rpb24odCl7cmV0dXJuLS10KnQqdCsxfSxlLmluT3V0Q3ViZT1mdW5jdGlvbih0KXtyZXR1cm4gdCo9MiwxPnQ/LjUqdCp0KnQ6LjUqKCh0LT0yKSp0KnQrMil9LGUuaW5RdWFydD1mdW5jdGlvbih0KXtyZXR1cm4gdCp0KnQqdH0sZS5vdXRRdWFydD1mdW5jdGlvbih0KXtyZXR1cm4gMS0gLS10KnQqdCp0fSxlLmluT3V0UXVhcnQ9ZnVuY3Rpb24odCl7cmV0dXJuIHQqPTIsMT50Py41KnQqdCp0KnQ6LS41KigodC09MikqdCp0KnQtMil9LGUuaW5RdWludD1mdW5jdGlvbih0KXtyZXR1cm4gdCp0KnQqdCp0fSxlLm91dFF1aW50PWZ1bmN0aW9uKHQpe3JldHVybi0tdCp0KnQqdCp0KzF9LGUuaW5PdXRRdWludD1mdW5jdGlvbih0KXtyZXR1cm4gdCo9MiwxPnQ/LjUqdCp0KnQqdCp0Oi41KigodC09MikqdCp0KnQqdCsyKX0sZS5pblNpbmU9ZnVuY3Rpb24odCl7cmV0dXJuIDEtTWF0aC5jb3ModCpNYXRoLlBJLzIpfSxlLm91dFNpbmU9ZnVuY3Rpb24odCl7cmV0dXJuIE1hdGguc2luKHQqTWF0aC5QSS8yKX0sZS5pbk91dFNpbmU9ZnVuY3Rpb24odCl7cmV0dXJuLjUqKDEtTWF0aC5jb3MoTWF0aC5QSSp0KSl9LGUuaW5FeHBvPWZ1bmN0aW9uKHQpe3JldHVybiAwPT10PzA6TWF0aC5wb3coMTAyNCx0LTEpfSxlLm91dEV4cG89ZnVuY3Rpb24odCl7cmV0dXJuIDE9PXQ/dDoxLU1hdGgucG93KDIsLTEwKnQpfSxlLmluT3V0RXhwbz1mdW5jdGlvbih0KXtyZXR1cm4gMD09dD8wOjE9PXQ/MToodCo9Mik8MT8uNSpNYXRoLnBvdygxMDI0LHQtMSk6LjUqKC1NYXRoLnBvdygyLC0xMCoodC0xKSkrMil9LGUuaW5DaXJjPWZ1bmN0aW9uKHQpe3JldHVybiAxLU1hdGguc3FydCgxLXQqdCl9LGUub3V0Q2lyYz1mdW5jdGlvbih0KXtyZXR1cm4gTWF0aC5zcXJ0KDEtIC0tdCp0KX0sZS5pbk91dENpcmM9ZnVuY3Rpb24odCl7cmV0dXJuIHQqPTIsMT50Py0uNSooTWF0aC5zcXJ0KDEtdCp0KS0xKTouNSooTWF0aC5zcXJ0KDEtKHQtPTIpKnQpKzEpfSxlLmluQmFjaz1mdW5jdGlvbih0KXt2YXIgbj0xLjcwMTU4O3JldHVybiB0KnQqKChuKzEpKnQtbil9LGUub3V0QmFjaz1mdW5jdGlvbih0KXt2YXIgbj0xLjcwMTU4O3JldHVybi0tdCp0KigobisxKSp0K24pKzF9LGUuaW5PdXRCYWNrPWZ1bmN0aW9uKHQpe3ZhciBuPTIuNTk0OTA5NTtyZXR1cm4odCo9Mik8MT8uNSp0KnQqKChuKzEpKnQtbik6LjUqKCh0LT0yKSp0KigobisxKSp0K24pKzIpfSxlLmluQm91bmNlPWZ1bmN0aW9uKHQpe3JldHVybiAxLWUub3V0Qm91bmNlKDEtdCl9LGUub3V0Qm91bmNlPWZ1bmN0aW9uKHQpe3JldHVybiAxLzIuNzU+dD83LjU2MjUqdCp0OjIvMi43NT50PzcuNTYyNSoodC09MS41LzIuNzUpKnQrLjc1OjIuNS8yLjc1PnQ/Ny41NjI1Kih0LT0yLjI1LzIuNzUpKnQrLjkzNzU6Ny41NjI1Kih0LT0yLjYyNS8yLjc1KSp0Ky45ODQzNzV9LGUuaW5PdXRCb3VuY2U9ZnVuY3Rpb24odCl7cmV0dXJuLjU+dD8uNSplLmluQm91bmNlKDIqdCk6LjUqZS5vdXRCb3VuY2UoMip0LTEpKy41fSxlW1wiaW4tcXVhZFwiXT1lLmluUXVhZCxlW1wib3V0LXF1YWRcIl09ZS5vdXRRdWFkLGVbXCJpbi1vdXQtcXVhZFwiXT1lLmluT3V0UXVhZCxlW1wiaW4tY3ViZVwiXT1lLmluQ3ViZSxlW1wib3V0LWN1YmVcIl09ZS5vdXRDdWJlLGVbXCJpbi1vdXQtY3ViZVwiXT1lLmluT3V0Q3ViZSxlW1wiaW4tcXVhcnRcIl09ZS5pblF1YXJ0LGVbXCJvdXQtcXVhcnRcIl09ZS5vdXRRdWFydCxlW1wiaW4tb3V0LXF1YXJ0XCJdPWUuaW5PdXRRdWFydCxlW1wiaW4tcXVpbnRcIl09ZS5pblF1aW50LGVbXCJvdXQtcXVpbnRcIl09ZS5vdXRRdWludCxlW1wiaW4tb3V0LXF1aW50XCJdPWUuaW5PdXRRdWludCxlW1wiaW4tc2luZVwiXT1lLmluU2luZSxlW1wib3V0LXNpbmVcIl09ZS5vdXRTaW5lLGVbXCJpbi1vdXQtc2luZVwiXT1lLmluT3V0U2luZSxlW1wiaW4tZXhwb1wiXT1lLmluRXhwbyxlW1wib3V0LWV4cG9cIl09ZS5vdXRFeHBvLGVbXCJpbi1vdXQtZXhwb1wiXT1lLmluT3V0RXhwbyxlW1wiaW4tY2lyY1wiXT1lLmluQ2lyYyxlW1wib3V0LWNpcmNcIl09ZS5vdXRDaXJjLGVbXCJpbi1vdXQtY2lyY1wiXT1lLmluT3V0Q2lyYyxlW1wiaW4tYmFja1wiXT1lLmluQmFjayxlW1wib3V0LWJhY2tcIl09ZS5vdXRCYWNrLGVbXCJpbi1vdXQtYmFja1wiXT1lLmluT3V0QmFjayxlW1wiaW4tYm91bmNlXCJdPWUuaW5Cb3VuY2UsZVtcIm91dC1ib3VuY2VcIl09ZS5vdXRCb3VuY2UsZVtcImluLW91dC1ib3VuY2VcIl09ZS5pbk91dEJvdW5jZX0se31dLDc6W2Z1bmN0aW9uKHQsbil7bi5leHBvcnRzPWZ1bmN0aW9uKHQpe3JldHVybiB0JiZcIm9iamVjdFwiPT10eXBlb2YgdD93aW5kb3cmJlwib2JqZWN0XCI9PXR5cGVvZiB3aW5kb3cuTm9kZT90IGluc3RhbmNlb2Ygd2luZG93Lk5vZGU6XCJudW1iZXJcIj09dHlwZW9mIHQubm9kZVR5cGUmJlwic3RyaW5nXCI9PXR5cGVvZiB0Lm5vZGVOYW1lOiExfX0se31dLDg6W2Z1bmN0aW9uKHQsbil7ZnVuY3Rpb24gZSh0LG4pe2Zvcih2YXIgZT0tMSxyPXQubGVuZ3RoOysrZTxyJiZuKHRbZV0sZSx0KSE9PSExOyk7cmV0dXJuIHR9bi5leHBvcnRzPWV9LHt9XSw5OltmdW5jdGlvbih0LG4peyhmdW5jdGlvbihlKXtmdW5jdGlvbiByKHQsbil7cmV0dXJuIHQmJmIodCxuLGwpfWZ1bmN0aW9uIG8odCl7cmV0dXJuIGZ1bmN0aW9uKG4pe3JldHVybiBudWxsPT1uP3ZvaWQgMDpuW3RdfX1mdW5jdGlvbiBpKHQsbil7cmV0dXJuIGZ1bmN0aW9uKGUscil7aWYobnVsbD09ZSlyZXR1cm4gZTtpZighYShlKSlyZXR1cm4gdChlLHIpO2Zvcih2YXIgbz1lLmxlbmd0aCxpPW4/bzotMSx1PU9iamVjdChlKTsobj9pLS06KytpPG8pJiZyKHVbaV0saSx1KSE9PSExOyk7cmV0dXJuIGV9fWZ1bmN0aW9uIHUodCl7cmV0dXJuIGZ1bmN0aW9uKG4sZSxyKXtmb3IodmFyIG89LTEsaT1PYmplY3QobiksdT1yKG4pLGE9dS5sZW5ndGg7YS0tOyl7dmFyIGM9dVt0P2E6KytvXTtpZihlKGlbY10sYyxpKT09PSExKWJyZWFrfXJldHVybiBufX1mdW5jdGlvbiBhKHQpe3JldHVybiBudWxsIT10JiYhKFwiZnVuY3Rpb25cIj09dHlwZW9mIHQmJmModCkpJiZzKG0odCkpfWZ1bmN0aW9uIGModCl7dmFyIG49Zih0KT95LmNhbGwodCk6XCJcIjtyZXR1cm4gbj09ZHx8bj09aH1mdW5jdGlvbiBzKHQpe3JldHVyblwibnVtYmVyXCI9PXR5cGVvZiB0JiZ0Pi0xJiZ0JTE9PTAmJnA+PXR9ZnVuY3Rpb24gZih0KXt2YXIgbj10eXBlb2YgdDtyZXR1cm4hIXQmJihcIm9iamVjdFwiPT1ufHxcImZ1bmN0aW9uXCI9PW4pfXZhciBsPXQoXCJsb2Rhc2gua2V5c1wiKSxwPTkwMDcxOTkyNTQ3NDA5OTEsZD1cIltvYmplY3QgRnVuY3Rpb25dXCIsaD1cIltvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dXCIsdj1lLk9iamVjdC5wcm90b3R5cGUseT12LnRvU3RyaW5nLGc9aShyKSxiPXUoKSxtPW8oXCJsZW5ndGhcIik7bi5leHBvcnRzPWd9KS5jYWxsKHRoaXMsXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGY/c2VsZjpcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3dpbmRvdzp7fSl9LHtcImxvZGFzaC5rZXlzXCI6MTB9XSwxMDpbZnVuY3Rpb24odCxuKXsoZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSh0LG4pe2Zvcih2YXIgZT0tMSxyPUFycmF5KHQpOysrZTx0OylyW2VdPW4oZSk7cmV0dXJuIHJ9ZnVuY3Rpb24gcih0LG4pe3JldHVybiB0PVwibnVtYmVyXCI9PXR5cGVvZiB0fHxPLnRlc3QodCk/K3Q6LTEsbj1udWxsPT1uP2I6bix0Pi0xJiZ0JTE9PTAmJm4+dH1mdW5jdGlvbiBvKHQsbil7cmV0dXJuIEMuY2FsbCh0LG4pfHxcIm9iamVjdFwiPT10eXBlb2YgdCYmbiBpbiB0JiZudWxsPT09Uyh0KX1mdW5jdGlvbiBpKHQpe3JldHVybiBrKE9iamVjdCh0KSl9ZnVuY3Rpb24gdSh0KXtyZXR1cm4gZnVuY3Rpb24obil7cmV0dXJuIG51bGw9PW4/dm9pZCAwOm5bdF19fWZ1bmN0aW9uIGEodCl7dmFyIG49dD90Lmxlbmd0aDp2b2lkIDA7cmV0dXJuIGQobikmJihOKHQpfHx5KHQpfHxzKHQpKT9lKG4sU3RyaW5nKTpudWxsfWZ1bmN0aW9uIGModCl7dmFyIG49dCYmdC5jb25zdHJ1Y3RvcixlPVwiZnVuY3Rpb25cIj09dHlwZW9mIG4mJm4ucHJvdG90eXBlfHx4O3JldHVybiB0PT09ZX1mdW5jdGlvbiBzKHQpe3JldHVybiBsKHQpJiZDLmNhbGwodCxcImNhbGxlZVwiKSYmKCFFLmNhbGwodCxcImNhbGxlZVwiKXx8QS5jYWxsKHQpPT1tKX1mdW5jdGlvbiBmKHQpe3JldHVybiBudWxsIT10JiYhKFwiZnVuY3Rpb25cIj09dHlwZW9mIHQmJnAodCkpJiZkKFQodCkpfWZ1bmN0aW9uIGwodCl7cmV0dXJuIHYodCkmJmYodCl9ZnVuY3Rpb24gcCh0KXt2YXIgbj1oKHQpP0EuY2FsbCh0KTpcIlwiO3JldHVybiBuPT13fHxuPT1ffWZ1bmN0aW9uIGQodCl7cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIHQmJnQ+LTEmJnQlMT09MCYmYj49dH1mdW5jdGlvbiBoKHQpe3ZhciBuPXR5cGVvZiB0O3JldHVybiEhdCYmKFwib2JqZWN0XCI9PW58fFwiZnVuY3Rpb25cIj09bil9ZnVuY3Rpb24gdih0KXtyZXR1cm4hIXQmJlwib2JqZWN0XCI9PXR5cGVvZiB0fWZ1bmN0aW9uIHkodCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHR8fCFOKHQpJiZ2KHQpJiZBLmNhbGwodCk9PWp9ZnVuY3Rpb24gZyh0KXt2YXIgbj1jKHQpO2lmKCFuJiYhZih0KSlyZXR1cm4gaSh0KTt2YXIgZT1hKHQpLHU9ISFlLHM9ZXx8W10sbD1zLmxlbmd0aDtmb3IodmFyIHAgaW4gdCkhbyh0LHApfHx1JiYoXCJsZW5ndGhcIj09cHx8cihwLGwpKXx8biYmXCJjb25zdHJ1Y3RvclwiPT1wfHxzLnB1c2gocCk7cmV0dXJuIHN9dmFyIGI9OTAwNzE5OTI1NDc0MDk5MSxtPVwiW29iamVjdCBBcmd1bWVudHNdXCIsdz1cIltvYmplY3QgRnVuY3Rpb25dXCIsXz1cIltvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dXCIsaj1cIltvYmplY3QgU3RyaW5nXVwiLE89L14oPzowfFsxLTldXFxkKikkLyx4PXQuT2JqZWN0LnByb3RvdHlwZSxDPXguaGFzT3duUHJvcGVydHksQT14LnRvU3RyaW5nLFM9T2JqZWN0LmdldFByb3RvdHlwZU9mLEU9eC5wcm9wZXJ0eUlzRW51bWVyYWJsZSxrPU9iamVjdC5rZXlzLFQ9dShcImxlbmd0aFwiKSxOPUFycmF5LmlzQXJyYXk7bi5leHBvcnRzPWd9KS5jYWxsKHRoaXMsXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGY/c2VsZjpcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3dpbmRvdzp7fSl9LHt9XSwxMTpbZnVuY3Rpb24odCxuKXtmdW5jdGlvbiBlKHQsbil7dmFyIGU9W107cmV0dXJuIHIodCxmdW5jdGlvbih0LHIsbyl7bih0LHIsbykmJmUucHVzaCh0KX0pLGV9dmFyIHI9dChcImxvZGFzaC5fYmFzZWVhY2hcIik7bi5leHBvcnRzPWV9LHtcImxvZGFzaC5fYmFzZWVhY2hcIjoxMn1dLDEyOltmdW5jdGlvbih0LG4pe2Z1bmN0aW9uIGUodCxuKXtmb3IodmFyIGU9LTEscj1BcnJheSh0KTsrK2U8dDspcltlXT1uKGUpO3JldHVybiByfWZ1bmN0aW9uIHIodCxuKXtyZXR1cm4gdD1cIm51bWJlclwiPT10eXBlb2YgdHx8Uy50ZXN0KHQpPyt0Oi0xLG49bnVsbD09bj9qOm4sdD4tMSYmdCUxPT0wJiZuPnR9ZnVuY3Rpb24gbyh0LG4pe3JldHVybiB0JiZxKHQsbixfKX1mdW5jdGlvbiBpKHQsbil7cmV0dXJuIGsuY2FsbCh0LG4pfHxcIm9iamVjdFwiPT10eXBlb2YgdCYmbiBpbiB0JiZudWxsPT09Zih0KX1mdW5jdGlvbiB1KHQpe3JldHVybiBGKE9iamVjdCh0KSl9ZnVuY3Rpb24gYSh0KXtyZXR1cm4gZnVuY3Rpb24obil7cmV0dXJuIG51bGw9PW4/dm9pZCAwOm5bdF19fWZ1bmN0aW9uIGModCxuKXtyZXR1cm4gZnVuY3Rpb24oZSxyKXtpZihudWxsPT1lKXJldHVybiBlO2lmKCFoKGUpKXJldHVybiB0KGUscik7Zm9yKHZhciBvPWUubGVuZ3RoLGk9bj9vOi0xLHU9T2JqZWN0KGUpOyhuP2ktLTorK2k8bykmJnIodVtpXSxpLHUpIT09ITE7KTtyZXR1cm4gZX19ZnVuY3Rpb24gcyh0KXtyZXR1cm4gZnVuY3Rpb24obixlLHIpe2Zvcih2YXIgbz0tMSxpPU9iamVjdChuKSx1PXIobiksYT11Lmxlbmd0aDthLS07KXt2YXIgYz11W3Q/YTorK29dO2lmKGUoaVtjXSxjLGkpPT09ITEpYnJlYWt9cmV0dXJuIG59fWZ1bmN0aW9uIGYodCl7cmV0dXJuICQoT2JqZWN0KHQpKX1mdW5jdGlvbiBsKHQpe3ZhciBuPXQ/dC5sZW5ndGg6dm9pZCAwO3JldHVybiBnKG4pJiYoQih0KXx8dyh0KXx8ZCh0KSk/ZShuLFN0cmluZyk6bnVsbH1mdW5jdGlvbiBwKHQpe3ZhciBuPXQmJnQuY29uc3RydWN0b3IsZT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBuJiZuLnByb3RvdHlwZXx8RTtyZXR1cm4gdD09PWV9ZnVuY3Rpb24gZCh0KXtyZXR1cm4gdih0KSYmay5jYWxsKHQsXCJjYWxsZWVcIikmJighTi5jYWxsKHQsXCJjYWxsZWVcIil8fFQuY2FsbCh0KT09Tyl9ZnVuY3Rpb24gaCh0KXtyZXR1cm4gbnVsbCE9dCYmZyhMKHQpKSYmIXkodCl9ZnVuY3Rpb24gdih0KXtyZXR1cm4gbSh0KSYmaCh0KX1mdW5jdGlvbiB5KHQpe3ZhciBuPWIodCk/VC5jYWxsKHQpOlwiXCI7cmV0dXJuIG49PXh8fG49PUN9ZnVuY3Rpb24gZyh0KXtyZXR1cm5cIm51bWJlclwiPT10eXBlb2YgdCYmdD4tMSYmdCUxPT0wJiZqPj10fWZ1bmN0aW9uIGIodCl7dmFyIG49dHlwZW9mIHQ7cmV0dXJuISF0JiYoXCJvYmplY3RcIj09bnx8XCJmdW5jdGlvblwiPT1uKX1mdW5jdGlvbiBtKHQpe3JldHVybiEhdCYmXCJvYmplY3RcIj09dHlwZW9mIHR9ZnVuY3Rpb24gdyh0KXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdHx8IUIodCkmJm0odCkmJlQuY2FsbCh0KT09QX1mdW5jdGlvbiBfKHQpe3ZhciBuPXAodCk7aWYoIW4mJiFoKHQpKXJldHVybiB1KHQpO3ZhciBlPWwodCksbz0hIWUsYT1lfHxbXSxjPWEubGVuZ3RoO2Zvcih2YXIgcyBpbiB0KSFpKHQscyl8fG8mJihcImxlbmd0aFwiPT1zfHxyKHMsYykpfHxuJiZcImNvbnN0cnVjdG9yXCI9PXN8fGEucHVzaChzKTtyZXR1cm4gYX12YXIgaj05MDA3MTk5MjU0NzQwOTkxLE89XCJbb2JqZWN0IEFyZ3VtZW50c11cIix4PVwiW29iamVjdCBGdW5jdGlvbl1cIixDPVwiW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl1cIixBPVwiW29iamVjdCBTdHJpbmddXCIsUz0vXig/OjB8WzEtOV1cXGQqKSQvLEU9T2JqZWN0LnByb3RvdHlwZSxrPUUuaGFzT3duUHJvcGVydHksVD1FLnRvU3RyaW5nLE49RS5wcm9wZXJ0eUlzRW51bWVyYWJsZSwkPU9iamVjdC5nZXRQcm90b3R5cGVPZixGPU9iamVjdC5rZXlzLE09YyhvKSxxPXMoKSxMPWEoXCJsZW5ndGhcIiksQj1BcnJheS5pc0FycmF5O24uZXhwb3J0cz1NfSx7fV0sMTM6W2Z1bmN0aW9uKHQsbixlKXsoZnVuY3Rpb24ocil7ZnVuY3Rpb24gbyh0LG4pe2Zvcih2YXIgZT0tMSxyPXQubGVuZ3RoLG89QXJyYXkocik7KytlPHI7KW9bZV09bih0W2VdLGUsdCk7cmV0dXJuIG99ZnVuY3Rpb24gaSh0LG4pe2Zvcih2YXIgZT0tMSxyPXQubGVuZ3RoOysrZTxyOylpZihuKHRbZV0sZSx0KSlyZXR1cm4hMDtyZXR1cm4hMX1mdW5jdGlvbiB1KHQsbil7Zm9yKHZhciBlPS0xLHI9QXJyYXkodCk7KytlPHQ7KXJbZV09bihlKTtyZXR1cm4gcn1mdW5jdGlvbiBhKHQsbil7cmV0dXJuIG8obixmdW5jdGlvbihuKXtyZXR1cm5bbix0W25dXX0pfWZ1bmN0aW9uIGModCl7cmV0dXJuIHQmJnQuT2JqZWN0PT09T2JqZWN0P3Q6bnVsbH1mdW5jdGlvbiBzKHQpe3ZhciBuPSExO2lmKG51bGwhPXQmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIHQudG9TdHJpbmcpdHJ5e249ISEodCtcIlwiKX1jYXRjaChlKXt9cmV0dXJuIG59ZnVuY3Rpb24gZih0LG4pe3JldHVybiB0PVwibnVtYmVyXCI9PXR5cGVvZiB0fHxsbi50ZXN0KHQpPyt0Oi0xLG49bnVsbD09bj8kdDpuLHQ+LTEmJnQlMT09MCYmbj50fWZ1bmN0aW9uIGwodCl7dmFyIG49LTEsZT1BcnJheSh0LnNpemUpO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCxyKXtlWysrbl09W3IsdF19KSxlfWZ1bmN0aW9uIHAodCl7dmFyIG49LTEsZT1BcnJheSh0LnNpemUpO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCl7ZVsrK25dPXR9KSxlfWZ1bmN0aW9uIGQoKXt9ZnVuY3Rpb24gaCh0LG4pe3JldHVybiB5KHQsbikmJmRlbGV0ZSB0W25dfWZ1bmN0aW9uIHYodCxuKXtpZihIbil7dmFyIGU9dFtuXTtyZXR1cm4gZT09PWt0P3ZvaWQgMDplfXJldHVybiB4bi5jYWxsKHQsbik/dFtuXTp2b2lkIDB9ZnVuY3Rpb24geSh0LG4pe3JldHVybiBIbj92b2lkIDAhPT10W25dOnhuLmNhbGwodCxuKX1mdW5jdGlvbiBnKHQsbixlKXt0W25dPUhuJiZ2b2lkIDA9PT1lP2t0OmV9ZnVuY3Rpb24gYih0KXt2YXIgbj0tMSxlPXQ/dC5sZW5ndGg6MDtmb3IodGhpcy5jbGVhcigpOysrbjxlOyl7dmFyIHI9dFtuXTt0aGlzLnNldChyWzBdLHJbMV0pfX1mdW5jdGlvbiBtKCl7dGhpcy5fX2RhdGFfXz17aGFzaDpuZXcgZCxtYXA6TW4/bmV3IE1uOltdLHN0cmluZzpuZXcgZH19ZnVuY3Rpb24gdyh0KXt2YXIgbj10aGlzLl9fZGF0YV9fO3JldHVybiBvdCh0KT9oKFwic3RyaW5nXCI9PXR5cGVvZiB0P24uc3RyaW5nOm4uaGFzaCx0KTpNbj9uLm1hcFtcImRlbGV0ZVwiXSh0KTpUKG4ubWFwLHQpfWZ1bmN0aW9uIF8odCl7dmFyIG49dGhpcy5fX2RhdGFfXztyZXR1cm4gb3QodCk/dihcInN0cmluZ1wiPT10eXBlb2YgdD9uLnN0cmluZzpuLmhhc2gsdCk6TW4/bi5tYXAuZ2V0KHQpOk4obi5tYXAsdCl9ZnVuY3Rpb24gaih0KXt2YXIgbj10aGlzLl9fZGF0YV9fO3JldHVybiBvdCh0KT95KFwic3RyaW5nXCI9PXR5cGVvZiB0P24uc3RyaW5nOm4uaGFzaCx0KTpNbj9uLm1hcC5oYXModCk6JChuLm1hcCx0KX1mdW5jdGlvbiBPKHQsbil7dmFyIGU9dGhpcy5fX2RhdGFfXztyZXR1cm4gb3QodCk/ZyhcInN0cmluZ1wiPT10eXBlb2YgdD9lLnN0cmluZzplLmhhc2gsdCxuKTpNbj9lLm1hcC5zZXQodCxuKTpNKGUubWFwLHQsbiksdGhpc31mdW5jdGlvbiB4KHQpe3ZhciBuPS0xLGU9dD90Lmxlbmd0aDowO2Zvcih0aGlzLmNsZWFyKCk7KytuPGU7KXt2YXIgcj10W25dO3RoaXMuc2V0KHJbMF0sclsxXSl9fWZ1bmN0aW9uIEMoKXt0aGlzLl9fZGF0YV9fPXthcnJheTpbXSxtYXA6bnVsbH19ZnVuY3Rpb24gQSh0KXt2YXIgbj10aGlzLl9fZGF0YV9fLGU9bi5hcnJheTtyZXR1cm4gZT9UKGUsdCk6bi5tYXBbXCJkZWxldGVcIl0odCl9ZnVuY3Rpb24gUyh0KXt2YXIgbj10aGlzLl9fZGF0YV9fLGU9bi5hcnJheTtyZXR1cm4gZT9OKGUsdCk6bi5tYXAuZ2V0KHQpfWZ1bmN0aW9uIEUodCl7dmFyIG49dGhpcy5fX2RhdGFfXyxlPW4uYXJyYXk7cmV0dXJuIGU/JChlLHQpOm4ubWFwLmhhcyh0KX1mdW5jdGlvbiBrKHQsbil7dmFyIGU9dGhpcy5fX2RhdGFfXyxyPWUuYXJyYXk7ciYmKHIubGVuZ3RoPEV0LTE/TShyLHQsbik6KGUuYXJyYXk9bnVsbCxlLm1hcD1uZXcgYihyKSkpO3ZhciBvPWUubWFwO3JldHVybiBvJiZvLnNldCh0LG4pLHRoaXN9ZnVuY3Rpb24gVCh0LG4pe3ZhciBlPUYodCxuKTtpZigwPmUpcmV0dXJuITE7dmFyIHI9dC5sZW5ndGgtMTtyZXR1cm4gZT09cj90LnBvcCgpOlRuLmNhbGwodCxlLDEpLCEwfWZ1bmN0aW9uIE4odCxuKXt2YXIgZT1GKHQsbik7cmV0dXJuIDA+ZT92b2lkIDA6dFtlXVsxXX1mdW5jdGlvbiAkKHQsbil7cmV0dXJuIEYodCxuKT4tMX1mdW5jdGlvbiBGKHQsbil7Zm9yKHZhciBlPXQubGVuZ3RoO2UtLTspaWYoc3QodFtlXVswXSxuKSlyZXR1cm4gZTtyZXR1cm4tMX1mdW5jdGlvbiBNKHQsbixlKXt2YXIgcj1GKHQsbik7MD5yP3QucHVzaChbbixlXSk6dFtyXVsxXT1lfWZ1bmN0aW9uIHEodCl7cmV0dXJuIEduKHQpP3Q6U3QodCl9ZnVuY3Rpb24gTCh0LG4pe249cnQobix0KT9bbl06cShuKTtmb3IodmFyIGU9MCxyPW4ubGVuZ3RoO251bGwhPXQmJnI+ZTspdD10W25bZSsrXV07cmV0dXJuIGUmJmU9PXI/dDp2b2lkIDB9ZnVuY3Rpb24gQih0LG4pe3JldHVybiB4bi5jYWxsKHQsbil8fFwib2JqZWN0XCI9PXR5cGVvZiB0JiZuIGluIHQmJm51bGw9PT1aKHQpfWZ1bmN0aW9uIEgodCxuKXtyZXR1cm4gbiBpbiBPYmplY3QodCl9ZnVuY3Rpb24gUCh0LG4sZSxyLG8pe3JldHVybiB0PT09bj8hMDpudWxsPT10fHxudWxsPT1ufHwhdnQodCkmJiF5dChuKT90IT09dCYmbiE9PW46USh0LG4sUCxlLHIsbyl9ZnVuY3Rpb24gUSh0LG4sZSxyLG8saSl7dmFyIHU9R24odCksYT1HbihuKSxjPU10LGY9TXQ7dXx8KGM9dHQodCksYz1jPT1GdD9JdDpjKSxhfHwoZj10dChuKSxmPWY9PUZ0P0l0OmYpO3ZhciBsPWM9PUl0JiYhcyh0KSxwPWY9PUl0JiYhcyhuKSxkPWM9PWY7aWYoZCYmIWwpcmV0dXJuIGl8fChpPW5ldyB4KSx1fHx3dCh0KT9WKHQsbixlLHIsbyxpKTpZKHQsbixjLGUscixvLGkpO2lmKCEobyZOdCkpe3ZhciBoPWwmJnhuLmNhbGwodCxcIl9fd3JhcHBlZF9fXCIpLHY9cCYmeG4uY2FsbChuLFwiX193cmFwcGVkX19cIik7aWYoaHx8dil7dmFyIHk9aD90LnZhbHVlKCk6dCxnPXY/bi52YWx1ZSgpOm47cmV0dXJuIGl8fChpPW5ldyB4KSxlKHksZyxyLG8saSl9fXJldHVybiBkPyhpfHwoaT1uZXcgeCksWCh0LG4sZSxyLG8saSkpOiExfWZ1bmN0aW9uIEQodCxuLGUscil7dmFyIG89ZS5sZW5ndGgsaT1vLHU9IXI7aWYobnVsbD09dClyZXR1cm4haTtmb3IodD1PYmplY3QodCk7by0tOyl7dmFyIGE9ZVtvXTtpZih1JiZhWzJdP2FbMV0hPT10W2FbMF1dOiEoYVswXWluIHQpKXJldHVybiExfWZvcig7KytvPGk7KXthPWVbb107dmFyIGM9YVswXSxzPXRbY10sZj1hWzFdO2lmKHUmJmFbMl0pe2lmKHZvaWQgMD09PXMmJiEoYyBpbiB0KSlyZXR1cm4hMX1lbHNle3ZhciBsPW5ldyB4O2lmKHIpdmFyIHA9cihzLGYsYyx0LG4sbCk7aWYoISh2b2lkIDA9PT1wP1AoZixzLHIsVHR8TnQsbCk6cCkpcmV0dXJuITF9fXJldHVybiEwfWZ1bmN0aW9uIEkodCl7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdD90Om51bGw9PXQ/Q3Q6XCJvYmplY3RcIj09dHlwZW9mIHQ/R24odCk/Vyh0WzBdLHRbMV0pOlUodCk6QXQodCl9ZnVuY3Rpb24gUih0KXtyZXR1cm4gJG4oT2JqZWN0KHQpKX1mdW5jdGlvbiBVKHQpe3ZhciBuPUoodCk7cmV0dXJuIDE9PW4ubGVuZ3RoJiZuWzBdWzJdP2F0KG5bMF1bMF0sblswXVsxXSk6ZnVuY3Rpb24oZSl7cmV0dXJuIGU9PT10fHxEKGUsdCxuKX19ZnVuY3Rpb24gVyh0LG4pe3JldHVybiBydCh0KSYmdXQobik/YXQodCxuKTpmdW5jdGlvbihlKXt2YXIgcj1fdChlLHQpO3JldHVybiB2b2lkIDA9PT1yJiZyPT09bj9qdChlLHQpOlAobixyLHZvaWQgMCxUdHxOdCl9fWZ1bmN0aW9uIHoodCl7cmV0dXJuIGZ1bmN0aW9uKG4pe3JldHVybiBudWxsPT1uP3ZvaWQgMDpuW3RdfX1mdW5jdGlvbiBHKHQpe3JldHVybiBmdW5jdGlvbihuKXtyZXR1cm4gTChuLHQpfX1mdW5jdGlvbiBWKHQsbixlLHIsbyx1KXt2YXIgYT0tMSxjPW8mTnQscz1vJlR0LGY9dC5sZW5ndGgsbD1uLmxlbmd0aDtpZihmIT1sJiYhKGMmJmw+ZikpcmV0dXJuITE7dmFyIHA9dS5nZXQodCk7aWYocClyZXR1cm4gcD09bjt2YXIgZD0hMDtmb3IodS5zZXQodCxuKTsrK2E8Zjspe3ZhciBoPXRbYV0sdj1uW2FdO2lmKHIpdmFyIHk9Yz9yKHYsaCxhLG4sdCx1KTpyKGgsdixhLHQsbix1KTtpZih2b2lkIDAhPT15KXtpZih5KWNvbnRpbnVlO2Q9ITE7YnJlYWt9aWYocyl7aWYoIWkobixmdW5jdGlvbih0KXtyZXR1cm4gaD09PXR8fGUoaCx0LHIsbyx1KX0pKXtkPSExO2JyZWFrfX1lbHNlIGlmKGghPT12JiYhZShoLHYscixvLHUpKXtkPSExO2JyZWFrfX1yZXR1cm4gdVtcImRlbGV0ZVwiXSh0KSxkfWZ1bmN0aW9uIFkodCxuLGUscixvLGksdSl7c3dpdGNoKGUpe2Nhc2UgWHQ6aWYodC5ieXRlTGVuZ3RoIT1uLmJ5dGVMZW5ndGh8fHQuYnl0ZU9mZnNldCE9bi5ieXRlT2Zmc2V0KXJldHVybiExO3Q9dC5idWZmZXIsbj1uLmJ1ZmZlcjtjYXNlIFl0OnJldHVybiB0LmJ5dGVMZW5ndGg9PW4uYnl0ZUxlbmd0aCYmcihuZXcgRW4odCksbmV3IEVuKG4pKT8hMDohMTtjYXNlIHF0OmNhc2UgTHQ6cmV0dXJuK3Q9PStuO2Nhc2UgQnQ6cmV0dXJuIHQubmFtZT09bi5uYW1lJiZ0Lm1lc3NhZ2U9PW4ubWVzc2FnZTtjYXNlIER0OnJldHVybiB0IT0rdD9uIT0rbjp0PT0rbjtjYXNlIFV0OmNhc2UgenQ6cmV0dXJuIHQ9PW4rXCJcIjtjYXNlIFF0OnZhciBhPWw7Y2FzZSBXdDp2YXIgYz1pJk50O2lmKGF8fChhPXApLHQuc2l6ZSE9bi5zaXplJiYhYylyZXR1cm4hMTt2YXIgcz11LmdldCh0KTtyZXR1cm4gcz9zPT1uOihpfD1UdCx1LnNldCh0LG4pLFYoYSh0KSxhKG4pLHIsbyxpLHUpKTtjYXNlIEd0OmlmKFduKXJldHVybiBXbi5jYWxsKHQpPT1Xbi5jYWxsKG4pfXJldHVybiExfWZ1bmN0aW9uIFgodCxuLGUscixvLGkpe3ZhciB1PW8mTnQsYT1PdCh0KSxjPWEubGVuZ3RoLHM9T3QobiksZj1zLmxlbmd0aDtpZihjIT1mJiYhdSlyZXR1cm4hMTtmb3IodmFyIGw9YztsLS07KXt2YXIgcD1hW2xdO2lmKCEodT9wIGluIG46QihuLHApKSlyZXR1cm4hMX12YXIgZD1pLmdldCh0KTtpZihkKXJldHVybiBkPT1uO3ZhciBoPSEwO2kuc2V0KHQsbik7Zm9yKHZhciB2PXU7KytsPGM7KXtwPWFbbF07dmFyIHk9dFtwXSxnPW5bcF07aWYocil2YXIgYj11P3IoZyx5LHAsbix0LGkpOnIoeSxnLHAsdCxuLGkpO2lmKCEodm9pZCAwPT09Yj95PT09Z3x8ZSh5LGcscixvLGkpOmIpKXtoPSExO2JyZWFrfXZ8fCh2PVwiY29uc3RydWN0b3JcIj09cCl9aWYoaCYmIXYpe3ZhciBtPXQuY29uc3RydWN0b3Isdz1uLmNvbnN0cnVjdG9yO20hPXcmJlwiY29uc3RydWN0b3JcImluIHQmJlwiY29uc3RydWN0b3JcImluIG4mJiEoXCJmdW5jdGlvblwiPT10eXBlb2YgbSYmbSBpbnN0YW5jZW9mIG0mJlwiZnVuY3Rpb25cIj09dHlwZW9mIHcmJncgaW5zdGFuY2VvZiB3KSYmKGg9ITEpfXJldHVybiBpW1wiZGVsZXRlXCJdKHQpLGh9ZnVuY3Rpb24gSih0KXtmb3IodmFyIG49eHQodCksZT1uLmxlbmd0aDtlLS07KW5bZV1bMl09dXQobltlXVsxXSk7cmV0dXJuIG59ZnVuY3Rpb24gSyh0LG4pe3ZhciBlPXRbbl07cmV0dXJuIGd0KGUpP2U6dm9pZCAwfWZ1bmN0aW9uIFoodCl7cmV0dXJuIE5uKE9iamVjdCh0KSl9ZnVuY3Rpb24gdHQodCl7cmV0dXJuIENuLmNhbGwodCl9ZnVuY3Rpb24gbnQodCxuLGUpe249cnQobix0KT9bbl06cShuKTtmb3IodmFyIHIsbz0tMSxpPW4ubGVuZ3RoOysrbzxpOyl7dmFyIHU9bltvXTtpZighKHI9bnVsbCE9dCYmZSh0LHUpKSlicmVhazt0PXRbdV19aWYocilyZXR1cm4gcjt2YXIgaT10P3QubGVuZ3RoOjA7cmV0dXJuISFpJiZodChpKSYmZih1LGkpJiYoR24odCl8fGJ0KHQpfHxmdCh0KSl9ZnVuY3Rpb24gZXQodCl7dmFyIG49dD90Lmxlbmd0aDp2b2lkIDA7cmV0dXJuIGh0KG4pJiYoR24odCl8fGJ0KHQpfHxmdCh0KSk/dShuLFN0cmluZyk6bnVsbH1mdW5jdGlvbiBydCh0LG4pe3ZhciBlPXR5cGVvZiB0O3JldHVyblwibnVtYmVyXCI9PWV8fFwic3ltYm9sXCI9PWU/ITA6IUduKHQpJiYobXQodCl8fGNuLnRlc3QodCl8fCFhbi50ZXN0KHQpfHxudWxsIT1uJiZ0IGluIE9iamVjdChuKSl9ZnVuY3Rpb24gb3QodCl7dmFyIG49dHlwZW9mIHQ7cmV0dXJuXCJudW1iZXJcIj09bnx8XCJib29sZWFuXCI9PW58fFwic3RyaW5nXCI9PW4mJlwiX19wcm90b19fXCIhPXR8fG51bGw9PXR9ZnVuY3Rpb24gaXQodCl7dmFyIG49dCYmdC5jb25zdHJ1Y3RvcixlPVwiZnVuY3Rpb25cIj09dHlwZW9mIG4mJm4ucHJvdG90eXBlfHxqbjtyZXR1cm4gdD09PWV9ZnVuY3Rpb24gdXQodCl7cmV0dXJuIHQ9PT10JiYhdnQodCl9ZnVuY3Rpb24gYXQodCxuKXtyZXR1cm4gZnVuY3Rpb24oZSl7cmV0dXJuIG51bGw9PWU/ITE6ZVt0XT09PW4mJih2b2lkIDAhPT1ufHx0IGluIE9iamVjdChlKSl9fWZ1bmN0aW9uIGN0KHQpe2lmKG51bGwhPXQpe3RyeXtyZXR1cm4gT24uY2FsbCh0KX1jYXRjaChuKXt9dHJ5e3JldHVybiB0K1wiXCJ9Y2F0Y2gobil7fX1yZXR1cm5cIlwifWZ1bmN0aW9uIHN0KHQsbil7cmV0dXJuIHQ9PT1ufHx0IT09dCYmbiE9PW59ZnVuY3Rpb24gZnQodCl7cmV0dXJuIHB0KHQpJiZ4bi5jYWxsKHQsXCJjYWxsZWVcIikmJigha24uY2FsbCh0LFwiY2FsbGVlXCIpfHxDbi5jYWxsKHQpPT1GdCl9ZnVuY3Rpb24gbHQodCl7cmV0dXJuIG51bGwhPXQmJmh0KHpuKHQpKSYmIWR0KHQpfWZ1bmN0aW9uIHB0KHQpe3JldHVybiB5dCh0KSYmbHQodCl9ZnVuY3Rpb24gZHQodCl7dmFyIG49dnQodCk/Q24uY2FsbCh0KTpcIlwiO3JldHVybiBuPT1IdHx8bj09UHR9ZnVuY3Rpb24gaHQodCl7cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIHQmJnQ+LTEmJnQlMT09MCYmJHQ+PXR9ZnVuY3Rpb24gdnQodCl7dmFyIG49dHlwZW9mIHQ7cmV0dXJuISF0JiYoXCJvYmplY3RcIj09bnx8XCJmdW5jdGlvblwiPT1uKX1mdW5jdGlvbiB5dCh0KXtyZXR1cm4hIXQmJlwib2JqZWN0XCI9PXR5cGVvZiB0fWZ1bmN0aW9uIGd0KHQpe2lmKCF2dCh0KSlyZXR1cm4hMTt2YXIgbj1kdCh0KXx8cyh0KT9BbjpmbjtyZXR1cm4gbi50ZXN0KGN0KHQpKX1mdW5jdGlvbiBidCh0KXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdHx8IUduKHQpJiZ5dCh0KSYmQ24uY2FsbCh0KT09enR9ZnVuY3Rpb24gbXQodCl7cmV0dXJuXCJzeW1ib2xcIj09dHlwZW9mIHR8fHl0KHQpJiZDbi5jYWxsKHQpPT1HdH1mdW5jdGlvbiB3dCh0KXtyZXR1cm4geXQodCkmJmh0KHQubGVuZ3RoKSYmISFwbltDbi5jYWxsKHQpXX1mdW5jdGlvbiBfdCh0LG4sZSl7dmFyIHI9bnVsbD09dD92b2lkIDA6TCh0LG4pO3JldHVybiB2b2lkIDA9PT1yP2U6cn1mdW5jdGlvbiBqdCh0LG4pe3JldHVybiBudWxsIT10JiZudCh0LG4sSCl9ZnVuY3Rpb24gT3QodCl7dmFyIG49aXQodCk7aWYoIW4mJiFsdCh0KSlyZXR1cm4gUih0KTt2YXIgZT1ldCh0KSxyPSEhZSxvPWV8fFtdLGk9by5sZW5ndGg7Zm9yKHZhciB1IGluIHQpIUIodCx1KXx8ciYmKFwibGVuZ3RoXCI9PXV8fGYodSxpKSl8fG4mJlwiY29uc3RydWN0b3JcIj09dXx8by5wdXNoKHUpO3JldHVybiBvfWZ1bmN0aW9uIHh0KHQpe3JldHVybiBhKHQsT3QodCkpfWZ1bmN0aW9uIEN0KHQpe3JldHVybiB0fWZ1bmN0aW9uIEF0KHQpe3JldHVybiBydCh0KT96KHQpOkcodCl9dmFyIFN0PXQoXCJsb2Rhc2guX3N0cmluZ3RvcGF0aFwiKSxFdD0yMDAsa3Q9XCJfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fXCIsVHQ9MSxOdD0yLCR0PTkwMDcxOTkyNTQ3NDA5OTEsRnQ9XCJbb2JqZWN0IEFyZ3VtZW50c11cIixNdD1cIltvYmplY3QgQXJyYXldXCIscXQ9XCJbb2JqZWN0IEJvb2xlYW5dXCIsTHQ9XCJbb2JqZWN0IERhdGVdXCIsQnQ9XCJbb2JqZWN0IEVycm9yXVwiLEh0PVwiW29iamVjdCBGdW5jdGlvbl1cIixQdD1cIltvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dXCIsUXQ9XCJbb2JqZWN0IE1hcF1cIixEdD1cIltvYmplY3QgTnVtYmVyXVwiLEl0PVwiW29iamVjdCBPYmplY3RdXCIsUnQ9XCJbb2JqZWN0IFByb21pc2VdXCIsVXQ9XCJbb2JqZWN0IFJlZ0V4cF1cIixXdD1cIltvYmplY3QgU2V0XVwiLHp0PVwiW29iamVjdCBTdHJpbmddXCIsR3Q9XCJbb2JqZWN0IFN5bWJvbF1cIixWdD1cIltvYmplY3QgV2Vha01hcF1cIixZdD1cIltvYmplY3QgQXJyYXlCdWZmZXJdXCIsWHQ9XCJbb2JqZWN0IERhdGFWaWV3XVwiLEp0PVwiW29iamVjdCBGbG9hdDMyQXJyYXldXCIsS3Q9XCJbb2JqZWN0IEZsb2F0NjRBcnJheV1cIixadD1cIltvYmplY3QgSW50OEFycmF5XVwiLHRuPVwiW29iamVjdCBJbnQxNkFycmF5XVwiLG5uPVwiW29iamVjdCBJbnQzMkFycmF5XVwiLGVuPVwiW29iamVjdCBVaW50OEFycmF5XVwiLHJuPVwiW29iamVjdCBVaW50OENsYW1wZWRBcnJheV1cIixvbj1cIltvYmplY3QgVWludDE2QXJyYXldXCIsdW49XCJbb2JqZWN0IFVpbnQzMkFycmF5XVwiLGFuPS9cXC58XFxbKD86W15bXFxdXSp8KFtcIiddKSg/Oig/IVxcMSlbXlxcXFxdfFxcXFwuKSo/XFwxKVxcXS8sY249L15cXHcqJC8sc249L1tcXFxcXiQuKis/KClbXFxde318XS9nLGZuPS9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC8sbG49L14oPzowfFsxLTldXFxkKikkLyxwbj17fTtwbltKdF09cG5bS3RdPXBuW1p0XT1wblt0bl09cG5bbm5dPXBuW2VuXT1wbltybl09cG5bb25dPXBuW3VuXT0hMCxwbltGdF09cG5bTXRdPXBuW1l0XT1wbltxdF09cG5bWHRdPXBuW0x0XT1wbltCdF09cG5bSHRdPXBuW1F0XT1wbltEdF09cG5bSXRdPXBuW1V0XT1wbltXdF09cG5benRdPXBuW1Z0XT0hMTt2YXIgZG49e1wiZnVuY3Rpb25cIjohMCxvYmplY3Q6ITB9LGhuPWRuW3R5cGVvZiBlXSYmZSYmIWUubm9kZVR5cGU/ZTp2b2lkIDAsdm49ZG5bdHlwZW9mIG5dJiZuJiYhbi5ub2RlVHlwZT9uOnZvaWQgMCx5bj1jKGhuJiZ2biYmXCJvYmplY3RcIj09dHlwZW9mIHImJnIpLGduPWMoZG5bdHlwZW9mIHNlbGZdJiZzZWxmKSxibj1jKGRuW3R5cGVvZiB3aW5kb3ddJiZ3aW5kb3cpLG1uPWMoZG5bdHlwZW9mIHRoaXNdJiZ0aGlzKSx3bj15bnx8Ym4hPT0obW4mJm1uLndpbmRvdykmJmJufHxnbnx8bW58fEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSxfbj1BcnJheS5wcm90b3R5cGUsam49T2JqZWN0LnByb3RvdHlwZSxPbj1GdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcseG49am4uaGFzT3duUHJvcGVydHksQ249am4udG9TdHJpbmcsQW49UmVnRXhwKFwiXlwiK09uLmNhbGwoeG4pLnJlcGxhY2Uoc24sXCJcXFxcJCZcIikucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZyxcIiQxLio/XCIpK1wiJFwiKSxTbj13bi5TeW1ib2wsRW49d24uVWludDhBcnJheSxrbj1qbi5wcm9wZXJ0eUlzRW51bWVyYWJsZSxUbj1fbi5zcGxpY2UsTm49T2JqZWN0LmdldFByb3RvdHlwZU9mLCRuPU9iamVjdC5rZXlzLEZuPUsod24sXCJEYXRhVmlld1wiKSxNbj1LKHduLFwiTWFwXCIpLHFuPUsod24sXCJQcm9taXNlXCIpLExuPUsod24sXCJTZXRcIiksQm49Syh3bixcIldlYWtNYXBcIiksSG49SyhPYmplY3QsXCJjcmVhdGVcIiksUG49Y3QoRm4pLFFuPWN0KE1uKSxEbj1jdChxbiksSW49Y3QoTG4pLFJuPWN0KEJuKSxVbj1Tbj9Tbi5wcm90b3R5cGU6dm9pZCAwLFduPVVuP1VuLnZhbHVlT2Y6dm9pZCAwO2QucHJvdG90eXBlPUhuP0huKG51bGwpOmpuLGIucHJvdG90eXBlLmNsZWFyPW0sYi5wcm90b3R5cGVbXCJkZWxldGVcIl09dyxiLnByb3RvdHlwZS5nZXQ9XyxiLnByb3RvdHlwZS5oYXM9aixiLnByb3RvdHlwZS5zZXQ9Tyx4LnByb3RvdHlwZS5jbGVhcj1DLHgucHJvdG90eXBlW1wiZGVsZXRlXCJdPUEseC5wcm90b3R5cGUuZ2V0PVMseC5wcm90b3R5cGUuaGFzPUUseC5wcm90b3R5cGUuc2V0PWs7dmFyIHpuPXooXCJsZW5ndGhcIik7KEZuJiZ0dChuZXcgRm4obmV3IEFycmF5QnVmZmVyKDEpKSkhPVh0fHxNbiYmdHQobmV3IE1uKSE9UXR8fHFuJiZ0dChxbi5yZXNvbHZlKCkpIT1SdHx8TG4mJnR0KG5ldyBMbikhPVd0fHxCbiYmdHQobmV3IEJuKSE9VnQpJiYodHQ9ZnVuY3Rpb24odCl7dmFyIG49Q24uY2FsbCh0KSxlPW49PUl0P3QuY29uc3RydWN0b3I6dm9pZCAwLHI9ZT9jdChlKTp2b2lkIDA7aWYocilzd2l0Y2gocil7Y2FzZSBQbjpyZXR1cm4gWHQ7Y2FzZSBRbjpyZXR1cm4gUXQ7Y2FzZSBEbjpyZXR1cm4gUnQ7Y2FzZSBJbjpyZXR1cm4gV3Q7Y2FzZSBSbjpyZXR1cm4gVnR9cmV0dXJuIG59KTt2YXIgR249QXJyYXkuaXNBcnJheTtuLmV4cG9ydHM9SX0pLmNhbGwodGhpcyxcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP2dsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZj9zZWxmOlwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93Ont9KX0se1wibG9kYXNoLl9zdHJpbmd0b3BhdGhcIjoxNH1dLDE0OltmdW5jdGlvbih0LG4sZSl7KGZ1bmN0aW9uKHQpe2Z1bmN0aW9uIHIodCl7cmV0dXJuIHQmJnQuT2JqZWN0PT09T2JqZWN0P3Q6bnVsbH1mdW5jdGlvbiBvKHQpe3ZhciBuPSExO2lmKG51bGwhPXQmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIHQudG9TdHJpbmcpdHJ5e249ISEodCtcIlwiKX1jYXRjaChlKXt9cmV0dXJuIG59ZnVuY3Rpb24gaSgpe31mdW5jdGlvbiB1KHQsbil7cmV0dXJuIGModCxuKSYmZGVsZXRlIHRbbl19ZnVuY3Rpb24gYSh0LG4pe2lmKGl0KXt2YXIgZT10W25dO3JldHVybiBlPT09Rj92b2lkIDA6ZX1yZXR1cm4gWi5jYWxsKHQsbik/dFtuXTp2b2lkIDB9ZnVuY3Rpb24gYyh0LG4pe3JldHVybiBpdD92b2lkIDAhPT10W25dOlouY2FsbCh0LG4pfWZ1bmN0aW9uIHModCxuLGUpe3Rbbl09aXQmJnZvaWQgMD09PWU/RjplfWZ1bmN0aW9uIGYodCl7dmFyIG49LTEsZT10P3QubGVuZ3RoOjA7Zm9yKHRoaXMuY2xlYXIoKTsrK248ZTspe3ZhciByPXRbbl07dGhpcy5zZXQoclswXSxyWzFdKX19ZnVuY3Rpb24gbCgpe3RoaXMuX19kYXRhX189e2hhc2g6bmV3IGksbWFwOm90P25ldyBvdDpbXSxzdHJpbmc6bmV3IGl9fWZ1bmN0aW9uIHAodCl7dmFyIG49dGhpcy5fX2RhdGFfXztyZXR1cm4gaih0KT91KFwic3RyaW5nXCI9PXR5cGVvZiB0P24uc3RyaW5nOm4uaGFzaCx0KTpvdD9uLm1hcFtcImRlbGV0ZVwiXSh0KTp5KG4ubWFwLHQpfWZ1bmN0aW9uIGQodCl7dmFyIG49dGhpcy5fX2RhdGFfXztyZXR1cm4gaih0KT9hKFwic3RyaW5nXCI9PXR5cGVvZiB0P24uc3RyaW5nOm4uaGFzaCx0KTpvdD9uLm1hcC5nZXQodCk6ZyhuLm1hcCx0KX1mdW5jdGlvbiBoKHQpe3ZhciBuPXRoaXMuX19kYXRhX187cmV0dXJuIGoodCk/YyhcInN0cmluZ1wiPT10eXBlb2YgdD9uLnN0cmluZzpuLmhhc2gsdCk6b3Q/bi5tYXAuaGFzKHQpOmIobi5tYXAsdCl9ZnVuY3Rpb24gdih0LG4pe3ZhciBlPXRoaXMuX19kYXRhX187cmV0dXJuIGoodCk/cyhcInN0cmluZ1wiPT10eXBlb2YgdD9lLnN0cmluZzplLmhhc2gsdCxuKTpvdD9lLm1hcC5zZXQodCxuKTp3KGUubWFwLHQsbiksdGhpc31mdW5jdGlvbiB5KHQsbil7dmFyIGU9bSh0LG4pO2lmKDA+ZSlyZXR1cm4hMTt2YXIgcj10Lmxlbmd0aC0xO3JldHVybiBlPT1yP3QucG9wKCk6cnQuY2FsbCh0LGUsMSksITB9ZnVuY3Rpb24gZyh0LG4pe3ZhciBlPW0odCxuKTtyZXR1cm4gMD5lP3ZvaWQgMDp0W2VdWzFdfWZ1bmN0aW9uIGIodCxuKXtyZXR1cm4gbSh0LG4pPi0xfWZ1bmN0aW9uIG0odCxuKXtmb3IodmFyIGU9dC5sZW5ndGg7ZS0tOylpZihDKHRbZV1bMF0sbikpcmV0dXJuIGU7cmV0dXJuLTF9ZnVuY3Rpb24gdyh0LG4sZSl7dmFyIHI9bSh0LG4pOzA+cj90LnB1c2goW24sZV0pOnRbcl1bMV09ZX1mdW5jdGlvbiBfKHQsbil7dmFyIGU9dFtuXTtyZXR1cm4gayhlKT9lOnZvaWQgMH1mdW5jdGlvbiBqKHQpe3ZhciBuPXR5cGVvZiB0O3JldHVyblwibnVtYmVyXCI9PW58fFwiYm9vbGVhblwiPT1ufHxcInN0cmluZ1wiPT1uJiZcIl9fcHJvdG9fX1wiIT10fHxudWxsPT10fWZ1bmN0aW9uIE8odCl7aWYobnVsbCE9dCl7dHJ5e3JldHVybiBLLmNhbGwodCl9Y2F0Y2gobil7fXRyeXtyZXR1cm4gdCtcIlwifWNhdGNoKG4pe319cmV0dXJuXCJcIn1mdW5jdGlvbiB4KHQsbil7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgdHx8biYmXCJmdW5jdGlvblwiIT10eXBlb2Ygbil0aHJvdyBuZXcgVHlwZUVycm9yKCQpO3ZhciBlPWZ1bmN0aW9uKCl7dmFyIHI9YXJndW1lbnRzLG89bj9uLmFwcGx5KHRoaXMscik6clswXSxpPWUuY2FjaGU7aWYoaS5oYXMobykpcmV0dXJuIGkuZ2V0KG8pO3ZhciB1PXQuYXBwbHkodGhpcyxyKTtyZXR1cm4gZS5jYWNoZT1pLnNldChvLHUpLHV9O3JldHVybiBlLmNhY2hlPW5ldyh4LkNhY2hlfHxmKSxlfWZ1bmN0aW9uIEModCxuKXtyZXR1cm4gdD09PW58fHQhPT10JiZuIT09bn1mdW5jdGlvbiBBKHQpe3ZhciBuPVModCk/dHQuY2FsbCh0KTpcIlwiO3JldHVybiBuPT1xfHxuPT1MfWZ1bmN0aW9uIFModCl7dmFyIG49dHlwZW9mIHQ7cmV0dXJuISF0JiYoXCJvYmplY3RcIj09bnx8XCJmdW5jdGlvblwiPT1uKX1mdW5jdGlvbiBFKHQpe3JldHVybiEhdCYmXCJvYmplY3RcIj09dHlwZW9mIHR9ZnVuY3Rpb24gayh0KXtpZighUyh0KSlyZXR1cm4hMTt2YXIgbj1BKHQpfHxvKHQpP250OkQ7cmV0dXJuIG4udGVzdChPKHQpKX1mdW5jdGlvbiBUKHQpe3JldHVyblwic3ltYm9sXCI9PXR5cGVvZiB0fHxFKHQpJiZ0dC5jYWxsKHQpPT1CfWZ1bmN0aW9uIE4odCl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpcmV0dXJuIHQ7aWYobnVsbD09dClyZXR1cm5cIlwiO2lmKFQodCkpcmV0dXJuIGF0P2F0LmNhbGwodCk6XCJcIjt2YXIgbj10K1wiXCI7cmV0dXJuXCIwXCI9PW4mJjEvdD09LU0/XCItMFwiOm59dmFyICQ9XCJFeHBlY3RlZCBhIGZ1bmN0aW9uXCIsRj1cIl9fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX19cIixNPTEvMCxxPVwiW29iamVjdCBGdW5jdGlvbl1cIixMPVwiW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl1cIixCPVwiW29iamVjdCBTeW1ib2xdXCIsSD0vW14uW1xcXV0rfFxcWyg/OigtP1xcZCsoPzpcXC5cXGQrKT8pfChbXCInXSkoKD86KD8hXFwyKVteXFxcXF18XFxcXC4pKj8pXFwyKVxcXS9nLFA9L1tcXFxcXiQuKis/KClbXFxde318XS9nLFE9L1xcXFwoXFxcXCk/L2csRD0vXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvLEk9e1wiZnVuY3Rpb25cIjohMCxvYmplY3Q6ITB9LFI9SVt0eXBlb2YgZV0mJmUmJiFlLm5vZGVUeXBlP2U6dm9pZCAwLFU9SVt0eXBlb2Ygbl0mJm4mJiFuLm5vZGVUeXBlP246dm9pZCAwLFc9cihSJiZVJiZcIm9iamVjdFwiPT10eXBlb2YgdCYmdCksej1yKElbdHlwZW9mIHNlbGZdJiZzZWxmKSxHPXIoSVt0eXBlb2Ygd2luZG93XSYmd2luZG93KSxWPXIoSVt0eXBlb2YgdGhpc10mJnRoaXMpLFk9V3x8RyE9PShWJiZWLndpbmRvdykmJkd8fHp8fFZ8fEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSxYPUFycmF5LnByb3RvdHlwZSxKPU9iamVjdC5wcm90b3R5cGUsSz1GdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcsWj1KLmhhc093blByb3BlcnR5LHR0PUoudG9TdHJpbmcsbnQ9UmVnRXhwKFwiXlwiK0suY2FsbChaKS5yZXBsYWNlKFAsXCJcXFxcJCZcIikucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZyxcIiQxLio/XCIpK1wiJFwiKSxldD1ZLlN5bWJvbCxydD1YLnNwbGljZSxvdD1fKFksXCJNYXBcIiksaXQ9XyhPYmplY3QsXCJjcmVhdGVcIiksdXQ9ZXQ/ZXQucHJvdG90eXBlOnZvaWQgMCxhdD11dD91dC50b1N0cmluZzp2b2lkIDA7aS5wcm90b3R5cGU9aXQ/aXQobnVsbCk6SixmLnByb3RvdHlwZS5jbGVhcj1sLGYucHJvdG90eXBlW1wiZGVsZXRlXCJdPXAsZi5wcm90b3R5cGUuZ2V0PWQsZi5wcm90b3R5cGUuaGFzPWgsZi5wcm90b3R5cGUuc2V0PXY7dmFyIGN0PXgoZnVuY3Rpb24odCl7dmFyIG49W107cmV0dXJuIE4odCkucmVwbGFjZShILGZ1bmN0aW9uKHQsZSxyLG8pe24ucHVzaChyP28ucmVwbGFjZShRLFwiJDFcIik6ZXx8dCl9KSxufSk7eC5DYWNoZT1mLG4uZXhwb3J0cz1jdH0pLmNhbGwodGhpcyxcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP2dsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZj9zZWxmOlwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93Ont9KX0se31dLDE1OltmdW5jdGlvbih0LG4peyhmdW5jdGlvbihlKXtmdW5jdGlvbiByKHQsbil7cmV0dXJuIHQ9XCJudW1iZXJcIj09dHlwZW9mIHR8fG0udGVzdCh0KT8rdDotMSxuPW51bGw9PW4/eTpuLHQ+LTEmJnQlMT09MCYmbj50fWZ1bmN0aW9uIG8odCxuLGUpe3ZhciByPXRbbl07KCFzKHIsZSl8fHMocix3W25dKSYmIV8uY2FsbCh0LG4pfHx2b2lkIDA9PT1lJiYhKG4gaW4gdCkpJiYodFtuXT1lKX1mdW5jdGlvbiBpKHQpe3JldHVybiBmdW5jdGlvbihuKXtyZXR1cm4gbnVsbD09bj92b2lkIDA6blt0XX19ZnVuY3Rpb24gdSh0LG4sZSxyKXtlfHwoZT17fSk7Zm9yKHZhciBpPS0xLHU9bi5sZW5ndGg7KytpPHU7KXt2YXIgYT1uW2ldLGM9cj9yKGVbYV0sdFthXSxhLGUsdCk6dFthXTtvKGUsYSxjKX1yZXR1cm4gZX1mdW5jdGlvbiBhKHQpe3JldHVybiB2KGZ1bmN0aW9uKG4sZSl7dmFyIHI9LTEsbz1lLmxlbmd0aCxpPW8+MT9lW28tMV06dm9pZCAwLHU9bz4yP2VbMl06dm9pZCAwO2ZvcihpPVwiZnVuY3Rpb25cIj09dHlwZW9mIGk/KG8tLSxpKTp2b2lkIDAsdSYmYyhlWzBdLGVbMV0sdSkmJihpPTM+bz92b2lkIDA6aSxvPTEpLG49T2JqZWN0KG4pOysrcjxvOyl7dmFyIGE9ZVtyXTthJiZ0KG4sYSxpKX1yZXR1cm4gbn0pfWZ1bmN0aW9uIGModCxuLGUpe2lmKCFkKGUpKXJldHVybiExO3ZhciBvPXR5cGVvZiBuO3JldHVybihcIm51bWJlclwiPT1vP2YoZSkmJnIobixlLmxlbmd0aCk6XCJzdHJpbmdcIj09byYmbiBpbiBlKT9zKGVbbl0sdCk6ITF9ZnVuY3Rpb24gcyh0LG4pe3JldHVybiB0PT09bnx8dCE9PXQmJm4hPT1ufWZ1bmN0aW9uIGYodCl7cmV0dXJuIG51bGwhPXQmJiEoXCJmdW5jdGlvblwiPT10eXBlb2YgdCYmbCh0KSkmJnAoTyh0KSl9ZnVuY3Rpb24gbCh0KXt2YXIgbj1kKHQpP2ouY2FsbCh0KTpcIlwiO3JldHVybiBuPT1nfHxuPT1ifWZ1bmN0aW9uIHAodCl7cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIHQmJnQ+LTEmJnQlMT09MCYmeT49dH1mdW5jdGlvbiBkKHQpe3ZhciBuPXR5cGVvZiB0O3JldHVybiEhdCYmKFwib2JqZWN0XCI9PW58fFwiZnVuY3Rpb25cIj09bil9dmFyIGg9dChcImxvZGFzaC5rZXlzaW5cIiksdj10KFwibG9kYXNoLnJlc3RcIikseT05MDA3MTk5MjU0NzQwOTkxLGc9XCJbb2JqZWN0IEZ1bmN0aW9uXVwiLGI9XCJbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXVwiLG09L14oPzowfFsxLTldXFxkKikkLyx3PWUuT2JqZWN0LnByb3RvdHlwZSxfPXcuaGFzT3duUHJvcGVydHksaj13LnRvU3RyaW5nLE89aShcImxlbmd0aFwiKSx4PWEoZnVuY3Rpb24odCxuLGUpe3UobixoKG4pLHQsZSl9KTtuLmV4cG9ydHM9eH0pLmNhbGwodGhpcyxcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP2dsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZj9zZWxmOlwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93Ont9KX0se1wibG9kYXNoLmtleXNpblwiOjE2LFwibG9kYXNoLnJlc3RcIjoyMn1dLDE2OltmdW5jdGlvbih0LG4peyhmdW5jdGlvbih0KXtmdW5jdGlvbiBlKHQsbil7Zm9yKHZhciBlPS0xLHI9QXJyYXkodCk7KytlPHQ7KXJbZV09bihlKTtyZXR1cm4gcn1mdW5jdGlvbiByKHQsbil7cmV0dXJuIHQ9XCJudW1iZXJcIj09dHlwZW9mIHR8fE8udGVzdCh0KT8rdDotMSxuPW51bGw9PW4/YjpuLHQ+LTEmJnQlMT09MCYmbj50fWZ1bmN0aW9uIG8odCl7Zm9yKHZhciBuLGU9W107IShuPXQubmV4dCgpKS5kb25lOyllLnB1c2gobi52YWx1ZSk7cmV0dXJuIGV9ZnVuY3Rpb24gaSh0KXt0PW51bGw9PXQ/dDpPYmplY3QodCk7dmFyIG49W107Zm9yKHZhciBlIGluIHQpbi5wdXNoKGUpO3JldHVybiBufWZ1bmN0aW9uIHUodCl7cmV0dXJuIGZ1bmN0aW9uKG4pe3JldHVybiBudWxsPT1uP3ZvaWQgMDpuW3RdfX1mdW5jdGlvbiBhKHQpe3ZhciBuPXQ/dC5sZW5ndGg6dm9pZCAwO3JldHVybiBkKG4pJiYoTih0KXx8eSh0KXx8cyh0KSk/ZShuLFN0cmluZyk6bnVsbH1mdW5jdGlvbiBjKHQpe3ZhciBuPXQmJnQuY29uc3RydWN0b3IsZT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBuJiZuLnByb3RvdHlwZXx8eDtyZXR1cm4gdD09PWV9ZnVuY3Rpb24gcyh0KXtyZXR1cm4gbCh0KSYmQy5jYWxsKHQsXCJjYWxsZWVcIikmJighay5jYWxsKHQsXCJjYWxsZWVcIil8fEEuY2FsbCh0KT09bSl9ZnVuY3Rpb24gZih0KXtyZXR1cm4gbnVsbCE9dCYmIShcImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiZwKHQpKSYmZChUKHQpKX1mdW5jdGlvbiBsKHQpe3JldHVybiB2KHQpJiZmKHQpfWZ1bmN0aW9uIHAodCl7dmFyIG49aCh0KT9BLmNhbGwodCk6XCJcIjtyZXR1cm4gbj09d3x8bj09X31mdW5jdGlvbiBkKHQpe3JldHVyblwibnVtYmVyXCI9PXR5cGVvZiB0JiZ0Pi0xJiZ0JTE9PTAmJmI+PXR9ZnVuY3Rpb24gaCh0KXt2YXIgbj10eXBlb2YgdDtyZXR1cm4hIXQmJihcIm9iamVjdFwiPT1ufHxcImZ1bmN0aW9uXCI9PW4pfWZ1bmN0aW9uIHYodCl7cmV0dXJuISF0JiZcIm9iamVjdFwiPT10eXBlb2YgdH1mdW5jdGlvbiB5KHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0fHwhTih0KSYmdih0KSYmQS5jYWxsKHQpPT1qfWZ1bmN0aW9uIGcodCl7Zm9yKHZhciBuPS0xLGU9Yyh0KSxvPWkodCksdT1vLmxlbmd0aCxzPWEodCksZj0hIXMsbD1zfHxbXSxwPWwubGVuZ3RoOysrbjx1Oyl7dmFyIGQ9b1tuXTtmJiYoXCJsZW5ndGhcIj09ZHx8cihkLHApKXx8XCJjb25zdHJ1Y3RvclwiPT1kJiYoZXx8IUMuY2FsbCh0LGQpKXx8bC5wdXNoKGQpfXJldHVybiBsfXZhciBiPTkwMDcxOTkyNTQ3NDA5OTEsbT1cIltvYmplY3QgQXJndW1lbnRzXVwiLHc9XCJbb2JqZWN0IEZ1bmN0aW9uXVwiLF89XCJbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXVwiLGo9XCJbb2JqZWN0IFN0cmluZ11cIixPPS9eKD86MHxbMS05XVxcZCopJC8seD10Lk9iamVjdC5wcm90b3R5cGUsQz14Lmhhc093blByb3BlcnR5LEE9eC50b1N0cmluZyxTPXQuUmVmbGVjdCxFPVM/Uy5lbnVtZXJhdGU6dm9pZCAwLGs9eC5wcm9wZXJ0eUlzRW51bWVyYWJsZTtFJiYhay5jYWxsKHt2YWx1ZU9mOjF9LFwidmFsdWVPZlwiKSYmKGk9ZnVuY3Rpb24odCl7cmV0dXJuIG8oRSh0KSl9KTt2YXIgVD11KFwibGVuZ3RoXCIpLE49QXJyYXkuaXNBcnJheTtuLmV4cG9ydHM9Z30pLmNhbGwodGhpcyxcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP2dsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZj9zZWxmOlwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93Ont9KX0se31dLDE3OltmdW5jdGlvbih0LG4pe2Z1bmN0aW9uIGUodCxuLGUpe2Z1bmN0aW9uIHIoKXttJiZjbGVhclRpbWVvdXQobSksZCYmY2xlYXJUaW1lb3V0KGQpLF89MCxwPWQ9eT1tPXc9dm9pZCAwfWZ1bmN0aW9uIGEobixlKXtlJiZjbGVhclRpbWVvdXQoZSksZD1tPXc9dm9pZCAwLG4mJihfPWIoKSxoPXQuYXBwbHkoeSxwKSxtfHxkfHwocD15PXZvaWQgMCkpfWZ1bmN0aW9uIGMoKXt2YXIgdD1uLShiKCktdik7MD49dHx8dD5uP2EodyxkKTptPXNldFRpbWVvdXQoYyx0KX1mdW5jdGlvbiBzKCl7cmV0dXJuKG0mJnd8fGQmJngpJiYoaD10LmFwcGx5KHkscCkpLHIoKSxofWZ1bmN0aW9uIGYoKXthKHgsbSl9ZnVuY3Rpb24gbCgpe2lmKHA9YXJndW1lbnRzLHY9YigpLHk9dGhpcyx3PXgmJihtfHwhaiksTz09PSExKXZhciBlPWomJiFtO2Vsc2V7X3x8ZHx8anx8KF89dik7dmFyIHI9Ty0odi1fKSxvPSgwPj1yfHxyPk8pJiYoanx8ZCk7bz8oZCYmKGQ9Y2xlYXJUaW1lb3V0KGQpKSxfPXYsaD10LmFwcGx5KHkscCkpOmR8fChkPXNldFRpbWVvdXQoZixyKSl9cmV0dXJuIG8mJm0/bT1jbGVhclRpbWVvdXQobSk6bXx8bj09PU98fChtPXNldFRpbWVvdXQoYyxuKSksZSYmKG89ITAsaD10LmFwcGx5KHkscCkpLCFvfHxtfHxkfHwocD15PXZvaWQgMCksaH12YXIgcCxkLGgsdix5LG0sdyxfPTAsaj0hMSxPPSExLHg9ITA7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgdCl0aHJvdyBuZXcgVHlwZUVycm9yKHUpO3JldHVybiBuPWkobil8fDAsbyhlKSYmKGo9ISFlLmxlYWRpbmcsTz1cIm1heFdhaXRcImluIGUmJmcoaShlLm1heFdhaXQpfHwwLG4pLHg9XCJ0cmFpbGluZ1wiaW4gZT8hIWUudHJhaWxpbmc6eCksbC5jYW5jZWw9cixsLmZsdXNoPXMsbH1mdW5jdGlvbiByKHQpe3ZhciBuPW8odCk/eS5jYWxsKHQpOlwiXCI7cmV0dXJuIG49PWN8fG49PXN9ZnVuY3Rpb24gbyh0KXt2YXIgbj10eXBlb2YgdDtyZXR1cm4hIXQmJihcIm9iamVjdFwiPT1ufHxcImZ1bmN0aW9uXCI9PW4pfWZ1bmN0aW9uIGkodCl7aWYobyh0KSl7dmFyIG49cih0LnZhbHVlT2YpP3QudmFsdWVPZigpOnQ7dD1vKG4pP24rXCJcIjpufWlmKFwic3RyaW5nXCIhPXR5cGVvZiB0KXJldHVybiAwPT09dD90Oit0O3Q9dC5yZXBsYWNlKGYsXCJcIik7dmFyIGU9cC50ZXN0KHQpO3JldHVybiBlfHxkLnRlc3QodCk/aCh0LnNsaWNlKDIpLGU/Mjo4KTpsLnRlc3QodCk/YTordH12YXIgdT1cIkV4cGVjdGVkIGEgZnVuY3Rpb25cIixhPTAvMCxjPVwiW29iamVjdCBGdW5jdGlvbl1cIixzPVwiW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl1cIixmPS9eXFxzK3xcXHMrJC9nLGw9L15bLStdMHhbMC05YS1mXSskL2kscD0vXjBiWzAxXSskL2ksZD0vXjBvWzAtN10rJC9pLGg9cGFyc2VJbnQsdj1PYmplY3QucHJvdG90eXBlLHk9di50b1N0cmluZyxnPU1hdGgubWF4LGI9RGF0ZS5ub3c7bi5leHBvcnRzPWV9LHt9XSwxODpbZnVuY3Rpb24odCxuKXsoZnVuY3Rpb24oZSl7ZnVuY3Rpb24gcih0LG4sZSl7dmFyIHI9ZT9lLmxlbmd0aDowO3N3aXRjaChyKXtjYXNlIDA6cmV0dXJuIHQuY2FsbChuKTtjYXNlIDE6cmV0dXJuIHQuY2FsbChuLGVbMF0pO2Nhc2UgMjpyZXR1cm4gdC5jYWxsKG4sZVswXSxlWzFdKTtjYXNlIDM6cmV0dXJuIHQuY2FsbChuLGVbMF0sZVsxXSxlWzJdKX1yZXR1cm4gdC5hcHBseShuLGUpfWZ1bmN0aW9uIG8odCxuLGUscil7cmV0dXJuIHZvaWQgMD09PXR8fGkodCxjW2VdKSYmIXMuY2FsbChyLGUpP246dH1mdW5jdGlvbiBpKHQsbil7cmV0dXJuIHQ9PT1ufHx0IT09dCYmbiE9PW59dmFyIHU9dChcImxvZGFzaC5hc3NpZ25pbndpdGhcIiksYT10KFwibG9kYXNoLnJlc3RcIiksYz1lLk9iamVjdC5wcm90b3R5cGUscz1jLmhhc093blByb3BlcnR5LGY9YShmdW5jdGlvbih0KXtyZXR1cm4gdC5wdXNoKHZvaWQgMCxvKSxyKHUsdm9pZCAwLHQpfSk7bi5leHBvcnRzPWZ9KS5jYWxsKHRoaXMsXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGY/c2VsZjpcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3dpbmRvdzp7fSl9LHtcImxvZGFzaC5hc3NpZ25pbndpdGhcIjoxNSxcImxvZGFzaC5yZXN0XCI6MjJ9XSwxOTpbZnVuY3Rpb24odCxuKXtmdW5jdGlvbiBlKHQsbil7Zm9yKHZhciBlPS0xLHI9dC5sZW5ndGgsbz0wLGk9W107KytlPHI7KXt2YXIgdT10W2VdO24odSxlLHQpJiYoaVtvKytdPXUpfXJldHVybiBpfWZ1bmN0aW9uIHIodCxuKXt2YXIgcj11KHQpP2U6bztyZXR1cm4gcih0LGkobiwzKSl9dmFyIG89dChcImxvZGFzaC5fYmFzZWZpbHRlclwiKSxpPXQoXCJsb2Rhc2guX2Jhc2VpdGVyYXRlZVwiKSx1PUFycmF5LmlzQXJyYXk7bi5leHBvcnRzPXJ9LHtcImxvZGFzaC5fYmFzZWZpbHRlclwiOjExLFwibG9kYXNoLl9iYXNlaXRlcmF0ZWVcIjoxM31dLDIwOltmdW5jdGlvbih0LG4pe2Z1bmN0aW9uIGUodCl7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdD90Om99ZnVuY3Rpb24gcih0LG4pe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIG4mJmEodCk/aSh0LG4pOnUodCxlKG4pKX1mdW5jdGlvbiBvKHQpe3JldHVybiB0fXZhciBpPXQoXCJsb2Rhc2guX2FycmF5ZWFjaFwiKSx1PXQoXCJsb2Rhc2guX2Jhc2VlYWNoXCIpLGE9QXJyYXkuaXNBcnJheTtuLmV4cG9ydHM9cn0se1wibG9kYXNoLl9hcnJheWVhY2hcIjo4LFwibG9kYXNoLl9iYXNlZWFjaFwiOjl9XSwyMTpbZnVuY3Rpb24odCxuKXt2YXIgZT1BcnJheS5pc0FycmF5O24uZXhwb3J0cz1lfSx7fV0sMjI6W2Z1bmN0aW9uKHQsbil7KGZ1bmN0aW9uKHQpe2Z1bmN0aW9uIGUodCxuLGUpe3ZhciByPWU/ZS5sZW5ndGg6MDtzd2l0Y2gocil7Y2FzZSAwOnJldHVybiB0LmNhbGwobik7Y2FzZSAxOnJldHVybiB0LmNhbGwobixlWzBdKTtjYXNlIDI6cmV0dXJuIHQuY2FsbChuLGVbMF0sZVsxXSk7Y2FzZSAzOnJldHVybiB0LmNhbGwobixlWzBdLGVbMV0sZVsyXSl9cmV0dXJuIHQuYXBwbHkobixlKTtcblxufWZ1bmN0aW9uIHIodCxuKXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiB0KXRocm93IG5ldyBUeXBlRXJyb3IoYyk7cmV0dXJuIG49Xyh2b2lkIDA9PT1uP3QubGVuZ3RoLTE6dShuKSwwKSxmdW5jdGlvbigpe2Zvcih2YXIgcj1hcmd1bWVudHMsbz0tMSxpPV8oci5sZW5ndGgtbiwwKSx1PUFycmF5KGkpOysrbzxpOyl1W29dPXJbbitvXTtzd2l0Y2gobil7Y2FzZSAwOnJldHVybiB0LmNhbGwodGhpcyx1KTtjYXNlIDE6cmV0dXJuIHQuY2FsbCh0aGlzLHJbMF0sdSk7Y2FzZSAyOnJldHVybiB0LmNhbGwodGhpcyxyWzBdLHJbMV0sdSl9dmFyIGE9QXJyYXkobisxKTtmb3Iobz0tMTsrK288bjspYVtvXT1yW29dO3JldHVybiBhW25dPXUsZSh0LHRoaXMsYSl9fWZ1bmN0aW9uIG8odCl7dmFyIG49aSh0KT93LmNhbGwodCk6XCJcIjtyZXR1cm4gbj09cHx8bj09ZH1mdW5jdGlvbiBpKHQpe3ZhciBuPXR5cGVvZiB0O3JldHVybiEhdCYmKFwib2JqZWN0XCI9PW58fFwiZnVuY3Rpb25cIj09bil9ZnVuY3Rpb24gdSh0KXtpZighdClyZXR1cm4gMD09PXQ/dDowO2lmKHQ9YSh0KSx0PT09c3x8dD09PS1zKXt2YXIgbj0wPnQ/LTE6MTtyZXR1cm4gbipmfXZhciBlPXQlMTtyZXR1cm4gdD09PXQ/ZT90LWU6dDowfWZ1bmN0aW9uIGEodCl7aWYoaSh0KSl7dmFyIG49byh0LnZhbHVlT2YpP3QudmFsdWVPZigpOnQ7dD1pKG4pP24rXCJcIjpufWlmKFwic3RyaW5nXCIhPXR5cGVvZiB0KXJldHVybiAwPT09dD90Oit0O3Q9dC5yZXBsYWNlKGgsXCJcIik7dmFyIGU9eS50ZXN0KHQpO3JldHVybiBlfHxnLnRlc3QodCk/Yih0LnNsaWNlKDIpLGU/Mjo4KTp2LnRlc3QodCk/bDordH12YXIgYz1cIkV4cGVjdGVkIGEgZnVuY3Rpb25cIixzPTEvMCxmPTEuNzk3NjkzMTM0ODYyMzE1N2UzMDgsbD0wLzAscD1cIltvYmplY3QgRnVuY3Rpb25dXCIsZD1cIltvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dXCIsaD0vXlxccyt8XFxzKyQvZyx2PS9eWy0rXTB4WzAtOWEtZl0rJC9pLHk9L14wYlswMV0rJC9pLGc9L14wb1swLTddKyQvaSxiPXBhcnNlSW50LG09dC5PYmplY3QucHJvdG90eXBlLHc9bS50b1N0cmluZyxfPU1hdGgubWF4O24uZXhwb3J0cz1yfSkuY2FsbCh0aGlzLFwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWw/Z2xvYmFsOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmP3NlbGY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6e30pfSx7fV0sMjM6W2Z1bmN0aW9uKHQsbil7ZnVuY3Rpb24gZSh0LG4sZSl7dmFyIHI9ZG9jdW1lbnQuYm9keSxvPWRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxpPXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksdT1vLmNsaWVudEhlaWdodCxhPU1hdGgubWF4KHIuc2Nyb2xsSGVpZ2h0LHIub2Zmc2V0SGVpZ2h0LG8uY2xpZW50SGVpZ2h0LG8uc2Nyb2xsSGVpZ2h0LG8ub2Zmc2V0SGVpZ2h0KTtuPW58fDA7dmFyIGM7Yz1cImJvdHRvbVwiPT09ZT9pLmJvdHRvbS11OlwibWlkZGxlXCI9PT1lP2kuYm90dG9tLXUvMi1pLmhlaWdodC8yOmkudG9wO3ZhciBzPWEtdTtyZXR1cm4gTWF0aC5taW4oYytuK3dpbmRvdy5wYWdlWU9mZnNldCxzKX12YXIgcj10KFwic2Nyb2xsLXRvXCIpO24uZXhwb3J0cz1mdW5jdGlvbih0LG4pe3JldHVybiBuPW58fHt9LFwic3RyaW5nXCI9PXR5cGVvZiB0JiYodD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHQpKSx0P3IoMCxlKHQsbi5vZmZzZXQsbi5hbGlnbiksbik6dm9pZCAwfX0se1wic2Nyb2xsLXRvXCI6MjR9XSwyNDpbZnVuY3Rpb24odCxuKXtmdW5jdGlvbiBlKHQsbixlKXtmdW5jdGlvbiB1KCl7aSh1KSxjLnVwZGF0ZSgpfWU9ZXx8e307dmFyIGE9cigpLGM9byhhKS5lYXNlKGUuZWFzZXx8XCJvdXQtY2lyY1wiKS50byh7dG9wOm4sbGVmdDp0fSkuZHVyYXRpb24oZS5kdXJhdGlvbnx8MWUzKTtyZXR1cm4gYy51cGRhdGUoZnVuY3Rpb24odCl7d2luZG93LnNjcm9sbFRvKDB8dC5sZWZ0LDB8dC50b3ApfSksYy5vbihcImVuZFwiLGZ1bmN0aW9uKCl7dT1mdW5jdGlvbigpe319KSx1KCksY31mdW5jdGlvbiByKCl7dmFyIHQ9d2luZG93LnBhZ2VZT2Zmc2V0fHxkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wLG49d2luZG93LnBhZ2VYT2Zmc2V0fHxkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtyZXR1cm57dG9wOnQsbGVmdDpufX12YXIgbz10KFwidHdlZW5cIiksaT10KFwicmFmXCIpO24uZXhwb3J0cz1lfSx7cmFmOjIsdHdlZW46M31dLDI1OltmdW5jdGlvbih0LG4peyFmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIGUodCl7aWYodi5zZXR0aW5ncz1oLmRlZmF1bHRzKHt9LHQseSkscChcImxvYWRpbmdcIiksaC5pc0RvbSh2LnNldHRpbmdzLmNvbnRhaW5lcil8fCh2LnNldHRpbmdzLmNvbnRhaW5lcj1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHYuc2V0dGluZ3MuY29udGFpbmVyKSksbnVsbD09PXYuc2V0dGluZ3MuY29udGFpbmVyfHxcInN0cmluZ1wiPT10eXBlb2Ygdi5zZXR0aW5ncy5jb250YWluZXIpdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGZpbmQgdGhlIGNvbnRlbnQgY29udGFpbmVyLiAgTWFrZSBzdXJlIHlvdSBwYXNzZWQgaW4gYSB2YWxpZCBEb20gbm9kZSBvciBDU1Mgc2VsZWN0b3IuXCIpO2Yodi5zZXR0aW5ncy5jb250YWluZXIpLGwodi5zZWN0aW9ucy5yYXcpLHModi5zZWN0aW9ucy5kYXRhKSxjKCksYSgpLHUoKSxyKCl9ZnVuY3Rpb24gcigpe3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsaC5kZWJvdW5jZSh1LHYuc2V0dGluZ3MuZGVib3VuY2VUaW1lcikpLHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsbyksdi5uYXYuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsaSl9ZnVuY3Rpb24gbygpe2guZGVib3VuY2UoZnVuY3Rpb24oKXthKCksdSgpfSx2LnNldHRpbmdzLmRlYm91bmNlVGltZXIpfWZ1bmN0aW9uIGkodCl7aWYoXCJBXCI9PT10LnRhcmdldC5ub2RlTmFtZSl7dmFyIG49dC50YXJnZXQuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKTtkKG4se29mZnNldDotNDV9KX19ZnVuY3Rpb24gdSgpe3ZhciB0PXdpbmRvdy5wYWdlWU9mZnNldCxuPXQrdi5zZXR0aW5ncy5zY3JvbGxPZmZzZXQsZT10K3YuZGltcy52cEhlaWdodC12LnNldHRpbmdzLnNjcm9sbE9mZnNldCxyPVtdLG89W107dD52LmRpbXMubmF2T2Zmc2V0LXYuc2V0dGluZ3MuZml4ZWRNYXJnaW4/aC5hZGRDbGFzcyh2Lm5hdixcImZpeGVkXCIpOmgucmVtb3ZlQ2xhc3Modi5uYXYsXCJmaXhlZFwiKTt2YXIgaT1mdW5jdGlvbih0KXtyZXR1cm4gdC50b3BPZmZzZXQ+PW4mJnQudG9wT2Zmc2V0PD1lfHx0LmJvdHRvbU9mZnNldD5uJiZ0LmJvdHRvbU9mZnNldDxlfHx0LnRvcE9mZnNldDxuJiZ0LmJvdHRvbU9mZnNldD5lfTtoLmVhY2godi5zZWN0aW9ucy5kYXRhLGZ1bmN0aW9uKHQpe2kodCkmJnIucHVzaCh0KSxoLmVhY2godC5zdWJTZWN0aW9ucyxmdW5jdGlvbigpe2kodCkmJm8ucHVzaCh0KX0pfSk7dmFyIHU9di5uYXYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSh2LnNldHRpbmdzLmNsYXNzTmFtZStcIl9faXRlbVwiKTtoLmVhY2godSxmdW5jdGlvbih0KXtoLnJlbW92ZUNsYXNzKHQsXCJhY3RpdmVcIiksaC5yZW1vdmVDbGFzcyh0LFwiaW4tdmlld1wiKX0pO3ZhciBhPXYubmF2LmdldEVsZW1lbnRzQnlDbGFzc05hbWUodi5zZXR0aW5ncy5jbGFzc05hbWUrXCJfX3N1Yi1pdGVtXCIpO2guZWFjaChhLGZ1bmN0aW9uKHQpe2gucmVtb3ZlQ2xhc3ModCxcImFjdGl2ZVwiKSxoLnJlbW92ZUNsYXNzKHQsXCJpbi12aWV3XCIpfSksaC5lYWNoKHIsZnVuY3Rpb24odCxuKXt2YXIgZSxyOzA9PT1uPyhlPXYubmF2LnF1ZXJ5U2VsZWN0b3IoJ2FbaHJlZj1cIiMnK3QuaWQrJ1wiXScpLHI9aC5wYXJlbnRzKGUsdi5zZXR0aW5ncy5jbGFzc05hbWUrXCJfX2l0ZW1cIiksaC5lYWNoKHIsZnVuY3Rpb24odCl7aC5hZGRDbGFzcyh0LFwiYWN0aXZlXCIpLGguYWRkQ2xhc3ModCxcImluLXZpZXdcIil9KSk6KGU9di5uYXYucXVlcnlTZWxlY3RvcignYVtocmVmPVwiIycrdC5pZCsnXCJdJykscj1oLnBhcmVudHMoZSx2LnNldHRpbmdzLmNsYXNzTmFtZStcIl9faXRlbVwiKSxoLmVhY2gocixmdW5jdGlvbih0KXtoLmFkZENsYXNzKHQsXCJpbi12aWV3XCIpfSkpfSksdi5zZWN0aW9ucy5hY3RpdmU9cixoLmVhY2gobyxmdW5jdGlvbih0KXt2YXIgbixlOzA9PT10PyhuPXYubmF2LnF1ZXJ5U2VsZWN0b3IoJ2FbaHJlZj1cIiMnK3RoaXMuaWQrJ1wiXScpLGU9aC5wYXJlbnRzKG4sdi5zZXR0aW5ncy5jbGFzc05hbWUrXCJfX3N1Yi1pdGVtXCIpLF9lYWNoKGUsZnVuY3Rpb24odCl7aC5hZGRDbGFzcyh0LFwiYWN0aXZlXCIpLGguYWRkQ2xhc3ModCxcImluLXZpZXdcIil9KSk6KG49di5uYXYucXVlcnlTZWxlY3RvcignYVtocmVmPVwiIycrdGhpcy5pZCsnXCJdJyksZT1oLnBhcmVudHModi5zZXR0aW5ncy5jbGFzc05hbWUrXCJfX3N1Yi1pdGVtXCIpLF9lYWNoKGUsZnVuY3Rpb24odCl7aC5hZGRDbGFzcyh0LFwiaW4tdmlld1wiKX0pKX0pfWZ1bmN0aW9uIGEoKXt2YXIgdD1oLmdldFdpbmRvd1NpemUoKS5oZWlnaHQsbj1oLm9mZnNldCh2Lm5hdikudG9wLGU9ZnVuY3Rpb24odCl7dmFyIG49ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodC5pZCk7dC50b3BPZmZzZXQ9aC5vZmZzZXQobikudG9wLHQuYm90dG9tT2Zmc2V0PXQudG9wT2Zmc2V0K24uY2xpZW50SGVpZ2h0fTtoLmVhY2godi5zZWN0aW9ucy5kYXRhLGZ1bmN0aW9uKHQpe2UodCksaC5lYWNoKHQuc3ViU2VjdGlvbnMsZnVuY3Rpb24odCl7ZSh0KX0pfSksdi5kaW1zPXt2cEhlaWdodDp0LG5hdk9mZnNldDpufX1mdW5jdGlvbiBjKCl7aC5pc0RvbSh2LnNldHRpbmdzLmluc2VydFRhcmdldCk/di5zZXR0aW5ncy5pbnNlcnRUYXJnZXQuYXBwZW5kQ2hpbGQodi5uYXYpOmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iodi5zZXR0aW5ncy5pbnNlcnRUYXJnZXQpLmFwcGVuZENoaWxkKHYubmF2KX1mdW5jdGlvbiBzKHQpe3ZhciBuPWguY3JlYXRlKFwib2xcIix2LnNldHRpbmdzLmNsYXNzTmFtZStcIl9fbGlzdFwiKSxlPWguY3JlYXRlKFwic3BhblwiLHYuc2V0dGluZ3MuY2xhc3NOYW1lK1wiX19oZWFkaW5nXCIpLHI9aC5jcmVhdGUoXCJkaXZcIix2LnNldHRpbmdzLmNsYXNzTmFtZStcIl9fd3JhcHBlclwiKSxvPWguY3JlYXRlKFwibmF2XCIsdi5zZXR0aW5ncy5jbGFzc05hbWUpO28uc2V0QXR0cmlidXRlKFwicm9sZVwiLFwibmF2aWdhdGlvblwiKSxlLmlubmVySFRNTD12LnNldHRpbmdzLmhlYWRsaW5lVGV4dCxoLmVhY2godCxmdW5jdGlvbih0LGUpe3ZhciByLG89MD09PWU/aC5jcmVhdGUoXCJsaVwiLHYuc2V0dGluZ3MuY2xhc3NOYW1lK1wiX19pdGVtIGFjdGl2ZVwiLG4pOmguY3JlYXRlKFwibGlcIix2LnNldHRpbmdzLmNsYXNzTmFtZStcIl9faXRlbVwiLG4pLGk9aC5jcmVhdGUoXCJhXCIsdi5zZXR0aW5ncy5jbGFzc05hbWUrXCJfX2xpbmtcIixvKTtpLnNldEF0dHJpYnV0ZShcImhyZWZcIixcIiNcIit0LmlkKSxpLmlubmVySFRNTD10LnRleHQsdC5zdWJTZWN0aW9ucy5sZW5ndGg+MCYmKGguYWRkQ2xhc3MobyxcImlzLXBhcmVudC1pdGVtXCIpLHI9aC5jcmVhdGUoXCJvbFwiLHYuc2V0dGluZ3MuY2xhc3NOYW1lK1wiX19zdWItbGlzdFwiLG8pLGguZWFjaCh0LnN1YlNlY3Rpb25zLGZ1bmN0aW9uKHQpe3ZhciBuPWguY3JlYXRlKFwibGlcIix2LnNldHRpbmdzLmNsYXNzTmFtZStcIl9fc3ViLWl0ZW1cIixyKSxlPWguY3JlYXRlKFwiYVwiLHYuc2V0dGluZ3MuY2xhc3NOYW1lK1wiX19zdWItbGlua1wiLG4pO2UuaW5uZXJIVE1MPXQudGV4dCxlLnNldEF0dHJpYnV0ZShcImhyZWZcIixcIiNcIit0LmlkKX0pKX0pLHYuc2V0dGluZ3Muc2hvd0hlYWRsaW5lPyhyLmFwcGVuZENoaWxkKGUpLHIuYXBwZW5kQ2hpbGQobiksby5hcHBlbmRDaGlsZChyKSk6by5hcHBlbmRDaGlsZChyLmFwcGVuZENoaWxkKG4pKSx2Lm5hdj1vfWZ1bmN0aW9uIGYodCl7dmFyIG4sZSxyPXYuc2V0dGluZ3Muc2VjdGlvbnMsbz1bXSxpPXQucXVlcnlTZWxlY3RvckFsbChyKTt2LnNldHRpbmdzLnNob3dUb3BMaW5rJiYoZT10LmZpcnN0Q2hpbGQsaC5pcyhlLHIpfHwobj1oLm5leHRVbnRpbChlLHIpLG4udW5zaGlmdChlKSxvLnB1c2gobikpKSxoLmVhY2goaSxmdW5jdGlvbih0KXtuPWgubmV4dFVudGlsKHQsciksbi51bnNoaWZ0KHQpLG8ucHVzaChuKX0pLHYuc2VjdGlvbnM9e3JhdzpvfX1mdW5jdGlvbiBsKHQpe2Z1bmN0aW9uIG4odCl7dmFyIG49aC5maWx0ZXIodCxmdW5jdGlvbih0KXtyZXR1cm4gdC5ub2RlTmFtZT09PXYuc2V0dGluZ3Muc2VjdGlvbnMudG9VcHBlckNhc2UoKX0pO3JldHVybiAxPT09bi5sZW5ndGg/blswXS5pbm5lckhUTUw6dm9pZCBjb25zb2xlLmVycm9yKFwiRm91bmQgbW9yZSB0aGFuIG9uZSBoZWFkaW5nIGluIHRoaXMgc2VjdGlvblwiKX12YXIgZT1bXTtoLmVhY2godCxmdW5jdGlvbih0LHIpe3ZhciBvPVtdLGk9XCJzY3JvbGxOYXYtXCIrKHIrMSksdT1mdW5jdGlvbigpe3JldHVybiAwPT09cn0sYT1mdW5jdGlvbigpe3JldHVybiFoLmlzKHRbMF0sdi5zZXR0aW5ncy5zZWN0aW9ucyl9LGM9di5zZXR0aW5ncy5zaG93VG9wTGluayYmdSgpJiZhKCk/di5zZXR0aW5ncy50b3BMaW5rVGV4dDpuKHQpO2gud3JhcEFsbCh7ZWxtczp0LHdyYXBFbDp2LnNldHRpbmdzLnNlY3Rpb25FbGVtLGlkOmksXCJjbGFzc1wiOnYuc2V0dGluZ3MuY2xhc3NOYW1lK1wiX19zZWN0aW9uXCJ9KSxlLnB1c2goe2lkOmksdGV4dDpjLHN1YlNlY3Rpb25zOm99KX0pLHYuc2VjdGlvbnMuZGF0YT1lfWZ1bmN0aW9uIHAodCl7dmFyIG49ZG9jdW1lbnQuYm9keTtcImxvYWRpbmdcIj09PXQ/aC5hZGRDbGFzcyhuLHYuY2xhc3Nlcy5sb2FkaW5nKTpcInN1Y2Nlc3NcIj09PXQ/KGgucmVtb3ZlQ2xhc3Mobix2LmNsYXNzZXMubG9hZGluZyksaC5hZGRDbGFzcyhuLHYuY2xhc3Nlcy5zdWNjZXNzKSk6KGgucmVtb3ZlQ2xhc3Mobix2LmNsYXNzZXMubG9hZGluZyksaC5hZGRDbGFzcyhib2R5Uy5jbGFzc2VzLmZhaWxlZCkpfXZhciBkPXQoXCJzY3JvbGwtdG8tZWxlbWVudFwiKSxoPXQoXCIuL3V0aWxcIiksdj17Y2xhc3Nlczp7bG9hZGluZzpcInNuLWxvYWRpbmdcIixmYWlsZWQ6XCJzbi1mYWlsZWRcIixzdWNjZXNzOlwic24tYWN0aXZlXCJ9fSx5PXtjbGFzc05hbWU6XCJzY3JvbGwtbmF2XCIsY29udGFpbmVyOmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGFpbmVyXCIpLGRlYm91bmNlVGltZXI6MTAsaGVhZGxpbmVUZXh0OlwiU2Nyb2xsIFRvXCIsaW5zZXJ0VGFyZ2V0OmRvY3VtZW50LmJvZHksc2VjdGlvbnM6XCJoMlwiLHNlY3Rpb25FbGVtOlwic2VjdGlvblwiLHNob3dIZWFkbGluZTohMCxzdWJTZWN0aW9uczohMCxmaXhlZE1hcmdpbjo0MCxzY3JvbGxPZmZzZXQ6NDB9O24uZXhwb3J0cy5pbml0PWV9KCl9LHtcIi4vdXRpbFwiOjI2LFwic2Nyb2xsLXRvLWVsZW1lbnRcIjoyM31dLDI2OltmdW5jdGlvbih0LG4peyFmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIGUodCxuKXt2YXIgZT1bXTtyZXR1cm4gYi5pc0FycmF5KHQpfHwodD1bdF0pLGIuZWFjaCh0LGZ1bmN0aW9uKHQpe2IuaGFzQ2xhc3ModC5wYXJlbnROb2RlLG4pJiZlLnB1c2godC5wYXJlbnROb2RlKX0pLGV9ZnVuY3Rpb24gcih0LG4pe1tdLnNvbWUuY2FsbCh0LGZ1bmN0aW9uKHQpe3JldHVybiB0Lm1hdGNoZXMobil9KX1mdW5jdGlvbiBvKHQsbil7Zm9yKHZhciBlPVtdLHI9ITA7dD10Lm5leHRFbGVtZW50U2libGluZzspciYmdCYmIXQubWF0Y2hlcyhuKT9lLnB1c2godCk6cj0hMTtyZXR1cm4gZX1mdW5jdGlvbiBpKHQpe2Zvcih2YXIgbj10LnBhcmVudE5vZGU7dC5maXJzdENoaWxkOyluLmluc2VydEJlZm9yZSh0LmZpcnN0Q2hpbGQsdCk7bi5yZW1vdmVDaGlsZCh0KX1mdW5jdGlvbiB1KHQpe3ZhciBuPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodC53cmFwRWwpO3JldHVybiBuLnNldEF0dHJpYnV0ZShcImlkXCIsdC5pZCkscChuLHRbXCJjbGFzc1wiXSksdC5lbG1zWzBdLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQobiksYi5lYWNoKHQuZWxtcyxmdW5jdGlvbih0KXtuLmFwcGVuZENoaWxkKHQpfSksbn1mdW5jdGlvbiBhKHQsbil7dm9pZCAwIT09dC5jbGFzc0xpc3Q/dC5jbGFzc0xpc3QucmVtb3ZlKG4pOmQodCxsKChcIiBcIitoKHQpK1wiIFwiKS5yZXBsYWNlKFwiIFwiK24rXCIgXCIsXCIgXCIpKSl9ZnVuY3Rpb24gYyh0KXt2YXIgbj10LnBhcmVudE5vZGU7biYmbi5yZW1vdmVDaGlsZCh0KX1mdW5jdGlvbiBzKHQsbil7aWYodm9pZCAwIT09dC5jbGFzc0xpc3QpcmV0dXJuIHQuY2xhc3NMaXN0LmNvbnRhaW5zKG4pO3ZhciBlPWgodCk7cmV0dXJuIGUubGVuZ3RoPjAmJm5ldyBSZWdFeHAoXCIoXnxcXFxccylcIituK1wiKFxcXFxzfCQpXCIpLnRlc3QoZSl9ZnVuY3Rpb24gZih0KXtyZXR1cm4gbCh0KS5zcGxpdCgvXFxzKy8pfWZ1bmN0aW9uIGwodCl7cmV0dXJuIHQudHJpbT90LnRyaW0oKTp0LnJlcGxhY2UoL15cXHMrfFxccyskL2csXCJcIil9ZnVuY3Rpb24gcCh0LG4pe2lmKHZvaWQgMCE9PXQuY2xhc3NMaXN0KWZvcih2YXIgZT1mKG4pLHI9MCxvPWUubGVuZ3RoO28+cjtyKyspdC5jbGFzc0xpc3QuYWRkKGVbcl0pO2Vsc2UgaWYoIXModCxuKSl7dmFyIGk9aCh0KTtkKHQsKGk/aStcIiBcIjpcIlwiKStuKX19ZnVuY3Rpb24gZCh0LG4pe3ZvaWQgMD09PXQuY2xhc3NOYW1lLmJhc2VWYWw/dC5jbGFzc05hbWU9bjp0LmNsYXNzTmFtZS5iYXNlVmFsPW59ZnVuY3Rpb24gaCh0KXtyZXR1cm4gdm9pZCAwPT09dC5jbGFzc05hbWUuYmFzZVZhbD90LmNsYXNzTmFtZTp0LmNsYXNzTmFtZS5iYXNlVmFsfWZ1bmN0aW9uIHYodCxuLGUpe3ZhciByPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodCk7cmV0dXJuIHIuY2xhc3NOYW1lPW4sZSYmZS5hcHBlbmRDaGlsZChyKSxyfWZ1bmN0aW9uIHkoKXtmdW5jdGlvbiB0KCl7dmFyIHQsbj1kb2N1bWVudCxlPW4uY3JlYXRlRWxlbWVudChcImRpdlwiKTtyZXR1cm4gZS5zdHlsZS5oZWlnaHQ9XCI1MDAwMHB4XCIsbi5ib2R5Lmluc2VydEJlZm9yZShlLG4uYm9keS5maXJzdENoaWxkKSx0PW4uZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodD40OWUzLG4uYm9keS5yZW1vdmVDaGlsZChlKSx0fXZhciBuPWRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxlPW4mJjA9PT1uLmNsaWVudEhlaWdodCxyPWRvY3VtZW50LmJvZHk7cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIGRvY3VtZW50LmNsaWVudFdpZHRoP3t3aWR0aDpkb2N1bWVudC5jbGllbnRXaWR0aCxoZWlnaHQ6ZG9jdW1lbnQuY2xpZW50SGVpZ2h0fTplfHx0KCk/e3dpZHRoOnIuY2xpZW50V2lkdGgsaGVpZ2h0OnIuY2xpZW50SGVpZ2h0fTp7d2lkdGg6bi5jbGllbnRXaWR0aCxoZWlnaHQ6bi5jbGllbnRIZWlnaHR9fWZ1bmN0aW9uIGcodCl7dmFyIG49dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxlPXdpbmRvdy5wYWdlWE9mZnNldHx8ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQscj13aW5kb3cucGFnZVlPZmZzZXR8fGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7cmV0dXJue3RvcDpuLnRvcCtyLGxlZnQ6bi5sZWZ0K2V9fXZhciBiPXtlYWNoOnQoXCJsb2Rhc2guZm9yRWFjaFwiKSxmaWx0ZXI6dChcImxvZGFzaC5maWx0ZXJcIiksaXNEb206dChcImlzLWRvbVwiKSxkZWJvdW5jZTp0KFwibG9kYXNoLmRlYm91bmNlXCIpLGRlZmF1bHRzOnQoXCJsb2Rhc2guZGVmYXVsdHNcIiksaXNBcnJheTp0KFwibG9kYXNoLmlzQXJyYXlcIikscGFyZW50czplLG9mZnNldDpnLHJlbW92ZTpjLHJlbW92ZUNsYXNzOmEsZ2V0V2luZG93U2l6ZTp5LGlzOnIsbmV4dFVudGlsOm8sdW53cmFwOmksd3JhcEFsbDp1LGhhc0NsYXNzOnMsYWRkQ2xhc3M6cCxzcGxpdFdvcmRzOmYsdHJpbTpsLHNldENsYXNzOmQsZ2V0Q2xhc3M6aCxjcmVhdGU6dn07bi5leHBvcnRzPWJ9KCl9LHtcImlzLWRvbVwiOjcsXCJsb2Rhc2guZGVib3VuY2VcIjoxNyxcImxvZGFzaC5kZWZhdWx0c1wiOjE4LFwibG9kYXNoLmZpbHRlclwiOjE5LFwibG9kYXNoLmZvckVhY2hcIjoyMCxcImxvZGFzaC5pc0FycmF5XCI6MjF9XX0se30sWzI1XSkoMjUpfSk7IiwiaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzZWxmO1xufSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHt9O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIG9ialR5cGUgPSByZXF1aXJlKCdvYmotdHlwZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbCwgc3RyKSB7XG5cdGlmIChvYmpUeXBlKGVsKS5pbmRleE9mKCdlbGVtZW50JykgPT09IC0xKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYW4gSFRNTCBET00gZWxlbWVudCBhcyBmaXJzdCBhcmd1bWVudCcpO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBzdHJpbmcgYXMgc2Vjb25kIGFyZ3VtZW50Jyk7XG5cdH1cblxuXHRpZiAoZWwuY2xhc3NMaXN0KSB7XG5cdFx0cmV0dXJuIGVsLmNsYXNzTGlzdC5jb250YWlucyhzdHIpO1xuXHR9XG5cblx0cmV0dXJuIG5ldyBSZWdFeHAoJyhefCApJyArIHN0ciArICcoIHwkKScsICdnaScpLnRlc3QoZWwuY2xhc3NOYW1lKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb25cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uIChmbikge1xuICB2YXIgc3RyaW5nID0gdG9TdHJpbmcuY2FsbChmbilcbiAgcmV0dXJuIHN0cmluZyA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJyB8fFxuICAgICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgJiYgc3RyaW5nICE9PSAnW29iamVjdCBSZWdFeHBdJykgfHxcbiAgICAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgLy8gSUU4IGFuZCBiZWxvd1xuICAgICAoZm4gPT09IHdpbmRvdy5zZXRUaW1lb3V0IHx8XG4gICAgICBmbiA9PT0gd2luZG93LmFsZXJ0IHx8XG4gICAgICBmbiA9PT0gd2luZG93LmNvbmZpcm0gfHxcbiAgICAgIGZuID09PSB3aW5kb3cucHJvbXB0KSlcbn07XG4iLCIvKipcbiAqIGxvZGFzaCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cHM6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgPGh0dHBzOi8vanF1ZXJ5Lm9yZy8+XG4gKiBSZWxlYXNlZCB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuOC4zIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKi9cblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLiAqL1xudmFyIHJlSXNVaW50ID0gL14oPzowfFsxLTldXFxkKikkLztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50aW1lc2Agd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzXG4gKiBvciBtYXggYXJyYXkgbGVuZ3RoIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBpbnZva2UgYGl0ZXJhdGVlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUaW1lcyhuLCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gb2JqZWN0UHJvdG8ucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVHZXRQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YsXG4gICAgbmF0aXZlS2V5cyA9IE9iamVjdC5rZXlzO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvckVhY2hgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICovXG52YXIgYmFzZUVhY2ggPSBjcmVhdGVCYXNlRWFjaChiYXNlRm9yT3duKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYmFzZUZvck93bmAgd2hpY2ggaXRlcmF0ZXMgb3ZlciBgb2JqZWN0YFxuICogcHJvcGVydGllcyByZXR1cm5lZCBieSBga2V5c0Z1bmNgIGFuZCBpbnZva2VzIGBpdGVyYXRlZWAgZm9yIGVhY2ggcHJvcGVydHkuXG4gKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHtGdW5jdGlvbn0ga2V5c0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUga2V5cyBvZiBgb2JqZWN0YC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbnZhciBiYXNlRm9yID0gY3JlYXRlQmFzZUZvcigpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvck93bmAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VGb3JPd24ob2JqZWN0LCBpdGVyYXRlZSkge1xuICByZXR1cm4gb2JqZWN0ICYmIGJhc2VGb3Iob2JqZWN0LCBpdGVyYXRlZSwga2V5cyk7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaGFzYCB3aXRob3V0IHN1cHBvcnQgZm9yIGRlZXAgcGF0aHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBrZXkgVGhlIGtleSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUhhcyhvYmplY3QsIGtleSkge1xuICAvLyBBdm9pZCBhIGJ1ZyBpbiBJRSAxMC0xMSB3aGVyZSBvYmplY3RzIHdpdGggYSBbW1Byb3RvdHlwZV1dIG9mIGBudWxsYCxcbiAgLy8gdGhhdCBhcmUgY29tcG9zZWQgZW50aXJlbHkgb2YgaW5kZXggcHJvcGVydGllcywgcmV0dXJuIGBmYWxzZWAgZm9yXG4gIC8vIGBoYXNPd25Qcm9wZXJ0eWAgY2hlY2tzIG9mIHRoZW0uXG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSB8fFxuICAgICh0eXBlb2Ygb2JqZWN0ID09ICdvYmplY3QnICYmIGtleSBpbiBvYmplY3QgJiYgZ2V0UHJvdG90eXBlKG9iamVjdCkgPT09IG51bGwpO1xufVxuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNgIHdoaWNoIGRvZXNuJ3Qgc2tpcCB0aGUgY29uc3RydWN0b3JcbiAqIHByb3BlcnR5IG9mIHByb3RvdHlwZXMgb3IgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXMob2JqZWN0KSB7XG4gIHJldHVybiBuYXRpdmVLZXlzKE9iamVjdChvYmplY3QpKTtcbn1cblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5wcm9wZXJ0eWAgd2l0aG91dCBzdXBwb3J0IGZvciBkZWVwIHBhdGhzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGFjY2Vzc29yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlUHJvcGVydHkoa2V5KSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgYGJhc2VFYWNoYCBvciBgYmFzZUVhY2hSaWdodGAgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVhY2hGdW5jIFRoZSBmdW5jdGlvbiB0byBpdGVyYXRlIG92ZXIgYSBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRWFjaChlYWNoRnVuYywgZnJvbVJpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbihjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICAgIGlmIChjb2xsZWN0aW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICAgIH1cbiAgICBpZiAoIWlzQXJyYXlMaWtlKGNvbGxlY3Rpb24pKSB7XG4gICAgICByZXR1cm4gZWFjaEZ1bmMoY29sbGVjdGlvbiwgaXRlcmF0ZWUpO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGgsXG4gICAgICAgIGluZGV4ID0gZnJvbVJpZ2h0ID8gbGVuZ3RoIDogLTEsXG4gICAgICAgIGl0ZXJhYmxlID0gT2JqZWN0KGNvbGxlY3Rpb24pO1xuXG4gICAgd2hpbGUgKChmcm9tUmlnaHQgPyBpbmRleC0tIDogKytpbmRleCA8IGxlbmd0aCkpIHtcbiAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtpbmRleF0sIGluZGV4LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgYmFzZSBmdW5jdGlvbiBmb3IgbWV0aG9kcyBsaWtlIGBfLmZvckluYCBhbmQgYF8uZm9yT3duYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRm9yKGZyb21SaWdodCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0LCBpdGVyYXRlZSwga2V5c0Z1bmMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgaXRlcmFibGUgPSBPYmplY3Qob2JqZWN0KSxcbiAgICAgICAgcHJvcHMgPSBrZXlzRnVuYyhvYmplY3QpLFxuICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIHZhciBrZXkgPSBwcm9wc1tmcm9tUmlnaHQgPyBsZW5ndGggOiArK2luZGV4XTtcbiAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtrZXldLCBrZXksIGl0ZXJhYmxlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH07XG59XG5cbi8qKlxuICogR2V0cyB0aGUgXCJsZW5ndGhcIiBwcm9wZXJ0eSB2YWx1ZSBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGF2b2lkIGFcbiAqIFtKSVQgYnVnXShodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTQyNzkyKSB0aGF0IGFmZmVjdHNcbiAqIFNhZmFyaSBvbiBhdCBsZWFzdCBpT1MgOC4xLTguMyBBUk02NC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIFwibGVuZ3RoXCIgdmFsdWUuXG4gKi9cbnZhciBnZXRMZW5ndGggPSBiYXNlUHJvcGVydHkoJ2xlbmd0aCcpO1xuXG4vKipcbiAqIEdldHMgdGhlIGBbW1Byb3RvdHlwZV1dYCBvZiBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtudWxsfE9iamVjdH0gUmV0dXJucyB0aGUgYFtbUHJvdG90eXBlXV1gLlxuICovXG5mdW5jdGlvbiBnZXRQcm90b3R5cGUodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZUdldFByb3RvdHlwZShPYmplY3QodmFsdWUpKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIGluZGV4IGtleXMgZm9yIGBvYmplY3RgIHZhbHVlcyBvZiBhcnJheXMsXG4gKiBgYXJndW1lbnRzYCBvYmplY3RzLCBhbmQgc3RyaW5ncywgb3RoZXJ3aXNlIGBudWxsYCBpcyByZXR1cm5lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fG51bGx9IFJldHVybnMgaW5kZXgga2V5cywgZWxzZSBgbnVsbGAuXG4gKi9cbmZ1bmN0aW9uIGluZGV4S2V5cyhvYmplY3QpIHtcbiAgdmFyIGxlbmd0aCA9IG9iamVjdCA/IG9iamVjdC5sZW5ndGggOiB1bmRlZmluZWQ7XG4gIGlmIChpc0xlbmd0aChsZW5ndGgpICYmXG4gICAgICAoaXNBcnJheShvYmplY3QpIHx8IGlzU3RyaW5nKG9iamVjdCkgfHwgaXNBcmd1bWVudHMob2JqZWN0KSkpIHtcbiAgICByZXR1cm4gYmFzZVRpbWVzKGxlbmd0aCwgU3RyaW5nKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgaW5kZXguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBpbmRleCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcbiAgbGVuZ3RoID0gbGVuZ3RoID09IG51bGwgPyBNQVhfU0FGRV9JTlRFR0VSIDogbGVuZ3RoO1xuICByZXR1cm4gISFsZW5ndGggJiZcbiAgICAodHlwZW9mIHZhbHVlID09ICdudW1iZXInIHx8IHJlSXNVaW50LnRlc3QodmFsdWUpKSAmJlxuICAgICh2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDwgbGVuZ3RoKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYSBwcm90b3R5cGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvdG90eXBlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvdG90eXBlKHZhbHVlKSB7XG4gIHZhciBDdG9yID0gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IsXG4gICAgICBwcm90byA9ICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlKSB8fCBvYmplY3RQcm90bztcblxuICByZXR1cm4gdmFsdWUgPT09IHByb3RvO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKHZhbHVlKSB7XG4gIC8vIFNhZmFyaSA4LjEgaW5jb3JyZWN0bHkgbWFrZXMgYGFyZ3VtZW50cy5jYWxsZWVgIGVudW1lcmFibGUgaW4gc3RyaWN0IG1vZGUuXG4gIHJldHVybiBpc0FycmF5TGlrZU9iamVjdCh2YWx1ZSkgJiYgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpICYmXG4gICAgKCFwcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgfHwgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gYXJnc1RhZyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS4gQSB2YWx1ZSBpcyBjb25zaWRlcmVkIGFycmF5LWxpa2UgaWYgaXQnc1xuICogbm90IGEgZnVuY3Rpb24gYW5kIGhhcyBhIGB2YWx1ZS5sZW5ndGhgIHRoYXQncyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiBvclxuICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKGdldExlbmd0aCh2YWx1ZSkpICYmICFpc0Z1bmN0aW9uKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmlzQXJyYXlMaWtlYCBleGNlcHQgdGhhdCBpdCBhbHNvIGNoZWNrcyBpZiBgdmFsdWVgXG4gKiBpcyBhbiBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXktbGlrZSBvYmplY3QsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZU9iamVjdChkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5TGlrZU9iamVjdChfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2VPYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaXNBcnJheUxpa2UodmFsdWUpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gU2FmYXJpIDggd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXkgYW5kIHdlYWsgbWFwIGNvbnN0cnVjdG9ycyxcbiAgLy8gYW5kIFBoYW50b21KUyAxLjkgd2hpY2ggcmV0dXJucyAnZnVuY3Rpb24nIGZvciBgTm9kZUxpc3RgIGluc3RhbmNlcy5cbiAgdmFyIHRhZyA9IGlzT2JqZWN0KHZhbHVlKSA/IG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpIDogJyc7XG4gIHJldHVybiB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gKlxuICogKipOb3RlOioqIFRoaXMgZnVuY3Rpb24gaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0xlbmd0aGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLXRvbGVuZ3RoKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGxlbmd0aCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNMZW5ndGgoMyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0xlbmd0aChOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aChJbmZpbml0eSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoJzMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTGVuZ3RoKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgJiZcbiAgICB2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDw9IE1BWF9TQUZFX0lOVEVHRVI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gISF2YWx1ZSAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN0cmluZ2AgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTdHJpbmcoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTdHJpbmcoMSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzdHJpbmcnIHx8XG4gICAgKCFpc0FycmF5KHZhbHVlKSAmJiBpc09iamVjdExpa2UodmFsdWUpICYmIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN0cmluZ1RhZyk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcbiAqIFtFUyBzcGVjXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8ua2V5cygnaGknKTtcbiAqIC8vID0+IFsnMCcsICcxJ11cbiAqL1xuZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcbiAgdmFyIGlzUHJvdG8gPSBpc1Byb3RvdHlwZShvYmplY3QpO1xuICBpZiAoIShpc1Byb3RvIHx8IGlzQXJyYXlMaWtlKG9iamVjdCkpKSB7XG4gICAgcmV0dXJuIGJhc2VLZXlzKG9iamVjdCk7XG4gIH1cbiAgdmFyIGluZGV4ZXMgPSBpbmRleEtleXMob2JqZWN0KSxcbiAgICAgIHNraXBJbmRleGVzID0gISFpbmRleGVzLFxuICAgICAgcmVzdWx0ID0gaW5kZXhlcyB8fCBbXSxcbiAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgIGlmIChiYXNlSGFzKG9iamVjdCwga2V5KSAmJlxuICAgICAgICAhKHNraXBJbmRleGVzICYmIChrZXkgPT0gJ2xlbmd0aCcgfHwgaXNJbmRleChrZXksIGxlbmd0aCkpKSAmJlxuICAgICAgICAhKGlzUHJvdG8gJiYga2V5ID09ICdjb25zdHJ1Y3RvcicpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VFYWNoO1xuIiwiLyoqXG4gKiBsb2Rhc2ggNC4wLjEgKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTYgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuOC4zIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxNiBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwczovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGJhc2VFYWNoID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlZWFjaCcpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZpbHRlcmAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkaWNhdGUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGZpbHRlcmVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBiYXNlRmlsdGVyKGNvbGxlY3Rpb24sIHByZWRpY2F0ZSkge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIGJhc2VFYWNoKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSkge1xuICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUZpbHRlcjtcbiIsIi8qKlxuICogbG9kYXNoIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyA8aHR0cHM6Ly9qcXVlcnkub3JnLz5cbiAqIFJlbGVhc2VkIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwczovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS44LjMgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqL1xudmFyIHN0cmluZ1RvUGF0aCA9IHJlcXVpcmUoJ2xvZGFzaC5fc3RyaW5ndG9wYXRoJyk7XG5cbi8qKiBVc2VkIGFzIHRoZSBzaXplIHRvIGVuYWJsZSBsYXJnZSBhcnJheSBvcHRpbWl6YXRpb25zLiAqL1xudmFyIExBUkdFX0FSUkFZX1NJWkUgPSAyMDA7XG5cbi8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbnZhciBIQVNIX1VOREVGSU5FRCA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgY29tcGFyaXNvbiBzdHlsZXMuICovXG52YXIgVU5PUkRFUkVEX0NPTVBBUkVfRkxBRyA9IDEsXG4gICAgUEFSVElBTF9DT01QQVJFX0ZMQUcgPSAyO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBJTkZJTklUWSA9IDEgLyAwLFxuICAgIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcHJvbWlzZVRhZyA9ICdbb2JqZWN0IFByb21pc2VdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggcHJvcGVydHkgbmFtZXMgd2l0aGluIHByb3BlcnR5IHBhdGhzLiAqL1xudmFyIHJlSXNEZWVwUHJvcCA9IC9cXC58XFxbKD86W15bXFxdXSp8KFtcIiddKSg/Oig/IVxcMSlbXlxcXFxdfFxcXFwuKSo/XFwxKVxcXS8sXG4gICAgcmVJc1BsYWluUHJvcCA9IC9eXFx3KiQvO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGBcbiAqIFtzeW50YXggY2hhcmFjdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtcGF0dGVybnMpLlxuICovXG52YXIgcmVSZWdFeHBDaGFyID0gL1tcXFxcXiQuKis/KClbXFxde318XS9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaG9zdCBjb25zdHJ1Y3RvcnMgKFNhZmFyaSkuICovXG52YXIgcmVJc0hvc3RDdG9yID0gL15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLiAqL1xudmFyIHJlSXNVaW50ID0gL14oPzowfFsxLTldXFxkKikkLztcblxuLyoqIFVzZWQgdG8gaWRlbnRpZnkgYHRvU3RyaW5nVGFnYCB2YWx1ZXMgb2YgdHlwZWQgYXJyYXlzLiAqL1xudmFyIHR5cGVkQXJyYXlUYWdzID0ge307XG50eXBlZEFycmF5VGFnc1tmbG9hdDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Zsb2F0NjRUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDhUYWddID0gdHlwZWRBcnJheVRhZ3NbaW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQ4VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50OENsYW1wZWRUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50MzJUYWddID0gdHJ1ZTtcbnR5cGVkQXJyYXlUYWdzW2FyZ3NUYWddID0gdHlwZWRBcnJheVRhZ3NbYXJyYXlUYWddID1cbnR5cGVkQXJyYXlUYWdzW2FycmF5QnVmZmVyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Jvb2xUYWddID1cbnR5cGVkQXJyYXlUYWdzW2RhdGFWaWV3VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2RhdGVUYWddID1cbnR5cGVkQXJyYXlUYWdzW2Vycm9yVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Z1bmNUYWddID1cbnR5cGVkQXJyYXlUYWdzW21hcFRhZ10gPSB0eXBlZEFycmF5VGFnc1tudW1iZXJUYWddID1cbnR5cGVkQXJyYXlUYWdzW29iamVjdFRhZ10gPSB0eXBlZEFycmF5VGFnc1tyZWdleHBUYWddID1cbnR5cGVkQXJyYXlUYWdzW3NldFRhZ10gPSB0eXBlZEFycmF5VGFnc1tzdHJpbmdUYWddID1cbnR5cGVkQXJyYXlUYWdzW3dlYWtNYXBUYWddID0gZmFsc2U7XG5cbi8qKiBVc2VkIHRvIGRldGVybWluZSBpZiB2YWx1ZXMgYXJlIG9mIHRoZSBsYW5ndWFnZSB0eXBlIGBPYmplY3RgLiAqL1xudmFyIG9iamVjdFR5cGVzID0ge1xuICAnZnVuY3Rpb24nOiB0cnVlLFxuICAnb2JqZWN0JzogdHJ1ZVxufTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IChvYmplY3RUeXBlc1t0eXBlb2YgZXhwb3J0c10gJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSlcbiAgPyBleHBvcnRzXG4gIDogdW5kZWZpbmVkO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IChvYmplY3RUeXBlc1t0eXBlb2YgbW9kdWxlXSAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSlcbiAgPyBtb2R1bGVcbiAgOiB1bmRlZmluZWQ7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IGNoZWNrR2xvYmFsKGZyZWVFeHBvcnRzICYmIGZyZWVNb2R1bGUgJiYgdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gY2hlY2tHbG9iYWwob2JqZWN0VHlwZXNbdHlwZW9mIHNlbGZdICYmIHNlbGYpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHdpbmRvd2AuICovXG52YXIgZnJlZVdpbmRvdyA9IGNoZWNrR2xvYmFsKG9iamVjdFR5cGVzW3R5cGVvZiB3aW5kb3ddICYmIHdpbmRvdyk7XG5cbi8qKiBEZXRlY3QgYHRoaXNgIGFzIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHRoaXNHbG9iYWwgPSBjaGVja0dsb2JhbChvYmplY3RUeXBlc1t0eXBlb2YgdGhpc10gJiYgdGhpcyk7XG5cbi8qKlxuICogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC5cbiAqXG4gKiBUaGUgYHRoaXNgIHZhbHVlIGlzIHVzZWQgaWYgaXQncyB0aGUgZ2xvYmFsIG9iamVjdCB0byBhdm9pZCBHcmVhc2Vtb25rZXknc1xuICogcmVzdHJpY3RlZCBgd2luZG93YCBvYmplY3QsIG90aGVyd2lzZSB0aGUgYHdpbmRvd2Agb2JqZWN0IGlzIHVzZWQuXG4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fFxuICAoKGZyZWVXaW5kb3cgIT09ICh0aGlzR2xvYmFsICYmIHRoaXNHbG9iYWwud2luZG93KSkgJiYgZnJlZVdpbmRvdykgfHxcbiAgICBmcmVlU2VsZiB8fCB0aGlzR2xvYmFsIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLm1hcGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlXG4gKiBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IG1hcHBlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYXJyYXlNYXAoYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uc29tZWAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlXG4gKiBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcHJlZGljYXRlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW55IGVsZW1lbnQgcGFzc2VzIHRoZSBwcmVkaWNhdGUgY2hlY2ssXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBhcnJheVNvbWUoYXJyYXksIHByZWRpY2F0ZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGlmIChwcmVkaWNhdGUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRpbWVzYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHNcbiAqIG9yIG1heCBhcnJheSBsZW5ndGggY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gbiBUaGUgbnVtYmVyIG9mIHRpbWVzIHRvIGludm9rZSBgaXRlcmF0ZWVgLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcmVzdWx0cy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRpbWVzKG4sIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobik7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBuKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGluZGV4KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRvUGFpcnNgIGFuZCBgXy50b1BhaXJzSW5gIHdoaWNoIGNyZWF0ZXMgYW4gYXJyYXlcbiAqIG9mIGtleS12YWx1ZSBwYWlycyBmb3IgYG9iamVjdGAgY29ycmVzcG9uZGluZyB0byB0aGUgcHJvcGVydHkgbmFtZXMgb2YgYHByb3BzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IG5hbWVzIHRvIGdldCB2YWx1ZXMgZm9yLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUga2V5LXZhbHVlIHBhaXJzLlxuICovXG5mdW5jdGlvbiBiYXNlVG9QYWlycyhvYmplY3QsIHByb3BzKSB7XG4gIHJldHVybiBhcnJheU1hcChwcm9wcywgZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIFtrZXksIG9iamVjdFtrZXldXTtcbiAgfSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBnbG9iYWwgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtudWxsfE9iamVjdH0gUmV0dXJucyBgdmFsdWVgIGlmIGl0J3MgYSBnbG9iYWwgb2JqZWN0LCBlbHNlIGBudWxsYC5cbiAqL1xuZnVuY3Rpb24gY2hlY2tHbG9iYWwodmFsdWUpIHtcbiAgcmV0dXJuICh2YWx1ZSAmJiB2YWx1ZS5PYmplY3QgPT09IE9iamVjdCkgPyB2YWx1ZSA6IG51bGw7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCBpbiBJRSA8IDkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0hvc3RPYmplY3QodmFsdWUpIHtcbiAgLy8gTWFueSBob3N0IG9iamVjdHMgYXJlIGBPYmplY3RgIG9iamVjdHMgdGhhdCBjYW4gY29lcmNlIHRvIHN0cmluZ3NcbiAgLy8gZGVzcGl0ZSBoYXZpbmcgaW1wcm9wZXJseSBkZWZpbmVkIGB0b1N0cmluZ2AgbWV0aG9kcy5cbiAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICBpZiAodmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUudG9TdHJpbmcgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSAhISh2YWx1ZSArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ29udmVydHMgYG1hcGAgdG8gaXRzIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG1hcCBUaGUgbWFwIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGtleS12YWx1ZSBwYWlycy5cbiAqL1xuZnVuY3Rpb24gbWFwVG9BcnJheShtYXApIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShtYXAuc2l6ZSk7XG5cbiAgbWFwLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgIHJlc3VsdFsrK2luZGV4XSA9IFtrZXksIHZhbHVlXTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHNldGAgdG8gYW4gYXJyYXkgb2YgaXRzIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNldCBUaGUgc2V0IHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gc2V0VG9BcnJheShzZXQpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShzZXQuc2l6ZSk7XG5cbiAgc2V0LmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHNldGAgdG8gaXRzIHZhbHVlLXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc2V0IFRoZSBzZXQgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgdmFsdWUtdmFsdWUgcGFpcnMuXG4gKi9cbmZ1bmN0aW9uIHNldFRvUGFpcnMoc2V0KSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkoc2V0LnNpemUpO1xuXG4gIHNldC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmVzdWx0WysraW5kZXhdID0gW3ZhbHVlLCB2YWx1ZV07XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgYXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xudmFyIHJlSXNOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgZnVuY1RvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpLnJlcGxhY2UocmVSZWdFeHBDaGFyLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpICsgJyQnXG4pO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbCxcbiAgICBVaW50OEFycmF5ID0gcm9vdC5VaW50OEFycmF5LFxuICAgIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gb2JqZWN0UHJvdG8ucHJvcGVydHlJc0VudW1lcmFibGUsXG4gICAgc3BsaWNlID0gYXJyYXlQcm90by5zcGxpY2U7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVHZXRQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YsXG4gICAgbmF0aXZlS2V5cyA9IE9iamVjdC5rZXlzO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgRGF0YVZpZXcgPSBnZXROYXRpdmUocm9vdCwgJ0RhdGFWaWV3JyksXG4gICAgTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdNYXAnKSxcbiAgICBQcm9taXNlID0gZ2V0TmF0aXZlKHJvb3QsICdQcm9taXNlJyksXG4gICAgU2V0ID0gZ2V0TmF0aXZlKHJvb3QsICdTZXQnKSxcbiAgICBXZWFrTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdXZWFrTWFwJyksXG4gICAgbmF0aXZlQ3JlYXRlID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2NyZWF0ZScpO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgbWFwcywgc2V0cywgYW5kIHdlYWttYXBzLiAqL1xudmFyIGRhdGFWaWV3Q3RvclN0cmluZyA9IHRvU291cmNlKERhdGFWaWV3KSxcbiAgICBtYXBDdG9yU3RyaW5nID0gdG9Tb3VyY2UoTWFwKSxcbiAgICBwcm9taXNlQ3RvclN0cmluZyA9IHRvU291cmNlKFByb21pc2UpLFxuICAgIHNldEN0b3JTdHJpbmcgPSB0b1NvdXJjZShTZXQpLFxuICAgIHdlYWtNYXBDdG9yU3RyaW5nID0gdG9Tb3VyY2UoV2Vha01hcCk7XG5cbi8qKiBVc2VkIHRvIGNvbnZlcnQgc3ltYm9scyB0byBwcmltaXRpdmVzIGFuZCBzdHJpbmdzLiAqL1xudmFyIHN5bWJvbFByb3RvID0gU3ltYm9sID8gU3ltYm9sLnByb3RvdHlwZSA6IHVuZGVmaW5lZCxcbiAgICBzeW1ib2xWYWx1ZU9mID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by52YWx1ZU9mIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBoYXNoIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gSGFzaChlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA/IGVudHJpZXMubGVuZ3RoIDogMDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGhhc2guXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgSGFzaFxuICovXG5mdW5jdGlvbiBoYXNoQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBuYXRpdmVDcmVhdGUgPyBuYXRpdmVDcmVhdGUobnVsbCkgOiB7fTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgaGFzaC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtPYmplY3R9IGhhc2ggVGhlIGhhc2ggdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGhhc2hEZWxldGUoa2V5KSB7XG4gIHJldHVybiB0aGlzLmhhcyhrZXkpICYmIGRlbGV0ZSB0aGlzLl9fZGF0YV9fW2tleV07XG59XG5cbi8qKlxuICogR2V0cyB0aGUgaGFzaCB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBoYXNoR2V0KGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIGlmIChuYXRpdmVDcmVhdGUpIHtcbiAgICB2YXIgcmVzdWx0ID0gZGF0YVtrZXldO1xuICAgIHJldHVybiByZXN1bHQgPT09IEhBU0hfVU5ERUZJTkVEID8gdW5kZWZpbmVkIDogcmVzdWx0O1xuICB9XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsIGtleSkgPyBkYXRhW2tleV0gOiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgaGFzaCB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzaEhhcyhrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICByZXR1cm4gbmF0aXZlQ3JlYXRlID8gZGF0YVtrZXldICE9PSB1bmRlZmluZWQgOiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsIGtleSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgaGFzaCBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGhhc2ggaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIGhhc2hTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIGRhdGFba2V5XSA9IChuYXRpdmVDcmVhdGUgJiYgdmFsdWUgPT09IHVuZGVmaW5lZCkgPyBIQVNIX1VOREVGSU5FRCA6IHZhbHVlO1xuICByZXR1cm4gdGhpcztcbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYEhhc2hgLlxuSGFzaC5wcm90b3R5cGUuY2xlYXIgPSBoYXNoQ2xlYXI7XG5IYXNoLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBoYXNoRGVsZXRlO1xuSGFzaC5wcm90b3R5cGUuZ2V0ID0gaGFzaEdldDtcbkhhc2gucHJvdG90eXBlLmhhcyA9IGhhc2hIYXM7XG5IYXNoLnByb3RvdHlwZS5zZXQgPSBoYXNoU2V0O1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gbGlzdCBjYWNoZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIExpc3RDYWNoZShlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA/IGVudHJpZXMubGVuZ3RoIDogMDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGxpc3QgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUNsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gW107XG59XG5cbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIGxpc3QgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZURlbGV0ZShrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBsYXN0SW5kZXggPSBkYXRhLmxlbmd0aCAtIDE7XG4gIGlmIChpbmRleCA9PSBsYXN0SW5kZXgpIHtcbiAgICBkYXRhLnBvcCgpO1xuICB9IGVsc2Uge1xuICAgIHNwbGljZS5jYWxsKGRhdGEsIGluZGV4LCAxKTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBsaXN0IGNhY2hlIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlR2V0KGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIHJldHVybiBpbmRleCA8IDAgPyB1bmRlZmluZWQgOiBkYXRhW2luZGV4XVsxXTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYSBsaXN0IGNhY2hlIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUhhcyhrZXkpIHtcbiAgcmV0dXJuIGFzc29jSW5kZXhPZih0aGlzLl9fZGF0YV9fLCBrZXkpID4gLTE7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbGlzdCBjYWNoZSBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbGlzdCBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgZGF0YS5wdXNoKFtrZXksIHZhbHVlXSk7XG4gIH0gZWxzZSB7XG4gICAgZGF0YVtpbmRleF1bMV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYExpc3RDYWNoZWAuXG5MaXN0Q2FjaGUucHJvdG90eXBlLmNsZWFyID0gbGlzdENhY2hlQ2xlYXI7XG5MaXN0Q2FjaGUucHJvdG90eXBlWydkZWxldGUnXSA9IGxpc3RDYWNoZURlbGV0ZTtcbkxpc3RDYWNoZS5wcm90b3R5cGUuZ2V0ID0gbGlzdENhY2hlR2V0O1xuTGlzdENhY2hlLnByb3RvdHlwZS5oYXMgPSBsaXN0Q2FjaGVIYXM7XG5MaXN0Q2FjaGUucHJvdG90eXBlLnNldCA9IGxpc3RDYWNoZVNldDtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWFwIGNhY2hlIG9iamVjdCB0byBzdG9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIE1hcENhY2hlKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID8gZW50cmllcy5sZW5ndGggOiAwO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgbWFwLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSB7XG4gICAgJ2hhc2gnOiBuZXcgSGFzaCxcbiAgICAnbWFwJzogbmV3IChNYXAgfHwgTGlzdENhY2hlKSxcbiAgICAnc3RyaW5nJzogbmV3IEhhc2hcbiAgfTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgbWFwLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlRGVsZXRlKGtleSkge1xuICByZXR1cm4gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpWydkZWxldGUnXShrZXkpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIG1hcCB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVHZXQoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSkuZ2V0KGtleSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgbWFwIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVIYXMoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSkuaGFzKGtleSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbWFwIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG1hcCBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVTZXQoa2V5LCB2YWx1ZSkge1xuICBnZXRNYXBEYXRhKHRoaXMsIGtleSkuc2V0KGtleSwgdmFsdWUpO1xuICByZXR1cm4gdGhpcztcbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYE1hcENhY2hlYC5cbk1hcENhY2hlLnByb3RvdHlwZS5jbGVhciA9IG1hcENhY2hlQ2xlYXI7XG5NYXBDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gbWFwQ2FjaGVEZWxldGU7XG5NYXBDYWNoZS5wcm90b3R5cGUuZ2V0ID0gbWFwQ2FjaGVHZXQ7XG5NYXBDYWNoZS5wcm90b3R5cGUuaGFzID0gbWFwQ2FjaGVIYXM7XG5NYXBDYWNoZS5wcm90b3R5cGUuc2V0ID0gbWFwQ2FjaGVTZXQ7XG5cbi8qKlxuICpcbiAqIENyZWF0ZXMgYW4gYXJyYXkgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIHVuaXF1ZSB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW3ZhbHVlc10gVGhlIHZhbHVlcyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gU2V0Q2FjaGUodmFsdWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gdmFsdWVzID8gdmFsdWVzLmxlbmd0aCA6IDA7XG5cbiAgdGhpcy5fX2RhdGFfXyA9IG5ldyBNYXBDYWNoZTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB0aGlzLmFkZCh2YWx1ZXNbaW5kZXhdKTtcbiAgfVxufVxuXG4vKipcbiAqIEFkZHMgYHZhbHVlYCB0byB0aGUgYXJyYXkgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGFkZFxuICogQG1lbWJlck9mIFNldENhY2hlXG4gKiBAYWxpYXMgcHVzaFxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2FjaGUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gc2V0Q2FjaGVBZGQodmFsdWUpIHtcbiAgdGhpcy5fX2RhdGFfXy5zZXQodmFsdWUsIEhBU0hfVU5ERUZJTkVEKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgaW4gdGhlIGFycmF5IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBTZXRDYWNoZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvci5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgZm91bmQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gc2V0Q2FjaGVIYXModmFsdWUpIHtcbiAgcmV0dXJuIHRoaXMuX19kYXRhX18uaGFzKHZhbHVlKTtcbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYFNldENhY2hlYC5cblNldENhY2hlLnByb3RvdHlwZS5hZGQgPSBTZXRDYWNoZS5wcm90b3R5cGUucHVzaCA9IHNldENhY2hlQWRkO1xuU2V0Q2FjaGUucHJvdG90eXBlLmhhcyA9IHNldENhY2hlSGFzO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzdGFjayBjYWNoZSBvYmplY3QgdG8gc3RvcmUga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBTdGFjayhlbnRyaWVzKSB7XG4gIHRoaXMuX19kYXRhX18gPSBuZXcgTGlzdENhY2hlKGVudHJpZXMpO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIHN0YWNrLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIFN0YWNrXG4gKi9cbmZ1bmN0aW9uIHN0YWNrQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBuZXcgTGlzdENhY2hlO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBzdGFjay5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBzdGFja0RlbGV0ZShrZXkpIHtcbiAgcmV0dXJuIHRoaXMuX19kYXRhX19bJ2RlbGV0ZSddKGtleSk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgc3RhY2sgdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrR2V0KGtleSkge1xuICByZXR1cm4gdGhpcy5fX2RhdGFfXy5nZXQoa2V5KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYSBzdGFjayB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrSGFzKGtleSkge1xuICByZXR1cm4gdGhpcy5fX2RhdGFfXy5oYXMoa2V5KTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBzdGFjayBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBzdGFjayBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gc3RhY2tTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgY2FjaGUgPSB0aGlzLl9fZGF0YV9fO1xuICBpZiAoY2FjaGUgaW5zdGFuY2VvZiBMaXN0Q2FjaGUgJiYgY2FjaGUuX19kYXRhX18ubGVuZ3RoID09IExBUkdFX0FSUkFZX1NJWkUpIHtcbiAgICBjYWNoZSA9IHRoaXMuX19kYXRhX18gPSBuZXcgTWFwQ2FjaGUoY2FjaGUuX19kYXRhX18pO1xuICB9XG4gIGNhY2hlLnNldChrZXksIHZhbHVlKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBTdGFja2AuXG5TdGFjay5wcm90b3R5cGUuY2xlYXIgPSBzdGFja0NsZWFyO1xuU3RhY2sucHJvdG90eXBlWydkZWxldGUnXSA9IHN0YWNrRGVsZXRlO1xuU3RhY2sucHJvdG90eXBlLmdldCA9IHN0YWNrR2V0O1xuU3RhY2sucHJvdG90eXBlLmhhcyA9IHN0YWNrSGFzO1xuU3RhY2sucHJvdG90eXBlLnNldCA9IHN0YWNrU2V0O1xuXG4vKipcbiAqIEdldHMgdGhlIGluZGV4IGF0IHdoaWNoIHRoZSBga2V5YCBpcyBmb3VuZCBpbiBgYXJyYXlgIG9mIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHNlYXJjaC5cbiAqIEBwYXJhbSB7Kn0ga2V5IFRoZSBrZXkgdG8gc2VhcmNoIGZvci5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlLCBlbHNlIGAtMWAuXG4gKi9cbmZ1bmN0aW9uIGFzc29jSW5kZXhPZihhcnJheSwga2V5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gIHdoaWxlIChsZW5ndGgtLSkge1xuICAgIGlmIChlcShhcnJheVtsZW5ndGhdWzBdLCBrZXkpKSB7XG4gICAgICByZXR1cm4gbGVuZ3RoO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZ2V0YCB3aXRob3V0IHN1cHBvcnQgZm9yIGRlZmF1bHQgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc29sdmVkIHZhbHVlLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0KG9iamVjdCwgcGF0aCkge1xuICBwYXRoID0gaXNLZXkocGF0aCwgb2JqZWN0KSA/IFtwYXRoXSA6IGNhc3RQYXRoKHBhdGgpO1xuXG4gIHZhciBpbmRleCA9IDAsXG4gICAgICBsZW5ndGggPSBwYXRoLmxlbmd0aDtcblxuICB3aGlsZSAob2JqZWN0ICE9IG51bGwgJiYgaW5kZXggPCBsZW5ndGgpIHtcbiAgICBvYmplY3QgPSBvYmplY3RbdG9LZXkocGF0aFtpbmRleCsrXSldO1xuICB9XG4gIHJldHVybiAoaW5kZXggJiYgaW5kZXggPT0gbGVuZ3RoKSA/IG9iamVjdCA6IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5oYXNgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IGtleSBUaGUga2V5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSGFzKG9iamVjdCwga2V5KSB7XG4gIC8vIEF2b2lkIGEgYnVnIGluIElFIDEwLTExIHdoZXJlIG9iamVjdHMgd2l0aCBhIFtbUHJvdG90eXBlXV0gb2YgYG51bGxgLFxuICAvLyB0aGF0IGFyZSBjb21wb3NlZCBlbnRpcmVseSBvZiBpbmRleCBwcm9wZXJ0aWVzLCByZXR1cm4gYGZhbHNlYCBmb3JcbiAgLy8gYGhhc093blByb3BlcnR5YCBjaGVja3Mgb2YgdGhlbS5cbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpIHx8XG4gICAgKHR5cGVvZiBvYmplY3QgPT0gJ29iamVjdCcgJiYga2V5IGluIG9iamVjdCAmJiBnZXRQcm90b3R5cGUob2JqZWN0KSA9PT0gbnVsbCk7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaGFzSW5gIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IGtleSBUaGUga2V5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSGFzSW4ob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIGtleSBpbiBPYmplY3Qob2JqZWN0KTtcbn1cblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc0VxdWFsYCB3aGljaCBzdXBwb3J0cyBwYXJ0aWFsIGNvbXBhcmlzb25zXG4gKiBhbmQgdHJhY2tzIHRyYXZlcnNlZCBvYmplY3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIHsqfSBvdGhlciBUaGUgb3RoZXIgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtib29sZWFufSBbYml0bWFza10gVGhlIGJpdG1hc2sgb2YgY29tcGFyaXNvbiBmbGFncy5cbiAqICBUaGUgYml0bWFzayBtYXkgYmUgY29tcG9zZWQgb2YgdGhlIGZvbGxvd2luZyBmbGFnczpcbiAqICAgICAxIC0gVW5vcmRlcmVkIGNvbXBhcmlzb25cbiAqICAgICAyIC0gUGFydGlhbCBjb21wYXJpc29uXG4gKiBAcGFyYW0ge09iamVjdH0gW3N0YWNrXSBUcmFja3MgdHJhdmVyc2VkIGB2YWx1ZWAgYW5kIGBvdGhlcmAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0VxdWFsKHZhbHVlLCBvdGhlciwgY3VzdG9taXplciwgYml0bWFzaywgc3RhY2spIHtcbiAgaWYgKHZhbHVlID09PSBvdGhlcikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmICh2YWx1ZSA9PSBudWxsIHx8IG90aGVyID09IG51bGwgfHwgKCFpc09iamVjdCh2YWx1ZSkgJiYgIWlzT2JqZWN0TGlrZShvdGhlcikpKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9PSB2YWx1ZSAmJiBvdGhlciAhPT0gb3RoZXI7XG4gIH1cbiAgcmV0dXJuIGJhc2VJc0VxdWFsRGVlcCh2YWx1ZSwgb3RoZXIsIGJhc2VJc0VxdWFsLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjayk7XG59XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbGAgZm9yIGFycmF5cyBhbmQgb2JqZWN0cyB3aGljaCBwZXJmb3Jtc1xuICogZGVlcCBjb21wYXJpc29ucyBhbmQgdHJhY2tzIHRyYXZlcnNlZCBvYmplY3RzIGVuYWJsaW5nIG9iamVjdHMgd2l0aCBjaXJjdWxhclxuICogcmVmZXJlbmNlcyB0byBiZSBjb21wYXJlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge09iamVjdH0gb3RoZXIgVGhlIG90aGVyIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXF1YWxGdW5jIFRoZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgZXF1aXZhbGVudHMgb2YgdmFsdWVzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaXNvbnMuXG4gKiBAcGFyYW0ge251bWJlcn0gW2JpdG1hc2tdIFRoZSBiaXRtYXNrIG9mIGNvbXBhcmlzb24gZmxhZ3MuIFNlZSBgYmFzZUlzRXF1YWxgXG4gKiAgZm9yIG1vcmUgZGV0YWlscy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbc3RhY2tdIFRyYWNrcyB0cmF2ZXJzZWQgYG9iamVjdGAgYW5kIGBvdGhlcmAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNFcXVhbERlZXAob2JqZWN0LCBvdGhlciwgZXF1YWxGdW5jLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjaykge1xuICB2YXIgb2JqSXNBcnIgPSBpc0FycmF5KG9iamVjdCksXG4gICAgICBvdGhJc0FyciA9IGlzQXJyYXkob3RoZXIpLFxuICAgICAgb2JqVGFnID0gYXJyYXlUYWcsXG4gICAgICBvdGhUYWcgPSBhcnJheVRhZztcblxuICBpZiAoIW9iaklzQXJyKSB7XG4gICAgb2JqVGFnID0gZ2V0VGFnKG9iamVjdCk7XG4gICAgb2JqVGFnID0gb2JqVGFnID09IGFyZ3NUYWcgPyBvYmplY3RUYWcgOiBvYmpUYWc7XG4gIH1cbiAgaWYgKCFvdGhJc0Fycikge1xuICAgIG90aFRhZyA9IGdldFRhZyhvdGhlcik7XG4gICAgb3RoVGFnID0gb3RoVGFnID09IGFyZ3NUYWcgPyBvYmplY3RUYWcgOiBvdGhUYWc7XG4gIH1cbiAgdmFyIG9iaklzT2JqID0gb2JqVGFnID09IG9iamVjdFRhZyAmJiAhaXNIb3N0T2JqZWN0KG9iamVjdCksXG4gICAgICBvdGhJc09iaiA9IG90aFRhZyA9PSBvYmplY3RUYWcgJiYgIWlzSG9zdE9iamVjdChvdGhlciksXG4gICAgICBpc1NhbWVUYWcgPSBvYmpUYWcgPT0gb3RoVGFnO1xuXG4gIGlmIChpc1NhbWVUYWcgJiYgIW9iaklzT2JqKSB7XG4gICAgc3RhY2sgfHwgKHN0YWNrID0gbmV3IFN0YWNrKTtcbiAgICByZXR1cm4gKG9iaklzQXJyIHx8IGlzVHlwZWRBcnJheShvYmplY3QpKVxuICAgICAgPyBlcXVhbEFycmF5cyhvYmplY3QsIG90aGVyLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKVxuICAgICAgOiBlcXVhbEJ5VGFnKG9iamVjdCwgb3RoZXIsIG9ialRhZywgZXF1YWxGdW5jLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjayk7XG4gIH1cbiAgaWYgKCEoYml0bWFzayAmIFBBUlRJQUxfQ09NUEFSRV9GTEFHKSkge1xuICAgIHZhciBvYmpJc1dyYXBwZWQgPSBvYmpJc09iaiAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgJ19fd3JhcHBlZF9fJyksXG4gICAgICAgIG90aElzV3JhcHBlZCA9IG90aElzT2JqICYmIGhhc093blByb3BlcnR5LmNhbGwob3RoZXIsICdfX3dyYXBwZWRfXycpO1xuXG4gICAgaWYgKG9iaklzV3JhcHBlZCB8fCBvdGhJc1dyYXBwZWQpIHtcbiAgICAgIHZhciBvYmpVbndyYXBwZWQgPSBvYmpJc1dyYXBwZWQgPyBvYmplY3QudmFsdWUoKSA6IG9iamVjdCxcbiAgICAgICAgICBvdGhVbndyYXBwZWQgPSBvdGhJc1dyYXBwZWQgPyBvdGhlci52YWx1ZSgpIDogb3RoZXI7XG5cbiAgICAgIHN0YWNrIHx8IChzdGFjayA9IG5ldyBTdGFjayk7XG4gICAgICByZXR1cm4gZXF1YWxGdW5jKG9ialVud3JhcHBlZCwgb3RoVW53cmFwcGVkLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjayk7XG4gICAgfVxuICB9XG4gIGlmICghaXNTYW1lVGFnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHN0YWNrIHx8IChzdGFjayA9IG5ldyBTdGFjayk7XG4gIHJldHVybiBlcXVhbE9iamVjdHMob2JqZWN0LCBvdGhlciwgZXF1YWxGdW5jLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjayk7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNNYXRjaGAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCBvZiBwcm9wZXJ0eSB2YWx1ZXMgdG8gbWF0Y2guXG4gKiBAcGFyYW0ge0FycmF5fSBtYXRjaERhdGEgVGhlIHByb3BlcnR5IG5hbWVzLCB2YWx1ZXMsIGFuZCBjb21wYXJlIGZsYWdzIHRvIG1hdGNoLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaXNvbnMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYG9iamVjdGAgaXMgYSBtYXRjaCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNNYXRjaChvYmplY3QsIHNvdXJjZSwgbWF0Y2hEYXRhLCBjdXN0b21pemVyKSB7XG4gIHZhciBpbmRleCA9IG1hdGNoRGF0YS5sZW5ndGgsXG4gICAgICBsZW5ndGggPSBpbmRleCxcbiAgICAgIG5vQ3VzdG9taXplciA9ICFjdXN0b21pemVyO1xuXG4gIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgIHJldHVybiAhbGVuZ3RoO1xuICB9XG4gIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICB3aGlsZSAoaW5kZXgtLSkge1xuICAgIHZhciBkYXRhID0gbWF0Y2hEYXRhW2luZGV4XTtcbiAgICBpZiAoKG5vQ3VzdG9taXplciAmJiBkYXRhWzJdKVxuICAgICAgICAgID8gZGF0YVsxXSAhPT0gb2JqZWN0W2RhdGFbMF1dXG4gICAgICAgICAgOiAhKGRhdGFbMF0gaW4gb2JqZWN0KVxuICAgICAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBkYXRhID0gbWF0Y2hEYXRhW2luZGV4XTtcbiAgICB2YXIga2V5ID0gZGF0YVswXSxcbiAgICAgICAgb2JqVmFsdWUgPSBvYmplY3Rba2V5XSxcbiAgICAgICAgc3JjVmFsdWUgPSBkYXRhWzFdO1xuXG4gICAgaWYgKG5vQ3VzdG9taXplciAmJiBkYXRhWzJdKSB7XG4gICAgICBpZiAob2JqVmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHN0YWNrID0gbmV3IFN0YWNrO1xuICAgICAgaWYgKGN1c3RvbWl6ZXIpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGN1c3RvbWl6ZXIob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXksIG9iamVjdCwgc291cmNlLCBzdGFjayk7XG4gICAgICB9XG4gICAgICBpZiAoIShyZXN1bHQgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyBiYXNlSXNFcXVhbChzcmNWYWx1ZSwgb2JqVmFsdWUsIGN1c3RvbWl6ZXIsIFVOT1JERVJFRF9DT01QQVJFX0ZMQUcgfCBQQVJUSUFMX0NPTVBBUkVfRkxBRywgc3RhY2spXG4gICAgICAgICAgICA6IHJlc3VsdFxuICAgICAgICAgICkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pdGVyYXRlZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gW3ZhbHVlPV8uaWRlbnRpdHldIFRoZSB2YWx1ZSB0byBjb252ZXJ0IHRvIGFuIGl0ZXJhdGVlLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBpdGVyYXRlZS5cbiAqL1xuZnVuY3Rpb24gYmFzZUl0ZXJhdGVlKHZhbHVlKSB7XG4gIC8vIERvbid0IHN0b3JlIHRoZSBgdHlwZW9mYCByZXN1bHQgaW4gYSB2YXJpYWJsZSB0byBhdm9pZCBhIEpJVCBidWcgaW4gU2FmYXJpIDkuXG4gIC8vIFNlZSBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTU2MDM0IGZvciBtb3JlIGRldGFpbHMuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiBpZGVudGl0eTtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlID09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGlzQXJyYXkodmFsdWUpXG4gICAgICA/IGJhc2VNYXRjaGVzUHJvcGVydHkodmFsdWVbMF0sIHZhbHVlWzFdKVxuICAgICAgOiBiYXNlTWF0Y2hlcyh2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHByb3BlcnR5KHZhbHVlKTtcbn1cblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzYCB3aGljaCBkb2Vzbid0IHNraXAgdGhlIGNvbnN0cnVjdG9yXG4gKiBwcm9wZXJ0eSBvZiBwcm90b3R5cGVzIG9yIHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzKG9iamVjdCkge1xuICByZXR1cm4gbmF0aXZlS2V5cyhPYmplY3Qob2JqZWN0KSk7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ubWF0Y2hlc2Agd2hpY2ggZG9lc24ndCBjbG9uZSBgc291cmNlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IG9mIHByb3BlcnR5IHZhbHVlcyB0byBtYXRjaC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHNwZWMgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VNYXRjaGVzKHNvdXJjZSkge1xuICB2YXIgbWF0Y2hEYXRhID0gZ2V0TWF0Y2hEYXRhKHNvdXJjZSk7XG4gIGlmIChtYXRjaERhdGEubGVuZ3RoID09IDEgJiYgbWF0Y2hEYXRhWzBdWzJdKSB7XG4gICAgcmV0dXJuIG1hdGNoZXNTdHJpY3RDb21wYXJhYmxlKG1hdGNoRGF0YVswXVswXSwgbWF0Y2hEYXRhWzBdWzFdKTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCA9PT0gc291cmNlIHx8IGJhc2VJc01hdGNoKG9iamVjdCwgc291cmNlLCBtYXRjaERhdGEpO1xuICB9O1xufVxuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLm1hdGNoZXNQcm9wZXJ0eWAgd2hpY2ggZG9lc24ndCBjbG9uZSBgc3JjVmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHBhcmFtIHsqfSBzcmNWYWx1ZSBUaGUgdmFsdWUgdG8gbWF0Y2guXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzcGVjIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlTWF0Y2hlc1Byb3BlcnR5KHBhdGgsIHNyY1ZhbHVlKSB7XG4gIGlmIChpc0tleShwYXRoKSAmJiBpc1N0cmljdENvbXBhcmFibGUoc3JjVmFsdWUpKSB7XG4gICAgcmV0dXJuIG1hdGNoZXNTdHJpY3RDb21wYXJhYmxlKHRvS2V5KHBhdGgpLCBzcmNWYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBvYmpWYWx1ZSA9IGdldChvYmplY3QsIHBhdGgpO1xuICAgIHJldHVybiAob2JqVmFsdWUgPT09IHVuZGVmaW5lZCAmJiBvYmpWYWx1ZSA9PT0gc3JjVmFsdWUpXG4gICAgICA/IGhhc0luKG9iamVjdCwgcGF0aClcbiAgICAgIDogYmFzZUlzRXF1YWwoc3JjVmFsdWUsIG9ialZhbHVlLCB1bmRlZmluZWQsIFVOT1JERVJFRF9DT01QQVJFX0ZMQUcgfCBQQVJUSUFMX0NPTVBBUkVfRkxBRyk7XG4gIH07XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucHJvcGVydHlgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVByb3BlcnR5KGtleSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG4gIH07XG59XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlUHJvcGVydHlgIHdoaWNoIHN1cHBvcnRzIGRlZXAgcGF0aHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVByb3BlcnR5RGVlcChwYXRoKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICByZXR1cm4gYmFzZUdldChvYmplY3QsIHBhdGgpO1xuICB9O1xufVxuXG4vKipcbiAqIENhc3RzIGB2YWx1ZWAgdG8gYSBwYXRoIGFycmF5IGlmIGl0J3Mgbm90IG9uZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgY2FzdCBwcm9wZXJ0eSBwYXRoIGFycmF5LlxuICovXG5mdW5jdGlvbiBjYXN0UGF0aCh2YWx1ZSkge1xuICByZXR1cm4gaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IHN0cmluZ1RvUGF0aCh2YWx1ZSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBfLnRvUGFpcnNgIG9yIGBfLnRvUGFpcnNJbmAgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGtleXNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIGtleXMgb2YgYSBnaXZlbiBvYmplY3QuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBwYWlycyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlVG9QYWlycyhrZXlzRnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIHRhZyA9IGdldFRhZyhvYmplY3QpO1xuICAgIGlmICh0YWcgPT0gbWFwVGFnKSB7XG4gICAgICByZXR1cm4gbWFwVG9BcnJheShvYmplY3QpO1xuICAgIH1cbiAgICBpZiAodGFnID09IHNldFRhZykge1xuICAgICAgcmV0dXJuIHNldFRvUGFpcnMob2JqZWN0KTtcbiAgICB9XG4gICAgcmV0dXJuIGJhc2VUb1BhaXJzKG9iamVjdCwga2V5c0Z1bmMob2JqZWN0KSk7XG4gIH07XG59XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbERlZXBgIGZvciBhcnJheXMgd2l0aCBzdXBwb3J0IGZvclxuICogcGFydGlhbCBkZWVwIGNvbXBhcmlzb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7QXJyYXl9IG90aGVyIFRoZSBvdGhlciBhcnJheSB0byBjb21wYXJlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXF1YWxGdW5jIFRoZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgZXF1aXZhbGVudHMgb2YgdmFsdWVzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY3VzdG9taXplciBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtudW1iZXJ9IGJpdG1hc2sgVGhlIGJpdG1hc2sgb2YgY29tcGFyaXNvbiBmbGFncy4gU2VlIGBiYXNlSXNFcXVhbGBcbiAqICBmb3IgbW9yZSBkZXRhaWxzLlxuICogQHBhcmFtIHtPYmplY3R9IHN0YWNrIFRyYWNrcyB0cmF2ZXJzZWQgYGFycmF5YCBhbmQgYG90aGVyYCBvYmplY3RzLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBhcnJheXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gZXF1YWxBcnJheXMoYXJyYXksIG90aGVyLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKSB7XG4gIHZhciBpc1BhcnRpYWwgPSBiaXRtYXNrICYgUEFSVElBTF9DT01QQVJFX0ZMQUcsXG4gICAgICBhcnJMZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICBvdGhMZW5ndGggPSBvdGhlci5sZW5ndGg7XG5cbiAgaWYgKGFyckxlbmd0aCAhPSBvdGhMZW5ndGggJiYgIShpc1BhcnRpYWwgJiYgb3RoTGVuZ3RoID4gYXJyTGVuZ3RoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBBc3N1bWUgY3ljbGljIHZhbHVlcyBhcmUgZXF1YWwuXG4gIHZhciBzdGFja2VkID0gc3RhY2suZ2V0KGFycmF5KTtcbiAgaWYgKHN0YWNrZWQpIHtcbiAgICByZXR1cm4gc3RhY2tlZCA9PSBvdGhlcjtcbiAgfVxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IHRydWUsXG4gICAgICBzZWVuID0gKGJpdG1hc2sgJiBVTk9SREVSRURfQ09NUEFSRV9GTEFHKSA/IG5ldyBTZXRDYWNoZSA6IHVuZGVmaW5lZDtcblxuICBzdGFjay5zZXQoYXJyYXksIG90aGVyKTtcblxuICAvLyBJZ25vcmUgbm9uLWluZGV4IHByb3BlcnRpZXMuXG4gIHdoaWxlICgrK2luZGV4IDwgYXJyTGVuZ3RoKSB7XG4gICAgdmFyIGFyclZhbHVlID0gYXJyYXlbaW5kZXhdLFxuICAgICAgICBvdGhWYWx1ZSA9IG90aGVyW2luZGV4XTtcblxuICAgIGlmIChjdXN0b21pemVyKSB7XG4gICAgICB2YXIgY29tcGFyZWQgPSBpc1BhcnRpYWxcbiAgICAgICAgPyBjdXN0b21pemVyKG90aFZhbHVlLCBhcnJWYWx1ZSwgaW5kZXgsIG90aGVyLCBhcnJheSwgc3RhY2spXG4gICAgICAgIDogY3VzdG9taXplcihhcnJWYWx1ZSwgb3RoVmFsdWUsIGluZGV4LCBhcnJheSwgb3RoZXIsIHN0YWNrKTtcbiAgICB9XG4gICAgaWYgKGNvbXBhcmVkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChjb21wYXJlZCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgaWYgKHNlZW4pIHtcbiAgICAgIGlmICghYXJyYXlTb21lKG90aGVyLCBmdW5jdGlvbihvdGhWYWx1ZSwgb3RoSW5kZXgpIHtcbiAgICAgICAgICAgIGlmICghc2Vlbi5oYXMob3RoSW5kZXgpICYmXG4gICAgICAgICAgICAgICAgKGFyclZhbHVlID09PSBvdGhWYWx1ZSB8fCBlcXVhbEZ1bmMoYXJyVmFsdWUsIG90aFZhbHVlLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjaykpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzZWVuLmFkZChvdGhJbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkpIHtcbiAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIShcbiAgICAgICAgICBhcnJWYWx1ZSA9PT0gb3RoVmFsdWUgfHxcbiAgICAgICAgICAgIGVxdWFsRnVuYyhhcnJWYWx1ZSwgb3RoVmFsdWUsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKVxuICAgICAgICApKSB7XG4gICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBzdGFja1snZGVsZXRlJ10oYXJyYXkpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUlzRXF1YWxEZWVwYCBmb3IgY29tcGFyaW5nIG9iamVjdHMgb2ZcbiAqIHRoZSBzYW1lIGB0b1N0cmluZ1RhZ2AuXG4gKlxuICogKipOb3RlOioqIFRoaXMgZnVuY3Rpb24gb25seSBzdXBwb3J0cyBjb21wYXJpbmcgdmFsdWVzIHdpdGggdGFncyBvZlxuICogYEJvb2xlYW5gLCBgRGF0ZWAsIGBFcnJvcmAsIGBOdW1iZXJgLCBgUmVnRXhwYCwgb3IgYFN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtPYmplY3R9IG90aGVyIFRoZSBvdGhlciBvYmplY3QgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIGB0b1N0cmluZ1RhZ2Agb2YgdGhlIG9iamVjdHMgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVxdWFsRnVuYyBUaGUgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGVxdWl2YWxlbnRzIG9mIHZhbHVlcy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGN1c3RvbWl6ZXIgVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpc29ucy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBiaXRtYXNrIFRoZSBiaXRtYXNrIG9mIGNvbXBhcmlzb24gZmxhZ3MuIFNlZSBgYmFzZUlzRXF1YWxgXG4gKiAgZm9yIG1vcmUgZGV0YWlscy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzdGFjayBUcmFja3MgdHJhdmVyc2VkIGBvYmplY3RgIGFuZCBgb3RoZXJgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9iamVjdHMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gZXF1YWxCeVRhZyhvYmplY3QsIG90aGVyLCB0YWcsIGVxdWFsRnVuYywgY3VzdG9taXplciwgYml0bWFzaywgc3RhY2spIHtcbiAgc3dpdGNoICh0YWcpIHtcbiAgICBjYXNlIGRhdGFWaWV3VGFnOlxuICAgICAgaWYgKChvYmplY3QuYnl0ZUxlbmd0aCAhPSBvdGhlci5ieXRlTGVuZ3RoKSB8fFxuICAgICAgICAgIChvYmplY3QuYnl0ZU9mZnNldCAhPSBvdGhlci5ieXRlT2Zmc2V0KSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBvYmplY3QgPSBvYmplY3QuYnVmZmVyO1xuICAgICAgb3RoZXIgPSBvdGhlci5idWZmZXI7XG5cbiAgICBjYXNlIGFycmF5QnVmZmVyVGFnOlxuICAgICAgaWYgKChvYmplY3QuYnl0ZUxlbmd0aCAhPSBvdGhlci5ieXRlTGVuZ3RoKSB8fFxuICAgICAgICAgICFlcXVhbEZ1bmMobmV3IFVpbnQ4QXJyYXkob2JqZWN0KSwgbmV3IFVpbnQ4QXJyYXkob3RoZXIpKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIGNhc2UgYm9vbFRhZzpcbiAgICBjYXNlIGRhdGVUYWc6XG4gICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWJlcnMsIGRhdGVzIHRvIG1pbGxpc2Vjb25kcyBhbmRcbiAgICAgIC8vIGJvb2xlYW5zIHRvIGAxYCBvciBgMGAgdHJlYXRpbmcgaW52YWxpZCBkYXRlcyBjb2VyY2VkIHRvIGBOYU5gIGFzXG4gICAgICAvLyBub3QgZXF1YWwuXG4gICAgICByZXR1cm4gK29iamVjdCA9PSArb3RoZXI7XG5cbiAgICBjYXNlIGVycm9yVGFnOlxuICAgICAgcmV0dXJuIG9iamVjdC5uYW1lID09IG90aGVyLm5hbWUgJiYgb2JqZWN0Lm1lc3NhZ2UgPT0gb3RoZXIubWVzc2FnZTtcblxuICAgIGNhc2UgbnVtYmVyVGFnOlxuICAgICAgLy8gVHJlYXQgYE5hTmAgdnMuIGBOYU5gIGFzIGVxdWFsLlxuICAgICAgcmV0dXJuIChvYmplY3QgIT0gK29iamVjdCkgPyBvdGhlciAhPSArb3RoZXIgOiBvYmplY3QgPT0gK290aGVyO1xuXG4gICAgY2FzZSByZWdleHBUYWc6XG4gICAgY2FzZSBzdHJpbmdUYWc6XG4gICAgICAvLyBDb2VyY2UgcmVnZXhlcyB0byBzdHJpbmdzIGFuZCB0cmVhdCBzdHJpbmdzLCBwcmltaXRpdmVzIGFuZCBvYmplY3RzLFxuICAgICAgLy8gYXMgZXF1YWwuIFNlZSBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtcmVnZXhwLnByb3RvdHlwZS50b3N0cmluZ1xuICAgICAgLy8gZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgIHJldHVybiBvYmplY3QgPT0gKG90aGVyICsgJycpO1xuXG4gICAgY2FzZSBtYXBUYWc6XG4gICAgICB2YXIgY29udmVydCA9IG1hcFRvQXJyYXk7XG5cbiAgICBjYXNlIHNldFRhZzpcbiAgICAgIHZhciBpc1BhcnRpYWwgPSBiaXRtYXNrICYgUEFSVElBTF9DT01QQVJFX0ZMQUc7XG4gICAgICBjb252ZXJ0IHx8IChjb252ZXJ0ID0gc2V0VG9BcnJheSk7XG5cbiAgICAgIGlmIChvYmplY3Quc2l6ZSAhPSBvdGhlci5zaXplICYmICFpc1BhcnRpYWwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gQXNzdW1lIGN5Y2xpYyB2YWx1ZXMgYXJlIGVxdWFsLlxuICAgICAgdmFyIHN0YWNrZWQgPSBzdGFjay5nZXQob2JqZWN0KTtcbiAgICAgIGlmIChzdGFja2VkKSB7XG4gICAgICAgIHJldHVybiBzdGFja2VkID09IG90aGVyO1xuICAgICAgfVxuICAgICAgYml0bWFzayB8PSBVTk9SREVSRURfQ09NUEFSRV9GTEFHO1xuICAgICAgc3RhY2suc2V0KG9iamVjdCwgb3RoZXIpO1xuXG4gICAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICAgIHJldHVybiBlcXVhbEFycmF5cyhjb252ZXJ0KG9iamVjdCksIGNvbnZlcnQob3RoZXIpLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKTtcblxuICAgIGNhc2Ugc3ltYm9sVGFnOlxuICAgICAgaWYgKHN5bWJvbFZhbHVlT2YpIHtcbiAgICAgICAgcmV0dXJuIHN5bWJvbFZhbHVlT2YuY2FsbChvYmplY3QpID09IHN5bWJvbFZhbHVlT2YuY2FsbChvdGhlcik7XG4gICAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUlzRXF1YWxEZWVwYCBmb3Igb2JqZWN0cyB3aXRoIHN1cHBvcnQgZm9yXG4gKiBwYXJ0aWFsIGRlZXAgY29tcGFyaXNvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtPYmplY3R9IG90aGVyIFRoZSBvdGhlciBvYmplY3QgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVxdWFsRnVuYyBUaGUgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGVxdWl2YWxlbnRzIG9mIHZhbHVlcy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGN1c3RvbWl6ZXIgVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpc29ucy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBiaXRtYXNrIFRoZSBiaXRtYXNrIG9mIGNvbXBhcmlzb24gZmxhZ3MuIFNlZSBgYmFzZUlzRXF1YWxgXG4gKiAgZm9yIG1vcmUgZGV0YWlscy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzdGFjayBUcmFja3MgdHJhdmVyc2VkIGBvYmplY3RgIGFuZCBgb3RoZXJgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9iamVjdHMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gZXF1YWxPYmplY3RzKG9iamVjdCwgb3RoZXIsIGVxdWFsRnVuYywgY3VzdG9taXplciwgYml0bWFzaywgc3RhY2spIHtcbiAgdmFyIGlzUGFydGlhbCA9IGJpdG1hc2sgJiBQQVJUSUFMX0NPTVBBUkVfRkxBRyxcbiAgICAgIG9ialByb3BzID0ga2V5cyhvYmplY3QpLFxuICAgICAgb2JqTGVuZ3RoID0gb2JqUHJvcHMubGVuZ3RoLFxuICAgICAgb3RoUHJvcHMgPSBrZXlzKG90aGVyKSxcbiAgICAgIG90aExlbmd0aCA9IG90aFByb3BzLmxlbmd0aDtcblxuICBpZiAob2JqTGVuZ3RoICE9IG90aExlbmd0aCAmJiAhaXNQYXJ0aWFsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBpbmRleCA9IG9iakxlbmd0aDtcbiAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICB2YXIga2V5ID0gb2JqUHJvcHNbaW5kZXhdO1xuICAgIGlmICghKGlzUGFydGlhbCA/IGtleSBpbiBvdGhlciA6IGJhc2VIYXMob3RoZXIsIGtleSkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIC8vIEFzc3VtZSBjeWNsaWMgdmFsdWVzIGFyZSBlcXVhbC5cbiAgdmFyIHN0YWNrZWQgPSBzdGFjay5nZXQob2JqZWN0KTtcbiAgaWYgKHN0YWNrZWQpIHtcbiAgICByZXR1cm4gc3RhY2tlZCA9PSBvdGhlcjtcbiAgfVxuICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgc3RhY2suc2V0KG9iamVjdCwgb3RoZXIpO1xuXG4gIHZhciBza2lwQ3RvciA9IGlzUGFydGlhbDtcbiAgd2hpbGUgKCsraW5kZXggPCBvYmpMZW5ndGgpIHtcbiAgICBrZXkgPSBvYmpQcm9wc1tpbmRleF07XG4gICAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV0sXG4gICAgICAgIG90aFZhbHVlID0gb3RoZXJba2V5XTtcblxuICAgIGlmIChjdXN0b21pemVyKSB7XG4gICAgICB2YXIgY29tcGFyZWQgPSBpc1BhcnRpYWxcbiAgICAgICAgPyBjdXN0b21pemVyKG90aFZhbHVlLCBvYmpWYWx1ZSwga2V5LCBvdGhlciwgb2JqZWN0LCBzdGFjaylcbiAgICAgICAgOiBjdXN0b21pemVyKG9ialZhbHVlLCBvdGhWYWx1ZSwga2V5LCBvYmplY3QsIG90aGVyLCBzdGFjayk7XG4gICAgfVxuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuICAgIGlmICghKGNvbXBhcmVkID09PSB1bmRlZmluZWRcbiAgICAgICAgICA/IChvYmpWYWx1ZSA9PT0gb3RoVmFsdWUgfHwgZXF1YWxGdW5jKG9ialZhbHVlLCBvdGhWYWx1ZSwgY3VzdG9taXplciwgYml0bWFzaywgc3RhY2spKVxuICAgICAgICAgIDogY29tcGFyZWRcbiAgICAgICAgKSkge1xuICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgc2tpcEN0b3IgfHwgKHNraXBDdG9yID0ga2V5ID09ICdjb25zdHJ1Y3RvcicpO1xuICB9XG4gIGlmIChyZXN1bHQgJiYgIXNraXBDdG9yKSB7XG4gICAgdmFyIG9iakN0b3IgPSBvYmplY3QuY29uc3RydWN0b3IsXG4gICAgICAgIG90aEN0b3IgPSBvdGhlci5jb25zdHJ1Y3RvcjtcblxuICAgIC8vIE5vbiBgT2JqZWN0YCBvYmplY3QgaW5zdGFuY2VzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWFsLlxuICAgIGlmIChvYmpDdG9yICE9IG90aEN0b3IgJiZcbiAgICAgICAgKCdjb25zdHJ1Y3RvcicgaW4gb2JqZWN0ICYmICdjb25zdHJ1Y3RvcicgaW4gb3RoZXIpICYmXG4gICAgICAgICEodHlwZW9mIG9iakN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBvYmpDdG9yIGluc3RhbmNlb2Ygb2JqQ3RvciAmJlxuICAgICAgICAgIHR5cGVvZiBvdGhDdG9yID09ICdmdW5jdGlvbicgJiYgb3RoQ3RvciBpbnN0YW5jZW9mIG90aEN0b3IpKSB7XG4gICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICB9XG4gIH1cbiAgc3RhY2tbJ2RlbGV0ZSddKG9iamVjdCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgXCJsZW5ndGhcIiBwcm9wZXJ0eSB2YWx1ZSBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGF2b2lkIGFcbiAqIFtKSVQgYnVnXShodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTQyNzkyKSB0aGF0IGFmZmVjdHNcbiAqIFNhZmFyaSBvbiBhdCBsZWFzdCBpT1MgOC4xLTguMyBBUk02NC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIFwibGVuZ3RoXCIgdmFsdWUuXG4gKi9cbnZhciBnZXRMZW5ndGggPSBiYXNlUHJvcGVydHkoJ2xlbmd0aCcpO1xuXG4vKipcbiAqIEdldHMgdGhlIGRhdGEgZm9yIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSByZWZlcmVuY2Uga2V5LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIG1hcCBkYXRhLlxuICovXG5mdW5jdGlvbiBnZXRNYXBEYXRhKG1hcCwga2V5KSB7XG4gIHZhciBkYXRhID0gbWFwLl9fZGF0YV9fO1xuICByZXR1cm4gaXNLZXlhYmxlKGtleSlcbiAgICA/IGRhdGFbdHlwZW9mIGtleSA9PSAnc3RyaW5nJyA/ICdzdHJpbmcnIDogJ2hhc2gnXVxuICAgIDogZGF0YS5tYXA7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgcHJvcGVydHkgbmFtZXMsIHZhbHVlcywgYW5kIGNvbXBhcmUgZmxhZ3Mgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbWF0Y2ggZGF0YSBvZiBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gZ2V0TWF0Y2hEYXRhKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gdG9QYWlycyhvYmplY3QpLFxuICAgICAgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aDtcblxuICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICByZXN1bHRbbGVuZ3RoXVsyXSA9IGlzU3RyaWN0Q29tcGFyYWJsZShyZXN1bHRbbGVuZ3RoXVsxXSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmdW5jdGlvbiBpZiBpdCdzIG5hdGl2ZSwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG4gIHZhciB2YWx1ZSA9IG9iamVjdFtrZXldO1xuICByZXR1cm4gaXNOYXRpdmUodmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYFtbUHJvdG90eXBlXV1gIG9mIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge251bGx8T2JqZWN0fSBSZXR1cm5zIHRoZSBgW1tQcm90b3R5cGVdXWAuXG4gKi9cbmZ1bmN0aW9uIGdldFByb3RvdHlwZSh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlR2V0UHJvdG90eXBlKE9iamVjdCh2YWx1ZSkpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGB0b1N0cmluZ1RhZ2Agb2YgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBnZXRUYWcodmFsdWUpIHtcbiAgcmV0dXJuIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xufVxuXG4vLyBGYWxsYmFjayBmb3IgZGF0YSB2aWV3cywgbWFwcywgc2V0cywgYW5kIHdlYWsgbWFwcyBpbiBJRSAxMSxcbi8vIGZvciBkYXRhIHZpZXdzIGluIEVkZ2UsIGFuZCBwcm9taXNlcyBpbiBOb2RlLmpzLlxuaWYgKChEYXRhVmlldyAmJiBnZXRUYWcobmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcigxKSkpICE9IGRhdGFWaWV3VGFnKSB8fFxuICAgIChNYXAgJiYgZ2V0VGFnKG5ldyBNYXApICE9IG1hcFRhZykgfHxcbiAgICAoUHJvbWlzZSAmJiBnZXRUYWcoUHJvbWlzZS5yZXNvbHZlKCkpICE9IHByb21pc2VUYWcpIHx8XG4gICAgKFNldCAmJiBnZXRUYWcobmV3IFNldCkgIT0gc2V0VGFnKSB8fFxuICAgIChXZWFrTWFwICYmIGdldFRhZyhuZXcgV2Vha01hcCkgIT0gd2Vha01hcFRhZykpIHtcbiAgZ2V0VGFnID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgcmVzdWx0ID0gb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSksXG4gICAgICAgIEN0b3IgPSByZXN1bHQgPT0gb2JqZWN0VGFnID8gdmFsdWUuY29uc3RydWN0b3IgOiB1bmRlZmluZWQsXG4gICAgICAgIGN0b3JTdHJpbmcgPSBDdG9yID8gdG9Tb3VyY2UoQ3RvcikgOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAoY3RvclN0cmluZykge1xuICAgICAgc3dpdGNoIChjdG9yU3RyaW5nKSB7XG4gICAgICAgIGNhc2UgZGF0YVZpZXdDdG9yU3RyaW5nOiByZXR1cm4gZGF0YVZpZXdUYWc7XG4gICAgICAgIGNhc2UgbWFwQ3RvclN0cmluZzogcmV0dXJuIG1hcFRhZztcbiAgICAgICAgY2FzZSBwcm9taXNlQ3RvclN0cmluZzogcmV0dXJuIHByb21pc2VUYWc7XG4gICAgICAgIGNhc2Ugc2V0Q3RvclN0cmluZzogcmV0dXJuIHNldFRhZztcbiAgICAgICAgY2FzZSB3ZWFrTWFwQ3RvclN0cmluZzogcmV0dXJuIHdlYWtNYXBUYWc7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBwYXRoYCBleGlzdHMgb24gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIGNoZWNrLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFzRnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2sgcHJvcGVydGllcy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgcGF0aGAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGhhc1BhdGgob2JqZWN0LCBwYXRoLCBoYXNGdW5jKSB7XG4gIHBhdGggPSBpc0tleShwYXRoLCBvYmplY3QpID8gW3BhdGhdIDogY2FzdFBhdGgocGF0aCk7XG5cbiAgdmFyIHJlc3VsdCxcbiAgICAgIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBwYXRoLmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSB0b0tleShwYXRoW2luZGV4XSk7XG4gICAgaWYgKCEocmVzdWx0ID0gb2JqZWN0ICE9IG51bGwgJiYgaGFzRnVuYyhvYmplY3QsIGtleSkpKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgb2JqZWN0ID0gb2JqZWN0W2tleV07XG4gIH1cbiAgaWYgKHJlc3VsdCkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgdmFyIGxlbmd0aCA9IG9iamVjdCA/IG9iamVjdC5sZW5ndGggOiAwO1xuICByZXR1cm4gISFsZW5ndGggJiYgaXNMZW5ndGgobGVuZ3RoKSAmJiBpc0luZGV4KGtleSwgbGVuZ3RoKSAmJlxuICAgIChpc0FycmF5KG9iamVjdCkgfHwgaXNTdHJpbmcob2JqZWN0KSB8fCBpc0FyZ3VtZW50cyhvYmplY3QpKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIGluZGV4IGtleXMgZm9yIGBvYmplY3RgIHZhbHVlcyBvZiBhcnJheXMsXG4gKiBgYXJndW1lbnRzYCBvYmplY3RzLCBhbmQgc3RyaW5ncywgb3RoZXJ3aXNlIGBudWxsYCBpcyByZXR1cm5lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fG51bGx9IFJldHVybnMgaW5kZXgga2V5cywgZWxzZSBgbnVsbGAuXG4gKi9cbmZ1bmN0aW9uIGluZGV4S2V5cyhvYmplY3QpIHtcbiAgdmFyIGxlbmd0aCA9IG9iamVjdCA/IG9iamVjdC5sZW5ndGggOiB1bmRlZmluZWQ7XG4gIGlmIChpc0xlbmd0aChsZW5ndGgpICYmXG4gICAgICAoaXNBcnJheShvYmplY3QpIHx8IGlzU3RyaW5nKG9iamVjdCkgfHwgaXNBcmd1bWVudHMob2JqZWN0KSkpIHtcbiAgICByZXR1cm4gYmFzZVRpbWVzKGxlbmd0aCwgU3RyaW5nKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgaW5kZXguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBpbmRleCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcbiAgbGVuZ3RoID0gbGVuZ3RoID09IG51bGwgPyBNQVhfU0FGRV9JTlRFR0VSIDogbGVuZ3RoO1xuICByZXR1cm4gISFsZW5ndGggJiZcbiAgICAodHlwZW9mIHZhbHVlID09ICdudW1iZXInIHx8IHJlSXNVaW50LnRlc3QodmFsdWUpKSAmJlxuICAgICh2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDwgbGVuZ3RoKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHByb3BlcnR5IG5hbWUgYW5kIG5vdCBhIHByb3BlcnR5IHBhdGguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkga2V5cyBvbi5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvcGVydHkgbmFtZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0tleSh2YWx1ZSwgb2JqZWN0KSB7XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgaWYgKHR5cGUgPT0gJ251bWJlcicgfHwgdHlwZSA9PSAnc3ltYm9sJyB8fCB0eXBlID09ICdib29sZWFuJyB8fFxuICAgICAgdmFsdWUgPT0gbnVsbCB8fCBpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gcmVJc1BsYWluUHJvcC50ZXN0KHZhbHVlKSB8fCAhcmVJc0RlZXBQcm9wLnRlc3QodmFsdWUpIHx8XG4gICAgKG9iamVjdCAhPSBudWxsICYmIHZhbHVlIGluIE9iamVjdChvYmplY3QpKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSBmb3IgdXNlIGFzIHVuaXF1ZSBvYmplY3Qga2V5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzS2V5YWJsZSh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICh0eXBlID09ICdzdHJpbmcnIHx8IHR5cGUgPT0gJ251bWJlcicgfHwgdHlwZSA9PSAnc3ltYm9sJyB8fCB0eXBlID09ICdib29sZWFuJylcbiAgICA/ICh2YWx1ZSAhPT0gJ19fcHJvdG9fXycpXG4gICAgOiAodmFsdWUgPT09IG51bGwpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhIHByb3RvdHlwZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm90b3R5cGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNQcm90b3R5cGUodmFsdWUpIHtcbiAgdmFyIEN0b3IgPSB2YWx1ZSAmJiB2YWx1ZS5jb25zdHJ1Y3RvcixcbiAgICAgIHByb3RvID0gKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3Rvci5wcm90b3R5cGUpIHx8IG9iamVjdFByb3RvO1xuXG4gIHJldHVybiB2YWx1ZSA9PT0gcHJvdG87XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgc3VpdGFibGUgZm9yIHN0cmljdCBlcXVhbGl0eSBjb21wYXJpc29ucywgaS5lLiBgPT09YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpZiBzdWl0YWJsZSBmb3Igc3RyaWN0XG4gKiAgZXF1YWxpdHkgY29tcGFyaXNvbnMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNTdHJpY3RDb21wYXJhYmxlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gdmFsdWUgJiYgIWlzT2JqZWN0KHZhbHVlKTtcbn1cblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYG1hdGNoZXNQcm9wZXJ0eWAgZm9yIHNvdXJjZSB2YWx1ZXMgc3VpdGFibGVcbiAqIGZvciBzdHJpY3QgZXF1YWxpdHkgY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHBhcmFtIHsqfSBzcmNWYWx1ZSBUaGUgdmFsdWUgdG8gbWF0Y2guXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzcGVjIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBtYXRjaGVzU3RyaWN0Q29tcGFyYWJsZShrZXksIHNyY1ZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdFtrZXldID09PSBzcmNWYWx1ZSAmJlxuICAgICAgKHNyY1ZhbHVlICE9PSB1bmRlZmluZWQgfHwgKGtleSBpbiBPYmplY3Qob2JqZWN0KSkpO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcga2V5IGlmIGl0J3Mgbm90IGEgc3RyaW5nIG9yIHN5bWJvbC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtzdHJpbmd8c3ltYm9sfSBSZXR1cm5zIHRoZSBrZXkuXG4gKi9cbmZ1bmN0aW9uIHRvS2V5KHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHwgaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHZhciByZXN1bHQgPSAodmFsdWUgKyAnJyk7XG4gIHJldHVybiAocmVzdWx0ID09ICcwJyAmJiAoMSAvIHZhbHVlKSA9PSAtSU5GSU5JVFkpID8gJy0wJyA6IHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBgZnVuY2AgdG8gaXRzIHNvdXJjZSBjb2RlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc291cmNlIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIHRvU291cmNlKGZ1bmMpIHtcbiAgaWYgKGZ1bmMgIT0gbnVsbCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnVuY1RvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChmdW5jICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGFcbiAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAndXNlcic6ICdmcmVkJyB9O1xuICogdmFyIG90aGVyID0geyAndXNlcic6ICdmcmVkJyB9O1xuICpcbiAqIF8uZXEob2JqZWN0LCBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEob2JqZWN0LCBvdGhlcik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoJ2EnLCAnYScpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEoJ2EnLCBPYmplY3QoJ2EnKSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoTmFOLCBOYU4pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBlcSh2YWx1ZSwgb3RoZXIpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcik7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGFuIGBhcmd1bWVudHNgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcmd1bWVudHModmFsdWUpIHtcbiAgLy8gU2FmYXJpIDguMSBpbmNvcnJlY3RseSBtYWtlcyBgYXJndW1lbnRzLmNhbGxlZWAgZW51bWVyYWJsZSBpbiBzdHJpY3QgbW9kZS5cbiAgcmV0dXJuIGlzQXJyYXlMaWtlT2JqZWN0KHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAoIXByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwodmFsdWUsICdjYWxsZWUnKSB8fCBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBhcmdzVGFnKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLiBBIHZhbHVlIGlzIGNvbnNpZGVyZWQgYXJyYXktbGlrZSBpZiBpdCdzXG4gKiBub3QgYSBmdW5jdGlvbiBhbmQgaGFzIGEgYHZhbHVlLmxlbmd0aGAgdGhhdCdzIGFuIGludGVnZXIgZ3JlYXRlciB0aGFuIG9yXG4gKiBlcXVhbCB0byBgMGAgYW5kIGxlc3MgdGhhbiBvciBlcXVhbCB0byBgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZSgnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgaXNMZW5ndGgoZ2V0TGVuZ3RoKHZhbHVlKSkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xufVxuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uaXNBcnJheUxpa2VgIGV4Y2VwdCB0aGF0IGl0IGFsc28gY2hlY2tzIGlmIGB2YWx1ZWBcbiAqIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheS1saWtlIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2VPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2VPYmplY3QoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5TGlrZU9iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBpc0FycmF5TGlrZSh2YWx1ZSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBGdW5jdGlvbmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuICAvLyBpbiBTYWZhcmkgOCB3aGljaCByZXR1cm5zICdvYmplY3QnIGZvciB0eXBlZCBhcnJheSBhbmQgd2VhayBtYXAgY29uc3RydWN0b3JzLFxuICAvLyBhbmQgUGhhbnRvbUpTIDEuOSB3aGljaCByZXR1cm5zICdmdW5jdGlvbicgZm9yIGBOb2RlTGlzdGAgaW5zdGFuY2VzLlxuICB2YXIgdGFnID0gaXNPYmplY3QodmFsdWUpID8gb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgOiAnJztcbiAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWc7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBpcyBsb29zZWx5IGJhc2VkIG9uXG4gKiBbYFRvTGVuZ3RoYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtdG9sZW5ndGgpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgbGVuZ3RoLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAhIXZhbHVlICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc05hdGl2ZShBcnJheS5wcm90b3R5cGUucHVzaCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc05hdGl2ZShfKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTmF0aXZlKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXR0ZXJuID0gKGlzRnVuY3Rpb24odmFsdWUpIHx8IGlzSG9zdE9iamVjdCh2YWx1ZSkpID8gcmVJc05hdGl2ZSA6IHJlSXNIb3N0Q3RvcjtcbiAgcmV0dXJuIHBhdHRlcm4udGVzdCh0b1NvdXJjZSh2YWx1ZSkpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3RyaW5nYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N0cmluZygnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N0cmluZygxKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHxcbiAgICAoIWlzQXJyYXkodmFsdWUpICYmIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gc3RyaW5nVGFnKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN5bWJvbGAgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSB0eXBlZCBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KG5ldyBVaW50OEFycmF5KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShbXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1R5cGVkQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiZcbiAgICBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICEhdHlwZWRBcnJheVRhZ3Nbb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSldO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBwYXRoYCBvZiBgb2JqZWN0YC4gSWYgdGhlIHJlc29sdmVkIHZhbHVlIGlzXG4gKiBgdW5kZWZpbmVkYCwgdGhlIGBkZWZhdWx0VmFsdWVgIGlzIHVzZWQgaW4gaXRzIHBsYWNlLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy43LjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcGFyYW0geyp9IFtkZWZhdWx0VmFsdWVdIFRoZSB2YWx1ZSByZXR1cm5lZCBmb3IgYHVuZGVmaW5lZGAgcmVzb2x2ZWQgdmFsdWVzLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc29sdmVkIHZhbHVlLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IFt7ICdiJzogeyAnYyc6IDMgfSB9XSB9O1xuICpcbiAqIF8uZ2V0KG9iamVjdCwgJ2FbMF0uYi5jJyk7XG4gKiAvLyA9PiAzXG4gKlxuICogXy5nZXQob2JqZWN0LCBbJ2EnLCAnMCcsICdiJywgJ2MnXSk7XG4gKiAvLyA9PiAzXG4gKlxuICogXy5nZXQob2JqZWN0LCAnYS5iLmMnLCAnZGVmYXVsdCcpO1xuICogLy8gPT4gJ2RlZmF1bHQnXG4gKi9cbmZ1bmN0aW9uIGdldChvYmplY3QsIHBhdGgsIGRlZmF1bHRWYWx1ZSkge1xuICB2YXIgcmVzdWx0ID0gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBiYXNlR2V0KG9iamVjdCwgcGF0aCk7XG4gIHJldHVybiByZXN1bHQgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRWYWx1ZSA6IHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHBhdGhgIGlzIGEgZGlyZWN0IG9yIGluaGVyaXRlZCBwcm9wZXJ0eSBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgcGF0aGAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSBfLmNyZWF0ZSh7ICdhJzogXy5jcmVhdGUoeyAnYic6IDIgfSkgfSk7XG4gKlxuICogXy5oYXNJbihvYmplY3QsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5oYXNJbihvYmplY3QsICdhLmInKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmhhc0luKG9iamVjdCwgWydhJywgJ2InXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5oYXNJbihvYmplY3QsICdiJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBoYXNJbihvYmplY3QsIHBhdGgpIHtcbiAgcmV0dXJuIG9iamVjdCAhPSBudWxsICYmIGhhc1BhdGgob2JqZWN0LCBwYXRoLCBiYXNlSGFzSW4pO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLiBTZWUgdGhlXG4gKiBbRVMgc3BlY10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5cyhuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqXG4gKiBfLmtleXMoJ2hpJyk7XG4gKiAvLyA9PiBbJzAnLCAnMSddXG4gKi9cbmZ1bmN0aW9uIGtleXMob2JqZWN0KSB7XG4gIHZhciBpc1Byb3RvID0gaXNQcm90b3R5cGUob2JqZWN0KTtcbiAgaWYgKCEoaXNQcm90byB8fCBpc0FycmF5TGlrZShvYmplY3QpKSkge1xuICAgIHJldHVybiBiYXNlS2V5cyhvYmplY3QpO1xuICB9XG4gIHZhciBpbmRleGVzID0gaW5kZXhLZXlzKG9iamVjdCksXG4gICAgICBza2lwSW5kZXhlcyA9ICEhaW5kZXhlcyxcbiAgICAgIHJlc3VsdCA9IGluZGV4ZXMgfHwgW10sXG4gICAgICBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICBpZiAoYmFzZUhhcyhvYmplY3QsIGtleSkgJiZcbiAgICAgICAgIShza2lwSW5kZXhlcyAmJiAoa2V5ID09ICdsZW5ndGgnIHx8IGlzSW5kZXgoa2V5LCBsZW5ndGgpKSkgJiZcbiAgICAgICAgIShpc1Byb3RvICYmIGtleSA9PSAnY29uc3RydWN0b3InKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIG93biBlbnVtZXJhYmxlIHN0cmluZyBrZXllZC12YWx1ZSBwYWlycyBmb3IgYG9iamVjdGBcbiAqIHdoaWNoIGNhbiBiZSBjb25zdW1lZCBieSBgXy5mcm9tUGFpcnNgLiBJZiBgb2JqZWN0YCBpcyBhIG1hcCBvciBzZXQsIGl0c1xuICogZW50cmllcyBhcmUgcmV0dXJuZWQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGFsaWFzIGVudHJpZXNcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUga2V5LXZhbHVlIHBhaXJzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLnRvUGFpcnMobmV3IEZvbyk7XG4gKiAvLyA9PiBbWydhJywgMV0sIFsnYicsIDJdXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG52YXIgdG9QYWlycyA9IGNyZWF0ZVRvUGFpcnMoa2V5cyk7XG5cbi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgZmlyc3QgYXJndW1lbnQgZ2l2ZW4gdG8gaXQuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgQW55IHZhbHVlLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgYHZhbHVlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ3VzZXInOiAnZnJlZCcgfTtcbiAqXG4gKiBfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdDtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHZhbHVlIGF0IGBwYXRoYCBvZiBhIGdpdmVuIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGFjY2Vzc29yIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IFtcbiAqICAgeyAnYSc6IHsgJ2InOiAyIH0gfSxcbiAqICAgeyAnYSc6IHsgJ2InOiAxIH0gfVxuICogXTtcbiAqXG4gKiBfLm1hcChvYmplY3RzLCBfLnByb3BlcnR5KCdhLmInKSk7XG4gKiAvLyA9PiBbMiwgMV1cbiAqXG4gKiBfLm1hcChfLnNvcnRCeShvYmplY3RzLCBfLnByb3BlcnR5KFsnYScsICdiJ10pKSwgJ2EuYicpO1xuICogLy8gPT4gWzEsIDJdXG4gKi9cbmZ1bmN0aW9uIHByb3BlcnR5KHBhdGgpIHtcbiAgcmV0dXJuIGlzS2V5KHBhdGgpID8gYmFzZVByb3BlcnR5KHRvS2V5KHBhdGgpKSA6IGJhc2VQcm9wZXJ0eURlZXAocGF0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUl0ZXJhdGVlO1xuIiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIElORklOSVRZID0gMSAvIDA7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqIFVzZWQgdG8gZGV0ZXJtaW5lIGlmIHZhbHVlcyBhcmUgb2YgdGhlIGxhbmd1YWdlIHR5cGUgYE9iamVjdGAuICovXG52YXIgb2JqZWN0VHlwZXMgPSB7XG4gICdmdW5jdGlvbic6IHRydWUsXG4gICdvYmplY3QnOiB0cnVlXG59O1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gKG9iamVjdFR5cGVzW3R5cGVvZiBleHBvcnRzXSAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlKVxuICA/IGV4cG9ydHNcbiAgOiB1bmRlZmluZWQ7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gKG9iamVjdFR5cGVzW3R5cGVvZiBtb2R1bGVdICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlKVxuICA/IG1vZHVsZVxuICA6IHVuZGVmaW5lZDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gY2hlY2tHbG9iYWwoZnJlZUV4cG9ydHMgJiYgZnJlZU1vZHVsZSAmJiB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSBjaGVja0dsb2JhbChvYmplY3RUeXBlc1t0eXBlb2Ygc2VsZl0gJiYgc2VsZik7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgd2luZG93YC4gKi9cbnZhciBmcmVlV2luZG93ID0gY2hlY2tHbG9iYWwob2JqZWN0VHlwZXNbdHlwZW9mIHdpbmRvd10gJiYgd2luZG93KTtcblxuLyoqIERldGVjdCBgdGhpc2AgYXMgdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgdGhpc0dsb2JhbCA9IGNoZWNrR2xvYmFsKG9iamVjdFR5cGVzW3R5cGVvZiB0aGlzXSAmJiB0aGlzKTtcblxuLyoqXG4gKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LlxuICpcbiAqIFRoZSBgdGhpc2AgdmFsdWUgaXMgdXNlZCBpZiBpdCdzIHRoZSBnbG9iYWwgb2JqZWN0IHRvIGF2b2lkIEdyZWFzZW1vbmtleSdzXG4gKiByZXN0cmljdGVkIGB3aW5kb3dgIG9iamVjdCwgb3RoZXJ3aXNlIHRoZSBgd2luZG93YCBvYmplY3QgaXMgdXNlZC5cbiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8XG4gICgoZnJlZVdpbmRvdyAhPT0gKHRoaXNHbG9iYWwgJiYgdGhpc0dsb2JhbC53aW5kb3cpKSAmJiBmcmVlV2luZG93KSB8fFxuICAgIGZyZWVTZWxmIHx8IHRoaXNHbG9iYWwgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGdsb2JhbCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge251bGx8T2JqZWN0fSBSZXR1cm5zIGB2YWx1ZWAgaWYgaXQncyBhIGdsb2JhbCBvYmplY3QsIGVsc2UgYG51bGxgLlxuICovXG5mdW5jdGlvbiBjaGVja0dsb2JhbCh2YWx1ZSkge1xuICByZXR1cm4gKHZhbHVlICYmIHZhbHVlLk9iamVjdCA9PT0gT2JqZWN0KSA/IHZhbHVlIDogbnVsbDtcbn1cblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG4vKiogVXNlZCB0byBjb252ZXJ0IHN5bWJvbHMgdG8gcHJpbWl0aXZlcyBhbmQgc3RyaW5ncy4gKi9cbnZhciBzeW1ib2xQcm90byA9IFN5bWJvbCA/IFN5bWJvbC5wcm90b3R5cGUgOiB1bmRlZmluZWQsXG4gICAgc3ltYm9sVG9TdHJpbmcgPSBzeW1ib2xQcm90byA/IHN5bWJvbFByb3RvLnRvU3RyaW5nIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRvU3RyaW5nYCB3aGljaCBkb2Vzbid0IGNvbnZlcnQgbnVsbGlzaFxuICogdmFsdWVzIHRvIGVtcHR5IHN0cmluZ3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUb1N0cmluZyh2YWx1ZSkge1xuICAvLyBFeGl0IGVhcmx5IGZvciBzdHJpbmdzIHRvIGF2b2lkIGEgcGVyZm9ybWFuY2UgaGl0IGluIHNvbWUgZW52aXJvbm1lbnRzLlxuICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gc3ltYm9sVG9TdHJpbmcgPyBzeW1ib2xUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xuICB9XG4gIHZhciByZXN1bHQgPSAodmFsdWUgKyAnJyk7XG4gIHJldHVybiAocmVzdWx0ID09ICcwJyAmJiAoMSAvIHZhbHVlKSA9PSAtSU5GSU5JVFkpID8gJy0wJyA6IHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVG9TdHJpbmc7XG4iLCIvKipcbiAqIGxvZGFzaCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cHM6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgPGh0dHBzOi8vanF1ZXJ5Lm9yZy8+XG4gKiBSZWxlYXNlZCB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuOC4zIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKi9cbnZhciBiYXNlVG9TdHJpbmcgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2V0b3N0cmluZycpO1xuXG4vKiogVXNlZCBhcyB0aGUgYFR5cGVFcnJvcmAgbWVzc2FnZSBmb3IgXCJGdW5jdGlvbnNcIiBtZXRob2RzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyoqIFVzZWQgdG8gc3RhbmQtaW4gZm9yIGB1bmRlZmluZWRgIGhhc2ggdmFsdWVzLiAqL1xudmFyIEhBU0hfVU5ERUZJTkVEID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggcHJvcGVydHkgbmFtZXMgd2l0aGluIHByb3BlcnR5IHBhdGhzLiAqL1xudmFyIHJlUHJvcE5hbWUgPSAvW14uW1xcXV0rfFxcWyg/OigtP1xcZCsoPzpcXC5cXGQrKT8pfChbXCInXSkoKD86KD8hXFwyKVteXFxcXF18XFxcXC4pKj8pXFwyKVxcXS9nO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGBcbiAqIFtzeW50YXggY2hhcmFjdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtcGF0dGVybnMpLlxuICovXG52YXIgcmVSZWdFeHBDaGFyID0gL1tcXFxcXiQuKis/KClbXFxde318XS9nO1xuXG4vKiogVXNlZCB0byBtYXRjaCBiYWNrc2xhc2hlcyBpbiBwcm9wZXJ0eSBwYXRocy4gKi9cbnZhciByZUVzY2FwZUNoYXIgPSAvXFxcXChcXFxcKT8vZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGhvc3QgY29uc3RydWN0b3JzIChTYWZhcmkpLiAqL1xudmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cbi8qKiBVc2VkIHRvIGRldGVybWluZSBpZiB2YWx1ZXMgYXJlIG9mIHRoZSBsYW5ndWFnZSB0eXBlIGBPYmplY3RgLiAqL1xudmFyIG9iamVjdFR5cGVzID0ge1xuICAnZnVuY3Rpb24nOiB0cnVlLFxuICAnb2JqZWN0JzogdHJ1ZVxufTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IChvYmplY3RUeXBlc1t0eXBlb2YgZXhwb3J0c10gJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSlcbiAgPyBleHBvcnRzXG4gIDogdW5kZWZpbmVkO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IChvYmplY3RUeXBlc1t0eXBlb2YgbW9kdWxlXSAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSlcbiAgPyBtb2R1bGVcbiAgOiB1bmRlZmluZWQ7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IGNoZWNrR2xvYmFsKGZyZWVFeHBvcnRzICYmIGZyZWVNb2R1bGUgJiYgdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gY2hlY2tHbG9iYWwob2JqZWN0VHlwZXNbdHlwZW9mIHNlbGZdICYmIHNlbGYpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHdpbmRvd2AuICovXG52YXIgZnJlZVdpbmRvdyA9IGNoZWNrR2xvYmFsKG9iamVjdFR5cGVzW3R5cGVvZiB3aW5kb3ddICYmIHdpbmRvdyk7XG5cbi8qKiBEZXRlY3QgYHRoaXNgIGFzIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHRoaXNHbG9iYWwgPSBjaGVja0dsb2JhbChvYmplY3RUeXBlc1t0eXBlb2YgdGhpc10gJiYgdGhpcyk7XG5cbi8qKlxuICogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC5cbiAqXG4gKiBUaGUgYHRoaXNgIHZhbHVlIGlzIHVzZWQgaWYgaXQncyB0aGUgZ2xvYmFsIG9iamVjdCB0byBhdm9pZCBHcmVhc2Vtb25rZXknc1xuICogcmVzdHJpY3RlZCBgd2luZG93YCBvYmplY3QsIG90aGVyd2lzZSB0aGUgYHdpbmRvd2Agb2JqZWN0IGlzIHVzZWQuXG4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fFxuICAoKGZyZWVXaW5kb3cgIT09ICh0aGlzR2xvYmFsICYmIHRoaXNHbG9iYWwud2luZG93KSkgJiYgZnJlZVdpbmRvdykgfHxcbiAgICBmcmVlU2VsZiB8fCB0aGlzR2xvYmFsIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBnbG9iYWwgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtudWxsfE9iamVjdH0gUmV0dXJucyBgdmFsdWVgIGlmIGl0J3MgYSBnbG9iYWwgb2JqZWN0LCBlbHNlIGBudWxsYC5cbiAqL1xuZnVuY3Rpb24gY2hlY2tHbG9iYWwodmFsdWUpIHtcbiAgcmV0dXJuICh2YWx1ZSAmJiB2YWx1ZS5PYmplY3QgPT09IE9iamVjdCkgPyB2YWx1ZSA6IG51bGw7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCBpbiBJRSA8IDkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0hvc3RPYmplY3QodmFsdWUpIHtcbiAgLy8gTWFueSBob3N0IG9iamVjdHMgYXJlIGBPYmplY3RgIG9iamVjdHMgdGhhdCBjYW4gY29lcmNlIHRvIHN0cmluZ3NcbiAgLy8gZGVzcGl0ZSBoYXZpbmcgaW1wcm9wZXJseSBkZWZpbmVkIGB0b1N0cmluZ2AgbWV0aG9kcy5cbiAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICBpZiAodmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUudG9TdHJpbmcgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSAhISh2YWx1ZSArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBhcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUuICovXG52YXIgcmVJc05hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICBmdW5jVG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSkucmVwbGFjZShyZVJlZ0V4cENoYXIsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbik7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHNwbGljZSA9IGFycmF5UHJvdG8uc3BsaWNlO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdNYXAnKSxcbiAgICBuYXRpdmVDcmVhdGUgPSBnZXROYXRpdmUoT2JqZWN0LCAnY3JlYXRlJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGhhc2ggb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBIYXNoKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID8gZW50cmllcy5sZW5ndGggOiAwO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgaGFzaC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKi9cbmZ1bmN0aW9uIGhhc2hDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IG5hdGl2ZUNyZWF0ZSA/IG5hdGl2ZUNyZWF0ZShudWxsKSA6IHt9O1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBoYXNoLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge09iamVjdH0gaGFzaCBUaGUgaGFzaCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzaERlbGV0ZShrZXkpIHtcbiAgcmV0dXJuIHRoaXMuaGFzKGtleSkgJiYgZGVsZXRlIHRoaXMuX19kYXRhX19ba2V5XTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBoYXNoIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGhhc2hHZXQoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgaWYgKG5hdGl2ZUNyZWF0ZSkge1xuICAgIHZhciByZXN1bHQgPSBkYXRhW2tleV07XG4gICAgcmV0dXJuIHJlc3VsdCA9PT0gSEFTSF9VTkRFRklORUQgPyB1bmRlZmluZWQgOiByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KSA/IGRhdGFba2V5XSA6IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYSBoYXNoIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoSGFzKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIHJldHVybiBuYXRpdmVDcmVhdGUgPyBkYXRhW2tleV0gIT09IHVuZGVmaW5lZCA6IGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBoYXNoIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgaGFzaCBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gaGFzaFNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgZGF0YVtrZXldID0gKG5hdGl2ZUNyZWF0ZSAmJiB2YWx1ZSA9PT0gdW5kZWZpbmVkKSA/IEhBU0hfVU5ERUZJTkVEIDogdmFsdWU7XG4gIHJldHVybiB0aGlzO1xufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgSGFzaGAuXG5IYXNoLnByb3RvdHlwZS5jbGVhciA9IGhhc2hDbGVhcjtcbkhhc2gucHJvdG90eXBlWydkZWxldGUnXSA9IGhhc2hEZWxldGU7XG5IYXNoLnByb3RvdHlwZS5nZXQgPSBoYXNoR2V0O1xuSGFzaC5wcm90b3R5cGUuaGFzID0gaGFzaEhhcztcbkhhc2gucHJvdG90eXBlLnNldCA9IGhhc2hTZXQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBsaXN0IGNhY2hlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gTGlzdENhY2hlKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID8gZW50cmllcy5sZW5ndGggOiAwO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBbXTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlRGVsZXRlKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGxhc3RJbmRleCA9IGRhdGEubGVuZ3RoIC0gMTtcbiAgaWYgKGluZGV4ID09IGxhc3RJbmRleCkge1xuICAgIGRhdGEucG9wKCk7XG4gIH0gZWxzZSB7XG4gICAgc3BsaWNlLmNhbGwoZGF0YSwgaW5kZXgsIDEpO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGxpc3QgY2FjaGUgdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVHZXQoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgcmV0dXJuIGluZGV4IDwgMCA/IHVuZGVmaW5lZCA6IGRhdGFbaW5kZXhdWzFdO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBhIGxpc3QgY2FjaGUgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlSGFzKGtleSkge1xuICByZXR1cm4gYXNzb2NJbmRleE9mKHRoaXMuX19kYXRhX18sIGtleSkgPiAtMTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBsaXN0IGNhY2hlIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBsaXN0IGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICBkYXRhLnB1c2goW2tleSwgdmFsdWVdKTtcbiAgfSBlbHNlIHtcbiAgICBkYXRhW2luZGV4XVsxXSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgTGlzdENhY2hlYC5cbkxpc3RDYWNoZS5wcm90b3R5cGUuY2xlYXIgPSBsaXN0Q2FjaGVDbGVhcjtcbkxpc3RDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gbGlzdENhY2hlRGVsZXRlO1xuTGlzdENhY2hlLnByb3RvdHlwZS5nZXQgPSBsaXN0Q2FjaGVHZXQ7XG5MaXN0Q2FjaGUucHJvdG90eXBlLmhhcyA9IGxpc3RDYWNoZUhhcztcbkxpc3RDYWNoZS5wcm90b3R5cGUuc2V0ID0gbGlzdENhY2hlU2V0O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXAgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gTWFwQ2FjaGUoZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPyBlbnRyaWVzLmxlbmd0aCA6IDA7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBtYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IHtcbiAgICAnaGFzaCc6IG5ldyBIYXNoLFxuICAgICdtYXAnOiBuZXcgKE1hcCB8fCBMaXN0Q2FjaGUpLFxuICAgICdzdHJpbmcnOiBuZXcgSGFzaFxuICB9O1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBtYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVEZWxldGUoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSlbJ2RlbGV0ZSddKGtleSk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgbWFwIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUdldChrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KS5nZXQoa2V5KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYSBtYXAgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUhhcyhrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KS5oYXMoa2V5KTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBtYXAgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbWFwIGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZVNldChrZXksIHZhbHVlKSB7XG4gIGdldE1hcERhdGEodGhpcywga2V5KS5zZXQoa2V5LCB2YWx1ZSk7XG4gIHJldHVybiB0aGlzO1xufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgTWFwQ2FjaGVgLlxuTWFwQ2FjaGUucHJvdG90eXBlLmNsZWFyID0gbWFwQ2FjaGVDbGVhcjtcbk1hcENhY2hlLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBtYXBDYWNoZURlbGV0ZTtcbk1hcENhY2hlLnByb3RvdHlwZS5nZXQgPSBtYXBDYWNoZUdldDtcbk1hcENhY2hlLnByb3RvdHlwZS5oYXMgPSBtYXBDYWNoZUhhcztcbk1hcENhY2hlLnByb3RvdHlwZS5zZXQgPSBtYXBDYWNoZVNldDtcblxuLyoqXG4gKiBHZXRzIHRoZSBpbmRleCBhdCB3aGljaCB0aGUgYGtleWAgaXMgZm91bmQgaW4gYGFycmF5YCBvZiBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBzZWFyY2guXG4gKiBAcGFyYW0geyp9IGtleSBUaGUga2V5IHRvIHNlYXJjaCBmb3IuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSwgZWxzZSBgLTFgLlxuICovXG5mdW5jdGlvbiBhc3NvY0luZGV4T2YoYXJyYXksIGtleSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICBpZiAoZXEoYXJyYXlbbGVuZ3RoXVswXSwga2V5KSkge1xuICAgICAgcmV0dXJuIGxlbmd0aDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGRhdGEgZm9yIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSByZWZlcmVuY2Uga2V5LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIG1hcCBkYXRhLlxuICovXG5mdW5jdGlvbiBnZXRNYXBEYXRhKG1hcCwga2V5KSB7XG4gIHZhciBkYXRhID0gbWFwLl9fZGF0YV9fO1xuICByZXR1cm4gaXNLZXlhYmxlKGtleSlcbiAgICA/IGRhdGFbdHlwZW9mIGtleSA9PSAnc3RyaW5nJyA/ICdzdHJpbmcnIDogJ2hhc2gnXVxuICAgIDogZGF0YS5tYXA7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgbmF0aXZlIGZ1bmN0aW9uIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZCB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZnVuY3Rpb24gaWYgaXQncyBuYXRpdmUsIGVsc2UgYHVuZGVmaW5lZGAuXG4gKi9cbmZ1bmN0aW9uIGdldE5hdGl2ZShvYmplY3QsIGtleSkge1xuICB2YXIgdmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgcmV0dXJuIGlzTmF0aXZlKHZhbHVlKSA/IHZhbHVlIDogdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlIGZvciB1c2UgYXMgdW5pcXVlIG9iamVjdCBrZXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgc3VpdGFibGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNLZXlhYmxlKHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gKHR5cGUgPT0gJ3N0cmluZycgfHwgdHlwZSA9PSAnbnVtYmVyJyB8fCB0eXBlID09ICdzeW1ib2wnIHx8IHR5cGUgPT0gJ2Jvb2xlYW4nKVxuICAgID8gKHZhbHVlICE9PSAnX19wcm90b19fJylcbiAgICA6ICh2YWx1ZSA9PT0gbnVsbCk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHN0cmluZ2AgdG8gYSBwcm9wZXJ0eSBwYXRoIGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgcHJvcGVydHkgcGF0aCBhcnJheS5cbiAqL1xudmFyIHN0cmluZ1RvUGF0aCA9IG1lbW9pemUoZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdG9TdHJpbmcoc3RyaW5nKS5yZXBsYWNlKHJlUHJvcE5hbWUsIGZ1bmN0aW9uKG1hdGNoLCBudW1iZXIsIHF1b3RlLCBzdHJpbmcpIHtcbiAgICByZXN1bHQucHVzaChxdW90ZSA/IHN0cmluZy5yZXBsYWNlKHJlRXNjYXBlQ2hhciwgJyQxJykgOiAobnVtYmVyIHx8IG1hdGNoKSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufSk7XG5cbi8qKlxuICogQ29udmVydHMgYGZ1bmNgIHRvIGl0cyBzb3VyY2UgY29kZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHNvdXJjZSBjb2RlLlxuICovXG5mdW5jdGlvbiB0b1NvdXJjZShmdW5jKSB7XG4gIGlmIChmdW5jICE9IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmNUb1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoZnVuYyArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiAnJztcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBtZW1vaXplcyB0aGUgcmVzdWx0IG9mIGBmdW5jYC4gSWYgYHJlc29sdmVyYCBpc1xuICogcHJvdmlkZWQsIGl0IGRldGVybWluZXMgdGhlIGNhY2hlIGtleSBmb3Igc3RvcmluZyB0aGUgcmVzdWx0IGJhc2VkIG9uIHRoZVxuICogYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZSBtZW1vaXplZCBmdW5jdGlvbi4gQnkgZGVmYXVsdCwgdGhlIGZpcnN0IGFyZ3VtZW50XG4gKiBwcm92aWRlZCB0byB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24gaXMgdXNlZCBhcyB0aGUgbWFwIGNhY2hlIGtleS4gVGhlIGBmdW5jYFxuICogaXMgaW52b2tlZCB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24uXG4gKlxuICogKipOb3RlOioqIFRoZSBjYWNoZSBpcyBleHBvc2VkIGFzIHRoZSBgY2FjaGVgIHByb3BlcnR5IG9uIHRoZSBtZW1vaXplZFxuICogZnVuY3Rpb24uIEl0cyBjcmVhdGlvbiBtYXkgYmUgY3VzdG9taXplZCBieSByZXBsYWNpbmcgdGhlIGBfLm1lbW9pemUuQ2FjaGVgXG4gKiBjb25zdHJ1Y3RvciB3aXRoIG9uZSB3aG9zZSBpbnN0YW5jZXMgaW1wbGVtZW50IHRoZVxuICogW2BNYXBgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1wcm9wZXJ0aWVzLW9mLXRoZS1tYXAtcHJvdG90eXBlLW9iamVjdClcbiAqIG1ldGhvZCBpbnRlcmZhY2Ugb2YgYGRlbGV0ZWAsIGBnZXRgLCBgaGFzYCwgYW5kIGBzZXRgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaGF2ZSBpdHMgb3V0cHV0IG1lbW9pemVkLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW3Jlc29sdmVyXSBUaGUgZnVuY3Rpb24gdG8gcmVzb2x2ZSB0aGUgY2FjaGUga2V5LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgbWVtb2l6ZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSwgJ2InOiAyIH07XG4gKiB2YXIgb3RoZXIgPSB7ICdjJzogMywgJ2QnOiA0IH07XG4gKlxuICogdmFyIHZhbHVlcyA9IF8ubWVtb2l6ZShfLnZhbHVlcyk7XG4gKiB2YWx1ZXMob2JqZWN0KTtcbiAqIC8vID0+IFsxLCAyXVxuICpcbiAqIHZhbHVlcyhvdGhlcik7XG4gKiAvLyA9PiBbMywgNF1cbiAqXG4gKiBvYmplY3QuYSA9IDI7XG4gKiB2YWx1ZXMob2JqZWN0KTtcbiAqIC8vID0+IFsxLCAyXVxuICpcbiAqIC8vIE1vZGlmeSB0aGUgcmVzdWx0IGNhY2hlLlxuICogdmFsdWVzLmNhY2hlLnNldChvYmplY3QsIFsnYScsICdiJ10pO1xuICogdmFsdWVzKG9iamVjdCk7XG4gKiAvLyA9PiBbJ2EnLCAnYiddXG4gKlxuICogLy8gUmVwbGFjZSBgXy5tZW1vaXplLkNhY2hlYC5cbiAqIF8ubWVtb2l6ZS5DYWNoZSA9IFdlYWtNYXA7XG4gKi9cbmZ1bmN0aW9uIG1lbW9pemUoZnVuYywgcmVzb2x2ZXIpIHtcbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicgfHwgKHJlc29sdmVyICYmIHR5cGVvZiByZXNvbHZlciAhPSAnZnVuY3Rpb24nKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICB2YXIgbWVtb2l6ZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAga2V5ID0gcmVzb2x2ZXIgPyByZXNvbHZlci5hcHBseSh0aGlzLCBhcmdzKSA6IGFyZ3NbMF0sXG4gICAgICAgIGNhY2hlID0gbWVtb2l6ZWQuY2FjaGU7XG5cbiAgICBpZiAoY2FjaGUuaGFzKGtleSkpIHtcbiAgICAgIHJldHVybiBjYWNoZS5nZXQoa2V5KTtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgbWVtb2l6ZWQuY2FjaGUgPSBjYWNoZS5zZXQoa2V5LCByZXN1bHQpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIG1lbW9pemVkLmNhY2hlID0gbmV3IChtZW1vaXplLkNhY2hlIHx8IE1hcENhY2hlKTtcbiAgcmV0dXJuIG1lbW9pemVkO1xufVxuXG4vLyBBc3NpZ24gY2FjaGUgdG8gYF8ubWVtb2l6ZWAuXG5tZW1vaXplLkNhY2hlID0gTWFwQ2FjaGU7XG5cbi8qKlxuICogUGVyZm9ybXMgYVxuICogW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGNvbXBhcmlzb24gYmV0d2VlbiB0d28gdmFsdWVzIHRvIGRldGVybWluZSBpZiB0aGV5IGFyZSBlcXVpdmFsZW50LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIHsqfSBvdGhlciBUaGUgb3RoZXIgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICd1c2VyJzogJ2ZyZWQnIH07XG4gKiB2YXIgb3RoZXIgPSB7ICd1c2VyJzogJ2ZyZWQnIH07XG4gKlxuICogXy5lcShvYmplY3QsIG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcShvYmplY3QsIG90aGVyKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcSgnYScsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcSgnYScsIE9iamVjdCgnYScpKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcShOYU4sIE5hTik7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGVxKHZhbHVlLCBvdGhlcikge1xuICByZXR1cm4gdmFsdWUgPT09IG90aGVyIHx8ICh2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Z1bmN0aW9uKC9hYmMvKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA4IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5IGFuZCB3ZWFrIG1hcCBjb25zdHJ1Y3RvcnMsXG4gIC8vIGFuZCBQaGFudG9tSlMgMS45IHdoaWNoIHJldHVybnMgJ2Z1bmN0aW9uJyBmb3IgYE5vZGVMaXN0YCBpbnN0YW5jZXMuXG4gIHZhciB0YWcgPSBpc09iamVjdCh2YWx1ZSkgPyBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xuICByZXR1cm4gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAhIXZhbHVlICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTmF0aXZlKEFycmF5LnByb3RvdHlwZS5wdXNoKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTmF0aXZlKF8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOYXRpdmUodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHBhdHRlcm4gPSAoaXNGdW5jdGlvbih2YWx1ZSkgfHwgaXNIb3N0T2JqZWN0KHZhbHVlKSkgPyByZUlzTmF0aXZlIDogcmVJc0hvc3RDdG9yO1xuICByZXR1cm4gcGF0dGVybi50ZXN0KHRvU291cmNlKHZhbHVlKSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZy4gQW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkIGZvciBgbnVsbGBcbiAqIGFuZCBgdW5kZWZpbmVkYCB2YWx1ZXMuIFRoZSBzaWduIG9mIGAtMGAgaXMgcHJlc2VydmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvU3RyaW5nKG51bGwpO1xuICogLy8gPT4gJydcbiAqXG4gKiBfLnRvU3RyaW5nKC0wKTtcbiAqIC8vID0+ICctMCdcbiAqXG4gKiBfLnRvU3RyaW5nKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiAnMSwyLDMnXG4gKi9cbmZ1bmN0aW9uIHRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsID8gJycgOiBiYXNlVG9TdHJpbmcodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0cmluZ1RvUGF0aDtcbiIsIi8qKlxuICogbG9kYXNoIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyA8aHR0cHM6Ly9qcXVlcnkub3JnLz5cbiAqIFJlbGVhc2VkIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwczovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS44LjMgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqL1xudmFyIGtleXNJbiA9IHJlcXVpcmUoJ2xvZGFzaC5rZXlzaW4nKSxcbiAgICByZXN0ID0gcmVxdWlyZSgnbG9kYXNoLnJlc3QnKTtcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuICovXG52YXIgcmVJc1VpbnQgPSAvXig/OjB8WzEtOV1cXGQqKSQvO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBBc3NpZ25zIGB2YWx1ZWAgdG8gYGtleWAgb2YgYG9iamVjdGAgaWYgdGhlIGV4aXN0aW5nIHZhbHVlIGlzIG5vdCBlcXVpdmFsZW50XG4gKiB1c2luZyBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogZm9yIGVxdWFsaXR5IGNvbXBhcmlzb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICB2YXIgb2JqVmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgaWYgKCEoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkgJiYgZXEob2JqVmFsdWUsIHZhbHVlKSkgfHxcbiAgICAgICh2YWx1ZSA9PT0gdW5kZWZpbmVkICYmICEoa2V5IGluIG9iamVjdCkpKSB7XG4gICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnByb3BlcnR5YCB3aXRob3V0IHN1cHBvcnQgZm9yIGRlZXAgcGF0aHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VQcm9wZXJ0eShrZXkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xuICB9O1xufVxuXG4vKipcbiAqIENvcGllcyBwcm9wZXJ0aWVzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb20uXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wcyBUaGUgcHJvcGVydHkgaWRlbnRpZmllcnMgdG8gY29weS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyB0by5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvcGllZCB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5T2JqZWN0KHNvdXJjZSwgcHJvcHMsIG9iamVjdCwgY3VzdG9taXplcikge1xuICBvYmplY3QgfHwgKG9iamVjdCA9IHt9KTtcblxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjdXN0b21pemVyXG4gICAgICA/IGN1c3RvbWl6ZXIob2JqZWN0W2tleV0sIHNvdXJjZVtrZXldLCBrZXksIG9iamVjdCwgc291cmNlKVxuICAgICAgOiBzb3VyY2Vba2V5XTtcblxuICAgIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gbGlrZSBgXy5hc3NpZ25gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBhc3NpZ25lciBUaGUgZnVuY3Rpb24gdG8gYXNzaWduIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGFzc2lnbmVyIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVBc3NpZ25lcihhc3NpZ25lcikge1xuICByZXR1cm4gcmVzdChmdW5jdGlvbihvYmplY3QsIHNvdXJjZXMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gc291cmNlcy5sZW5ndGgsXG4gICAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPiAxID8gc291cmNlc1tsZW5ndGggLSAxXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgZ3VhcmQgPSBsZW5ndGggPiAyID8gc291cmNlc1syXSA6IHVuZGVmaW5lZDtcblxuICAgIGN1c3RvbWl6ZXIgPSAoYXNzaWduZXIubGVuZ3RoID4gMyAmJiB0eXBlb2YgY3VzdG9taXplciA9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAobGVuZ3RoLS0sIGN1c3RvbWl6ZXIpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChndWFyZCAmJiBpc0l0ZXJhdGVlQ2FsbChzb3VyY2VzWzBdLCBzb3VyY2VzWzFdLCBndWFyZCkpIHtcbiAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPCAzID8gdW5kZWZpbmVkIDogY3VzdG9taXplcjtcbiAgICAgIGxlbmd0aCA9IDE7XG4gICAgfVxuICAgIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICB2YXIgc291cmNlID0gc291cmNlc1tpbmRleF07XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGFzc2lnbmVyKG9iamVjdCwgc291cmNlLCBpbmRleCwgY3VzdG9taXplcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH0pO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIFwibGVuZ3RoXCIgcHJvcGVydHkgdmFsdWUgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBhdm9pZCBhXG4gKiBbSklUIGJ1Z10oaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE0Mjc5MikgdGhhdCBhZmZlY3RzXG4gKiBTYWZhcmkgb24gYXQgbGVhc3QgaU9TIDguMS04LjMgQVJNNjQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBcImxlbmd0aFwiIHZhbHVlLlxuICovXG52YXIgZ2V0TGVuZ3RoID0gYmFzZVByb3BlcnR5KCdsZW5ndGgnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgaW5kZXguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBpbmRleCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcbiAgbGVuZ3RoID0gbGVuZ3RoID09IG51bGwgPyBNQVhfU0FGRV9JTlRFR0VSIDogbGVuZ3RoO1xuICByZXR1cm4gISFsZW5ndGggJiZcbiAgICAodHlwZW9mIHZhbHVlID09ICdudW1iZXInIHx8IHJlSXNVaW50LnRlc3QodmFsdWUpKSAmJlxuICAgICh2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDwgbGVuZ3RoKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgdmFsdWUgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGluZGV4IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgaW5kZXggb3Iga2V5IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBvYmplY3QgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBvYmplY3QgYXJndW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJdGVyYXRlZUNhbGwodmFsdWUsIGluZGV4LCBvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0eXBlID0gdHlwZW9mIGluZGV4O1xuICBpZiAodHlwZSA9PSAnbnVtYmVyJ1xuICAgICAgICA/IChpc0FycmF5TGlrZShvYmplY3QpICYmIGlzSW5kZXgoaW5kZXgsIG9iamVjdC5sZW5ndGgpKVxuICAgICAgICA6ICh0eXBlID09ICdzdHJpbmcnICYmIGluZGV4IGluIG9iamVjdClcbiAgICAgICkge1xuICAgIHJldHVybiBlcShvYmplY3RbaW5kZXhdLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGFcbiAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAndXNlcic6ICdmcmVkJyB9O1xuICogdmFyIG90aGVyID0geyAndXNlcic6ICdmcmVkJyB9O1xuICpcbiAqIF8uZXEob2JqZWN0LCBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEob2JqZWN0LCBvdGhlcik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoJ2EnLCAnYScpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEoJ2EnLCBPYmplY3QoJ2EnKSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoTmFOLCBOYU4pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBlcSh2YWx1ZSwgb3RoZXIpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcik7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS4gQSB2YWx1ZSBpcyBjb25zaWRlcmVkIGFycmF5LWxpa2UgaWYgaXQnc1xuICogbm90IGEgZnVuY3Rpb24gYW5kIGhhcyBhIGB2YWx1ZS5sZW5ndGhgIHRoYXQncyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiBvclxuICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKGdldExlbmd0aCh2YWx1ZSkpICYmICFpc0Z1bmN0aW9uKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Z1bmN0aW9uKC9hYmMvKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA4IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5IGFuZCB3ZWFrIG1hcCBjb25zdHJ1Y3RvcnMsXG4gIC8vIGFuZCBQaGFudG9tSlMgMS45IHdoaWNoIHJldHVybnMgJ2Z1bmN0aW9uJyBmb3IgYE5vZGVMaXN0YCBpbnN0YW5jZXMuXG4gIHZhciB0YWcgPSBpc09iamVjdCh2YWx1ZSkgPyBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xuICByZXR1cm4gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgbGVuZ3RoLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIGZ1bmN0aW9uIGlzIGxvb3NlbHkgYmFzZWQgb25cbiAqIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy10b2xlbmd0aCkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTGVuZ3RoKDMpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNMZW5ndGgoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoSW5maW5pdHkpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKCczJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0xlbmd0aCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInICYmXG4gICAgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICEhdmFsdWUgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmFzc2lnbkluYCBleGNlcHQgdGhhdCBpdCBhY2NlcHRzIGBjdXN0b21pemVyYFxuICogd2hpY2ggaXMgaW52b2tlZCB0byBwcm9kdWNlIHRoZSBhc3NpZ25lZCB2YWx1ZXMuIElmIGBjdXN0b21pemVyYCByZXR1cm5zXG4gKiBgdW5kZWZpbmVkYCwgYXNzaWdubWVudCBpcyBoYW5kbGVkIGJ5IHRoZSBtZXRob2QgaW5zdGVhZC4gVGhlIGBjdXN0b21pemVyYFxuICogaXMgaW52b2tlZCB3aXRoIGZpdmUgYXJndW1lbnRzOiAob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXksIG9iamVjdCwgc291cmNlKS5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgbXV0YXRlcyBgb2JqZWN0YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAYWxpYXMgZXh0ZW5kV2l0aFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHsuLi5PYmplY3R9IHNvdXJjZXMgVGhlIHNvdXJjZSBvYmplY3RzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgYXNzaWduZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqIEBzZWUgXy5hc3NpZ25XaXRoXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIGN1c3RvbWl6ZXIob2JqVmFsdWUsIHNyY1ZhbHVlKSB7XG4gKiAgIHJldHVybiBfLmlzVW5kZWZpbmVkKG9ialZhbHVlKSA/IHNyY1ZhbHVlIDogb2JqVmFsdWU7XG4gKiB9XG4gKlxuICogdmFyIGRlZmF1bHRzID0gXy5wYXJ0aWFsUmlnaHQoXy5hc3NpZ25JbldpdGgsIGN1c3RvbWl6ZXIpO1xuICpcbiAqIGRlZmF1bHRzKHsgJ2EnOiAxIH0sIHsgJ2InOiAyIH0sIHsgJ2EnOiAzIH0pO1xuICogLy8gPT4geyAnYSc6IDEsICdiJzogMiB9XG4gKi9cbnZhciBhc3NpZ25JbldpdGggPSBjcmVhdGVBc3NpZ25lcihmdW5jdGlvbihvYmplY3QsIHNvdXJjZSwgc3JjSW5kZXgsIGN1c3RvbWl6ZXIpIHtcbiAgY29weU9iamVjdChzb3VyY2UsIGtleXNJbihzb3VyY2UpLCBvYmplY3QsIGN1c3RvbWl6ZXIpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzaWduSW5XaXRoO1xuIiwiLyoqXG4gKiBsb2Rhc2ggNC4wLjEgKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTYgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuOC4zIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxNiBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwczovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGFzc2lnbkluV2l0aCA9IHJlcXVpcmUoJ2xvZGFzaC5hc3NpZ25pbndpdGgnKSxcbiAgICByZXN0ID0gcmVxdWlyZSgnbG9kYXNoLnJlc3QnKTtcblxuLyoqXG4gKiBBIGZhc3RlciBhbHRlcm5hdGl2ZSB0byBgRnVuY3Rpb24jYXBwbHlgLCB0aGlzIGZ1bmN0aW9uIGludm9rZXMgYGZ1bmNgXG4gKiB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiBgdGhpc0FyZ2AgYW5kIHRoZSBhcmd1bWVudHMgb2YgYGFyZ3NgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBpbnZva2UuXG4gKiBAcGFyYW0geyp9IHRoaXNBcmcgVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBmdW5jYC5cbiAqIEBwYXJhbSB7Li4uKn0gYXJncyBUaGUgYXJndW1lbnRzIHRvIGludm9rZSBgZnVuY2Agd2l0aC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXN1bHQgb2YgYGZ1bmNgLlxuICovXG5mdW5jdGlvbiBhcHBseShmdW5jLCB0aGlzQXJnLCBhcmdzKSB7XG4gIHZhciBsZW5ndGggPSBhcmdzLmxlbmd0aDtcbiAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZyk7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0pO1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG59XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCBieSBgXy5kZWZhdWx0c2AgdG8gY3VzdG9taXplIGl0cyBgXy5hc3NpZ25JbmAgdXNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IG9ialZhbHVlIFRoZSBkZXN0aW5hdGlvbiB2YWx1ZS5cbiAqIEBwYXJhbSB7Kn0gc3JjVmFsdWUgVGhlIHNvdXJjZSB2YWx1ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgcGFyZW50IG9iamVjdCBvZiBgb2JqVmFsdWVgLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYXNzaWduSW5EZWZhdWx0cyhvYmpWYWx1ZSwgc3JjVmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gIGlmIChvYmpWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAoZXEob2JqVmFsdWUsIG9iamVjdFByb3RvW2tleV0pICYmICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkpIHtcbiAgICByZXR1cm4gc3JjVmFsdWU7XG4gIH1cbiAgcmV0dXJuIG9ialZhbHVlO1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGEgW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGNvbXBhcmlzb24gYmV0d2VlbiB0d28gdmFsdWVzIHRvIGRldGVybWluZSBpZiB0aGV5IGFyZSBlcXVpdmFsZW50LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAndXNlcic6ICdmcmVkJyB9O1xuICogdmFyIG90aGVyID0geyAndXNlcic6ICdmcmVkJyB9O1xuICpcbiAqIF8uZXEob2JqZWN0LCBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEob2JqZWN0LCBvdGhlcik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoJ2EnLCAnYScpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEoJ2EnLCBPYmplY3QoJ2EnKSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoTmFOLCBOYU4pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBlcSh2YWx1ZSwgb3RoZXIpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcik7XG59XG5cbi8qKlxuICogQXNzaWducyBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2Ygc291cmNlIG9iamVjdHMgdG8gdGhlXG4gKiBkZXN0aW5hdGlvbiBvYmplY3QgZm9yIGFsbCBkZXN0aW5hdGlvbiBwcm9wZXJ0aWVzIHRoYXQgcmVzb2x2ZSB0byBgdW5kZWZpbmVkYC5cbiAqIFNvdXJjZSBvYmplY3RzIGFyZSBhcHBsaWVkIGZyb20gbGVmdCB0byByaWdodC4gT25jZSBhIHByb3BlcnR5IGlzIHNldCxcbiAqIGFkZGl0aW9uYWwgdmFsdWVzIG9mIHRoZSBzYW1lIHByb3BlcnR5IGFyZSBpZ25vcmVkLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBtdXRhdGVzIGBvYmplY3RgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0gey4uLk9iamVjdH0gW3NvdXJjZXNdIFRoZSBzb3VyY2Ugb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZGVmYXVsdHMoeyAndXNlcic6ICdiYXJuZXknIH0sIHsgJ2FnZSc6IDM2IH0sIHsgJ3VzZXInOiAnZnJlZCcgfSk7XG4gKiAvLyA9PiB7ICd1c2VyJzogJ2Jhcm5leScsICdhZ2UnOiAzNiB9XG4gKi9cbnZhciBkZWZhdWx0cyA9IHJlc3QoZnVuY3Rpb24oYXJncykge1xuICBhcmdzLnB1c2godW5kZWZpbmVkLCBhc3NpZ25JbkRlZmF1bHRzKTtcbiAgcmV0dXJuIGFwcGx5KGFzc2lnbkluV2l0aCwgdW5kZWZpbmVkLCBhcmdzKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG52YXIgYmFzZUZpbHRlciA9IHJlcXVpcmUoJ2xvZGFzaC5fYmFzZWZpbHRlcicpLFxuICAgIGJhc2VJdGVyYXRlZSA9IHJlcXVpcmUoJ2xvZGFzaC5fYmFzZWl0ZXJhdGVlJyk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZpbHRlcmAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gKiBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcHJlZGljYXRlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBmaWx0ZXJlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYXJyYXlGaWx0ZXIoYXJyYXksIHByZWRpY2F0ZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc0luZGV4ID0gMCxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBhcnJheSkpIHtcbiAgICAgIHJlc3VsdFtyZXNJbmRleCsrXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgZWxlbWVudHMgb2YgYGNvbGxlY3Rpb25gLCByZXR1cm5pbmcgYW4gYXJyYXkgb2YgYWxsIGVsZW1lbnRzXG4gKiBgcHJlZGljYXRlYCByZXR1cm5zIHRydXRoeSBmb3IuIFRoZSBwcmVkaWNhdGUgaXMgaW52b2tlZCB3aXRoIHRocmVlXG4gKiBhcmd1bWVudHM6ICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbcHJlZGljYXRlPV8uaWRlbnRpdHldXG4gKiAgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGZpbHRlcmVkIGFycmF5LlxuICogQHNlZSBfLnJlamVjdFxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgdXNlcnMgPSBbXG4gKiAgIHsgJ3VzZXInOiAnYmFybmV5JywgJ2FnZSc6IDM2LCAnYWN0aXZlJzogdHJ1ZSB9LFxuICogICB7ICd1c2VyJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCwgJ2FjdGl2ZSc6IGZhbHNlIH1cbiAqIF07XG4gKlxuICogXy5maWx0ZXIodXNlcnMsIGZ1bmN0aW9uKG8pIHsgcmV0dXJuICFvLmFjdGl2ZTsgfSk7XG4gKiAvLyA9PiBvYmplY3RzIGZvciBbJ2ZyZWQnXVxuICpcbiAqIC8vIFRoZSBgXy5tYXRjaGVzYCBpdGVyYXRlZSBzaG9ydGhhbmQuXG4gKiBfLmZpbHRlcih1c2VycywgeyAnYWdlJzogMzYsICdhY3RpdmUnOiB0cnVlIH0pO1xuICogLy8gPT4gb2JqZWN0cyBmb3IgWydiYXJuZXknXVxuICpcbiAqIC8vIFRoZSBgXy5tYXRjaGVzUHJvcGVydHlgIGl0ZXJhdGVlIHNob3J0aGFuZC5cbiAqIF8uZmlsdGVyKHVzZXJzLCBbJ2FjdGl2ZScsIGZhbHNlXSk7XG4gKiAvLyA9PiBvYmplY3RzIGZvciBbJ2ZyZWQnXVxuICpcbiAqIC8vIFRoZSBgXy5wcm9wZXJ0eWAgaXRlcmF0ZWUgc2hvcnRoYW5kLlxuICogXy5maWx0ZXIodXNlcnMsICdhY3RpdmUnKTtcbiAqIC8vID0+IG9iamVjdHMgZm9yIFsnYmFybmV5J11cbiAqL1xuZnVuY3Rpb24gZmlsdGVyKGNvbGxlY3Rpb24sIHByZWRpY2F0ZSkge1xuICB2YXIgZnVuYyA9IGlzQXJyYXkoY29sbGVjdGlvbikgPyBhcnJheUZpbHRlciA6IGJhc2VGaWx0ZXI7XG4gIHJldHVybiBmdW5jKGNvbGxlY3Rpb24sIGJhc2VJdGVyYXRlZShwcmVkaWNhdGUsIDMpKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxubW9kdWxlLmV4cG9ydHMgPSBmaWx0ZXI7XG4iLCIvKipcbiAqIGxvZGFzaCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cHM6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgPGh0dHBzOi8vanF1ZXJ5Lm9yZy8+XG4gKiBSZWxlYXNlZCB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuOC4zIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKi9cbnZhciBiYXNlRWFjaCA9IHJlcXVpcmUoJ2xvZGFzaC5fYmFzZWVhY2gnKSxcbiAgICBiYXNlSXRlcmF0ZWUgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2VpdGVyYXRlZScpO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5mb3JFYWNoYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3JcbiAqIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGFycmF5RWFjaChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGBjb2xsZWN0aW9uYCBhbmQgaW52b2tlcyBgaXRlcmF0ZWVgIGZvciBlYWNoIGVsZW1lbnQuXG4gKiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czogKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICogSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICpcbiAqICoqTm90ZToqKiBBcyB3aXRoIG90aGVyIFwiQ29sbGVjdGlvbnNcIiBtZXRob2RzLCBvYmplY3RzIHdpdGggYSBcImxlbmd0aFwiXG4gKiBwcm9wZXJ0eSBhcmUgaXRlcmF0ZWQgbGlrZSBhcnJheXMuIFRvIGF2b2lkIHRoaXMgYmVoYXZpb3IgdXNlIGBfLmZvckluYFxuICogb3IgYF8uZm9yT3duYCBmb3Igb2JqZWN0IGl0ZXJhdGlvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAYWxpYXMgZWFjaFxuICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtpdGVyYXRlZT1fLmlkZW50aXR5XSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fE9iamVjdH0gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gKiBAc2VlIF8uZm9yRWFjaFJpZ2h0XG4gKiBAZXhhbXBsZVxuICpcbiAqIF8oWzEsIDJdKS5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gKiAgIGNvbnNvbGUubG9nKHZhbHVlKTtcbiAqIH0pO1xuICogLy8gPT4gTG9ncyBgMWAgdGhlbiBgMmAuXG4gKlxuICogXy5mb3JFYWNoKHsgJ2EnOiAxLCAnYic6IDIgfSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICogICBjb25zb2xlLmxvZyhrZXkpO1xuICogfSk7XG4gKiAvLyA9PiBMb2dzICdhJyB0aGVuICdiJyAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKS5cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICB2YXIgZnVuYyA9IGlzQXJyYXkoY29sbGVjdGlvbikgPyBhcnJheUVhY2ggOiBiYXNlRWFjaDtcbiAgcmV0dXJuIGZ1bmMoY29sbGVjdGlvbiwgYmFzZUl0ZXJhdGVlKGl0ZXJhdGVlLCAzKSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gZm9yRWFjaDtcbiIsIi8qKlxuICogbG9kYXNoIDQuMC4wIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDE2IFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTYgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAdHlwZSBGdW5jdGlvblxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5O1xuIiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXSc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy4gKi9cbnZhciByZUlzVWludCA9IC9eKD86MHxbMS05XVxcZCopJC87XG5cbi8qKiBVc2VkIHRvIGRldGVybWluZSBpZiB2YWx1ZXMgYXJlIG9mIHRoZSBsYW5ndWFnZSB0eXBlIGBPYmplY3RgLiAqL1xudmFyIG9iamVjdFR5cGVzID0ge1xuICAnZnVuY3Rpb24nOiB0cnVlLFxuICAnb2JqZWN0JzogdHJ1ZVxufTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IChvYmplY3RUeXBlc1t0eXBlb2YgZXhwb3J0c10gJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSlcbiAgPyBleHBvcnRzXG4gIDogdW5kZWZpbmVkO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IChvYmplY3RUeXBlc1t0eXBlb2YgbW9kdWxlXSAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSlcbiAgPyBtb2R1bGVcbiAgOiB1bmRlZmluZWQ7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IGNoZWNrR2xvYmFsKGZyZWVFeHBvcnRzICYmIGZyZWVNb2R1bGUgJiYgdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gY2hlY2tHbG9iYWwob2JqZWN0VHlwZXNbdHlwZW9mIHNlbGZdICYmIHNlbGYpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHdpbmRvd2AuICovXG52YXIgZnJlZVdpbmRvdyA9IGNoZWNrR2xvYmFsKG9iamVjdFR5cGVzW3R5cGVvZiB3aW5kb3ddICYmIHdpbmRvdyk7XG5cbi8qKiBEZXRlY3QgYHRoaXNgIGFzIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHRoaXNHbG9iYWwgPSBjaGVja0dsb2JhbChvYmplY3RUeXBlc1t0eXBlb2YgdGhpc10gJiYgdGhpcyk7XG5cbi8qKlxuICogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC5cbiAqXG4gKiBUaGUgYHRoaXNgIHZhbHVlIGlzIHVzZWQgaWYgaXQncyB0aGUgZ2xvYmFsIG9iamVjdCB0byBhdm9pZCBHcmVhc2Vtb25rZXknc1xuICogcmVzdHJpY3RlZCBgd2luZG93YCBvYmplY3QsIG90aGVyd2lzZSB0aGUgYHdpbmRvd2Agb2JqZWN0IGlzIHVzZWQuXG4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fFxuICAoKGZyZWVXaW5kb3cgIT09ICh0aGlzR2xvYmFsICYmIHRoaXNHbG9iYWwud2luZG93KSkgJiYgZnJlZVdpbmRvdykgfHxcbiAgICBmcmVlU2VsZiB8fCB0aGlzR2xvYmFsIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udGltZXNgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kc1xuICogb3IgbWF4IGFycmF5IGxlbmd0aCBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gaW52b2tlIGBpdGVyYXRlZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiByZXN1bHRzLlxuICovXG5mdW5jdGlvbiBiYXNlVGltZXMobiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShuKTtcblxuICB3aGlsZSAoKytpbmRleCA8IG4pIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoaW5kZXgpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBnbG9iYWwgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtudWxsfE9iamVjdH0gUmV0dXJucyBgdmFsdWVgIGlmIGl0J3MgYSBnbG9iYWwgb2JqZWN0LCBlbHNlIGBudWxsYC5cbiAqL1xuZnVuY3Rpb24gY2hlY2tHbG9iYWwodmFsdWUpIHtcbiAgcmV0dXJuICh2YWx1ZSAmJiB2YWx1ZS5PYmplY3QgPT09IE9iamVjdCkgPyB2YWx1ZSA6IG51bGw7XG59XG5cbi8qKlxuICogQ29udmVydHMgYGl0ZXJhdG9yYCB0byBhbiBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IGl0ZXJhdG9yIFRoZSBpdGVyYXRvciB0byBjb252ZXJ0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGl0ZXJhdG9yVG9BcnJheShpdGVyYXRvcikge1xuICB2YXIgZGF0YSxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIHdoaWxlICghKGRhdGEgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmUpIHtcbiAgICByZXN1bHQucHVzaChkYXRhLnZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgUmVmbGVjdCA9IHJvb3QuUmVmbGVjdCxcbiAgICBlbnVtZXJhdGUgPSBSZWZsZWN0ID8gUmVmbGVjdC5lbnVtZXJhdGUgOiB1bmRlZmluZWQsXG4gICAgcHJvcGVydHlJc0VudW1lcmFibGUgPSBvYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzSW5gIHdoaWNoIGRvZXNuJ3Qgc2tpcCB0aGUgY29uc3RydWN0b3JcbiAqIHByb3BlcnR5IG9mIHByb3RvdHlwZXMgb3IgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXNJbihvYmplY3QpIHtcbiAgb2JqZWN0ID0gb2JqZWN0ID09IG51bGwgPyBvYmplY3QgOiBPYmplY3Qob2JqZWN0KTtcblxuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICByZXN1bHQucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIEZhbGxiYWNrIGZvciBJRSA8IDkgd2l0aCBlczYtc2hpbS5cbmlmIChlbnVtZXJhdGUgJiYgIXByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoeyAndmFsdWVPZic6IDEgfSwgJ3ZhbHVlT2YnKSkge1xuICBiYXNlS2V5c0luID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIGl0ZXJhdG9yVG9BcnJheShlbnVtZXJhdGUob2JqZWN0KSk7XG4gIH07XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucHJvcGVydHlgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVByb3BlcnR5KGtleSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG4gIH07XG59XG5cbi8qKlxuICogR2V0cyB0aGUgXCJsZW5ndGhcIiBwcm9wZXJ0eSB2YWx1ZSBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGF2b2lkIGFcbiAqIFtKSVQgYnVnXShodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTQyNzkyKSB0aGF0IGFmZmVjdHNcbiAqIFNhZmFyaSBvbiBhdCBsZWFzdCBpT1MgOC4xLTguMyBBUk02NC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIFwibGVuZ3RoXCIgdmFsdWUuXG4gKi9cbnZhciBnZXRMZW5ndGggPSBiYXNlUHJvcGVydHkoJ2xlbmd0aCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgaW5kZXgga2V5cyBmb3IgYG9iamVjdGAgdmFsdWVzIG9mIGFycmF5cyxcbiAqIGBhcmd1bWVudHNgIG9iamVjdHMsIGFuZCBzdHJpbmdzLCBvdGhlcndpc2UgYG51bGxgIGlzIHJldHVybmVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl8bnVsbH0gUmV0dXJucyBpbmRleCBrZXlzLCBlbHNlIGBudWxsYC5cbiAqL1xuZnVuY3Rpb24gaW5kZXhLZXlzKG9iamVjdCkge1xuICB2YXIgbGVuZ3RoID0gb2JqZWN0ID8gb2JqZWN0Lmxlbmd0aCA6IHVuZGVmaW5lZDtcbiAgaWYgKGlzTGVuZ3RoKGxlbmd0aCkgJiZcbiAgICAgIChpc0FycmF5KG9iamVjdCkgfHwgaXNTdHJpbmcob2JqZWN0KSB8fCBpc0FyZ3VtZW50cyhvYmplY3QpKSkge1xuICAgIHJldHVybiBiYXNlVGltZXMobGVuZ3RoLCBTdHJpbmcpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBpbmRleC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2xlbmd0aD1NQVhfU0FGRV9JTlRFR0VSXSBUaGUgdXBwZXIgYm91bmRzIG9mIGEgdmFsaWQgaW5kZXguXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGluZGV4LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSW5kZXgodmFsdWUsIGxlbmd0aCkge1xuICBsZW5ndGggPSBsZW5ndGggPT0gbnVsbCA/IE1BWF9TQUZFX0lOVEVHRVIgOiBsZW5ndGg7XG4gIHJldHVybiAhIWxlbmd0aCAmJlxuICAgICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgfHwgcmVJc1VpbnQudGVzdCh2YWx1ZSkpICYmXG4gICAgKHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPCBsZW5ndGgpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhIHByb3RvdHlwZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm90b3R5cGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNQcm90b3R5cGUodmFsdWUpIHtcbiAgdmFyIEN0b3IgPSB2YWx1ZSAmJiB2YWx1ZS5jb25zdHJ1Y3RvcixcbiAgICAgIHByb3RvID0gKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3Rvci5wcm90b3R5cGUpIHx8IG9iamVjdFByb3RvO1xuXG4gIHJldHVybiB2YWx1ZSA9PT0gcHJvdG87XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGFuIGBhcmd1bWVudHNgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcmd1bWVudHModmFsdWUpIHtcbiAgLy8gU2FmYXJpIDguMSBpbmNvcnJlY3RseSBtYWtlcyBgYXJndW1lbnRzLmNhbGxlZWAgZW51bWVyYWJsZSBpbiBzdHJpY3QgbW9kZS5cbiAgcmV0dXJuIGlzQXJyYXlMaWtlT2JqZWN0KHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAoIXByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwodmFsdWUsICdjYWxsZWUnKSB8fCBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBhcmdzVGFnKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLiBBIHZhbHVlIGlzIGNvbnNpZGVyZWQgYXJyYXktbGlrZSBpZiBpdCdzXG4gKiBub3QgYSBmdW5jdGlvbiBhbmQgaGFzIGEgYHZhbHVlLmxlbmd0aGAgdGhhdCdzIGFuIGludGVnZXIgZ3JlYXRlciB0aGFuIG9yXG4gKiBlcXVhbCB0byBgMGAgYW5kIGxlc3MgdGhhbiBvciBlcXVhbCB0byBgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZSgnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgaXNMZW5ndGgoZ2V0TGVuZ3RoKHZhbHVlKSkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xufVxuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uaXNBcnJheUxpa2VgIGV4Y2VwdCB0aGF0IGl0IGFsc28gY2hlY2tzIGlmIGB2YWx1ZWBcbiAqIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheS1saWtlIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2VPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2VPYmplY3QoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5TGlrZU9iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBpc0FycmF5TGlrZSh2YWx1ZSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBGdW5jdGlvbmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuICAvLyBpbiBTYWZhcmkgOCB3aGljaCByZXR1cm5zICdvYmplY3QnIGZvciB0eXBlZCBhcnJheSBhbmQgd2VhayBtYXAgY29uc3RydWN0b3JzLFxuICAvLyBhbmQgUGhhbnRvbUpTIDEuOSB3aGljaCByZXR1cm5zICdmdW5jdGlvbicgZm9yIGBOb2RlTGlzdGAgaW5zdGFuY2VzLlxuICB2YXIgdGFnID0gaXNPYmplY3QodmFsdWUpID8gb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgOiAnJztcbiAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWc7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBpcyBsb29zZWx5IGJhc2VkIG9uXG4gKiBbYFRvTGVuZ3RoYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtdG9sZW5ndGgpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgbGVuZ3RoLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAhIXZhbHVlICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3RyaW5nYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N0cmluZygnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N0cmluZygxKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHxcbiAgICAoIWlzQXJyYXkodmFsdWUpICYmIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gc3RyaW5nVGFnKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5c0luKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InLCAnYyddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKi9cbmZ1bmN0aW9uIGtleXNJbihvYmplY3QpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBpc1Byb3RvID0gaXNQcm90b3R5cGUob2JqZWN0KSxcbiAgICAgIHByb3BzID0gYmFzZUtleXNJbihvYmplY3QpLFxuICAgICAgcHJvcHNMZW5ndGggPSBwcm9wcy5sZW5ndGgsXG4gICAgICBpbmRleGVzID0gaW5kZXhLZXlzKG9iamVjdCksXG4gICAgICBza2lwSW5kZXhlcyA9ICEhaW5kZXhlcyxcbiAgICAgIHJlc3VsdCA9IGluZGV4ZXMgfHwgW10sXG4gICAgICBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgcHJvcHNMZW5ndGgpIHtcbiAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuICAgIGlmICghKHNraXBJbmRleGVzICYmIChrZXkgPT0gJ2xlbmd0aCcgfHwgaXNJbmRleChrZXksIGxlbmd0aCkpKSAmJlxuICAgICAgICAhKGtleSA9PSAnY29uc3RydWN0b3InICYmIChpc1Byb3RvIHx8ICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXNJbjtcbiIsIi8qKlxuICogbG9kYXNoIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyA8aHR0cHM6Ly9qcXVlcnkub3JnLz5cbiAqIFJlbGVhc2VkIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwczovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS44LjMgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqL1xudmFyIGJhc2VFYWNoID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlZWFjaCcpLFxuICAgIGJhc2VJdGVyYXRlZSA9IHJlcXVpcmUoJ2xvZGFzaC5fYmFzZWl0ZXJhdGVlJyk7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJztcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8ubWFwYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWVcbiAqIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgbWFwcGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheU1hcChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5tYXBgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IG1hcHBlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYmFzZU1hcChjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IGlzQXJyYXlMaWtlKGNvbGxlY3Rpb24pID8gQXJyYXkoY29sbGVjdGlvbi5sZW5ndGgpIDogW107XG5cbiAgYmFzZUVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGtleSwgY29sbGVjdGlvbikge1xuICAgIHJlc3VsdFsrK2luZGV4XSA9IGl0ZXJhdGVlKHZhbHVlLCBrZXksIGNvbGxlY3Rpb24pO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5wcm9wZXJ0eWAgd2l0aG91dCBzdXBwb3J0IGZvciBkZWVwIHBhdGhzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGFjY2Vzc29yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlUHJvcGVydHkoa2V5KSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbiAgfTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBcImxlbmd0aFwiIHByb3BlcnR5IHZhbHVlIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gYXZvaWQgYVxuICogW0pJVCBidWddKGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xNDI3OTIpIHRoYXQgYWZmZWN0c1xuICogU2FmYXJpIG9uIGF0IGxlYXN0IGlPUyA4LjEtOC4zIEFSTTY0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgXCJsZW5ndGhcIiB2YWx1ZS5cbiAqL1xudmFyIGdldExlbmd0aCA9IGJhc2VQcm9wZXJ0eSgnbGVuZ3RoJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB2YWx1ZXMgYnkgcnVubmluZyBlYWNoIGVsZW1lbnQgaW4gYGNvbGxlY3Rpb25gIHRocnVcbiAqIGBpdGVyYXRlZWAuIFRoZSBpdGVyYXRlZSBpcyBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOlxuICogKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICpcbiAqIE1hbnkgbG9kYXNoIG1ldGhvZHMgYXJlIGd1YXJkZWQgdG8gd29yayBhcyBpdGVyYXRlZXMgZm9yIG1ldGhvZHMgbGlrZVxuICogYF8uZXZlcnlgLCBgXy5maWx0ZXJgLCBgXy5tYXBgLCBgXy5tYXBWYWx1ZXNgLCBgXy5yZWplY3RgLCBhbmQgYF8uc29tZWAuXG4gKlxuICogVGhlIGd1YXJkZWQgbWV0aG9kcyBhcmU6XG4gKiBgYXJ5YCwgYGNodW5rYCwgYGN1cnJ5YCwgYGN1cnJ5UmlnaHRgLCBgZHJvcGAsIGBkcm9wUmlnaHRgLCBgZXZlcnlgLFxuICogYGZpbGxgLCBgaW52ZXJ0YCwgYHBhcnNlSW50YCwgYHJhbmRvbWAsIGByYW5nZWAsIGByYW5nZVJpZ2h0YCwgYHJlcGVhdGAsXG4gKiBgc2FtcGxlU2l6ZWAsIGBzbGljZWAsIGBzb21lYCwgYHNvcnRCeWAsIGBzcGxpdGAsIGB0YWtlYCwgYHRha2VSaWdodGAsXG4gKiBgdGVtcGxhdGVgLCBgdHJpbWAsIGB0cmltRW5kYCwgYHRyaW1TdGFydGAsIGFuZCBgd29yZHNgXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2l0ZXJhdGVlPV8uaWRlbnRpdHldXG4gKiAgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IG1hcHBlZCBhcnJheS5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gc3F1YXJlKG4pIHtcbiAqICAgcmV0dXJuIG4gKiBuO1xuICogfVxuICpcbiAqIF8ubWFwKFs0LCA4XSwgc3F1YXJlKTtcbiAqIC8vID0+IFsxNiwgNjRdXG4gKlxuICogXy5tYXAoeyAnYSc6IDQsICdiJzogOCB9LCBzcXVhcmUpO1xuICogLy8gPT4gWzE2LCA2NF0gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqXG4gKiB2YXIgdXNlcnMgPSBbXG4gKiAgIHsgJ3VzZXInOiAnYmFybmV5JyB9LFxuICogICB7ICd1c2VyJzogJ2ZyZWQnIH1cbiAqIF07XG4gKlxuICogLy8gVGhlIGBfLnByb3BlcnR5YCBpdGVyYXRlZSBzaG9ydGhhbmQuXG4gKiBfLm1hcCh1c2VycywgJ3VzZXInKTtcbiAqIC8vID0+IFsnYmFybmV5JywgJ2ZyZWQnXVxuICovXG5mdW5jdGlvbiBtYXAoY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGZ1bmMgPSBpc0FycmF5KGNvbGxlY3Rpb24pID8gYXJyYXlNYXAgOiBiYXNlTWFwO1xuICByZXR1cm4gZnVuYyhjb2xsZWN0aW9uLCBiYXNlSXRlcmF0ZWUoaXRlcmF0ZWUsIDMpKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLiBBIHZhbHVlIGlzIGNvbnNpZGVyZWQgYXJyYXktbGlrZSBpZiBpdCdzXG4gKiBub3QgYSBmdW5jdGlvbiBhbmQgaGFzIGEgYHZhbHVlLmxlbmd0aGAgdGhhdCdzIGFuIGludGVnZXIgZ3JlYXRlciB0aGFuIG9yXG4gKiBlcXVhbCB0byBgMGAgYW5kIGxlc3MgdGhhbiBvciBlcXVhbCB0byBgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZSgnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgaXNMZW5ndGgoZ2V0TGVuZ3RoKHZhbHVlKSkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gU2FmYXJpIDggd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXkgYW5kIHdlYWsgbWFwIGNvbnN0cnVjdG9ycyxcbiAgLy8gYW5kIFBoYW50b21KUyAxLjkgd2hpY2ggcmV0dXJucyAnZnVuY3Rpb24nIGZvciBgTm9kZUxpc3RgIGluc3RhbmNlcy5cbiAgdmFyIHRhZyA9IGlzT2JqZWN0KHZhbHVlKSA/IG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpIDogJyc7XG4gIHJldHVybiB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gKlxuICogKipOb3RlOioqIFRoaXMgZnVuY3Rpb24gaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0xlbmd0aGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLXRvbGVuZ3RoKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGxlbmd0aCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNMZW5ndGgoMyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0xlbmd0aChOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aChJbmZpbml0eSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoJzMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTGVuZ3RoKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgJiZcbiAgICB2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDw9IE1BWF9TQUZFX0lOVEVHRVI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gISF2YWx1ZSAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcDtcbiIsIi8qKlxuICogbG9kYXNoIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyA8aHR0cHM6Ly9qcXVlcnkub3JnLz5cbiAqIFJlbGVhc2VkIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwczovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS44LjMgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqL1xuXG4vKiogVXNlZCBhcyB0aGUgYFR5cGVFcnJvcmAgbWVzc2FnZSBmb3IgXCJGdW5jdGlvbnNcIiBtZXRob2RzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgSU5GSU5JVFkgPSAxIC8gMCxcbiAgICBNQVhfSU5URUdFUiA9IDEuNzk3NjkzMTM0ODYyMzE1N2UrMzA4LFxuICAgIE5BTiA9IDAgLyAwO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS4gKi9cbnZhciByZVRyaW0gPSAvXlxccyt8XFxzKyQvZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJhZCBzaWduZWQgaGV4YWRlY2ltYWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmFkSGV4ID0gL15bLStdMHhbMC05YS1mXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiaW5hcnkgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmluYXJ5ID0gL14wYlswMV0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb2N0YWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzT2N0YWwgPSAvXjBvWzAtN10rJC9pO1xuXG4vKiogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgd2l0aG91dCBhIGRlcGVuZGVuY3kgb24gYHJvb3RgLiAqL1xudmFyIGZyZWVQYXJzZUludCA9IHBhcnNlSW50O1xuXG4vKipcbiAqIEEgZmFzdGVyIGFsdGVybmF0aXZlIHRvIGBGdW5jdGlvbiNhcHBseWAsIHRoaXMgZnVuY3Rpb24gaW52b2tlcyBgZnVuY2BcbiAqIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIGB0aGlzQXJnYCBhbmQgdGhlIGFyZ3VtZW50cyBvZiBgYXJnc2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGludm9rZS5cbiAqIEBwYXJhbSB7Kn0gdGhpc0FyZyBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuICogQHBhcmFtIHtBcnJheX0gYXJncyBUaGUgYXJndW1lbnRzIHRvIGludm9rZSBgZnVuY2Agd2l0aC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXN1bHQgb2YgYGZ1bmNgLlxuICovXG5mdW5jdGlvbiBhcHBseShmdW5jLCB0aGlzQXJnLCBhcmdzKSB7XG4gIHZhciBsZW5ndGggPSBhcmdzLmxlbmd0aDtcbiAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZyk7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0pO1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG59XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXg7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlXG4gKiBjcmVhdGVkIGZ1bmN0aW9uIGFuZCBhcmd1bWVudHMgZnJvbSBgc3RhcnRgIGFuZCBiZXlvbmQgcHJvdmlkZWQgYXNcbiAqIGFuIGFycmF5LlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBpcyBiYXNlZCBvbiB0aGVcbiAqIFtyZXN0IHBhcmFtZXRlcl0oaHR0cHM6Ly9tZG4uaW8vcmVzdF9wYXJhbWV0ZXJzKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGFwcGx5IGEgcmVzdCBwYXJhbWV0ZXIgdG8uXG4gKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PWZ1bmMubGVuZ3RoLTFdIFRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgcmVzdCBwYXJhbWV0ZXIuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIHNheSA9IF8ucmVzdChmdW5jdGlvbih3aGF0LCBuYW1lcykge1xuICogICByZXR1cm4gd2hhdCArICcgJyArIF8uaW5pdGlhbChuYW1lcykuam9pbignLCAnKSArXG4gKiAgICAgKF8uc2l6ZShuYW1lcykgPiAxID8gJywgJiAnIDogJycpICsgXy5sYXN0KG5hbWVzKTtcbiAqIH0pO1xuICpcbiAqIHNheSgnaGVsbG8nLCAnZnJlZCcsICdiYXJuZXknLCAncGViYmxlcycpO1xuICogLy8gPT4gJ2hlbGxvIGZyZWQsIGJhcm5leSwgJiBwZWJibGVzJ1xuICovXG5mdW5jdGlvbiByZXN0KGZ1bmMsIHN0YXJ0KSB7XG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIHN0YXJ0ID0gbmF0aXZlTWF4KHN0YXJ0ID09PSB1bmRlZmluZWQgPyAoZnVuYy5sZW5ndGggLSAxKSA6IHRvSW50ZWdlcihzdGFydCksIDApO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgIGxlbmd0aCA9IG5hdGl2ZU1heChhcmdzLmxlbmd0aCAtIHN0YXJ0LCAwKSxcbiAgICAgICAgYXJyYXkgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIGFycmF5W2luZGV4XSA9IGFyZ3Nbc3RhcnQgKyBpbmRleF07XG4gICAgfVxuICAgIHN3aXRjaCAoc3RhcnQpIHtcbiAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcnJheSk7XG4gICAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJnc1swXSwgYXJyYXkpO1xuICAgICAgY2FzZSAyOiByZXR1cm4gZnVuYy5jYWxsKHRoaXMsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFycmF5KTtcbiAgICB9XG4gICAgdmFyIG90aGVyQXJncyA9IEFycmF5KHN0YXJ0ICsgMSk7XG4gICAgaW5kZXggPSAtMTtcbiAgICB3aGlsZSAoKytpbmRleCA8IHN0YXJ0KSB7XG4gICAgICBvdGhlckFyZ3NbaW5kZXhdID0gYXJnc1tpbmRleF07XG4gICAgfVxuICAgIG90aGVyQXJnc1tzdGFydF0gPSBhcnJheTtcbiAgICByZXR1cm4gYXBwbHkoZnVuYywgdGhpcywgb3RoZXJBcmdzKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Z1bmN0aW9uKC9hYmMvKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA4IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5IGFuZCB3ZWFrIG1hcCBjb25zdHJ1Y3RvcnMsXG4gIC8vIGFuZCBQaGFudG9tSlMgMS45IHdoaWNoIHJldHVybnMgJ2Z1bmN0aW9uJyBmb3IgYE5vZGVMaXN0YCBpbnN0YW5jZXMuXG4gIHZhciB0YWcgPSBpc09iamVjdCh2YWx1ZSkgPyBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xuICByZXR1cm4gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAhIXZhbHVlICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3ltYm9sJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN5bWJvbFRhZyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIGZpbml0ZSBudW1iZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjEyLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgY29udmVydGVkIG51bWJlci5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b0Zpbml0ZSgzLjIpO1xuICogLy8gPT4gMy4yXG4gKlxuICogXy50b0Zpbml0ZShOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IDVlLTMyNFxuICpcbiAqIF8udG9GaW5pdGUoSW5maW5pdHkpO1xuICogLy8gPT4gMS43OTc2OTMxMzQ4NjIzMTU3ZSszMDhcbiAqXG4gKiBfLnRvRmluaXRlKCczLjInKTtcbiAqIC8vID0+IDMuMlxuICovXG5mdW5jdGlvbiB0b0Zpbml0ZSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAwID8gdmFsdWUgOiAwO1xuICB9XG4gIHZhbHVlID0gdG9OdW1iZXIodmFsdWUpO1xuICBpZiAodmFsdWUgPT09IElORklOSVRZIHx8IHZhbHVlID09PSAtSU5GSU5JVFkpIHtcbiAgICB2YXIgc2lnbiA9ICh2YWx1ZSA8IDAgPyAtMSA6IDEpO1xuICAgIHJldHVybiBzaWduICogTUFYX0lOVEVHRVI7XG4gIH1cbiAgcmV0dXJuIHZhbHVlID09PSB2YWx1ZSA/IHZhbHVlIDogMDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGFuIGludGVnZXIuXG4gKlxuICogKipOb3RlOioqIFRoaXMgZnVuY3Rpb24gaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0ludGVnZXJgXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtdG9pbnRlZ2VyKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBpbnRlZ2VyLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvSW50ZWdlcigzLjIpO1xuICogLy8gPT4gM1xuICpcbiAqIF8udG9JbnRlZ2VyKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gMFxuICpcbiAqIF8udG9JbnRlZ2VyKEluZmluaXR5KTtcbiAqIC8vID0+IDEuNzk3NjkzMTM0ODYyMzE1N2UrMzA4XG4gKlxuICogXy50b0ludGVnZXIoJzMuMicpO1xuICogLy8gPT4gM1xuICovXG5mdW5jdGlvbiB0b0ludGVnZXIodmFsdWUpIHtcbiAgdmFyIHJlc3VsdCA9IHRvRmluaXRlKHZhbHVlKSxcbiAgICAgIHJlbWFpbmRlciA9IHJlc3VsdCAlIDE7XG5cbiAgcmV0dXJuIHJlc3VsdCA9PT0gcmVzdWx0ID8gKHJlbWFpbmRlciA/IHJlc3VsdCAtIHJlbWFpbmRlciA6IHJlc3VsdCkgOiAwO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBudW1iZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBudW1iZXIuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9OdW1iZXIoMy4yKTtcbiAqIC8vID0+IDMuMlxuICpcbiAqIF8udG9OdW1iZXIoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiA1ZS0zMjRcbiAqXG4gKiBfLnRvTnVtYmVyKEluZmluaXR5KTtcbiAqIC8vID0+IEluZmluaXR5XG4gKlxuICogXy50b051bWJlcignMy4yJyk7XG4gKiAvLyA9PiAzLjJcbiAqL1xuZnVuY3Rpb24gdG9OdW1iZXIodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIE5BTjtcbiAgfVxuICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgdmFyIG90aGVyID0gaXNGdW5jdGlvbih2YWx1ZS52YWx1ZU9mKSA/IHZhbHVlLnZhbHVlT2YoKSA6IHZhbHVlO1xuICAgIHZhbHVlID0gaXNPYmplY3Qob3RoZXIpID8gKG90aGVyICsgJycpIDogb3RoZXI7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IHZhbHVlIDogK3ZhbHVlO1xuICB9XG4gIHZhbHVlID0gdmFsdWUucmVwbGFjZShyZVRyaW0sICcnKTtcbiAgdmFyIGlzQmluYXJ5ID0gcmVJc0JpbmFyeS50ZXN0KHZhbHVlKTtcbiAgcmV0dXJuIChpc0JpbmFyeSB8fCByZUlzT2N0YWwudGVzdCh2YWx1ZSkpXG4gICAgPyBmcmVlUGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIGlzQmluYXJ5ID8gMiA6IDgpXG4gICAgOiAocmVJc0JhZEhleC50ZXN0KHZhbHVlKSA/IE5BTiA6ICt2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVzdDtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikge1xuXHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikucmVwbGFjZSgvXlxcW29iamVjdCAoLispXFxdJC8sICckMScpLnRvTG93ZXJDYXNlKCk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBvbmNlXG5cbm9uY2UucHJvdG8gPSBvbmNlKGZ1bmN0aW9uICgpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZ1bmN0aW9uLnByb3RvdHlwZSwgJ29uY2UnLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBvbmNlKHRoaXMpXG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSlcbn0pXG5cbmZ1bmN0aW9uIG9uY2UgKGZuKSB7XG4gIHZhciBjYWxsZWQgPSBmYWxzZVxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGlmIChjYWxsZWQpIHJldHVyblxuICAgIGNhbGxlZCA9IHRydWVcbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnJlcXVpcmUoJ2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbicpO1xuXG5yZXF1aXJlKCdjb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZyb20nKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFBhcmFsbGF4ID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBQYXJhbGxheChzZWxlY3Rvciwgb3B0aW9ucykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQYXJhbGxheCk7XG5cbiAgICB0aGlzLmxhc3RQb3NpdGlvbiA9IC0xO1xuXG4gICAgLy8gRXN0YWJsaXNoIGRlZmF1bHQgc2V0dGluZ3NcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBzcGVlZDogMC4yXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5lbGVtcyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShzZWxlY3RvcikpIHtcbiAgICAgIHRoaXMuZWxlbXMgPSBzZWxlY3RvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbGVtcyA9IFtzZWxlY3Rvcl07XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFBhcmFsbGF4LCBbe1xuICAgIGtleTogJ3VwZGF0ZVBvc2l0aW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlUG9zaXRpb24oKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB0aGlzLmVsZW1zLmZvckVhY2goZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgdmFyIG9mZnNldCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICsgX3RoaXMubGFzdFBvc2l0aW9uO1xuICAgICAgICB2YXIgeVBvc2l0aW9uID0gTWF0aC5yb3VuZCgob2Zmc2V0IC0gX3RoaXMubGFzdFBvc2l0aW9uKSAqIF90aGlzLnNldHRpbmdzLnNwZWVkKTtcblxuICAgICAgICAvLyBBcHBseSB0aGUgeS1heGlzIHRyYW5zZm9ybVxuICAgICAgICBlbGVtLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgwLCAnICsgeVBvc2l0aW9uICogLTEgKyAncHgsIDApJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnYW5pbWF0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFuaW1hdGUoKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgLy8gSWYgdGhlIG9mZnNldCBwb3NpdGlvbiBoYXNuJ3QgY2hhbmdlZCwgc2tpcCB0aGlzIGZyYW1lXG4gICAgICBpZiAodGhpcy5sYXN0UG9zaXRpb24gPT09IHdpbmRvdy5wYWdlWU9mZnNldCkge1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBfdGhpczIuYW5pbWF0ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFNhdmUgdGhlIG5ldyBvZmZzZXQgcG9zaXRpb25cbiAgICAgIHRoaXMubGFzdFBvc2l0aW9uID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuXG4gICAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uKCk7XG5cbiAgICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX3RoaXMyLmFuaW1hdGUoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBQYXJhbGxheDtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gUGFyYWxsYXg7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZih0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59OyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZighaXNPYmplY3QoaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCIvLyBnZXR0aW5nIHRhZyBmcm9tIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsIFRBRyA9IHJlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKVxuICAvLyBFUzMgd3JvbmcgaGVyZVxuICAsIEFSRyA9IGNvZihmdW5jdGlvbigpeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID09ICdBcmd1bWVudHMnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIE8sIFQsIEI7XG4gIHJldHVybiBpdCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiBpdCA9PT0gbnVsbCA/ICdOdWxsJ1xuICAgIC8vIEBAdG9TdHJpbmdUYWcgY2FzZVxuICAgIDogdHlwZW9mIChUID0gKE8gPSBPYmplY3QoaXQpKVtUQUddKSA9PSAnc3RyaW5nJyA/IFRcbiAgICAvLyBidWlsdGluVGFnIGNhc2VcbiAgICA6IEFSRyA/IGNvZihPKVxuICAgIC8vIEVTMyBhcmd1bWVudHMgZmFsbGJhY2tcbiAgICA6IChCID0gY29mKE8pKSA9PSAnT2JqZWN0JyAmJiB0eXBlb2YgTy5jYWxsZWUgPT0gJ2Z1bmN0aW9uJyA/ICdBcmd1bWVudHMnIDogQjtcbn07IiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTsiLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0ge3ZlcnNpb246ICcxLjIuNid9O1xuaWYodHlwZW9mIF9fZSA9PSAnbnVtYmVyJylfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmIiwiLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi8kLmEtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIHRoYXQsIGxlbmd0aCl7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmKHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XG4gIHN3aXRjaChsZW5ndGgpe1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKGEpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07IiwiLy8gNy4yLjEgUmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudClcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZihpdCA9PSB1bmRlZmluZWQpdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59OyIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vJC5mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDc7IH19KS5hICE9IDc7XG59KTsiLCJ2YXIgZ2xvYmFsICAgID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgY29yZSAgICAgID0gcmVxdWlyZSgnLi8kLmNvcmUnKVxuICAsIGhpZGUgICAgICA9IHJlcXVpcmUoJy4vJC5oaWRlJylcbiAgLCByZWRlZmluZSAgPSByZXF1aXJlKCcuLyQucmVkZWZpbmUnKVxuICAsIGN0eCAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG52YXIgJGV4cG9ydCA9IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIHNvdXJjZSl7XG4gIHZhciBJU19GT1JDRUQgPSB0eXBlICYgJGV4cG9ydC5GXG4gICAgLCBJU19HTE9CQUwgPSB0eXBlICYgJGV4cG9ydC5HXG4gICAgLCBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TXG4gICAgLCBJU19QUk9UTyAgPSB0eXBlICYgJGV4cG9ydC5QXG4gICAgLCBJU19CSU5EICAgPSB0eXBlICYgJGV4cG9ydC5CXG4gICAgLCB0YXJnZXQgICAgPSBJU19HTE9CQUwgPyBnbG9iYWwgOiBJU19TVEFUSUMgPyBnbG9iYWxbbmFtZV0gfHwgKGdsb2JhbFtuYW1lXSA9IHt9KSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV1cbiAgICAsIGV4cG9ydHMgICA9IElTX0dMT0JBTCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pXG4gICAgLCBleHBQcm90byAgPSBleHBvcnRzW1BST1RPVFlQRV0gfHwgKGV4cG9ydHNbUFJPVE9UWVBFXSA9IHt9KVxuICAgICwga2V5LCBvd24sIG91dCwgZXhwO1xuICBpZihJU19HTE9CQUwpc291cmNlID0gbmFtZTtcbiAgZm9yKGtleSBpbiBzb3VyY2Upe1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIGtleSBpbiB0YXJnZXQ7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSAob3duID8gdGFyZ2V0IDogc291cmNlKVtrZXldO1xuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgZXhwID0gSVNfQklORCAmJiBvd24gPyBjdHgob3V0LCBnbG9iYWwpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgLy8gZXh0ZW5kIGdsb2JhbFxuICAgIGlmKHRhcmdldCAmJiAhb3duKXJlZGVmaW5lKHRhcmdldCwga2V5LCBvdXQpO1xuICAgIC8vIGV4cG9ydFxuICAgIGlmKGV4cG9ydHNba2V5XSAhPSBvdXQpaGlkZShleHBvcnRzLCBrZXksIGV4cCk7XG4gICAgaWYoSVNfUFJPVE8gJiYgZXhwUHJvdG9ba2V5XSAhPSBvdXQpZXhwUHJvdG9ba2V5XSA9IG91dDtcbiAgfVxufTtcbmdsb2JhbC5jb3JlID0gY29yZTtcbi8vIHR5cGUgYml0bWFwXG4kZXhwb3J0LkYgPSAxOyAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgLy8gZ2xvYmFsXG4kZXhwb3J0LlMgPSA0OyAgLy8gc3RhdGljXG4kZXhwb3J0LlAgPSA4OyAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAvLyBiaW5kXG4kZXhwb3J0LlcgPSAzMjsgLy8gd3JhcFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59OyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGYgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuaWYodHlwZW9mIF9fZyA9PSAnbnVtYmVyJylfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWYiLCJ2YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vJC5wcm9wZXJ0eS1kZXNjJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5kZXNjcmlwdG9ycycpID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgcmV0dXJuICQuc2V0RGVzYyhvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59OyIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi8kLmNvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTsiLCIvLyBjaGVjayBvbiBkZWZhdWx0IEFycmF5IGl0ZXJhdG9yXG52YXIgSXRlcmF0b3JzICA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKVxuICAsIElURVJBVE9SICAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0ICE9PSB1bmRlZmluZWQgJiYgKEl0ZXJhdG9ycy5BcnJheSA9PT0gaXQgfHwgQXJyYXlQcm90b1tJVEVSQVRPUl0gPT09IGl0KTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59OyIsIi8vIGNhbGwgc29tZXRoaW5nIG9uIGl0ZXJhdG9yIHN0ZXAgd2l0aCBzYWZlIGNsb3Npbmcgb24gZXJyb3JcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXRlcmF0b3IsIGZuLCB2YWx1ZSwgZW50cmllcyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGVudHJpZXMgPyBmbihhbk9iamVjdCh2YWx1ZSlbMF0sIHZhbHVlWzFdKSA6IGZuKHZhbHVlKTtcbiAgLy8gNy40LjYgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgY29tcGxldGlvbilcbiAgfSBjYXRjaChlKXtcbiAgICB2YXIgcmV0ID0gaXRlcmF0b3JbJ3JldHVybiddO1xuICAgIGlmKHJldCAhPT0gdW5kZWZpbmVkKWFuT2JqZWN0KHJldC5jYWxsKGl0ZXJhdG9yKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTsiLCJ2YXIgSVRFUkFUT1IgICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgU0FGRV9DTE9TSU5HID0gZmFsc2U7XG5cbnRyeSB7XG4gIHZhciByaXRlciA9IFs3XVtJVEVSQVRPUl0oKTtcbiAgcml0ZXJbJ3JldHVybiddID0gZnVuY3Rpb24oKXsgU0FGRV9DTE9TSU5HID0gdHJ1ZTsgfTtcbiAgQXJyYXkuZnJvbShyaXRlciwgZnVuY3Rpb24oKXsgdGhyb3cgMjsgfSk7XG59IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYywgc2tpcENsb3Npbmcpe1xuICBpZighc2tpcENsb3NpbmcgJiYgIVNBRkVfQ0xPU0lORylyZXR1cm4gZmFsc2U7XG4gIHZhciBzYWZlID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgdmFyIGFyciAgPSBbN11cbiAgICAgICwgaXRlciA9IGFycltJVEVSQVRPUl0oKTtcbiAgICBpdGVyLm5leHQgPSBmdW5jdGlvbigpeyBzYWZlID0gdHJ1ZTsgfTtcbiAgICBhcnJbSVRFUkFUT1JdID0gZnVuY3Rpb24oKXsgcmV0dXJuIGl0ZXI7IH07XG4gICAgZXhlYyhhcnIpO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBzYWZlO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHt9OyIsInZhciAkT2JqZWN0ID0gT2JqZWN0O1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogICAgICRPYmplY3QuY3JlYXRlLFxuICBnZXRQcm90bzogICAkT2JqZWN0LmdldFByb3RvdHlwZU9mLFxuICBpc0VudW06ICAgICB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZSxcbiAgZ2V0RGVzYzogICAgJE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIHNldERlc2M6ICAgICRPYmplY3QuZGVmaW5lUHJvcGVydHksXG4gIHNldERlc2NzOiAgICRPYmplY3QuZGVmaW5lUHJvcGVydGllcyxcbiAgZ2V0S2V5czogICAgJE9iamVjdC5rZXlzLFxuICBnZXROYW1lczogICAkT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMsXG4gIGdldFN5bWJvbHM6ICRPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzLFxuICBlYWNoOiAgICAgICBbXS5mb3JFYWNoXG59OyIsIi8vIDE5LjEuMi4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UsIC4uLilcbnZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgdG9PYmplY3QgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0JylcbiAgLCBJT2JqZWN0ICA9IHJlcXVpcmUoJy4vJC5pb2JqZWN0Jyk7XG5cbi8vIHNob3VsZCB3b3JrIHdpdGggc3ltYm9scyBhbmQgc2hvdWxkIGhhdmUgZGV0ZXJtaW5pc3RpYyBwcm9wZXJ0eSBvcmRlciAoVjggYnVnKVxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLyQuZmFpbHMnKShmdW5jdGlvbigpe1xuICB2YXIgYSA9IE9iamVjdC5hc3NpZ25cbiAgICAsIEEgPSB7fVxuICAgICwgQiA9IHt9XG4gICAgLCBTID0gU3ltYm9sKClcbiAgICAsIEsgPSAnYWJjZGVmZ2hpamtsbW5vcHFyc3QnO1xuICBBW1NdID0gNztcbiAgSy5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbihrKXsgQltrXSA9IGs7IH0pO1xuICByZXR1cm4gYSh7fSwgQSlbU10gIT0gNyB8fCBPYmplY3Qua2V5cyhhKHt9LCBCKSkuam9pbignJykgIT0gSztcbn0pID8gZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlKXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICB2YXIgVCAgICAgPSB0b09iamVjdCh0YXJnZXQpXG4gICAgLCAkJCAgICA9IGFyZ3VtZW50c1xuICAgICwgJCRsZW4gPSAkJC5sZW5ndGhcbiAgICAsIGluZGV4ID0gMVxuICAgICwgZ2V0S2V5cyAgICA9ICQuZ2V0S2V5c1xuICAgICwgZ2V0U3ltYm9scyA9ICQuZ2V0U3ltYm9sc1xuICAgICwgaXNFbnVtICAgICA9ICQuaXNFbnVtO1xuICB3aGlsZSgkJGxlbiA+IGluZGV4KXtcbiAgICB2YXIgUyAgICAgID0gSU9iamVjdCgkJFtpbmRleCsrXSlcbiAgICAgICwga2V5cyAgID0gZ2V0U3ltYm9scyA/IGdldEtleXMoUykuY29uY2F0KGdldFN5bWJvbHMoUykpIDogZ2V0S2V5cyhTKVxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICAgLCBqICAgICAgPSAwXG4gICAgICAsIGtleTtcbiAgICB3aGlsZShsZW5ndGggPiBqKWlmKGlzRW51bS5jYWxsKFMsIGtleSA9IGtleXNbaisrXSkpVFtrZXldID0gU1trZXldO1xuICB9XG4gIHJldHVybiBUO1xufSA6IE9iamVjdC5hc3NpZ247IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihiaXRtYXAsIHZhbHVlKXtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXG4gIH07XG59OyIsIi8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nXG4vLyBmb3IgY29ycmVjdCB3b3JrIHdyYXBwZWQgbWV0aG9kcyAvIGNvbnN0cnVjdG9ycyB3aXRoIG1ldGhvZHMgbGlrZSBMb0Rhc2ggaXNOYXRpdmVcbnZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBoaWRlICAgICAgPSByZXF1aXJlKCcuLyQuaGlkZScpXG4gICwgU1JDICAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpKCdzcmMnKVxuICAsIFRPX1NUUklORyA9ICd0b1N0cmluZydcbiAgLCAkdG9TdHJpbmcgPSBGdW5jdGlvbltUT19TVFJJTkddXG4gICwgVFBMICAgICAgID0gKCcnICsgJHRvU3RyaW5nKS5zcGxpdChUT19TVFJJTkcpO1xuXG5yZXF1aXJlKCcuLyQuY29yZScpLmluc3BlY3RTb3VyY2UgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiAkdG9TdHJpbmcuY2FsbChpdCk7XG59O1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihPLCBrZXksIHZhbCwgc2FmZSl7XG4gIGlmKHR5cGVvZiB2YWwgPT0gJ2Z1bmN0aW9uJyl7XG4gICAgdmFsLmhhc093blByb3BlcnR5KFNSQykgfHwgaGlkZSh2YWwsIFNSQywgT1trZXldID8gJycgKyBPW2tleV0gOiBUUEwuam9pbihTdHJpbmcoa2V5KSkpO1xuICAgIHZhbC5oYXNPd25Qcm9wZXJ0eSgnbmFtZScpIHx8IGhpZGUodmFsLCAnbmFtZScsIGtleSk7XG4gIH1cbiAgaWYoTyA9PT0gZ2xvYmFsKXtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSB7XG4gICAgaWYoIXNhZmUpZGVsZXRlIE9ba2V5XTtcbiAgICBoaWRlKE8sIGtleSwgdmFsKTtcbiAgfVxufSkoRnVuY3Rpb24ucHJvdG90eXBlLCBUT19TVFJJTkcsIGZ1bmN0aW9uIHRvU3RyaW5nKCl7XG4gIHJldHVybiB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nICYmIHRoaXNbU1JDXSB8fCAkdG9TdHJpbmcuY2FsbCh0aGlzKTtcbn0pOyIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJ1xuICAsIHN0b3JlICA9IGdsb2JhbFtTSEFSRURdIHx8IChnbG9iYWxbU0hBUkVEXSA9IHt9KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB7fSk7XG59OyIsIi8vIDcuMS40IFRvSW50ZWdlclxudmFyIGNlaWwgID0gTWF0aC5jZWlsXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufTsiLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuLyQudG8taW50ZWdlcicpXG4gICwgbWluICAgICAgID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07IiwiLy8gNy4xLjEzIFRvT2JqZWN0KGFyZ3VtZW50KVxudmFyIGRlZmluZWQgPSByZXF1aXJlKCcuLyQuZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBPYmplY3QoZGVmaW5lZChpdCkpO1xufTsiLCJ2YXIgaWQgPSAwXG4gICwgcHggPSBNYXRoLnJhbmRvbSgpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gJ1N5bWJvbCgnLmNvbmNhdChrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5LCAnKV8nLCAoKytpZCArIHB4KS50b1N0cmluZygzNikpO1xufTsiLCJ2YXIgc3RvcmUgID0gcmVxdWlyZSgnLi8kLnNoYXJlZCcpKCd3a3MnKVxuICAsIHVpZCAgICA9IHJlcXVpcmUoJy4vJC51aWQnKVxuICAsIFN5bWJvbCA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKS5TeW1ib2w7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBTeW1ib2wgJiYgU3ltYm9sW25hbWVdIHx8IChTeW1ib2wgfHwgdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59OyIsInZhciBjbGFzc29mICAgPSByZXF1aXJlKCcuLyQuY2xhc3NvZicpXG4gICwgSVRFUkFUT1IgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLyQuY29yZScpLmdldEl0ZXJhdG9yTWV0aG9kID0gZnVuY3Rpb24oaXQpe1xuICBpZihpdCAhPSB1bmRlZmluZWQpcmV0dXJuIGl0W0lURVJBVE9SXVxuICAgIHx8IGl0WydAQGl0ZXJhdG9yJ11cbiAgICB8fCBJdGVyYXRvcnNbY2xhc3NvZihpdCldO1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgY3R4ICAgICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCAkZXhwb3J0ICAgICA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKVxuICAsIHRvT2JqZWN0ICAgID0gcmVxdWlyZSgnLi8kLnRvLW9iamVjdCcpXG4gICwgY2FsbCAgICAgICAgPSByZXF1aXJlKCcuLyQuaXRlci1jYWxsJylcbiAgLCBpc0FycmF5SXRlciA9IHJlcXVpcmUoJy4vJC5pcy1hcnJheS1pdGVyJylcbiAgLCB0b0xlbmd0aCAgICA9IHJlcXVpcmUoJy4vJC50by1sZW5ndGgnKVxuICAsIGdldEl0ZXJGbiAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIXJlcXVpcmUoJy4vJC5pdGVyLWRldGVjdCcpKGZ1bmN0aW9uKGl0ZXIpeyBBcnJheS5mcm9tKGl0ZXIpOyB9KSwgJ0FycmF5Jywge1xuICAvLyAyMi4xLjIuMSBBcnJheS5mcm9tKGFycmF5TGlrZSwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gIGZyb206IGZ1bmN0aW9uIGZyb20oYXJyYXlMaWtlLyosIG1hcGZuID0gdW5kZWZpbmVkLCB0aGlzQXJnID0gdW5kZWZpbmVkKi8pe1xuICAgIHZhciBPICAgICAgID0gdG9PYmplY3QoYXJyYXlMaWtlKVxuICAgICAgLCBDICAgICAgID0gdHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyA/IHRoaXMgOiBBcnJheVxuICAgICAgLCAkJCAgICAgID0gYXJndW1lbnRzXG4gICAgICAsICQkbGVuICAgPSAkJC5sZW5ndGhcbiAgICAgICwgbWFwZm4gICA9ICQkbGVuID4gMSA/ICQkWzFdIDogdW5kZWZpbmVkXG4gICAgICAsIG1hcHBpbmcgPSBtYXBmbiAhPT0gdW5kZWZpbmVkXG4gICAgICAsIGluZGV4ICAgPSAwXG4gICAgICAsIGl0ZXJGbiAgPSBnZXRJdGVyRm4oTylcbiAgICAgICwgbGVuZ3RoLCByZXN1bHQsIHN0ZXAsIGl0ZXJhdG9yO1xuICAgIGlmKG1hcHBpbmcpbWFwZm4gPSBjdHgobWFwZm4sICQkbGVuID4gMiA/ICQkWzJdIDogdW5kZWZpbmVkLCAyKTtcbiAgICAvLyBpZiBvYmplY3QgaXNuJ3QgaXRlcmFibGUgb3IgaXQncyBhcnJheSB3aXRoIGRlZmF1bHQgaXRlcmF0b3IgLSB1c2Ugc2ltcGxlIGNhc2VcbiAgICBpZihpdGVyRm4gIT0gdW5kZWZpbmVkICYmICEoQyA9PSBBcnJheSAmJiBpc0FycmF5SXRlcihpdGVyRm4pKSl7XG4gICAgICBmb3IoaXRlcmF0b3IgPSBpdGVyRm4uY2FsbChPKSwgcmVzdWx0ID0gbmV3IEM7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgaW5kZXgrKyl7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gY2FsbChpdGVyYXRvciwgbWFwZm4sIFtzdGVwLnZhbHVlLCBpbmRleF0sIHRydWUpIDogc3RlcC52YWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuICAgICAgZm9yKHJlc3VsdCA9IG5ldyBDKGxlbmd0aCk7IGxlbmd0aCA+IGluZGV4OyBpbmRleCsrKXtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBtYXBmbihPW2luZGV4XSwgaW5kZXgpIDogT1tpbmRleF07XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5sZW5ndGggPSBpbmRleDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KTtcbiIsIi8vIDE5LjEuMy4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UpXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYsICdPYmplY3QnLCB7YXNzaWduOiByZXF1aXJlKCcuLyQub2JqZWN0LWFzc2lnbicpfSk7IiwidmFyIHRyaW0gPSByZXF1aXJlKCd0cmltJylcbiAgLCBmb3JFYWNoID0gcmVxdWlyZSgnZm9yLWVhY2gnKVxuICAsIGlzQXJyYXkgPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGhlYWRlcnMpIHtcbiAgaWYgKCFoZWFkZXJzKVxuICAgIHJldHVybiB7fVxuXG4gIHZhciByZXN1bHQgPSB7fVxuXG4gIGZvckVhY2goXG4gICAgICB0cmltKGhlYWRlcnMpLnNwbGl0KCdcXG4nKVxuICAgICwgZnVuY3Rpb24gKHJvdykge1xuICAgICAgICB2YXIgaW5kZXggPSByb3cuaW5kZXhPZignOicpXG4gICAgICAgICAgLCBrZXkgPSB0cmltKHJvdy5zbGljZSgwLCBpbmRleCkpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAsIHZhbHVlID0gdHJpbShyb3cuc2xpY2UoaW5kZXggKyAxKSlcblxuICAgICAgICBpZiAodHlwZW9mKHJlc3VsdFtrZXldKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlXG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShyZXN1bHRba2V5XSkpIHtcbiAgICAgICAgICByZXN1bHRba2V5XS5wdXNoKHZhbHVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gWyByZXN1bHRba2V5XSwgdmFsdWUgXVxuICAgICAgICB9XG4gICAgICB9XG4gIClcblxuICByZXR1cm4gcmVzdWx0XG59IiwiJ3VzZSBzdHJpY3QnO1xudmFyIG9ialR5cGUgPSByZXF1aXJlKCdvYmotdHlwZScpO1xuXG5mdW5jdGlvbiByZW1vdmUoZWwsIHN0cikge1xuXHRpZiAoZWwuY2xhc3NMaXN0KSB7XG5cdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZShzdHIpO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5zcGxpdCgnICcpLmZpbHRlcihmdW5jdGlvbiAoeCkge1xuXHRcdHJldHVybiB4ICE9PSAnJyAmJiB4ICE9PSBzdHIudHJpbSgpO1xuXHR9KS5qb2luKCcgJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVsLCBzdHIpIHtcblx0aWYgKG9ialR5cGUoZWwpLmluZGV4T2YoJ2VsZW1lbnQnKSA9PT0gLTEgJiYgb2JqVHlwZShlbCkgIT09ICdub2RlbGlzdCcpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBIVE1MIERPTSBlbGVtZW50KHMpIGFzIGZpcnN0IGFyZ3VtZW50Jyk7XG5cdH1cblxuXHRpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIHN0cmluZyBhcyBzZWNvbmQgYXJndW1lbnQnKTtcblx0fVxuXG5cdGlmIChvYmpUeXBlKGVsKS5pbmRleE9mKCdlbGVtZW50JykgIT09IC0xKSB7XG5cdFx0cmVtb3ZlKGVsLCBzdHIpO1xuXHR9XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbC5sZW5ndGg7IGkrKykge1xuXHRcdHJlbW92ZShlbFtpXSwgc3RyKTtcblx0fVxufTtcbiIsIlxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdHJpbTtcblxuZnVuY3Rpb24gdHJpbShzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqfFxccyokL2csICcnKTtcbn1cblxuZXhwb3J0cy5sZWZ0ID0gZnVuY3Rpb24oc3RyKXtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKTtcbn07XG5cbmV4cG9ydHMucmlnaHQgPSBmdW5jdGlvbihzdHIpe1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xccyokLywgJycpO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIHdpbmRvdyA9IHJlcXVpcmUoXCJnbG9iYWwvd2luZG93XCIpXG52YXIgb25jZSA9IHJlcXVpcmUoXCJvbmNlXCIpXG52YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoXCJpcy1mdW5jdGlvblwiKVxudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoXCJwYXJzZS1oZWFkZXJzXCIpXG52YXIgeHRlbmQgPSByZXF1aXJlKFwieHRlbmRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVYSFJcbmNyZWF0ZVhIUi5YTUxIdHRwUmVxdWVzdCA9IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCB8fCBub29wXG5jcmVhdGVYSFIuWERvbWFpblJlcXVlc3QgPSBcIndpdGhDcmVkZW50aWFsc1wiIGluIChuZXcgY3JlYXRlWEhSLlhNTEh0dHBSZXF1ZXN0KCkpID8gY3JlYXRlWEhSLlhNTEh0dHBSZXF1ZXN0IDogd2luZG93LlhEb21haW5SZXF1ZXN0XG5cbmZvckVhY2hBcnJheShbXCJnZXRcIiwgXCJwdXRcIiwgXCJwb3N0XCIsIFwicGF0Y2hcIiwgXCJoZWFkXCIsIFwiZGVsZXRlXCJdLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICBjcmVhdGVYSFJbbWV0aG9kID09PSBcImRlbGV0ZVwiID8gXCJkZWxcIiA6IG1ldGhvZF0gPSBmdW5jdGlvbih1cmksIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIG9wdGlvbnMgPSBpbml0UGFyYW1zKHVyaSwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgICAgIG9wdGlvbnMubWV0aG9kID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIF9jcmVhdGVYSFIob3B0aW9ucylcbiAgICB9XG59KVxuXG5mdW5jdGlvbiBmb3JFYWNoQXJyYXkoYXJyYXksIGl0ZXJhdG9yKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRvcihhcnJheVtpXSlcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzRW1wdHkob2JqKXtcbiAgICBmb3IodmFyIGkgaW4gb2JqKXtcbiAgICAgICAgaWYob2JqLmhhc093blByb3BlcnR5KGkpKSByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gaW5pdFBhcmFtcyh1cmksIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHBhcmFtcyA9IHVyaVxuXG4gICAgaWYgKGlzRnVuY3Rpb24ob3B0aW9ucykpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zXG4gICAgICAgIGlmICh0eXBlb2YgdXJpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBwYXJhbXMgPSB7dXJpOnVyaX1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmFtcyA9IHh0ZW5kKG9wdGlvbnMsIHt1cmk6IHVyaX0pXG4gICAgfVxuXG4gICAgcGFyYW1zLmNhbGxiYWNrID0gY2FsbGJhY2tcbiAgICByZXR1cm4gcGFyYW1zXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVhIUih1cmksIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgb3B0aW9ucyA9IGluaXRQYXJhbXModXJpLCBvcHRpb25zLCBjYWxsYmFjaylcbiAgICByZXR1cm4gX2NyZWF0ZVhIUihvcHRpb25zKVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlWEhSKG9wdGlvbnMpIHtcbiAgICB2YXIgY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrXG4gICAgaWYodHlwZW9mIGNhbGxiYWNrID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2FsbGJhY2sgYXJndW1lbnQgbWlzc2luZ1wiKVxuICAgIH1cbiAgICBjYWxsYmFjayA9IG9uY2UoY2FsbGJhY2spXG5cbiAgICBmdW5jdGlvbiByZWFkeXN0YXRlY2hhbmdlKCkge1xuICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIGxvYWRGdW5jKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJvZHkoKSB7XG4gICAgICAgIC8vIENocm9tZSB3aXRoIHJlcXVlc3RUeXBlPWJsb2IgdGhyb3dzIGVycm9ycyBhcnJvdW5kIHdoZW4gZXZlbiB0ZXN0aW5nIGFjY2VzcyB0byByZXNwb25zZVRleHRcbiAgICAgICAgdmFyIGJvZHkgPSB1bmRlZmluZWRcblxuICAgICAgICBpZiAoeGhyLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICBib2R5ID0geGhyLnJlc3BvbnNlXG4gICAgICAgIH0gZWxzZSBpZiAoeGhyLnJlc3BvbnNlVHlwZSA9PT0gXCJ0ZXh0XCIgfHwgIXhoci5yZXNwb25zZVR5cGUpIHtcbiAgICAgICAgICAgIGJvZHkgPSB4aHIucmVzcG9uc2VUZXh0IHx8IHhoci5yZXNwb25zZVhNTFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzSnNvbikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBib2R5ID0gSlNPTi5wYXJzZShib2R5KVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBib2R5XG4gICAgfVxuXG4gICAgdmFyIGZhaWx1cmVSZXNwb25zZSA9IHtcbiAgICAgICAgICAgICAgICBib2R5OiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge30sXG4gICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMCxcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgICAgICB1cmw6IHVyaSxcbiAgICAgICAgICAgICAgICByYXdSZXF1ZXN0OiB4aHJcbiAgICAgICAgICAgIH1cblxuICAgIGZ1bmN0aW9uIGVycm9yRnVuYyhldnQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRUaW1lcilcbiAgICAgICAgaWYoIShldnQgaW5zdGFuY2VvZiBFcnJvcikpe1xuICAgICAgICAgICAgZXZ0ID0gbmV3IEVycm9yKFwiXCIgKyAoZXZ0IHx8IFwiVW5rbm93biBYTUxIdHRwUmVxdWVzdCBFcnJvclwiKSApXG4gICAgICAgIH1cbiAgICAgICAgZXZ0LnN0YXR1c0NvZGUgPSAwXG4gICAgICAgIGNhbGxiYWNrKGV2dCwgZmFpbHVyZVJlc3BvbnNlKVxuICAgIH1cblxuICAgIC8vIHdpbGwgbG9hZCB0aGUgZGF0YSAmIHByb2Nlc3MgdGhlIHJlc3BvbnNlIGluIGEgc3BlY2lhbCByZXNwb25zZSBvYmplY3RcbiAgICBmdW5jdGlvbiBsb2FkRnVuYygpIHtcbiAgICAgICAgaWYgKGFib3J0ZWQpIHJldHVyblxuICAgICAgICB2YXIgc3RhdHVzXG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0VGltZXIpXG4gICAgICAgIGlmKG9wdGlvbnMudXNlWERSICYmIHhoci5zdGF0dXM9PT11bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vSUU4IENPUlMgR0VUIHN1Y2Nlc3NmdWwgcmVzcG9uc2UgZG9lc24ndCBoYXZlIGEgc3RhdHVzIGZpZWxkLCBidXQgYm9keSBpcyBmaW5lXG4gICAgICAgICAgICBzdGF0dXMgPSAyMDBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXR1cyA9ICh4aHIuc3RhdHVzID09PSAxMjIzID8gMjA0IDogeGhyLnN0YXR1cylcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzcG9uc2UgPSBmYWlsdXJlUmVzcG9uc2VcbiAgICAgICAgdmFyIGVyciA9IG51bGxcblxuICAgICAgICBpZiAoc3RhdHVzICE9PSAwKXtcbiAgICAgICAgICAgIHJlc3BvbnNlID0ge1xuICAgICAgICAgICAgICAgIGJvZHk6IGdldEJvZHkoKSxcbiAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiBzdGF0dXMsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge30sXG4gICAgICAgICAgICAgICAgdXJsOiB1cmksXG4gICAgICAgICAgICAgICAgcmF3UmVxdWVzdDogeGhyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZih4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKXsgLy9yZW1lbWJlciB4aHIgY2FuIGluIGZhY3QgYmUgWERSIGZvciBDT1JTIGluIElFXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuaGVhZGVycyA9IHBhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnIgPSBuZXcgRXJyb3IoXCJJbnRlcm5hbCBYTUxIdHRwUmVxdWVzdCBFcnJvclwiKVxuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKGVyciwgcmVzcG9uc2UsIHJlc3BvbnNlLmJvZHkpXG5cbiAgICB9XG5cbiAgICB2YXIgeGhyID0gb3B0aW9ucy54aHIgfHwgbnVsbFxuXG4gICAgaWYgKCF4aHIpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuY29ycyB8fCBvcHRpb25zLnVzZVhEUikge1xuICAgICAgICAgICAgeGhyID0gbmV3IGNyZWF0ZVhIUi5YRG9tYWluUmVxdWVzdCgpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgeGhyID0gbmV3IGNyZWF0ZVhIUi5YTUxIdHRwUmVxdWVzdCgpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIga2V5XG4gICAgdmFyIGFib3J0ZWRcbiAgICB2YXIgdXJpID0geGhyLnVybCA9IG9wdGlvbnMudXJpIHx8IG9wdGlvbnMudXJsXG4gICAgdmFyIG1ldGhvZCA9IHhoci5tZXRob2QgPSBvcHRpb25zLm1ldGhvZCB8fCBcIkdFVFwiXG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHkgfHwgb3B0aW9ucy5kYXRhIHx8IG51bGxcbiAgICB2YXIgaGVhZGVycyA9IHhoci5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIHx8IHt9XG4gICAgdmFyIHN5bmMgPSAhIW9wdGlvbnMuc3luY1xuICAgIHZhciBpc0pzb24gPSBmYWxzZVxuICAgIHZhciB0aW1lb3V0VGltZXJcblxuICAgIGlmIChcImpzb25cIiBpbiBvcHRpb25zKSB7XG4gICAgICAgIGlzSnNvbiA9IHRydWVcbiAgICAgICAgaGVhZGVyc1tcImFjY2VwdFwiXSB8fCBoZWFkZXJzW1wiQWNjZXB0XCJdIHx8IChoZWFkZXJzW1wiQWNjZXB0XCJdID0gXCJhcHBsaWNhdGlvbi9qc29uXCIpIC8vRG9uJ3Qgb3ZlcnJpZGUgZXhpc3RpbmcgYWNjZXB0IGhlYWRlciBkZWNsYXJlZCBieSB1c2VyXG4gICAgICAgIGlmIChtZXRob2QgIT09IFwiR0VUXCIgJiYgbWV0aG9kICE9PSBcIkhFQURcIikge1xuICAgICAgICAgICAgaGVhZGVyc1tcImNvbnRlbnQtdHlwZVwiXSB8fCBoZWFkZXJzW1wiQ29udGVudC1UeXBlXCJdIHx8IChoZWFkZXJzW1wiQ29udGVudC1UeXBlXCJdID0gXCJhcHBsaWNhdGlvbi9qc29uXCIpIC8vRG9uJ3Qgb3ZlcnJpZGUgZXhpc3RpbmcgYWNjZXB0IGhlYWRlciBkZWNsYXJlZCBieSB1c2VyXG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5qc29uKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IHJlYWR5c3RhdGVjaGFuZ2VcbiAgICB4aHIub25sb2FkID0gbG9hZEZ1bmNcbiAgICB4aHIub25lcnJvciA9IGVycm9yRnVuY1xuICAgIC8vIElFOSBtdXN0IGhhdmUgb25wcm9ncmVzcyBiZSBzZXQgdG8gYSB1bmlxdWUgZnVuY3Rpb24uXG4gICAgeGhyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIElFIG11c3QgZGllXG4gICAgfVxuICAgIHhoci5vbnRpbWVvdXQgPSBlcnJvckZ1bmNcbiAgICB4aHIub3BlbihtZXRob2QsIHVyaSwgIXN5bmMsIG9wdGlvbnMudXNlcm5hbWUsIG9wdGlvbnMucGFzc3dvcmQpXG4gICAgLy9oYXMgdG8gYmUgYWZ0ZXIgb3BlblxuICAgIGlmKCFzeW5jKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSAhIW9wdGlvbnMud2l0aENyZWRlbnRpYWxzXG4gICAgfVxuICAgIC8vIENhbm5vdCBzZXQgdGltZW91dCB3aXRoIHN5bmMgcmVxdWVzdFxuICAgIC8vIG5vdCBzZXR0aW5nIHRpbWVvdXQgb24gdGhlIHhociBvYmplY3QsIGJlY2F1c2Ugb2Ygb2xkIHdlYmtpdHMgZXRjLiBub3QgaGFuZGxpbmcgdGhhdCBjb3JyZWN0bHlcbiAgICAvLyBib3RoIG5wbSdzIHJlcXVlc3QgYW5kIGpxdWVyeSAxLnggdXNlIHRoaXMga2luZCBvZiB0aW1lb3V0LCBzbyB0aGlzIGlzIGJlaW5nIGNvbnNpc3RlbnRcbiAgICBpZiAoIXN5bmMgJiYgb3B0aW9ucy50aW1lb3V0ID4gMCApIHtcbiAgICAgICAgdGltZW91dFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgYWJvcnRlZD10cnVlLy9JRTkgbWF5IHN0aWxsIGNhbGwgcmVhZHlzdGF0ZWNoYW5nZVxuICAgICAgICAgICAgeGhyLmFib3J0KFwidGltZW91dFwiKVxuICAgICAgICAgICAgdmFyIGUgPSBuZXcgRXJyb3IoXCJYTUxIdHRwUmVxdWVzdCB0aW1lb3V0XCIpXG4gICAgICAgICAgICBlLmNvZGUgPSBcIkVUSU1FRE9VVFwiXG4gICAgICAgICAgICBlcnJvckZ1bmMoZSlcbiAgICAgICAgfSwgb3B0aW9ucy50aW1lb3V0IClcbiAgICB9XG5cbiAgICBpZiAoeGhyLnNldFJlcXVlc3RIZWFkZXIpIHtcbiAgICAgICAgZm9yKGtleSBpbiBoZWFkZXJzKXtcbiAgICAgICAgICAgIGlmKGhlYWRlcnMuaGFzT3duUHJvcGVydHkoa2V5KSl7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoa2V5LCBoZWFkZXJzW2tleV0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuaGVhZGVycyAmJiAhaXNFbXB0eShvcHRpb25zLmhlYWRlcnMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkhlYWRlcnMgY2Fubm90IGJlIHNldCBvbiBhbiBYRG9tYWluUmVxdWVzdCBvYmplY3RcIilcbiAgICB9XG5cbiAgICBpZiAoXCJyZXNwb25zZVR5cGVcIiBpbiBvcHRpb25zKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSBvcHRpb25zLnJlc3BvbnNlVHlwZVxuICAgIH1cblxuICAgIGlmIChcImJlZm9yZVNlbmRcIiBpbiBvcHRpb25zICYmXG4gICAgICAgIHR5cGVvZiBvcHRpb25zLmJlZm9yZVNlbmQgPT09IFwiZnVuY3Rpb25cIlxuICAgICkge1xuICAgICAgICBvcHRpb25zLmJlZm9yZVNlbmQoeGhyKVxuICAgIH1cblxuICAgIHhoci5zZW5kKGJvZHkpXG5cbiAgICByZXR1cm4geGhyXG5cblxufVxuXG5mdW5jdGlvbiBub29wKCkge31cbiIsIm1vZHVsZS5leHBvcnRzID0gZXh0ZW5kXG5cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbmZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgICB2YXIgdGFyZ2V0ID0ge31cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV1cblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0XG59XG4iXX0=
