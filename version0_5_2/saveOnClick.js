let isSaving = false;

$('#save a')[0].onclick = () => {
    if (isSaving) return;
    
    isSaving = true;
    stopGame();

    $('#save').append('<span id="save_msg">(игра сохраняется<span id="loader"></span>)</span>');

    let checkingAnimation = setInterval(() => {
        let count = 0;
        let animation = $('.element:animated');

        if (!animation[0]) {
            save(`/versions/${getModId()}/save/`);
            $('#save_msg').remove();

            clearInterval(checkingAnimation);
            runGame();
            isSaving = false;
        } else {
            if (count <= 3) $('#loader').append('.');
            count++;
        }
    }, 500);
}