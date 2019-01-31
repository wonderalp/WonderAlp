!function($){

var gVolume = 0.8,
    gUID    = 0,
    last    = 0,
    objects = {};

// Call native method
function callNative(action, id, param) {
    var str = 'action://' + action + ':' + id + (param ? '/' + param : ''),
        now = +new Date;

    setTimeout(function(){
        window.location.href = str
    }, now - last < 100 ? 200 : 1);
    last = now;
}

// Callback for native environment
window.triggerAudioEvent = function(id, type, p1, p2) {
    var obj = objects[id];
    if (obj)
        'progress' == type ? obj._triggerProgress(p1, p2)
        : 'status' == type ? obj._triggerStatus(p1)
        : 0
}

/**
 * HTML Audio classe factory
 * @return {Object} HTML Audio instance
 */
$.iosAudio = function() {
    var id      = ++gUID,
        playing = false,
        me      = {},
        timeout, statusHandler, progressHandler;

    // Load audio
    me.load = function(source, autoplay) {
        autoplay
            ? callNative('loadAndPlay', id, source)
            : callNative('load', id, source);
        return me;
    };

    // Load audio and play
    me.loadAndPlay = function(source) {
        return me.load(source, true);
    }

    // Play
    me.play = function() {
        !playing && callNative('play', id);
        return me;
    };

    // Pause
    me.pause = function() {
        playing && callNative('pause', id);
        return me;
    };

    // Fade out
    me.fadeOut = function(duration) {
        callNative('fadeOut', id, duration);
        playing = false;
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

    // Triggers progress event
    me._triggerProgress = function(position, duration) {
        progressHandler && progressHandler.call(this, position, duration)
    };

    // Triggers status event
    me._triggerStatus = function(isPlaying) {
        playing = isPlaying;
        statusHandler && statusHandler.call(this, isPlaying);
    }

    // Destroy
    me.destroy = function() {
        me.clearHandlers();
        playing = false;
        callNative('destroy', id);
    };

    return objects[id] = me
}

}(Base);