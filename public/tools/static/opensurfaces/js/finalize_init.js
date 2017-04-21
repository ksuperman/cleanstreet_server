$(function() {
    template_args.width = $('#mt-container').width() - 4;
    template_args.height = $(window).height() - 16 ;//$(window).height() - $('#mt-top-nohover').height() - 16;
    template_args.container_id = 'mt-container';
    $('#poly-container').width(template_args.width).height(template_args.height);
    return window.controller_ui = new ControllerUI(template_args);
});

$(window).load(function(){
    // append a invisible annotation
    // set up things
    ctrler = new Ctrler();
    ctrler.N = Anno.length;
    // redner things
    ctrler.renderHint();
    // ctrler.centerIcon();
    ctrler.addListener();
    window.controller_ui.s.stage_ui.layer.afterDrawFunc = ctrler.renderHint
});

// append a invisible annotation
// set up things
ctrler = new Ctrler();
ctrler.N = Anno.length;
// redner things
ctrler.renderHint();
// ctrler.centerIcon();
ctrler.addListener();
window.controller_ui.s.stage_ui.layer.afterDrawFunc = ctrler.renderHint

$('#my-file').on('change', function (event) {

    var f = event.target.files[0];
    var fr = new FileReader();

    fr.onload = function(ev2) {
        $('#mt-container').remove();

        $('#content-container').append($('#mt-container'));
        window.controller_ui = null;
        ctrler = null;

        window.template_args = {
            // BEGIN: OPENSURFACE ADD-ON, ADDED BY Tsung-Yi Lin
            photo_url: "https://upload.wikimedia.org/wikipedia/commons/1/19/Turl_Street%2C_Oxford.jpg",
            photo_id: 1,
            // END: OPENSURFACE ADD-ON, ADDED BY Tsung-Yi Lin
        };

        // the user must submit this many shapes before they may submit:
        window.min_shapes = 1;

        // each polygon must have at least this many vertices:
        window.min_vertices = 4;

        /* Creating the Controller UI */
        template_args.width = $('#mt-container').width() - 4;
        template_args.height = $(window).height() - 16 ;//$(window).height() - $('#mt-top-nohover').height() - 16;
        template_args.container_id = 'mt-container';
        $('#poly-container').width(template_args.width).height(template_args.height);
        window.controller_ui = new ControllerUI(template_args);

        /* */
        ctrler = new Ctrler();
        ctrler.N = Anno.length;
        // redner things
        ctrler.renderHint();
        // ctrler.centerIcon();
        ctrler.addListener();
        window.controller_ui.s.stage_ui.layer.afterDrawFunc = ctrler.renderHint

        ///window.controller_ui.set_photo('https://upload.wikimedia.org/wikipedia/commons/1/19/Turl_Street%2C_Oxford.jpg');
    };

    fr.readAsDataURL(f);
});

$('#btn-set-image').click(function(){
    $('#my-file').click();
});