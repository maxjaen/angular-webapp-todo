import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from './services/task.service';
import { InsertTaskDialog } from './dialogs/insert-task-dialog';
import { RemoveTaskDialog } from './dialogs/remove-task-dialog';
import { Task } from './model/task';
import { MatDatepickerInputEvent, MatSnackBar } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { totalmem } from 'os';
import { Weight } from '../weight/model/weight';
import { from } from 'rxjs';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {

  displayedColumns: string[] = ['id', 'shortdescr', 'longdescr'];
  unpinnedTasks: Task[];
  pinnedTasks: Task[];

  selectedTask: Task;
  // TODO add reset mechanism
  lastChangedTask: Task;

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

  getTasksFromService() {
    this.unpinnedTasks = [];

    this.taskService.getAllTasks().subscribe(data => {
      this.unpinnedTasks = data.filter(e => e.pinned == false && e.hided == false).sort(function (a, b) {
        return Date.parse(a.date.toString()) - Date.parse(b.date.toString());
      });
    });
    this.taskService.getAllTasks().subscribe(data => {
      this.pinnedTasks = data.filter(e => e.pinned == true && e.hided == false).sort(function (a, b) {
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
    this.unpinnedTasks.forEach(element => {
      this.saveTask(element);
    });
    this.pinnedTasks.forEach(element => {
      this.saveTask(element);
    });
  }

  pinTask(task: Task) {
    if (!(task === undefined)) {
      if (this.isNumber(task.id)) {
        this.copyTaskProperties(task, this.lastChangedTask);        
        task.pinned = !task.pinned;        
        this.taskService.putTask(task).subscribe(() => {
          this.openSnackBar("Task (un)pinned!", "Reset");
          this.getTasksFromService();
          this.hideSelectedTask();
        });
      } else {
        console.warn("pinTask(): ID: " + task.id + ", expected number")
      }
    } else {
      console.warn("pinTask(): ID: " + task.id + ", expected ID")
    }
  }

  hideTask(task: Task) {
    if (!(task === undefined)) {
      if (this.isNumber(task.id)) {
        this.copyTaskProperties(task, this.lastChangedTask);        
        task.hided = true;
        this.taskService.putTask(task).subscribe(() => {
          this.openSnackBar("Task hided!", "Reset");
          this.getTasksFromService();
          this.hideSelectedTask();
        });
      } else {
        console.warn("pinTask(): ID: " + task.id + ", expected number")
      }
    } else {
      console.warn("pinTask(): ID: " + task.id + ", expected ID")
    }
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

  resetTask(task: Task){
    if (!(task === undefined)) {
      if (this.isNumber(task.id)) {        
        this.taskService.putTask(task).subscribe(() => {
          this.openSnackBar("Task reseted!", null);
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

        postResult.hide = false;
        postResult.pinned = false;

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
      duration: 4000,
    }).onAction().subscribe(() => {
      this.resetTask(this.lastChangedTask);
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

  copyTaskProperties(fromTask: Task, toTask: Task){
    this.lastChangedTask = {id: fromTask.id, date: fromTask.date, hided: fromTask.hided, pinned: fromTask.pinned, shortdescr: fromTask.shortdescr, longdescr: fromTask.longdescr };
  }
}