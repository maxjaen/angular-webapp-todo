import { Component, OnInit, HostListener } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { TaskService } from "./services/task.service";
import { InsertTaskDialog } from "./dialogs/insert-task-dialog";
import { Task } from "./model/task";
import { MatDatepickerInputEvent, MatSnackBar } from "@angular/material";
import { Title } from "@angular/platform-browser";
import { StringDistributorService } from "../sharedservices/string-distributor.service";
import { UtilityService } from "../sharedservices/utility.service";

@Component({
  selector: "app-tasks",
  templateUrl: "./tasks.component.html",
  styleUrls: ["./tasks.component.scss"]
})
export class TasksComponent implements OnInit {
  displayedColumns: string[] = ["id", "shortdescr", "longdescr"];
  unpinnedTasks: Task[];
  pinnedTasks: Task[];
  hidedElements: Task[];

  selectedTask: Task;
  lastChangedTask: Task;

  id: number;
  shortdescr: string;
  longdescr: string;
  date: Date;
  dateString: string;

  constructor(
    private taskService: TaskService,
    private titleService: Title,
    private stringDistributorService: StringDistributorService,
    private utilityService: UtilityService,
    public _dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {
    this.titleService.setTitle("Aufgabenbereich");
  }

  // TODO unsubscribe from services
  ngOnInit() {
    this.getTasksFromService();
  }

  /*
   *
   * HOSTLISTENER
   *
   */

  @HostListener("click", ["$event"])
  onShiftMouseClick(event: MouseEvent) {
    if (event.shiftKey) {
      this.openInsertTaskDialog();
    }
  }

  @HostListener("window:beforeunload")
  onBeforeUnload() {
    return false;
  }

  /*
   *
   * TASK METHODS
   *
   */

  selectTask(task: Task) {
    if (this.selectedTask === undefined || this.selectedTask === null) {
      this.selectedTask = task;
    } else {
      this.hideSelectedTask();
    }
  }

  getTasksFromService() {
    this.taskService.getAllTasks().subscribe(data => {
      this.unpinnedTasks = data
        .filter(e => !e.pinned && !e.hided)
        .sort(function(a, b) {
          return Date.parse(a.date.toString()) - Date.parse(b.date.toString());
        });

      this.pinnedTasks = data
        .filter(e => e.pinned && !e.hided)
        .sort(function(a, b) {
          return Date.parse(a.date.toString()) - Date.parse(b.date.toString());
        });

      this.hidedElements = data
        .filter(e => e.hided)
        .sort(function(a, b) {
          return Date.parse(b.date.toString()) - Date.parse(a.date.toString());
        });

      this.titleService.setTitle(
        "Aufgabenbereich" +
          " (" +
          this.pinnedTasks.length.toString() +
          " p | " +
          this.unpinnedTasks.length.toString() +
          "   up)"
      );
    });
  }

  saveTask(task: Task) {
    if (!(task === undefined)) {
      if (this.utilityService.isNumber(task.id)) {
        this.taskService.putTask(task).subscribe(() => {
          this.openSnackBar("Task saved!", null);
          this.getTasksFromService();
        });
      } else {
        console.warn("saveTask(): ID: " + task.id + ", expected number");
      }
    } else {
      console.warn("saveTask(): ID: " + task.id + ", expected ID");
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
      if (this.utilityService.isNumber(task.id)) {
        this.copyTaskPropertiesToLastChangedTask(task);
        task.pinned = !task.pinned;
        this.taskService.putTask(task).subscribe(() => {
          this.openSnackBar("Task (un)pinned!", "Reset");
          this.getTasksFromService();
          this.hideSelectedTask();
        });
      } else {
        console.warn("pinTask(): ID: " + task.id + ", expected number");
      }
    } else {
      console.warn("pinTask(): ID: " + task.id + ", expected ID");
    }
  }

  hideTask(task: Task) {
    if (!(task === undefined)) {
      if (this.utilityService.isNumber(task.id)) {
        this.copyTaskPropertiesToLastChangedTask(task);
        task.hided = !task.hided;
        this.taskService.putTask(task).subscribe(() => {
          this.openSnackBar("Task hided!", "Reset");
          this.getTasksFromService();
          this.hideSelectedTask();
        });
      } else {
        console.warn("hideTask(): ID: " + task.id + ", expected number");
      }
    } else {
      console.warn("hideTask(): ID: " + task.id + ", expected ID");
    }
  }

  resetTask(task: Task) {
    if (!(task === undefined)) {
      if (this.utilityService.isNumber(task.id)) {
        this.taskService.putTask(task).subscribe(() => {
          this.openSnackBar("Task reseted!", null);
          this.getTasksFromService();
          this.hideSelectedTask();
        });
      } else {
        console.warn("resetTask(): ID: " + task.id + ", expected number");
      }
    } else {
      console.warn("resetTask(): ID: " + task.id + ", expected ID");
    }
  }

  removeTask(task: Task) {
    if (!(task === undefined)) {
      if (this.utilityService.isNumber(task.id)) {
        if (!window.confirm("Are sure you want to delete this item ?")) {
          return;
        }
        this.taskService.deleteTask(task.id).subscribe(() => {
          this.openSnackBar("Task removed!", null);
          this.getTasksFromService();
        });
      } else {
        console.warn("removeTask(): ID: " + task.id + ", expected number");
      }
    } else {
      console.warn("removeTask(): ID: " + task.id + ", expected ID");
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
      width: "250px",
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
          console.warn(
            "dialogRef.afterClosed(): ID: " +
              postResult +
              ", expected that all fields aren't empty"
          );
        }
      } else {
        console.warn(
          "dialogRef.afterClosed(): postResult: " +
            postResult +
            ", expected postResult"
        );
      }
    });
  }

  /*
   *
   * HELPER FUNCTIONS
   *
   */

  openSnackBar(message: string, action: string) {
    this._snackBar
      .open(message, action, {
        duration: 4000
      })
      .onAction()
      .subscribe(() => {
        this.resetTask(this.lastChangedTask);
      });
  }

  addDateValuesToSelectedTask(
    type: string,
    event: MatDatepickerInputEvent<Date>
  ) {
    this.selectedTask.date = event.value;
  }

  hideSelectedTask() {
    this.selectedTask = null;
  }

  getUTCStringFromTask(task: Task) {
    return new Date(task.date).toUTCString();
  }

  copyTaskPropertiesToLastChangedTask(fromTask: Task) {
    this.lastChangedTask = {
      id: fromTask.id,
      date: fromTask.date,
      hided: fromTask.hided,
      pinned: fromTask.pinned,
      shortdescr: fromTask.shortdescr,
      longdescr: fromTask.longdescr
    };
  }

  getBackgroundColorValue(task: Task): string {
    let actualDate: Date = new Date();
    let tempTaskDate: Date = new Date(task.date);
    let dayMilliseconds: number = 1000 * 60 * 60 * 24;

    // Selected task
    if (
      this.selectedTask !== undefined &&
      this.selectedTask !== null &&
      this.selectedTask.id == task.id
    ) {
      return this.stringDistributorService.COLORS.BLUE;
    }

    // More than 30 days
    if (actualDate.getTime() < tempTaskDate.getTime() - dayMilliseconds * 30) {
      return this.stringDistributorService.COLORS.CYAN;
    }

    // More than one day
    if (actualDate.getTime() > tempTaskDate.getTime() + dayMilliseconds) {
      return this.stringDistributorService.COLORS.RED;
    }

    // Today
    if (
      tempTaskDate.getDate() == actualDate.getDate() &&
      tempTaskDate.getMonth() == actualDate.getMonth() &&
      tempTaskDate.getFullYear() == actualDate.getFullYear()
    ) {
      return this.stringDistributorService.COLORS.YELLOW;
    }

    // Standard colour
    return this.stringDistributorService.COLORS.DARKGREEN;
  }

  replaceWithShortcut(task: Task) {
    this.stringDistributorService.SHORTCUTS.forEach(replacePair => {
      task.longdescr = task.longdescr.replace(replacePair[0], replacePair[1]);
    });
  }
}
