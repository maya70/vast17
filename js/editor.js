'use strict';

var scle = 0.5;
var fortest = function () {
    // var scale=$(this).css('transform')+1;
    scle++;
    console.log(scle);
    console.log("iam in");
    $('canvas').css('transform', 'scale(' + scle + ',' + scle + ')');
    var canvas = $('canvas');
    var context = canvas.getContect('2d');
    $(context).restore();
}
var fortest2 = function () {

    if (scle > 1) {
        scle--;
        console.log(scle);
        $('canvas').css('transform', 'scale(' + scle + ',' + scle + ')');
        $('canvas').restore();
    }
}


var vaqua = {};

vaqua.q_id = 0;
/*global location, window, d3, vl, vg, localStorage, document,
 alert, console, VG_SPECS, VL_SPECS, ace, JSON3*/

var VEGA = 'vega';
var VEGA_LITE = 'vega-lite';

var ved = {
    version: '1.2.0',
    data: undefined,
    renderType: 'canvas',
    editor: {
        vega: null,
        'vega-lite': null
    },
    currentMode: null,
    vgHidden: true  // vega editor hidden in vl mode
};

ved.isPathAbsolute = function (path) {
    return /^(?:\/|[a-z]+:\/\/)/.test(path);
};

ved.params = function () {
    var query = location.search.slice(1);
    if (query.slice(-1) === '/') query = query.slice(0, -1);
    return query
        .split('&')
        .map(function (x) {
            return x.split('=');
        })
        .reduce(function (a, b) {
            a[b[0]] = b[1];
            return a;
        }, {});
};

ved.mode = function () {
    var $d3 = ved.$d3,
        sel = $d3.select('.sel_mode').node(),
        vge = $d3.select('.vega-editor'),
        ace = $d3.select('.vg-spec .ace_content'),
        idx = sel.selectedIndex,
        newMode = sel.options[idx].value,
        spec;

    if (ved.currentMode === newMode) return;
    ved.currentMode = newMode;

    if (ved.currentMode === VEGA) {
        ved.editor[VEGA].setOptions({
            readOnly: false,
            highlightActiveLine: true,
            highlightGutterLine: true
        });

        ace.attr('class', 'ace_content');
    } else if (ved.currentMode === VEGA_LITE) {
        ved.editor[VEGA].setOptions({
            readOnly: true,
            highlightActiveLine: false,
            highlightGutterLine: false
        });

        ace.attr('class', 'ace_content disabled');
    } else {
        throw new Error('Unknown mode ' + ved.currentMode);
    }

    vge.attr('class', 'vega-editor ' + ved.currentMode);

    ved.editorVisibility();
    ved.getSelect().selectedIndex = 0;
    ved.select('');
};

ved.switchToVega = function () {
    var sel = ved.$d3.select('.sel_mode').node(),
        spec = ved.editor[VEGA].getValue();
    sel.selectedIndex = 0;
    ved.mode();
    ved.select(spec);
};

// Changes visibility of vega editor in vl mode
ved.editorVisibility = function () {
    var $d3 = ved.$d3,
        vgs = $d3.select('.vg-spec'),
        vls = $d3.select('.vl-spec'),
        toggle = $d3.select('.click_toggle_vega');

    if (ved.vgHidden && ved.currentMode === VEGA_LITE) {
        vgs.style('display', 'none');
        vls.style('flex', '1 1 auto');
        toggle.attr('class', 'click_toggle_vega up');
    } else {
        vgs.style('display', 'block');
        // ved.resizeVlEditor();
        toggle.attr('class', 'click_toggle_vega down');
    }
    // ved.resize();
};

ved.select = function (spec) {
    var $d3 = ved.$d3,
        mode = ved.currentMode,
        desc = $d3.select('.spec_desc'),
        editor = ved.editor[mode],
        sel = ved.getSelect(),
        parse = mode === VEGA ? ved.parseVg : ved.parseVl;

    if (spec) {
        editor.setValue(spec);
        editor.gotoLine(0);
        desc.html('');
        parse();
        // ved.resizeVlEditor();
        return;
    }

    var idx = sel.selectedIndex;
    spec = d3.select(sel.options[idx]).datum();

    function parallel_coord() {
        console.log("mahmoud");
        $(".vega")
            .html('<object width="800" height="700" data="./../parallel-coords/index.html"/>').watch(600);
    }

    if (idx > 0) {
        if(idx ==26) {
            parallel_coord();
        }
        else {
            d3.xhr(ved.uri(spec), function (error, response) {

                var txt = vaqua.changeFields(response.responseText);

                editor.setValue(txt);
                editor.gotoLine(0);
                parse(function (err) {
                    if (err) console.error(err);
                    desc.html(spec.desc || '');
                });
                ved.format();
                console.log(response + idx);
            });
        }
    } else {
        editor.setValue('');
        editor.gotoLine(0);
        ved.editor[VEGA].setValue('');
        ved.resetView();
    }

    // if (mode === VEGA) {
    //     ved.resize();
    // } else if (mode === 'vl') {
    //     ved.resizeVlEditor();
    // }
};

ved.uri = function (entry) {//simple pir chart for ex --- file pat

    if (entry == "") {
        // console.log("hhhhhhh");
        // console.log(vaqua.defaultName);
        return '../uploads/' + vaqua.q_id + "/dataset/" + vaqua.defaultName + "_conf.json";
    }
    else {
        return ved.path + 'spec/' + ved.currentMode +
            '/' + entry.name + '.json';
    }
};

ved.renderer = function () {
    var sel = ved.$d3.select('.sel_render').node(),
        idx = sel.selectedIndex,
        ren = sel.options[idx].value;

    ved.renderType = ren;
    ved.parseVg();
};

ved.format = function () {
    for (var key in ved.editor) {
        var editor = ved.editor[key];
        var text = editor.getValue();
        if (text.length) {
            var spec = JSON.parse(text);
            text = JSON3.stringify(spec, null, 2, 60);
            editor.setValue(text);
            editor.gotoLine(0);
        }
    }
};

ved.parseVl = function (callback) {
    var spec, source,
        value = ved.editor[VEGA_LITE].getValue();

    // delete cookie if editor is empty
    if (!value) {
        localStorage.removeItem('vega-lite-spec');
        return;
    }

    try {
        spec = JSON.parse(value);
        // console.log(vaqua.attr+"   mahmoud");
        if(spec['encoding']['x']['type']!=vaqua.attr[spec['encoding']['x']['field']]||
            spec['encoding']['y']['type']!=vaqua.attr[spec['encoding']['y']['field']]){
            // console.log("attributes : " + );
            alert("not valid type");
            return;
        }
        // console.log("attributes : " + );
    } catch (e) {
        console.log(e);
        return;
    }

    if (ved.getSelect().selectedIndex === 0) {
        localStorage.setItem('vega-lite-spec', value);
    }

    // TODO: display error / warnings
    var vgSpec = vl.compile(spec).spec;
    var text = JSON3.stringify(vgSpec, null, 2, 60);
    ved.editor[VEGA].setValue(text);
    ved.editor[VEGA].gotoLine(0);

    // change select for vega to Custom
    var vgSel = ved.$d3.select('.sel_vega_spec');
    vgSel.node().selectedIndex = 0;

    ved.parseVg(callback);
};

ved.parseVg = function (callback) {
    if (!callback) {
        callback = function (err) {
            if (err) {
                if (ved.view) ved.view.destroy();
                console.error(err);
            }
        };
    }

    var opt, source,
        value = ved.editor[VEGA].getValue();

    // delete cookie if editor is empty
    if (!value) {
        localStorage.removeItem('vega-spec');
        return;
    }

    try {
        opt = JSON.parse(ved.editor[VEGA].getValue());
    } catch (e) {
        return callback(e);
    }

    if (ved.getSelect().selectedIndex === 0 && ved.currentMode === VEGA) {
        localStorage.setItem('vega-spec', value);
    }

    if (!opt.spec && !opt.url && !opt.source) {
        // wrap spec for handoff to vega-embed
        opt = {spec: opt};
    }
    opt.actions = false;
    opt.renderer = opt.renderer || ved.renderType;
    opt.parameter_el = '.mod_params';

    ved.resetView();
    var a = vg.embed('.vis', opt, function (err, result) {
        if (err) return callback(err);
        ved.spec = result.spec;
        ved.view = result.view;
        callback(null, result.view);
    });

};

ved.resetView = function () {
    var $d3 = ved.$d3;
    if (ved.view) ved.view.destroy();
    $d3.select('.mod_params').html('');
    $d3.select('.spec_desc').html('');
    $d3.select('.vis').html('');
};

// ved.resize = function (event) {
//     // ved.editor[VEGA].resize();
//     // ved.editor[VEGA_LITE].resize();
// };
//
// ved.resizeVlEditor = function () {
//     if (ved.vgHidden || ved.currentMode !== VEGA_LITE)
//         return;
//
//     var editor = ved.editor[VEGA_LITE];
//     var height = editor.getSession().getDocument().getLength() *
//         editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth();
//
//     if (height > 600) {
//         return;
//     } else if (height < 200) {
//         height = 200;
//     }
//
//     ved.$d3.select('.vl-spec')
//         .style('height', height + 'px')
//         .style('flex', 'none');
//     ved.resize();
// };

ved.setPermanentUrl = function () {
    var params = [];
    params.push('mode=' + ved.currentMode);

    var sel = ved.getSelect();
    var idx = sel.selectedIndex,
        spec = d3.select(sel.options[idx]).datum();

    if (spec) {
        params.push('spec=' + spec.name);
    }

    if (!ved.vgHidden && ved.currentMode === VEGA_LITE) {
        params.push('showEditor=1');
    }

    if (ved.$d3.select('.sel_render').node().selectedIndex === 1) {
        params.push('renderer=svg');
    }

    var path = location.protocol + '//' + location.host + location.pathname;
    var url = path + '?id=' + vaqua.q_id + '&' + params.join('&');

    // vaqua

    //window.history.replaceState("", document.title, url);
};

ved.export = function () {
    var ext = ved.renderType === 'canvas' ? 'png' : 'svg',
        url = ved.view.toImageURL(ext);
    //dataUrl = ved.view.toDataURL();
    // var el = d3.select(document.createElement('a'))
    //     .attr('href', url)
    //     .attr('target', '_blank')
    //     .attr('download', (ved.spec.name || VEGA) + '.' + ext)
    //     .node();

    //vis team
    //dowloadOnServe(dataUrl);
    //console.log(url)
    //var dataurl = getBase64FromImageUrl(url);
    vaqua.dowloadOnServe(url);
    // var evt = document.createEvent('MouseEvents');
    // evt.initMouseEvent('click', true, true, document.defaultView, 1, 0, 0, 0, 0,
    //     false, false, false, false, 0, null);
    // el.dispatchEvent(evt);
};


vaqua.dowloadOnServe = function (dataUrl) {

    $.ajax({
        type: "POST",
        url: "script.php",
        data: {
            'img': dataUrl,
            'q_id': vaqua.q_id,
            'comment': vaqua.comment.value
        },
        dataType: "json"
    }).done(function (res) {
        window.location = "./../index.php?qa=" + vaqua.q_id + "&qa_1=" + res['title'] + "&start=" + res['start'] + "#a_list_title";
    });
}

ved.setUrlAfter = function (func) {
    return function () {
        func();
        ved.setPermanentUrl();
    };
};

ved.goCustom = function (func) {
    return function () {
        ved.getSelect().selectedIndex = 0;
        func();
    };
};

ved.getSelect = function () {
    return ved.$d3.select('.sel_' + ved.currentMode + '_spec').node();
};

ved.init = function (el, dir) {


    vaqua.init();


    // Set base directory
    var PATH = dir || 'app/';
    vg.config.load.baseURL = PATH;
    ved.path = PATH;

    el = (ved.$d3 = d3.select(el));

    d3.text(PATH + 'template.php' + '?' + Math.floor(Math.random() * 1000), function (err, text) {
        el.html(text);


        vaqua.initUpload();

        vaqua.initTextArea(el);

        // Vega specification drop-down menu
        var vgSel = el.select('.sel_vega_spec');
        vgSel.on('change', ved.setUrlAfter(ved.select));
        vgSel.append('option').text('Custom');
        vgSel.selectAll('optgroup')
            .data(Object.keys(VG_SPECS))
            .enter().append('optgroup')
            .attr('label', function (key) {
                return key;
            })
            .selectAll('option.spec')
            .data(function (key) {
                return VG_SPECS[key];
            })
            .enter().append('option')
            .text(function (d) {
                return d.name;
            });


             var options =["1","2","3","4","5"];
             var options2 =["a","b","c","d","e"];
             for(var i=0 ; i<options.length ; i++){
             el.select('#attrselectorx').append('option').text(options[i]);
             el.select('#attrselectory').append('option').text(options2[i]);
               }

        // Vega-lite specification drop-down menu
        var vlSel = el.select('.sel_vega-lite_spec');
        vlSel.on('change', ved.setUrlAfter(ved.select));
        vlSel.append('option').text('Custom');
        vlSel.selectAll('optgroup')
            .data(Object.keys(VL_SPECS))
            .enter().append('optgroup')
            .attr('label', function (key) {
                return key;
            })
            .selectAll('option.spec')
            .data(function (key) {
                return VL_SPECS[key];
            })
            .enter().append('option')
            .attr('label', function (d) {
                return d.title;
            })
            .text(function (d) {
                return d.name;
            });

        // Renderer drop-down menu
        var ren = el.select('.sel_render');
        ren.on('change', ved.setUrlAfter(ved.renderer));
        ren.selectAll('option')
            .data(['Canvas', 'SVG'])
            .enter().append('option')
            .attr('value', function (d) {
                return d.toLowerCase();
            })
            .text(function (d) {
                return d;
            });

        // Vega or Vega-lite mode
        var mode = el.select('.sel_mode');
        mode.on('change', ved.setUrlAfter(ved.mode));


        // Code Editors
        var vlEditor = ved.editor[VEGA_LITE] = ace.edit(el.select('.vl-spec').node());
        var vgEditor = ved.editor[VEGA] = ace.edit(el.select('.vg-spec').node());

        [vlEditor, vgEditor].forEach(function (editor) {
            editor.getSession().setMode('ace/mode/json');
            editor.getSession().setTabSize(2);
            editor.getSession().setUseSoftTabs(true);
            editor.setShowPrintMargin(false);
            editor.on('focus', function () {
                d3.selectAll('.ace_gutter-active-line').style('background', '#DCDCDC');
                d3.selectAll('.ace-tm .ace_cursor').style('visibility', 'visible');
            });
            editor.on('blur', function () {
                d3.selectAll('.ace_gutter-active-line').style('background', 'transparent');
                d3.selectAll('.ace-tm .ace_cursor').style('visibility', 'hidden');
                editor.clearSelection();
            });
            editor.$blockScrolling = Infinity;
            d3.select(editor.textInput.getElement())
                .on('keydown', ved.goCustom(ved.setPermanentUrl));

            editor.setValue('');
            editor.gotoLine(0);


        });

        // adjust height of vl editor based on content
        // vlEditor.on('input', ved.resizeVlEditor);
        // ved.resizeVlEditor();

        // Initialize application
        el.select('.btn_spec_format').on('click', ved.format);
        el.select('.btn_vg_parse').on('click', ved.setUrlAfter(ved.parseVg));
        el.select('.btn_vl_parse').on('click', ved.setUrlAfter(ved.parseVl));
        el.select('.btn_to_vega').on('click', ved.setUrlAfter(function () {
            d3.event.preventDefault();
            ved.switchToVega();
        }));
        el.select('.btn_export').on('click', ved.export);
        el.select('.vg_pane').on('click', ved.setUrlAfter(function () {
            ved.vgHidden = !ved.vgHidden;
            ved.editorVisibility();
        }));


        // d3.select(window).on('resize', ved.resize);
        // ved.resize();

        var getIndexes = function (obj) {
            return Object.keys(obj).reduce(function (a, k) {
                return a.concat(obj[k].map(function (d) {
                    return d.name;
                }));
            }, []);
        };

        ved.specs = {};
        ved.specs[VEGA] = getIndexes(VG_SPECS);
        ved.specs[VEGA_LITE] = getIndexes(VL_SPECS);

        // Handle application parameters
        var p = ved.params();
        if (p.renderer) {
            ren.node().selectedIndex = p.renderer.toLowerCase() === 'svg' ? 1 : 0;
            ved.renderType = p.renderer;
        }

        if (p.mode) {
            mode.node().selectedIndex = p.mode.toLowerCase() === VEGA ? 1 : 0;
        }
        ved.mode();

        if (ved.currentMode === VEGA_LITE) {
            if (p.showEditor) {
                ved.vgHidden = false;
                ved.editorVisibility();
            }
        }

        if (p.spec) {
            var spec = decodeURIComponent(p.spec),
                idx = ved.specs[ved.currentMode].indexOf(spec) + 1;

            if (idx > 0) {
                ved.getSelect().selectedIndex = idx;
                ved.select();
            } else {
                try {
                    var json = JSON.parse(decodeURIComponent(spec));
                    ved.select(spec);
                    ved.format();
                } catch (err) {
                    console.error(err);
                    console.error('Specification loading failed: ' + spec);
                }
            }
        }

        // Load content from cookies if no example has been loaded
        // var key = ved.currentMode + '-spec';
        // if (ved.getSelect().selectedIndex === 0 && localStorage.getItem(key)) {
        //
        //     ved.select(localStorage.getItem(key));
        //
        // }

        // Handle post messages
        window.addEventListener('message', function (evt) {
            var data = evt.data;
            console.log('[Vega-Editor] Received Message', evt.origin, data);

            // send acknowledgement
            if (data.spec || data.file) {
                evt.source.postMessage(true, '*');
            }

            // set vg or vl mode
            if (data.mode) {
                mode.node().selectedIndex =
                    data.mode.toLowerCase() === VEGA_LITE ? 1 : 0;
                ved.mode();
            }

            // load spec
            if (data.spec) {
                ved.select(data.spec);
            } else if (data.file) {
                ved.getSelect().selectedIndex = ved.specs[ved.currentMode].indexOf(data.file) + 1;
                ved.select();
            }


        }, false);
        vaqua.initVegaJson();
    });


};


vaqua.findGetParameter = function (parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

vaqua.init = function () {

    vaqua.q_id = vaqua.findGetParameter('id');
    vaqua.defaultName = vaqua.findGetParameter('name');
}

vaqua.initVegaJson = function () {
    var $d3 = ved.$d3,
        mode = ved.currentMode,
        desc = $d3.select('.spec_desc'),
        editor = ved.editor[VEGA],
        sel = ved.getSelect(),
        parse = mode === VEGA ? ved.parseVg : ved.parseVl;

    var spec = d3.select(sel.options[5]).datum();


    d3.xhr(ved.uri(""), function (error, response) {

        var text = vaqua.changeFields(response.responseText);

        // console.log(text);
        editor.setValue(text);
        ved.select(text);
        editor.gotoLine(0);
        // parse(function (err) {
        //     if (err) console.error(err);
        //     desc.html(spec.desc || '');
        //
        // });
        ved.format();
    });
};


vaqua.changeFields = function (jsonTxt) {
    var jsonObj = JSON.parse(jsonTxt);

    // var keys = Object.keys(jsonObj);
    // console.log(keys);

    jsonObj = vaqua.parseConfJson(jsonObj);

    var text = JSON.stringify(jsonObj);

    return text;
}

vaqua.parseConfJson = function (jsonObj) {
    if (!vaqua.url) {
        vaqua.url = jsonObj['data'];
        vaqua.x = jsonObj['encoding']['x']['field'];
        vaqua.y = jsonObj['encoding']['y']['field'];
        vaqua.typeX = jsonObj['encoding']['x']['type'];
        vaqua.typeY = jsonObj['encoding']['y']['type'];

        vaqua.color = jsonObj['encoding']['color']['field'];
        vaqua.colorType = jsonObj['encoding']['color']['type'];

        vaqua.text = jsonObj['encoding']['text']['field'];
        vaqua.textType = jsonObj['encoding']['text']['type'];
        vaqua.attr = jsonObj['attr'];

        var a = new Array();
        var b = new Array();

         console.log("here is attributes.............................");
        for(var i=0 ; i < Object.keys(vaqua.attr).length ; i++)
        {
          a[i] = Object.keys(vaqua.attr)[i];
          console.log(a[i]);
        }

        console.log("here is types...................................");
        for(var i=0 ; i < Object.values(vaqua.attr).length ; i++)
        {
          b[i] = Object.values(vaqua.attr)[i]
          console.log(b[i]);
        }

        delete jsonObj['attr'];

    }
    console.log(vaqua.color+"mmd");

    var url = vaqua.url;
    var i = 0;
    var optio = ["s","l","m","n","o"];


    jsonObj['data'] = url;
    jsonObj['transform'] = "";
    var obj = jsonObj['encoding'];

    if (obj) {
        if (obj['x']) {
            obj['x']['field'] = vaqua.x;
            obj['x']['type'] = vaqua.typeX;
        }
        if (obj['y']) {
            obj['y']['field'] = vaqua.y;
            obj['y']['type'] = vaqua.typeY;
        }


        if (obj['text']) {
            obj['text']['field'] = vaqua.text||vaqua.x;
            obj['text']['type'] = vaqua.textType;
        }
        if (obj['color']) {
            obj['color']['field'] = vaqua.color||vaqua.y;
            obj['color']['type'] = vaqua.colorType;
        }
        if (obj['size']) {
            obj['size']['field'] = vaqua.y;
            obj['size']['type'] = vaqua.typeY;
        }
    }

    return jsonObj
}

vaqua.initTextArea = function (el) {

    var txtArea = el.select("#comment")[0][0];
    vaqua.comment = txtArea;
    var documentWidth = $(document).width();
    var documentHeight = $(document).height();
    var txtAreaWidth = vaqua.cumulativeOffset(txtArea).left;
    var txtAreaHeight = vaqua.cumulativeOffset(txtArea).top;
    txtArea.style.width = (documentWidth - txtAreaWidth) + "px";
    txtArea.style.height = (documentHeight - txtAreaHeight - 400) + "px";
};

vaqua.cumulativeOffset = function (element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);

    return {
        top: top,
        left: left
    };
};

vaqua.initUpload = function () {
    $("#upload").change(function () {

        var file_data = $('#upload').prop('files')[0];
        var form_data = new FormData();
        form_data.append('file', file_data);

        $.ajax({
            url: './app/vaqua/upload.php', // point to server-side PHP script
            dataType: 'text',  // what to expect back from the PHP script, if anything
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,
            type: 'post',
            success: function (res) {
                console.log("uploaded") // display response from the PHP script, if any
                vaqua.defaultName = res;
                vaqua.initVegaJson();
                vaqua.url = "";

            }
        });
    });
};
