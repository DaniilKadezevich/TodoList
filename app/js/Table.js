'use strict';
function MainTable() {
    this.generateRows = function () {

        let $rows = $('.row_notes');

        this.removeRows($rows);

        let $tasksContainer = $('#tasks_container');

        this.createRowsAndCols($tasksContainer, 7);

        let $cols = $('.row_notes .col');

        this.fillCols($cols);
    };

    this.fillCols = function (cols) {
        let self = this;

        let Done = _.remove(tasks, {status: 'Done'}),
            priorityHigh = _.filter(tasks, {priority: 'High'}),
            priorityNormal = _.filter(tasks, {priority: 'Normal'});
        tasks = _.concat(priorityHigh, priorityNormal, Done);

        _.forEach(tasks, function (value, index) {
            let task = tasks[index];

            let $col = cols[index];

            let $title = task.title,
                $priority = task.priority;

            let $taskParent = $('<div>', {class: 'note', text: $title}),
                $statusAndPriorityParent = $('<div>', {class: 'fa-lg'}),
                $btnDoneParent = $('<div>', {class: 'fa-2x'});

            if ($priority === 'High') {
                $statusAndPriorityParent.html('');
                let $iconHighPriority = $('<i>', {class: 'fas fa-star ml-2'});
                $iconHighPriority.appendTo($statusAndPriorityParent);
            } else {
                $statusAndPriorityParent.html('');
            }

            if (task.status === 'Done'){

                $taskParent.addClass('done');

                let $iconDelete = $('<i>', {class: 'fas fa-trash-alt'});

                self.addTooltip($statusAndPriorityParent, {title: 'Delete Task', delay: {'show': 300}});

                $statusAndPriorityParent.on('click', function (e) {
                    e.stopPropagation();

                    $statusAndPriorityParent.tooltip('dispose');

                    tasks.splice(index, 1);

                    self.generateRows();

                    self.updateLocalStorage();
                });
                $iconDelete.appendTo($statusAndPriorityParent);

                $taskParent.on('click', function () {
                    task.status = 'Open';

                    self.generateRows();

                    self.updateLocalStorage();
                });
            } else {
                let $iconDone = $('<i>', {class: 'fas fas fa-check-circle'});
                $iconDone.appendTo($btnDoneParent);

                self.addTooltip($btnDoneParent, {title: 'Done', delay: {'show': 300}});

                $btnDoneParent.hide();

                $btnDoneParent.on('click', function () {
                    $btnDoneParent.tooltip('dispose');

                    task.priority = 'Normal';

                    task.status = 'Done';

                    self.generateRows();

                    self.updateLocalStorage();
                });

                $btnDoneParent.appendTo($taskParent);

                $taskParent.on('mouseenter', function () {
                    $statusAndPriorityParent.hide();
                    $btnDoneParent.show();
                });
                $taskParent.on('mouseleave', function () {
                    $btnDoneParent.hide();
                    $statusAndPriorityParent.show();
                });

                $taskParent.on('click', function () {
                    let $editModal = $('#editModal');
                    let $formFields = $editModal.find('.form-control'),
                        $inputTaskTitle =  $('#edit_task-name'),
                        $inputTaskDescription =  $('#edit_task-description'),
                        $selectTaskStatus =  $('#edit_task-status'),
                        $inputTaskDeadline =  $('#edit_deadline');

                    let $btnEditPriority = $('#editPriority');

                    $btnEditPriority.off();
                    self.addTooltip($btnEditPriority, {title: 'Set Priority', placement: 'right',delay: {'show': 300}});

                    $editModal.on('shown.bs.modal', function () {
                        $('#plus').slideUp();
                        $('#edit_task-name').trigger('focus');
                    });

                    $editModal.on('hidden.bs.modal', function () {
                        $inputTaskTitle.tooltip('dispose');
                        $('#plus').slideDown();
                        $btnEditPriority.find('svg').removeClass('high_priority');
                    });

                    if ($priority === 'High') {
                        $btnEditPriority.find('svg').addClass('high_priority');
                    }
                    $btnEditPriority.on('click', function () {
                        $btnEditPriority.find('svg').toggleClass('high_priority');
                    });

                    self.clearFormFields($formFields);
                    self.fillFormFields(
                        [$inputTaskTitle, $inputTaskDescription, $selectTaskStatus, $inputTaskDeadline],
                        [task.title, task.description, task.status, task.deadline]
                    );

                    $inputTaskDeadline.datepicker({
                        dateFormat: "DD, d MM, yy"
                    });

                    let $btnEditTask = $('#editTask');
                    $btnEditTask.off();
                    $btnEditTask.on('click', self.eventBtnEditTask.bind(self, task, $editModal, $btnEditPriority, {
                        fieldTitle: $inputTaskTitle,
                        fieldDescription: $inputTaskDescription,
                        fieldStatus: $selectTaskStatus,
                        fieldDeadline: $inputTaskDeadline,
                    }));

                    $editModal.modal('show');
                });
            }

            $statusAndPriorityParent.appendTo($taskParent);

            $taskParent.appendTo($col);
        })
    };

    this.formAdd = function () {
        let self = this;

        let $addModal = $('#addModal');

        let $formFields = $addModal.find('.form-control'),
            $inputTaskName =  $('#task-name'),
            $inputTaskDescription =  $('#task-description'),
            $inputTaskDeadline =  $('#deadline');

        let $btnShowAddForm = $('#plus'),
            $btnSetPriority = $('#setPriority');

        $btnShowAddForm.off();
        this.addTooltip($btnShowAddForm, {title: 'Add Task', delay: {'show': 300}});
        $btnShowAddForm.on('click', function () {
            let $btnAddTask = $('#addTask');

            $addModal.on('shown.bs.modal', function () {
                $btnShowAddForm.slideUp();
                $('#task-name').trigger('focus');
            });
            $addModal.on('hidden.bs.modal', function () {
                $inputTaskName.tooltip('dispose');
                $btnShowAddForm.slideDown();
                $btnSetPriority.find('svg').removeClass('high_priority');
            });

            self.clearFormFields($formFields);

            $inputTaskDeadline.datepicker ({
                dateFormat: "DD, d MM, yy"
            });

            $btnSetPriority.off();
            self.addTooltip($btnSetPriority, {title: 'Set Priority', placement: 'right',delay: {'show': 300}});
            $btnSetPriority.on('click', function () {
                $btnSetPriority.find('svg').toggleClass('high_priority');
            });

            $btnAddTask.off();
            $btnAddTask.on('click', function () {
                if ($inputTaskName.val().trim()) {
                    let title = $inputTaskName.val(),
                        description = $inputTaskDescription.val(),
                        deadline = $inputTaskDeadline.val(),
                        priority = 'Normal';

                    if ($btnSetPriority.find('svg').hasClass('high_priority')){
                        priority = 'High';
                    }
                    if (deadline === '') {
                        deadline = 'Someday'
                    }
                    tasks.push({title: title, description: description, priority: priority, status: 'Open', deadline: deadline});

                    self.generateRows();

                    self.updateLocalStorage();

                    $addModal.modal('hide');
                } else {
                    self.addTooltip($inputTaskName, {title: 'You should fill this field to add task', trigger: 'focus'});
                    $inputTaskName.trigger('focus');
                }
            });

            $addModal.modal('show');
        });
    };


    this.createRowsAndCols = function (parent, amount) {
        let $rowNotes = $('<div>', {class: 'row row_notes'}),
            $colLeft = $('<div>', {class: 'col pl-0'}),
            $colRight = $('<div>', {class: 'col pr-0'});
        for (let i = 0; i < amount; i++) {
            let $row = $rowNotes.clone();

            $colLeft.clone().appendTo($row);
            $colRight.clone().appendTo($row);

            $row.appendTo(parent);
        }

        if (tasks.length > (amount * 2)) {
            for (let i = 0; i < Math.ceil((tasks.length - 14) / 2); i++) {
                let $row = $rowNotes.clone();

                $colLeft.clone().appendTo($row);
                $colRight.clone().appendTo($row);

                $row.appendTo(parent);
            }
        }
    };

    this.eventBtnEditTask = function (task, editModal, btnEditPriority,  fields) {
        let taskTitle = fields.fieldTitle.val(),
            taskDescription = fields.fieldDescription.val(),
            taskPriority,
            taskStatus = fields.fieldStatus.val(),
            taskDeadline = fields.fieldDeadline.val();

        if (taskTitle.trim()) {
            if (taskStatus === 'Done') {
                btnEditPriority.find('svg').removeClass('high_priority');
            }

            if (btnEditPriority.find('svg').hasClass('high_priority')) {
                taskPriority = 'High';
            } else {
                taskPriority = 'Normal';
            }

            if (!taskDeadline) {
                taskDeadline = 'Someday';
            }

            this.setTaskInformation(task, {
                title: taskTitle,
                description: taskDescription,
                priority: taskPriority,
                status: taskStatus,
                deadline: taskDeadline
            });

            this.generateRows();

            this.updateLocalStorage();

            editModal.modal('hide');
        } else {
            this.addTooltip(fields.fieldTitle, {title: 'You should fill this field to edit task', trigger: 'focus'});

            fields.fieldTitle.trigger('focus');
        }
    };


    this.setTaskInformation = function (task, fields) {
        _.forEach(fields, function (value, key) {
            task[key] = value
        })
    };

    this.fillFormFields = function (fields, values) {
        _.forEach(fields, function (field, index) {
            field.val(values[index]);
        });
    };

    this.clearFormFields = function (fields) {
        fields.val('');
    };

    this.addTooltip = function (element, options) {
        element.tooltip('dispose');
        element.tooltip(options);
    };

    this.removeRows = function (rows) {
        rows.remove();
    };

    this.updateLocalStorage = function () {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}
