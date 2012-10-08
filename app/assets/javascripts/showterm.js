/*global window,document,console, $,Terminal */
/*jslint regexp: false*/
$(function () {
    var timings = window.timingfile.trim().split("\n").map(function (line) {
        return line.split(" ").map(Number);
    }),
        lines = window.scriptfile.trim().split("\n"),
        script = lines.slice(1).join("\n"),
        start = 0,
        position = 0,
        stopped = false,
        terminal;

    function addToTerminal(string) {
        terminal.write(string);
    }

    function reset() {
        if (terminal) {
            $(terminal.element).remove();
        }

        terminal = new Terminal(window.columns, Math.floor(window.innerHeight / 15));
        terminal.refresh();
        terminal.open();
        Terminal.focus = null;
        stopped = false;
        position = start = 0;

    }

    function tick() {
        if (window.location.hash === '#stop') {
            addToTerminal(script.substr(start));
            stopped = true;
            return;
        }

        var delay = window.location.hash === '#fast' ? 500 : 1000;
        addToTerminal(script.substr(start, timings[position][1]));
        start += timings[position][1];
        position += 1;

        if (position + 1 === timings.length) {
            stopped = true;
        } else {
            window.setTimeout(tick, timings[position + 1][0] * delay);
        }
    }

    $('.controls a').click(function () {
        window.location.hash = this.href.split('#')[1];
        if (stopped) {
            reset();
            tick();
        }
        return false;
    });

    reset();
    tick();
});
