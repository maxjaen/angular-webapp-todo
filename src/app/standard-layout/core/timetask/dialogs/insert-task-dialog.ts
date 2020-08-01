import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Task } from '../../tasks/model/task';
import { TaskService } from '../../../shared/services/core/task.service';
import { TimeTask } from '../model/timetask';
import { TimeService } from 'src/app/standard-layout/shared/services/utils/time.service';
import { UtilityService } from 'src/app/standard-layout/shared/services/utils/utility.service';

@Component({
  selector: 'insert-task-dialog',
  templateUrl: 'insert-task-dialog.html',
})
export class InsertTaskDialogTime {
  tasks: Task[];

  constructor(
    private utilityService: UtilityService,
    private taskService: TaskService,
    private timeService: TimeService,
    public dialogRefService: MatDialogRef<InsertTaskDialogTime>,
    @Inject(MAT_DIALOG_DATA) public data: TimeTask
  ) {
    this.taskService.getAllTasks().subscribe((tasks) => {
      this.tasks = tasks
        .filter((e) => !e.hided)
        .sort((a, b) =>
          this.utilityService.sortNumerical(
            Date.parse(a.date.toString()),
            Date.parse(b.date.toString())
          )
        );

      const shortDescr = 'Not an existing task';
      const longDescr = '';
      const date = this.timeService.createNewDate();

      tasks.push({
        id: 0,
        shortdescr: shortDescr,
        tempshortdescr: shortDescr,
        longdescr: longDescr,
        templongdescr: longDescr,
        date: date,
        tempDate: date,
        hided: false,
        pinned: true,
      });
    });
  }

  selectCategory(event: { value: Task }) {
    this.data.task = event.value;
    this.data.shortdescr = event.value.shortdescr;
    this.data.longdescr = event.value.longdescr;
  }

  onNoClick(): void {
    this.dialogRefService.close();
  }
}
