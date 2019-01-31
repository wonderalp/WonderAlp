/**
 * "Desktop" handling
 *
 * 
 */
!function($) {
    var DMIN = 20,
        UID  = 0;

    function translate(obj, x, y, t) {
        $.css(obj[0], {
            transition: t ? t + 'ms' : 'none',
            transform:  'translate3d('+x+'px,'+y+'px,0)'
        });
    }

    /**
     * Creates a desktop.
     *
     * Needed CSS:
     *  - Base element: "position: absolute; overflow: hidden;"
     *  - .container:   "position: absolute;"
     *  - .cell:        "position: absolute;" (overflow must be visible)
     *  - .border:      "position: absolute;"
     *   
     * @param  {object}     opts Options
     * @return {Collection}
     */
    $._.desktop = function(opts) {
        opts = (opts || {});

        var pre         = '_d'+(UID++)+'_',                         // id prefix
            cols        = opts.cols   || 3,                         // \
            rows        = opts.rows   || 4,                         // |
            margin      = opts.margin || 8,                         // |- Config
            gutter      = opts.gutter || 8,                         // |
            onBuild     = $.type(opts.build, 'f') ? opts.build : 0, // |
            onShow      = $.type(opts.show, 'f')  ? opts.show : 0,  // |
            onHide      = $.type(opts.hide, 'f')  ? opts.hide : 0,  // |
            onStep      = $.type(opts.step, 'f')  ? opts.step : 0,  // /
            count       = cols * rows,                              // Number of cells
            parent      = this.first(),                             // Base DOM element
            container   = $($.build('div',{C:'container',id:pre})), // Desktop container
            running     = 0,                                        // Whether an animation is running
            cells       = [],                                       // Cell nodes
            hiddenBorders = [],                                     // Hidden border nodes
            w, h, ox, oy,                                           // Size ; Origin x,y
            i, ni,                                                  // current cell ; next cell
            dir, abs, sgn, dst,                                     // direction, absolute, sign and distance
            n;

        // Sets cell position size and visibility
        // 
        function styleCell(idx, w, h, x, y) {
            var node = cells[idx], s;
            if (!node) return 0;
            s = node.style;
            if (w) {
                s.display       = 'block';
                s.left          = (ox + x) + 'px';
                s.top           = (ox + y) + 'px';
                s.width         = w + 'px';
                s.height        = h + 'px';
            } else {
                node.className  = 'cell';
                s.display       = 'none';
            }
            return 1
        }

        // Hide a cell border 
        // 
        function hideBorder(from, to) {
            var id = pre + from + '_' + to,
                el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
                hiddenBorders.push(el.style);
            };
            
        }

        // Show all hidden cell borders
        // 
        function showBorders() {
            var s;
            while (s = hiddenBorders.pop()) s.display = 'block';
        }


        // Update dimensions
        // 
        function update() {
            var o = parent.offset(),
                s = margin + gutter;
   
            w = o.w - 2 * s;
            h = o.h - 2 * s;
            ox = oy = s;
            //show();
        }

        // Show current cell
        // 
        function show() {
            if (styleCell(i, w, h, 0, 0)) {
                setTimeout(function() {
                    cells[i].className = 'cell active';
                }, 10)
                onStep && onStep(i % cols, i / cols | 0, 0);
                onShow && onShow(cells[i], i);
            }
            translate(container, 0, 0, 0);
        }

        // Setup next cell based on current cell (i) and direction (dir)
        // 
        function setup() {
            if (ni >= 0) cancel();
            ni = i + dir;

            styleCell(ni, w, h
                        , abs == 1 ? sgn * (w + gutter) : 0
                        , abs  > 1 ? sgn * (h + gutter) : 0);

            hideBorder(ni, i);
            hideBorder(i, ni);
        }

        // Cancel move
        // 
        function cancel(setContainerPos, animate) {
            setContainerPos && translate(container, 0, 0, animate ? 500 : 0);
            styleCell(ni);
            showBorders();
            ni = -1;
        }

        // Move between cells
        // 
        function move(e) {
            if (running) return;
            running = 1;

            var a = Math.abs(e.dx),
                b = Math.abs(e.dy),
                x = i % cols,
                y = i / cols | 0,
                z = abs ? 1 == abs : a > b,         // is horizontal ?
                c = //(z ? a : b) > DMIN ?
                    z ? e.dx < 0 && x < cols - 1  ? 1
                        : e.dx > 0 && x > 0         ? -1
                        : 0
                        : e.dy < 0 && y < rows - 1  ? cols
                        : e.dy > 0 && y > 0         ? -cols
                        : 0
                    //: 0
                    ;

            // New direction ?
            if (dir != c && (!dir || !c || c == -dir) && (dir = c)) {
                abs = Math.abs(dir);
                sgn = abs ? dir/abs : 1;
                setup();
            }

            // Move container & call step function
            if (dir) {
                dst = abs  > 1 ? b    : a;
                a   = abs == 1 ? e.dx : 0;
                b   = abs  > 1 ? e.dy : 0;

                onStep && onStep((i % cols)     - a / (w + gutter)
                               , (i / cols | 0) - b / (h + gutter)
                               , 0);

                translate(container, a, b, 0);
            } else cancel(1);

            running = 0;
        }

        // Swipe, end move
        // 
        function swipe(e) {
            if (running) return;
            running = 1;

            if (dir && dst > DMIN && cells[ni]) {
                translate(container, abs == 1 ? -sgn * (w + gutter) : 0
                                   , abs > 1  ? -sgn * (h + gutter) : 0
                                   , 500);

                onStep && onStep( ni % cols
                                , ni / cols | 0
                                , 500);

                setTimeout(function() {
                    styleCell(i) && onHide && onHide(cells[i], i);
                    showBorders();
                    show(i  = ni);
                    ni      = -1;
                    running = 0;
                }, 500);
            } else {
                cancel(1, 1);
                running = 0;
            }
            
            dir = abs = sgn = 0;
        }

        // Build "next cells" borders
        // 
        function buildBorders(node, idx) {
            var s = margin + gutter,
                u = 'px;',
                x = idx % cols,
                y = idx / cols | 0,
                a1 = x > 0      ? -1 : 0,
                a2 = x < cols-1 ?  2 : 1,
                b1 = y > 0      ? -1 : 0,
                b2 = y < rows-1 ?  2 : 1,
                a, b, c, d;

            for (b=b1; b<b2; b++) {     // t.c.b
                for (a=a1; a<a2; a++) { // l.c.r
                    if (!b && !a) continue;

                    c = ( 1 == b ? '' : 'top:'    + (b * s) + u)
                      + ( 0 == b ? '' : 'height:' + margin + u)
                      + (-1 == b ? '' : 'bottom:' + (-b * s) + u)
                      + ( 1 == a ? '' : 'left:'   + (a * s) + u)
                      + ( 0 == a ? '' : 'width:'  + margin + u)
                      + (-1 == a ? '' : 'right:'  + (-a * s) + u);
                    d = idx + a + cols * b;
                    
                    node.append($.build('div', {C: 'border', c: c, id: pre+idx+'_'+d}));
                }
            }
        }

        // Init
        // 
        for (i=0; i<count; i++) {
            container.append(n = $.build('div', {C: 'cell', c: 'display:none', id: pre+i}));
            cells.push(n);
            n = $(n);
            onBuild && onBuild(n, i);
            buildBorders(n, i);
        }
        parent.append(container);
        i = 0;
        update();

        // Bind
        // 
        container.on('touchstart', function(e) { e.preventDefault() });
        parent.on('swiping', move).on('swipe', swipe);

        // Return control object
        // 
        return {
            update: function(noShow) {
                update();
                !noShow && show();
            },
            show: function(id) {
                styleCell(i);
                i = id < 0 ? 0 : id > 11 ? 11 : id;
                show();
            },
            hide: function() {
                styleCell(i)
            }
        }
    }

    /**
     * Minimap for desktop
     * @param  {[type]} opts [description]
     * @return {[type]}      [description]
     */
    $._.minimap = function(opts) {
        opts = (opts || {});

        var cols        = opts.cols   || 3,                         // \
            rows        = opts.rows   || 4,                         // |- Config
            ratio       = opts.ratio  || 4/3,                       // |
            gutter      = opts.gutter || 1/16,                      // /
            count       = cols * rows,                              // Number of cells
            parent      = this.first(),                             // Base DOM element
            cell, cells,                                            // Active cell ; Cells
            ox, oy, i, j, w, h, g;

        function update() {
            var o = parent.offset();
            
            o.w > o.h
                ? (g = o.h * gutter | 0, h = (o.h - (rows-1) * g) / rows | 0, w = h*ratio | 0)
                : (g = o.w * gutter | 0, w = (o.w - (cols-1) * g) / cols | 0, h = w/ratio | 0);

            ox = (o.w - cols * (w + g) + g) / 2 | 0;
            oy = (o.h - rows * (h + g) + g) / 2 | 0;

            $.each(cells, function(n, i) {
                $.css(n, {
                    w: w, h: h,
                    x: ox + (i % cols    ) * (w + g),
                    y: oy + (i / cols | 0) * (h + g)
                });
            })

            $.css(cell, {w: w, h: h});
            //step(i, j, 0);
        }

        function step(x, y, t) {
            if (x < 0 || y < 0) return;
            i = x; j = y;
            t = t | 0;

            $.css(cell, {
                transition: t ? t+'ms' : 'none',
                x: ox + x * (w + g),
                y: oy + y * (h + g)
            })
            
            if ((x|0) == x && (y|0) == y) {
                setTimeout($.wrap($.cls, cells[x + y*cols], 'visited'), t)
            }
        }

        // Init
        for (i=0; i<count; i++) parent.append($.build('div', {C: 'cell'}));
        cells = $('div', parent);
        parent.append(cell = $.build('div', {C: 'cell active'}));
        update(i = j = -1);

        // Return control object
        return {
            node:   parent,
            step:   step,
            update: update,
            cell:   function(idx) {
                return cells[idx]
                    ? cells[idx].className.replace(/\s*cell\s*/g, '')
                    + (idx == i + j*cols ? ' active' : '')
                    : ''
            },
            clear:  function() { $('.visited', parent).cls('visited', 1) }
        }
    }

}(Base)