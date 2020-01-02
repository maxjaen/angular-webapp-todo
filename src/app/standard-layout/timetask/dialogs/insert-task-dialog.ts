import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Task } from '../../tasks/model/task';
import { TaskService } from '../../tasks/services/task.service';
import { TimeTask } from '../model/timetask';

export interface Category {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'insert-task-dialog',
  templateUrl: 'insert-task-dialog.html',
})
export class InsertTaskDialogTime {
  categories: Category[] = [
    { value: 'haushalt-0', viewValue: 'Haushalt' },
    { value: 'arbeit-1', viewValue: 'Arbeit' },
    { value: 'persönlich-2', viewValue: 'Persönlich' },
    { value: 'training-3', viewValue: 'Training' },
    { value: 'lernen-4', viewValue: 'Lernen' }
  ];
  tasks: Task[];

  constructor(private taskService: TaskService, public dialogRef: MatDialogRef<InsertTaskDialogTime>,
    @Inject(MAT_DIALOG_DATA) public data: TimeTask) {
      this.taskService.getAllTasks().subscribe(tasks => {
        this.tasks = tasks;
      })
     }

  selectCategory(event: { value: string; }) {
    this.data.shortdescr = event.value;
  };

  selectDescription(event: { value: string; }) {
    this.data.longdescr = event.value;
  };

  onNoClick(): void {
    this.dialogRef.close();
  }
}
