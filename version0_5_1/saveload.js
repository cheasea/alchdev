function save(to) {
    var elements = [];
    $('#board').children('.element').not(':data(toKill,1)').not(':data(maybeKill,1)').each(function () {
        elements.push({
            'name': $(this).data('elementName'),
            'offset': $(this).offset()
        });
    });
    var data = {
        "opened": opened,
        "recipes": recipes,
        "elements": elements,
        "counters": counters
    };

    var success = function () {
        $('#save').fadeOut();
    };
    var error = function () {
        alert("Не удалось сохранить игру.");
    };

    if (use_local_storage_to_save) {
        try {
            window.localStorage[local_mod_save_key] = $.toJSON(data);
            success();
        } catch (e) {
            error();
        }
    } else {
        var saveToServer = function () {
            $.post(to, {
                "data": $.toJSON(data)
            }, function (data) {
                if (data == 'OK') {
                    success();
                } else {
                    error();
                }
            });
        };

        if (typeof (VK_api) != 'undefined') {
            VK_StorageSetJSON({
                key: local_mod_save_key,
                value: $.toJSON(data),
                success: success,
                error: saveToServer
            });
        } else {
            saveToServer();
        }
    }
}