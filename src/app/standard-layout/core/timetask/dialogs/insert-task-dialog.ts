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
    this.taskService.getTasks().subscribe((tasks) => {
      this.tasks = tasks
        .filter((e) => !e.hided)
        .sort((a, b) =>
          this.utilityService.sortNumerical(
            Date.parse(a.date.toString()),
            Date.parse(b.date.toString())
          )
        );

      const shortDescription = 'Not an existing task';
      const longDescription = '';
      const date = this.timeService.createNewDate();

      tasks.push({
        id: 0,
        shortDescription: shortDescription,
        tempShortDescription: shortDescription,
        longDescription: longDescription,
        tempLongDescription: longDescription,
        date: date,
        tempDate: date,
        hided: false,
        pinned: true,
        project: 'Without project',
      });
    });
  }

  public selectCategory(event: { value: Task }) {
    this.data.task = event.value;
    this.data.shortDescription = event.value.shortDescription;
    this.data.longDescription = event.value.longDescription;
  }

  public onNoClick(): void {
    this.dialogRefService.close();
  }
}
