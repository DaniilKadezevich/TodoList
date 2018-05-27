'use strict';
function sendData() {
    $.ajax({
        url: '',
        type: "POST",
        data: tasks
    })
}
function generateSelectElement() {
    let $select = $('#edit_task-status');
    $select.html('');
    $.getJSON('data/data.json', function (json) {
        let statuses = json.statuses;

        _.forEach(statuses, function (status) {
            let $option = $('<option>', {value: status, text: status});
            $option.appendTo($select);
        })
    });
}