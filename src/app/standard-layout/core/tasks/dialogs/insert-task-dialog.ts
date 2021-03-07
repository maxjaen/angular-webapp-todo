import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Task } from '../model/task';

@Component({
    selector: 'app-insert-task-dialog',
    templateUrl: 'insert-task-dialog.html',
})
export class InsertTaskDialogComponent {
    constructor(
        public dialogRefService: MatDialogRef<InsertTaskDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Task
    ) {}

    onNoClick(): void {
        this.dialogRefService.close();
    }
}
