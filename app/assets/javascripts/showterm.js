/*global window,document,console, $,Terminal */
/*jslint regexp: false*/
$(function () {
    Terminal.bindKeys = function () {};
    var timings = window.timingfile.trim().split("\n").map(function (line) {
        return line.split(" ").map(Number);
    }),
        lines = window.scriptfile.trim().split("\n"),
        script = lines.slice(1).join("\n"),
        start = 0,
        position = 0,
        stopped = false,
        paused = false,
        terminal;

    function addToTerminal(string) {
        terminal.write(string);
    }

    function reset() {
        if (terminal) {
            $(terminal.element).remove();
        }

        terminal = new Terminal(window.columns, window.lines || Math.floor(window.innerHeight / 15));
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
            $(".controls .slider").slider("value", position);
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
            $(".controls .slider").slider("value", position);
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

    $('.controls .slider').slider({
        min: 0,
        max: timings.length - 1,
        slide: function () {
            window.location.hash = $(".controls .slider").slider("value");
            tick();
        }
    });

    $('.controls > a[href^=#]').click(function () {
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
});
