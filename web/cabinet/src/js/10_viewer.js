!function($) {

$._.viewer = function() {
    if (!this[0]) return;

    var node = this.first(),
        pic  = $($.build('div', {C:'pic'})),
        img  = $.build('img', {c:'position:absolute'}),
        ldr  = $.build('div', {c:'position:absolute'}),
        justLoaded = false,
        active     = true,
        stl        = img.style,
        MAXZ       = 2,
        minz, maxz, box, pox, hasPic, x, y, z, o;

    function showLoader() {
        img.style.opacity = 0;
    }

    function hideLoader() {
        justLoaded = false;
        img.style.opacity = 1;
    }

    function update() {
        z = z < minz ? minz : z > maxz ? maxz : z;

        var minx = box.w - pox.w * z,
            miny = box.h - pox.h * z;

        x = x > 0 ? 0 : x < minx ? minx : x;
        y = y > 0 ? 0 : y < miny ? miny : y;

        stl.webkitTransform = 'translate('+(x|0)+'px,'+(y|0)+'px) scale('+z+','+z+')';
        stl.webkitTransformOrigin = '0 0';
    }

    function onload() {
        if (hasPic) {
            pox = {w: img.width, h: img.height};
            box = pic.offset();
            minz = Math.max(box.w / pox.w , box.h / pox.h);
            maxz = minz > MAXZ ? minz : MAXZ;
            justLoaded && hideLoader();
            update();
        }
    }
    img.onload = onload;

    pic
        .on('wheel', function(e) {
            if (!active) return;

            var xy = e.getXY(),
                d  = e.delta / 10;
            
            z += d;

            if (z >= minz && z <= maxz) {
                x -= xy.x * d;
                y -= xy.y * d;
            }

            update();
        })
        .on('touchstart', function(e) {
            if (!active) return;

            o = {x: x, y: y, z: z, c: e.getXY()};
        })
        .on('swiping', function(e) {
            if (!active) return;

            x = o.x + e.dx;
            y = o.y + e.dy;
            update();
        })
        .on('pinching', function(e) {
            if (!active) return;

            var xy = o.c;
            z = o.z * e.scale;
            if (z >= minz && z <= maxz) {
                x = o.x * e.scale - xy.x * (e.scale-1);
                y = o.y * e.scale - xy.y * (e.scale-1);
            }
            update();
        });

    node
        .css({overflow: 'hidden'})
        .append(pic.append(img));;

    return $.mix(node, {
        update: onload,
        
        show: function(src, cssProps) {
            node.css($.mix(cssProps, {d: 'block'}));

            x = y = z = 0;
            hasPic      = !!src;
            pox         = null;
            justLoaded  = true;
            showLoader();
            img.src     = src || '';
        },

        hide: function(cssProps) {
            node.css($.mix(cssProps, {d: 'none'}));
            
            img.src = '';
            hasPic  = !1;
        },

        setActive: function(val) {
            active = !!val;
        }
    })
}

}(Base)