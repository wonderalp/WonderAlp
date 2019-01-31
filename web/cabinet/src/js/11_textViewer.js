!function($) {

$._.textViewer = function() {
    if (!this[0]) return;

    var node    = this.first(),
        text    = $('.text', node),
        scroll  = $('.scroll', node),
        index   = $('.index', node),
        pos     = [],
        indexBox,
        current = -1;

    function updateIndex() {
        for (var i=pos.length; i--;)
            if (scroll[0].scrollTop + 120 >= pos[i])
                break;
        if (i < 0) i = 0;

        if (current != i) {
            var links = $('a', index);
            $('ins', node).remove();

            if (current >= 0) {
                links[current].className = '';
            }
            if (links[current = i]) {
                links[current].className = 'active';
                updateLines($(links[current]).offset());
            }
        }
    }

    function updateLines(box, top) {
        top = 'top:'+(box.y+box.h/1.7)+'px';
        node.prepend($.build('ins', {C:'sqr',c:top}));
        node.prepend($.build('ins', {C:'vl'}));
        node.prepend($.build('ins', {C:'hl',c:top}));
    }

    scroll.on('touchstart,touchmove,touchend', function(e) {
        e.stopPropagation()
    });

    scroll.on('scroll', updateIndex);

    return $.mix(this, {
        show: function(txt, cssProps, section) {
            section = parseInt(section);
            if (isNaN(section)) section = 'global';

            index.html('');
            text.html(txt);
            node.css($.mix(cssProps, {d: 'block'}));
            node.cls('s0 s1 s2 sglobal', 1).cls('s'+section);

            pos     = [];
            current = -1;

            if ('global' != section) {
                $('h2', text).each(function(n, i) {
                    pos.push(n.offsetTop);
                    n.id = i = "__ttl" + i;
                    index.append($.build('a', {href:'#'+i, t:n.innerHTML}));
                });

                scroll[0].scrollTop = 0;
                indexBox = index.offset();
            }

            updateIndex();
        },
        hide: function(cssProps) {
            node.css($.mix(cssProps, {d: 'none'}));

        }
    })
}

}(Base)