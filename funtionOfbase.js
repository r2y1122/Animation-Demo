//获取svg元素
function $(el, attr) {
    if (attr) {
        if (typeof el == "string") {
            el = $(el);
        }
        if (typeof attr == "string") {
            if (attr.substring(0, 6) == "xlink:") {
                return el.getAttributeNS(xlink, attr.substring(6));
            }
            return el.getAttribute(attr);
        }
        for (var key in attr) if (attr[has](key)) {
            var val = Str(attr[key]);
            if (val) {
                if (key.substring(0, 6) == "xlink:") {
                    el.setAttributeNS(xlink, key.substring(6), val);
                } else {
                    el.setAttribute(key, val);
                }
            } else {
                el.removeAttribute(key);
            }
        }
    } else {
        el = glob.doc.createElementNS("http://www.w3.org/2000/svg", el);
        // el.style && (el.style.webkitTapHighlightColor = "rgba(0,0,0,0)");
    }
    return el;
}

//获取svg属性
function getAttrs(el) {
    var attrs = el.attributes,
        name,
        out = {};
    for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].namespaceURI == xlink) {
            name = "xlink:";
        } else {
            name = "";
        }
        name += attrs[i].name;
        out[name] = attrs[i].textContent;
    }
    return out;
}

//克隆节点
function clone(obj) {
    if (typeof obj == "function" || Object(obj) !== obj) {
        return obj;
    }
    var res = new obj.constructor;
    for (var key in obj) if (obj[has](key)) {
        res[key] = clone(obj[key]);
    }
    return res;
}
//ellipse设置（椭圆）
ellipse = function (cx, cy, rx, ry) {
        var el = make("ellipse", this.node);
        if (is(cx, "object") && "cx" in cx) {
            el.attr(cx);
        } else if (cx != null) {
            el.attr({
                cx: cx,
                cy: cy,
                rx: rx,
                ry: ry
            });
        }
        return el;
    };
//Group设置（组）
group = proto.g = function (first) {
        var el = make("g", this.node);
        el.add = add2group;
        for (var method in proto) if (proto[has](method)) {
            el[method] = proto[method];
        }
        if (arguments.length == 1 && first && !first.type) {
            el.attr(first);
        } else if (arguments.length) {
            el.add(Array.prototype.slice.call(arguments, 0));
        }
        return el;
};
//text设置
text = function (x, y, text) {
        var el = make("text", this.node);
        if (is(x, "object")) {
            el.attr(x);
        } else if (x != null) {
            el.attr({
                x: x,
                y: y,
                text: text || ""
            });
        }
        return el;
};
//line设置（直线）
line = function (x1, y1, x2, y2) {
        var el = make("line", this.node);
        if (is(x1, "object")) {
            el.attr(x1);
        } else if (x1 != null) {
            el.attr({
                x1: x1,
                x2: x2,
                y1: y1,
                y2: y2
            });
        }
        return el;
};
//polyline设置（折线）
polyline = function (points) {
        if (arguments.length > 1) {
            points = Array.prototype.slice.call(arguments, 0);
        }
        var el = make("polyline", this.node);
        if (is(points, "object") && !is(points, "array")) {
            el.attr(points);
        } else if (points != null) {
            el.attr({
                points: points
            });
        }
        return el;
};
//polygon设置多边形
polygon = function (points) {
        if (arguments.length > 1) {
            points = Array.prototype.slice.call(arguments, 0);
        }
        var el = make("polygon", this.node);
        if (is(points, "object") && !is(points, "array")) {
            el.attr(points);
        } else if (points != null) {
            el.attr({
                points: points
            });
        }
        return el;
}
//circle设置圆形
circle = function (cx, cy, r) {
        var el = make("circle", this.node);
        if (is(cx, "object") && "cx" in cx) {
            el.attr(cx);
        } else if (cx != null) {
            el.attr({
                cx: cx,
                cy: cy,
                r: r
            });
        }
        return el;
};
//gradient 渐变描述
function gradient(defs, str) {
    var grad = arrayFirstValue(eve("snap.util.grad.parse", null, str)),
        el;
    if (!grad) {
        return null;
    }
    grad.params.unshift(defs);
    if (grad.type.toLowerCase() == "l") {
        el = gradientLinear.apply(0, grad.params);
    } else {
        el = gradientRadial.apply(0, grad.params);
    }
    if (grad.type != grad.type.toLowerCase()) {
        $(el.node, {
            gradientUnits: "userSpaceOnUse"
        });
    }
    var stops = grad.stops,
        len = stops.length,
        start = 0,
        j = 0;
    function seed(i, end) {
        var step = (end - start) / (i - j);
        for (var k = j; k < i; k++) {
            stops[k].offset = +(+start + step * (k - j)).toFixed(2);
        }
        j = i;
        start = end;
    }
    len--;
    for (var i = 0; i < len; i++) if ("offset" in stops[i]) {
        seed(i, stops[i].offset);
    }
    stops[len].offset = stops[len].offset || 100;
    seed(len, stops[len].offset);
    for (i = 0; i <= len; i++) {
        var stop = stops[i];
        el.addStop(stop.color, stop.offset);
    }
    return el;
}
function gradientLinear(defs, x1, y1, x2, y2) {
    var el = make("linearGradient", defs);
    el.stops = Gstops;
    el.addStop = GaddStop;
    el.getBBox = GgetBBox;
    if (x1 != null) {
        $(el.node, {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
        });
    }
    return el;
}
function gradientRadial(defs, cx, cy, r, fx, fy) {
    var el = make("radialGradient", defs);
    el.stops = Gstops;
    el.addStop = GaddStop;
    el.getBBox = GgetBBox;
    if (cx != null) {
        $(el.node, {
            cx: cx,
            cy: cy,
            r: r
        });
    }
    if (fx != null && fy != null) {
        $(el.node, {
            fx: fx,
            fy: fy
        });
    }
    return el;
}
function arrayFirstValue(arr) {
    var res;
    for (var i = 0, ii = arr.length; i < ii; i++) {
        res = res || arr[i];
        if (res) {
            return res;
        }
    }
}
function make(name, parent) {
    var res = $(name);
    parent.appendChild(res);
    var el = wrap(res);
    el.type = name;
    return el;
}
function Paper(w, h) {
    var res,
        desc,
        defs,
        proto = Paper.prototype;
    if (w && w.tagName == "svg") {
        if (w.snap in hub) {
            return hub[w.snap];
        }
        res = new Element(w);
        desc = w.getElementsByTagName("desc")[0];
        defs = w.getElementsByTagName("defs")[0];
        if (!desc) {
            desc = $("desc");
            desc.appendChild(glob.doc.createTextNode("Created with Snap"));
            res.node.appendChild(desc);
        }
        if (!defs) {
            defs = $("defs");
            res.node.appendChild(defs);
        }
        res.defs = defs;
        for (var key in proto) if (proto[has](key)) {
            res[key] = proto[key];
        }
        res.paper = res.root = res;
    } else {
        res = make("svg", glob.doc.body);
        $(res.node, {
            height: h,
            version: 1.1,
            width: w,
            xmlns: "http://www.w3.org/2000/svg"
        });
    }
    return res;
}
function wrap(dom) {
    if (!dom) {
        return dom;
    }
    if (dom instanceof Element || dom instanceof Fragment) {
        return dom;
    }
    if (dom.tagName == "svg") {
        return new Paper(dom);
    }
    return new Element(dom);
}
//image svg图片
function image (src, x, y, width, height) {
        var el = make("image", this.node);
        if (is(src, "object") && "src" in src) {
            el.attr(src);
        } else if (src != null) {
            var set = {
                "xlink:href": src,
                preserveAspectRatio: "none"
            };
            if (x != null && y != null) {
                set.x = x;
                set.y = y;
            }
            if (width != null && height != null) {
                set.width = width;
                set.height = height;
            } else {
                preload(src, function () {
                    $(el.node, {
                        width: this.offsetWidth,
                        height: this.offsetHeight
                    });
                });
            }
            $(el.node, set);
        }
        return el;
    };
    
//照片加载失败后重新加载
function preload  (function () {
    function onerror() {
        this.parentNode.removeChild(this);
    }
    return function (src, f) {
        var img = glob.doc.createElement("img"),
            body = glob.doc.body;
        img.style.cssText = "position:absolute;left:-9999em;top:-9999em";
        img.onload = function () {
            f.call(img);
            img.onload = img.onerror = null;
            body.removeChild(img);
        };
        img.onerror = onerror;
        body.appendChild(img);
        img.src = src;
    };
}());
//画矩形
function rect (x, y, w, h, rx, ry) {
        var el = make("rect", this.node);
        if (ry == null) {
            ry = rx;
        }
        if (is(x, "object") && "x" in x) {
            el.attr(x);
        } else if (x != null) {
            el.attr({
                x: x,
                y: y,
                width: w,
                height: h
            });
            if (rx != null) {
                el.attr({
                    rx: rx,
                    ry: ry
                });
            }
        }
        return el;
  };
  var Tween = {
      linear: function (t, b, c, d){  //匀速
         return c*t/d + b;
      },
      easeIn: function(t, b, c, d){  //加速曲线
         return c*(t/=d)*t + b;
      },
      easeOut: function(t, b, c, d){  //减速曲线
         return -c *(t/=d)*(t-2) + b;
      },
      easeBoth: function(t, b, c, d){  //加速减速曲线
         if ((t/=d/2) < 1) {
            return c/2*t*t + b;
         }
         return -c/2 * ((--t)*(t-2) - 1) + b;
      },
      easeInStrong: function(t, b, c, d){  //加加速曲线
         return c*(t/=d)*t*t*t + b;
      },
      easeOutStrong: function(t, b, c, d){  //减减速曲线
         return -c * ((t=t/d-1)*t*t*t - 1) + b;
      },
      easeBothStrong: function(t, b, c, d){  //加加速减减速曲线
         if ((t/=d/2) < 1) {
            return c/2*t*t*t*t + b;
         }
         return -c/2 * ((t-=2)*t*t*t - 2) + b;
      },
      elasticIn: function(t, b, c, d, a, p){  //正弦衰减曲线（弹动渐入）
         if (t === 0) {
            return b;
         }
         if ( (t /= d) == 1 ) {
            return b+c;
         }
         if (!p) {
            p=d*0.3;
         }
         if (!a || a < Math.abs(c)) {
            a = c;
            var s = p/4;
         } else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
         }
         return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
      },
      elasticOut: function(t, b, c, d, a, p){    //正弦增强曲线（弹动渐出）
         if (t === 0) {
            return b;
         }
         if ( (t /= d) == 1 ) {
            return b+c;
         }
         if (!p) {
            p=d*0.3;
         }
         if (!a || a < Math.abs(c)) {
            a = c;
            var s = p / 4;
         } else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
         }
         return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
      },
      elasticBoth: function(t, b, c, d, a, p){
         if (t === 0) {
            return b;
         }
         if ( (t /= d/2) == 2 ) {
            return b+c;
         }
         if (!p) {
            p = d*(0.3*1.5);
         }
         if ( !a || a < Math.abs(c) ) {
            a = c;
            var s = p/4;
         }
         else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
         }
         if (t < 1) {
            return - 0.5*(a*Math.pow(2,10*(t-=1)) *
                  Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
         }
         return a*Math.pow(2,-10*(t-=1)) *
               Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
      },
      backIn: function(t, b, c, d, s){     //回退加速（回退渐入）
         if (typeof s == 'undefined') {
            s = 1.70158;
         }
         return c*(t/=d)*t*((s+1)*t - s) + b;
      },
      backOut: function(t, b, c, d, s){
         if (typeof s == 'undefined') {
            s = 3.70158;  //回缩的距离
         }
         return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
      },
      backBoth: function(t, b, c, d, s){
         if (typeof s == 'undefined') {
            s = 1.70158;
         }
         if ((t /= d/2 ) < 1) {
            return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
         }
         return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
      },
      bounceIn: function(t, b, c, d){    //弹球减振（弹球渐出）
         return c - Tween['bounceOut'](d-t, 0, c, d) + b;
      },
      bounceOut: function(t, b, c, d){
         if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t) + b;
         } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
         } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
         }
         return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
      },
      bounceBoth: function(t, b, c, d){
         if (t < d/2) {
            return Tween['bounceIn'](t*2, 0, c, d) * 0.5 + b;
         }
         return Tween['bounceOut'](t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
    }
    var getStyle(obj,attr){
        if(obj.currentStyle){
            return obj.currentStyle[attr]
        }else if(window.getComputedStyle){
            return getComputedStyle(obj,attr)[false]
        }
    } 
    var timeMoveFun(obj,t,JSON,type,fn){
        var startValue={};
        var startTime=(new Data()).getTime();
        var (var key in JSON){
            startValue[key]=0;
            if(key==="opacity"){
                startValue[key]=Math.round(getStyle(obj,key)*100);
            }else{
                startValue[key]=parseInt(getStyle(obj,key));
            }
        }
        clearInterval(obj.timer);
        obj.timer=setInterval(function(){
            var currentTime=(new Data()).getTime();
            var scale=1-Math.max(startTime+t-currentTime)/t;
            for(var key in JSON){
                var value=Tween[type](scale*t,startValue[key],JSON[key]-startValue[key],t);   
                if(key==="opacity"){
                    obj.style.filter='alpah(opacity("+value+"))';
                    obj.style.opacity=value/100;
                }else{
                    obj.style[key]=value+"px";
                }
            }
            if(scale===1){
                clearInterval(obj.timer);
                if(fn){
                    fn.call(obj,null);
                }
            }
        },30)
    }  
