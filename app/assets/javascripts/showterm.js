/*global window,document,console, $,Terminal */
/*jslint regexp: false*/
$(function () {
    var timings = window.timingfile.trim().split("\n").map(function (line) {
        return line.split(" ").map(Number);
    }),
        lines = window.scriptfile.trim().split("\n"),
        script = lines.slice(1, lines.length - 2).join("\n"),
        start = 0,
        position = 0,
        terminal = new Terminal(80, 20),
        output = [];

    terminal.open();

    function addToTerminal(string) {
        terminal.write(string);
        console.log(string);
    }

    console.log(output);

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
