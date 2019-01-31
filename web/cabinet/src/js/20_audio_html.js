!function($){

var gVolume = 0.8;

/**
 * HTML Audio classe factory
 * @return {Object} HTML Audio instance
 */
$.htmlAudio = function() {
    var audio   = $.build('audio', {}, ['source', {y: 'audio/mpeg'}]),
        playing = false,
        me      = {},
        timeout, statusHandler, progressHandler;

    // Append to DOM
    document.body.appendChild(audio);

    // Bind audio progress
    $.bind(audio, 'timeupdate', function() {
        progressHandler
            && progressHandler.call(me, audio.currentTime, audio.duration||1);
    });

    // Bind audio play
    $.bind(audio, 'play', function() {
        statusHandler
            && statusHandler.call(me, playing = true);
    });

    // Bind audio pause
    $.bind(audio, 'pause', function() {
        statusHandler
            && statusHandler.call(me, playing = false);
    });

    // Load audio
    me.load = function(source, autoplay) {
        audio.currentTime    = 0;
        audio.firstChild.src = source;
        audio.volume         = gVolume;
        audio.autoplay       = !!autoplay;
        audio.load();
        return me;
    };

    // Load audio and play
    me.loadAndPlay = function(source) {
        return me.load(source, true);
    }

    // Play
    me.play = function() {
        !playing && audio.play();
        return me;
    };

    // Pause
    me.pause = function() {
        playing && audio.pause();
        return me;
    };

    // Fade out
    me.fadeOut = function(duration) {
        var endTime = +new Date() + duration,
            doit = function(){
                var now = +new Date(),
                    pos = (endTime - now) / duration;

                if (pos < 0) {
                    audio.volume = 0;
                    audio.pause();
                } else {
                    audio.volume = pos * gVolume;
                    planit();
                }
            },
            planit = function() {
                timeout && clearTimeout(timeout);
                timeout = setTimeout(doit, 100);
            };

        playing = false;
        planit();
        return me;
    };

    // True iff is currently playing
    me.isPlaying = function() {
        return playing;
    };

    // Delay callback
    me.delay = function(callback, duration) {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(callback, duration);
        return me;
    };

    // Sets the time update handler
    me.setProgressHandler = function(callback) {
        progressHandler = $.type(callback, 'f') ? callback : false;
        return me;
    };

    // Sets the status change handler
    me.setStatusHandler = function(callback) {
        statusHandler = $.type(callback, 'f') ? callback : false;
        return me;
    }

    // Clears all handlers and timeout
    me.clearHandlers = function() {
        timeout && clearTimeout(timeout);
        timeout = progressHandler = statusHandler = false;
        return me;
    };

    // Destroy
    me.destroy = function() {
        me.clearHandlers();
        playing = false;
        $(audio).remove();
    };

    return me
}



}(Base);