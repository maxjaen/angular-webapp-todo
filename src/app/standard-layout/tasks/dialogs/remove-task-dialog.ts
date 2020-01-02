import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject } from '@angular/core';

@Component({
    selector: 'remove-task-dialog',
    templateUrl: 'remove-task-dialog.html',
  })
  export class RemoveTaskDialog {
  
    constructor(
      public dialogRef: MatDialogRef<RemoveTaskDialog>,
      @Inject(MAT_DIALOG_DATA) public data: Number) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  }