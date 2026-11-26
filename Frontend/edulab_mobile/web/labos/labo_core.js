(function dartProgram(){function copyProperties(a,b){var t=Object.keys(a)
for(var s=0;s<t.length;s++){var r=t[s]
b[r]=a[r]}}function mixinPropertiesHard(a,b){var t=Object.keys(a)
for(var s=0;s<t.length;s++){var r=t[s]
if(!b.hasOwnProperty(r)){b[r]=a[r]}}}function mixinPropertiesEasy(a,b){Object.assign(b,a)}var z=function(){var t=function(){}
t.prototype={p:{}}
var s=new t()
if(!(Object.getPrototypeOf(s)&&Object.getPrototypeOf(s).p===t.prototype.p))return false
try{if(typeof navigator!="undefined"&&typeof navigator.userAgent=="string"&&navigator.userAgent.indexOf("Chrome/")>=0)return true
if(typeof version=="function"&&version.length==0){var r=version()
if(/^\d+\.\d+\.\d+\.\d+$/.test(r))return true}}catch(q){}return false}()
function inherit(a,b){a.prototype.constructor=a
a.prototype["$i"+a.name]=a
if(b!=null){if(z){Object.setPrototypeOf(a.prototype,b.prototype)
return}var t=Object.create(b.prototype)
copyProperties(a.prototype,t)
a.prototype=t}}function inheritMany(a,b){for(var t=0;t<b.length;t++){inherit(b[t],a)}}function mixinEasy(a,b){mixinPropertiesEasy(b.prototype,a.prototype)
a.prototype.constructor=a}function mixinHard(a,b){mixinPropertiesHard(b.prototype,a.prototype)
a.prototype.constructor=a}function lazy(a,b,c,d){var t=a
a[b]=t
a[c]=function(){if(a[b]===t){a[b]=d()}a[c]=function(){return this[b]}
return a[b]}}function lazyFinal(a,b,c,d){var t=a
a[b]=t
a[c]=function(){if(a[b]===t){var s=d()
if(a[b]!==t){A.hM(b)}a[b]=s}var r=a[b]
a[c]=function(){return r}
return r}}function makeConstList(a,b){if(b!=null)A.e(a,b)
a.$flags=7
return a}function convertToFastObject(a){function t(){}t.prototype=a
new t()
return a}function convertAllToFastObject(a){for(var t=0;t<a.length;++t){convertToFastObject(a[t])}}var y=0
function instanceTearOffGetter(a,b){var t=null
return a?function(c){if(t===null)t=A.dH(b)
return new t(c,this)}:function(){if(t===null)t=A.dH(b)
return new t(this,null)}}function staticTearOffGetter(a){var t=null
return function(){if(t===null)t=A.dH(a).prototype
return t}}var x=0
function tearOffParameters(a,b,c,d,e,f,g,h,i,j){if(typeof h=="number"){h+=x}return{co:a,iS:b,iI:c,rC:d,dV:e,cs:f,fs:g,fT:h,aI:i||0,nDA:j}}function installStaticTearOff(a,b,c,d,e,f,g,h){var t=tearOffParameters(a,true,false,c,d,e,f,g,h,false)
var s=staticTearOffGetter(t)
a[b]=s}function installInstanceTearOff(a,b,c,d,e,f,g,h,i,j){c=!!c
var t=tearOffParameters(a,false,c,d,e,f,g,h,i,!!j)
var s=instanceTearOffGetter(c,t)
a[b]=s}function setOrUpdateInterceptorsByTag(a){var t=v.interceptorsByTag
if(!t){v.interceptorsByTag=a
return}copyProperties(a,t)}function setOrUpdateLeafTags(a){var t=v.leafTags
if(!t){v.leafTags=a
return}copyProperties(a,t)}function updateTypes(a){var t=v.types
var s=t.length
t.push.apply(t,a)
return s}function updateHolder(a,b){copyProperties(b,a)
return a}var hunkHelpers=function(){var t=function(a,b,c,d,e){return function(f,g,h,i){return installInstanceTearOff(f,g,a,b,c,d,[h],i,e,false)}},s=function(a,b,c,d){return function(e,f,g,h){return installStaticTearOff(e,f,a,b,c,[g],h,d)}}
return{inherit:inherit,inheritMany:inheritMany,mixin:mixinEasy,mixinHard:mixinHard,installStaticTearOff:installStaticTearOff,installInstanceTearOff:installInstanceTearOff,_instance_0u:t(0,0,null,["$0"],0),_instance_1u:t(0,1,null,["$1"],0),_instance_2u:t(0,2,null,["$2"],0),_instance_0i:t(1,0,null,["$0"],0),_instance_1i:t(1,1,null,["$1"],0),_instance_2i:t(1,2,null,["$2"],0),_static_0:s(0,null,["$0"],0),_static_1:s(1,null,["$1"],0),_static_2:s(2,null,["$2"],0),makeConstList:makeConstList,lazy:lazy,lazyFinal:lazyFinal,updateHolder:updateHolder,convertToFastObject:convertToFastObject,updateTypes:updateTypes,setOrUpdateInterceptorsByTag:setOrUpdateInterceptorsByTag,setOrUpdateLeafTags:setOrUpdateLeafTags}}()
function initializeDeferredHunk(a){x=v.types.length
a(hunkHelpers,v,w,$)}var J={
fd(a,b){var t=u.U
return J.eV(t.a(a),t.a(b))},
az(a){if(typeof a=="number"){if(Math.floor(a)==a)return J.aX.prototype
return J.bL.prototype}if(typeof a=="string")return J.ao.prototype
if(a==null)return J.aY.prototype
if(typeof a=="boolean")return J.bK.prototype
if(Array.isArray(a))return J.p.prototype
if(typeof a=="function")return J.aZ.prototype
if(typeof a=="object"){if(a instanceof A.j){return a}else{return J.aH.prototype}}if(!(a instanceof A.j))return J.af.prototype
return a},
aR(a){if(a==null)return a
if(Array.isArray(a))return J.p.prototype
if(!(a instanceof A.j))return J.af.prototype
return a},
dJ(a){if(typeof a=="string")return J.ao.prototype
if(a==null)return a
if(Array.isArray(a))return J.p.prototype
if(!(a instanceof A.j))return J.af.prototype
return a},
hz(a){if(typeof a=="number")return J.aF.prototype
if(typeof a=="string")return J.ao.prototype
if(a==null)return a
if(!(a instanceof A.j))return J.af.prototype
return a},
v(a,b){if(a==null)return b==null
if(typeof a!="object")return b!=null&&a===b
return J.az(a).ab(a,b)},
aC(a,b){if(typeof b==="number")if(Array.isArray(a))if(b>>>0===b&&b<a.length)return a[b]
return J.aR(a).h(a,b)},
dL(a,b){return J.aR(a).t(a,b)},
dm(a,b){return J.aR(a).al(a,b)},
eV(a,b){return J.hz(a).P(a,b)},
eW(a,b){return J.aR(a).R(a,b)},
cc(a){return J.az(a).gD(a)},
eX(a){return J.dJ(a).gC(a)},
eY(a){return J.aR(a).gM(a)},
a8(a){return J.aR(a).gv(a)},
Q(a){return J.dJ(a).gp(a)},
eZ(a){return J.az(a).ga4(a)},
al(a){return J.az(a).m(a)},
bI:function bI(){},
bK:function bK(){},
aY:function aY(){},
aH:function aH(){},
ad:function ad(){},
d_:function d_(){},
af:function af(){},
aZ:function aZ(){},
p:function p(a){this.$ti=a},
bJ:function bJ(){},
ck:function ck(a){this.$ti=a},
am:function am(a,b,c){var _=this
_.a=a
_.b=b
_.c=0
_.d=null
_.$ti=c},
aF:function aF(){},
aX:function aX(){},
bL:function bL(){},
ao:function ao(){}},A={dq:function dq(){},
f1(a,b,c){if(u.Q.b(a))return new A.bi(a,b.i("@<0>").G(c).i("bi<1,2>"))
return new A.an(a,b.i("@<0>").G(c).i("an<1,2>"))},
ee(a,b){a=a+b&536870911
a=a+((a&524287)<<10)&536870911
return a^a>>>6},
fp(a){a=a+((a&67108863)<<3)&536870911
a^=a>>>11
return a+((a&16383)<<15)&536870911},
dK(a){var t,s
for(t=$.P.length,s=0;s<t;++s)if(a===$.P[s])return!0
return!1},
dU(){return new A.aL("No element")},
ag:function ag(){},
aT:function aT(a,b){this.a=a
this.$ti=b},
an:function an(a,b){this.a=a
this.$ti=b},
bi:function bi(a,b){this.a=a
this.$ti=b},
bg:function bg(){},
a_:function a_(a,b){this.a=a
this.$ti=b},
bT:function bT(a){this.a=a},
d0:function d0(){},
o:function o(){},
Z:function Z(){},
K:function K(a,b,c){var _=this
_.a=a
_.b=b
_.c=0
_.d=null
_.$ti=c},
ar:function ar(a,b,c){this.a=a
this.b=b
this.$ti=c},
D:function D(a,b,c){this.a=a
this.b=b
this.$ti=c},
a4:function a4(a,b,c){this.a=a
this.b=b
this.$ti=c},
bs:function bs(){},
dn(a,b,c){var t,s,r,q,p,o,n,m=A.f(a),l=A.dt(new A.V(a,m.i("V<1>")),!0,b),k=l.length,j=0
for(;;){if(!(j<k)){t=!0
break}s=l[j]
if(typeof s!="string"||"__proto__"===s){t=!1
break}++j}if(t){r={}
for(q=0,j=0;j<l.length;l.length===k||(0,A.bu)(l),++j,q=p){s=l[j]
c.a(a.h(0,s))
p=q+1
r[s]=q}o=A.dt(new A.b7(a,m.i("b7<2>")),!0,c)
n=new A.w(r,o,b.i("@<0>").G(c).i("w<1,2>"))
n.$keys=l
return n}return new A.aV(A.dZ(a,b,c),b.i("@<0>").G(c).i("aV<1,2>"))},
f7(){throw A.a(A.dw("Cannot modify constant Set"))},
eG(a){var t=A.eF(a)
if(t!=null)return t
return"minified:"+a},
q(a){var t
if(typeof a=="string")return a
if(typeof a=="number"){if(a!==0)return""+a}else if(!0===a)return"true"
else if(!1===a)return"false"
else if(a==null)return"null"
t=J.al(a)
return t},
bX(a){var t,s=$.e3
if(s==null)s=$.e3=Symbol("identityHashCode")
t=a[s]
if(t==null){t=Math.random()*0x3fffffff|0
a[s]=t}return t},
fg(a,b){var t,s=/^\s*[+-]?((0x[a-f0-9]+)|(\d+)|([a-z0-9]+))\s*$/i.exec(a)
if(s==null)return null
if(3>=s.length)return A.h(s,3)
t=s[3]
if(t!=null)return parseInt(a,10)
if(s[2]!=null)return parseInt(a,16)
return null},
bY(a){var t,s,r,q
if(a instanceof A.j)return A.O(A.c9(a),null)
t=J.az(a)
if(t===B.D||t===B.E||u.o.b(a)){s=B.y(a)
if(s!=="Object"&&s!=="")return s
r=a.constructor
if(typeof r=="function"){q=r.name
if(typeof q=="string"&&q!=="Object"&&q!=="")return q}}return A.O(A.c9(a),null)},
fh(a){var t,s,r
if(typeof a=="number"||A.dE(a))return J.al(a)
if(typeof a=="string")return JSON.stringify(a)
if(a instanceof A.a9)return a.m(0)
t=$.eU()
for(s=0;s<1;++s){r=t[s].bS(a)
if(r!=null)return r}return"Instance of '"+A.bY(a)+"'"},
C(a){var t
if(a<=65535)return String.fromCharCode(a)
if(a<=1114111){t=a-65536
return String.fromCharCode((B.c.b1(t,10)|55296)>>>0,t&1023|56320)}throw A.a(A.aK(a,0,1114111,null,null))},
fi(a,b,c,d,e,f,g,h,i){var t,s,r,q=b-1
if(0<=a&&a<100){a+=400
q-=4800}t=B.c.bi(h,1000)
g+=B.c.b2(h-t,1000)
s=i?Date.UTC(a,q,c,d,e,f,g):new Date(a,q,c,d,e,f,g).valueOf()
r=!0
if(!isNaN(s))if(!(s<-864e13))if(!(s>864e13))r=s===864e13&&t!==0
if(r)return null
return s},
M(a){if(a.date===void 0)a.date=new Date(a.a)
return a.date},
bW(a){return a.c?A.M(a).getUTCFullYear()+0:A.M(a).getFullYear()+0},
e8(a){return a.c?A.M(a).getUTCMonth()+1:A.M(a).getMonth()+1},
e4(a){return a.c?A.M(a).getUTCDate()+0:A.M(a).getDate()+0},
e5(a){return a.c?A.M(a).getUTCHours()+0:A.M(a).getHours()+0},
e7(a){return a.c?A.M(a).getUTCMinutes()+0:A.M(a).getMinutes()+0},
e9(a){return a.c?A.M(a).getUTCSeconds()+0:A.M(a).getSeconds()+0},
e6(a){return a.c?A.M(a).getUTCMilliseconds()+0:A.M(a).getMilliseconds()+0},
h(a,b){if(a==null)J.Q(a)
throw A.a(A.dI(a,b))},
dI(a,b){var t,s="index"
if(!A.ey(b))return new A.J(!0,b,s,null)
t=J.Q(a)
if(b<0||b>=t)return A.dT(b,t,a,s)
return A.fj(b,s)},
hq(a){return new A.J(!0,a,null,null)},
a(a){return A.E(a,new Error())},
E(a,b){var t
if(a==null)a=new A.bd()
b.dartException=a
t=A.hN
if("defineProperty" in Object){Object.defineProperty(b,"message",{get:t})
b.name=""}else b.toString=t
return b},
hN(){return J.al(this.dartException)},
n(a,b){throw A.E(a,b==null?new Error():b)},
dk(a,b,c){var t
if(b==null)b=0
if(c==null)c=0
t=Error()
A.n(A.fW(a,b,c),t)},
fW(a,b,c){var t,s,r,q,p,o,n,m,l
if(typeof b=="string")t=b
else{s="[]=;add;removeWhere;retainWhere;removeRange;setRange;setInt8;setInt16;setInt32;setUint8;setUint16;setUint32;setFloat32;setFloat64".split(";")
r=s.length
q=b
if(q>r){c=q/r|0
q%=r}t=s[q]}p=typeof c=="string"?c:"modify;remove from;add to".split(";")[c]
o=u.j.b(a)?"list":"ByteData"
n=a.$flags|0
m="a "
if((n&4)!==0)l="constant "
else if((n&2)!==0){l="unmodifiable "
m="an "}else l=(n&1)!==0?"fixed-length ":""
return new A.bf("'"+t+"': Cannot "+p+" "+m+l+o)},
bu(a){throw A.a(A.U(a))},
a3(a){var t,s,r,q,p,o
a=A.hH(a.replace(String({}),"$receiver$"))
t=a.match(/\\\$[a-zA-Z]+\\\$/g)
if(t==null)t=A.e([],u.s)
s=t.indexOf("\\$arguments\\$")
r=t.indexOf("\\$argumentsExpr\\$")
q=t.indexOf("\\$expr\\$")
p=t.indexOf("\\$method\\$")
o=t.indexOf("\\$receiver\\$")
return new A.d1(a.replace(new RegExp("\\\\\\$arguments\\\\\\$","g"),"((?:x|[^x])*)").replace(new RegExp("\\\\\\$argumentsExpr\\\\\\$","g"),"((?:x|[^x])*)").replace(new RegExp("\\\\\\$expr\\\\\\$","g"),"((?:x|[^x])*)").replace(new RegExp("\\\\\\$method\\\\\\$","g"),"((?:x|[^x])*)").replace(new RegExp("\\\\\\$receiver\\\\\\$","g"),"((?:x|[^x])*)"),s,r,q,p,o)},
d2(a){return function($expr$){var $argumentsExpr$="$arguments$"
try{$expr$.$method$($argumentsExpr$)}catch(t){return t.message}}(a)},
ef(a){return function($expr$){try{$expr$.$method$}catch(t){return t.message}}(a)},
dr(a,b){var t=b==null,s=t?null:b.method
return new A.bN(a,s,t?null:b.receiver)},
bv(a){if(a==null)return new A.cT(a)
if(typeof a!=="object")return a
if("dartException" in a)return A.aB(a,a.dartException)
return A.hp(a)},
aB(a,b){if(u.V.b(b))if(b.$thrownJsError==null)b.$thrownJsError=a
return b},
hp(a){var t,s,r,q,p,o,n,m,l,k,j,i,h
if(!("message" in a))return a
t=a.message
if("number" in a&&typeof a.number=="number"){s=a.number
r=s&65535
if((B.c.b1(s,16)&8191)===10)switch(r){case 438:return A.aB(a,A.dr(A.q(t)+" (Error "+r+")",null))
case 445:case 5007:A.q(t)
return A.aB(a,new A.b9())}}if(a instanceof TypeError){q=$.eJ()
p=$.eK()
o=$.eL()
n=$.eM()
m=$.eP()
l=$.eQ()
k=$.eO()
$.eN()
j=$.eS()
i=$.eR()
h=q.J(t)
if(h!=null)return A.aB(a,A.dr(A.k(t),h))
else{h=p.J(t)
if(h!=null){h.method="call"
return A.aB(a,A.dr(A.k(t),h))}else if(o.J(t)!=null||n.J(t)!=null||m.J(t)!=null||l.J(t)!=null||k.J(t)!=null||n.J(t)!=null||j.J(t)!=null||i.J(t)!=null){A.k(t)
return A.aB(a,new A.b9())}}return A.aB(a,new A.c3(typeof t=="string"?t:""))}if(a instanceof RangeError){if(typeof t=="string"&&t.indexOf("call stack")!==-1)return new A.bc()
t=function(b){try{return String(b)}catch(g){}return null}(a)
return A.aB(a,new A.J(!1,null,null,typeof t=="string"?t.replace(/^RangeError:\s*/,""):t))}if(typeof InternalError=="function"&&a instanceof InternalError)if(typeof t=="string"&&t==="too much recursion")return new A.bc()
return a},
eE(a){if(a==null)return J.cc(a)
if(typeof a=="object")return A.bX(a)
return J.cc(a)},
hx(a,b){var t,s,r,q=a.length
for(t=0;t<q;t=r){s=t+1
r=s+1
b.j(0,a[t],a[s])}return b},
hy(a,b){var t,s=a.length
for(t=0;t<s;++t)b.t(0,a[t])
return b},
h4(a,b,c,d,e,f){u.Z.a(a)
switch(A.aP(b)){case 0:return a.$0()
case 1:return a.$1(c)
case 2:return a.$2(c,d)
case 3:return a.$3(c,d,e)
case 4:return a.$4(c,d,e,f)}throw A.a(new A.d5("Unsupported number of arguments for wrapped closure"))},
hr(a,b){var t=a.$identity
if(!!t)return t
t=A.hs(a,b)
a.$identity=t
return t},
hs(a,b){var t
switch(b){case 0:t=a.$0
break
case 1:t=a.$1
break
case 2:t=a.$2
break
case 3:t=a.$3
break
case 4:t=a.$4
break
default:t=null}if(t!=null)return t.bind(a)
return function(c,d,e){return function(f,g,h,i){return e(c,d,f,g,h,i)}}(a,b,A.h4)},
f6(a1){var t,s,r,q,p,o,n,m,l,k,j=a1.co,i=a1.iS,h=a1.iI,g=a1.nDA,f=a1.aI,e=a1.fs,d=a1.cs,c=e[0],b=d[0],a=j[c],a0=a1.fT
a0.toString
t=i?Object.create(new A.c1().constructor.prototype):Object.create(new A.aD(null,null).constructor.prototype)
t.$initialize=t.constructor
s=i?function static_tear_off(){this.$initialize()}:function tear_off(a2,a3){this.$initialize(a2,a3)}
t.constructor=s
s.prototype=t
t.$_name=c
t.$_target=a
r=!i
if(r)q=A.dQ(c,a,h,g)
else{t.$static_name=c
q=a}t.$S=A.f2(a0,i,h)
t[b]=q
for(p=q,o=1;o<e.length;++o){n=e[o]
if(typeof n=="string"){m=j[n]
l=n
n=m}else l=""
k=d[o]
if(k!=null){if(r)n=A.dQ(l,n,h,g)
t[k]=n}if(o===f)p=n}t.$C=p
t.$R=a1.rC
t.$D=a1.dV
return s},
f2(a,b,c){if(typeof a=="number")return a
if(typeof a=="string"){if(b)throw A.a("Cannot compute signature for static tearoff.")
return function(d,e){return function(){return e(this,d)}}(a,A.f_)}throw A.a("Error in functionType of tearoff")},
f3(a,b,c,d){var t=A.dP
switch(b?-1:a){case 0:return function(e,f){return function(){return f(this)[e]()}}(c,t)
case 1:return function(e,f){return function(g){return f(this)[e](g)}}(c,t)
case 2:return function(e,f){return function(g,h){return f(this)[e](g,h)}}(c,t)
case 3:return function(e,f){return function(g,h,i){return f(this)[e](g,h,i)}}(c,t)
case 4:return function(e,f){return function(g,h,i,j){return f(this)[e](g,h,i,j)}}(c,t)
case 5:return function(e,f){return function(g,h,i,j,k){return f(this)[e](g,h,i,j,k)}}(c,t)
default:return function(e,f){return function(){return e.apply(f(this),arguments)}}(d,t)}},
dQ(a,b,c,d){if(c)return A.f5(a,b,d)
return A.f3(b.length,d,a,b)},
f4(a,b,c,d){var t=A.dP,s=A.f0
switch(b?-1:a){case 0:throw A.a(new A.c0("Intercepted function with no arguments."))
case 1:return function(e,f,g){return function(){return f(this)[e](g(this))}}(c,s,t)
case 2:return function(e,f,g){return function(h){return f(this)[e](g(this),h)}}(c,s,t)
case 3:return function(e,f,g){return function(h,i){return f(this)[e](g(this),h,i)}}(c,s,t)
case 4:return function(e,f,g){return function(h,i,j){return f(this)[e](g(this),h,i,j)}}(c,s,t)
case 5:return function(e,f,g){return function(h,i,j,k){return f(this)[e](g(this),h,i,j,k)}}(c,s,t)
case 6:return function(e,f,g){return function(h,i,j,k,l){return f(this)[e](g(this),h,i,j,k,l)}}(c,s,t)
default:return function(e,f,g){return function(){var r=[g(this)]
Array.prototype.push.apply(r,arguments)
return e.apply(f(this),r)}}(d,s,t)}},
f5(a,b,c){var t,s
if($.dN==null)$.dN=A.dM("interceptor")
if($.dO==null)$.dO=A.dM("receiver")
t=b.length
s=A.f4(t,c,a,b)
return s},
dH(a){return A.f6(a)},
f_(a,b){return A.db(v.typeUniverse,A.c9(a.a),b)},
dP(a){return a.a},
f0(a){return a.b},
dM(a){var t,s,r,q=new A.aD("receiver","interceptor"),p=Object.getOwnPropertyNames(q)
p.$flags=1
t=p
for(p=t.length,s=0;s<p;++s){r=t[s]
if(q[r]===a)return r}throw A.a(A.m("Field name "+a+" not found."))},
eD(a){return v.getIsolateTag(a)},
hu(a,b){var t=b.length,s=v.rttc[""+t+";"+a]
if(s==null)return null
if(t===0)return s
if(t===s.length)return s.apply(null,b)
return s(b)},
dV(a,b,c,d,e,f){var t=b?"m":"",s=c?"":"i",r=d?"u":"",q=e?"s":"",p=function(g,h){try{return new RegExp(g,h)}catch(o){return o}}(a,t+s+r+q+f)
if(p instanceof RegExp)return p
throw A.a(A.bG("Illegal RegExp pattern ("+String(p)+")",a))},
hw(a){if(a.indexOf("$",0)>=0)return a.replace(/\$/g,"$$$$")
return a},
hJ(a,b,c,d){var t=b.aV(a,d)
if(t==null)return a
return A.hL(a,t.b.index,t.gb9(),c)},
hH(a){if(/[[\]{}()*+?.\\^$|]/.test(a))return a.replace(/[[\]{}()*+?.\\^$|]/g,"\\$&")
return a},
hK(a,b,c,d){return d===0?a.replace(b.b,A.hw(c)):A.hJ(a,b,c,d)},
hL(a,b,c,d){return a.substring(0,b)+d+a.substring(c)},
aV:function aV(a,b){this.a=a
this.$ti=b},
aU:function aU(){},
w:function w(a,b,c){this.a=a
this.b=b
this.$ti=c},
bj:function bj(a,b){this.a=a
this.$ti=b},
at:function at(a,b,c){var _=this
_.a=a
_.b=b
_.c=0
_.d=null
_.$ti=c},
aW:function aW(){},
aa:function aa(a,b,c){this.a=a
this.b=b
this.$ti=c},
bb:function bb(){},
d1:function d1(a,b,c,d,e,f){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e
_.f=f},
b9:function b9(){},
bN:function bN(a,b,c){this.a=a
this.b=b
this.c=c},
c3:function c3(a){this.a=a},
cT:function cT(a){this.a=a},
a9:function a9(){},
by:function by(){},
c2:function c2(){},
c1:function c1(){},
aD:function aD(a,b){this.a=a
this.b=b},
c0:function c0(a){this.a=a},
a1:function a1(a){var _=this
_.a=0
_.f=_.e=_.d=_.c=_.b=null
_.r=0
_.$ti=a},
cl:function cl(a){this.a=a},
cP:function cP(a,b){this.a=a
this.b=b
this.c=null},
V:function V(a,b){this.a=a
this.$ti=b},
b6:function b6(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=null
_.$ti=d},
b7:function b7(a,b){this.a=a
this.$ti=b},
W:function W(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=null
_.$ti=d},
ap:function ap(a,b){this.a=a
this.$ti=b},
b5:function b5(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=null
_.$ti=d},
bM:function bM(a,b){var _=this
_.a=a
_.b=b
_.e=_.d=_.c=null},
bk:function bk(a){this.b=a},
d3:function d3(a,b,c){var _=this
_.a=a
_.b=b
_.c=c
_.d=null},
dv(a,b){var t=b.c
return t==null?b.c=A.bp(a,"dS",[b.x]):t},
eb(a){var t=a.w
if(t===6||t===7)return A.eb(a.x)
return t===11||t===12},
fn(a){return a.as},
aj(a){return A.da(v.typeUniverse,a,!1)},
aw(a0,a1,a2,a3){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a=a1.w
switch(a){case 5:case 1:case 2:case 3:case 4:return a1
case 6:t=a1.x
s=A.aw(a0,t,a2,a3)
if(s===t)return a1
return A.eo(a0,s,!0)
case 7:t=a1.x
s=A.aw(a0,t,a2,a3)
if(s===t)return a1
return A.en(a0,s,!0)
case 8:r=a1.y
q=A.aQ(a0,r,a2,a3)
if(q===r)return a1
return A.bp(a0,a1.x,q)
case 9:p=a1.x
o=A.aw(a0,p,a2,a3)
n=a1.y
m=A.aQ(a0,n,a2,a3)
if(o===p&&m===n)return a1
return A.dy(a0,o,m)
case 10:l=a1.x
k=a1.y
j=A.aQ(a0,k,a2,a3)
if(j===k)return a1
return A.ep(a0,l,j)
case 11:i=a1.x
h=A.aw(a0,i,a2,a3)
g=a1.y
f=A.hm(a0,g,a2,a3)
if(h===i&&f===g)return a1
return A.em(a0,h,f)
case 12:e=a1.y
a3+=e.length
d=A.aQ(a0,e,a2,a3)
p=a1.x
o=A.aw(a0,p,a2,a3)
if(d===e&&o===p)return a1
return A.dz(a0,o,d,!0)
case 13:c=a1.x
if(c<a3)return a1
b=a2[c-a3]
if(b==null)return a1
return b
default:throw A.a(A.bx("Attempted to substitute unexpected RTI kind "+a))}},
aQ(a,b,c,d){var t,s,r,q,p=b.length,o=A.dc(p)
for(t=!1,s=0;s<p;++s){r=b[s]
q=A.aw(a,r,c,d)
if(q!==r)t=!0
o[s]=q}return t?o:b},
hn(a,b,c,d){var t,s,r,q,p,o,n=b.length,m=A.dc(n)
for(t=!1,s=0;s<n;s+=3){r=b[s]
q=b[s+1]
p=b[s+2]
o=A.aw(a,p,c,d)
if(o!==p)t=!0
m.splice(s,3,r,q,o)}return t?m:b},
hm(a,b,c,d){var t,s=b.a,r=A.aQ(a,s,c,d),q=b.b,p=A.aQ(a,q,c,d),o=b.c,n=A.hn(a,o,c,d)
if(r===s&&p===q&&n===o)return b
t=new A.c5()
t.a=r
t.b=p
t.c=n
return t},
e(a,b){a[v.arrayRti]=b
return a},
eC(a){var t=a.$S
if(t!=null){if(typeof t=="number")return A.hB(t)
return a.$S()}return null},
hC(a,b){var t
if(A.eb(b))if(a instanceof A.a9){t=A.eC(a)
if(t!=null)return t}return A.c9(a)},
c9(a){if(a instanceof A.j)return A.f(a)
if(Array.isArray(a))return A.N(a)
return A.dD(J.az(a))},
N(a){var t=a[v.arrayRti],s=u.b
if(t==null)return s
if(t.constructor!==s.constructor)return s
return t},
f(a){var t=a.$ti
return t!=null?t:A.dD(a)},
dD(a){var t=a.constructor,s=t.$ccache
if(s!=null)return s
return A.h2(a,t)},
h2(a,b){var t=a instanceof A.a9?Object.getPrototypeOf(Object.getPrototypeOf(a)).constructor:b,s=A.fI(v.typeUniverse,t.name)
b.$ccache=s
return s},
hB(a){var t,s=v.types,r=s[a]
if(typeof r=="string"){t=A.da(v.typeUniverse,r,!1)
s[a]=t
return t}return r},
hA(a){return A.ax(A.f(a))},
hl(a){var t=a instanceof A.a9?A.eC(a):null
if(t!=null)return t
if(u.R.b(a))return J.eZ(a).a
if(Array.isArray(a))return A.N(a)
return A.c9(a)},
ax(a){var t=a.r
return t==null?a.r=new A.d9(a):t},
hO(a){return A.ax(A.da(v.typeUniverse,a,!1))},
h1(a){var t=this
t.b=A.hk(t)
return t.b(a)},
hk(a){var t,s,r,q,p
if(a===u.K)return A.ha
if(A.aA(a))return A.he
t=a.w
if(t===6)return A.h_
if(t===1)return A.eA
if(t===7)return A.h5
s=A.hj(a)
if(s!=null)return s
if(t===8){r=a.x
if(a.y.every(A.aA)){a.f="$i"+r
if(r==="F")return A.h8
if(a===u.m)return A.h7
return A.hd}}else if(t===10){q=A.hu(a.x,a.y)
p=q==null?A.eA:q
return p==null?A.dB(p):p}return A.fY},
hj(a){if(a.w===8){if(a===u.S)return A.ey
if(a===u.i||a===u.H)return A.h9
if(a===u.N)return A.hc
if(a===u.y)return A.dE}return null},
h0(a){var t=this,s=A.fX
if(A.aA(t))s=A.fQ
else if(t===u.K)s=A.dB
else if(A.aS(t)){s=A.fZ
if(t===u.a3)s=A.fN
else if(t===u.u)s=A.dC
else if(t===u.cG)s=A.fM
else if(t===u.ae)s=A.et
else if(t===u.I)s=A.dA
else if(t===u.E)s=A.fP}else if(t===u.S)s=A.aP
else if(t===u.N)s=A.k
else if(t===u.y)s=A.fL
else if(t===u.H)s=A.dd
else if(t===u.i)s=A.a5
else if(t===u.m)s=A.fO
t.a=s
return t.a(a)},
fY(a){var t=this
if(a==null)return A.aS(t)
return A.hD(v.typeUniverse,A.hC(a,t),t)},
h_(a){if(a==null)return!0
return this.x.b(a)},
hd(a){var t,s=this
if(a==null)return A.aS(s)
t=s.f
if(a instanceof A.j)return!!a[t]
return!!J.az(a)[t]},
h8(a){var t,s=this
if(a==null)return A.aS(s)
if(typeof a!="object")return!1
if(Array.isArray(a))return!0
t=s.f
if(a instanceof A.j)return!!a[t]
return!!J.az(a)[t]},
h7(a){var t=this
if(a==null)return!1
if(typeof a=="object"){if(a instanceof A.j)return!!a[t.f]
return!0}if(typeof a=="function")return!0
return!1},
ez(a){if(typeof a=="object"){if(a instanceof A.j)return u.m.b(a)
return!0}if(typeof a=="function")return!0
return!1},
fX(a){var t=this
if(a==null){if(A.aS(t))return a}else if(t.b(a))return a
throw A.E(A.eu(a,t),new Error())},
fZ(a){var t=this
if(a==null||t.b(a))return a
throw A.E(A.eu(a,t),new Error())},
eu(a,b){return new A.bn("TypeError: "+A.eg(a,A.O(b,null)))},
eg(a,b){return A.bE(a)+": type '"+A.O(A.hl(a),null)+"' is not a subtype of type '"+b+"'"},
R(a,b){return new A.bn("TypeError: "+A.eg(a,b))},
h5(a){var t=this
return t.x.b(a)||A.dv(v.typeUniverse,t).b(a)},
ha(a){return a!=null},
dB(a){if(a!=null)return a
throw A.E(A.R(a,"Object"),new Error())},
he(a){return!0},
fQ(a){return a},
eA(a){return!1},
dE(a){return!0===a||!1===a},
fL(a){if(!0===a)return!0
if(!1===a)return!1
throw A.E(A.R(a,"bool"),new Error())},
fM(a){if(!0===a)return!0
if(!1===a)return!1
if(a==null)return a
throw A.E(A.R(a,"bool?"),new Error())},
a5(a){if(typeof a=="number")return a
throw A.E(A.R(a,"double"),new Error())},
dA(a){if(typeof a=="number")return a
if(a==null)return a
throw A.E(A.R(a,"double?"),new Error())},
ey(a){return typeof a=="number"&&Math.floor(a)===a},
aP(a){if(typeof a=="number"&&Math.floor(a)===a)return a
throw A.E(A.R(a,"int"),new Error())},
fN(a){if(typeof a=="number"&&Math.floor(a)===a)return a
if(a==null)return a
throw A.E(A.R(a,"int?"),new Error())},
h9(a){return typeof a=="number"},
dd(a){if(typeof a=="number")return a
throw A.E(A.R(a,"num"),new Error())},
et(a){if(typeof a=="number")return a
if(a==null)return a
throw A.E(A.R(a,"num?"),new Error())},
hc(a){return typeof a=="string"},
k(a){if(typeof a=="string")return a
throw A.E(A.R(a,"String"),new Error())},
dC(a){if(typeof a=="string")return a
if(a==null)return a
throw A.E(A.R(a,"String?"),new Error())},
fO(a){if(A.ez(a))return a
throw A.E(A.R(a,"JSObject"),new Error())},
fP(a){if(a==null)return a
if(A.ez(a))return a
throw A.E(A.R(a,"JSObject?"),new Error())},
eB(a,b){var t,s,r
for(t="",s="",r=0;r<a.length;++r,s=", ")t+=s+A.O(a[r],b)
return t},
hi(a,b){var t,s,r,q,p,o,n=a.x,m=a.y
if(""===n)return"("+A.eB(m,b)+")"
t=m.length
s=n.split(",")
r=s.length-t
for(q="(",p="",o=0;o<t;++o,p=", "){q+=p
if(r===0)q+="{"
q+=A.O(m[o],b)
if(r>=0)q+=" "+s[r];++r}return q+"})"},
ev(a2,a3,a4){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0=", ",a1=null
if(a4!=null){t=a4.length
if(a3==null)a3=A.e([],u.s)
else a1=a3.length
s=a3.length
for(r=t;r>0;--r)B.a.t(a3,"T"+(s+r))
for(q=u.X,p="<",o="",r=0;r<t;++r,o=a0){n=a3.length
m=n-1-r
if(!(m>=0))return A.h(a3,m)
p=p+o+a3[m]
l=a4[r]
k=l.w
if(!(k===2||k===3||k===4||k===5||l===q))p+=" extends "+A.O(l,a3)}p+=">"}else p=""
q=a2.x
j=a2.y
i=j.a
h=i.length
g=j.b
f=g.length
e=j.c
d=e.length
c=A.O(q,a3)
for(b="",a="",r=0;r<h;++r,a=a0)b+=a+A.O(i[r],a3)
if(f>0){b+=a+"["
for(a="",r=0;r<f;++r,a=a0)b+=a+A.O(g[r],a3)
b+="]"}if(d>0){b+=a+"{"
for(a="",r=0;r<d;r+=3,a=a0){b+=a
if(e[r+1])b+="required "
b+=A.O(e[r+2],a3)+" "+e[r]}b+="}"}if(a1!=null){a3.toString
a3.length=a1}return p+"("+b+") => "+c},
O(a,b){var t,s,r,q,p,o,n,m=a.w
if(m===5)return"erased"
if(m===2)return"dynamic"
if(m===3)return"void"
if(m===1)return"Never"
if(m===4)return"any"
if(m===6){t=a.x
s=A.O(t,b)
r=t.w
return(r===11||r===12?"("+s+")":s)+"?"}if(m===7)return"FutureOr<"+A.O(a.x,b)+">"
if(m===8){q=A.ho(a.x)
p=a.y
return p.length>0?q+("<"+A.eB(p,b)+">"):q}if(m===10)return A.hi(a,b)
if(m===11)return A.ev(a,b,null)
if(m===12)return A.ev(a.x,b,a.y)
if(m===13){o=a.x
n=b.length
o=n-1-o
if(!(o>=0&&o<n))return A.h(b,o)
return b[o]}return"?"},
ho(a){var t=A.eF(a)
if(t!=null)return t
return"minified:"+a},
fJ(a,b){var t=a.tR[b]
while(typeof t=="string")t=a.tR[t]
return t},
fI(a,b){var t,s,r,q,p,o=a.eT,n=o[b]
if(n==null)return A.da(a,b,!1)
else if(typeof n=="number"){t=n
s=A.bq(a,5,"#")
r=A.dc(t)
for(q=0;q<t;++q)r[q]=s
p=A.bp(a,b,r)
o[b]=p
return p}else return n},
fG(a,b){return A.er(a.tR,b)},
fF(a,b){return A.er(a.eT,b)},
da(a,b,c){var t,s=a.eC,r=s.get(b)
if(r!=null)return r
t=A.eq(a,null,b,!1)
s.set(b,t)
return t},
db(a,b,c){var t,s,r=b.z
if(r==null)r=b.z=new Map()
t=r.get(c)
if(t!=null)return t
s=A.eq(a,b,c,!0)
r.set(c,s)
return s},
fH(a,b,c){var t,s,r,q=b.Q
if(q==null)q=b.Q=new Map()
t=c.as
s=q.get(t)
if(s!=null)return s
r=A.dy(a,b,c.w===9?c.y:[c])
q.set(t,r)
return r},
eq(a,b,c,d){return A.fy(A.fs(a,b,c,d))},
ai(a,b){b.a=A.h0
b.b=A.h1
return b},
bq(a,b,c){var t,s,r=a.eC.get(c)
if(r!=null)return r
t=new A.Y(null,null)
t.w=b
t.as=c
s=A.ai(a,t)
a.eC.set(c,s)
return s},
eo(a,b,c){var t,s=b.as+"?",r=a.eC.get(s)
if(r!=null)return r
t=A.fD(a,b,s,c)
a.eC.set(s,t)
return t},
fD(a,b,c,d){var t,s,r
if(d){t=b.w
s=!0
if(!A.aA(b))if(!(b===u.P||b===u.T))if(t!==6)s=t===7&&A.aS(b.x)
if(s)return b
else if(t===1)return u.P}r=new A.Y(null,null)
r.w=6
r.x=b
r.as=c
return A.ai(a,r)},
en(a,b,c){var t,s=b.as+"/",r=a.eC.get(s)
if(r!=null)return r
t=A.fB(a,b,s,c)
a.eC.set(s,t)
return t},
fB(a,b,c,d){var t,s
if(d){t=b.w
if(A.aA(b)||b===u.K)return b
else if(t===1)return A.bp(a,"dS",[b])
else if(b===u.P||b===u.T)return u.d}s=new A.Y(null,null)
s.w=7
s.x=b
s.as=c
return A.ai(a,s)},
fE(a,b){var t,s,r=""+b+"^",q=a.eC.get(r)
if(q!=null)return q
t=new A.Y(null,null)
t.w=13
t.x=b
t.as=r
s=A.ai(a,t)
a.eC.set(r,s)
return s},
bo(a){var t,s,r,q=a.length
for(t="",s="",r=0;r<q;++r,s=",")t+=s+a[r].as
return t},
fA(a){var t,s,r,q,p,o=a.length
for(t="",s="",r=0;r<o;r+=3,s=","){q=a[r]
p=a[r+1]?"!":":"
t+=s+q+p+a[r+2].as}return t},
bp(a,b,c){var t,s,r,q=b
if(c.length>0)q+="<"+A.bo(c)+">"
t=a.eC.get(q)
if(t!=null)return t
s=new A.Y(null,null)
s.w=8
s.x=b
s.y=c
if(c.length>0)s.c=c[0]
s.as=q
r=A.ai(a,s)
a.eC.set(q,r)
return r},
dy(a,b,c){var t,s,r,q,p,o
if(b.w===9){t=b.x
s=b.y.concat(c)}else{s=c
t=b}r=t.as+(";<"+A.bo(s)+">")
q=a.eC.get(r)
if(q!=null)return q
p=new A.Y(null,null)
p.w=9
p.x=t
p.y=s
p.as=r
o=A.ai(a,p)
a.eC.set(r,o)
return o},
ep(a,b,c){var t,s,r="+"+(b+"("+A.bo(c)+")"),q=a.eC.get(r)
if(q!=null)return q
t=new A.Y(null,null)
t.w=10
t.x=b
t.y=c
t.as=r
s=A.ai(a,t)
a.eC.set(r,s)
return s},
em(a,b,c){var t,s,r,q,p,o=b.as,n=c.a,m=n.length,l=c.b,k=l.length,j=c.c,i=j.length,h="("+A.bo(n)
if(k>0){t=m>0?",":""
h+=t+"["+A.bo(l)+"]"}if(i>0){t=m>0?",":""
h+=t+"{"+A.fA(j)+"}"}s=o+(h+")")
r=a.eC.get(s)
if(r!=null)return r
q=new A.Y(null,null)
q.w=11
q.x=b
q.y=c
q.as=s
p=A.ai(a,q)
a.eC.set(s,p)
return p},
dz(a,b,c,d){var t,s=b.as+("<"+A.bo(c)+">"),r=a.eC.get(s)
if(r!=null)return r
t=A.fC(a,b,c,s,d)
a.eC.set(s,t)
return t},
fC(a,b,c,d,e){var t,s,r,q,p,o,n,m
if(e){t=c.length
s=A.dc(t)
for(r=0,q=0;q<t;++q){p=c[q]
if(p.w===1){s[q]=p;++r}}if(r>0){o=A.aw(a,b,s,0)
n=A.aQ(a,c,s,0)
return A.dz(a,o,n,c!==n)}}m=new A.Y(null,null)
m.w=12
m.x=b
m.y=c
m.as=d
return A.ai(a,m)},
fs(a,b,c,d){return{u:a,e:b,r:c,s:[],p:0,n:d}},
fy(a){var t,s,r,q,p,o,n,m=a.r,l=a.s
for(t=m.length,s=0;s<t;){r=m.charCodeAt(s)
if(r>=48&&r<=57)s=A.fu(s+1,r,m,l)
else if((((r|32)>>>0)-97&65535)<26||r===95||r===36||r===124)s=A.ej(a,s,m,l,!1)
else if(r===46)s=A.ej(a,s,m,l,!0)
else{++s
switch(r){case 44:break
case 58:l.push(!1)
break
case 33:l.push(!0)
break
case 59:l.push(A.av(a.u,a.e,l.pop()))
break
case 94:l.push(A.fE(a.u,l.pop()))
break
case 35:l.push(A.bq(a.u,5,"#"))
break
case 64:l.push(A.bq(a.u,2,"@"))
break
case 126:l.push(A.bq(a.u,3,"~"))
break
case 60:l.push(a.p)
a.p=l.length
break
case 62:A.fw(a,l)
break
case 38:A.fv(a,l)
break
case 63:q=a.u
l.push(A.eo(q,A.av(q,a.e,l.pop()),a.n))
break
case 47:q=a.u
l.push(A.en(q,A.av(q,a.e,l.pop()),a.n))
break
case 40:l.push(-3)
l.push(a.p)
a.p=l.length
break
case 41:A.ft(a,l)
break
case 91:l.push(a.p)
a.p=l.length
break
case 93:p=l.splice(a.p)
A.ek(a.u,a.e,p)
a.p=l.pop()
l.push(p)
l.push(-1)
break
case 123:l.push(a.p)
a.p=l.length
break
case 125:p=l.splice(a.p)
A.fz(a.u,a.e,p)
a.p=l.pop()
l.push(p)
l.push(-2)
break
case 43:o=m.indexOf("(",s)
l.push(m.substring(s,o))
l.push(-4)
l.push(a.p)
a.p=l.length
s=o+1
break
default:throw"Bad character "+r}}}n=l.pop()
return A.av(a.u,a.e,n)},
fu(a,b,c,d){var t,s,r=b-48
for(t=c.length;a<t;++a){s=c.charCodeAt(a)
if(!(s>=48&&s<=57))break
r=r*10+(s-48)}d.push(r)
return a},
ej(a,b,c,d,e){var t,s,r,q,p,o,n=b+1
for(t=c.length;n<t;++n){s=c.charCodeAt(n)
if(s===46){if(e)break
e=!0}else{if(!((((s|32)>>>0)-97&65535)<26||s===95||s===36||s===124))r=s>=48&&s<=57
else r=!0
if(!r)break}}q=c.substring(b,n)
if(e){t=a.u
p=a.e
if(p.w===9)p=p.x
o=A.fJ(t,p.x)[q]
if(o==null)A.n('No "'+q+'" in "'+A.fn(p)+'"')
d.push(A.db(t,p,o))}else d.push(q)
return n},
fw(a,b){var t,s=a.u,r=A.ei(a,b),q=b.pop()
if(typeof q=="string")b.push(A.bp(s,q,r))
else{t=A.av(s,a.e,q)
switch(t.w){case 11:b.push(A.dz(s,t,r,a.n))
break
default:b.push(A.dy(s,t,r))
break}}},
ft(a,b){var t,s,r,q=a.u,p=b.pop(),o=null,n=null
if(typeof p=="number")switch(p){case-1:o=b.pop()
break
case-2:n=b.pop()
break
default:b.push(p)
break}else b.push(p)
t=A.ei(a,b)
p=b.pop()
switch(p){case-3:p=b.pop()
if(o==null)o=q.sEA
if(n==null)n=q.sEA
s=A.av(q,a.e,p)
r=new A.c5()
r.a=t
r.b=o
r.c=n
b.push(A.em(q,s,r))
return
case-4:b.push(A.ep(q,b.pop(),t))
return
default:throw A.a(A.bx("Unexpected state under `()`: "+A.q(p)))}},
fv(a,b){var t=b.pop()
if(0===t){b.push(A.bq(a.u,1,"0&"))
return}if(1===t){b.push(A.bq(a.u,4,"1&"))
return}throw A.a(A.bx("Unexpected extended operation "+A.q(t)))},
ei(a,b){var t=b.splice(a.p)
A.ek(a.u,a.e,t)
a.p=b.pop()
return t},
av(a,b,c){if(typeof c=="string")return A.bp(a,c,a.sEA)
else if(typeof c=="number"){b.toString
return A.fx(a,b,c)}else return c},
ek(a,b,c){var t,s=c.length
for(t=0;t<s;++t)c[t]=A.av(a,b,c[t])},
fz(a,b,c){var t,s=c.length
for(t=2;t<s;t+=3)c[t]=A.av(a,b,c[t])},
fx(a,b,c){var t,s,r=b.w
if(r===9){if(c===0)return b.x
t=b.y
s=t.length
if(c<=s)return t[c-1]
c-=s
b=b.x
r=b.w}else if(c===0)return b
if(r!==8)throw A.a(A.bx("Indexed base must be an interface type"))
t=b.y
if(c<=t.length)return t[c-1]
throw A.a(A.bx("Bad index "+c+" for "+b.m(0)))},
hD(a,b,c){var t,s=b.d
if(s==null)s=b.d=new Map()
t=s.get(c)
if(t==null){t=A.y(a,b,null,c,null)
s.set(c,t)}return t},
y(a,b,c,d,e){var t,s,r,q,p,o,n,m,l,k,j
if(b===d)return!0
if(A.aA(d))return!0
t=b.w
if(t===4)return!0
if(A.aA(b))return!1
if(b.w===1)return!0
s=t===13
if(s)if(A.y(a,c[b.x],c,d,e))return!0
r=d.w
q=u.P
if(b===q||b===u.T){if(r===7)return A.y(a,b,c,d.x,e)
return d===q||d===u.T||r===6}if(d===u.K){if(t===7)return A.y(a,b.x,c,d,e)
return t!==6}if(t===7){if(!A.y(a,b.x,c,d,e))return!1
return A.y(a,A.dv(a,b),c,d,e)}if(t===6)return A.y(a,q,c,d,e)&&A.y(a,b.x,c,d,e)
if(r===7){if(A.y(a,b,c,d.x,e))return!0
return A.y(a,b,c,A.dv(a,d),e)}if(r===6)return A.y(a,b,c,q,e)||A.y(a,b,c,d.x,e)
if(s)return!1
q=t!==11
if((!q||t===12)&&d===u.Z)return!0
p=t===10
if(p&&d===u._)return!0
if(r===12){if(b===u.L)return!0
if(t!==12)return!1
o=b.y
n=d.y
m=o.length
if(m!==n.length)return!1
c=c==null?o:o.concat(c)
e=e==null?n:n.concat(e)
for(l=0;l<m;++l){k=o[l]
j=n[l]
if(!A.y(a,k,c,j,e)||!A.y(a,j,e,k,c))return!1}return A.ex(a,b.x,c,d.x,e)}if(r===11){if(b===u.L)return!0
if(q)return!1
return A.ex(a,b,c,d,e)}if(t===8){if(r!==8)return!1
return A.h6(a,b,c,d,e)}if(p&&r===10)return A.hb(a,b,c,d,e)
return!1},
ex(a2,a3,a4,a5,a6){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0,a1
if(!A.y(a2,a3.x,a4,a5.x,a6))return!1
t=a3.y
s=a5.y
r=t.a
q=s.a
p=r.length
o=q.length
if(p>o)return!1
n=o-p
m=t.b
l=s.b
k=m.length
j=l.length
if(p+k<o+j)return!1
for(i=0;i<p;++i){h=r[i]
if(!A.y(a2,q[i],a6,h,a4))return!1}for(i=0;i<n;++i){h=m[i]
if(!A.y(a2,q[p+i],a6,h,a4))return!1}for(i=0;i<j;++i){h=m[n+i]
if(!A.y(a2,l[i],a6,h,a4))return!1}g=t.c
f=s.c
e=g.length
d=f.length
for(c=0,b=0;b<d;b+=3){a=f[b]
for(;;){if(c>=e)return!1
a0=g[c]
c+=3
if(a<a0)return!1
a1=g[c-2]
if(a0<a){if(a1)return!1
continue}h=f[b+1]
if(a1&&!h)return!1
h=g[c-1]
if(!A.y(a2,f[b+2],a6,h,a4))return!1
break}}while(c<e){if(g[c+1])return!1
c+=3}return!0},
h6(a,b,c,d,e){var t,s,r,q,p,o=b.x,n=d.x
while(o!==n){t=a.tR[o]
if(t==null)return!1
if(typeof t=="string"){o=t
continue}s=t[n]
if(s==null)return!1
r=s.length
q=r>0?new Array(r):v.typeUniverse.sEA
for(p=0;p<r;++p)q[p]=A.db(a,b,s[p])
return A.es(a,q,null,c,d.y,e)}return A.es(a,b.y,null,c,d.y,e)},
es(a,b,c,d,e,f){var t,s=b.length
for(t=0;t<s;++t)if(!A.y(a,b[t],d,e[t],f))return!1
return!0},
hb(a,b,c,d,e){var t,s=b.y,r=d.y,q=s.length
if(q!==r.length)return!1
if(b.x!==d.x)return!1
for(t=0;t<q;++t)if(!A.y(a,s[t],c,r[t],e))return!1
return!0},
aS(a){var t=a.w,s=!0
if(!(a===u.P||a===u.T))if(!A.aA(a))if(t!==6)s=t===7&&A.aS(a.x)
return s},
aA(a){var t=a.w
return t===2||t===3||t===4||t===5||a===u.X},
er(a,b){var t,s,r=Object.keys(b),q=r.length
for(t=0;t<q;++t){s=r[t]
a[s]=b[s]}},
dc(a){return a>0?new Array(a):v.typeUniverse.sEA},
Y:function Y(a,b){var _=this
_.a=a
_.b=b
_.r=_.f=_.d=_.c=null
_.w=0
_.as=_.Q=_.z=_.y=_.x=null},
c5:function c5(){this.c=this.b=this.a=null},
d9:function d9(a){this.a=a},
c4:function c4(){},
bn:function bn(a){this.a=a},
el(a,b,c){return 0},
bm:function bm(a,b){var _=this
_.a=a
_.e=_.d=_.c=_.b=null
_.$ti=b},
aN:function aN(a,b){this.a=a
this.$ti=b},
dY(a,b){return new A.a1(a.i("@<0>").G(b).i("a1<1,2>"))},
i(a,b,c){return b.i("@<0>").G(c).i("dX<1,2>").a(A.hx(a,new A.a1(b.i("@<0>").G(c).i("a1<1,2>"))))},
G(a,b){return new A.a1(a.i("@<0>").G(b).i("a1<1,2>"))},
ds(a){return new A.ah(a.i("ah<0>"))},
l(a,b){return b.i("e_<0>").a(A.hy(a,new A.ah(b.i("ah<0>"))))},
dx(){var t=Object.create(null)
t["<non-identifier-key>"]=t
delete t["<non-identifier-key>"]
return t},
eh(a,b,c){var t=new A.au(a,b,c.i("au<0>"))
t.c=a.e
return t},
dZ(a,b,c){var t=A.dY(b,c)
a.I(0,new A.cQ(t,b,c))
return t},
bU(a,b,c){var t=A.dY(b,c)
t.O(0,a)
return t},
e0(a,b){var t,s,r=A.ds(b)
for(t=a.length,s=0;s<a.length;a.length===t||(0,A.bu)(a),++s)r.t(0,b.a(a[s]))
return r},
e1(a,b){var t=A.ds(b)
t.O(0,a)
return t},
cR(a){var t,s
if(A.dK(a))return"{...}"
t=new A.aM("")
try{s={}
B.a.t($.P,a)
t.a+="{"
s.a=!0
a.I(0,new A.cS(s,t))
t.a+="}"}finally{if(0>=$.P.length)return A.h($.P,-1)
$.P.pop()}s=t.a
return s.charCodeAt(0)==0?s:s},
ah:function ah(a){var _=this
_.a=0
_.f=_.e=_.d=_.c=_.b=null
_.r=0
_.$ti=a},
c8:function c8(a){this.a=a
this.b=null},
au:function au(a,b,c){var _=this
_.a=a
_.b=b
_.d=_.c=null
_.$ti=c},
cQ:function cQ(a,b,c){this.a=a
this.b=b
this.c=c},
H:function H(){},
L:function L(){},
cS:function cS(a,b){this.a=a
this.b=b},
br:function br(){},
aq:function aq(){},
be:function be(){},
ae:function ae(){},
bl:function bl(){},
aO:function aO(){},
hh(a,b){var t,s,r,q=null
try{q=JSON.parse(a)}catch(s){t=A.bv(s)
r=A.bG(String(t),null)
throw A.a(r)}r=A.de(q)
return r},
de(a){var t
if(a==null)return null
if(typeof a!="object")return a
if(!Array.isArray(a))return new A.c6(a,Object.create(null))
for(t=0;t<a.length;++t)a[t]=A.de(a[t])
return a},
dW(a,b,c){return new A.b_(a,b)},
fV(a){return a.bd()},
fq(a,b){return new A.d6(a,[],A.ht())},
fr(a,b,c){var t,s=new A.aM(""),r=A.fq(s,b)
r.aq(a)
t=s.a
return t.charCodeAt(0)==0?t:t},
c6:function c6(a,b){this.a=a
this.b=b
this.c=null},
c7:function c7(a){this.a=a},
bz:function bz(){},
bC:function bC(){},
b_:function b_(a,b){this.a=a
this.b=b},
bO:function bO(a,b){this.a=a
this.b=b},
cm:function cm(){},
co:function co(a){this.b=a},
cn:function cn(a){this.a=a},
d7:function d7(){},
d8:function d8(a,b){this.a=a
this.b=b},
d6:function d6(a,b,c){this.c=a
this.a=b
this.b=c},
ca(a){var t=A.fg(a,null)
if(t!=null)return t
throw A.a(A.bG(a,null))},
fe(a,b,c){var t,s
if(a>4294967295)A.n(A.aK(a,0,4294967295,"length",null))
t=A.e(new Array(a),c.i("p<0>"))
t.$flags=1
s=t
return s},
dt(a,b,c){var t,s=A.e([],c.i("p<0>"))
for(t=J.a8(a);t.n();)B.a.t(s,c.a(t.gq()))
if(b)return s
s.$flags=1
return s},
bV(a,b){var t,s
if(Array.isArray(a))return A.e(a.slice(0),b.i("p<0>"))
t=A.e([],b.i("p<0>"))
for(s=J.a8(a);s.n();)B.a.t(t,s.gq())
return t},
e2(a,b){var t=A.dt(a,!1,b)
t.$flags=3
return t},
ea(a){return new A.bM(a,A.dV(a,!1,!0,!1,!1,""))},
ed(a,b,c){var t=J.a8(b)
if(!t.n())return a
if(c.length===0){do a+=A.q(t.gq())
while(t.n())}else{a+=A.q(t.gq())
while(t.n())a=a+c+A.q(t.gq())}return a},
f8(a,b,c,d,e,f,g,h,i){var t="microsecond",s=A.fi(a,b,c,d,e,f,g,h,i)
if(s==null)return null
if(h>999)A.n(A.aK(h,0,999,t,null))
if(s<-864e13||s>864e13)A.n(A.aK(s,-864e13,864e13,"millisecondsSinceEpoch",null))
if(s===864e13&&h!==0)A.n(A.b(h,t,"Time including microseconds is outside valid range"))
return new A.ab(s,h,i)},
fa(a){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d=$.eI().bM(a)
if(d!=null){t=new A.cg()
s=d.b
if(1>=s.length)return A.h(s,1)
r=s[1]
r.toString
q=A.ca(r)
if(2>=s.length)return A.h(s,2)
r=s[2]
r.toString
p=A.ca(r)
if(3>=s.length)return A.h(s,3)
r=s[3]
r.toString
o=A.ca(r)
if(4>=s.length)return A.h(s,4)
n=t.$1(s[4])
if(5>=s.length)return A.h(s,5)
m=t.$1(s[5])
if(6>=s.length)return A.h(s,6)
l=t.$1(s[6])
if(7>=s.length)return A.h(s,7)
k=new A.ch().$1(s[7])
j=B.c.b2(k,1000)
r=s.length
if(8>=r)return A.h(s,8)
i=s[8]!=null
if(i){if(9>=r)return A.h(s,9)
h=s[9]
if(h!=null){g=h==="-"?-1:1
if(10>=r)return A.h(s,10)
r=s[10]
r.toString
f=A.ca(r)
if(11>=s.length)return A.h(s,11)
m-=g*(t.$1(s[11])+60*f)}}e=A.f8(q,p,o,n,m,l,j,k%1000,i)
if(e==null)throw A.a(A.bG("Time out of range",a))
return e}else throw A.a(A.bG("Invalid date format",a))},
dR(a){var t=Math.abs(a),s=a<0?"-":""
if(t>=1000)return""+a
if(t>=100)return s+"0"+t
if(t>=10)return s+"00"+t
return s+"000"+t},
f9(a){var t=Math.abs(a),s=a<0?"-":"+"
if(t>=1e5)return s+t
return s+"0"+t},
cf(a){if(a>=100)return""+a
if(a>=10)return"0"+a
return"00"+a},
a0(a){if(a>=10)return""+a
return"0"+a},
bE(a){if(typeof a=="number"||A.dE(a)||a==null)return J.al(a)
if(typeof a=="string")return JSON.stringify(a)
return A.fh(a)},
bx(a){return new A.bw(a)},
m(a){return new A.J(!1,null,null,a)},
b(a,b,c){return new A.J(!0,a,b,c)},
fj(a,b){return new A.ba(null,null,!0,a,b,"Value not in range")},
aK(a,b,c,d,e){return new A.ba(b,c,!0,a,d,"Invalid value")},
fl(a,b,c){if(0>a||a>c)throw A.a(A.aK(a,0,c,"start",null))
if(b!=null){if(a>b||b>c)throw A.a(A.aK(b,a,c,"end",null))
return b}return c},
fk(a,b){if(a<0)throw A.a(A.aK(a,0,null,b,null))
return a},
dT(a,b,c,d){return new A.bH(b,!0,a,d,"Index out of range")},
dw(a){return new A.bf(a)},
ec(a){return new A.aL(a)},
U(a){return new A.bA(a)},
bG(a,b){return new A.cj(a,b)},
fc(a,b,c){var t,s
if(A.dK(a)){if(b==="("&&c===")")return"(...)"
return b+"..."+c}t=A.e([],u.s)
B.a.t($.P,a)
try{A.hf(a,t)}finally{if(0>=$.P.length)return A.h($.P,-1)
$.P.pop()}s=A.ed(b,u.W.a(t),", ")+c
return s.charCodeAt(0)==0?s:s},
dp(a,b,c){var t,s
if(A.dK(a))return b+"..."+c
t=new A.aM(b)
B.a.t($.P,a)
try{s=t
s.a=A.ed(s.a,a,", ")}finally{if(0>=$.P.length)return A.h($.P,-1)
$.P.pop()}t.a+=c
s=t.a
return s.charCodeAt(0)==0?s:s},
hf(a,b){var t,s,r,q,p,o,n,m=a.gv(a),l=0,k=0
for(;;){if(!(l<80||k<3))break
if(!m.n())return
t=A.q(m.gq())
B.a.t(b,t)
l+=t.length+2;++k}if(!m.n()){if(k<=5)return
if(0>=b.length)return A.h(b,-1)
s=b.pop()
if(0>=b.length)return A.h(b,-1)
r=b.pop()}else{q=m.gq();++k
if(!m.n()){if(k<=4){B.a.t(b,A.q(q))
return}s=A.q(q)
if(0>=b.length)return A.h(b,-1)
r=b.pop()
l+=s.length+2}else{p=m.gq();++k
for(;m.n();q=p,p=o){o=m.gq();++k
if(k>100){for(;;){if(!(l>75&&k>3))break
if(0>=b.length)return A.h(b,-1)
l-=b.pop().length+2;--k}B.a.t(b,"...")
return}}r=A.q(q)
s=A.q(p)
l+=s.length+r.length+4}}if(k>b.length+2){l+=5
n="..."}else n=null
for(;;){if(!(l>80&&b.length>3))break
if(0>=b.length)return A.h(b,-1)
l-=b.pop().length+2
if(n==null){l+=5
n="..."}}if(n!=null)B.a.t(b,n)
B.a.t(b,r)
B.a.t(b,s)},
ff(a,b){var t=B.c.gD(a)
b=B.c.gD(b)
b=A.fp(A.ee(A.ee($.eT(),t),b))
return b},
ab:function ab(a,b,c){this.a=a
this.b=b
this.c=c},
cg:function cg(){},
ch:function ch(){},
d4:function d4(){},
t:function t(){},
bw:function bw(a){this.a=a},
bd:function bd(){},
J:function J(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
ba:function ba(a,b,c,d,e,f){var _=this
_.e=a
_.f=b
_.a=c
_.b=d
_.c=e
_.d=f},
bH:function bH(a,b,c,d,e){var _=this
_.f=a
_.a=b
_.b=c
_.c=d
_.d=e},
bf:function bf(a){this.a=a},
aL:function aL(a){this.a=a},
bA:function bA(a){this.a=a},
bc:function bc(){},
d5:function d5(a){this.a=a},
cj:function cj(a,b){this.a=a
this.b=b},
d:function d(){},
X:function X(a,b,c){this.a=a
this.b=b
this.$ti=c},
b8:function b8(){},
j:function j(){},
aM:function aM(a){this.a=a},
hI(a){var t,s,r
for(t=0,s=0;s<2;++s){r=a[s]
if(r<=0||r==1/0||r==-1/0)A.n(A.b(r,"resistanceOhm","doit \xeatre strictement positif"))
t+=r}return t},
dG(a,b,c){var t
A.u("calibre",b)
A.u("divisionsTotal",c)
if(a<0)return B.H
t=a*c/b
if(t>c*1.000000001)return new A.b3(c,!0,!1)
return new A.b3(t>c?c:t,!1,!1)},
b3:function b3(a,b,c){this.a=a
this.b=b
this.c=c},
cU:function cU(){},
bP:function bP(a){this.a=a},
cp:function cp(a){this.a=a},
cV:function cV(){},
b4:function b4(a,b,c,d,e){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e},
bh:function bh(a,b,c,d,e,f,g){var _=this
_.a=a
_.c=b
_.d=c
_.e=d
_.f=e
_.r=f
_.w=g},
aI:function aI(a){this.a=a},
cs:function cs(a){this.a=a},
cr:function cr(a,b){this.a=a
this.b=b},
ct:function ct(a,b){this.a=a
this.b=b},
cu:function cu(a){this.a=a},
cv:function cv(a,b){this.a=a
this.b=b},
cw:function cw(a,b){this.a=a
this.b=b},
cq:function cq(){},
cx:function cx(a,b){this.a=a
this.b=b},
cy:function cy(a,b){this.a=a
this.b=b},
cz:function cz(a,b){this.a=a
this.b=b},
cA:function cA(a,b){this.a=a
this.b=b},
cC:function cC(a,b){this.a=a
this.b=b},
cD:function cD(a,b){this.a=a
this.b=b},
cB:function cB(a){this.a=a},
cW:function cW(){},
b0:function b0(a){this.a=a},
cE:function cE(a,b){this.a=a
this.b=b},
cF:function cF(a){this.a=a},
cX:function cX(){},
cd:function cd(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
b1:function b1(a){this.a=a},
cG:function cG(){},
cH:function cH(){},
cI:function cI(a){this.a=a},
cY:function cY(){},
ce:function ce(a,b,c,d,e,f,g){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e
_.f=f
_.r=g},
b2:function b2(a){this.a=a},
cJ:function cJ(a){this.a=a},
cK:function cK(a,b){this.a=a
this.b=b},
cL:function cL(a){this.a=a},
bQ:function bQ(a){this.a=a},
cM:function cM(a){this.a=a},
cN:function cN(a){this.a=a},
bR:function bR(a){this.a=a},
cO:function cO(a){this.a=a},
bD:function bD(a,b){this.a=a
this.b=b},
hF(a){var t,s
for(t=0;t<3;++t){s=B.O[t]
if(s.b===a)return s}throw A.a(A.b(a,"niveau","attendu : information, avertissement ou validation"))},
fb(a){var t,s,r,q,p,o,n,m
if(a.gp(a)!==B.n.gp(B.n)||!a.gF().ap(0).bE(B.n))throw A.a(A.m("D\xe9finition invalide : les champs attendus sont "+B.n.m(0)+"."))
t=A.k(a.h(0,"id"))
A.k(a.h(0,"matiere"))
A.k(a.h(0,"niveau"))
s=u.j
r=J.dm(s.a(a.h(0,"materiel")),u.N)
q=A.e([],u.x)
for(p=u.c,o=J.dm(s.a(a.h(0,"securite")),p),n=o.$ti,o=new A.K(o,o.gp(0),n.i("K<H.E>")),n=n.i("H.E");o.n();){m=o.d
if(m==null)m=n.a(m)
q.push(new A.bZ(A.k(m.h(0,"regle_id")),A.k(m.h(0,"avant")),A.k(m.h(0,"exige")),A.k(m.h(0,"message"))))}o=A.e([],u.t)
for(s=J.dm(s.a(a.h(0,"conseils")),p),p=s.$ti,s=new A.K(s,s.gp(0),p.i("K<H.E>")),p=p.i("H.E");s.n();){n=s.d
if(n==null)n=p.a(n)
o.push(new A.bB(A.k(n.h(0,"quand")),A.hF(A.k(n.h(0,"niveau"))),A.k(n.h(0,"message"))))}return new A.ci(t,r,q,o,A.k(a.h(0,"calcul")))},
S(a,b){var t=a.h(0,b)
if(typeof t!="string"||t.length===0)throw A.a(A.b(t,b,"texte attendu"))
return t},
ak(a,b){var t=a.h(0,b)
if(typeof t!="number"||isNaN(t)||t==1/0||t==-1/0)throw A.a(A.b(t,b,"nombre attendu"))
return t},
fU(a,b){return B.a.E(a,new A.df(b))},
dj(a,b,c){var t=A.ak(a,b)
if(!A.fU(c,t))throw A.a(A.b(t,b,"valeur non propos\xe9e par l'appareil ("+A.q(c)+")"))
return t},
bF:function bF(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
aJ:function aJ(a,b){this.a=a
this.b=b},
bB:function bB(a,b,c){this.a=a
this.b=b
this.c=c},
bZ:function bZ(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
ci:function ci(a,b,c,d,e){var _=this
_.a=a
_.d=b
_.e=c
_.f=d
_.r=e},
B:function B(a,b,c,d,e){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e},
ac:function ac(a,b,c,d,e,f,g){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e
_.f=f
_.r=g},
c_:function c_(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
df:function df(a){this.a=a},
bS:function bS(){},
hg(a){var t,s,r,q,p,o,n,m="calibre_a",l="tension_max_v",k=u.N,j=u.X,i=A.G(k,j)
if(a instanceof A.aI){i.j(0,m,B.e)
i.j(0,"calibre_v",B.q)
i.j(0,l,12)}else if(a instanceof A.b2){i.j(0,"sensibilites",B.l)
i.j(0,"bases_temps",B.r)
i.j(0,"frequence_min_hz",50)
i.j(0,"frequence_max_hz",2000)
i.j(0,l,12)
i.j(0,"demi_hauteur_div",4)
i.j(0,"largeur_div",10)}else if(a instanceof A.b1)i.j(0,"longueur_banc_cm",100)
else if(a instanceof A.b0){i.j(0,m,B.e)
i.j(0,"rheostat_max_ohm",330)
i.j(0,l,12)}t=a.a
s=a.gN()
s=A.bV(s,A.f(s).c)
B.a.ar(s)
r=a.gK()
r=A.bV(r,A.f(r).c)
B.a.ar(r)
q=A.G(k,u.a)
for(p=a.gZ().gan(),p=p.gv(p);p.n();){o=p.gq()
n=o.a
o=o.b
o=A.bV(o,A.f(o).c)
B.a.ar(o)
q.j(0,n,o)}return A.i(["id",t.a,"materiel",t.d,"actions",s,"grandeurs",r,"emplacements",q,"options",i],k,j)},
bt(a8,a9){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0,a1,a2=null,a3="electrode_b",a4="electrode_a",a5=a9.b,a6=a9.c,a7=A.e([],u.A)
for(t=a9.d,s=t.length,r=u.N,q=u.K,p=0;p<s;++p){o=t[p]
a7.push(A.i(["grandeur",o.a,"saisie",o.b,"unite",o.c],r,q))}t=A.e([],u.q)
for(s=a8.bD(a9),n=s.length,p=0;p<s.length;s.length===n||(0,A.bu)(s),++p){m=s[p]
t.push(A.i(["quand",m.a,"niveau",m.b.b,"message",m.c],r,r))}s=u.X
l=A.i(["rang",a9.a,"termine",a9.r,"tempsS",a9.f,"materiel",a5,"reglages",a6,"mesures",a7,"conseils",t,"erreurs",a8.a_(a9),"resultat",a8.a3(a9)],r,s)
if(a8 instanceof A.aI){k=A.G(r,s)
for(a7=a5.gF(),a7=a7.gv(a7);a7.n();){t=a7.gq()
j=a8.af(a9,t)
q=j.a
if(q==null)continue
i=a6.h(0,"calibre_"+t)
n=typeof i=="number"?i:a2
k.j(0,t,A.i(["valeur",q,"affichage",j.b,"aiguilleDiv",j.c,"horsEchelle",j.d,"sensInverse",j.e,"calibre",n,"emplacement",a5.h(0,t)],r,s))}l.j(0,"appareils",k)}else if(a8 instanceof A.b2){h=a8.U(a9)
a5=a9.k("sensibilite_v_par_div")
a5.toString
a6=a9.k("base_temps_s_par_div")
a6.toString
a7=a9.k("frequence_gbf_hz")
a7.toString
t=u.p
g=A.e([],t)
q=h.c
if(!q){a5=u.n
B.a.O(g,A.e([A.e([0,0],a5),A.e([10,0],a5)],t))}else if(h.a==="alimentation"){a5=h.e
a6=u.n
B.a.O(g,A.e([A.e([0,a5],a6),A.e([10,a5],a6)],t))}else for(t=6.283185307179586*a7,n=u.n,f=a7>0,e=h.d,d=0;d<=400;++d){c=d*10/400
if(!(e>=0)||e==1/0||e==-1/0)A.n(A.b(e,"valeurMaximaleV","doit \xeatre positif ou nul"))
if(!f||a7==1/0||a7==-1/0)A.n(A.b(a7,"frequenceHz","doit \xeatre strictement positif"))
B.a.t(g,A.e([c,e*Math.sin(t*(c*a6))/a5],n))}l.j(0,"ecran",A.i(["source",h.a,"couplage",h.b,"signalPresent",q,"amplitudeV",h.d,"deviationDiv",h.e,"divisionsParPeriode",h.f,"traceVisible",h.r,"trace",g],r,s))}else if(a8 instanceof A.b1){h=a8.U(a9)
a6=a5.l("objet_lumineux")?a9.k("position_objet_lumineux_cm"):a2
a7=a5.l("lentille_convergente")?a9.k("position_lentille_convergente_cm"):a2
t=a5.l("ecran")?a9.k("position_ecran_cm"):a2
l.j(0,"banc",A.i(["oaCm",h.a,"oaPrimeCm",h.b,"positionImageCm",h.c,"nette",h.d,"objet",a6,"lentille",a7,"ecran",t,"miroir",a5.h(0,"miroir_plan")==="derriere_lentille"],r,s))}else if(a8 instanceof A.bP){b=a8.b0(a9)
a6=a9.k("volume_verse_ml")
if(a6==null)a6=0
if(a5.l("phenolphtaleine")&&b!=null)a7=b>=8.2?"rose":"incolore"
else a7=a2
t=a9.ao("debit")
if(t==null)t="ferme"
q=a9.k("volume_acide_ml")
if(q==null)q=0
l.j(0,"dosage",A.i(["volumeMl",a6,"ph",b,"couleur",a7,"debit",t,"volumeAcideMl",q,"soude",a5.l("soude"),"burette",a5.l("burette"),"erlenmeyer",a5.l("erlenmeyer"),"lunettes",a5.l("lunettes"),"buretteMl",25],r,s))}else if(a8 instanceof A.bQ){a7=A.G(r,u.f)
for(p=0;p<4;++p){a=B.f[p]
t=a5.h(0,a)
q=a8.bc(a9,a)
i=a6.h(0,"debut_"+a)
a7.j(0,a,A.i(["solution",t,"longueurCm",q,"tranches",(typeof i=="number"?i:a2)!=null],r,s))}l.j(0,"tubes",a7)}else if(a8 instanceof A.bR){a6=a5.l("terre")
a5=a5.l("eau")
a7=a9.k("agitation_s")
if(a7==null)a7=0
l.j(0,"bocal",A.i(["terre",a6,"eau",a5,"agitationS",a7,"fraction",a8.a2(a9),"sable",a8.a2(a9)*4.8,"limon",a8.a2(a9)*1.9,"argile",a8.a2(a9)*3.2],r,q))}else if(a8 instanceof A.b0){d=a8.am(a9)
if(a5.l("amperemetre")){a6=a9.k("calibre_amperemetre")
a6.toString
a8=A.dG(d,a6,100)}else a8=a2
a0=a5.h(0,a3)==="droite"?1:-1
a1=a5.h(0,a4)==="droite"?1:-1
a6=a9.k("progression_cuivre")
if(a6==null)a6=0
a7=a9.k("progression_permanganate")
if(a7==null)a7=0
t=a8==null
q=t?a2:a8.a
t=t?a2:a8.b
l.j(0,"papier",A.i(["courantA",d,"positionCuivre",a6*a0,"positionPermanganate",a7*a1,"aiguilleDiv",q,"horsEchelle",t===!0,"cuivreDepose",a5.l("cristal_sulfate_cuivre"),"permanganateDepose",a5.l("cristal_permanganate"),"electrodeA",a5.h(0,a4),"electrodeB",a5.h(0,a3)],r,s))}return l},
fK(a,b,c){var t,s,r,q,p,o,n,m,l,k,j=null,i=$.dF
i.toString
t=i
try{i=$.a6
i.toString
p=u.N
o=u.X
s=t.bC(i,a,A.dZ(u.G.a(B.d.b8(b,j)),p,o),A.fa(c).be())
$.a6=s.a
i=s.c
n=s.d
m=s.b.bd()
l=$.a6
l.toString
o=B.d.a8(A.i(["bloquee",i,"message",n,"evenement",m,"vue",A.bt(t,l)],p,o),j)
return o}catch(k){i=A.bv(k)
if(i instanceof A.J){r=i
i=J.al(r)
p=$.a6
p.toString
return B.d.a8(A.i(["erreurInterface",i,"vue",A.bt(t,p)],u.N,u.X),j)}else if(i instanceof A.aL){q=i
i=q.a
p=$.a6
p.toString
return B.d.a8(A.i(["erreurInterface",i,"vue",A.bt(t,p)],u.N,u.X),j)}else throw k}},
fR(a){var t,s,r,q,p=$.dF
p.toString
t=p
try{p=$.a6
p.toString
p=t.ak(p,Math.max(0,a))
$.a6=p
p=B.d.a8(A.i(["vue",A.bt(t,p)],u.N,u.X),null)
return p}catch(r){p=A.bv(r)
if(p instanceof A.J){s=p
p=J.al(s)
q=$.a6
q.toString
return B.d.a8(A.i(["erreurInterface",p,"vue",A.bt(t,q)],u.N,u.X),null)}else throw r}},
hE(){var t,s,r={}
r.creer=A.ew(new A.dg())
t=new A.dh()
if(typeof t=="function")A.n(A.m("Attempting to rewrap a JS function."))
s=function(a,b){return function(c,d,e){return a(b,c,d,e,arguments.length)}}(A.fT,t)
s[$.dl()]=t
r.appliquer=s
r.avancer=A.ew(new A.di())
v.G.LaboCore=r},
dg:function dg(){},
dh:function dh(){},
di:function di(){},
eF(a){return v.mangledGlobalNames[a]},
hM(a){throw A.E(new A.bT("Field '"+a+"' has been assigned during initialization."),new Error())},
ew(a){var t
if(typeof a=="function")throw A.a(A.m("Attempting to rewrap a JS function."))
t=function(b,c){return function(d){return b(c,d,arguments.length)}}(A.fS,a)
t[$.dl()]=a
return t},
fS(a,b,c){u.Z.a(a)
if(A.aP(c)>=1)return a.$1(b)
return a.$0()},
fT(a,b,c,d,e){u.Z.a(a)
A.aP(e)
if(e>=3)return a.$3(b,c,d)
if(e===2)return a.$2(b,c)
if(e===1)return a.$1(b)
return a.$0()},
hv(a){var t,s=a.r
switch(s){case"electricite":t=a.a
if(!B.a8.u(0,t)||s!=="electricite")A.n(A.m("LaboElectricite ne g\xe8re pas "+t+" ("+s+")."))
return new A.aI(a)
case"oscilloscope":t=a.a
if(t!=="oscilloscope_tension"||s!=="oscilloscope")A.n(A.m("LaboOscilloscope ne g\xe8re pas "+t+" ("+s+")."))
return new A.b2(a)
case"optique":t=a.a
if(t!=="focale_lentille"||s!=="optique")A.n(A.m("LaboOptique ne g\xe8re pas "+t+" ("+s+")."))
return new A.b1(a)
case"migration_ions":t=a.a
if(t!=="migration_ions"||s!=="migration_ions")A.n(A.m("LaboMigration ne g\xe8re pas "+t+" ("+s+")."))
return new A.b0(a)
case"titrage":t=a.a
if(t!=="titrage_acide_base"||s!=="titrage")A.n(A.m("LaboDosage ne g\xe8re pas "+t+"."))
return new A.bP(a)
case"svt_osmose":t=a.a
if(t!=="osmose_pomme_de_terre"||s!=="svt_osmose")A.n(A.m("LaboOsmose ne g\xe8re pas "+t+"."))
return new A.bQ(a)
case"svt_sol":t=a.a
if(t!=="sol_constituants"||s!=="svt_sol")A.n(A.m("LaboSol ne g\xe8re pas "+t+"."))
return new A.bR(a)}throw A.a(A.b(s,"calcul","moteur de calcul inconnu"))},
hG(a,b){var t
A.u("fPrimeCm",a)
if(!(b<0))throw A.a(A.b(b,"oaCm","doit \xeatre n\xe9gatif (objet r\xe9el devant la lentille)"))
t=1/b+1/a
if(Math.abs(t)<1e-12)return null
return 1/t},
cb(a){var t,s,r=a.length
if(r===0)throw A.a(A.m("Il faut au moins une valeur."))
for(t=0,s=0;s<r;++s)t+=a[s]
return t/r},
u(a,b){if(!(b>0)||b==1/0||b==-1/0)throw A.a(A.b(b,a,"doit \xeatre strictement positif"))},
ay(a,b){if(!(b>=0)||b==1/0||b==-1/0)throw A.a(A.b(b,a,"doit \xeatre positif ou nul"))}},B={}
var w=[A,J,B]
var $={}
A.dq.prototype={}
J.bI.prototype={
ab(a,b){return a===b},
gD(a){return A.bX(a)},
m(a){return"Instance of '"+A.bY(a)+"'"},
ga4(a){return A.ax(A.dD(this))}}
J.bK.prototype={
m(a){return String(a)},
gD(a){return a?519018:218159},
ga4(a){return A.ax(u.y)},
$ia2:1,
$ir:1}
J.aY.prototype={
ab(a,b){return null==b},
m(a){return"null"},
gD(a){return 0},
$ia2:1}
J.aH.prototype={$iaG:1}
J.ad.prototype={
gD(a){return 0},
m(a){return String(a)}}
J.d_.prototype={}
J.af.prototype={}
J.aZ.prototype={
m(a){var t=a[$.eH()]
if(t==null)t=a[$.dl()]
if(t==null)return this.bk(a)
return"JavaScript function for "+J.al(t)},
$iaE:1}
J.p.prototype={
al(a,b){return new A.a_(a,A.N(a).i("@<1>").G(b).i("a_<1,2>"))},
t(a,b){A.N(a).c.a(b)
a.$flags&1&&A.dk(a,29)
a.push(b)},
O(a,b){var t
A.N(a).i("d<1>").a(b)
a.$flags&1&&A.dk(a,"addAll",2)
if(Array.isArray(b)){this.bm(a,b)
return}for(t=J.a8(b);t.n();)a.push(t.gq())},
bm(a,b){var t,s
u.b.a(b)
t=b.length
if(t===0)return
if(a===b)throw A.a(A.U(a))
for(s=0;s<t;++s)a.push(b[s])},
R(a,b){if(!(b>=0&&b<a.length))return A.h(a,b)
return a[b]},
gba(a){if(a.length>0)return a[0]
throw A.a(A.dU())},
gaK(a){var t=a.length
if(t>0)return a[t-1]
throw A.a(A.dU())},
E(a,b){var t,s
A.N(a).i("r(1)").a(b)
t=a.length
for(s=0;s<t;++s){if(b.$1(a[s]))return!0
if(a.length!==t)throw A.a(A.U(a))}return!1},
a9(a,b){var t,s
A.N(a).i("r(1)").a(b)
t=a.length
for(s=0;s<t;++s){if(!b.$1(a[s]))return!1
if(a.length!==t)throw A.a(A.U(a))}return!0},
bj(a,b){var t,s,r,q,p,o=A.N(a)
o.i("a7(1,1)?").a(b)
a.$flags&2&&A.dk(a,"sort")
t=a.length
if(t<2)return
if(b==null)b=J.h3()
if(t===2){s=a[0]
r=a[1]
o=b.$2(s,r)
if(typeof o!=="number")return o.bW()
if(o>0){a[0]=r
a[1]=s}return}q=0
if(o.c.b(null))for(p=0;p<a.length;++p)if(a[p]===void 0){a[p]=null;++q}a.sort(A.hr(b,2))
if(q>0)this.bt(a,q)},
ar(a){return this.bj(a,null)},
bt(a,b){var t,s=a.length
for(;t=s-1,s>0;s=t)if(a[t]===null){a[t]=void 0;--b
if(b===0)break}},
u(a,b){var t
for(t=0;t<a.length;++t)if(J.v(a[t],b))return!0
return!1},
gC(a){return a.length===0},
gM(a){return a.length!==0},
m(a){return A.dp(a,"[","]")},
gv(a){return new J.am(a,a.length,A.N(a).i("am<1>"))},
gD(a){return A.bX(a)},
gp(a){return a.length},
h(a,b){if(!(b>=0&&b<a.length))throw A.a(A.dI(a,b))
return a[b]},
j(a,b,c){A.N(a).c.a(c)
a.$flags&2&&A.dk(a)
if(!(b>=0&&b<a.length))throw A.a(A.dI(a,b))
a[b]=c},
$io:1,
$id:1,
$iF:1}
J.bJ.prototype={
bS(a){var t,s,r
if(!Array.isArray(a))return null
t=a.$flags|0
if((t&4)!==0)s="const, "
else if((t&2)!==0)s="unmodifiable, "
else s=(t&1)!==0?"fixed, ":""
r="Instance of '"+A.bY(a)+"'"
if(s==="")return r
return r+" ("+s+"length: "+a.length+")"}}
J.ck.prototype={}
J.am.prototype={
gq(){var t=this.d
return t==null?this.$ti.c.a(t):t},
n(){var t,s=this,r=s.a,q=r.length
if(s.b!==q){r=A.bu(r)
throw A.a(r)}t=s.c
if(t>=q){s.d=null
return!1}s.d=r[t]
s.c=t+1
return!0},
$ix:1}
J.aF.prototype={
P(a,b){var t
A.dd(b)
if(a<b)return-1
else if(a>b)return 1
else if(a===b){if(a===0){t=this.gaJ(b)
if(this.gaJ(a)===t)return 0
if(this.gaJ(a))return-1
return 1}return 0}else if(isNaN(a)){if(isNaN(b))return 0
return 1}else return-1},
gaJ(a){return a===0?1/a<0:a<0},
bQ(a){if(a>0){if(a!==1/0)return Math.round(a)}else if(a>-1/0)return 0-Math.round(0-a)
throw A.a(A.dw(""+a+".round()"))},
aF(a,b,c){if(B.c.P(b,c)>0)throw A.a(A.hq(b))
if(this.P(a,b)<0)return b
if(this.P(a,c)>0)return c
return a},
m(a){if(a===0&&1/a<0)return"-0.0"
else return""+a},
gD(a){var t,s,r,q,p=a|0
if(a===p)return p&536870911
t=Math.abs(a)
s=Math.log(t)/0.6931471805599453|0
r=Math.pow(2,s)
q=t<1?t/r:r/t
return((q*9007199254740992|0)+(q*3542243181176521|0))*599197+s*1259&536870911},
bi(a,b){var t=a%b
if(t===0)return 0
if(t>0)return t
return t+b},
b2(a,b){return(a|0)===a?a/b|0:this.bw(a,b)},
bw(a,b){var t=a/b
if(t>=-2147483648&&t<=2147483647)return t|0
if(t>0){if(t!==1/0)return Math.floor(t)}else if(t>-1/0)return Math.ceil(t)
throw A.a(A.dw("Result of truncating division is "+A.q(t)+": "+A.q(a)+" ~/ "+b))},
b1(a,b){var t
if(a>0)t=this.bv(a,b)
else{t=b>31?31:b
t=a>>t>>>0}return t},
bv(a,b){return b>31?0:a>>>b},
ga4(a){return A.ax(u.H)},
$iT:1,
$iA:1,
$iI:1}
J.aX.prototype={
ga4(a){return A.ax(u.S)},
$ia2:1,
$ia7:1}
J.bL.prototype={
ga4(a){return A.ax(u.i)},
$ia2:1}
J.ao.prototype={
S(a,b){var t=b.length
if(t>a.length)return!1
return b===a.substring(0,t)},
ac(a,b,c){return a.substring(b,A.fl(b,c,a.length))},
P(a,b){var t
A.k(b)
if(a===b)t=0
else t=a<b?-1:1
return t},
m(a){return a},
gD(a){var t,s,r
for(t=a.length,s=0,r=0;r<t;++r){s=s+a.charCodeAt(r)&536870911
s=s+((s&524287)<<10)&536870911
s^=s>>6}s=s+((s&67108863)<<3)&536870911
s^=s>>11
return s+((s&16383)<<15)&536870911},
ga4(a){return A.ax(u.N)},
gp(a){return a.length},
$ia2:1,
$iT:1,
$icZ:1,
$ic:1}
A.ag.prototype={
gv(a){return new A.aT(J.a8(this.ga6()),A.f(this).i("aT<1,2>"))},
gp(a){return J.Q(this.ga6())},
gC(a){return J.eX(this.ga6())},
gM(a){return J.eY(this.ga6())},
m(a){return J.al(this.ga6())}}
A.aT.prototype={
n(){return this.a.n()},
gq(){return this.$ti.y[1].a(this.a.gq())},
$ix:1}
A.an.prototype={
ga6(){return this.a}}
A.bi.prototype={$io:1}
A.bg.prototype={
h(a,b){return this.$ti.y[1].a(J.aC(this.a,b))},
$io:1,
$iF:1}
A.a_.prototype={
al(a,b){return new A.a_(this.a,this.$ti.i("@<1>").G(b).i("a_<1,2>"))},
ga6(){return this.a}}
A.bT.prototype={
m(a){return"LateInitializationError: "+this.a}}
A.d0.prototype={}
A.o.prototype={}
A.Z.prototype={
gv(a){var t=this
return new A.K(t,t.gp(t),A.f(t).i("K<Z.E>"))},
gC(a){return this.gp(this)===0},
ap(a){var t,s=this,r=A.ds(A.f(s).i("Z.E"))
for(t=0;t<s.gp(s);++t)r.t(0,s.R(0,t))
return r}}
A.K.prototype={
gq(){var t=this.d
return t==null?this.$ti.c.a(t):t},
n(){var t,s=this,r=s.a,q=r.gp(r)
if(s.b!==q)throw A.a(A.U(r))
t=s.c
if(t>=q){s.d=null
return!1}s.d=r.R(0,t);++s.c
return!0},
$ix:1}
A.ar.prototype={
gp(a){return J.Q(this.a)},
R(a,b){return this.b.$1(J.eW(this.a,b))}}
A.D.prototype={
gv(a){return new A.a4(J.a8(this.a),this.b,this.$ti.i("a4<1>"))}}
A.a4.prototype={
n(){var t,s
for(t=this.a,s=this.b;t.n();)if(s.$1(t.gq()))return!0
return!1},
gq(){return this.a.gq()},
$ix:1}
A.bs.prototype={}
A.aV.prototype={}
A.aU.prototype={
gC(a){return this.gp(this)===0},
m(a){return A.cR(this)},
gan(){return new A.aN(this.bL(),A.f(this).i("aN<X<1,2>>"))},
bL(){var t=this
return function(){var s=0,r=1,q=[],p,o,n,m,l
return function $async$gan(a,b,c){if(b===1){q.push(c)
s=r}for(;;)switch(s){case 0:p=t.gF(),p=p.gv(p),o=A.f(t),n=o.y[1],o=o.i("X<1,2>")
case 2:if(!p.n()){s=3
break}m=p.gq()
l=t.h(0,m)
s=4
return a.b=new A.X(m,l==null?n.a(l):l,o),1
case 4:s=2
break
case 3:return 0
case 1:return a.c=q.at(-1),3}}}},
$iz:1}
A.w.prototype={
gp(a){return this.b.length},
gaZ(){var t=this.$keys
if(t==null){t=Object.keys(this.a)
this.$keys=t}return t},
l(a){if(typeof a!="string")return!1
if("__proto__"===a)return!1
return this.a.hasOwnProperty(a)},
h(a,b){if(!this.l(b))return null
return this.b[this.a[b]]},
I(a,b){var t,s,r,q
this.$ti.i("~(1,2)").a(b)
t=this.gaZ()
s=this.b
for(r=t.length,q=0;q<r;++q)b.$2(t[q],s[q])},
gF(){return new A.bj(this.gaZ(),this.$ti.i("bj<1>"))}}
A.bj.prototype={
gp(a){return this.a.length},
gC(a){return 0===this.a.length},
gM(a){return 0!==this.a.length},
gv(a){var t=this.a
return new A.at(t,t.length,this.$ti.i("at<1>"))}}
A.at.prototype={
gq(){var t=this.d
return t==null?this.$ti.c.a(t):t},
n(){var t=this,s=t.c
if(s>=t.b){t.d=null
return!1}t.d=t.a[s]
t.c=s+1
return!0},
$ix:1}
A.aW.prototype={
t(a,b){A.f(this).c.a(b)
A.f7()}}
A.aa.prototype={
gp(a){return this.b},
gC(a){return this.b===0},
gM(a){return this.b!==0},
gv(a){var t,s=this,r=s.$keys
if(r==null){r=Object.keys(s.a)
s.$keys=r}t=r
return new A.at(t,t.length,s.$ti.i("at<1>"))},
u(a,b){if(typeof b!="string")return!1
if("__proto__"===b)return!1
return this.a.hasOwnProperty(b)}}
A.bb.prototype={}
A.d1.prototype={
J(a){var t,s,r=this,q=new RegExp(r.a).exec(a)
if(q==null)return null
t=Object.create(null)
s=r.b
if(s!==-1)t.arguments=q[s+1]
s=r.c
if(s!==-1)t.argumentsExpr=q[s+1]
s=r.d
if(s!==-1)t.expr=q[s+1]
s=r.e
if(s!==-1)t.method=q[s+1]
s=r.f
if(s!==-1)t.receiver=q[s+1]
return t}}
A.b9.prototype={
m(a){return"Null check operator used on a null value"}}
A.bN.prototype={
m(a){var t,s=this,r="NoSuchMethodError: method not found: '",q=s.b
if(q==null)return"NoSuchMethodError: "+s.a
t=s.c
if(t==null)return r+q+"' ("+s.a+")"
return r+q+"' on '"+t+"' ("+s.a+")"}}
A.c3.prototype={
m(a){var t=this.a
return t.length===0?"Error":"Error: "+t}}
A.cT.prototype={
m(a){return"Throw of null ('"+(this.a===null?"null":"undefined")+"' from JavaScript)"}}
A.a9.prototype={
m(a){var t=this.constructor,s=t==null?null:t.name
return"Closure '"+A.eG(s==null?"unknown":s)+"'"},
$iaE:1,
gbV(){return this},
$C:"$1",
$R:1,
$D:null}
A.by.prototype={$C:"$2",$R:2}
A.c2.prototype={}
A.c1.prototype={
m(a){var t=this.$static_name
if(t==null)return"Closure of unknown static method"
return"Closure '"+A.eG(t)+"'"}}
A.aD.prototype={
ab(a,b){if(b==null)return!1
if(this===b)return!0
if(!(b instanceof A.aD))return!1
return this.$_target===b.$_target&&this.a===b.a},
gD(a){return(A.eE(this.a)^A.bX(this.$_target))>>>0},
m(a){return"Closure '"+this.$_name+"' of "+("Instance of '"+A.bY(this.a)+"'")}}
A.c0.prototype={
m(a){return"RuntimeError: "+this.a}}
A.a1.prototype={
gp(a){return this.a},
gC(a){return this.a===0},
gF(){return new A.V(this,A.f(this).i("V<1>"))},
gan(){return new A.ap(this,A.f(this).i("ap<1,2>"))},
l(a){var t,s
if(typeof a=="string"){t=this.b
if(t==null)return!1
return t[a]!=null}else if(typeof a=="number"&&(a&0x3fffffff)===a){s=this.c
if(s==null)return!1
return s[a]!=null}else return this.bN(a)},
bN(a){var t=this.d
if(t==null)return!1
return this.aH(this.aX(t,a),a)>=0},
O(a,b){A.f(this).i("z<1,2>").a(b).I(0,new A.cl(this))},
h(a,b){var t,s,r,q,p=null
if(typeof b=="string"){t=this.b
if(t==null)return p
s=t[b]
r=s==null?p:s.b
return r}else if(typeof b=="number"&&(b&0x3fffffff)===b){q=this.c
if(q==null)return p
s=q[b]
r=s==null?p:s.b
return r}else return this.bO(b)},
bO(a){var t,s,r=this.d
if(r==null)return null
t=this.aX(r,a)
s=this.aH(t,a)
if(s<0)return null
return t[s].b},
j(a,b,c){var t,s,r=this,q=A.f(r)
q.c.a(b)
q.y[1].a(c)
if(typeof b=="string"){t=r.b
r.aN(t==null?r.b=r.aC():t,b,c)}else if(typeof b=="number"&&(b&0x3fffffff)===b){s=r.c
r.aN(s==null?r.c=r.aC():s,b,c)}else r.bP(b,c)},
bP(a,b){var t,s,r,q,p=this,o=A.f(p)
o.c.a(a)
o.y[1].a(b)
t=p.d
if(t==null)t=p.d=p.aC()
s=p.bb(a)
r=t[s]
if(r==null)t[s]=[p.aD(a,b)]
else{q=p.aH(r,a)
if(q>=0)r[q].b=b
else r.push(p.aD(a,b))}},
I(a,b){var t,s,r=this
A.f(r).i("~(1,2)").a(b)
t=r.e
s=r.r
while(t!=null){b.$2(t.a,t.b)
if(s!==r.r)throw A.a(A.U(r))
t=t.c}},
aN(a,b,c){var t,s=A.f(this)
s.c.a(b)
s.y[1].a(c)
t=a[b]
if(t==null)a[b]=this.aD(b,c)
else t.b=c},
aD(a,b){var t=this,s=A.f(t),r=new A.cP(s.c.a(a),s.y[1].a(b))
if(t.e==null)t.e=t.f=r
else t.f=t.f.c=r;++t.a
t.r=t.r+1&1073741823
return r},
bb(a){return J.cc(a)&1073741823},
aX(a,b){return a[this.bb(b)]},
aH(a,b){var t,s
if(a==null)return-1
t=a.length
for(s=0;s<t;++s)if(J.v(a[s].a,b))return s
return-1},
m(a){return A.cR(this)},
aC(){var t=Object.create(null)
t["<non-identifier-key>"]=t
delete t["<non-identifier-key>"]
return t},
$idX:1}
A.cl.prototype={
$2(a,b){var t=this.a,s=A.f(t)
t.j(0,s.c.a(a),s.y[1].a(b))},
$S(){return A.f(this.a).i("~(1,2)")}}
A.cP.prototype={}
A.V.prototype={
gp(a){return this.a.a},
gC(a){return this.a.a===0},
gv(a){var t=this.a
return new A.b6(t,t.r,t.e,this.$ti.i("b6<1>"))}}
A.b6.prototype={
gq(){return this.d},
n(){var t,s=this,r=s.a
if(s.b!==r.r)throw A.a(A.U(r))
t=s.c
if(t==null){s.d=null
return!1}else{s.d=t.a
s.c=t.c
return!0}},
$ix:1}
A.b7.prototype={
gp(a){return this.a.a},
gC(a){return this.a.a===0},
gv(a){var t=this.a
return new A.W(t,t.r,t.e,this.$ti.i("W<1>"))}}
A.W.prototype={
gq(){return this.d},
n(){var t,s=this,r=s.a
if(s.b!==r.r)throw A.a(A.U(r))
t=s.c
if(t==null){s.d=null
return!1}else{s.d=t.b
s.c=t.c
return!0}},
$ix:1}
A.ap.prototype={
gp(a){return this.a.a},
gC(a){return this.a.a===0},
gv(a){var t=this.a
return new A.b5(t,t.r,t.e,this.$ti.i("b5<1,2>"))}}
A.b5.prototype={
gq(){var t=this.d
t.toString
return t},
n(){var t,s=this,r=s.a
if(s.b!==r.r)throw A.a(A.U(r))
t=s.c
if(t==null){s.d=null
return!1}else{s.d=new A.X(t.a,t.b,s.$ti.i("X<1,2>"))
s.c=t.c
return!0}},
$ix:1}
A.bM.prototype={
m(a){return"RegExp/"+this.a+"/"+this.b.flags},
gbr(){var t=this,s=t.c
if(s!=null)return s
s=t.b
return t.c=A.dV(t.a,s.multiline,!s.ignoreCase,s.unicode,s.dotAll,"g")},
bM(a){var t=this.b.exec(a)
if(t==null)return null
return new A.bk(t)},
aV(a,b){var t,s=this.gbr()
if(s==null)s=A.dB(s)
s.lastIndex=b
t=s.exec(a)
if(t==null)return null
return new A.bk(t)},
$icZ:1,
$ifm:1}
A.bk.prototype={
gb9(){var t=this.b
return t.index+t[0].length},
$idu:1}
A.d3.prototype={
gq(){var t=this.d
return t==null?u.F.a(t):t},
n(){var t,s,r,q,p,o,n=this,m=n.b
if(m==null)return!1
t=n.c
s=m.length
if(t<=s){r=n.a
q=r.aV(m,t)
if(q!=null){n.d=q
p=q.gb9()
if(q.b.index===p){t=!1
if(r.b.unicode){r=n.c
o=r+1
if(o<s){if(!(r>=0&&r<s))return A.h(m,r)
r=m.charCodeAt(r)
if(r>=55296&&r<=56319){if(!(o>=0))return A.h(m,o)
t=m.charCodeAt(o)
t=t>=56320&&t<=57343}}}p=(t?p+1:p)+1}n.c=p
return!0}}n.b=n.d=null
return!1},
$ix:1}
A.Y.prototype={
i(a){return A.db(v.typeUniverse,this,a)},
G(a){return A.fH(v.typeUniverse,this,a)}}
A.c5.prototype={}
A.d9.prototype={
m(a){return A.O(this.a,null)}}
A.c4.prototype={
m(a){return this.a}}
A.bn.prototype={}
A.bm.prototype={
gq(){var t=this.b
return t==null?this.$ti.c.a(t):t},
bu(a,b){var t,s,r
a=A.aP(a)
b=b
t=this.a
for(;;)try{s=t(this,a,b)
return s}catch(r){b=r
a=1}},
n(){var t,s,r,q,p=this,o=null,n=0
for(;;){t=p.d
if(t!=null)try{if(t.n()){p.b=t.gq()
return!0}else p.d=null}catch(s){o=s
n=1
p.d=null}r=p.bu(n,o)
if(1===r)return!0
if(0===r){p.b=null
q=p.e
if(q==null||q.length===0){p.a=A.el
return!1}if(0>=q.length)return A.h(q,-1)
p.a=q.pop()
n=0
o=null
continue}if(2===r){n=0
o=null
continue}if(3===r){o=p.c
p.c=null
q=p.e
if(q==null||q.length===0){p.b=null
p.a=A.el
throw o
return!1}if(0>=q.length)return A.h(q,-1)
p.a=q.pop()
n=1
continue}throw A.a(A.ec("sync*"))}return!1},
bX(a){var t,s,r=this
if(a instanceof A.aN){t=a.a()
s=r.e
if(s==null)s=r.e=[]
B.a.t(s,r.a)
r.a=t
return 2}else{r.d=J.a8(a)
return 2}},
$ix:1}
A.aN.prototype={
gv(a){return new A.bm(this.a(),this.$ti.i("bm<1>"))}}
A.ah.prototype={
gv(a){var t=this,s=new A.au(t,t.r,A.f(t).i("au<1>"))
s.c=t.e
return s},
gp(a){return this.a},
gC(a){return this.a===0},
gM(a){return this.a!==0},
u(a,b){var t,s
if(typeof b=="string"&&b!=="__proto__"){t=this.b
if(t==null)return!1
return u.g.a(t[b])!=null}else if(typeof b=="number"&&(b&1073741823)===b){s=this.c
if(s==null)return!1
return u.g.a(s[b])!=null}else return this.bp(b)},
bp(a){var t=this.d
if(t==null)return!1
return this.aW(t[this.aR(a)],a)>=0},
t(a,b){var t,s,r=this
A.f(r).c.a(b)
if(typeof b=="string"&&b!=="__proto__"){t=r.b
return r.aQ(t==null?r.b=A.dx():t,b)}else if(typeof b=="number"&&(b&1073741823)===b){s=r.c
return r.aQ(s==null?r.c=A.dx():s,b)}else return r.bl(b)},
bl(a){var t,s,r,q=this
A.f(q).c.a(a)
t=q.d
if(t==null)t=q.d=A.dx()
s=q.aR(a)
r=t[s]
if(r==null)t[s]=[q.az(a)]
else{if(q.aW(r,a)>=0)return!1
r.push(q.az(a))}return!0},
aQ(a,b){A.f(this).c.a(b)
if(u.g.a(a[b])!=null)return!1
a[b]=this.az(b)
return!0},
az(a){var t=this,s=new A.c8(A.f(t).c.a(a))
if(t.e==null)t.e=t.f=s
else t.f=t.f.b=s;++t.a
t.r=t.r+1&1073741823
return s},
aR(a){return J.cc(a)&1073741823},
aW(a,b){var t,s
if(a==null)return-1
t=a.length
for(s=0;s<t;++s)if(J.v(a[s].a,b))return s
return-1},
$ie_:1}
A.c8.prototype={}
A.au.prototype={
gq(){var t=this.d
return t==null?this.$ti.c.a(t):t},
n(){var t=this,s=t.c,r=t.a
if(t.b!==r.r)throw A.a(A.U(r))
else if(s==null){t.d=null
return!1}else{t.d=t.$ti.i("1?").a(s.a)
t.c=s.b
return!0}},
$ix:1}
A.cQ.prototype={
$2(a,b){this.a.j(0,this.b.a(a),this.c.a(b))},
$S:7}
A.H.prototype={
gv(a){return new A.K(this,this.gp(0),this.$ti.i("K<H.E>"))},
R(a,b){return this.$ti.y[1].a(J.aC(this.a,b))},
gC(a){return J.Q(this.a)===0},
gM(a){return J.Q(this.a)!==0},
u(a,b){var t,s,r=this.a,q=J.dJ(r),p=q.gp(r)
for(t=this.$ti.y[1],s=0;s<p;++s){if(J.v(t.a(q.h(r,s)),b))return!0
if(p!==q.gp(r))throw A.a(A.U(this))}return!1},
al(a,b){return new A.a_(this,this.$ti.i("@<H.E>").G(b).i("a_<1,2>"))},
m(a){return A.dp(this,"[","]")}}
A.L.prototype={
I(a,b){var t,s,r,q=A.f(this)
q.i("~(L.K,L.V)").a(b)
for(t=this.gF(),t=t.gv(t),q=q.i("L.V");t.n();){s=t.gq()
r=this.h(0,s)
b.$2(s,r==null?q.a(r):r)}},
gp(a){var t=this.gF()
return t.gp(t)},
gC(a){var t=this.gF()
return t.gC(t)},
m(a){return A.cR(this)},
$iz:1}
A.cS.prototype={
$2(a,b){var t,s=this.a
if(!s.a)this.b.a+=", "
s.a=!1
s=this.b
t=A.q(a)
s.a=(s.a+=t)+": "
t=A.q(b)
s.a+=t},
$S:4}
A.br.prototype={}
A.aq.prototype={
h(a,b){return this.a.h(0,b)},
l(a){return this.a.l(a)},
I(a,b){this.a.I(0,this.$ti.i("~(1,2)").a(b))},
gC(a){return this.a.a===0},
gp(a){return this.a.a},
gF(){var t=this.a
return new A.V(t,A.f(t).i("V<1>"))},
m(a){return A.cR(this.a)},
gan(){var t=this.a
return new A.ap(t,A.f(t).i("ap<1,2>"))},
$iz:1}
A.be.prototype={}
A.ae.prototype={
gC(a){return this.gp(this)===0},
gM(a){return this.gp(this)!==0},
O(a,b){var t
A.f(this).i("d<1>").a(b)
for(t=b.gv(b);t.n();)this.t(0,t.gq())},
bE(a){var t
for(t=a.gv(a);t.n();)if(!this.u(0,t.gq()))return!1
return!0},
m(a){return A.dp(this,"{","}")},
$io:1,
$id:1,
$ias:1}
A.bl.prototype={}
A.aO.prototype={}
A.c6.prototype={
h(a,b){var t,s=this.b
if(s==null)return this.c.h(0,b)
else if(typeof b!="string")return null
else{t=s[b]
return typeof t=="undefined"?this.bs(b):t}},
gp(a){return this.b==null?this.c.a:this.aj().length},
gC(a){return this.gp(0)===0},
gF(){if(this.b==null){var t=this.c
return new A.V(t,A.f(t).i("V<1>"))}return new A.c7(this)},
I(a,b){var t,s,r,q,p=this
u.cQ.a(b)
if(p.b==null)return p.c.I(0,b)
t=p.aj()
for(s=0;s<t.length;++s){r=t[s]
q=p.b[r]
if(typeof q=="undefined"){q=A.de(p.a[r])
p.b[r]=q}b.$2(r,q)
if(t!==p.c)throw A.a(A.U(p))}},
aj(){var t=u.l.a(this.c)
if(t==null)t=this.c=A.e(Object.keys(this.a),u.s)
return t},
bs(a){var t
if(!Object.prototype.hasOwnProperty.call(this.a,a))return null
t=A.de(this.a[a])
return this.b[a]=t}}
A.c7.prototype={
gp(a){return this.a.gp(0)},
R(a,b){var t=this.a
if(t.b==null)t=t.gF().R(0,b)
else{t=t.aj()
if(!(b>=0&&b<t.length))return A.h(t,b)
t=t[b]}return t},
gv(a){var t=this.a
if(t.b==null){t=t.gF()
t=t.gv(t)}else{t=t.aj()
t=new J.am(t,t.length,A.N(t).i("am<1>"))}return t}}
A.bz.prototype={}
A.bC.prototype={}
A.b_.prototype={
m(a){var t=A.bE(this.a)
return(this.b!=null?"Converting object to an encodable object failed:":"Converting object did not return an encodable object:")+" "+t}}
A.bO.prototype={
m(a){return"Cyclic error in JSON stringify"}}
A.cm.prototype={
b8(a,b){var t=A.hh(a,this.gbJ().a)
return t},
a8(a,b){var t=A.fr(a,this.gbK().b,null)
return t},
gbK(){return B.G},
gbJ(){return B.F}}
A.co.prototype={}
A.cn.prototype={}
A.d7.prototype={
bg(a){var t,s,r,q,p,o,n=a.length
for(t=this.c,s=0,r=0;r<n;++r){q=a.charCodeAt(r)
if(q>92){if(q>=55296){p=q&64512
if(p===55296){o=r+1
o=!(o<n&&(a.charCodeAt(o)&64512)===56320)}else o=!1
if(!o)if(p===56320){p=r-1
p=!(p>=0&&(a.charCodeAt(p)&64512)===55296)}else p=!1
else p=!0
if(p){if(r>s)t.a+=B.b.ac(a,s,r)
s=r+1
p=A.C(92)
t.a+=p
p=A.C(117)
t.a+=p
p=A.C(100)
t.a+=p
p=q>>>8&15
p=A.C(p<10?48+p:87+p)
t.a+=p
p=q>>>4&15
p=A.C(p<10?48+p:87+p)
t.a+=p
p=q&15
p=A.C(p<10?48+p:87+p)
t.a+=p}}continue}if(q<32){if(r>s)t.a+=B.b.ac(a,s,r)
s=r+1
p=A.C(92)
t.a+=p
switch(q){case 8:p=A.C(98)
t.a+=p
break
case 9:p=A.C(116)
t.a+=p
break
case 10:p=A.C(110)
t.a+=p
break
case 12:p=A.C(102)
t.a+=p
break
case 13:p=A.C(114)
t.a+=p
break
default:p=A.C(117)
t.a+=p
p=A.C(48)
t.a=(t.a+=p)+p
p=q>>>4&15
p=A.C(p<10?48+p:87+p)
t.a+=p
p=q&15
p=A.C(p<10?48+p:87+p)
t.a+=p
break}}else if(q===34||q===92){if(r>s)t.a+=B.b.ac(a,s,r)
s=r+1
p=A.C(92)
t.a+=p
p=A.C(q)
t.a+=p}}if(s===0)t.a+=a
else if(s<n)t.a+=B.b.ac(a,s,n)},
aw(a){var t,s,r,q
for(t=this.a,s=t.length,r=0;r<s;++r){q=t[r]
if(a==null?q==null:a===q)throw A.a(new A.bO(a,null))}B.a.t(t,a)},
aq(a){var t,s,r,q,p=this
if(p.bf(a))return
p.aw(a)
try{t=p.b.$1(a)
if(!p.bf(t)){r=A.dW(a,null,p.gb_())
throw A.a(r)}r=p.a
if(0>=r.length)return A.h(r,-1)
r.pop()}catch(q){s=A.bv(q)
r=A.dW(a,s,p.gb_())
throw A.a(r)}},
bf(a){var t,s,r=this
if(typeof a=="number"){if(!isFinite(a))return!1
r.c.a+=B.h.m(a)
return!0}else if(a===!0){r.c.a+="true"
return!0}else if(a===!1){r.c.a+="false"
return!0}else if(a==null){r.c.a+="null"
return!0}else if(typeof a=="string"){t=r.c
t.a+='"'
r.bg(a)
t.a+='"'
return!0}else if(u.j.b(a)){r.aw(a)
r.bT(a)
t=r.a
if(0>=t.length)return A.h(t,-1)
t.pop()
return!0}else if(u.G.b(a)){r.aw(a)
s=r.bU(a)
t=r.a
if(0>=t.length)return A.h(t,-1)
t.pop()
return s}else return!1},
bT(a){var t,s,r=this.c
r.a+="["
t=J.aR(a)
if(t.gM(a)){this.aq(t.h(a,0))
for(s=1;s<t.gp(a);++s){r.a+=","
this.aq(t.h(a,s))}}r.a+="]"},
bU(a){var t,s,r,q,p,o,n=this,m={}
if(a.gC(a)){n.c.a+="{}"
return!0}t=a.gp(a)*2
s=A.fe(t,null,u.X)
r=m.a=0
m.b=!0
a.I(0,new A.d8(m,s))
if(!m.b)return!1
q=n.c
q.a+="{"
for(p='"';r<t;r+=2,p=',"'){q.a+=p
n.bg(A.k(s[r]))
q.a+='":'
o=r+1
if(!(o<t))return A.h(s,o)
n.aq(s[o])}q.a+="}"
return!0}}
A.d8.prototype={
$2(a,b){var t,s
if(typeof a!="string")this.a.b=!1
t=this.b
s=this.a
B.a.j(t,s.a++,a)
B.a.j(t,s.a++,b)},
$S:4}
A.d6.prototype={
gb_(){var t=this.c.a
return t.charCodeAt(0)==0?t:t}}
A.ab.prototype={
ab(a,b){if(b==null)return!1
return b instanceof A.ab&&this.a===b.a&&this.b===b.b&&this.c===b.c},
gD(a){return A.ff(this.a,this.b)},
P(a,b){var t
u.k.a(b)
t=B.c.P(this.a,b.a)
if(t!==0)return t
return B.c.P(this.b,b.b)},
be(){var t=this
if(t.c)return t
return new A.ab(t.a,t.b,!0)},
m(a){var t=this,s=A.dR(A.bW(t)),r=A.a0(A.e8(t)),q=A.a0(A.e4(t)),p=A.a0(A.e5(t)),o=A.a0(A.e7(t)),n=A.a0(A.e9(t)),m=A.cf(A.e6(t)),l=t.b,k=l===0?"":A.cf(l)
l=s+"-"+r
if(t.c)return l+"-"+q+" "+p+":"+o+":"+n+"."+m+k+"Z"
else return l+"-"+q+" "+p+":"+o+":"+n+"."+m+k},
bR(){var t=this,s=A.bW(t)>=-9999&&A.bW(t)<=9999?A.dR(A.bW(t)):A.f9(A.bW(t)),r=A.a0(A.e8(t)),q=A.a0(A.e4(t)),p=A.a0(A.e5(t)),o=A.a0(A.e7(t)),n=A.a0(A.e9(t)),m=A.cf(A.e6(t)),l=t.b,k=l===0?"":A.cf(l)
l=s+"-"+r
if(t.c)return l+"-"+q+"T"+p+":"+o+":"+n+"."+m+k+"Z"
else return l+"-"+q+"T"+p+":"+o+":"+n+"."+m+k},
$iT:1}
A.cg.prototype={
$1(a){if(a==null)return 0
return A.ca(a)},
$S:5}
A.ch.prototype={
$1(a){var t,s,r
if(a==null)return 0
for(t=a.length,s=0,r=0;r<6;++r){s*=10
if(r<t){if(!(r<t))return A.h(a,r)
s+=a.charCodeAt(r)^48}}return s},
$S:5}
A.d4.prototype={
m(a){return this.aU()}}
A.t.prototype={}
A.bw.prototype={
m(a){var t=this.a
if(t!=null)return"Assertion failed: "+A.bE(t)
return"Assertion failed"}}
A.bd.prototype={}
A.J.prototype={
gaB(){return"Invalid argument"+(!this.a?"(s)":"")},
gaA(){return""},
m(a){var t=this,s=t.c,r=s==null?"":" ("+s+")",q=t.d,p=q==null?"":": "+q,o=t.gaB()+r+p
if(!t.a)return o
return o+t.gaA()+": "+A.bE(t.gaI())},
gaI(){return this.b}}
A.ba.prototype={
gaI(){return A.et(this.b)},
gaB(){return"RangeError"},
gaA(){var t,s=this.e,r=this.f
if(s==null)t=r!=null?": Not less than or equal to "+A.q(r):""
else if(r==null)t=": Not greater than or equal to "+A.q(s)
else if(r>s)t=": Not in inclusive range "+A.q(s)+".."+A.q(r)
else t=r<s?": Valid value range is empty":": Only valid value is "+A.q(s)
return t}}
A.bH.prototype={
gaI(){return A.aP(this.b)},
gaB(){return"RangeError"},
gaA(){if(A.aP(this.b)<0)return": index must not be negative"
var t=this.f
if(t===0)return": no indices are valid"
return": index should be less than "+t},
gp(a){return this.f}}
A.bf.prototype={
m(a){return"Unsupported operation: "+this.a}}
A.aL.prototype={
m(a){return"Bad state: "+this.a}}
A.bA.prototype={
m(a){var t=this.a
if(t==null)return"Concurrent modification during iteration."
return"Concurrent modification during iteration: "+A.bE(t)+"."}}
A.bc.prototype={
m(a){return"Stack Overflow"},
$it:1}
A.d5.prototype={
m(a){return"Exception: "+this.a}}
A.cj.prototype={
m(a){var t=this.a,s=""!==t?"FormatException: "+t:"FormatException",r=this.b
if(typeof r=="string"){if(r.length>78)r=B.b.ac(r,0,75)+"..."
return s+"\n"+r}else return s}}
A.d.prototype={
al(a,b){return A.f1(this,A.f(this).i("d.E"),b)},
a9(a,b){var t
A.f(this).i("r(d.E)").a(b)
for(t=this.gv(this);t.n();)if(!b.$1(t.gq()))return!1
return!0},
E(a,b){var t
A.f(this).i("r(d.E)").a(b)
for(t=this.gv(this);t.n();)if(b.$1(t.gq()))return!0
return!1},
ap(a){return A.e1(this,A.f(this).i("d.E"))},
gp(a){var t,s=this.gv(this)
for(t=0;s.n();)++t
return t},
gC(a){return!this.gv(this).n()},
gM(a){return!this.gC(this)},
R(a,b){var t,s
A.fk(b,"index")
t=this.gv(this)
for(s=b;t.n();){if(s===0)return t.gq();--s}throw A.a(A.dT(b,b-s,this,"index"))},
m(a){return A.fc(this,"(",")")}}
A.X.prototype={
m(a){return"MapEntry("+A.q(this.a)+": "+A.q(this.b)+")"}}
A.b8.prototype={
gD(a){return A.j.prototype.gD.call(this,0)},
m(a){return"null"}}
A.j.prototype={$ij:1,
ab(a,b){return this===b},
gD(a){return A.bX(this)},
m(a){return"Instance of '"+A.bY(this)+"'"},
ga4(a){return A.hA(this)},
toString(){return this.m(this)}}
A.aM.prototype={
gp(a){return this.a.length},
m(a){var t=this.a
return t.charCodeAt(0)==0?t:t},
$ifo:1}
A.b3.prototype={}
A.cU.prototype={}
A.bP.prototype={
gN(){return A.l(["placer_materiel","verser","tourner_robinet","mesurer","terminer"],u.N)},
gK(){return A.l(["volume_equivalent_ml","concentration_mol_l"],u.N)},
a0(){return B.B},
gaG(){A.u("caMolL",0.08)
A.u("vaMl",20)
A.u("cbMolL",0.1)
return 16},
b0(a){var t,s,r=a.k("volume_acide_ml")
if(r==null)r=0
if(r<=0)return null
t=a.k("volume_verse_ml")
if(t==null)t=0
A.u("caMolL",0.08)
A.u("vaMl",r)
A.u("cbMolL",0.1)
A.ay("volumeVerseMl",t)
s=(0.08*r-0.1*t)/(r+t)
return-Math.log((s+Math.sqrt(s*s+4e-14))/2)/2.302585092994046},
ak(a,b){var t,s,r,q,p,o="volume_verse_ml",n="jet_pres_equivalence",m=this.aM(a,b),l=a.ao("debit")
if(l==null)l="ferme"
if(l!=="ferme"){t=a.b
t=!t.l("soude")||!t.l("burette")}else t=!0
if(t)return m
t=l==="jet"
s=t?0.5:0.05
r=a.k(o)
if(r==null)r=0
q=B.h.aF(r+s*b,0,25)
p=t&&q>=this.gaG()-1
t=A.G(u.N,u.K)
t.j(0,o,q)
if(p||J.v(a.c.h(0,n),!0))t.j(0,n,!0)
return m.ae(t)},
L(a,b){return A.n(A.b(a,"exige","aucune condition pour "+this.a.a))},
W(a,b){var t,s,r,q=b.k("volume_verse_ml")
if(q==null)q=0
t=this.gaG()
switch(a){case"volume_proche_equivalence":s=b.k("volume_acide_ml")
return(s==null?0:s)>0&&q>=t-1&&q<t+0.2&&b.ao("debit")==="jet"
case"equivalence_atteinte":r=this.b0(b)
return r!=null&&r>=8.2&&q<=t+0.2}throw A.a(A.b(a,"quand","conseil inconnu pour "+this.a.a))},
a5(a,b,c){var t,s,r,q,p="solution",o="erlenmeyer",n="volume_ml",m="volume_acide_ml",l="debit"
u.f.a(c)
switch(b){case"verser":t=A.S(c,p)
s=t==="acide"
if(!s&&t!=="phenolphtaleine")throw A.a(A.b(t,p,"acide ou phenolphtaleine"))
if(!a.b.l(o))throw A.a(A.m("Place d'abord l'erlenmeyer."))
r=A.ak(c,n)
if(r<=0)throw A.a(A.b(r,n,"positif attendu"))
if(s){s=a.k(m)
s=a.A(m,(s==null?0:s)+r)}else s=a.V("phenolphtaleine",o)
return s
case"tourner_robinet":q=A.S(c,l)
if(!B.a.u(B.t,q))throw A.a(A.b(q,l,A.q(B.t)))
if(!a.b.l("burette"))throw A.a(A.m("Place d'abord la burette."))
return a.A(l,q)}throw A.a(A.b(b,"action","inconnue"))},
a1(a,b,c,d){var t,s,r,q
if(typeof c!="number")throw A.a(A.b(c,"valeur","nombre attendu"))
t=a.k("volume_verse_ml")
if(t==null)t=0
s=b==="volume_equivalent_ml"
if(s)r=t
else{q=a.k("volume_acide_ml")
if(q==null)q=20
A.u("cbMolL",0.1)
A.ay("vbMl",t)
A.u("vaMl",q)
r=0.1*t/q}s=s?0.1:0.005
return new A.B(b,c,d,r,A.i(["tolerance",s,"mauvaiseUnite",b==="concentration_mol_l"&&d!=="mol/L"],u.N,u.X))},
a_(a){var t,s,r,q,p,o,n,m=A.e([],u.s),l=new A.cp(m),k=a.k("volume_acide_ml")
if(k==null)k=0
if(k>0&&Math.abs(k-20)>0.05)l.$1("erreur_volume_acide")
t=a.e
if(t.length!==0&&B.a.u(t,"lunettes_avant_soude"))l.$1("lunettes_oubliees")
if(J.v(a.c.h(0,"jet_pres_equivalence"),!0))l.$1("debit_trop_rapide")
t=a.k("volume_verse_ml")
if(t==null)t=0
if(t>this.gaG()+0.2)l.$1("depassement_equivalence")
for(t=a.d,s=t.length,r=0;r<s;++r){q=t[r]
p=q.e
if(p.h(0,"mauvaiseUnite")===!0)l.$1("unite_concentration")
o=q.d
n=q.b
if(o!=null&&typeof n=="number"&&Math.abs(n-o)>A.a5(p.h(0,"tolerance")))l.$1(q.a==="volume_equivalent_ml"?"lecture_burette":"calcul_concentration")}return m},
a3(a){var t,s,r=A.G(u.N,u.X)
for(t=a.gY(),t=new A.W(t,t.r,t.e,A.f(t).i("W<2>"));t.n();){s=t.d
r.j(0,s.a,s.b)}return r}}
A.cp.prototype={
$1(a){var t=this.a
if(!B.a.u(t,a))B.a.t(t,a)},
$S:1}
A.cV.prototype={}
A.b4.prototype={}
A.bh.prototype={}
A.aI.prototype={
gbq(){var t=this.a.a
return t==="mesure_intensite"||t==="lois_courant"},
gaS(){var t=this.a.a
return t==="lois_courant"||t==="lois_tensions"},
gN(){var t=u.N,s=A.l(["placer_materiel","regler_tension","fermer_interrupteur","ouvrir_interrupteur","choisir_calibre","mesurer","terminer"],t)
if(this.a.a==="mesure_tension_masse")s.O(0,A.l(["inverser_branchement","relier_masse"],t))
return s},
gK(){var t,s=this.a.a
A:{if("mesure_intensite"===s){t=A.l(["intensite_aiguille_a","intensite_multimetre_a"],u.N)
break A}if("lois_courant"===s){t=A.l(["i_point_1_a","i_point_2_a","i_point_3_a","i_branche_principale_a","i_branche_r1_a","i_branche_r2_a"],u.N)
break A}if("mesure_tension_masse"===s){t=A.l(["u_pa_v","u_an_v","u_pn_v","u_ap_v","u_k_ouvert_v","u_k_ferme_v","v_p_v","v_a_v"],u.N)
break A}t=A.l(["u_pa_v","u_an_v","u_pn_v","u1_v","u2_v"],u.N)
break A}return t},
gZ(){var t,s,r,q,p,o=this,n=u.N,m=A.e1(B.x,n)
m.t(0,"bornes_k")
m.t(0,"point_p")
m.t(0,"point_a")
t=o.gaS()?A.l(["serie","derivation"],n):A.l(["serie"],n)
s=o.gaS()?A.l(["serie","derivation"],n):A.l(["serie"],n)
r=A.i(["resistor_r1",t,"resistor_r2",s,"fils",A.l(["circuit","bornes_generateur"],n)],n,u.C)
for(n=o.a,t=n.d,s=t.$ti,t=new A.K(t,t.gp(0),s.i("K<H.E>")),s=s.i("H.E"),n=n.a,q=n!=="mesure_intensite",n=n==="lois_courant";t.n();){p=t.d
if(p==null)p=s.a(p)
if(o.B(p)!=null)r.j(0,p,!q||n?B.x:m)}return r},
B(a){var t="voltmetre"
if(a==="amperemetre"||a==="amperemetre_aiguille")return"ammetre"
if(a==="voltmetre"||a==="voltmetre_aiguille")return t
if(a==="multimetre")return this.gbq()?"ammetre":t
return null},
bn(a){A.k(a)
return this.B(a)!=null&&a!=="multimetre"},
ai(a){return this.B(a)==="ammetre"?B.e:B.q},
H(a){var t=a.b.gF(),s=A.f(t)
return new A.D(t,s.i("r(d.E)").a(new A.cs(this)),s.i("D<d.E>"))},
ad(a){var t
if(a!=null)t=B.b.S(a,"point_")&&a!=="point_p"&&a!=="point_a"||B.b.S(a,"branche_")
else t=!1
return t},
a0(){return B.C},
aL(a){if(J.v(a.c.h(0,"interrupteur_ferme"),!0))throw A.a(A.m("Ouvre K avant de modifier le montage."))},
aa(a,b,c){var t,s=this
if((b==="resistor_r1"||b==="resistor_r2"||s.B(b)!=null)&&c==null)throw A.a(A.b(null,"emplacement_id","obligatoire pour "+b))
t=a.V(b,c)
if(s.B(b)!=null&&b!=="multimetre")t=t.ae(A.i(["calibre_"+b,B.a.gba(s.ai(b)),"inverse_"+b,!1],u.N,u.K))
else if(s.B(b)!=null)t=t.A("inverse_"+b,!1)
return t},
bz(a){var t=a.b,s=t.h(0,"resistor_r1"),r=t.h(0,"resistor_r2")
if(s==null||r==null||s!==r)return null
return s},
aP(a){var t,s,r,q,p,o,n,m,l=this,k="tensionV",j="resistanceOhm",i=a.k("tension_generateur_v")
if(i==null)i=0
t=l.bz(a)
if(t!=null){s=a.b
r=s.l("alimentation")&&s.l("interrupteur_k")&&l.L("montage_sans_court_circuit",a)}else r=!1
q=l.H(a).E(0,new A.cr(l,a))
p=r&&J.v(a.c.h(0,"interrupteur_ferme"),!0)&&!q
if(p&&t==="serie"){s=A.hI(A.e([100,150],u.n))
A.ay(k,i)
A.u(j,s)
o=i/s
return new A.bh(t,i,o,o,o,o*100,o*150)}if(p&&t==="derivation"){A.ay(k,i)
A.u(j,100)
n=i/100
A.ay(k,i)
A.u(j,150)
m=i/150
return new A.bh(t,i,n+m,n,m,i,i)}return new A.bh(t,i,0,0,0,0,0)},
bx(a,b,c){var t="interrupteur_ferme"
switch(c){case"bornes_r1":return b.r
case"bornes_r2":return b.w
case"bornes_generateur":return b.c
case"bornes_k":return J.v(a.c.h(0,t),!0)?0:b.c
case"point_p":return J.v(a.c.h(0,"masse_n"),!0)?b.c:null
case"point_a":return J.v(a.c.h(0,"masse_n"),!0)&&b.a==="serie"?b.w:null
default:return J.v(a.c.h(0,t),!0)?b.c:0}},
af(a,b){var t,s,r,q,p,o=this,n=a.b.h(0,b),m=o.B(b)
if(m==null||n==null)return B.p
t=o.aP(a)
s=m==="ammetre"
if(s)if(B.b.S(n,"bornes_"))r=null
else if(t.a==="derivation")if(n==="branche_r1")r=t.e
else r=n==="branche_r2"?t.f:t.d
else r=t.d
else{r=o.bx(a,t,n)
if(r!=null&&J.v(a.c.h(0,"inverse_"+b),!0))r=-r}if(r==null)return B.p
if(o.B(b)!=null&&b!=="multimetre"){q=a.k("calibre_"+b)
q.toString
p=s?A.dG(r,q,100):A.dG(r,q,100)
return new A.b4(r,null,p.a,p.b,p.c)}return new A.b4(r,B.h.bQ(r/0.001)*0.001,null,!1,!1)},
L(a,b){var t,s,r=this
switch(a){case"montage_sans_court_circuit":return b.b.h(0,"fils")!=="bornes_generateur"&&!r.H(b).E(0,new A.ct(r,b))
case"amperemetre_en_serie":t=r.H(b)
s=t.$ti
return new A.D(t,s.i("r(d.E)").a(new A.cu(r)),s.i("D<d.E>")).a9(0,new A.cv(r,b))
case"plus_grand_calibre":t=r.H(b)
s=t.$ti
return new A.D(t,s.i("r(d.E)").a(r.gav()),s.i("D<d.E>")).a9(0,new A.cw(r,b))}throw A.a(A.b(a,"exige","condition inconnue pour "+r.a.a))},
aO(a){var t,s,r
for(t=this.H(a),s=J.a8(t.a),t=new A.a4(s,t.b,t.$ti.i("a4<1>"));t.n();){r=s.gq()
if(this.B(r)!=null&&r!=="multimetre"&&this.B(r)==="ammetre")return r}return null},
ah(a,b){var t,s,r
u.a.a(b)
t=a.d
s=A.N(t)
r=new A.ar(t,s.i("c(1)").a(new A.cq()),s.i("ar<1,c>")).ap(0)
return B.a.a9(b,r.gb3(r))},
W(a,b){var t,s,r,q,p,o,n,m=this,l="calibre_reductible"
switch(a){case"aiguille_hors_echelle":t=m.H(b)
s=t.$ti
return new A.D(t,s.i("r(d.E)").a(m.gav()),s.i("D<d.E>")).E(0,new A.cx(m,b))
case"calibre_reductible":case"calibre_optimal_atteint":r=m.aO(b)
if(r==null||!m.ad(b.b.h(0,r)))return!1
q=m.af(b,r)
p=q.a
if(p==null)p=0
if(q.d||p<=0)return!1
t=b.k("calibre_"+r)
t.toString
s=m.ai(r)
o=A.N(s)
n=new A.D(s,o.i("r(1)").a(new A.cy(t,p)),o.i("D<1>"))
return a===l?!n.gC(0):!n.gv(0).n()
case"courants_serie_mesures":return m.ah(b,A.e(["i_point_1_a","i_point_2_a","i_point_3_a"],u.s))
case"derivation_mesuree":return m.ah(b,A.e(["i_branche_principale_a","i_branche_r1_a","i_branche_r2_a"],u.s))
case"voltmetre_en_serie":return m.H(b).E(0,new A.cz(m,b))
case"branchement_inverse":return J.v(b.c.h(0,"interrupteur_ferme"),!0)&&m.H(b).E(0,new A.cA(m,b))
case"somme_tensions_mesurees":return m.ah(b,A.e(["u_pa_v","u_an_v","u_pn_v"],u.s))
case"tensions_derivation_mesurees":return m.ah(b,A.e(["u1_v","u2_v","u_pn_v"],u.s))}throw A.a(A.b(a,"quand","conseil inconnu pour "+m.a.a))},
a5(a,b,c){var t,s,r,q,p=this,o="tension_v",n="interrupteur_ferme",m="materiel_id",l="point_id"
u.f.a(c)
switch(b){case"regler_tension":t=A.ak(c,o)
if(t<0||t>12)throw A.a(A.b(t,o,"entre 0 et 12 V"))
if(!a.b.l("alimentation"))throw A.a(A.m("Place d'abord l'alimentation."))
return a.A("tension_generateur_v",t)
case"fermer_interrupteur":if(!a.b.l("interrupteur_k"))throw A.a(A.m("Place d'abord l'interrupteur K."))
return a.A(n,!0)
case"ouvrir_interrupteur":return a.A(n,!1)
case"choisir_calibre":s=A.S(c,m)
if(a.b.l(s))r=!(p.B(s)!=null&&s!=="multimetre")
else r=!0
if(r)throw A.a(A.b(s,m,"appareil \xe0 aiguille non plac\xe9"))
q=p.B(s)==="ammetre"?"calibre_a":"calibre_v"
return a.A("calibre_"+s,A.dj(c,q,p.ai(s)))
case"inverser_branchement":s=A.S(c,m)
if(!a.b.l(s)||p.B(s)!=="voltmetre")throw A.a(A.b(s,m,"voltm\xe8tre non plac\xe9"))
r="inverse_"+s
return a.A(r,!J.v(a.c.h(0,r),!0))
case"relier_masse":if(A.S(c,l)!=="n")throw A.a(A.b(c.h(0,l),l,"seul le point n peut \xeatre la masse"))
return a.A("masse_n",!0)}throw A.a(A.b(b,"action","inconnue"))},
bB(a,b){var t=null,s=this.aP(a),r=s.a,q=r==="serie",p=r==="derivation"
switch(b){case"intensite_aiguille_a":case"intensite_multimetre_a":case"i_point_1_a":case"i_point_2_a":case"i_point_3_a":case"i_branche_principale_a":return s.d
case"i_branche_r1_a":return p?s.e:t
case"i_branche_r2_a":return p?s.f:t
case"u_pa_v":return q?s.r:t
case"u_an_v":return q?s.w:t
case"u_pn_v":case"v_p_v":case"u_k_ouvert_v":return s.c
case"u1_v":return p?s.r:t
case"u2_v":return p?s.w:t
case"u_ap_v":return q?-s.r:t
case"u_k_ferme_v":return 0
case"v_a_v":return q?s.w:t}return t},
by(a,b){var t,s,r,q,p=B.b.S(b,"u")||B.b.S(b,"v_")?"voltmetre":"ammetre"
if(b==="intensite_multimetre_a")return 0.001
for(t=this.H(a),s=J.a8(t.a),t=new A.a4(s,t.b,t.$ti.i("a4<1>"));t.n();){r=s.gq()
if(this.B(r)!=null&&r!=="multimetre"&&this.B(r)===p){q=a.c.h(0,"calibre_"+r)
t=typeof q=="number"?q:null
t.toString
return t/100}}return 0.001},
a1(a,b,c,d){var t,s,r,q,p,o=this
if(typeof c!="number")throw A.a(A.b(c,"valeur","nombre attendu"))
t=o.aO(a)
s=o.bB(a,b)
r=o.H(a)
q=r.$ti
q=new A.D(r,q.i("r(d.E)").a(o.gav()),q.i("D<d.E>")).E(0,new A.cC(o,a))
r=o.H(a).E(0,new A.cD(o,a))
p=o.by(a,b)
return new A.B(b,c,d,s,A.i(["horsEchelle",q,"voltmetreEnSerie",r,"tolerance",p,"calibreA",t==null?null:a.k("calibre_"+t)],u.N,u.X))},
a_(a){var t,s,r,q,p,o,n,m,l=A.e([],u.s),k=new A.cB(l)
for(t=a.e,s=t.length,r=0;r<s;++r)switch(t[r]){case"amperemetre_en_serie":k.$1("amperemetre_en_derivation")
break
case"pas_de_court_circuit":k.$1("court_circuit_generateur")
break
case"grand_calibre_en_premier":k.$1("grand_calibre_oublie")
break}for(t=a.d,s=t.length,r=0;r<s;++r){q=t[r]
p=q.e
if(p.h(0,"horsEchelle")===!0)k.$1("calibre_trop_petit")
if(p.h(0,"voltmetreEnSerie")===!0)k.$1("voltmetre_en_serie")
o=q.d
n=q.b
if(o!=null&&typeof n=="number"){m=A.dA(p.h(0,"tolerance"))
if(m==null)m=0.001
if(Math.abs(n-o)>m)k.$1("lecture_cadran")}}return l},
a3(a){var t,s,r,q,p,o,n,m="calibreA",l=a.gY(),k=A.G(u.N,u.X)
for(t=this.gK(),t=A.eh(t,t.r,A.f(t).c),s=t.$ti.c;t.n();){r=t.d
if(r==null)r=s.a(r)
if(l.l(r)&&r!=="u_ap_v"&&r!=="u_k_ouvert_v"&&r!=="u_k_ferme_v")k.j(0,r,l.h(0,r).b)}q=l.h(0,"intensite_aiguille_a")
if(this.a.a==="mesure_intensite"&&q!=null){p=A.dA(q.e.h(0,m))
o=A.dd(q.b)
if(p!=null&&o>0){A.u("classe",1.5)
A.u(m,p)
n=1.5*p/100
k.j(0,"delta_i_a",n)
A.ay("incertitudeAbsolue",n)
A.u("valeurMesuree",o)
k.j(0,"tau",n/o)}}return k}}
A.cs.prototype={
$1(a){return this.a.B(A.k(a))!=null},
$S:0}
A.cr.prototype={
$1(a){var t
A.k(a)
t=this.a
return t.B(a)==="voltmetre"&&t.ad(this.b.b.h(0,a))},
$S:0}
A.ct.prototype={
$1(a){A.k(a)
return this.a.B(a)==="ammetre"&&this.b.b.h(0,a)==="bornes_generateur"},
$S:0}
A.cu.prototype={
$1(a){return this.a.B(A.k(a))==="ammetre"},
$S:0}
A.cv.prototype={
$1(a){return this.a.ad(this.b.b.h(0,A.k(a)))},
$S:0}
A.cw.prototype={
$1(a){A.k(a)
return this.b.k("calibre_"+a)===B.a.gaK(this.a.ai(a))},
$S:0}
A.cq.prototype={
$1(a){return u.r.a(a).a},
$S:6}
A.cx.prototype={
$1(a){return this.a.af(this.b,A.k(a)).d},
$S:0}
A.cy.prototype={
$1(a){A.a5(a)
return a<this.a&&this.b<=a*1.000000001},
$S:2}
A.cz.prototype={
$1(a){var t
A.k(a)
t=this.a
return t.B(a)==="voltmetre"&&t.ad(this.b.b.h(0,a))},
$S:0}
A.cA.prototype={
$1(a){var t,s,r
A.k(a)
t=this.a
s=!1
if(t.B(a)==="voltmetre"){r=this.b
if(J.v(r.c.h(0,"inverse_"+a),!0)){t=t.af(r,a).a
t=(t==null?0:t)<0}else t=s}else t=s
return t},
$S:0}
A.cC.prototype={
$1(a){return this.a.af(this.b,A.k(a)).d},
$S:0}
A.cD.prototype={
$1(a){var t
A.k(a)
t=this.a
return t.B(a)==="voltmetre"&&t.ad(this.b.b.h(0,a))},
$S:0}
A.cB.prototype={
$1(a){var t=this.a
if(!B.a.u(t,a))B.a.t(t,a)},
$S:1}
A.cW.prototype={}
A.b0.prototype={
gN(){return A.l(["placer_materiel","regler_tension","regler_rheostat","choisir_calibre","deposer_cristal","fermer_interrupteur","ouvrir_interrupteur","mesurer","terminer"],u.N)},
gK(){return A.l(["courant_ma","duree_min","electrode_cu2_plus","electrode_mno4_moins"],u.N)},
gZ(){var t=u.N
return A.i(["electrode_a",A.l(["gauche","droite"],t),"electrode_b",A.l(["gauche","droite"],t),"fils",A.l(["circuit","bornes_generateur"],t)],t,u.C)},
a0(){return new A.ac(1,B.k,A.i(["tension_generateur_v",0,"interrupteur_ferme",!1,"resistance_rheostat_ohm",330,"progression_cuivre",0,"progression_permanganate",0,"temps_courant_s",0],u.N,u.K),B.i,B.j,0,!1)},
aL(a){if(J.v(a.c.h(0,"interrupteur_ferme"),!0))throw A.a(A.m("Ouvre K avant de modifier le montage."))},
aa(a,b,c){var t
if(B.a.u(B.u,b))throw A.a(A.b(b,"materiel_id","utilise deposer_cristal pour un cristal"))
if((b==="electrode_a"||b==="electrode_b")&&c==null)throw A.a(A.b(null,"emplacement_id","obligatoire pour "+b))
t=a.V(b,c)
return b==="amperemetre"?t.A("calibre_amperemetre",B.a.gba(B.e)):t},
am(a){var t,s=a.b,r=s.h(0,"electrode_a"),q=s.h(0,"electrode_b")
if(!(B.a.a9(B.M,s.gb4())&&r!=null&&q!=null&&r!==q&&this.L("montage_sans_court_circuit",a))||!J.v(a.c.h(0,"interrupteur_ferme"),!0))return 0
t=a.k("tension_generateur_v")
if(t==null)t=0
s=a.k("resistance_rheostat_ohm")
s=(s==null?330:s)+50
A.ay("tensionV",t)
A.u("resistanceOhm",s)
return t/s},
ak(a,b){var t,s,r,q="progression_cuivre",p="progression_permanganate",o=this.aM(a,b),n=this.am(a)
if(n<=0||b===0)return o
t=new A.cE(a,n/0.03*b/600)
s=a.k("temps_courant_s")
if(s==null)s=0
r=a.b
return o.ae(A.i(["temps_courant_s",s+b,q,t.$2(q,r.l("cristal_sulfate_cuivre")),p,t.$2(p,r.l("cristal_permanganate"))],u.N,u.K))},
L(a,b){switch(a){case"montage_sans_court_circuit":return b.b.h(0,"fils")!=="bornes_generateur"
case"plus_grand_calibre":return!b.b.l("amperemetre")||b.k("calibre_amperemetre")===B.a.gaK(B.e)}throw A.a(A.b(a,"exige","condition inconnue pour "+this.a.a))},
W(a,b){var t
switch(a){case"courant_nul":return J.v(b.c.h(0,"interrupteur_ferme"),!0)&&this.am(b)<=0
case"duree_observation_atteinte":t=b.k("temps_courant_s")
return(t==null?0:t)>=600}throw A.a(A.b(a,"quand","conseil inconnu pour "+this.a.a))},
a5(a,b,c){var t,s,r,q="tension_v",p="resistance_ohm",o="materiel_id",n="interrupteur_ferme"
u.f.a(c)
switch(b){case"regler_tension":t=A.ak(c,q)
if(t<0||t>12)throw A.a(A.b(t,q,"entre 0 et 12 V"))
if(!a.b.l("alimentation"))throw A.a(A.m("Place d'abord l'alimentation."))
return a.A("tension_generateur_v",t)
case"regler_rheostat":s=A.ak(c,p)
if(s<0||s>330)throw A.a(A.b(s,p,"entre 0 et 330 ohms"))
if(!a.b.l("rheostat"))throw A.a(A.m("Place d'abord le rh\xe9ostat."))
return a.A("resistance_rheostat_ohm",s)
case"choisir_calibre":if(!a.b.l("amperemetre")||A.S(c,o)!=="amperemetre")throw A.a(A.m("Amp\xe8rem\xe8tre non plac\xe9."))
return a.A("calibre_amperemetre",A.dj(c,"calibre_a",B.e))
case"deposer_cristal":r=A.S(c,o)
if(!B.a.u(B.u,r))throw A.a(A.b(r,o,"cristal inconnu"))
if(!a.b.l("papier_filtre"))throw A.a(A.m("Place d'abord le papier-filtre."))
if(J.v(a.c.h(0,n),!0))A.n(A.m("Ouvre K avant de modifier le montage."))
return a.V(r,"centre")
case"fermer_interrupteur":if(!a.b.l("interrupteur_k"))throw A.a(A.m("Place d'abord l'interrupteur K."))
return a.A(n,!0)
case"ouvrir_interrupteur":return a.A(n,!1)}throw A.a(A.b(b,"action","inconnue"))},
a1(a,b,c,d){var t,s="valeur",r="nombre attendu"
switch(b){case"courant_ma":if(typeof c!="number")throw A.a(A.b(c,s,r))
return new A.B(b,c,d,this.am(a)*1000,B.w)
case"duree_min":if(typeof c!="number")throw A.a(A.b(c,s,r))
t=a.k("temps_courant_s")
return new A.B(b,c,d,(t==null?0:t)/60,B.w)
default:if(typeof c=="string")t=c!=="anode"&&c!=="cathode"
else t=!0
if(t)throw A.a(A.b(c,s,"anode ou cathode attendu"))
t=b==="electrode_cu2_plus"?2:-1
if(t===0)A.n(A.b(t,"chargeElementaire","ne doit pas \xeatre nulle"))
return new A.B(b,c,d,null,A.i(["electrodeJuste",(t>0?B.A:B.z).b],u.N,u.X))}},
a_(a){var t,s,r,q,p,o=A.e([],u.s),n=new A.cF(o)
for(t=a.e,s=t.length,r=0;r<s;++r)switch(t[r]){case"gants_avant_cristaux":n.$1("gants_oublies")
break
case"pas_de_court_circuit":n.$1("court_circuit_generateur")
break
case"grand_calibre_en_premier":n.$1("grand_calibre_oublie")
break}for(t=a.d,s=t.length,r=0;r<s;++r){q=t[r]
p=q.e.h(0,"electrodeJuste")
if(p!=null&&q.b!==p)n.$1("electrode_inversee")}return o},
a3(a){var t,s,r=a.gY(),q=u.N,p=A.G(q,u.X)
for(q=A.l(["courant_ma","duree_min","electrode_cu2_plus","electrode_mno4_moins"],q),q=A.eh(q,q.r,q.$ti.c),t=q.$ti.c;q.n();){s=q.d
if(s==null)s=t.a(s)
if(r.l(s))p.j(0,s,r.h(0,s).b)}return p}}
A.cE.prototype={
$2(a,b){var t,s=this.a.k(a)
if(s==null)s=0
if(b){t=s+this.b
if(t>1)t=1}else t=s
return t},
$S:8}
A.cF.prototype={
$1(a){var t=this.a
if(!B.a.u(t,a))B.a.t(t,a)},
$S:1}
A.cX.prototype={}
A.cd.prototype={}
A.b1.prototype={
gN(){return A.l(["placer_materiel","deplacer_materiel","mesurer","terminer"],u.N)},
gK(){return A.l(["position_a_cm","position_o_cm","distance_objet_ecran_cm","position_l1_cm","position_l2_cm","oa_cm","oa_prime_cm","f_prime_cm"],u.N)},
gZ(){var t=u.N
return A.i(["miroir_plan",A.l(["derriere_lentille"],t)],t,u.C)},
a0(){return B.o},
aa(a,b,c){var t=a.V(b,c),s=B.S.h(0,b)
return s!=null&&a.k("position_"+b+"_cm")==null?t.A("position_"+b+"_cm",s):t},
a7(a,b){return a.b.l(b)?a.k("position_"+b+"_cm"):null},
U(a){var t,s,r,q,p,o=this,n="lentille_convergente",m=o.a7(a,"objet_lumineux"),l=o.a7(a,n),k=m==null||l==null?null:m-l
l=o.a7(a,n)
t=k!=null
s=t&&k<0?A.hG(15,k):null
r=s!=null&&s>0&&l!=null?l+s:null
if(a.b.h(0,"miroir_plan")==="derriere_lentille")q=t&&k<0&&Math.abs(Math.abs(k)-15)<=0.5
else{p=o.a7(a,"ecran")
q=r!=null&&p!=null&&Math.abs(p-r)<=0.5}return new A.cd(k,s,r,q)},
aT(a){var t=this.a7(a,"objet_lumineux"),s=this.a7(a,"ecran")
return t==null||s==null?null:s-t},
L(a,b){return A.n(A.b(a,"exige","aucune condition pour "+this.a.a))},
au(a,b){var t,s,r
u.a.a(b)
t=a.d
s=A.N(t)
r=new A.ar(t,s.i("c(1)").a(new A.cG()),s.i("ar<1,c>")).ap(0)
return B.a.a9(b,r.gb3(r))},
W(a,b){var t,s,r=this,q="miroir_plan"
switch(a){case"autocollimation_sans_miroir":return!b.b.l(q)&&B.a.E(b.d,new A.cH())
case"bessel_distance_insuffisante":t=r.aT(b)
return!b.b.l(q)&&t!=null&&t>0&&t<60
case"image_nette_obtenue":return r.U(b).d
case"trois_methodes_terminees":s=u.s
return r.au(b,A.e(["position_a_cm","position_o_cm"],s))&&r.au(b,A.e(["distance_objet_ecran_cm","position_l1_cm","position_l2_cm"],s))&&r.au(b,A.e(["oa_cm","oa_prime_cm"],s))}throw A.a(A.b(a,"quand","conseil inconnu pour "+r.a.a))},
a5(a,b,c){var t,s,r="materiel_id",q="position_cm"
u.f.a(c)
if(b==="deplacer_materiel"){t=A.S(c,r)
if(!B.a.u(B.L,t)||!a.b.l(t))throw A.a(A.b(t,r,"mat\xe9riel mobile non plac\xe9"))
s=A.ak(c,q)
if(s<0||s>100)throw A.a(A.b(s,q,"entre 0 et 100 cm"))
return a.A("position_"+t+"_cm",s)}throw A.a(A.b(b,"action","inconnue"))},
a1(a,b,c,d){var t,s,r,q,p
if(typeof c!="number")throw A.a(A.b(c,"valeur","nombre attendu"))
t=this.aT(a)
s=B.a9.u(0,b)
r=this.U(a)
q=b==="distance_objet_ecran_cm"&&t!=null&&t<60
p=b==="oa_cm"&&c>0
return new A.B(b,c,d,null,A.i(["imageNetteRequise",s,"nette",r.d,"dTropPetit",q,"oaPositif",p],u.N,u.X))},
a_(a){var t,s,r,q,p=A.e([],u.s),o=new A.cI(p)
for(t=a.d,s=t.length,r=0;r<s;++r){q=t[r].e
if(q.h(0,"dTropPetit")===!0)o.$1("distance_objet_ecran_trop_petite")
if(q.h(0,"imageNetteRequise")===!0&&q.h(0,"nette")===!1)o.$1("image_non_nette")
if(q.h(0,"oaPositif")===!0)o.$1("signe_distance_algebrique")}return p},
T(a,b){var t,s,r,q,p=A.e([],u.n)
for(t=a.d,s=t.length,r=0;r<s;++r){q=t[r]
if(q.a===b&&typeof q.b=="number")p.push(A.dd(q.b))}return p},
a3(a8){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0,a1=this,a2="ne doit pas \xeatre nul",a3=a1.T(a8,"position_a_cm"),a4=a1.T(a8,"position_o_cm"),a5=u.n,a6=A.e([],a5),a7=0
for(;;){k=a3.length
if(!(a7<k&&a7<a4.length))break
if(!(a7<k))return A.h(a3,a7)
k=a3[a7]
if(!(a7<a4.length))return A.h(a4,a7)
j=a4[a7]
if(k!==j)B.a.t(a6,Math.abs(j-k));++a7}t=a1.T(a8,"distance_objet_ecran_cm")
s=a1.T(a8,"position_l1_cm")
r=a1.T(a8,"position_l2_cm")
q=A.e([],a5)
p=0
for(;;){k=p
j=J.Q(t)
if(typeof k!=="number")return k.ag()
i=!1
if(k<j){k=p
j=J.Q(s)
if(typeof k!=="number")return k.ag()
if(k<j){k=p
j=J.Q(r)
if(typeof k!=="number")return k.ag()
j=k<j
k=j}else k=i}else k=i
if(!k)break
try{h=J.aC(t,p)
g=Math.abs(J.aC(r,p)-J.aC(s,p))
if(!(h>0)||h==1/0||h==-1/0)A.n(A.b(h,"distanceObjetEcranCm","doit \xeatre strictement positif"))
if(!(g>=0)||g==1/0||g==-1/0)A.n(A.b(g,"ecartPositionsCm","doit \xeatre positif ou nul"))
if(g>=h)A.n(A.m("ecartPositionsCm doit \xeatre plus petit que distanceObjetEcranCm."))
J.dL(q,(h*h-g*g)/(4*h))}catch(f){if(!(A.bv(f) instanceof A.J))throw f}k=p
if(typeof k!=="number")return k.bh()
p=k+1}o=a1.T(a8,"oa_cm")
n=a1.T(a8,"oa_prime_cm")
m=A.e([],a5)
l=0
for(;;){k=l
j=J.Q(o)
if(typeof k!=="number")return k.ag()
if(k<j){k=l
j=J.Q(n)
if(typeof k!=="number")return k.ag()
j=k<j
k=j}else k=!1
if(!k)break
try{k=J.aC(o,l)
j=J.aC(n,l)
if(k===0||isNaN(k)||k==1/0||k==-1/0)A.n(A.b(k,"oaCm",a2))
if(j===0||isNaN(j)||j==1/0||j==-1/0)A.n(A.b(j,"oaPrimeCm",a2))
e=1/j-1/k
if(e===0||isNaN(e)||e==1/0||e==-1/0)A.n(A.b(e,"1/OA' - 1/OA",a2))
J.dL(m,1/e)}catch(f){if(!(A.bv(f) instanceof A.J))throw f}k=l
if(typeof k!=="number")return k.bh()
l=k+1}k=u.w
k.a(a6)
d=a6.length===0?null:A.cb(a6)
j=k.a(q)
c=J.Q(j)===0?null:A.cb(j)
k=k.a(m)
b=J.Q(k)===0?null:A.cb(k)
a5=A.e([],a5)
k=d!=null
if(k)a5.push(d)
j=c!=null
if(j)a5.push(c)
i=b!=null
if(i)a5.push(b)
a=A.G(u.N,u.X)
if(k)a.j(0,"f_prime_bilbermann_cm",d)
if(j)a.j(0,"f_prime_bessel_cm",c)
if(i)a.j(0,"f_prime_descartes_cm",b)
if(a5.length!==0){a0=A.cb(a5)
a.j(0,"f_prime_moyenne_cm",a0)
A.u("fPrimeCm",a0)
a.j(0,"vergence_dioptries",100/a0)}return a}}
A.cG.prototype={
$1(a){return u.r.a(a).a},
$S:6}
A.cH.prototype={
$1(a){var t=u.r.a(a).a
return t==="position_a_cm"||t==="position_o_cm"},
$S:9}
A.cI.prototype={
$1(a){var t=this.a
if(!B.a.u(t,a))B.a.t(t,a)},
$S:1}
A.cY.prototype={}
A.ce.prototype={}
A.b2.prototype={
gN(){return A.l(["placer_materiel","regler_tension","relier_masse","choisir_couplage","regler_sensibilite","regler_base_temps","regler_gbf","mesurer","terminer"],u.N)},
gK(){return A.l(["u_continue_v","n_div","ym_div","u_multimetre_v","periode_s","frequence_hz","um_v","ueff_v"],u.N)},
gZ(){var t=u.N
return A.i(["alimentation",A.l(["entree_y1"],t),"gbf",A.l(["entree_y1"],t),"multimetre",A.l(["bornes_gbf"],t)],t,u.C)},
a0(){return new A.ac(1,B.k,A.i(["couplage","dc","reference_reglee",!1,"sensibilite_v_par_div",B.a.gaK(B.l),"base_temps_s_par_div",0.01,"frequence_gbf_hz",100,"tension_alimentation_v",0],u.N,u.K),B.i,B.j,0,!1)},
aa(a,b,c){var t,s,r,q=A.bU(a.b,u.N,u.u)
if(c==="entree_y1")for(t=["alimentation","gbf"],s=0;s<2;++s){r=t[s]
if(r!==b&&q.h(0,r)==="entree_y1")q.j(0,r,null)}q.j(0,b,c)
return a.b5(q)},
aE(a){var t,s,r,q
for(t=["gbf","alimentation"],s=a.b,r=0;r<2;++r){q=t[r]
if(s.h(0,q)==="entree_y1")return q}return null},
bo(a){var t,s=this.aE(a)
A:{if("gbf"===s){t=6
break A}if("alimentation"===s){t=a.k("tension_alimentation_v")
if(t==null)t=0
break A}t=0
break A}return t},
U(a){var t,s,r,q,p,o,n=this.aE(a),m=a.ao("couplage")
if(m==null)m="dc"
t=n!=null&&m!=="gnd"
s=a.k("sensibilite_v_par_div")
s.toString
r=this.bo(a)
if(t){A.u("sensibiliteVParDiv",s)
q=r/s}else q=0
if(n==="gbf"){s=a.k("frequence_gbf_hz")
s.toString
p=a.k("base_temps_s_par_div")
p.toString
A.u("frequenceHz",s)
A.u("baseTempsSParDiv",p)
o=1/(s*p)}else o=null
A.u("demiHauteurEcranDiv",4)
return new A.ce(n,m,t,r,q,o,Math.abs(q)<=4)},
L(a,b){var t
if(a==="masse_commune"){t=this.aE(b)
return t!=null&&J.v(b.c.h(0,"masse_"+t),!0)}throw A.a(A.b(a,"exige","condition inconnue pour "+this.a.a))},
W(a,b){var t,s=this.U(b)
switch(a){case"reference_non_reglee":return s.b==="dc"&&!J.v(b.c.h(0,"reference_reglee"),!0)
case"trace_hors_ecran":return s.c&&!s.r
case"sensibilite_reductible":if(!s.c||!s.r||s.d<=0)return!1
t=b.k("sensibilite_v_par_div")
t.toString
return new A.D(B.l,u.D.a(new A.cJ(t)),u.v).E(0,new A.cK(this,s))}throw A.a(A.b(a,"quand","conseil inconnu pour "+this.a.a))},
a5(a,b,c){var t,s,r,q,p,o,n="tension_v",m="point_id",l="couplage",k="sensibilite_v_par_div",j="base_temps_s_par_div",i="frequence_hz"
u.f.a(c)
switch(b){case"regler_tension":t=A.ak(c,n)
if(t<0||t>12)throw A.a(A.b(t,n,"entre 0 et 12 V"))
if(!a.b.l("alimentation"))throw A.a(A.m("Place d'abord l'alimentation."))
return a.A("tension_alimentation_v",t)
case"relier_masse":s=A.S(c,m)
if(s!=="alimentation"&&s!=="gbf"||!a.b.l(s))throw A.a(A.b(s,m,"alimentation ou gbf d\xe9j\xe0 plac\xe9"))
return a.A("masse_"+s,!0)
case"choisir_couplage":r=A.S(c,l)
q=r==="gnd"
if(!q&&r!=="dc")throw A.a(A.b(r,l,"gnd ou dc"))
p=A.G(u.N,u.K)
p.j(0,l,r)
if(q)p.j(0,"reference_reglee",!0)
return a.ae(p)
case"regler_sensibilite":return a.A(k,A.dj(c,k,B.l))
case"regler_base_temps":return a.A(j,A.dj(c,j,B.r))
case"regler_gbf":o=A.ak(c,i)
if(o<50||o>2000)throw A.a(A.b(o,i,"entre 50 et 2000 Hz"))
if(!a.b.l("gbf"))throw A.a(A.m("Place d'abord le GBF."))
return a.A("frequence_gbf_hz",o)}throw A.a(A.b(b,"action","inconnue"))},
a1(a,b,c,d){var t,s,r,q,p=null
if(typeof c!="number")throw A.a(A.b(c,"valeur","nombre attendu"))
t=this.U(a)
s=a.k("sensibilite_v_par_div")
s.toString
r=0.5
switch(b){case"u_continue_v":q=t.a==="alimentation"?t.d:p
r=0.5*s
break
case"n_div":q=t.f
break
case"ym_div":q=t.a==="gbf"?t.d/s:p
break
case"u_multimetre_v":q=t.a==="gbf"&&a.b.h(0,"multimetre")==="bornes_gbf"?t.d/1.4142135623730951:p
r=0.05
break
default:q=p}s=t.c&&!t.r
return new A.B(b,c,d,q,A.i(["traceHorsEcran",s,"tolerance",r,"lecture",b==="u_continue_v"||b==="n_div"||b==="ym_div"],u.N,u.X))},
a_(a){var t,s,r,q,p,o,n,m,l,k,j=A.e([],u.s),i=new A.cL(j)
if(B.a.u(a.e,"masse_commune"))i.$1("masse_oscilloscope_oubliee")
for(t=a.d,s=t.length,r=0;r<s;++r){q=t[r]
p=q.e
if(p.h(0,"traceHorsEcran")===!0)i.$1("trace_hors_ecran")
o=q.d
n=q.b
if(p.h(0,"lecture")===!0&&o!=null&&typeof n=="number")if(Math.abs(n-o)>A.a5(p.h(0,"tolerance")))i.$1("lecture_oscillogramme")}m=a.gY()
t=m.h(0,"um_v")
l=t==null?null:t.b
t=m.h(0,"ueff_v")
k=t==null?null:t.b
if(typeof l=="number"&&typeof k=="number"&&l>0&&Math.abs(k-l)<=0.02*l)i.$1("confusion_maximale_efficace")
return j},
a3(a){var t,s,r=a.gY(),q=A.G(u.N,u.X)
for(t=0;t<5;++t){s=B.Q[t]
if(r.l(s))q.j(0,s,r.h(0,s).b)}return q}}
A.cJ.prototype={
$1(a){return A.a5(a)<this.a},
$S:2}
A.cK.prototype={
$1(a){return this.b.d/A.a5(a)<=4},
$S:2}
A.cL.prototype={
$1(a){var t=this.a
if(!B.a.u(t,a))B.a.t(t,a)},
$S:1}
A.bQ.prototype={
gN(){return A.l(["placer_materiel","introduire_tranches","mesurer","terminer"],u.N)},
gK(){var t,s=A.l(["longueur_initiale_cm"],u.N)
for(t=1;t<=4;++t)s.t(0,"longueur_moyenne_tube_"+t+"_cm")
return s},
gZ(){var t,s=u.N,r=A.G(s,u.C)
for(t=0;t<4;++t)r.j(0,B.f[t],A.e0(B.I,s))
return r},
a0(){return B.o},
aa(a,b,c){if(B.a.u(B.f,b)){if(c==null)throw A.a(A.b(null,"emplacement_id","solution du tube obligatoire"))
if(a.k("debut_"+b)!=null)throw A.a(A.m("Les tranches sont d\xe9j\xe0 dans "+b+"."))}return a.V(b,c)},
bc(a,b){var t,s,r=a.k("debut_"+b),q=a.b.h(0,b)
if(r==null||q==null)return null
t=B.h.aF((a.f-r)/7200,0,1)
s=B.R.h(0,q)
s.toString
return 2.7+(A.cb(s)-2.7)*t},
aY(a){var t,s,r,q,p=A.e([],u.s)
for(t=a.b,s=0;s<4;++s){r=B.f[s]
if(t.h(0,r)!=null){q=t.h(0,r)
q.toString
p.push(q)}}return p.length!==A.e0(p,u.N).a},
L(a,b){return A.n(A.b(a,"exige","aucune condition pour "+this.a.a))},
W(a,b){switch(a){case"deux_heures_ecoulees":return B.a.E(B.f,new A.cM(b))
case"tubes_identiques":return this.aY(b)}throw A.a(A.b(a,"quand","conseil inconnu pour "+this.a.a))},
a5(a,b,c){var t,s
u.f.a(c)
if(b==="introduire_tranches"){t=A.S(c,"tube_id")
if(!B.a.u(B.f,t)||a.b.h(0,t)==null)throw A.a(A.b(t,"tube_id","tube rempli attendu"))
s="debut_"+t
if(a.k(s)!=null)throw A.a(A.m("Les tranches sont d\xe9j\xe0 dans "+t+"."))
return a.A(s,a.f)}throw A.a(A.b(b,"action","inconnue"))},
a1(a,b,c,d){var t,s,r,q,p
if(typeof c!="number")throw A.a(A.b(c,"valeur","nombre attendu"))
if(b==="longueur_initiale_cm"){t=2.7
s=!1}else{r=b.split("_")
if(3>=r.length)return A.h(r,3)
q="tube_"+r[3]
t=this.bc(a,q)
p=a.k("debut_"+q)
s=p!=null&&a.f-p<7200}return new A.B(b,c,d,t,A.i(["tropTot",s,"tolerance",0.05],u.N,u.X))},
a_(a){var t,s,r,q,p,o,n,m=A.e([],u.s),l=new A.cN(m)
if(this.aY(a))l.$1("tubes_identiques")
for(t=a.d,s=t.length,r=0;r<s;++r){q=t[r]
p=q.e
if(p.h(0,"tropTot")===!0)l.$1("mesure_trop_tot")
o=q.d
n=q.b
if(o!=null&&typeof n=="number"&&Math.abs(n-o)>A.a5(p.h(0,"tolerance")))l.$1("lecture_longueur")}return m},
a3(a){var t,s,r=A.G(u.N,u.X)
for(t=a.gY(),t=new A.W(t,t.r,t.e,A.f(t).i("W<2>"));t.n();){s=t.d
r.j(0,s.a,s.b)}return r}}
A.cM.prototype={
$1(a){var t=this.a,s="debut_"+A.k(a)
if(t.k(s)!=null){s=t.k(s)
s.toString
s=t.f-s>=7200
t=s}else t=!1
return t},
$S:0}
A.cN.prototype={
$1(a){var t=this.a
if(!B.a.u(t,a))B.a.t(t,a)},
$S:1}
A.bR.prototype={
gN(){return A.l(["placer_materiel","agiter","mesurer","terminer"],u.N)},
gK(){return A.l(["hauteur_sable_cm","hauteur_limon_cm","hauteur_argile_cm","hauteur_terre_totale_cm","pourcentage_sable","pourcentage_limon","pourcentage_argile"],u.N)},
a0(){return B.o},
a2(a){var t,s=a.k("fin_agitation_s")
if(s!=null){t=a.k("agitation_s")
t=(t==null?0:t)<180}else t=!0
if(t)return 0
return B.h.aF((a.f-s)/86400,0,1)},
L(a,b){return A.n(A.b(a,"exige","aucune condition pour "+this.a.a))},
W(a,b){var t,s
switch(a){case"agitation_a_faire":t=b.b
s=!1
if(t.l("terre"))if(t.l("eau")){t=b.k("agitation_s")
t=(t==null?0:t)===0}else t=s
else t=s
return t
case"couches_visibles":return this.a2(b)>=1}throw A.a(A.b(a,"quand","conseil inconnu pour "+this.a.a))},
a5(a,b,c){var t,s
u.f.a(c)
if(b==="agiter"){t=A.ak(c,"duree_s")
if(t<=0)throw A.a(A.b(t,"duree_s","positive attendue"))
s=a.b
if(!s.l("terre")||!s.l("eau"))throw A.a(A.m("Mets la terre puis l'eau dans le bocal avant d'agiter."))
s=a.k("agitation_s")
return a.ae(A.i(["agitation_s",(s==null?0:s)+t,"fin_agitation_s",a.f],u.N,u.K))}throw A.a(A.b(b,"action","inconnue"))},
a1(a,b,c,d){var t,s,r,q,p,o,n,m,l="agitation_s"
if(typeof c!="number")throw A.a(A.b(c,"valeur","nombre attendu"))
t=this.a2(a)
s=b.split("_")
if(1>=s.length)return A.h(s,1)
r=s[1]
s=b==="hauteur_terre_totale_cm"
if(s)q=a.b.l("terre")?9.9:null
else if(t>0)if(B.b.S(b,"hauteur_")){p=this.a2(a)
o=B.v.h(0,r)
o.toString
q=p*o}else{p=B.v.h(0,r)
p.toString
q=100*p/9.9}else q=null
p=B.b.S(b,"pourcentage_")
o=p?0.3:0.1
n=a.k(l)
if(n==null)n=0
m=!1
if(!s)if(t<1){s=a.k(l)
s=(s==null?0:s)>=180}else s=m
else s=m
return new A.B(b,c,d,q,A.i(["tolerance",o,"pourcentage",p,"agitationInsuffisante",n<180,"tropTot",s],u.N,u.X))},
a_(a){var t,s,r,q,p,o,n,m=A.e([],u.s),l=new A.cO(m)
for(t=a.d,s=t.length,r=0;r<s;++r){q=t[r]
if(q.a==="hauteur_terre_totale_cm")continue
p=q.e
if(p.h(0,"agitationInsuffisante")===!0)l.$1("agitation_insuffisante")
if(p.h(0,"tropTot")===!0)l.$1("mesure_trop_tot")
o=q.d
n=q.b
if(o!=null&&typeof n=="number"&&Math.abs(n-o)>A.a5(p.h(0,"tolerance")))l.$1(p.h(0,"pourcentage")===!0?"pourcentage_faux":"lecture_hauteur")}return m},
a3(a){var t,s,r=A.G(u.N,u.X)
for(t=a.gY(),t=new A.W(t,t.r,t.e,A.f(t).i("W<2>"));t.n();){s=t.d
r.j(0,s.a,s.b)}return r}}
A.cO.prototype={
$1(a){var t=this.a
if(!B.a.u(t,a))B.a.t(t,a)},
$S:1}
A.bD.prototype={
aU(){return"Electrode."+this.b}}
A.bF.prototype={
bd(){var t=this,s=t.b.be().bR(),r=A.ea("\\.0+Z$")
return A.i(["rang",t.a,"horodatage",A.hK(s,r,"Z",0),"action",t.c,"valeurs",t.d],u.N,u.X)}}
A.aJ.prototype={
aU(){return"NiveauConseil."+this.b}}
A.bB.prototype={}
A.bZ.prototype={}
A.ci.prototype={}
A.B.prototype={}
A.ac.prototype={
X(a,b,c,d,e,f,g){var t,s,r,q,p,o,n=this
u.bR.a(b)
u.B.a(e)
u.e.a(c)
u.h.a(a)
t=d==null?n.a:d
s=b==null?n.b:A.dn(b,u.N,u.u)
r=e==null?n.c:A.dn(e,u.N,u.K)
q=c==null?n.d:A.e2(c,u.r)
p=a==null?n.e:A.e2(a,u.N)
o=f==null?n.f:f
return new A.ac(t,s,r,q,p,o,g==null?n.r:g)},
b7(a){var t=null
return this.X(t,t,t,t,a,t,t)},
bF(a){var t=null
return this.X(a,t,t,t,t,t,t)},
b6(a){var t=null
return this.X(t,t,t,a,t,t,t)},
bG(a){var t=null
return this.X(t,t,a,t,t,t,t)},
bI(a){var t=null
return this.X(t,t,t,t,t,t,a)},
b5(a){var t=null
return this.X(t,a,t,t,t,t,t)},
bH(a){var t=null
return this.X(t,t,t,t,t,a,t)},
V(a,b){var t=A.bU(this.b,u.N,u.u)
t.j(0,a,b)
return this.b5(t)},
A(a,b){var t=A.bU(this.c,u.N,u.K)
t.j(0,a,b)
return this.b7(t)},
ae(a){var t
u.Y.a(a)
t=A.bU(this.c,u.N,u.K)
t.O(0,a)
return this.b7(t)},
k(a){var t=this.c.h(0,a)
return typeof t=="number"?t:null},
ao(a){var t=this.c.h(0,a)
return typeof t=="string"?t:null},
gY(){var t,s,r,q,p=A.G(u.N,u.r)
for(t=this.d,s=t.length,r=0;r<s;++r){q=t[r]
p.j(0,q.a,q)}return p}}
A.c_.prototype={}
A.df.prototype={
$1(a){return Math.abs(A.a5(a)-this.a)<1e-12},
$S:2}
A.bS.prototype={
gZ(){return B.T},
ak(a,b){A.ay("deltaS",b)
return a.bH(a.f+b)},
aL(a){},
aa(a,b,c){return a.V(b,c)},
bD(a){var t,s,r,q,p=A.e([],u.t)
for(t=this.a.f,s=t.length,r=0;r<t.length;t.length===s||(0,A.bu)(t),++r){q=t[r]
if(this.W(q.a,a))p.push(q)}return p},
bC(a,b,c,d){var t,s,r,q,p,o,n,m=this
u.f.a(c)
if(a.r)throw A.a(A.ec("L'exp\xe9rience est termin\xe9e."))
if(!m.gN().u(0,b))throw A.a(A.b(b,"action","inconnue pour "+m.a.a))
for(t=m.a,s=t.e,r=s.length,t=t.d,q=a.b,p=0;p<s.length;s.length===r||(0,A.bu)(s),++p){o=s[p]
if(o.b!==b)continue
n=o.c
if(!(t.u(0,n)?q.l(n):m.L(n,a))){t=o.a
s=u.N
r=A.bV(a.e,s)
r.push(t)
q=a.a
return new A.c_(a.bF(r).b6(q+1),new A.bF(q,d,"action_bloquee",A.i(["regle_id",t],s,u.X)),!0,o.d)}}t=a.a
s=u.z
return new A.c_(m.bA(a,b,c).b6(t+1),new A.bF(t,d,b,A.dn(A.bU(c,s,s),u.N,u.X)),!1,null)},
bA(a,b,c){var t,s,r,q,p,o,n,m=this,l="materiel_id",k="emplacement_id",j="grandeur_id"
u.f.a(c)
switch(b){case"placer_materiel":t=A.S(c,l)
s=m.a
if(!s.d.u(0,t))throw A.a(A.b(t,l,"mat\xe9riel inconnu pour "+s.a))
r=c.h(0,k)
if(r!=null){if(typeof r=="string"){s=m.gZ().h(0,t)
s=s==null?null:s.u(0,r)
s=s!==!0}else s=!0
if(s)throw A.a(A.b(r,k,"emplacement non permis pour "+t))}m.aL(a)
return m.aa(a,t,A.dC(r))
case"mesurer":q=A.S(c,j)
if(!m.gK().u(0,q))throw A.a(A.b(q,j,"grandeur inconnue pour "+m.a.a))
p=c.h(0,"valeur")
if(typeof p!="number"&&typeof p!="string")throw A.a(A.b(p,"valeur","nombre ou texte attendu"))
o=A.dC(c.h(0,"unite"))
if(o==null)o=""
p.toString
s=m.a1(a,q,p,o)
n=A.bV(a.d,u.r)
n.push(s)
return a.bG(n)
case"terminer":return a.bI(!0)
default:return m.a5(a,b,c)}}}
A.dg.prototype={
$1(a){var t,s,r=$.dF=A.hv(A.fb(u.c.a(B.d.b8(A.k(a),null))))
$.a6=r.a0()
t=A.hg(r)
s=$.a6
s.toString
return B.d.a8(A.i(["meta",t,"vue",A.bt(r,s)],u.N,u.X),null)},
$S:10}
A.dh.prototype={
$3(a,b,c){return A.fK(A.k(a),A.k(b),A.k(c))},
$S:11}
A.di.prototype={
$1(a){return A.fR(A.a5(a))},
$S:12};(function aliases(){var t=J.ad.prototype
t.bk=t.m
t=A.bS.prototype
t.aM=t.ak})();(function installTearOffs(){var t=hunkHelpers._static_2,s=hunkHelpers._instance_1u,r=hunkHelpers._instance_1i,q=hunkHelpers._static_1
t(J,"h3","fd",13)
s(A.w.prototype,"gb4","l",3)
r(A.ah.prototype,"gb3","u",3)
s(A.aq.prototype,"gb4","l",3)
q(A,"ht","fV",14)
s(A.aI.prototype,"gav","bn",0)})();(function inheritance(){var t=hunkHelpers.mixin,s=hunkHelpers.inherit,r=hunkHelpers.inheritMany
s(A.j,null)
r(A.j,[A.dq,J.bI,A.bb,J.am,A.d,A.aT,A.t,A.d0,A.K,A.a4,A.aq,A.aU,A.at,A.ae,A.d1,A.cT,A.a9,A.L,A.cP,A.b6,A.W,A.b5,A.bM,A.bk,A.d3,A.Y,A.c5,A.d9,A.bm,A.c8,A.au,A.H,A.br,A.bz,A.bC,A.d7,A.ab,A.d4,A.bc,A.d5,A.cj,A.X,A.b8,A.aM,A.b3,A.cU,A.bS,A.cV,A.b4,A.bh,A.cW,A.cX,A.cd,A.cY,A.ce,A.bF,A.bB,A.bZ,A.ci,A.B,A.ac,A.c_])
r(J.bI,[J.bK,J.aY,J.aH,J.aF,J.ao])
r(J.aH,[J.ad,J.p])
r(J.ad,[J.d_,J.af,J.aZ])
s(J.bJ,A.bb)
s(J.ck,J.p)
r(J.aF,[J.aX,J.bL])
r(A.d,[A.ag,A.o,A.D,A.bj,A.aN])
r(A.ag,[A.an,A.bs])
s(A.bi,A.an)
s(A.bg,A.bs)
s(A.a_,A.bg)
r(A.t,[A.bT,A.bd,A.bN,A.c3,A.c0,A.c4,A.b_,A.bw,A.J,A.bf,A.aL,A.bA])
r(A.o,[A.Z,A.V,A.b7,A.ap])
r(A.Z,[A.ar,A.c7])
s(A.aO,A.aq)
s(A.be,A.aO)
s(A.aV,A.be)
s(A.w,A.aU)
r(A.ae,[A.aW,A.bl])
s(A.aa,A.aW)
s(A.b9,A.bd)
r(A.a9,[A.by,A.c2,A.cg,A.ch,A.cp,A.cs,A.cr,A.ct,A.cu,A.cv,A.cw,A.cq,A.cx,A.cy,A.cz,A.cA,A.cC,A.cD,A.cB,A.cF,A.cG,A.cH,A.cI,A.cJ,A.cK,A.cL,A.cM,A.cN,A.cO,A.df,A.dg,A.dh,A.di])
r(A.c2,[A.c1,A.aD])
r(A.L,[A.a1,A.c6])
r(A.by,[A.cl,A.cQ,A.cS,A.d8,A.cE])
s(A.bn,A.c4)
s(A.ah,A.bl)
s(A.bO,A.b_)
s(A.cm,A.bz)
r(A.bC,[A.co,A.cn])
s(A.d6,A.d7)
r(A.J,[A.ba,A.bH])
r(A.bS,[A.bP,A.aI,A.b0,A.b1,A.b2,A.bQ,A.bR])
r(A.d4,[A.bD,A.aJ])
t(A.bs,A.H)
t(A.aO,A.br)})()
var v={G:typeof self!="undefined"?self:globalThis,typeUniverse:{eC:new Map(),tR:{},eT:{},tPV:{},sEA:[]},mangledGlobalNames:{a7:"int",A:"double",I:"num",c:"String",r:"bool",b8:"Null",F:"List",j:"Object",z:"Map",aG:"JSObject"},mangledNames:{},types:["r(c)","~(c)","r(A)","r(j?)","~(j?,j?)","a7(c?)","c(B)","~(@,@)","A(c,r)","r(B)","c(c)","c(c,c,c)","c(A)","a7(@,@)","@(@)"],arrayRti:Symbol("$ti")}
A.fG(v.typeUniverse,JSON.parse('{"d_":"ad","af":"ad","aZ":"ad","bK":{"r":[],"a2":[]},"aY":{"a2":[]},"aH":{"aG":[]},"ad":{"aG":[]},"p":{"F":["1"],"o":["1"],"aG":[],"d":["1"]},"bJ":{"bb":[]},"ck":{"p":["1"],"F":["1"],"o":["1"],"aG":[],"d":["1"]},"am":{"x":["1"]},"aF":{"A":[],"I":[],"T":["I"]},"aX":{"A":[],"a7":[],"I":[],"T":["I"],"a2":[]},"bL":{"A":[],"I":[],"T":["I"],"a2":[]},"ao":{"c":[],"T":["c"],"cZ":[],"a2":[]},"ag":{"d":["2"]},"aT":{"x":["2"]},"an":{"ag":["1","2"],"d":["2"],"d.E":"2"},"bi":{"an":["1","2"],"ag":["1","2"],"o":["2"],"d":["2"],"d.E":"2"},"bg":{"H":["2"],"F":["2"],"ag":["1","2"],"o":["2"],"d":["2"]},"a_":{"bg":["1","2"],"H":["2"],"F":["2"],"ag":["1","2"],"o":["2"],"d":["2"],"d.E":"2","H.E":"2"},"bT":{"t":[]},"o":{"d":["1"]},"Z":{"o":["1"],"d":["1"]},"K":{"x":["1"]},"ar":{"Z":["2"],"o":["2"],"d":["2"],"d.E":"2","Z.E":"2"},"D":{"d":["1"],"d.E":"1"},"a4":{"x":["1"]},"aV":{"be":["1","2"],"aO":["1","2"],"aq":["1","2"],"br":["1","2"],"z":["1","2"]},"aU":{"z":["1","2"]},"w":{"aU":["1","2"],"z":["1","2"]},"bj":{"d":["1"],"d.E":"1"},"at":{"x":["1"]},"aW":{"ae":["1"],"as":["1"],"o":["1"],"d":["1"]},"aa":{"aW":["1"],"ae":["1"],"as":["1"],"o":["1"],"d":["1"]},"b9":{"t":[]},"bN":{"t":[]},"c3":{"t":[]},"a9":{"aE":[]},"by":{"aE":[]},"c2":{"aE":[]},"c1":{"aE":[]},"aD":{"aE":[]},"c0":{"t":[]},"a1":{"L":["1","2"],"dX":["1","2"],"z":["1","2"],"L.K":"1","L.V":"2"},"V":{"o":["1"],"d":["1"],"d.E":"1"},"b6":{"x":["1"]},"b7":{"o":["1"],"d":["1"],"d.E":"1"},"W":{"x":["1"]},"ap":{"o":["X<1,2>"],"d":["X<1,2>"],"d.E":"X<1,2>"},"b5":{"x":["X<1,2>"]},"bM":{"fm":[],"cZ":[]},"bk":{"du":[]},"d3":{"x":["du"]},"c4":{"t":[]},"bn":{"t":[]},"bm":{"x":["1"]},"aN":{"d":["1"],"d.E":"1"},"ah":{"ae":["1"],"e_":["1"],"as":["1"],"o":["1"],"d":["1"]},"au":{"x":["1"]},"L":{"z":["1","2"]},"aq":{"z":["1","2"]},"be":{"aO":["1","2"],"aq":["1","2"],"br":["1","2"],"z":["1","2"]},"ae":{"as":["1"],"o":["1"],"d":["1"]},"bl":{"ae":["1"],"as":["1"],"o":["1"],"d":["1"]},"c6":{"L":["c","@"],"z":["c","@"],"L.K":"c","L.V":"@"},"c7":{"Z":["c"],"o":["c"],"d":["c"],"d.E":"c","Z.E":"c"},"b_":{"t":[]},"bO":{"t":[]},"ab":{"T":["ab"]},"A":{"I":[],"T":["I"]},"a7":{"I":[],"T":["I"]},"F":{"o":["1"],"d":["1"]},"I":{"T":["I"]},"as":{"o":["1"],"d":["1"]},"c":{"T":["c"],"cZ":[]},"bw":{"t":[]},"bd":{"t":[]},"J":{"t":[]},"ba":{"t":[]},"bH":{"t":[]},"bf":{"t":[]},"aL":{"t":[]},"bA":{"t":[]},"bc":{"t":[]},"aM":{"fo":[]}}'))
A.fF(v.typeUniverse,JSON.parse('{"bs":2,"bl":1,"bz":2,"bC":2}'))
var u=(function rtii(){var t=A.aj
return{U:t("T<@>"),O:t("w<c,j>"),J:t("w<c,A>"),M:t("aa<c>"),k:t("ab"),Q:t("o<@>"),V:t("t"),Z:t("aE"),W:t("d<@>"),t:t("p<bB>"),p:t("p<F<A>>"),A:t("p<z<c,j>>"),q:t("p<z<c,c>>"),x:t("p<bZ>"),s:t("p<c>"),n:t("p<A>"),b:t("p<@>"),T:t("aY"),m:t("aG"),L:t("aZ"),a:t("F<c>"),w:t("F<A>"),j:t("F<@>"),Y:t("z<c,j>"),c:t("z<c,@>"),G:t("z<@,@>"),f:t("z<c,j?>"),r:t("B"),P:t("b8"),K:t("j"),_:t("hS"),F:t("du"),C:t("as<c>"),N:t("c"),R:t("a2"),o:t("af"),v:t("D<A>"),y:t("r"),D:t("r(A)"),i:t("A"),z:t("@"),S:t("a7"),d:t("dS<b8>?"),E:t("aG?"),e:t("F<B>?"),h:t("F<c>?"),l:t("F<@>?"),B:t("z<c,j>?"),bR:t("z<c,c?>?"),X:t("j?"),u:t("c?"),g:t("c8?"),cG:t("r?"),I:t("A?"),a3:t("a7?"),ae:t("I?"),H:t("I"),cQ:t("~(c,@)")}})();(function constants(){var t=hunkHelpers.makeConstList
B.D=J.bI.prototype
B.a=J.p.prototype
B.c=J.aX.prototype
B.h=J.aF.prototype
B.b=J.ao.prototype
B.E=J.aH.prototype
B.y=function getTagFallback(o) {
  var s = Object.prototype.toString.call(o);
  return s.substring(8, s.length - 1);
}
B.d=new A.cm()
B.ab=new A.cU()
B.e=t([0.1,0.3,1,3],u.n)
B.q=t([3,10,30],u.n)
B.ac=new A.cV()
B.ad=new A.cW()
B.ae=new A.cX()
B.l=t([0.1,0.2,0.5,1,2,5,10],u.n)
B.r=t([0.0001,0.0002,0.0005,0.001,0.002,0.005,0.01,0.02],u.n)
B.af=new A.cY()
B.ag=new A.d0()
B.z=new A.bD(0,"anode")
B.A=new A.bD(1,"cathode")
B.m={}
B.k=new A.w(B.m,[],A.aj("w<c,c?>"))
B.a1={volume_verse_ml:0,debit:1,volume_acide_ml:2}
B.W=new A.w(B.a1,[0,"ferme",0],u.O)
B.i=t([],A.aj("p<B>"))
B.j=t([],u.s)
B.B=new A.ac(1,B.k,B.W,B.i,B.j,0,!1)
B.a5={tension_generateur_v:0,interrupteur_ferme:1}
B.V=new A.w(B.a5,[0,!1],u.O)
B.C=new A.ac(1,B.k,B.V,B.i,B.j,0,!1)
B.U=new A.w(B.m,[],u.O)
B.o=new A.ac(1,B.k,B.U,B.i,B.j,0,!1)
B.F=new A.cn(null)
B.G=new A.co(null)
B.H=new A.b3(0,!1,!0)
B.p=new A.b4(null,null,null,!1,!1)
B.I=t(["eau_distillee","solution_saccharose_125","solution_saccharose_250","solution_saccharose_375"],u.s)
B.L=t(["objet_lumineux","lentille_convergente","ecran"],u.s)
B.M=t(["alimentation","interrupteur_k","rheostat","amperemetre","papier_filtre","electrode_a","electrode_b"],u.s)
B.t=t(["ferme","goutte_a_goutte","jet"],u.s)
B.X=new A.aJ(0,"information")
B.Y=new A.aJ(1,"avertissement")
B.Z=new A.aJ(2,"validation")
B.O=t([B.X,B.Y,B.Z],A.aj("p<aJ>"))
B.Q=t(["u_continue_v","periode_s","frequence_hz","um_v","ueff_v"],u.s)
B.f=t(["tube_1","tube_2","tube_3","tube_4"],u.s)
B.u=t(["cristal_sulfate_cuivre","cristal_permanganate"],u.s)
B.a7={eau_distillee:0,solution_saccharose_125:1,solution_saccharose_250:2,solution_saccharose_375:3}
B.J=t([3.1,3.2,3.1,3.1],u.n)
B.P=t([2.7,2.7,2.7,2.7],u.n)
B.N=t([2.4,2.5,2.3,2.4],u.n)
B.K=t([2.2,2.1,2.1,2.2],u.n)
B.R=new A.w(B.a7,[B.J,B.P,B.N,B.K],A.aj("w<c,F<A>>"))
B.a2={sable:0,limon:1,argile:2}
B.v=new A.w(B.a2,[4.8,1.9,3.2],u.J)
B.a0={objet_lumineux:0,lentille_convergente:1,ecran:2}
B.S=new A.w(B.a0,[0,50,100],u.J)
B.T=new A.w(B.m,[],A.aj("w<c,as<c>>"))
B.w=new A.w(B.m,[],A.aj("w<c,j?>"))
B.a_={id:0,matiere:1,niveau:2,materiel:3,securite:4,conseils:5,calcul:6}
B.n=new A.aa(B.a_,7,u.M)
B.a6={point_1:0,point_2:1,point_3:2,branche_principale:3,branche_r1:4,branche_r2:5,bornes_r1:6,bornes_r2:7,bornes_generateur:8}
B.x=new A.aa(B.a6,9,u.M)
B.a4={mesure_intensite:0,lois_courant:1,mesure_tension_masse:2,lois_tensions:3}
B.a8=new A.aa(B.a4,4,u.M)
B.a3={position_a_cm:0,position_o_cm:1,position_l1_cm:2,position_l2_cm:3,oa_cm:4,oa_prime_cm:5}
B.a9=new A.aa(B.a3,6,u.M)
B.aa=A.hO("j")})();(function staticFields(){$.P=A.e([],A.aj("p<j>"))
$.e3=null
$.dO=null
$.dN=null
$.dF=null
$.a6=null})();(function lazyInitializers(){var t=hunkHelpers.lazyFinal
t($,"hQ","eH",()=>A.eD("_$dart_dartClosure"))
t($,"hP","dl",()=>A.eD("_$dart_dartClosure_dartJSInterop"))
t($,"i3","eU",()=>A.e([new J.bJ()],A.aj("p<bb>")))
t($,"hT","eJ",()=>A.a3(A.d2({
toString:function(){return"$receiver$"}})))
t($,"hU","eK",()=>A.a3(A.d2({$method$:null,
toString:function(){return"$receiver$"}})))
t($,"hV","eL",()=>A.a3(A.d2(null)))
t($,"hW","eM",()=>A.a3(function(){var $argumentsExpr$="$arguments$"
try{null.$method$($argumentsExpr$)}catch(s){return s.message}}()))
t($,"hZ","eP",()=>A.a3(A.d2(void 0)))
t($,"i_","eQ",()=>A.a3(function(){var $argumentsExpr$="$arguments$"
try{(void 0).$method$($argumentsExpr$)}catch(s){return s.message}}()))
t($,"hY","eO",()=>A.a3(A.ef(null)))
t($,"hX","eN",()=>A.a3(function(){try{null.$method$}catch(s){return s.message}}()))
t($,"i1","eS",()=>A.a3(A.ef(void 0)))
t($,"i0","eR",()=>A.a3(function(){try{(void 0).$method$}catch(s){return s.message}}()))
t($,"hR","eI",()=>A.ea("^([+-]?\\d{4,6})-?(\\d\\d)-?(\\d\\d)(?:[ T](\\d\\d)(?::?(\\d\\d)(?::?(\\d\\d)(?:[.,](\\d+))?)?)?( ?[zZ]| ?([-+])(\\d\\d)(?::?(\\d\\d))?)?)?$"))
t($,"i2","eT",()=>A.eE(B.aa))})();(function nativeSupport(){!function(){var t=function(a){var n={}
n[a]=1
return Object.keys(hunkHelpers.convertToFastObject(n))[0]}
v.getIsolateTag=function(a){return t("___dart_"+a+v.isolateTag)}
var s="___dart_isolate_tags_"
var r=Object[s]||(Object[s]=Object.create(null))
var q="_ZxYxX"
for(var p=0;;p++){var o=t(q+"_"+p+"_")
if(!(o in r)){r[o]=1
v.isolateTag=o
break}}}()
hunkHelpers.setOrUpdateInterceptorsByTag({})
hunkHelpers.setOrUpdateLeafTags({})})()
Function.prototype.$0=function(){return this()}
Function.prototype.$2=function(a,b){return this(a,b)}
Function.prototype.$1=function(a){return this(a)}
Function.prototype.$3=function(a,b,c){return this(a,b,c)}
Function.prototype.$4=function(a,b,c,d){return this(a,b,c,d)}
Function.prototype.$1$0=function(){return this()}
convertAllToFastObject(w)
convertToFastObject($);(function(a){if(typeof document==="undefined"){a(null)
return}if(typeof document.currentScript!="undefined"){a(document.currentScript)
return}var t=document.scripts
function onLoad(b){for(var r=0;r<t.length;++r){t[r].removeEventListener("load",onLoad,false)}a(b.target)}for(var s=0;s<t.length;++s){t[s].addEventListener("load",onLoad,false)}})(function(a){v.currentScript=a
var t=A.hE
if(typeof dartMainRunner==="function"){dartMainRunner(t,[])}else{t([])}})})()