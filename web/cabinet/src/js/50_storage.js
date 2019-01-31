!function($) {
/**
 * HTML 5 storage wrapper, stores JSON encoded datas
 * 
 */
var storage = window.localStorage || {  // dummy fallback
        clear:   function(){},
        setItem: function(){},
        getItem: function(){}
    },
    api = {
        clear: function() {
            return storage.clear(), api
        },
        set: function(key, val) {
            return storage.setItem(key, JSON.stringify(undefined === val ? null : val)), api
        },
        get: function(key, def) {
            return key = storage.getItem(key)
                 , null === key || undefined === key ? def||null : JSON.parse(key)
        }
    };

$.storage = api;

}(Base)