/**
 * Base.js
 * 
 * Lightweight javascript library aimed at mobile and modern browser development.
 * Targeted browsers: Chrome, Firefox, Safari, Opera, IE 9+
 *
 * @author Samuel Suter
 */
!function() {
    var win      = window,
        doc      = document,
        nav      = win.navigator || {},
        ua       = nav.userAgent || '',
        testEl   = doc.createElement('div'),
        ap       = [],
        hop      = ap.hasOwnProperty,
        uid      = 0,
        undef,

        has,
        eventHandlers = {},     // Event handlers
        customEvents  = {},     // Custom events
        eventProto,
        cssAlias = {            // Style aliases
            x: 'left', y: 'top', w: 'width', h: 'height', d: 'display'
        },
        pxProps   = {},      // "pixel" props cache
        attrAlias = {        // Atributes aliases
            h:'innerHTML', v:'value', n: 'name', C:'className', f:'htmlFor',
            y:'type', ti: 'tabIndex'
        },
        
        // (*width, *height, *right, *top, *left, *bottom, fontSize, *radius)(*color)(pad*, marg*)
        xProp    = /(^(?:bor|pad|marg)|(?:dth|height|[Rr]ight|op|eft|tom|^f.*ze|us)$)|(lor)$/,
        xSplit   = /[\s,;]+/,
        xTagHtml = /^#([\w-]+)$|^\s*(<[a-z])|^[a-z]{1,8}[1-6]?$/,
        xIsHtml  = /^\s*</,

        sSpace      = ' ';


    // --- Language ------------------------------------------------------------
    // 
    // 
    // 

    /**
     * Get the type of a value.
     * Possible values for returned type:
     * - "-": null
     * - "u": undefined
     * - "b": boolean
     * - "n": number
     * - "s": string
     * - "o": object
     * - "a": array
     * - "f": function
     * - "i": instance (ie not a plain object)
     * - "E": DOM Element
     * - "T": DOM Text, CDATA or Comment
     * - "D": DOM document
     * - "F": DOM fragment
     * - "N": DOM Node
     * 
     * @param {mixed}   value   Value to get type for.
     * @param {string}  type    Types to check, if specified the function will return a boolean.
     * @return {string|boolean} Type of value or true iff "type" argument was specified and matches value type.
     */
    function type(value, type, a, b) {
        return a = (typeof value).charAt(0)
             , a = value === null ? '-'
                 : 'o' == a   ? (b = value.constructor) === Object ? a
                              : b === Array               ? 'a'
                              : (b = value.nodeType) > 0  ? 1 == b ? 'E'
                                                          : 3 == b || 4 == b || 8 == b ? 'T'
                                                          : 9 == b ? 'D'
                                                          : 11== b ? 'F'
                                                          : 'N'
                              : 'i'
                 : 'f' == a   ? value.constructor !== Function ? 'i'  // for Safari, NodeList instances are functions :/
                              : a
                 : a
             , type ? type.indexOf(a)>=0 : a
    }

    /**
     * Iterates on values of an array or an object
     * @param  {mixed}    value    Object to iterate on
     * @param  {Function} callback Callback function
     * @param  {object}   context  Callback context
     * @return {mixed}             Input object
     */
    function each(value, callback, context) {
        var l = type(value, 'oai')
                ? value.length
                : (value = [value], 1),
            i = 0;
        
        if (l >= 0)
            for (; i<l; ) callback.call(context, value[i], i++, value);
        else
            for (i in value) callback.call(context, value[i], i, value);
        
        return value
    }

    /*
     * Applies a callback on all elements of the given object, returns a new array.
     * @param  {mixed}    value    Object to iterate on
     * @param  {Function} callback Callback function
     * @param  {object}   context  Callback context
     * @return {array}             Output array
     */
    function map(value, callback, context, o) {
        each(value, function(v, k, a) {
            o.push(callback.call(context, v, k, a))
        }, o = [])
        return o
    }

    /**
     * Duplicate (aka clone object/node)
     * @param {object}      a       Object to clone
     * @return {object}             Cloned object
     */
    function clone(a, o) {
        o = type(a);
        o == 'a' || o == 'o'
            ? each(a, function(c, b) {
                hop.call(a, b) ? o[b] = clone(c) : 0
            }, o = o == 'o' ? {} : [])
        : o.nodeType ? o = cloneNode(a)
        : o = a
        return o
    }

    /**
     * Wraps a function with arguments
     * @param  {Function} fn Function to wrap
     * @param  {...}         Function's arguments
     * @return {Function}    Wrapped function
     */
    function wrap(fn) {
        var args = ap.slice.call(arguments, 1);
        return function() {
            return fn.apply(null, args.concat([].slice.call(arguments)))
        }
    }

    /**
     * Merges multiple object
     * @param {boolean}     deep    If first argument is a positive number, deep extend and clone
     * @param {object}      ...     All other args are merged
     * @return {object}
     */
    function mix(deep) {
        for(var
            d = deep > 0,
            a = arguments,
            b = +d,
            c = a[b],
            o = type(c, 'oafi') ? d ? clone(c) : c : {},
            k;
            c = a[++b],
            b < a.length;
        ) for (k in c)
            hop.call(c, k)
                ? o[k] = d && type(c[k], 'oaf')
                    ? mix(1, o[k], c[k])
                    : c[k]
                : 0
        ;
        return o
    }

    /**
     * Debounce helper
     * @param  {Function} callback Callback function
     * @param  {integer}  duration Maximum call frequency in ms
     * @return {Function}
     */
    function debounce(callback, duration) {
        var time;
        duration = duration || 300;
        return function() {
            clearTimeout(time);
            time = setTimeout(callback, duration);
        }
    }

    // --- Features detection --------------------------------------------------
    // 
    // 
    // 

    /**
     * Tests prefixed properties on specified object
     * @param  {string} prop    Property name to test
     * @param  {Object} obj     Object to test props on
     * @return {String|false}   First matching property or false if none matched
     */
    /*function testProps(prop, obj) {
        var p = prop.charAt(0).toUpperCase() + prop.slice(1), q;
        return prop in obj ? prop
            :  (q = 'Moz' + p) in obj ? q
            :  (q = 'O' + p) in obj ? q
            :  (q = 'ms' + p) in obj ? q
            :  (q = 'Webkit' + p) in obj ? q
            : false
    }*/

    function testProps(prop, obj) {
        if (prop in obj) return prop

        var a = 'Moz0moz0O0o0ms0Webkit0webkit'.split(0),
            p = prop.charAt(0).toUpperCase() + prop.slice(1),
            i = 0, q;
        
        for(;i<7;) {
            q = a[i++] + p;
            if (q in obj) return q
        }

        return !1
    }

    has = {
        test: testProps,
        // http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/4819886#4819886
        touch:      !!('ontouchstart' in win || nav.msMaxTouchPoints),
        // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/css/transforms.js
        transform:  ua.indexOf('Android 2.') === -1 && testProps('transform', testEl.style),
        // IE 9+, everything except Opera
        matches:    'matches' in testEl ? 'matches' : testProps('MatchesSelector', testEl)
    }

​    // --- STYLE & GEOM --------------------------------------------------------
    // 
    // 
    // 

    function css(node, props) {
        var s = node.style, p, v;
        for (p in props) {
            v = props[p];
            p = cssAlias[p] || p;
            s[p] = !isNaN(v) && (p in pxProps ? pxProps[p] : pxProps[p] = xProp.test(p))
                ? (v+.5 | 0) + 'px' : v;
        }

        return node
    }

    cssAlias.transform = has.transform || 'transform';

    function cssClass(n, c, remove) {
        if (c) {
            for (var
                x = /[\w-]+/g,
                y = sSpace + n.className + sSpace,
                z;
                z = x.exec(c);
                y = y.replace(sSpace + z[0] + sSpace, sSpace) + (remove ? '' : z[0] + sSpace)
            );  n.className = y.substr(1, y.length - 2);
        }
    }

    function cssHasClass(n, c) {
        return (sSpace + n.className + sSpace).indexOf(sSpace + c + sSpace) >= 0
    }

    /**
     * Gets top (y), left (x), width (w) and height (h) of the specified node
     * @param  {DOMElement}     node    Node
     * @return {object}                 An object with x, y, w and h properties
     */
    function offset(node) {
        var box = node.getBoundingClientRect();
        return {
            x: box.left + win.pageXOffset       | 0,
            y: box.top  + win.pageYOffset       | 0,
            w: box.width  || node.offsetWidth   | 0,
            h: box.height || node.offsetHeight  | 0
        }
    }

    // --- DOM -----------------------------------------------------------------
    // 
    // 
    // 

    /**
     * Clones a DOM Node
     *
     * @param  {Node}   n          Node to clone
     * @param  {bool}   noChildren If true, does not clone child nodes
     * @return {Node}              Cloned node
     */
    function cloneNode(n, noChildren) {
        var k = n.cloneNode(!noChildren);

        if (!noChildren && n.getElementsByTagName) {
            var a = n.getElementsByTagName('*'),
                b = k.getElementsByTagName('*'),
                l = a.length, i = 0;
            for ( ; i<l; i++)
                a[i] && b[i] && _cloneNode(a[i], b[i]);
        }

        return _cloneNode(n, k), k
    }

    // cloneNode Helper
    // 
    function _cloneNode(a, b) {
        var n = a.tagName, t;
        if ('INPUT' == n && (t = a.type) || 'TEXTAREA' == n || 'SELECT' == n) {
            if (/[ox]$/.test(t)) b.checked = a.checked;   // radio, checkbox
            b.value = b.defaultValue = a.value;
        }
        b.id && b.removeAttribute('id');
    }

    /**
     * Gets text from a node and its children
     * @param  {DOMElement}     node    Node
     * @return {string}
     */
    function getText(node) {
        var a = node.nodeValue ? node.nodeValue.replace(/\r\n?/g, '\n') : '', b;
        for (b = node.firstChild; b; b = b.nextSibling) a += getText(b);
        return a;
    }

    /**
     * Sets text from a node and its children
     * @param  {DOMElement}     node    Node
     * @param  {string}         value   Text value
     * @return {string}
     */
    function setText(node, value) {
        if (node && node.appendChild) {
            for (var _; _ = node.firstChild; node.removeChild(_));
            node.appendChild(doc.createTextNode(value || ''));
        }
        return node
    }

    /**
     * Get an attribute's value.
     * @param  {DOMElement}     node    Node
     * @param  {string}         name    Attribute name
     * @return {string}                 Attribute value
     */
    function getAttr(node, name) {
        return node
            ? 't' == name ? getText(node)
            : 'c' == name ? node.style.cssText
            : node[name = attrAlias[name] || name] || node.getAttribute(name)
            : null
    }

    /**
     * Sets an attribute's value.
     * @param  {DOMElement}     nodes   Node
     * @param  {object}         attrs   Map of attributes name to values
     * @param  {string}         prefix  Optional string to prefix to attributes name
     */
    function setAttr(node, attrs, prefix) {
        var v, p;
        for (p in attrs) v = attrs[p], p = prefix ? prefix + p : p
            , 't' == p      ? setText(node, v)
            : 'c' == p      ? node.style.cssText = v
            : /^on/.test(p) ? on(node, p.substr(2, p.length), v)
            : attrAlias[p]  ? node[attrAlias[p]] = v
            : v === false || v === null
                ? node.removeAttribute(p) && (node[p] = null)
                : node.setAttribute(p, node[p] = v);
        return node
    }

    /**
     * Creates node(s) from HTML, returns a NodeList
     * @param  {string}         h       HTML Code
     * @param  {DOMDocument}    d       Optional document
     * @return {NodeList}               Node list (array like object)
     */
    function domFromHtml(h, d) {
        var n = (d || doc).createElement('div');
        n.innerHTML = h;
        return n.getElementsByTagName('*')
    }

    /**
     * Gets (by id) or create a DOM element (by tag)
     * @param  {string} tag     Tag name of element to create or #id of element to get
     * @return {DOMElement}     DOM element
     */
    function domGetCreate(tag) {
        var m;
        return (m = tag.match(xTagHtml))
                ? m[1] ? doc.getElementById(m[1])
                : m[2] ? domFromHtml(tag)[0]
                       : doc.createElement(tag)
                : null
    }

    /**
     * DOM Builder, accepts any number of arguments. The first argument becomes
     * the parent of everything.
     * @return {DOMElement} Built DOM element or false
     */
    function domBuild() {
        var n;
        each(arguments, function(a, b) {
            b = type(a);
              n ? 's' == b ? n.appendChild(domGetCreate(a) || doc.createTextNode(a))
                : 'E' == b || 'T' == b || 'F' == b || 'N' == b ? n.appendChild(a)
                : 'a' == b ? n.appendChild(domBuild.apply(a,a))
                : 'f' == b ? a(n)
                : 'o' == b && setAttr(n, a)
            : n = 's' == b ? domGetCreate(a)
                : 'a' == b ? domBuild.apply(a,a)
                : 'E' == b || 'F' == b || 'D' == b && a
        })
        return n
    }

    /**
     * [Internal] Make DOM manipulation function.
     * 
     * Values for type:
     *   1: append
     *   2: prepend
     *   3: after
     *   4: before
     *   5: remove
     *   6: empty
     *   
     * @param  {integer}    t   Function type
     * @return {function}
     */
    function _makeDomManipulator(t) {
        var a = 2 == t ? 'firstChild' : 3 == t ? 'nextSibling' : 0,
            b = 2 < t;

        return function(n) {
            var p, r, i, m, me;

            if (type(n, 's') && xIsHtml.test(n)) n = domFromHtml(n);

            if (4 < t || type(n, 'NETF') || type(n, 'aoi') && (p = n.length)) {
                if (p) {                // convert array to document fragment
                    m = doc.createDocumentFragment();
                    for (i = 0; i < p; ) m.appendChild(n[i++])
                    n = m;
                }

                for (i = this.length; me = this[--i]; )
                    if (6 == t)
                        for (; n = me.firstChild; ) me.removeChild(n)
                    else if (5 == t)
                        (n = me.parentNode) && n.removeChild(me)
                    else
                        m = !i ? n : cloneNode(n),
                        (p = b ? me.parentNode : me) &&     // parent
                            (r = a ? me[a] : b ? me : 0)  // reference
                                ? p.insertBefore(m, r)
                                : p.appendChild(m)
            }
            return this
        }
    }

    // Dom match polyfill
    // 
    function domMatch(node, selector) {
        var m = (node.document || node.ownerDocument).querySelectorAll(selector),
            i = 0;
        while (m[i] && m[i] !== node) i++;
        return !!m[i]
    }

    // --- Event ---------------------------------------------------------------
    // 
    // 
    // 

    /**
     * Event Class
     * @param {object}  node        Sender node
     * @param {string}  name        Event name
     * @param {object}  original    Original event
     * @param {object}  data        Event extra data
     */
    function Event(node, name, original, data) {
        var t = this;
        t.type          = name;
        t.target        = node;
        t.timeStamp     = +new Date;
        t.originalEvent = original;
        mix(t, data);
    }

    Event.prototype = eventProto = {
        constructor:   Event,

        /**
         * Get touches 
         * @param  {Object} e   Event
         * @return {Array}      Touches data
         */
        getTouches: function() {
            var t = this, e = t.originalEvent,
                a, b, r, l, i;

            if (!t.touches) {
                a = e ? e.touches || [e] : [];
                for (i=0, l=a.length, r=[];i<l;) {
                    b = a[i++];
                    r.push({x: b.pageX||0, y: b.pageY||0})
                }
                t.touches = r;    
            }

            return t.touches;
        },

        getXY: function() {
            var t = this, a, l, i, x = 0, y = 0;
            if (!t.xy) {
                for (a = t.getTouches(), l = a.length, i = 0; i<l;) {
                    x += a[i].x;
                    y += a[i++].y;
                }
                t.xy = {
                    x: x/l|0,
                    y: y/l|0
                };
            }
            return t.xy;
        },

        getOriginalTarget: function() {
            var t = this, o = t.originalEvent, x;
            if (!t.originalTarget) {
                x = o.touches;
                t.originalTarget = x && x[0] && x[0].target || o.originalTarget || o.srcElement || o.target;
            }            
            return t.originalTarget
        }
    }

    // Add proxy methods to event
    each({
        preventDefault:             'isDefaultPrevented',
        //stopImmediatePropagation:   'isImmediatePropagationStopped',
        stopPropagation:            'isPropagationStopped'
    }, function(getter, method) {
        eventProto[method] = function() {
            var o = this.originalEvent;
            this[getter] = function() { return true };
            o && o[method].apply(o, arguments);
            return this
        };
        eventProto[getter] = function() { return false }
    })

    // --- Event helpers -------------------------------------------------------
    // 
    
    // One handler to rule them all
    function _createHandler(node, callbacks, filter) {
        return function(e) {
            var l = callbacks.length,
                i = 0,
                c;
            
            e.constructor === Event || (e = new Event(node, e.type, e));

            if (!filter || false !== filter(e))
                for (;i<l;)
                    if ((c = callbacks[i++]) && false === c.call(node, e))
                        break;
        }
    }

    function _distance(a, b) {
        return Math.sqrt((b.x-a.x) * (b.x-a.x) + (b.y-a.y) * (b.y-a.y))
    }

    /**
     * Low level add event
     * @param  {DOMElement} node        Node
     * @param  {string}     event       Event name
     * @param  {Function}   callback    Callback function
     * @return {void}
     */
    function _bind(node, event, callback) {
        node.addEventListener   ? node.addEventListener(event, callback, false)
        : node.attachEvent      ? node.attachEvent('on'+event, callback)
        : 0
    }

    /**
     * Low level remove event
     * @param  {DOMElement} node        Node
     * @param  {string}     event       Event name
     * @param  {Function}   callback    Callback function
     * @return {void}
     */
    function _unbind(node, event, callback) {
        node.removeEventListener    ? node.removeEventListener(event, callback, false)
        : node.detachEvent          ? node.detachEvent('on'+event, callback)
        : 0
    }

    /**
     * Binds a node on one or more events
     * @param  {DOMElement}     node        DOM Node to bind
     * @param  {string|Array}   name        Event name(s)
     * @param  {Function}       callback    Callback function
     * @return {DOMElement}                 Specified node
     */
    function on(node, name, callback) {
        var nodeId   = node._id              || (node._id = ++uid),
            handlers = eventHandlers[nodeId] || (eventHandlers[nodeId] = {}),
            names    = name.pop ? name : name.split(xSplit),
            l = names.length, i = 0, e, s, n, c, f;

        for (;i<l;) {
            if (!handlers[e = names[i++]]) {
                s = customEvents[e] || {};          // special
                n = undef === s.bind ? e : s.bind;  // bind name
                c = [];                             // callbacks
                f = _createHandler(node, c, s.filter);
                handlers[e] = {f:f, c:c, n:n};

                s.base                  ? on(node, s.base)
                : !n                    ? 0
                : n.call                ? n.call(s, node)
                : _bind(node, n, f)
            }
            
            type(callback, 'f') && handlers[e].c.push(callback);
        }

        return node
    }

    /**
     * Uninds a node from one or more events
     * @param  {DOMElement}     node        DOM Node to bind
     * @param  {string|Array}   name        Event name(s)
     * @param  {Function}       callback    Callback function
     * @return {DOMElement}                 Specified node
     */
    function off(node, name, callback) {
        var nodeId   = node._id,
            handlers = nodeId && eventHandlers[nodeId],
            names    = name.pop ? name : name.split(xSplit),
            l = names.length, i = 0, e, c, j, k, s;
        
        if (handlers) {
            for (;i<l;) {
                if (c = handlers[e = names[i++]]) {
                    for (c = c.c, k = c.length, j = 0; j<k; j++) {
                        if (c[j] === callback) {
                            c.splice(j, 1);
                            break;
                        }
                    }
                }
            }     
        }

        return node
    }

    /**
     * Fires an event on a node
     * @param  {DOMElement}     node        DOM Node to bind
     * @param  {string}         name        Event name
     * @param  {object}         data        Event data
     * @param  {Event}          original    Original event
     * @return {DOMElement}                 Specified node
     */
    function fire(node, name, data, original) {
        var nodeId   = node._id,
            handlers = nodeId   && eventHandlers[nodeId],
            handler  = handlers && handlers[name];
        handler && handler.f(new Event(node, name, original, data));        
        return node
    }

    // Custom events, gestures, wheel
    // 
    mix(customEvents, {
        // --- Tap, doubleTap, longTap -----------------------------------------
        // 
        longTap: {
            base: 'tap'
        },
        doubleTap: {
            base: 'tap'
        },
        tap: {
            bind: function(node) {
                var _last = 0, _start, _time, _event, _data, _now, _long;

                on(node, 'touchstart', function(e) {
                    if (!_start) {
                        _event = e.originalEvent;
                        _data  = e.getTouches();
                        if (1 == _data.length) {
                            _data = _data[0];
                            _event.preventDefault();
                            _data.originalTarget = _event.touches && _event.touches[0].target || _event.srcElement;
                            _start = e.timeStamp;
                            _time  = setTimeout(function() {
                                _long = 1;
                                fire(node, 'longTap', _data, _event);
                            }, 400)
                            on(node, 'touchend,touchcancel', end);
                        }
                    }
                })

                function end(e) {
                    if (_start) {
                        clearTimeout(_time);
                        off(node, 'touchend,touchcancel', end);
                        
                        _event = e.originalEvent;
                        _now   = e.timeStamp;
                        
                        if (_long) {
                            _long = 0;
                            e.preventDefault();
                        } else if (_now - _start < 200) {
                            if (_now - _last < 400) {
                                _last = 0;
                                fire(node, 'doubleTap', _data, _event);
                            } else {
                                _last = _now;
                                fire(node, 'tap', _data, _event);
                            }
                        }
                        _start = null;
                    }
                }
            }
        },

        // --- Swipe -----------------------------------------------------------
        // 
        swiping: {
            base: 'swipe'
        },
        swipe: {
            bind: function(node) {
                var DMIN = 40 / window.devicePixelRatio | 0,
                    _start, _data, _tmp;

                on(node, 'touchstart', function(e) {
                    if (!_start) {
                        _tmp   = e.getTouches();
                        if (1 == _tmp.length) {
                            _start = _tmp[0];
                            _data  = {dx: 0, dy: 0};
                            on(node, 'touchmove', move);
                            on(node, 'touchend,touchcancel', end);
                        }
                    }
                })

                function move(e) {
                    if (_start) {
                        _tmp   = e.getTouches();
                        if (1 == _tmp.length) {
                            _tmp     = _tmp[0];
                            _data.dx = _tmp.x - _start.x;
                            _data.dy = _tmp.y - _start.y;
                            fire(node, 'swiping', _data, e.originalEvent);
                        }                    
                    }
                }

                function end(e) {
                    if (_start) {
                        _start = _tmp = null;

                        off(node, 'touchmove', move);
                        off(node, 'touchend,touchcancel', end);
                        var x = Math.abs(_data.dx),
                            y = Math.abs(_data.dy),
                            d = x/y >= 2 && x > DMIN
                                ? _data.dx > 0 ? 'right' : 'left'
                              : y/x >= 2 && y > DMIN
                                ? _data.dy > 0 ? 'down' : 'up'
                              : 'none';

                        d && fire(node, 'swipe', mix({dir: d}, _data), e.originalEvent);
                    }
                }
            }
        },

        // --- Pinch -----------------------------------------------------------
        //
        pinching: {
            base: 'pinch'
        },
        pinch: {
            bind: function(node) {
                var DMIN = 40 / window.devicePixelRatio | 0,
                    _start, _data, _tmp;

                on(node, 'touchstart', function(e) {
                    if (!_start) {
                        _tmp = e.getTouches();
                        if (2 == _tmp.length) {
                            _start = _distance(_tmp[0], _tmp[1]) || 1;
                            _data  = {delta: 0, scale: 1};
                            on(node, 'touchmove', move);
                            on(node, 'touchend,touchcancel', end);
                        }
                    }
                })

                function move(e) {
                    if (_start) {
                        _tmp = e.getTouches();
                        if (2 == _tmp.length) {
                            _tmp        = _distance(_tmp[0], _tmp[1]);
                            _data.delta = _tmp - _start;
                            _data.scale = _tmp / _start;
                            fire(node, 'pinching', _data, e.originalEvent);
                        }
                    }
                }

                function end(e) {
                    if (_start) {
                        _start = null;
                        off(node, 'touchmove', move);
                        off(node, 'touchend,touchcancel', end);
                        _data.delta > DMIN && fire(node, 'pinch', _data, e.originalEvent);
                    }
                }
            }
        },

        // --- Wheel -----------------------------------------------------------
        //
        wheel: {
            bind: 'onmousewheel' in testEl ? 'mousewheel' : 'DOMMouseScroll',
            filter: function(e) {
                // http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers/13650579#13650579
                var o = e.originalEvent,
                    d = o.detail, w = o.wheelDelta,
                    n = 225, n1 = n-1;

                // Normalize delta
                d = d ? w && (f = w/d) ? d/f : -d/1.35 : w/120;
                // Quadratic scale if |d| > 1
                d = d < 1 ? d < -1 ? (-Math.pow(d, 2) - n1) / n : d : (Math.pow(d, 2) + n1) / n;
                // Delta *should* not be greater than 2...
                e.delta = Math.min(Math.max(d / 2, -1), 1);
            }
        }
    });

    // Equivalence for mobile <-> desktop
    // 
    each([
        'touchstart0mousedown','touchmove0mousemove','touchend0mouseup',
        'touchcancel0mouseleave', 'orientationchange0resize'
    ], function(a, b) {
        a = a.split(0);
        customEvents[a[has.touch|0]] = {bind:a[!has.touch|0]};
    })

    /**
     * Creates an "emitter" (dispatcher).
     * 
     * The returned object will have the following methods:
     * - on:   bind event (name(s), callback)
     * - off:  unbind event (name(s), callback)
     * - fire: emit event (name, data?)
     * 
     * @function $.emit
     * @param  {object}    o Optional object to extend, if not specified a plain
     *                       object is returned
     * @return {object}      Emitter object (either the one passed as argument
     *                       or a new one)
     */
    function emitter(o, a) {
        return a = {}, mix(o = o || {}, {
            on:   function(n, c)    { return on(a, n, c), o },
            off:  function(n, c)    { return off(a, n, c), o },
            fire: function(n, d, e) { return fire(a, n, d, e), o }
        })
    }


    // --- API -----------------------------------------------------------------
    // 
    // 
    // 

    /**
     * The "$" function.
     * Constructs Collection or calls function on DOM ready.
     * 
     * @function $
     * @param {function|string|Node} a    Function to call on dom ready, a dom
     *                                    selector (string) or a dom node
     * @return {Collection|undefined}     Returns a Collection (an object with
     *                                    $._ as prototype) if `a` is a string or
     *                                    Node
     */
    function $(a, b) {
        var t = type(a);
        return 'f' == t
            ? /in/.test(doc.readyState) ? setTimeout(wrap($, a), 9) : a()
            : new I(a, b, t);
    }

    // Export utilities
    mix($, {
        has:        has,
        type:       type,
        each:       each,
        map:        map,
        mix:        mix,
        clone:      clone,
        wrap:       wrap,

        events:     customEvents,
        Event:      Event,
        bind:       _bind,
        unbind:     _unbind,
        on:         on,
        off:        off,
        fire:       fire,
        emit:       emitter,

        styles:     cssAlias,
        css:        css,
        cls:        cssClass,
        hasClass:   cssHasClass,

        build:      domBuild,
        
        debounce:   debounce
    })

    /**
     * Collection constructor (used internally)
     * @param {string|DomElement}   a   Selector or node
     * @param {DOMElement}          b   Context
     * @param {string}              t   Type of "a"
     */
    function I(a, b, t) {
        if (a instanceof I) return a;

        var u = type(b = b instanceof I ? b[0] : b),
            d = 'D' == u ? b : doc,
            n;
        
        ap.push.apply(this, 's' == t
            ? xIsHtml.test(a)
                ? domFromHtml(a)
                : 'E' == u
                    ? (b.id = [b.id, b.id='__qsa', a=b.ownerDocument.querySelectorAll('#__qsa '+a)][0], a)
                    : d.querySelectorAll(a)
            : 'E' == t || 'T' == t || win == a
                ? [a]
                : []
        );
    }

    // Proto
    I.prototype = $._ = {
        constructor: I,
        length: 0,
        splice: ap.splice,
        push:   ap.push,

        each: function(callback, context) {
            return each(this, callback, context)
        },

        map: function(callback, context) {
            return map(this, callback, context)
        },

        // query

        first: function() {
            return 1 == this.length ? this : $(this[0])
        },

        eq: function(n) {
            return $(this[n])
        },

        closest: function(selector) {
            var m = has.matches, i = new I;
            each(this, function(n) {
                for (; n && 1 == n.nodeType; n = n.parentNode)
                    if (m ? n[m](selector) : domMatch(n, selector))
                        return i.push(n)
            })
            return i
        },

        // events

        on: function(name, callback) {
            name = name.split(xSplit);
            return each(this, function(node){ on(node, name, callback) })
        },

        off: function(name, callback) {
            name = name.split(xSplit);
            return each(this, function(node){ off(node, name, callback) })
        },

        fire: function(name) {
            return each(this, function(node){ fire(node, name) })
        },

        // style, geom

        css: function(props) {
            return each(this, function(node){ css(node, props) })
        },

        show: function() {
            return each(this, function(node) {css(node, {d: 'block'}) })
        },

        hide: function() {
            return each(this, function(node) {css(node, {d: 'none'}) })
        },

        cls: function(className, remove) {
            return each(this, function(node){ cssClass(node, className, remove) })
        },

        hasClass: function(className) {
            return this[0] && cssHasClass(this[0], className)
        },

        offset: function() {
            return this[0] && offset(this[0])
        },

        // attributes

        attr: function(props) {
            return type(props, 's')
                ? this[0] && getAttr(this[0], props)
                : each(this, function(node){ setAttr(node, props) })
        },

        data: function(props) {
            return type(props, 's')
                ? this[0] && getAttr(this[0], 'data-'+props)
                : each(this, function(node){ setAttr(node, props, 'data-') })
        },

        text: function(val) {
            return undef === val ? this.map(getText).join(' ') : this.each(function(node) { setText(node, val) });
        },

        html: function(val) {
            return undef === val
                ? this.map(function(node) { return node.innerHTML }).join(' ')
                : this.each(function(node) { node.innerHTML = val });
        },

        // dom

        /**
         * Appends argument to all nodes in collection
         * @param {Node|array} node Node, fragment or array of nodes 
         * @return {Collection}     This collection
         */
        append: _makeDomManipulator(1),

        /**
         * Prepends argument to all nodes in collection
         * @param {Node|array} node Node, fragment or array of nodes 
         * @return {Collection}     This collection
         */
        prepend: _makeDomManipulator(2),

        /**
         * Inserts argument after all nodes in collection
         * @param {Node|array} node Node, fragment or array of nodes 
         * @return {Collection}     This collection
         */    
        after: _makeDomManipulator(3),

        /**
         * Inserts argument before all nodes in collection
         * @param {Node|array} node Node, fragment or array of nodes 
         * @return {Collection}     This collection
         */
        before: _makeDomManipulator(4),

        /**
         * Remove all nodes in collection from DOM
         * @return {Collection}     This collection
         */
        remove: _makeDomManipulator(5),

        /**
         * Empties all nodes in collection
         * @return {Collection}     This collection
         */
        empty: _makeDomManipulator(6)
    };


    // 
    // --- Export --------------------------------------------------------------
    // 
    
    win.Base = win.$ = $;
}();