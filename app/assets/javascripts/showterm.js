/*global window,document,console, $,Terminal */
/*jslint regexp: false*/
$.fn.showterm = function (options) {
    var $that = this;
    options = options || {};

    Terminal.bindKeys = function () {};
    var timings, lines, script, start, position, stopped, paused, terminal;

    function load_from(options) {
        timings = (options.timingfile || '').trim().split("\n").map(function (line) {
            return line.split(" ").map(Number);
        });
        lines = (options.scriptfile || '').trim().split("\n");
        script = lines.slice(1).join("\n");
        start = 0;
        position = options.position || 0;
        stopped = options.stopped;
        paused = options.paused;
    }

    function addToTerminal(string) {
        terminal.write(string);
    }

    function reset() {
        if (terminal) {
            $(terminal.element).remove();
        }

        terminal = new Terminal({cols: options.columns || 80, rows: options.lines || Math.floor($that.innerHeight() / 15), parent: $that[0]});
        terminal.refresh();
        terminal.open();
        Terminal.focus = null;
        Terminal.cursorBlink = false;
        stopped = false;
        position = start = 0;
    }

    function tick() {
        if (window.location.hash === '#stop') {
            addToTerminal(script.substr(start));
            position = timings.length - 1;
            $that.find(".controls .slider").slider("value", position);
            stopped = true;
            return;
        } else if (window.location.hash.match(/#[0-9]+/)) {
            reset();
            var delta = 0;
            position = Number(window.location.hash.replace('#', ''), 10);

            timings.slice(0, position).forEach(function (timing) {
                delta += timing[1];
            });

            addToTerminal(script.substr(start, delta));
            $that.find(".controls .slider").slider("value", position);
            paused = true;
            return;
        }
        if (paused) {
            return;
        }

        var delay = window.location.hash === '#fast' ? 500 : 1000;
        addToTerminal(script.substr(start, timings[position][1]));
        start += timings[position][1];
        position += 1;
        $(".controls .slider").slider("value", position);

        if (position + 1 === timings.length) {
            stopped = true;
        } else {
            window.setTimeout(tick, timings[position + 1][0] * delay);
        }
    }

    $that.html('<div class="controls"><a target="_top" class="logo-link" href="/"><span class="logo">showterm</span></a><div class="slider"></div><a href="#slow">slow</a><a href="#fast">fast</a><a href="#stop">stop</a></div>');

    function play() {
        $that.find('.controls .slider').slider({
            min: 0,
            max: timings.length - 1,
            slide: function () {
                window.location.hash = $that.find(".controls .slider").slider("value");
                tick();
            }
        });

        $that.find('.controls > a[href^=#]').click(function () {
            window.location.hash = this.href.split('#')[1];
            if (paused) {
                paused = false;
                tick();
            }
            if (stopped) {
                reset();
                tick();
            }
            return false;
        });

        reset();
        tick();
    }

    if(options.url) {
        $.ajax({
            url: options.url,
            dataType: 'json',
            success: function(data) {
                load_from($.extend({}, options, data));
                play();
            }
        });
    } else {
        load_from(option);
        play();
    }

};
