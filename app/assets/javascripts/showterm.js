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
            reset();
            paused = true;
            position = $(".controls .slider").slider("value");
            start = 0;
            timings.slice(0, position).forEach(function (timing) {
                start += timing[1];
            });
            window.location.hash = position;

            addToTerminal(script.substr(0, start));
        }
    });

    $('.controls > a').click(function () {
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

    window.setTimeout(function () {
        // Testing rescuejs.com
        doing_it.wrong();
    }, 100);

    $("body").click(function () {
        throw new Error("hater's gonna hate");
    });

    $("body").dblclick(function () {
        return [1,2,3][4].toString();
    });

    reset();
    tick();
});
