function getModId() {
    var regex = /[^\d]*(\d+)[^\d]*/gm;
    var res = regex.exec($('#load')[0].onclick.toString());
    return res[1];
}

$('#save a')[0].onclick = () => {
    $('#save').append('<span id="save_msg">(игра сохраняется)</span>');
    stopGame();

    setTimeout(() => {
        runGame();
        save('/versions/' + getModId() + '/save/');
        $('#save_msg').remove();
    }, 500);
}

function stopGame() {
    $('.element').draggable('disable');
    $('.element').droppable('disable');
    $('.element').selectable('disable');
}

function runGame() {
    $('.element').draggable('enable');
    $('.element').droppable('enable');
    $('.element').selectable('enable');
} 