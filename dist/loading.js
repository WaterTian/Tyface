window.Class = function(_class, _type) {
    var _this = this || window;
    var _string = _class.toString();
    var _name = _class.toString().match(/function ([^\(]+)/)[1];
    var _static = null;
    if (typeof _type === "function") {
        _static = _type;
        _type = null
    }
    _type = (_type || "").toLowerCase();
    _class.prototype.__call = function() {
        if (this.events) this.events.scope(this)
    };
    if (!_type) {
        _this[_name] = _class;
        _static && _static()
    } else {
        if (_type == "static") {
            _this[_name] = new _class
        } else if (_type == "singleton") {
            _this[_name] = function() {
                var __this = {};
                var _instance;
                __this.instance = function(a, b, c) {
                    if (!_instance) _instance = new _class(a, b, c);
                    return _instance
                };
                return __this
            }()
        }
    }
    if (this !== window) {
        if (!this.__namespace) this.__namespace = this.constructor.toString().match(/function ([^\(]+)/)[1];
        this[_name]._namespace = this.__namespace
    }
};
window.Inherit = function(child, parent, param) {
    if (typeof param === "undefined") param = child;
    var p = new parent(param, true);
    var save = {};
    for (var method in p) {
        child[method] = p[method];
        save[method] = p[method]
    }
    if (child.__call) child.__call();
    defer(function() {
        for (method in p) {
            if (child[method] && save[method] && child[method] !== save[method]) {
                child["_" + method] = save[method]
            }
        }
        p = save = null;
        child = parent = param = null
    })
};
Class(function Vector2(_x, _y) {
    var _this = this;
    var prototype = Vector2.prototype;
    this.x = typeof _x == "number" ? _x : 0;
    this.y = typeof _y == "number" ? _y : 0;
    this.type = "vector2";
    if (typeof prototype.set !== "undefined") return;
    prototype.set = function(x, y) {
        this.x = x;
        this.y = y;
        return this
    };
    prototype.clear = function() {
        this.x = 0;
        this.y = 0;
        return this
    };
    prototype.copyTo = function(v) {
        v.x = this.x;
        v.y = this.y;
        return this
    };
    prototype.copyFrom = prototype.copy = function(v) {
        this.x = v.x;
        this.y = v.y;
        return this
    };
    prototype.addVectors = function(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this
    };
    prototype.subVectors = function(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this
    };
    prototype.multiplyVectors = function(a, b) {
        this.x = a.x * b.x;
        this.y = a.y * b.y;
        return this
    };
    prototype.add = function(v) {
        this.x += v.x;
        this.y += v.y;
        return this
    };
    prototype.sub = function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this
    };
    prototype.multiply = function(v) {
        this.x *= v;
        this.y *= v;
        return this
    };
    prototype.divide = function(v) {
        this.x /= v;
        this.y /= v;
        return this
    };
    prototype.lengthSq = function() {
        return this.x * this.x + this.y * this.y || .00001
    };
    prototype.length = function() {
        return Math.sqrt(this.lengthSq())
    };
    prototype.setLength = function(length) {
        this.normalize().multiply(length);
        return this
    };
    prototype.normalize = function() {
        var length = this.length();
        this.x /= length;
        this.y /= length;
        return this
    };
    prototype.perpendicular = function(a, b) {
        var tx = this.x;
        var ty = this.y;
        this.x = -ty;
        this.y = tx;
        return this
    };
    prototype.lerp = function(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        return this
    };
    prototype.interp = function(v, alpha, ease) {
        var a = 0;
        var f = TweenManager.Interpolation.convertEase(ease);
        var calc = Vector2.__TEMP__;
        calc.subVectors(this, v);
        var dist = Utils.clamp(Utils.range(calc.lengthSq(), 0, 5e3 * 5e3, 1, 0), 0, 1) * (alpha / 10);
        if (typeof f === "function") a = f(dist);
        else a = TweenManager.Interpolation.solve(f, dist);
        this.x += (v.x - this.x) * a;
        this.y += (v.y - this.y) * a
    };
    prototype.setAngleRadius = function(a, r) {
        this.x = Math.cos(a) * r;
        this.y = Math.sin(a) * r;
        return this
    };
    prototype.addAngleRadius = function(a, r) {
        this.x += Math.cos(a) * r;
        this.y += Math.sin(a) * r;
        return this
    };
    prototype.clone = function() {
        return new Vector2(this.x, this.y)
    };
    prototype.dot = function(a, b) {
        b = b || this;
        return a.x * b.x + a.y * b.y
    };
    prototype.distanceTo = function(v, noSq) {
        var dx = this.x - v.x;
        var dy = this.y - v.y;
        if (!noSq) return Math.sqrt(dx * dx + dy * dy);
        return dx * dx + dy * dy
    };
    prototype.solveAngle = function(a, b) {
        if (!b) b = this;
        return Math.atan2(a.y - b.y, a.x - b.x)
    };
    prototype.equals = function(v) {
        return this.x == v.x && this.y == v.y
    };
    prototype.console = function() {
        console.log(this.x, this.y)
    };
    prototype.toString = function(split) {
        split = split || " ";
        return this.x + split + this.y
    }
}, function() {
    Vector2.__TEMP__ = new Vector2;
    Vector2.__TEMP2__ = new Vector2
});

Class(function Noise() {
    var module = this;

    function Grad(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z
    }
    Grad.prototype.dot2 = function(x, y) {
        return this.x * x + this.y * y
    };
    Grad.prototype.dot3 = function(x, y, z) {
        return this.x * x + this.y * y + this.z * z
    };
    var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0), new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1), new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];
    var p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
    var perm = new Array(512);
    var gradP = new Array(512);
    module.seed = function(seed) {
        if (seed > 0 && seed < 1) {
            seed *= 65536
        }
        seed = Math.floor(seed);
        if (seed < 256) {
            seed |= seed << 8
        }
        for (var i = 0; i < 256; i++) {
            var v;
            if (i & 1) {
                v = p[i] ^ seed & 255
            } else {
                v = p[i] ^ seed >> 8 & 255
            }
            perm[i] = perm[i + 256] = v;
            gradP[i] = gradP[i + 256] = grad3[v % 12]
        }
    };
    module.seed(0);
    var F2 = .5 * (Math.sqrt(3) - 1);
    var G2 = (3 - Math.sqrt(3)) / 6;
    var F3 = 1 / 3;
    var G3 = 1 / 6;
    module.simplex2 = function(xin, yin) {
        var n0, n1, n2;
        var s = (xin + yin) * F2;
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var t = (i + j) * G2;
        var x0 = xin - i + t;
        var y0 = yin - j + t;
        var i1, j1;
        if (x0 > y0) {
            i1 = 1;
            j1 = 0
        } else {
            i1 = 0;
            j1 = 1
        }
        var x1 = x0 - i1 + G2;
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1 + 2 * G2;
        var y2 = y0 - 1 + 2 * G2;
        i &= 255;
        j &= 255;
        var gi0 = gradP[i + perm[j]];
        var gi1 = gradP[i + i1 + perm[j + j1]];
        var gi2 = gradP[i + 1 + perm[j + 1]];
        var t0 = .5 - x0 * x0 - y0 * y0;
        if (t0 < 0) {
            n0 = 0
        } else {
            t0 *= t0;
            n0 = t0 * t0 * gi0.dot2(x0, y0)
        }
        var t1 = .5 - x1 * x1 - y1 * y1;
        if (t1 < 0) {
            n1 = 0
        } else {
            t1 *= t1;
            n1 = t1 * t1 * gi1.dot2(x1, y1)
        }
        var t2 = .5 - x2 * x2 - y2 * y2;
        if (t2 < 0) {
            n2 = 0
        } else {
            t2 *= t2;
            n2 = t2 * t2 * gi2.dot2(x2, y2)
        }
        return 70 * (n0 + n1 + n2)
    };
    module.simplex3 = function(xin, yin, zin) {
        var n0, n1, n2, n3;
        var s = (xin + yin + zin) * F3;
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var k = Math.floor(zin + s);
        var t = (i + j + k) * G3;
        var x0 = xin - i + t;
        var y0 = yin - j + t;
        var z0 = zin - k + t;
        var i1, j1, k1;
        var i2, j2, k2;
        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = 1;
                j1 = 0;
                k1 = 0;
                i2 = 1;
                j2 = 1;
                k2 = 0
            } else if (x0 >= z0) {
                i1 = 1;
                j1 = 0;
                k1 = 0;
                i2 = 1;
                j2 = 0;
                k2 = 1
            } else {
                i1 = 0;
                j1 = 0;
                k1 = 1;
                i2 = 1;
                j2 = 0;
                k2 = 1
            }
        } else {
            if (y0 < z0) {
                i1 = 0;
                j1 = 0;
                k1 = 1;
                i2 = 0;
                j2 = 1;
                k2 = 1
            } else if (x0 < z0) {
                i1 = 0;
                j1 = 1;
                k1 = 0;
                i2 = 0;
                j2 = 1;
                k2 = 1
            } else {
                i1 = 0;
                j1 = 1;
                k1 = 0;
                i2 = 1;
                j2 = 1;
                k2 = 0
            }
        }
        var x1 = x0 - i1 + G3;
        var y1 = y0 - j1 + G3;
        var z1 = z0 - k1 + G3;
        var x2 = x0 - i2 + 2 * G3;
        var y2 = y0 - j2 + 2 * G3;
        var z2 = z0 - k2 + 2 * G3;
        var x3 = x0 - 1 + 3 * G3;
        var y3 = y0 - 1 + 3 * G3;
        var z3 = z0 - 1 + 3 * G3;
        i &= 255;
        j &= 255;
        k &= 255;
        var gi0 = gradP[i + perm[j + perm[k]]];
        var gi1 = gradP[i + i1 + perm[j + j1 + perm[k + k1]]];
        var gi2 = gradP[i + i2 + perm[j + j2 + perm[k + k2]]];
        var gi3 = gradP[i + 1 + perm[j + 1 + perm[k + 1]]];
        var t0 = .6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) {
            n0 = 0
        } else {
            t0 *= t0;
            n0 = t0 * t0 * gi0.dot3(x0, y0, z0)
        }
        var t1 = .6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) {
            n1 = 0
        } else {
            t1 *= t1;
            n1 = t1 * t1 * gi1.dot3(x1, y1, z1)
        }
        var t2 = .6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) {
            n2 = 0
        } else {
            t2 *= t2;
            n2 = t2 * t2 * gi2.dot3(x2, y2, z2)
        }
        var t3 = .6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) {
            n3 = 0
        } else {
            t3 *= t3;
            n3 = t3 * t3 * gi3.dot3(x3, y3, z3)
        }
        return 32 * (n0 + n1 + n2 + n3)
    };

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10)
    }

    function lerp(a, b, t) {
        return (1 - t) * a + t * b
    }
    module.perlin = function(x) {
        return module.perlin2(x, 0)
    };
    module.perlin2 = function(x, y) {
        var X = Math.floor(x),
            Y = Math.floor(y);
        x = x - X;
        y = y - Y;
        X = X & 255;
        Y = Y & 255;
        var n00 = gradP[X + perm[Y]].dot2(x, y);
        var n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
        var n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
        var n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1);
        var u = fade(x);
        return lerp(lerp(n00, n10, u), lerp(n01, n11, u), fade(y))
    };
    module.perlin3 = function(x, y, z) {
        var X = Math.floor(x),
            Y = Math.floor(y),
            Z = Math.floor(z);
        x = x - X;
        y = y - Y;
        z = z - Z;
        X = X & 255;
        Y = Y & 255;
        Z = Z & 255;
        var n000 = gradP[X + perm[Y + perm[Z]]].dot3(x, y, z);
        var n001 = gradP[X + perm[Y + perm[Z + 1]]].dot3(x, y, z - 1);
        var n010 = gradP[X + perm[Y + 1 + perm[Z]]].dot3(x, y - 1, z);
        var n011 = gradP[X + perm[Y + 1 + perm[Z + 1]]].dot3(x, y - 1, z - 1);
        var n100 = gradP[X + 1 + perm[Y + perm[Z]]].dot3(x - 1, y, z);
        var n101 = gradP[X + 1 + perm[Y + perm[Z + 1]]].dot3(x - 1, y, z - 1);
        var n110 = gradP[X + 1 + perm[Y + 1 + perm[Z]]].dot3(x - 1, y - 1, z);
        var n111 = gradP[X + 1 + perm[Y + 1 + perm[Z + 1]]].dot3(x - 1, y - 1, z - 1);
        var u = fade(x);
        var v = fade(y);
        var w = fade(z);
        return lerp(lerp(lerp(n000, n100, u), lerp(n001, n101, u), w), lerp(lerp(n010, n110, u), lerp(n011, n111, u), w), v)
    }
}, "Static");



function LoaderUICircle() {
    var _size = 90;
    var _canvasSize = 90;
    var _draw = [];
    var _vertices = [];

    initVertices();

    function doRandom(min, max, precision) {
        if (typeof precision == "number") {
            var p = Math.pow(10, precision);
            return Math.round(rand(min, max) * p) / p
        } else {
            return Math.round(rand(min - .5, max + .5))
        }
    };

    function initVertices() {
        let radius = _size * .46;
        let num = 45;
        let inc = Math.PI * 2 / num;
        let angle = 0;
        let px = doRandom(0, .15);
        let py = doRandom(.05, .15);
        for (let i = 0; i < num; i++) {
            let random = Noise.perlin2(px, py);
            let x = radius * Math.cos(angle) + random + _canvasSize / 2;
            let y = radius * Math.sin(angle) + random + _canvasSize / 2;
            let v = new Vector2(x, y);

            v.origin = v.clone();
            _vertices.push(v);
            _draw.push(v);
            angle += inc;
            px += .17;
            py += .17;
        }

        _draw.push(_vertices[0]);
    }

    var _v1 = 0;
    var _v2 = 0;
    window.siv = setInterval(function() {
        let radius = _size * .46;
        let num = 45;
        let inc = Math.PI * 2 / num;
        var path = [];
        let angle = 0;
        let px = 0.1 * _v1;
        let py = 0.1 * _v2;

        _v1 += 1;
        _v2 -= 1;

        for (let i = 0; i < _vertices.length; i++) {

            var v = _vertices[i];
            let random = Noise.perlin2(px, py) * 3;
            let x = radius * Math.cos(angle) + random + _canvasSize / 2;
            let y = radius * Math.sin(angle) + random + _canvasSize / 2;
            v.x = x;
            v.y = y;
            angle += inc;
            px += 0.5;
            py += 0.5;

            if (i == 0) {
                path.push("M" + _draw[i].x + " " + _draw[i].y);
            }

            path.push("Q " + _draw[i].x.toFixed(8) + " " + _draw[i].y.toFixed(8) + " " + _draw[i + 1].x.toFixed(8) + " " + _draw[i + 1].y.toFixed(8));
        }

        var str = path.join(" ");
        document.getElementById('Path').setAttribute("d", str);

    }, 90);

    /**
     * 获取线性比例值
     * */
    function range(oldValue, oldMin, oldMax, newMin, newMax, clamped) {
        var oldRange = oldMax - oldMin;
        var newRange = newMax - newMin;
        var newValue = (oldValue - oldMin) * newRange / oldRange + newMin;
        //if (clamped) return _this.clamp(newValue, Math.min(newMin, newMax), Math.max(newMin, newMax));
        return newValue
    };

    function doRandom(min, max, precision) {
        if (typeof precision == "number") {
            var p = Math.pow(10, precision);
            return Math.round(rand(min, max) * p) / p
        } else {
            return Math.round(rand(min - .5, max + .5))
        }
    };

    function rand(min, max) {
        return lerp(Math.random(), min, max)
    }

    function lerp(ratio, start, end) {
        return start + (end - start) * ratio
    }

};

new LoaderUICircle();


////////// loader js


var brfv4BaseURL = "dist/brf_wasm/";
var support = (typeof WebAssembly === 'object');
if (support) {
    function testSafariWebAssemblyBug() {
        var bin = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 6, 1, 96, 1, 127, 1, 127, 3, 2, 1, 0, 5, 3, 1, 0, 1, 7, 8, 1, 4, 116, 101, 115, 116, 0, 0, 10, 16, 1, 14, 0, 32, 0, 65, 1, 54, 2, 0, 32, 0, 40, 2, 0, 11]);
        var mod = new WebAssembly.Module(bin);
        var inst = new WebAssembly.Instance(mod, {});
        return (inst.exports.test(4) !== 0);
    }
    if (!testSafariWebAssemblyBug()) {
        support = false;
    }
}
if (!support) {
    brfv4BaseURL = "dist/brf_asmjs/";
}

function setProgressBar(percent, visible) {
    if (percent < 0.0) percent = 0.0;
    if (percent > 1.0) percent = 1.0;
    console.log("loading" + percent);
}

function onPreloadProgress(event) {
    setProgressBar(event.loaded, true);
}

function onPreloadComplete(event) {
    setProgressBar(1.0, false);
    console.log("complete");
}

var queue = new createjs.LoadQueue(true);
queue.on("progress", onPreloadProgress);
queue.on("complete", onPreloadComplete);
queue.loadManifest([
    brfv4BaseURL + "trial.js", // BRFv4 SDK
    "dist/brf.js",
    "dist/app.js",
], true);


