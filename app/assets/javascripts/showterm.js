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
        terminal = new Terminal(window.columns, Math.floor(window.innerHeight / 15)),
        output = [];

    terminal.open();

    function addToTerminal(string) {
        terminal.write(string);
    }

    function tick() {
        addToTerminal(script.substr(start, timings[position][1]));
        start += timings[position][1];
        position += 1;

        if (position + 1 < timings.length) {
            window.setTimeout(tick, timings[position + 1][0] * 1000);
        }
    }

    tick();
});
