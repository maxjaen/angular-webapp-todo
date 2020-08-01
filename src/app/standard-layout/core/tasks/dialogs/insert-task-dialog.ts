import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Task } from '../model/task';

@Component({
  selector: 'insert-task-dialog',
  templateUrl: 'insert-task-dialog.html',
})
export class InsertTaskDialog {
  constructor(
    public dialogRefService: MatDialogRef<InsertTaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Task
  ) {}

  onNoClick(): void {
    this.dialogRefService.close();
  }
}
