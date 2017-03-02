'use strict';Object.defineProperty(exports,'__esModule',{value:true});exports.Middleware=exports.MIDDLEWARE_TYPE_OBFS=exports.MIDDLEWARE_TYPE_PROTOCOL=exports.MIDDLEWARE_TYPE_CRYPTO=exports.MIDDLEWARE_TYPE_FRAME=exports.MIDDLEWARE_DIRECTION_DOWNWARD=exports.MIDDLEWARE_DIRECTION_UPWARD=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if('value'in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor}}();exports.createMiddleware=createMiddleware;var _events=require('events');var _events2=_interopRequireDefault(_events);var _winston=require('winston');var _winston2=_interopRequireDefault(_winston);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}function _toConsumableArray(arr){if(Array.isArray(arr)){for(var i=0,arr2=Array(arr.length);i<arr.length;i++){arr2[i]=arr[i]}return arr2}else{return Array.from(arr)}}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true})}else{obj[key]=value}return obj}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function')}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')}return call&&(typeof call==='object'||typeof call==='function')?call:self}function _inherits(subClass,superClass){if(typeof superClass!=='function'&&superClass!==null){throw new TypeError('Super expression must either be null or a function, not '+typeof superClass)}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass}var MIDDLEWARE_DIRECTION_UPWARD=exports.MIDDLEWARE_DIRECTION_UPWARD=0;var MIDDLEWARE_DIRECTION_DOWNWARD=exports.MIDDLEWARE_DIRECTION_DOWNWARD=1;var MIDDLEWARE_TYPE_FRAME=exports.MIDDLEWARE_TYPE_FRAME=0;var MIDDLEWARE_TYPE_CRYPTO=exports.MIDDLEWARE_TYPE_CRYPTO=1;var MIDDLEWARE_TYPE_PROTOCOL=exports.MIDDLEWARE_TYPE_PROTOCOL=2;var MIDDLEWARE_TYPE_OBFS=exports.MIDDLEWARE_TYPE_OBFS=3;var Middleware=exports.Middleware=function(_EventEmitter){_inherits(Middleware,_EventEmitter);function Middleware(impl){_classCallCheck(this,Middleware);var _this=_possibleConstructorReturn(this,(Middleware.__proto__||Object.getPrototypeOf(Middleware)).call(this));_this._broadcast=null;_this._impl=null;_this._impl=impl;return _this}_createClass(Middleware,[{key:'subscribe',value:function subscribe(receiver){this._broadcast=receiver}},{key:'onNotified',value:function onNotified(action){return this._impl.onNotified(action)}},{key:'write',value:function write(direction,buffer){var _MIDDLEWARE_DIRECTION,_this2=this;var type=(_MIDDLEWARE_DIRECTION={},_defineProperty(_MIDDLEWARE_DIRECTION,MIDDLEWARE_DIRECTION_UPWARD,'Out'),_defineProperty(_MIDDLEWARE_DIRECTION,MIDDLEWARE_DIRECTION_DOWNWARD,'In'),_MIDDLEWARE_DIRECTION)[direction];var broadcast=this._broadcast;var next=function next(buf){var args={buffer:buf,next:function next(buf){return _this2.emit('next_'+direction,buf)},broadcast:broadcast};var ret=__IS_CLIENT__?_this2._impl['client'+type](args):_this2._impl['server'+type](args);if(typeof ret!=='undefined'){args.next(ret)}};var r=this._impl['before'+type]({buffer:buffer,next:next,broadcast:broadcast});if(typeof r!=='undefined'){next(r)}}}]);return Middleware}(_events2.default);function createMiddleware(type){var _MIDDLEWARE_TYPE_FRAM;var props=arguments.length>1&&arguments[1]!==undefined?arguments[1]:[];var array=(_MIDDLEWARE_TYPE_FRAM={},_defineProperty(_MIDDLEWARE_TYPE_FRAM,MIDDLEWARE_TYPE_FRAME,['frame/'+__FRAME__,__FRAME_PARAMS__]),_defineProperty(_MIDDLEWARE_TYPE_FRAM,MIDDLEWARE_TYPE_CRYPTO,['crypto/'+__CRYPTO__,__CRYPTO_PARAMS__]),_defineProperty(_MIDDLEWARE_TYPE_FRAM,MIDDLEWARE_TYPE_PROTOCOL,['protocol/'+__PROTOCOL__,__PROTOCOL_PARAMS__]),_defineProperty(_MIDDLEWARE_TYPE_FRAM,MIDDLEWARE_TYPE_OBFS,['obfs/'+__OBFS__,__OBFS_PARAMS__]),_MIDDLEWARE_TYPE_FRAM)[type];try{var ImplClass=require('../presets/'+array[0]).default;var params=Array.isArray(array[1])?array[1]:array[1].split(',').filter(function(param){return param.length>0});var impl=new(Function.prototype.bind.apply(ImplClass,[null].concat(_toConsumableArray(props.concat(params)))));checkMiddleware(ImplClass.name,impl);return new Middleware(impl)}catch(err){_winston2.default.error(err.message);process.exit(-1)}return null}function checkMiddleware(name,impl){var requiredMethods=['clientOut','serverIn','serverOut','clientIn'];if(requiredMethods.some(function(method){return typeof impl[method]!=='function'})){throw Error('all methods ['+requiredMethods.toString()+'] in '+name+' must be implemented')}return true}