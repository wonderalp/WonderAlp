$(function() {
    var CSS             = $.css,
        mediaPath       = 'd/',
        body            = $(document.body),
        favorites       = $.storage.get('favs', {}),
        running         = 0,
        modalPic        = $('#modalPic').viewer(),
        modalText       = $('#modalText').textViewer(),
        modalMap        = $('#modalMap'),
        audioManager    = $.audioManager(),
        audioPlayer     = false,
        audioBgPlayer   = false,
        contentNode     = $('#content'),
        homeNode        = $('#home'),
        favsNode        = $('#favs'),
        sectionsNodes   = $('.section'),
        sections        = [],
        allSounds       = [],           // An array with all available sounds
        welcomeSound,                   // Welcome sound if any
        sid             = -1,           // current section id
        cid             = -1,           // current cell id
        page            = 'welcome',    // current page
        modal           = 0,            // current modal
        segues          = {             // segues: transition from one page to another
            /**
             * Global segues
             */
            _: {
                /**
                 * Show picture modal viewer
                 * @param  {int}    cellId      Cell ID
                 * @param  {int}    contentId   Cell content ID
                 * @return {void}
                 */
                picture: function(cellId, contentId) {
                    var d = DATA.sections[sid],
                        h = '',                 // side html
                        n = 0, c = [], w = [],  // columns count, content and weight
                        i, a, b;                // iteration vars

                    if (d && (d = d.cells[cellId]) && (d = d.content[contentId]) && d.zoom) {
                        // Reset state
                        modalPic.cls('side-opened s0 s1 s2', 1);
                        modalPic.cls('s'+sid);
                        $('.side', modalPic).empty();
                        $('.play-audio', modalPic).cls('icon-pause', 1).cls('icon-play')

                        // Attributes
                        if (d.attrs) {
                            h = '<table cellspacing=0 cellpadding=0>';

                            if (d.atcol) {
                                $.each(d.attrs, function(a) {
                                    c.push('<h4>'+a[0]+'</h4>'+a[1]);
                                    w.push(n);
                                    n += a[2] || 1;
                                });
                                w.push(n);
                                
                                n = Math.ceil(n/2);
                                
                                for (i=0, a=0, b=n; i<n; i++) {
                                    h += '<tr>';
                                    if (w[a] <= i)   h += '<td rowspan="'+(w[a+1]-w[a])+'">'+(c[a++]||'')+'</td>';
                                    if (w[b] <= i+n) h += '<td rowspan="'+(w[b+1]-w[b])+'">'+(c[b++]||'')+'</td>';
                                    h += '</tr>';
                                }
                                
                            } else {
                                $.each(d.attrs, function(a) {
                                    h += '<tr><td><h4>'+a[0]+'</h4>'+a[1]+'</td></tr>'
                                });
                            }

                            h += '</table>';
                        }

                        // Extra
                        if (d.extra) h += '<div class="extra">'+d.extra+'</div>';

                        // Audio text
                        if (d.atext) h += '<p>'+d.atext+'</p>';

                        // Audio
                        if (d.audio) {
                            audioPlayer && audioPlayer.destroy();
                            audioPlayer = audioManager.newPlayer(mediaPath+d.audio, audioState, audioProgress);
                            $('.play-audio').show();
                            $('.audio-cursor').css({w: '0'});
                            $('.audio-bar').hide();
                        } else {
                            $('.play-audio').hide();
                            $('.audio-bar').hide();
                        }

                        // Show side button
                        if (h) {
                            $('.side', modalPic).html('<h2>'+d.title+'</h2><div class="scroll">'+h+'</div>');
                            $('#modalPic .scroll').on('touchstart,touchmove,touchend', function(e) {
                                e.stopPropagation()
                            });

                            $('.open-side', modalPic).show();
                        } else {
                            $('.open-side', modalPic).hide();
                        }

                        // Picture
                        modalPic.show(mediaPath+d.zoom, {opacity: 0});
                        modal = modalPic;
                        setTimeout(function() {
                            modalPic.css({opacity: 1});
                            contentNode.hide();
                            done();
                        }, 100);
                    } else done();

                    return false
                },

                /**
                 * Show "En savoir plus" modal reader
                 * @param  {int}    id      Section ID or undefined for impressum
                 * @return {void}
                 */
                text: function(id) {
                    var d = undefined !== id && DATA.sections[id] || DATA;
                    
                    audioBgPlayer && audioBgPlayer.pause();

                    if (d.more) {
                        modalText.show(d.more, {opacity: 0}, id);
                        modal = modalText;
                        setTimeout(function() {
                            modalText.css({opacity: 1});
                            contentNode.hide();
                            done();
                        }, 100);
                    } else done();

                    return done(), false
                },

                /**
                 * Shows modal shortcut minimap for current section
                 * @return {void}
                 */
                map: function() {
                    var d = DATA.sections[sid],
                        s = sections[sid];

                    if (d && s) {
                        modalMap.css({opacity:0});
                        modalMap.show();
                        modal = modalMap;
                        setTimeout(function() {
                            modalMap.css({opacity: 1});
                            done();
                        }, 100);
                        
                        modalMap.bdy.empty();
                        $.each(d.cells, function(cell, i, n) {
                            n = $.build('div', {
                                C:'mitm '+s.cell(i), c:'background-image:url('+mediaPath+cell.fav+')',
                                h:'<span>'+(cell.stitle||cell.title)+'</span>'});
                            $(n).on('tap', function() {
                                modal = modal.hide();
                                show('section:'+sid+':'+i);
                            });
                            modalMap.bdy.append(n);
                        })
                    }

                    return done(), false
                },

                /**
                 * Closes any opened modal
                 * @return {void}
                 */
                close: function() {
                    contentNode.show();
                    if (audioPlayer) {
                        audioPlayer.destroy();
                        audioPlayer = null;
                    }
                    audioBgPlayer && audioBgPlayer.play();
                    modal && modal.hide();
                    modal = 0;
                    done();
                    return false
                },

                /**
                 * Toggles side bar in picture modal viewer
                 * @return {void}
                 */
                side: function() {
                    var opened = modalPic.hasClass('side-opened'),
                        now = +new Date,
                        fn  = function() {
                            modalPic.update();
                            if (+new Date - now >= 500)
                                return modalPic.setActive(true);
                            setTimeout(fn, 10);
                        };
                    
                    modalPic.setActive(false);
                    modalPic.cls('side-opened', opened);
                    if (audioBgPlayer) 
                        opened ? audioBgPlayer.play() : audioBgPlayer.pause();

                    return fn(), done(), false
                },

                /**
                 * Toggles audio player in picture modal viewer
                 * @return {void}
                 */
                audio: function() {
                    audioPlayer && audioPlayer.toggle();
                    return done(), false
                },

                /**
                 * Toggle bookmark for the current cell of the current section
                 * @return {void}
                 */
                togglefav: function() {
                    if (sid > -1 && cid > -1) {
                        favorites[sid]      = favorites[sid] || {};
                        favorites[sid][cid] = !favorites[sid][cid];
                        $.storage.set('favs', favorites);
                        updateAddfav();
                    }
                    return done(), false
                }
            },

            /**
             * Segues from the "welcome" page
             */
            welcome: {
                /**
                 * Segue: "welcome" -> "home"
                 */
                home: function() {
                    welcomeSound && welcomeSound.fadeOut();
                    $('#welcome').hide();
                    $('#content,#home').show();
                    selected('#menu .home');
                    setTimeout(done,1);
                },

                // For debug
                section: function(id, cell) {
                    welcomeSound && welcomeSound.fadeOut();
                    $('#welcome').hide();
                    $('#content,#home').show();
                    selected('#menu .s'+id, 1);
                    slide(homeNode[0], sections[sid = id].node, -1, 1, done);
                    sections[id].show(cell || 0);
                },

                // For the watch x)
                intro: function(id) {
                    welcomeSound && welcomeSound.fadeOut();
                    $('#welcome').hide();
                    $('#content,#home').show();
                    selected('#menu .s'+id, 1);
                    slide(homeNode[0], sections[sid = id].intro, -1, 1, done);
                    sections[id].ipdate();
                }
            },

            /**
             * Segues from the "home" page
             */
            home: {
                /**
                 * Segue: "home" -> "welcome"
                 */
                welcome: function() {
                    showWelcomeScreen();
                    setTimeout(done,1);
                },

                /**
                 * Segue: "home" -> "intro"
                 * @param {int}     id      Section ID
                 */
                intro: function(id) {
                    selected('#menu .s'+id, 1);
                    slide(homeNode[0], sections[sid = id].intro, -1, 1, done);
                    sections[sid].ipdate();
                },

                /**
                 * Segue: "home" -> "facs"
                 */
                favs: function() {
                    selected('#menu .favs', 1);
                    buildFavorites();
                    slide(homeNode[0], favsNode[0], -1, 0, done);
                }
            },

            /**
             * Segues from the "favs" (favorites) page
             */
            favs: {
                /**
                 * Segue: "favs" -> "welcome"
                 */
                welcome: function() {
                    selected('#menu .home');
                    slide(favsNode[0], homeNode[0], 1, 0);
                    showWelcomeScreen();
                    setTimeout(done,1);
                },
                
                /**
                 * Segue: "favs" -> "home"
                 */
                home: function() {
                    selected('#menu .home');
                    slide(favsNode[0], homeNode[0], 1, 0, done)
                },
                
                /**
                 * Segue: "favs" -> "intro"
                 * @param {int}     id      Section ID
                 */
                intro: function(id) {
                    selected('#menu .s'+id, 1);
                    slide(favsNode[0], sections[sid = id].intro, -1, 1, done);
                    sections[sid].ipdate();
                },
                
                /**
                 * Segue: "favs" -> "section"
                 * @param {int}     id      Section ID
                 * @param {int}     cell    Cell ID
                 */
                section: function(id, cell) {
                    selected('#menu .s'+id, 1);
                    slide(favsNode[0], sections[sid = id].node, -1, 1, done);
                    sections[id].show(cell || 0);
                }
            },

            /**
             * Segues from the "intro" page
             */
            intro: {
                /**
                 * Segue: "intro" -> "welcome"
                 */
                welcome: function() {
                    selected('#menu .home');
                    slide(sections[sid].intro, homeNode[0], 1, 1);
                    showWelcomeScreen();
                    setTimeout(done,1);
                },

                /**
                 * Segue: "intro" -> "home"
                 */
                home: function() {
                    selected('#menu .home');
                    slide(sections[sid].intro, homeNode[0], 1, 1, done)
                },

                /**
                 * Segue: "intro" -> "favs"
                 */
                favs: function() {
                    selected('#menu .favs', 1);
                    buildFavorites();
                    slide(sections[sid].intro, favsNode[0], 1, 1, done)
                },

                /**
                 * Segue: "intro" -> "intro"
                 * @param {int}     id      Section ID
                 */
                intro: function(id) {
                    if (sid === id) return setTimeout(done,1);
                    selected('#menu .s'+id, 1);
                    slide(sections[sid].intro, sections[id].intro, id > sid ? -1 : 1, 0, function() {
                        sid = id;
                        done();
                    })
                    sections[id].ipdate();
                },

                /**
                 * Segue: "intro" -> "section"
                 * @param {int}     id      Section ID
                 * @param {int}     cell    Cell ID
                 */
                section: function(id, cell) {
                    if (sid !== id) selected('#menu .s'+id, 1);
                    slide(sections[sid].intro, sections[id].node, -1, 0, function() {
                        sid = id;
                        done();
                    })
                    sections[id].show(cell || 0);
                }
            },

            /**
             * Segues from the "section" page
             */
            section: {
                /**
                 * Segue: "section" -> "welcome"
                 */
                welcome: function() {
                    selected('#menu .home');
                    slide(sections[sid].node, homeNode[0], 1, 1);
                    showWelcomeScreen();
                    setTimeout(done,1);
                },

                /**
                 * Segue: "section" -> "home"
                 */
                home: function() {
                    selected('#menu .home');
                    slide(sections[sid].node, homeNode[0], 1, 1, done)
                },

                /**
                 * Segue: "section" -> "favs"
                 */
                favs: function() {
                    selected('#menu .favs', 1);
                    buildFavorites();
                    slide(sections[sid].node, favsNode[0], 1, 1, done)
                },

                /**
                 * Segue: "section" -> "intro"
                 * @param {int}     id      Section ID
                 */
                intro: function(id) {
                    if (sid !== id) selected('#menu .s'+id, 1);
                    selected('#menu .s'+id, 1);
                    slide(sections[sid].node, sections[id].intro, id > sid ? -1 : 1, 0, function() {
                        sid = id;
                        done();
                    })
                    sections[id].ipdate();
                },

                /**
                 * Segue: "section" -> "section"
                 * @param {int}     id      Section ID
                 * @param {int}     cell    Cell ID
                 */
                section: function(id, cell) {
                    if (sid != id) {
                        selected('#menu .s'+id, 1);
                        slide(sections[sid].node, sections[id].node, id > sid ? -1 : 1, 0, function() {
                            sid = id;
                            done();
                        })
                    } else setTimeout(done,1);
                    sections[id].show(cell || 0);
                }
            }
        };


    // On audio state change callback
    // 
    function audioState(playing) {
        var c = ['icon-play', 'icon-pause'];

        $('.play-audio', modalPic).cls(c[!playing|0], 1).cls(c[playing|0])
        $('.audio-cursor', modalPic).css({w:'0%'});
        $('.audio-bar', modalPic).css({d:playing?'block':'none'});
    }

    // On audio progress callback
    // 
    function audioProgress(time, total) {
        $('.audio-cursor', modalPic).css({w: (100*time/total |0) + '%'})
    }

    // Updates the add/remove fav button
    // 
    function updateAddfav() {
        var d = sections[sid];
        if (d && cid > -1) {
            favorites[sid] && favorites[sid][cid]
                ? d.fbtn.html('<div class="icon-favorite_full"></div>Supprimer de la liste des Favoris')
                : d.fbtn.html('<div class="icon-favorite_empty"></div>Ajouter aux favoris');
        }
    }

    // (re)builds favorites page
    // 
    function buildFavorites() {
        var s, c, h, d, g = '<div class="center"><h3>Favoris</h3>';

        for (s in favorites) {
            h = '';
            if (d = DATA.sections[s])
                for (c in favorites[s])
                    if (d.cells[c] && favorites[s][c])
                        h += '<div class="fav" data-href="section:'+s+':'+c+'">'
                           + '<div class="pic" style="background-image:url('+mediaPath+d.cells[c].fav+');"></div>'
                           + '<div class="label">'+d.cells[c].title+'</div>'
                           + '<div class="hl"></div></div>';

            if (h) {
                g += '<div class="row s'+s+'"><h2>'+d.title+'</h2>'+h+'</div>';
            }
        }
        
        if (!h) g += 'Il n\'y a pas encore de favoris.';
        favsNode.html(g+'</div>');
    }

    // Main controller function
    // 
    function show(url) {
        var u = url.split(':'),
            p = u.shift() || '',
            s = segues[page] && segues[page][p] || segues._[p],
            r;

        if (s && !running) {
            running = 1;
            r = s.apply(null, $.map(u, function(a){return a|0}));
            if (false !== r) page = p;
        }
    }

    // Set running to false
    // 
    function done() {
        running = 0
        onResizeHandler();

        // Audio background
        var player = ('intro' == page || 'section' == page) && sections[sid].bgSounds;
        if (audioBgPlayer != player) {
            audioBgPlayer && audioBgPlayer.pause();
            audioBgPlayer = player;
            audioBgPlayer && audioBgPlayer.play();
        }
    }

    function selected(selector, visible) {
        $('.selected').cls('selected', 1);
        $(selector).cls('selected');
        $('#menu').cls("items-visible", !visible)
    }

    // dir:  -1 or 1 (left or right ; up or down)
    // vert: true iff vertical slide
    function slide(from, to, dir, vert, callback) {
        var p = to.parentNode,
            x = vert ? 0 : -dir * 100,
            y = vert ? -dir * 100 : 0;

        CSS(p, {
            transform:  'translate3d('+x+'%,'+y+'%,0)',
            transition: 'none'
        });
        CSS(from, {x: -x + '%', y: -y + '%'});
        CSS(to,   {x: 0, y: 0, d: 'block'});

        setTimeout(function() {
            CSS(p, {transform:'translate3d(0,0,0)', transition: '500ms'});   // 500ms
            setTimeout(function() {
                CSS(from, {d:'none'});
                callback && callback();
            }, 500)
        }, 10);
    }

    // Build cell content
    // 
    function buildCellContent(data, cell, idx) {
        var W  = 8.3333, H  = 14.2857,  // Grid cell width, height
            Px = 1,      Py = 1.5,      // Line padding x, y
            P  = [],                    // Point matrix
            N  = data.noline || {},     // No lines sparse matrix
            i, j, x, y, lx, ly, k;

        // Init point matrix
        for (i=0; i<13; i++) P.push([0,0,0,0,0,0,0,0]);        

        // Build cell content and fill point matrix
        $.each(data.content, function(c, i, x, y, w, h) {
            x = c.x; y = c.y;   w = c.w; h = c.h;
            if (!c.a) {
                P[x  ][y  ]++;  P[x  ][y+h]++;
                P[x+w][y  ]++;  P[x+w][y+h]++;                    
            }
            x *= W; y *= H;     w *= W; h *= H;

            cell.append($.build('div'
                    , { C:'content' + (c.a ? ' fadeIn' : ''),
                        c:'top:'+y+'%;left:'+x+'%;width:'+w+'%;height:'+h+'%'
                        + (c.full ? ';background-image:url('+mediaPath+c.full+')' : '') }
                    , c.thumb && ['div', {C:'img', c:'background-image:url('+mediaPath+c.thumb+')'}]
                    , c.zoom  && ['div', {C:'opn', 'data-href':'picture:'+idx+':'+i}, ['ins',{C:'icon-zoom'}]]
            ));
        })

        // Add horizontal and vertical lines
        for (lx={}, i=0; i<13; i++) {
            ly = -1;
            for (j=0; j<13; j++) {
                if (P[i][j] > 1) {
                    k = N[i] && N[i][j];
                    x = i*W;
                    y = j*H;
                    !k && x && ly >= 0 && cell.append($.build('div'
                        , {C:'vl', c:'left:'+x+'%;top:'+(ly+Py)+'%;height:'+(y-ly-2*Py)+'%'}));
                    !k && y && y in lx && cell.append($.build('div'
                        , {C:'hl', c:'top:'+y+'%;left:'+(lx[y]+Px)+'%;width:'+(x-lx[y]-2*Px)+'%'}));
                    if (j < 7) lx[y] = x;
                    ly = y;
                }
            }
        }
    }

    function onResizeHandler(i, l) {
        'section' == page
            ? sid >= 0 && sections[sid].update()
        : 'intro' == page
            ? sid >= 0 && sections[sid].ipdate()
        : 0;
        modal && modal.update && modal.update();
    }

    function showWelcomeScreen() {
        var src = allSounds[Math.random()*allSounds.length|0];

        welcomeSound = audioManager.newPreloadedPlayer(src,function(s){
            if (!s) this.destroy()
        });

        welcomeSound.play();
        $('.wa').cls('wav', 1);
        $('#welcome').show();
        $('#content,#home').hide();
        setTimeout(showWelcomeAnimation, 400);
    }

    function showWelcomeAnimation() {
        var o = $('.wa'),
            l = o.length,
            i = l,
            j, x;

        for(; i; j=Math.random()*i|0, x=o[--i], o[i]=o[j], o[j]=x);
        !function fn() {
            if (l) {
                $(o[--l]).cls('wav');
                setTimeout(fn, 100);
            }
        }();
    }

    // -------------------------------------------------------------------------
    // 
    // Init
    // 
    // -------------------------------------------------------------------------

    // Tap anywhere ™
    // 
    body.on('tap', function(e) {
        var n = e.getOriginalTarget(),
            h = $(n).closest('[data-href]').attr('data-href');
        h ? show(h)
          : (h = n.href) && (window.location.href = h);
    })

    // Disable tap anywhere on favorites unless a favorite is clicked
    // (needed for scrolling)
    favsNode.on('touchstart,touchmove,touchend', function(e) {
        if (!$(e.getOriginalTarget()).closest('[data-href]')[0])
            e.stopPropagation();
    })

    // Stop sounds when visibility
    // 
    document.addEventListener('webkitvisibilitychange', function(e) {
        if (e.target.webkitHidden) {
            audioManager.stopAll();
        }
    }, false);

    // Update on resize and prevent touch
    // 
    $(window).on('resize', $.debounce(onResizeHandler, 100));
    body.on('touchmove', function(e) { e.preventDefault() });

    // Init modals
    // 
    modalPic
        .append($.build('div', {C: 'side'}))
        .append($.build('div', {C: 'close-modal icon-close', 'data-href': 'close'}))
        .append($.build('div', {C: 'open-side icon-text', 'data-href': 'side'}))
        .append($.build('div', {C: 'play-audio icon-play', 'data-href': 'audio'}))
        .append($.build('div', {C: 'audio-bar'}, ['div', {C: 'audio-cursor'}]));

    modalText
        .append($.build('div', {C: 'close-modal icon-close', 'data-href': 'close'}));
    modalMap.bdy = $('.ddown', modalMap);

    // Init sections
    // 
    $('.section').each(function(node, id) {
        var title   = $('.title', node),
            data    = DATA.sections[id],
            sounds  = data.sounds,
            minimap = $('.minimap', node).minimap(),
            desktop = $('.desktop', node).desktop({
                step:   minimap.step,
                build:  function(n, i) { buildCellContent(data.cells[i], n, i) },
                show:   function(n, i) {
                    updateAddfav(cid = i);
                    title.text(data.cells[i].title)
                }
            }),

            $intro  = $('.intro.s'+id),
            intro   = $intro[0],
            inner   = $('.inner', intro),
            text    = $('.text', intro),
            map     = $('.map', intro),
            mapData = data.map || 0,
            pins,
            twidth, box, ratio, iopen;

        // Hide desktop
        desktop.hide();

        // Setup map
        $intro
            .on('swiping', function(e) {
                var v = (iopen ? -twidth : 0) + e.dx;
                v = v > 0 ? 0 : v < -twidth ? -twidth : v;
                inner.css({transform:'translate3d('+v+'px,0,0)', transition: 'none'})
            })
            .on('swipe', function(e) {
                var x = box.w,
                    v = iopen ? 'right' == e.dir ? 0 : -twidth
                              : 'left'  == e.dir ? -twidth : 0;

                iopen = !!v;
                inner.css({
                    transition: '500ms',
                    transform: 'translate3d('+v+'px,0,0)'
                })
            });

        if (mapData) {
            map.css({'background-image':'url('+mediaPath+mapData[0]+')'});
            $.each(data.cells, function(cell, idx) {
                map.append($.build('div', {C: 'pin', 'data-href': 'section:'+id+':'+idx}))
            });
            pins = $('.pin', map);
        }

        // Sounds
        sounds = $.map(sounds || [], function(path) { return mediaPath+path });
        if (!sounds.length) sounds = false;
        else allSounds = allSounds.concat(sounds);

        // Content
        $('#home .s'+id+' span').text(data.title);
        $('#home .s'+id+' .pic').css({'background-image':'url('+mediaPath+data.home+')'});
        $('#menu .s'+id).text(data.title).css({'background-image':'url('+mediaPath+data.menu+')'});
        $('h2', intro).text(data.intro);
        $('p', intro).html(data.text);

        // Push section object
        sections.push({
            node:   node,
            intro:  intro,
            fbtn:   $('.add-fav', node),

            // Update intro
            ipdate: function() {
                // Position map
                twidth  = text.offset().w;
                box     = $intro.offset();
                map.css({x: twidth + 108, y: 16, bottom: 16, w: box.w - 116});
                
                // Position pins inside map
                box     = map.offset();
                ratio   = Math.min(box.w / mapData[1], box.h / mapData[2]);

                var w2  = (box.w - mapData[1] * ratio) / 2,
                    h2  = (box.h - mapData[2] * ratio) / 2, 
                    dta;

                $.each(data.cells, function(cell, i) {
                    $.css(pins[i], (dta = cell.pin)
                        ? {x: w2+dta[0]*ratio, y: h2+dta[1]*ratio, w:50*ratio, h:50*ratio}
                        : {d: 'none'});
                });

                // Always show text
                iopen = 0;
                inner.css({
                    transition: '0',
                    transform: 'translate3d(0,0,0)'
                })
            },
            
            // Update section
            update: function() {
                minimap.update();
                desktop.update();
            },

            // Show specific cell
            show: function(id) {
                minimap.update();
                desktop.update(true);   // no show
                desktop.show(id);
            },

            // Get cell state (visited, active)
            cell: minimap.cell,

            bgSounds: sounds && audioManager.newBackgroundPlayer(sounds)
        })
    })

    // Set content
    // 
    //
    $('#home h2').text(DATA.title);
    $('#home p').html(DATA.intro);

    // Main
    // 
    setTimeout(function() {
        $('#welcome *').cls('wah');
        $('#preload').remove();
        $('.wb').cls('wav');
        showWelcomeScreen();
    }, 200);
        
    /*
    */
    //show('home');
    //show('favs');
    //show('intro:1');
    //show('section:1:5');

})