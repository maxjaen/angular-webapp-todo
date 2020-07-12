import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Task } from "../../tasks/model/task";
import { TaskService } from "../../../shared/services/core/task.service";
import { TimeTask } from "../model/timetask";
import { TimeService } from "src/app/standard-layout/shared/services/utils/time.service";

@Component({
  selector: "insert-task-dialog",
  templateUrl: "insert-task-dialog.html",
})
export class InsertTaskDialogTime {
  tasks: Task[];

  constructor(
    private taskService: TaskService,
    private timeService: TimeService,
    public dialogRef: MatDialogRef<InsertTaskDialogTime>,
    @Inject(MAT_DIALOG_DATA) public data: TimeTask
  ) {
    this.taskService.getAllTasks().subscribe((tasks) => {
      this.tasks = tasks
        .filter((e) => !e.hided)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      const shortDescr: string = "Not an existing task";
      const longDescr: string = "";
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
    this.dialogRef.close();
  }
}
