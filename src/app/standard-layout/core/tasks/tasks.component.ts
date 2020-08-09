import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../shared/services/core/task.service';
import { InsertTaskDialog } from './dialogs/insert-task-dialog';
import { Task } from './model/task';
import { MatDatepickerInputEvent, MatSnackBar } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { KeyService } from '../../shared/services/utils/key.service';
import { UtilityService } from '../../shared/services/utils/utility.service';
import { Settings } from '../settings/model/settings';
import { SettingsService } from '../../shared/services/core/settings.service';
import { TimeService } from '../../shared/services/utils/time.service';
import { TimeTaskService } from '../../shared/services/core/timetask.service';
import {
  CountupTimerService,
  countUpTimerConfigModel,
  timerTexts,
} from 'ngx-timer';
import { TimeTask } from '../timetask/model/timetask';
import { tap, map } from 'rxjs/operators';

export enum View {
  PROJECTS,
  PINS,
}

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {
  tasks: Task[];
  tasksHided: Task[];
  tasksRunning: TimeTask[];
  settings: Settings[];

  @ViewChild('fast') inputElement: ElementRef;
  fastCreation = false;

  View = View;
  viewSelected: View = View.PROJECTS;

  /**
   * Dialog for creating a task will be displayed when clicking excape on keyboard
   * @param event occurs when esc is pressed
   */
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(
    event: KeyboardEvent
  ) {
    this.toogleFastCreation();
  }

  constructor(
    public timeService: TimeService,
    public settingsService: SettingsService,
    public taskService: TaskService,
    public timerService: CountupTimerService,
    public keyService: KeyService,
    public utilityService: UtilityService,
    public dialogService: MatDialog,
    private tabTitleService: Title,
    private timeTaskService: TimeTaskService,
    private snackBarService: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadServices();
  }

  public loadServices() {
    this.initTasks();
    this.initTimeTasks();
    this.initSettings();
  }

  private initTasks() {
    this.taskService
      .getTasks()
      .pipe(
        tap((tasks) => {
          tasks.forEach((task) => {
            task.tempshortdescr = task.shortdescr;
            task.templongdescr = task.longdescr;
            task.tempDate = task.date;
          });
        }),
        tap((tasks) => {
          this.tasksHided = this.taskService.retrieveHidedTasks(tasks);
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

  public toogleFastCreation() {
    this.fastCreation = !this.fastCreation;

    setTimeout(() => {
      this.inputElement.nativeElement.focus();
    }, 0);

    if (!this.fastCreation) {
      this.inputElement.nativeElement.value = '';
      this.unfocusAfterClick();
    }
  }

  private unfocusAfterClick() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  public createNewTask(event: any) {
    const date = this.timeService.createNewDate();
    const shortDescr = event.target.value as string;
    const longDescr = '';

    const splittedDescr = shortDescr.split('  ');

    console.log(splittedDescr);
    const name = splittedDescr[0].trim();
    const project = splittedDescr[1] ? splittedDescr[1].trim() : 'Ohne Projekt';

    const task: Task = {
      id: 0,
      shortdescr: name,
      tempshortdescr: shortDescr,
      longdescr: longDescr,
      templongdescr: longDescr,
      date: date,
      tempDate: date,
      hided: false,
      pinned: false,
      project: project,
    };

    this.taskService.postTask(task).subscribe(() => {
      this.displayNotification(this.keyService.getKeyTranslation('ta2'), null);
      this.loadServices();
    });
  }

  public selectView(view: View) {
    this.viewSelected = view;
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
