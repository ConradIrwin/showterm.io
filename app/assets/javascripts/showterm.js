/*global window,document,console, $,Terminal */
/*jslint regexp: false*/
$.fn.showterm = function (options) {
    var $that = this;
    delay = 1000
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
            $slider.slider("value", position);
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
            $slider.slider("value", position);
            paused = true;
            return;
        }
        if (paused) {
            return;
        }

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
    help_html = "<h3> Use following keyboard shortcuts for navigation: </h2> " + 
        "<ul>" +
            "<li> Spacebar : Play/Pause playback</li>" +
            "<li> shift + left/right arrow : Rewind/Forward playback" +
            "<li> '[' and ']' : Slow down/speed up playback" +
            "<li> ? : Show this help" +
            "<li> escape : Close this help if open" +
        "</ul>"
    $that.html('<div class="showterm-controls"><a target="_top" class="showterm-logo-link" href="/"><span class="showterm-logo">showterm</span></a><div class="showterm-slider"></div><a href="#slow">slow</a><a href="#fast">fast</a><a href="#stop">stop</a><a id="help_link" href="javascript:void">Help</a></div><div id="help_dialog">' + help_html + '</div>');
    $that.append($('<style>').text('.showterm-controls a { padding-right: 10px;} .showterm-controls { opacity: 0.8; padding: 10px; background: rgba(255, 255, 255, 0.2); position: absolute; right: 0; bottom: 0; } .showterm-controls .showterm-slider { height: 5px; width: 200px; margin-right: 10px; margin-left: 10px; display: inline-block;} .showterm-controls .showterm-slider a { height: 13px; } .showterm-controls .showterm-logo-link {  text-decoration: none;} .showterm-logo { font-weight: bold;} .showterm-logo:before { content: "$://"; color: #0087d7; font-weight: bold; letter-spacing: -0.2em; margin-right: 0.1em;}'));
    $slider = $that.find('.showterm-controls .showterm-slider')
    $dialog = $('#help_dialog')    
    $dialog.html(help_html)
    $dialog.dialog({
        title: "Help",
        autoOpen: false,
        close: resume,
        open: pause,        
        width: "auto"
    })
    function pauseOrResume() {
        if (paused) {
                resume()
            } else {
                pause()
            }
    }
    function resume() {
        paused = false;
        window.location.hash = ""
        tick();
    }
    function pause() {
        $slider.slider('option', 'slide').call($slider)
    }
    function showHelp(){
        $dialog.dialog('open')
    }
    $that.keydown(function(e){
        switch (e.keyCode)
        {
        case 32: // spacebar
            e.preventDefault()
            pauseOrResume()
            break;
        case 37: // left arrow:
        case 39: // right arrow:
            if(e.shiftKey) {            
                $slider.slider("value", $slider.slider("value") + 10*(e.keyCode - 38))
                pause()            
            }
            break;
        case 219: // [            
        case 221: // ]
            modifySpeed(e.keyCode - 220)
            break;
        case 191:
            if(e.shiftKey) { // ? key
                showHelp()
            }
        }
    })
    function modifySpeed(diff) {
        if(paused) {
            return
        }
        var d = delay - diff * 50
        if(d >= 0) {
            delay = d
            console.log("speed modified, new delay: " + delay)
        }
    }
    function play() {
        $slider.slider({
            min: 0,
            max: timings.length - 1,
            slide: function () {
                window.location.hash = $slider.slider("value");
                tick();
            }
        });

        $that.find('.showterm-controls > a[href^=#]').click(function () {
            window.location.hash = this.href.split('#')[1];
            if(window.location.hash == 'fast') {
                delay = 500
            }
            if (paused) {
                resume()
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
    $that.find('.showterm-controls > a#help_link').click(showHelp);    
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
