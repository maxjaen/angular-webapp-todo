import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
} from "@angular/core";
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
import { TimeService } from "../../shared/services/time.service";
import { Router, NavigationEnd } from "@angular/router";

@Component({
  selector: "app-tasks",
  templateUrl: "./tasks.component.html",
  styleUrls: ["./tasks.component.scss"],
})
export class TasksComponent implements OnInit {
  settings: Settings[];
  displayUnpinned: boolean;
  fastCreation: boolean = false;

  tasks: Task[];
  pinnedTasks: Task[];
  unpinnedTasks: Task[];
  hidedElements: Task[];

  selectedTask: Task;
  focusedTask: Task;
  lastChangedTask: Task;

  id: number;
  shortdescr: string;
  longdescr: string;
  date: Date;
  dateString: string;

  @ViewChild("fast") inputElement: ElementRef;

  @HostListener("click", ["$event"])
  onShiftMouseClick(event: MouseEvent) {
    if (event.shiftKey) {
      this.openInsertTaskDialog();
    }
  }

  @HostListener("window:beforeunload")
  onBeforeUnload() {
    return this.taskService.allSaved(this.tasks) ? true : false;
  }

  @HostListener("document:keydown.escape", ["$event"]) onKeydownHandler(
    event: KeyboardEvent
  ) {
    this.manageFastCreation();
  }

  constructor(
    private timeService: TimeService,
    public settingsService: SettingsService,
    public taskService: TaskService,
    public keyService: KeyService,
    public utilityService: UtilityService,
    private _tabTitle: Title,
    public _dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {}

  // TODO when to unsubscribe from services?
  ngOnInit() {
    this.getTasksFromService();
    this.getSettingsFromService();
  }

  /*
   * ===================================================================================
   * GET DATA
   * ===================================================================================
   */

  // Get all Tasks from service
  // Fill three lists with a subset of these TimeElements
  getTasksFromService() {
    this.taskService.getAllTasks().subscribe((e) => {
      this.tasks = e;

      this.tasks.forEach((f) => {
        f.tempshortdescr = f.shortdescr;
        f.templongdescr = f.longdescr;
        f.tempDate = f.date;
      });

      this.unpinnedTasks = this.taskService.getUnpinnedTasks(this.tasks);
      this.pinnedTasks = this.taskService.getPinnedTasks(this.tasks);
      this.hidedElements = this.taskService.getHidedTasks(this.tasks);

      this.setTabTitle();
    });
  }

  // Get all settings from service
  getSettingsFromService() {
    this.settingsService.getAllSettings().subscribe((settings) => {
      this.settings = settings;

      this.displayUnpinned = this.settingsService.getSettingsValue(
        settings,
        "Show unpinned Tasks"
      );
    });
  }

  /*
   * ===================================================================================
   * CRUD OPERATIONS
   * ===================================================================================
   */

  newTask(event: any) {
    const date = this.timeService.createNewDate();
    const shortDescr = event.target.value;
    const longDescr = "";

    const task: Task = {
      id: 0,
      shortdescr: shortDescr,
      tempshortdescr: shortDescr,
      longdescr: longDescr,
      templongdescr: longDescr,
      date: date,
      tempDate: date,
      hided: false,
      pinned: true,
    };

    if (this.shortdescr != "" && this.longdescr != "") {
      this.taskService.postTask(task).subscribe(() => {
        this.openSnackBar(this.keyService.getString("ta2"), null);
        this.getTasksFromService();
      });
    }
  }

  // Save task in the database
  saveTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        if (this.taskService.isSaved(task)) {
          this.openSnackBar(this.keyService.getString("a4"), null);
          this.hideSelectedTask();
          return;
        }
        this.taskService.putTask(task).subscribe(() => {
          this.openSnackBar(this.keyService.getString("ta7"), null);
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

  // Save all tasks in the database
  saveAllTasks() {
    this.tasks.forEach((element) => {
      this.saveTask(element);
    });
  }

  // Change pinned property of a task in the database
  pinTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        this.copyTaskPropertiesToLastChangedTask(task);
        task.pinned = !task.pinned;
        this.changeTask(task, this.keyService.getString("ta6"), "Reset");
      } else {
        console.warn("pinTask(): ID: " + task.id + ", expected number");
      }
    } else {
      console.warn("pinTask(): ID: " + task.id + ", expected ID");
    }
  }

  // Change hide property of a task in the database
  hideTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        this.copyTaskPropertiesToLastChangedTask(task);
        task.hided = !task.hided;
        task.pinned = false;
        this.changeTask(task, this.keyService.getString("ta5"), "Reset");
      } else {
        console.warn("hideTask(): ID: " + task.id + ", expected number");
      }
    } else {
      console.warn("hideTask(): ID: " + task.id + ", expected ID");
    }
  }

  // Removes task from the database
  removeTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        if (!window.confirm(this.keyService.getString("a1"))) {
          return;
        }
        this.taskService.deleteTask(task.id).subscribe(() => {
          this.openSnackBar(this.keyService.getString("ta3"), null);
          this.getTasksFromService();
        });
      } else {
        console.warn("removeTask(): ID: " + task.id + ", expected number");
      }
    } else {
      console.warn("removeTask(): ID: " + task.id + ", expected ID");
    }
  }

  // Reset the task and save the last changed task with all properties back to the database
  // Triggered when undo a task action in a notification
  resetTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        this.changeTask(task, this.keyService.getString("ta4"), null);
      } else {
        console.warn("resetTask(): ID: " + task.id + ", expected number");
      }
    } else {
      console.warn("resetTask(): ID: " + task.id + ", expected ID");
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
      this.getTasksFromService();
      this.hideSelectedTask();
    });
  }

  /*
   * ===================================================================================
   * OTHER TASK OPERATIONS
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

  // Change pin property of a task in the database
  focusTask(task: Task) {
    if (this.focusedTask == null || this.focusedTask == undefined) {
      this.focusedTask = task;
    } else {
      this.focusedTask = null;
    }
  }

  // Remove selected Task
  hideSelectedTask() {
    this.selectedTask = null;
  }

  // Change target date of the selected task
  changeDateFromTask(event: MatDatepickerInputEvent<Date>) {
    this.selectedTask.date = event.value;
  }

  // Copy all properties from the current task to the last changed task
  // Can be used to "undo" an action like delete, put, ..
  // TODO check if necessary
  copyTaskPropertiesToLastChangedTask(fromTask: Task) {
    this.lastChangedTask = {
      id: fromTask.id,
      date: fromTask.date,
      hided: fromTask.hided,
      pinned: fromTask.pinned,
      shortdescr: fromTask.shortdescr,
      longdescr: fromTask.longdescr,
      templongdescr: fromTask.templongdescr,
      tempshortdescr: fromTask.tempshortdescr,
      tempDate: fromTask.tempDate,
    };
  }

  // Let browser display unpinned tasks or not
  displayUnpinnedTasks() {
    this.displayUnpinned = !this.displayUnpinned;
  }

  // Change all abbreviations to text in the task description (based on ngModelChange)
  replaceWithShortcut(task: Task) {
    Object.keys(this.keyService.getShortcuts()).forEach((key) => {
      task.longdescr = task.longdescr.replace(
        key,
        this.keyService.getShortcut(key)
      );
    });
  }

  // Get backround color for different types of tasks
  // Return backround color
  getStatusColorValue(task: Task): string {
    let actualDate: Date = new Date();
    let tempTaskDate: Date = new Date(task.date);
    let dayMilliseconds: number = 1000 * 60 * 60 * 24;

    // Selected task
    if (
      this.selectedTask !== undefined &&
      this.selectedTask !== null &&
      this.selectedTask.id == task.id
    ) {
      return this.keyService.getColor("blue");
    }

    // More than 30 days
    if (actualDate.getTime() < tempTaskDate.getTime() - dayMilliseconds * 30) {
      return this.keyService.getColor("cyan");
    }

    // More than one day
    if (actualDate.getTime() > tempTaskDate.getTime() + dayMilliseconds) {
      return this.keyService.getColor("red");
    }

    // Today
    if (
      tempTaskDate.getDate() == actualDate.getDate() &&
      tempTaskDate.getMonth() == actualDate.getMonth() &&
      tempTaskDate.getFullYear() == actualDate.getFullYear()
    ) {
      return this.keyService.getColor("yellow");
    }

    // Standard colour
    return this.keyService.getColor("darkgreen");
  }

  manageFastCreation() {
    this.fastCreation = !this.fastCreation;

    setTimeout(() => {
      // this will make the execution after the above boolean has changed
      this.inputElement.nativeElement.focus();
    }, 0);
  }

  /*
   * ===================================================================================
   * DIALOGS/POPUPS/HELPER_FUNCTIONS
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

  // Set title for apllication window in browser
  setTabTitle(): void {
    if (this.pinnedTasks.length > 0) {
      this._tabTitle.setTitle(
        this.keyService.getString("ta1") +
          " (" +
          this.pinnedTasks.length.toString() +
          ")"
      );
    } else {
      this._tabTitle.setTitle(this.keyService.getString("ta1"));
    }
  }

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
          postResult.date = this.timeService.createNewDate();
        }

        postResult.hide = false;
        postResult.pinned = false;

        if (this.shortdescr != "" && this.longdescr != "") {
          this.taskService.postTask(postResult).subscribe(() => {
            this.openSnackBar(this.keyService.getString("ta2"), null);
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
}
