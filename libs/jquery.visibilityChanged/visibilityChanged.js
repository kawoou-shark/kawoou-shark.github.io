(function ($) {
    var defaults = {
        callback: function () { },
        frequency: 100
    };

    var methods = {};
    methods.checkVisibility = function (element, options) {
        if ($.contains(document, element[0])) {
            const isVisible = element.is(':visible');
            if (!isVisible) {
                setTimeout(function() {
                    methods.checkVisibility(element, options);
                }, options.frequency);
                return;
            }

            options.callback(element);
        }
    };

    $.fn.visibilityChanged = function (options) {
        var settings = $.extend({}, defaults, options);
        return this.each(function () {
            methods.checkVisibility($(this), settings);
        });
    };
})(jQuery);