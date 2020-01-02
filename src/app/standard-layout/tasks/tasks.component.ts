import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from './services/task.service';
import { InsertTaskDialog } from './dialogs/insert-task-dialog';
import { RemoveTaskDialog } from './dialogs/remove-task-dialog';
import { Task } from './model/task';
import { MatDatepickerInputEvent, MatSnackBar } from '@angular/material';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {

  displayedColumns: string[] = ['id', 'shortdescr', 'longdescr'];
  tasks: Task[];
  selectedTask: Task;

  id: number;
  shortdescr: string;
  longdescr: string;
  date: Date;
  dateString: string

  constructor(private taskService: TaskService,  private titleService:Title, public _dialog: MatDialog, private _snackBar: MatSnackBar) {
    this.titleService.setTitle("Aufgabenbereich");
  }

  ngOnInit() {
    this.getTasksFromService();
  }

  /*
  *
  * SHORTCUTS
  * - creating new task with Shift+Click
  *
  */

  @HostListener('click', ['$event']) onShiftMouseClick(event: MouseEvent) {
    if (event.shiftKey) {
      this.openInsertTaskDialog();
    }
  }

  /*
  *
  * TASK METHODS
  *
  */

  selectTask(task: Task) {
    this.selectedTask = task;
  }

  changeTasksOrder(array: any[], direction: string, index: number){
    let actualElement: number = index;
    let lastElement: number = index - 1;
    let nextElement: number = index + 1;

    switch(direction){
      case "oben":
          if (index !== 0){
            var temp = array[lastElement];
            array[lastElement] = array[actualElement]
            array[actualElement] = temp;
          } else {
            console.warn("First element in array " + array + " cannot be moved further up to index " + (index - 1) + ". Array from 0 to " + (array.length - 1));
          }
          break;
      case "unten":
          if (actualElement < array.length - 1){
            var temp: any = array[nextElement];
            array[nextElement] = array[actualElement]
            array[actualElement] = temp;
          } else {
            console.warn("Last element in array " + array + "cannot be moved further down to index " + (index + 1) + ". Array from 0 to " + (array.length - 1));   
          }
          break;
      default: 
        console.warn("Wrong direction selected");
    }  
  }

  getTasksFromService() {
    this.tasks = [];

    this.taskService.getAllTasks().subscribe(data => {
      this.tasks = data.sort(function (a, b) {
        return Date.parse(a.date.toString()) - Date.parse(b.date.toString());
      });
    });
  }

  saveTask(task: Task) {
    if (!(task === undefined)) {
      if (this.isNumber(task.id)) {
        this.taskService.putTask(task).subscribe(() => {
          this.openSnackBar("Task saved!", null);
          this.getTasksFromService();
        });
      } else {
        console.warn("putTask(): ID: " + task.id + ", expected number")
      }
    } else {
      console.warn("putTask(): ID: " + task.id + ", expected ID")
    }

    this.hideSelectedTask();
  }

  saveAllTasks() {
    this.tasks.forEach(element => {
      this.saveTask(element);
    });
  }

  removeTask(task: Task) {
    if (!(task === undefined)) {
      if (this.isNumber(task.id)) {
        this.taskService.deleteTask(task.id).subscribe(() => {
          this.openSnackBar("Task removed!", null);
          this.getTasksFromService();
          this.hideSelectedTask();
        });
      } else {
        console.warn("removeTask(): ID: " + task.id + ", expected number")
      }
    } else {
      console.warn("removeTask(): ID: " + task.id + ", expected ID")
    }
  }

  /*
  *
  * DIALOGS/POPUPS
  *
  */

  openInsertTaskDialog(): void {
    this.hideSelectedTask();

    const dialogRef = this._dialog.open(InsertTaskDialog, {
      width: '250px',
      data: {
        shortdescr: this.shortdescr,
        longdescr: this.longdescr,
        date: this.date
      }
    });

    dialogRef.afterClosed().subscribe(postResult => {
      if (!(postResult === undefined)) {
        if (postResult.date === undefined) {
          postResult.date = new Date();
        }

        if (this.shortdescr != "" && this.longdescr != "") {
          this.taskService.postTask(postResult).subscribe(() => {
            this.openSnackBar("Task created!", null);
            this.getTasksFromService();
          });
        } else {
          console.warn("dialogRef.afterClosed(): ID: " + postResult + ", expected that all fields aren't empty")
        }
      } else {
        console.warn("dialogRef.afterClosed(): postResult: " + postResult + ", expected postResult")
      }
    });
  }

  /*
  openRemoveTaskDialog(): void {
    const dialogRef = this._dialog.open(RemoveTaskDialog, {
      width: '250px',
      data: {
        id: this.id
      }
    });

    dialogRef.afterClosed().subscribe(deleteID => {
      if (!(deleteID === undefined)) {
        if (this.isNumber(deleteID)) {
          this.taskService.deleteTask(deleteID).subscribe(() => {
            this.openSnackBar("Task removed!", null);
            this.getTasksFromService();
          });
        } else {
          console.warn("deleteTask(): ID: " + deleteID + ", expected number")
        }
      } else {
        console.warn("deleteTask(): ID: " + deleteID + ", expected ID")
      }
    });
  }
  */

  /*
  *
  * HELPER FUNCTIONS
  *
  */

 openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  isNumber(param: any): boolean {
    return !(isNaN(Number(param)))
  }

  addDateValuesToSelectedTask(type: string, event: MatDatepickerInputEvent<Date>) {
    this.selectedTask.date = event.value;
  }

  hideSelectedTask() {
    this.selectedTask = null;
  }

  getUTCStringFromTask(task: Task){
    return new Date(task.date).toUTCString()
  }
}