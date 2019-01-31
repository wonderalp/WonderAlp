!function($) {

$.audioManager = function() {

    function createAudio() {
        return /iPad/.test(navigator.userAgent)
            ? $.iosAudio() : $.htmlAudio();
    }

    var audios = [createAudio(), createAudio()];

    // Request a new audio
    function requestAudio(id, callback) {
        var next, delay;

        $.each(audios, function(audio) {
            if (id == audio.id) {
                next = audio;
            } else if (audio.isPlaying()) {
                audio.fadeOut(1200);
                delay = true;
            } else if (!next && !audio.locked) {
                next = audio;
            }
        });

        next.clearHandlers().id = id;        
        delay   ? next.delay(function(){callback(next)}, 600)
                : callback(next);
    }

    // Checks if a sound is playing
    function isPlaying() {
        for (var i=0, l=audios.length; i<l; i++)
            if (audios[i].isPlaying())
                return true;
        return false;
    }

    function getAudioForId(id) {
        for (var i=0, l=audios.length; i<l; i++)
            if (id == audios[i].id)
                return audios[i];
        return false;
    }

    // Audio manager API
    return {
        // Stops all sounds
        stopAll: function() {
            $.each(audios, function(audio) { audio.pause() })
        },

        // New "player"
        newPlayer: function(source, onStatus, onProgress) {
            var id = +new Date+Math.random()+'';

            return {
                play: function() {
                    requestAudio(id, function(audio) {
                        audio.setStatusHandler(onStatus);
                        audio.setProgressHandler(onProgress);
                        audio.loadAndPlay(source);
                    })
                },

                pause: function() {
                    var audio = getAudioForId(id);
                    audio && audio.pause()
                },

                toggle: function() {
                    var audio = getAudioForId(id);
                    audio && audio.isPlaying() ? audio.pause() : this.play()
                },

                isPlaying: function() {
                    var audio = getAudioForId(id);
                    return audio && audio.isPlaying()
                },

                destroy: function() {
                    var audio = getAudioForId(id);
                    if (audio) {
                        audio.pause();
                        audio.clearHandlers();
                    }
                }
            }
        },

        // Preloaded "player"
        newPreloadedPlayer: function(source, onStatus, onProgress) {
            var id  = +new Date+Math.random()+'',
                aud = createAudio();
            
            audios.push(aud.load(source));
            aud.id      = id;
            aud.locked  = true;
            aud.setStatusHandler(onStatus);
            aud.setProgressHandler(onProgress);

            return {
                play:       function() { aud.play() },
                pause:      function() { aud.pause() },
                fadeOut:    function() { aud.fadeOut(1200) },
                toggle:     function() { aud.isPlaying() ? aud.pause() : aud.play() },
                isPlaying:  function() { return aud.isPlaying() },
                destroy:    function() { aud = aud.destroy(); }
            }
        },

        // New multiple random tracks player
        newBackgroundPlayer: function(sources, minWait, maxWait) {
            minWait = minWait ||  8000;
            maxWait = maxWait || 12000;

            var id      = +new Date+Math.random()+'',
                sounds  = [],   // sounds to play
                started = false,
                timeout = false;

            // Helpers
            function planIt() {
                timeout && clearTimeout(timeout);
                if (!started) return;

                var tme = Math.random()*(maxWait - minWait)|0 + minWait;

                timeout = setTimeout(function() {
                    isPlaying() ? planIt() : playRnd()
                }, tme);
            };

            function prepareSounds() {
                var i = 0, l = sources.length,
                    n = l-1, r;

                // Copy sources to sounds
                for (; i<l; i++)    sounds[i] = sources[i];
                // Shuffle sounds
                for (i=0; i<l; i++) sounds[n]=[sounds[r=Math.random()*l|0],sounds[r]=sounds[n]][0];
            }
           
            function playRnd() {
                requestAudio(id, function(audio) {
                    audio.setStatusHandler(function(state) {
                        !state && planIt()
                    })
                    !sounds.length && prepareSounds();
                    audio.loadAndPlay(sounds.pop());
                })
            };

            // Background player API
            return {
                play: function() {
                    if (started) return;
                    planIt(started = true);
                },

                pause: function() {
                    if (!started) return;

                    var audio = getAudioForId(id);
                    started = false;
                    timeout && clearTimeout(timeout);

                    audio && audio.fadeOut(800);
                },

                destroy: function() {
                    var audio = getAudioForId(id);
                    started = false;
                    timeout && clearTimeout(timeout);
                    audio && audio.pause().clearHandlers();
                }

            }
        }

    }
}


}(Base)