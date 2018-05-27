'use strict';

$(document).ready(function () {
    let mainTable = new MainTable();

    let $btnSendData = $('#sendData');
    $btnSendData.tooltip({title: 'Send tasks to ...', delay: {show: 300}});
    $btnSendData.on('click', sendData);

    if (localStorage.getItem('tasks')) {
        tasks = JSON.parse(localStorage.getItem('tasks'));

        mainTable.generateRows();
    } else {
        $.getJSON('data/data.json', function (json) {
            tasks = json.tasks;
            mainTable.generateRows();
        })
    }

    generateSelectElement();

    mainTable.formAdd();
});
