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
            $that.find(".showterm-controls .showterm-slider").slider("value", position);
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
            start = delta
            $that.find(".showterm-controls .showterm-slider").slider("value", position);
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
        $(".showterm-controls .showterm-slider").slider("value", position);

        if (position + 1 === timings.length) {
            stopped = true;
        } else {
            window.setTimeout(tick, timings[position + 1][0] * delay);
        }
    }

    $that.html('<div class="showterm-controls"><a target="_top" class="showterm-logo-link" href="/"><span class="showterm-logo">showterm</span></a><div class="showterm-slider"></div><a href="#slow">slow</a><a href="#fast">fast</a><a href="#stop">stop</a></div>');
    $that.append($('<style>').text('.showterm-controls a { padding-right: 10px;} .showterm-controls { opacity: 0.8; padding: 10px; background: rgba(255, 255, 255, 0.2); position: absolute; right: 0; bottom: 0; } .showterm-controls .showterm-slider { height: 5px; width: 200px; margin-right: 10px; margin-left: 10px; display: inline-block;} .showterm-controls .showterm-slider a { height: 13px; } .showterm-controls .showterm-logo-link {  text-decoration: none;} .showterm-logo { font-weight: bold;} .showterm-logo:before { content: "$://"; color: #0087d7; font-weight: bold; letter-spacing: -0.2em; margin-right: 0.1em;}'));
    function play() {
        $that.find('.showterm-controls .showterm-slider').slider({
            min: 0,
            max: timings.length - 1,
            slide: function () {
                window.location.hash = $that.find(".showterm-controls .showterm-slider").slider("value");
                tick();
            }
        });

        $that.find('.showterm-controls > a[href^=#]').click(function () {
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
        $.getJSON(options.url+"?callback=?").done(function(data) {
                load_from($.extend({}, options, data));
                play();
        });
    } else {
        load_from(options);
        play();
    }

};
