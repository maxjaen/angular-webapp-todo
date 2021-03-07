import {
    Component,
    OnInit,
    HostListener,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { TaskService } from '../../shared/services/core/task.service';
import { Task } from './model/task';
import { KeyService } from '../../shared/services/utils/key.service';
import { Settings } from '../settings/model/settings';
import { SettingsService } from '../../shared/services/core/settings.service';
import { TimeTaskService } from '../../shared/services/core/timetask.service';
import { TimeTask } from '../timetask/model/timetask';
import { tap, map } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { View } from '../../shared/model/Enums';
import { first } from '../../shared/utils/ArrayUtils';
import { newDate } from '../../shared/utils/TimeUtils';
import { NotificationService } from '../../shared/services/utils/notification.service';

const DEFAULT_VIEW = View.PROJECTS;
const NO_PROJECT = 'Without project';

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {

    @ViewChild('creationField') inputElement: ElementRef;
    public showCreationField = false;

    public settings: Settings;
    public tasks: Task[];
    public tasksHided: Task[];
    public tasksRunning: TimeTask[];

    readonly VIEW = View;
    public viewSelected: View = DEFAULT_VIEW;

    constructor(
        private settingsService: SettingsService,
        private taskService: TaskService,
        private keyService: KeyService,
        private timeTaskService: TimeTaskService,
        private notificationService: NotificationService,
        private title: Title
    ) {}

    /**
     * A new Dialog for creating a task will be displayed when the user is
     * clicking ESC on keyboard.
     *
     * @param event The event that occurs when ESC is pressed.
     */
    @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
        this.toggleFastCreation();
    }

    ngOnInit() {
        this.loadFromServices();
    }

    /**
     * Initialize properties over rest. Will be used within the html component
     * to call when a child component activates the reload property.
     */
    public loadFromServices() {
        this.initTasks();
        this.initTimeTasks();
        this.initSettings();
    }

    /**
     * A new windows with a text field will be visible and invisible for the user
     * depending on the previous state of the fast creation field.
     */
    public toggleFastCreation() {
        this.showCreationField = !this.showCreationField;

        if (this.showCreationField) {
            this.focusFastCreationElement();
        } else {
            this.inputElement.nativeElement.value = '';
            this.unFocusAfterClick();
        }
    }

    /**
     * Create a new task with the short creation feature.
     *
     * @param event The event occurs when Enter will be pressed in case the
     * short creation field is visible and focused.
     */
    public createTaskFromCreationField(event: any) {
        const shortDecr = event.target.value as string;
        const longDescr = '';

        const descrSeparator = shortDecr.split('>');
        const name = descrSeparator[0].trim();
        const project = descrSeparator[1] ? descrSeparator[1].trim(): NO_PROJECT;

        const task: Task = this.createNewTask(
            name,
            shortDecr,
            longDescr,
            project
        );
        this.taskService.postTask(task).subscribe(() => {
            this.notificationService.displayNotification(
                this.keyService.getKeyTranslation('ta2'),
                null
            );
            this.initTasks();
        });
    }

    /**
     * Gives the user the ability to change the view that the user looks at by
     * clicking on another view button.
     */
    public selectView(view: View) {
        this.viewSelected = view;
    }

    private initTasks() {
        this.taskService
            .getTasks()
            .pipe(
                tap((tasks) => this.setUnHidedTasksTitle(tasks)),
                tap((tasks) => this.extendTemporaryData(tasks)),
                tap((tasks) => {
                    this.tasksHided = this.taskService.retrieveHidedTasks(
                        tasks
                    );
                }),
                map((tasks) => tasks.filter((task) => !task.hided))
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
                        (timeTask) =>
                            timeTask.running === true && !timeTask.endDate
                    )
                )
            )
            .subscribe((timeTasks) => {
                this.tasksRunning = timeTasks;
            });
    }

    private initSettings() {
        this.settingsService.getSettings().subscribe((settings) => {
            this.settings = first(settings);
        });
    }

    /**
     * Make sure that each tasks temporary infos are up to date so that it is
     * possible use actions e.g 'redo'.
     *
     * @param tasks to get temporary information from
     */
    private extendTemporaryData(tasks: Task[]) {
        tasks.forEach((task) => {
            task.tempShortDescription = task.shortDescription;
            task.tempLongDescription = task.longDescription;
            task.tempDate = task.date;
        });
    }

    /**
     * Changes the browser tabs title to the number of unhided tasks.
     *
     * @param tasks The tasks that will be filtered by searching for unhided
     * tasks.
     */
    private setUnHidedTasksTitle(tasks: Task[]) {
        const unHidedTasks = tasks.filter((task) => !task.hided).length;

        this.title.setTitle(
            `${this.keyService.getKeyTranslation('ta1')} (${unHidedTasks})`
        );
    }

    private unFocusAfterClick() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }

    private focusFastCreationElement() {
        setTimeout(() => {
            this.inputElement.nativeElement.focus();
        }, 0);
    }

    private createNewTask(name: string, shortDescr: string,
        longDescr: string, project: string): Task {

        const date = newDate();

        return {
            id: 0,
            shortDescription: name,
            tempShortDescription: shortDescr,
            longDescription: longDescr,
            tempLongDescription: longDescr,
            date,
            tempDate: date,
            hided: false,
            pinned: false,
            project,
        };
    }
}
