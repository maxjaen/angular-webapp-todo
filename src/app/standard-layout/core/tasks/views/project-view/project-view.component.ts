import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../model/task';
import { TimeTask } from '../../../timetask/model/timetask';
import { Settings } from '../../../settings/model/settings';
import { SettingsService } from 'src/app/standard-layout/shared/services/core/settings.service';
import { TaskService } from 'src/app/standard-layout/shared/services/core/task.service';
import { tap, map } from 'rxjs/operators';
import { TimeTaskService } from 'src/app/standard-layout/shared/services/core/timetask.service';
import { UtilityService } from 'src/app/standard-layout/shared/services/utils/utility.service';
import { MatSnackBar } from '@angular/material';
import { KeyService } from 'src/app/standard-layout/shared/services/utils/key.service';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss'],
})
export class ProjectViewComponent implements OnInit {
  @Input()
  tasks: Task[];
  @Input()
  tasksRunning: TimeTask[];
  @Input()
  settings: Settings[];
  @Output()
  public reload = new EventEmitter<void>();

  constructor(
    public timeTaskService: TimeTaskService,
    public settingsService: SettingsService,
    public taskService: TaskService,
    private utilityService: UtilityService,
    private snackBarService: MatSnackBar,
    private keyService: KeyService
  ) {}

  ngOnInit() {
    this.loadFromServices();
  }

  public loadFromServices() {
    this.initTasks();
    this.initTimeTasks();
    this.initSettings();
  }

  private initTasks() {
    this.taskService
      .getTasks()
      .pipe(
        map((tasks) => tasks.filter((task) => !task.hided)),
        tap((tasks) => {
          tasks.forEach((task) => {
            task.tempshortdescr = task.shortdescr;
            task.templongdescr = task.longdescr;
            task.tempDate = task.date;
          });
        })
      )
      .subscribe((tasks) => {
        this.tasks = tasks;
      });
  }

  private initTimeTasks() {
    this.timeTaskService
      .getTimeTasks()
      .pipe(
        map((timeTasks) =>
          timeTasks.filter(
            (timeTask) => timeTask.running === true && !timeTask.enddate
          )
        )
      )
      .subscribe((timeTasks) => {
        this.tasksRunning = timeTasks;
      });
  }

  private initSettings() {
    this.settingsService.getSettings().subscribe((settings) => {
      this.settings = settings;
    });
  }

  // TODO rework method
  private updateTask(
    task: Task,
    notificationMessage: string,
    notificationAction: string
  ) {
    this.taskService.putTask(task).subscribe(() => {
      this.displayNotification(notificationMessage, notificationAction);
      this.reload.emit();
    });
  }

  // TODO rework method
  public removeTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        if (!window.confirm(this.keyService.getKeyTranslation('a11'))) {
          return;
        }
        this.taskService.deleteTask(task.id).subscribe(() => {
          this.displayNotification(
            this.keyService.getKeyTranslation('ta3'),
            null
          );
          this.reload.emit();
        });
      } else {
        console.warn(`removeTask(): ID: ${task.id}, expected number`);
      }
    } else {
      console.warn(`removeTask(): ID: ${task.id}, expected id`);
    }
  }

  // TODO rework method
  public drop(event: CdkDragDrop<string[]>) {
    console.log(event);
    if (event.previousContainer.id === event.container.id) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.tasks
        .filter((task) => task.shortdescr == event.item.data.shortdescr)
        .forEach((filteredTask) => {
          filteredTask.project = event.container.id;
        });
      this.updateTask(event.item.data, 'Updated Task', null);
    }
  }

  public retrieveDistinctProjectNames(tasks: Task[]): string[] {
    return tasks
      .map((e) => e.project)
      .filter(this.utilityService.sortDistinct)
      .sort();
  }

  public retrieveTasksForProject(project: string): Task[] {
    return this.tasks.filter((task) => task.project == project);
  }

  /**
   * Opens popup menu to show new notifications on user interface
   * @param message to be displayed
   * @param action to be taken
   */
  private displayNotification(message: string, action: string): void {
    this.snackBarService.open(message, action, {
      duration: 4000,
    });
  }
}
