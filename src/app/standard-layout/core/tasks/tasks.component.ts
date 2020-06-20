import { Component, OnInit, HostListener } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { TaskService } from "./services/task.service";
import { InsertTaskDialog } from "./dialogs/insert-task-dialog";
import { Task } from "./model/task";
import { MatDatepickerInputEvent, MatSnackBar } from "@angular/material";
import { Title } from "@angular/platform-browser";
import { KeyService } from "../../shared/services/key.service";
import { UtilityService } from "../../shared/services/utility.service";
import { Settings } from "../settings/model/settings";
import { SettingsService } from "../settings/services/settings.service";

@Component({
  selector: "app-tasks",
  templateUrl: "./tasks.component.html",
  styleUrls: ["./tasks.component.scss"],
})
export class TasksComponent implements OnInit {
  settings: Settings[] = [];

  displayedColumns: string[] = ["id", "shortdescr", "longdescr"];
  unpinnedTasks: Task[];
  pinnedTasks: Task[];
  hidedElements: Task[];

  focusedTask: Task;
  selectedTask: Task;
  lastChangedTask: Task;

  id: number;
  shortdescr: string;
  longdescr: string;
  date: Date;
  dateString: string;

  constructor(
    public settingsService: SettingsService,
    private taskService: TaskService,
    public keysService: KeyService,
    public utilityService: UtilityService,
    private _tabTitle: Title,
    public _dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {
    this._tabTitle.setTitle("Tasklist");
  }

  // TODO unsubscribe from services
  ngOnInit() {
    this.getSettingsFromService();
    this.getTasksFromService();
  }

  /*
   * ===================================================================================
   * HOSTLISTENER
   * ===================================================================================
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

  // Get all settings from service
  getSettingsFromService() {
    this.settingsService.getAllSettings().subscribe((settings) => {
      this.settings = settings;
    });
  }

  /*
   * ===================================================================================
   * TASK METHODS
   * ===================================================================================
   */

  // Selected current Task if not already set,
  // otherwise hide current selected Task
  selectTask(task: Task) {
    if (this.selectedTask === undefined || this.selectedTask === null) {
      this.selectedTask = task;
    } else {
      this.hideSelectedTask();
    }
  }

  // Get all Tasks from service
  // Fill three lists with a subset of these TimeElements
  getTasksFromService() {
    this.taskService.getAllTasks().subscribe((data) => {
      this.unpinnedTasks = data
        .filter((e) => !e.pinned && !e.hided)
        .sort(function (a, b) {
          return Date.parse(a.date.toString()) - Date.parse(b.date.toString());
        });

      this.pinnedTasks = data
        .filter((e) => e.pinned && !e.hided)
        .sort(function (a, b) {
          return Date.parse(a.date.toString()) - Date.parse(b.date.toString());
        });

      this.hidedElements = data
        .filter((e) => e.hided)
        .sort(function (a, b) {
          return Date.parse(b.date.toString()) - Date.parse(a.date.toString());
        });

      // set tab title
      if (this.pinnedTasks.length > 0) {
        this._tabTitle.setTitle(
          "Tasklist" + " (" + this.pinnedTasks.length.toString() + ")"
        );
      } else {
        this._tabTitle.setTitle("Tasklist");
      }
      // --------------
    });
  }

  // Save task in the database
  saveTask(task: Task) {
    if (task !== undefined) {
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

  // Save all Tasks in the database
  saveAllTasks() {
    this.unpinnedTasks.forEach((element) => {
      this.saveTask(element);
    });
    this.pinnedTasks.forEach((element) => {
      this.saveTask(element);
    });
  }

  // Change pin property of a task in the database
  pinTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        this.copyTaskPropertiesToLastChangedTask(task);
        task.pinned = !task.pinned;
        this.changeTask(task, "Task (un)pinned!", "Reset");
      } else {
        console.warn("pinTask(): ID: " + task.id + ", expected number");
      }
    } else {
      console.warn("pinTask(): ID: " + task.id + ", expected ID");
    }
  }

  // Change pin property of a task in the database
  focusTask(task: Task) {
    if (this.focusedTask == null || this.focusedTask == undefined) {
      this.focusedTask = task;
    } else {
      this.focusedTask = null;
    }
  }

  // Change hide property of a task in the database
  hideTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        this.copyTaskPropertiesToLastChangedTask(task);
        task.hided = !task.hided;
        this.changeTask(task, "Task hided!", "Reset");
      } else {
        console.warn("hideTask(): ID: " + task.id + ", expected number");
      }
    } else {
      console.warn("hideTask(): ID: " + task.id + ", expected ID");
    }
  }

  // Reset the task and save the last changed task with all properties back to the database
  // Triggered when undo a task action in a notification
  resetTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        this.changeTask(task, "Task reseted!", null);
      } else {
        console.warn("resetTask(): ID: " + task.id + ", expected number");
      }
    } else {
      console.warn("resetTask(): ID: " + task.id + ", expected ID");
    }
  }

  // Removes task from the database
  removeTask(task: Task) {
    if (task !== undefined) {
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

  // Execute put action on task and following commands
  changeTask(
    task: Task,
    notificationMessage: string,
    notificationAction: string
  ) {
    this.taskService.putTask(task).subscribe(() => {
      this.openSnackBar(notificationMessage, notificationAction);
      this.getTasksFromService(); // TODO
      this.hideSelectedTask();
    });
  }

  /*
   * ===================================================================================
   * DIALOGS/POPUPS
   * ===================================================================================
   */

  // Open popup dialog to create a new Task
  // Hide selected task
  // Add new Task to the database
  openInsertTaskDialog(): void {
    this.hideSelectedTask();

    const dialogRef = this._dialog.open(InsertTaskDialog, {
      width: "250px",
      data: {
        shortdescr: this.shortdescr,
        longdescr: this.longdescr,
        date: this.date,
      },
    });

    dialogRef.afterClosed().subscribe((postResult) => {
      if (postResult !== undefined) {
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
   * ===================================================================================
   * HELPER FUNCTIONS
   * ===================================================================================
   */

  // Opens popup menu for notifications
  openSnackBar(message: string, action: string) {
    this._snackBar
      .open(message, action, {
        duration: 4000,
      })
      .onAction()
      .subscribe(() => {
        this.resetTask(this.lastChangedTask);
      });
  }

  // Change target date of the selected task
  changeDateFromTask(event: MatDatepickerInputEvent<Date>) {
    this.selectedTask.date = event.value;
  }

  // Remove selected Task
  hideSelectedTask() {
    this.selectedTask = null;
  }

  // Get utc date format from Task
  // Return utc date string
  getUTCStringFromTask(task: Task) {
    return new Date(task.date).toUTCString();
  }

  // Copy all properties from the current task to the last changed task
  // Can be used to "undo" an action like delete, put, ..
  copyTaskPropertiesToLastChangedTask(fromTask: Task) {
    this.lastChangedTask = {
      id: fromTask.id,
      date: fromTask.date,
      hided: fromTask.hided,
      pinned: fromTask.pinned,
      shortdescr: fromTask.shortdescr,
      longdescr: fromTask.longdescr,
    };
  }

  // Get backround color for different types of TimeTasks
  // Return backround color
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
      return this.keysService.getColor("blue");
    }

    // More than 30 days
    if (actualDate.getTime() < tempTaskDate.getTime() - dayMilliseconds * 30) {
      return this.keysService.getColor("cyan");
    }

    // More than one day
    if (actualDate.getTime() > tempTaskDate.getTime() + dayMilliseconds) {
      return this.keysService.getColor("red");
    }

    // Today
    if (
      tempTaskDate.getDate() == actualDate.getDate() &&
      tempTaskDate.getMonth() == actualDate.getMonth() &&
      tempTaskDate.getFullYear() == actualDate.getFullYear()
    ) {
      return this.keysService.getColor("yellow");
    }

    // Standard colour
    return this.keysService.getColor("darkgreen");
  }

  // Change all abbreviations to text in the task description (based on ngModelChange)
  replaceWithShortcut(task: Task) {
    this.keysService.SHORTCUTS.forEach((replacePair) => {
      task.longdescr = task.longdescr.replace(replacePair[0], replacePair[1]);
    });
  }
}
