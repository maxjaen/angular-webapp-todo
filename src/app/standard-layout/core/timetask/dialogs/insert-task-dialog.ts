import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Task } from "../../tasks/model/task";
import { TaskService } from "../../tasks/services/task.service";
import { TimeTask } from "../model/timetask";

@Component({
  selector: "insert-task-dialog",
  templateUrl: "insert-task-dialog.html",
})
export class InsertTaskDialogTime {
  tasks: Task[];

  constructor(
    private taskService: TaskService,
    public dialogRef: MatDialogRef<InsertTaskDialogTime>,
    @Inject(MAT_DIALOG_DATA) public data: TimeTask
  ) {
    this.taskService.getAllTasks().subscribe((tasks) => {
      this.tasks = tasks
        .filter((e) => !e.hided)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      tasks.push({
        id: 0,
        shortdescr: "Not an existing task",
        longdescr: "",
        date: new Date(),
        hided: false,
        pinned: true,
        templongdescr: "",
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
