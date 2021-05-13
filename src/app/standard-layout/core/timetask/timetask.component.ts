import {
    Component,
    OnInit,
    HostListener,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { TimeTaskService } from '../../shared/services/core/timetask.service';
import { MatDialog } from '@angular/material';
import { TimeTask } from './model/timetask';
import { InsertTaskDialogTimeComponent } from './dialogs/insert-task-dialog';
import { countUpTimerConfigModel, timerTexts } from 'ngx-timer';
import { CountupTimerService } from 'ngx-timer';
import { Title } from '@angular/platform-browser';
import { AmazingTimePickerService } from 'amazing-time-picker';
import { KeyService } from '../../shared/services/utils/key.service';
import { SettingsService } from '../../shared/services/core/settings.service';
import { Settings } from '../settings/model/settings';
import { NumberValueGraph } from '../../shared/model/GraphData';
import { StringValueGraph } from '../../shared/model/GraphData';
import { GraphDataService } from '../../shared/services/utils/graph.service';
import { tap, map, take } from 'rxjs/operators';
import { Color, Period } from '../../shared/model/Enums';
import {
    calculateCurrentWeekNumber,
    formatToHms,
    getDayOfTheWeek,
    newDate,
} from '../../shared/utils/TimeUtils';
import {
    formatToTwoDigits,
    isNumber,
    splitWith,
    sortDistinct
} from '../../shared/utils/CommonUtils';
import { NotificationService } from '../../shared/services/utils/notification.service';

@Component({
    selector: 'app-timetask',
    templateUrl: './timetask.component.html',
    styleUrls: ['./timetask.component.scss'],
})
export class TimeTaskComponent implements OnInit {

    @ViewChild('creationField') inputElement: ElementRef;
    public showCreationField = false;

    public testConfig: countUpTimerConfigModel;
    public settings: Settings;
    public selectedTimeTask: TimeTask;
    public shortDescription: string;
    public longDescription: string;

    public titles: string[];

    // general
    public timeTasks: TimeTask[] = [];
    // today
    public todaysTimeTasks: TimeTask[] = [];
    public accumulatedTasksFromToday: StringValueGraph[] = [];
    public graphDataFromToday: NumberValueGraph[] = [];
    // history
    public timeTasksFromHistory: TimeTask[] = [];
    public accumulatedTasksFromHistory: StringValueGraph[] = [];
    public graphDataFromHistory: NumberValueGraph[] = [];

    readonly Color = Color;

    constructor(
        public settingsService: SettingsService,
        public timeTaskService: TimeTaskService,
        public timerService: CountupTimerService,
        public dialog: MatDialog,
        public keyService: KeyService,
        private graphDataService: GraphDataService,
        private notificationService: NotificationService,
        private timePickerService: AmazingTimePickerService,
        private title: Title
    ) {
        this.title.setTitle(this.keyService.getKeyTranslation('ti1'));
    }

    /**
     * Restarts website only if the timer is not running, otherwise
     * shows a dialog window
     */
    @HostListener('window:beforeunload')
    onBeforeUnload() {
        return !this.timerService.isTimerStart;
    }

    /**
     * Create new time task with shift and click on user interface.
     *
     * @param event when clicked
     */
    @HostListener('click', ['$event'])
    onMouseClick(event: MouseEvent) {
        if (event.shiftKey) {
            this.openInsertDialog();
        }
    }

    /**
     * Show window for faster creation of new time tasks.
     *
     * @param event when esc pressed
     */
    @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
        this.toggleFastCreation();
    }

    ngOnInit() {
        this.setTimerConfiguration();
        this.getSettings();
        this.getTimeTasks();
    }

    /**
     * Get all time tasks started at the specific date based on the parameter.
     *
     * @param event when selecting time task from history on user interface
     */
    public selectDate(event: { value: string }) {
        const str: string[] = event.value.split(',');
        const dateArray: string[] = str[0].split('.');
        const day: string = dateArray[0];
        const month: string = dateArray[1];
        const year: string = dateArray[2];

        this.getTimeTasksHistory(day, month, year);
    }

    /**
     * Create new TimeTask with fastCreation (press esc).
     *
     * @param event when pressing enter after adding text to fast selection
     */
    public createFastTimeTask(event: any) {
        const date = newDate();
        const title = event.target.value;
        const empty = '';

        if (this.timerService.isTimerStart) {
            this.timeTaskService.runningTimeTask.endDate = newDate();
            this.timeTaskService
                .putTimeTask(this.timeTaskService.runningTimeTask)
                .subscribe(() => {
                    this.getTimeTasks();
                });
        }
        this.resetTimer();

        this.timeTaskService
            .postTimeTask({
                id: 0,
                title,
                shortDescription: title,
                longDescription: empty,
                startDate: date,
                endDate: null,
            })
            .subscribe((timeTask) => {
                this.getTimeTasks();
                this.timeTaskService.runningTimeTask = timeTask;
                this.hideSelectedTimeTask();
                this.startTimer();
            });
    }

    /**
     * Create a new TimeTask from an already finished TimeTask.
     *
     * @param timeTask to continue
     */
    public continueTimeTask(timeTask: TimeTask) {
        if (window.confirm(this.keyService.getKeyTranslation('a12'))) {
           if (this.timerService.isTimerStart) {
            this.timeTaskService.runningTimeTask.endDate = newDate();
            this.timeTaskService
                .putTimeTask(this.timeTaskService.runningTimeTask)
                .subscribe();
           }

            this.resetTimer();

            this.timeTaskService
                .postTimeTask({
                    id: null,
                    title: timeTask.title,
                    shortDescription: timeTask.shortDescription,
                    longDescription: timeTask.longDescription,
                    startDate: newDate(),
                    endDate: null,
                    task: timeTask.task,
                    project: timeTask.project
                })
                .subscribe((e) => {
                    this.getTimeTasks();
                    this.timeTaskService.runningTimeTask = e;
                    this.hideSelectedTimeTask();
                    this.startTimer();
                });
        }
    }

    /**
     * Save TimeTask in the database.
     *
     * @param timeTask to save
     */
    public saveTimeTask(timeTask: TimeTask) {
        if (timeTask === null || timeTask === undefined) {
            throw new Error(
                'saveTimeTask(): timeTask is not valid. Expected not null or not undefined.'
            );
        }
        if (!isNumber(timeTask.id)) {
            throw new Error(
                'saveTimeTask(): timeTask id is not valid. Expected number.'
            );
        }

        this.timeTaskService.putTimeTask(timeTask).subscribe(() => {
            this.notificationService.displayNotification(
                this.keyService.getKeyTranslation('ti2'),
                null
            );
            this.getTimeTasks();
            this.hideSelectedTimeTask();
        });
    }

    /**
     * Remove selected TimeTask from the database.
     *
     * @param timeTask to remove
     */
    public removeTimeElement(timeTask: TimeTask) {
        if (
            timeTask !== null &&
            timeTask !== undefined && // not undefined or null
            isNumber(timeTask.id) &&
            !this.equals(timeTask, this.timeTaskService.runningTimeTask) && // not running
            window.confirm(this.keyService.getKeyTranslation('a11')) // confirmed for deletion
        ) {
            this.timeTaskService.deleteTimeTask(timeTask.id).subscribe(() => {
                this.notificationService.displayNotification(
                    this.keyService.getKeyTranslation('a23'),
                    null
                );
                this.getTimeTasks();
                this.hideSelectedTimeTask();
            });
        }
    }

    /**
     * Delete all elements from chosen Date
     */
    public deleteAllAvailableTimeTasks() {
        if (window.confirm(this.keyService.getKeyTranslation('a11'))) {
            this.timeTasksFromHistory.forEach((e) => {
                this.timeTaskService.deleteTimeTask(e.id).subscribe(() => {
                    this.notificationService.displayNotification(
                        this.keyService.getKeyTranslation('ti3'),
                        null
                    );
                    this.getTimeTasks();
                    this.hideSelectedTimeTask();
                });
            });

            this.timeTasksFromHistory = null;
            this.accumulatedTasksFromHistory = null;
        }
    }

    /**
     * Selected current time task if not already set, otherwise hide current
     * selected time task.
     *
     * @param timeTask to be selected
     */
    public toggleSelection(timeTask: TimeTask) {
        if (
            this.selectedTimeTask === undefined ||
            this.selectedTimeTask === null
        ) {
            this.selectedTimeTask = timeTask;
        } else {
            this.hideSelectedTimeTask();
        }
    }

    public finishTimer() {
        if (this.timerService.isTimerStart) {
            this.resetTimer();
            this.timeTaskService.runningTimeTask.endDate = newDate();
            this.timeTaskService
                .putTimeTask(this.timeTaskService.runningTimeTask)
                .subscribe(() => {
                    this.hideRunningTimeTask();
                    this.hideSelectedTimeTask();
                    this.notificationService.displayNotification(
                        this.keyService.getKeyTranslation('ti4'),
                        null
                    );
                    this.getTimeTasks();
                });
        }
    }

    /**
     * Open popup dialog to create a new TimeTask
     * Finish current TimeTask if still running and add new TimeElement to the
     * database
     */
    public openInsertDialog(): void {
        if (this.timerService.isTimerStart) {
            this.timeTaskService.runningTimeTask.endDate = newDate();
            this.timeTaskService
                .putTimeTask(this.timeTaskService.runningTimeTask)
                .pipe(
                    tap(() => {
                        this.getTimeTasks();
                        this.notificationService.displayNotification(
                            this.keyService.getKeyTranslation('ti2'),
                            null
                        );
                    })
                )
                .subscribe();
        }

        this.resetTimer();
        this.hideSelectedTimeTask();
        this.hideRunningTimeTask();

        const dialog = this.dialog.open(InsertTaskDialogTimeComponent, {
            width: '250px',
            data: {
                shortDescription: this.shortDescription,
                longDescription: this.longDescription,
            },
        });

        dialog.afterClosed().subscribe((resultFromDialog) => {
            if (resultFromDialog !== undefined) {
                resultFromDialog.startDate = newDate();
                this.selectRunningTimeTask(resultFromDialog);

                if (
                    this.shortDescription !== '' &&
                    this.longDescription !== ''
                ) {
                    this.timeTaskService
                        .postTimeTask(resultFromDialog)
                        .pipe(
                            tap(() => {
                                this.getTimeTasks();
                                this.resetTimer();
                                this.startTimer();
                                this.notificationService.displayNotification(
                                    this.keyService.getKeyTranslation('ti5'),
                                    null
                                );
                            })
                        )
                        .subscribe((resultFromPost) => {
                            this.timeTaskService.runningTimeTask.id =
                                resultFromPost.id;
                        });
                }
            }
        });
    }

    /**
     * Change the start hour and start minutes of a TimeTask.
     *
     * @param timeTask The start time will be changed for this time task.
     */
    public changeStartDate(timeTask: TimeTask) {
        const amazingTimePicker = this.timePickerService.open();
        amazingTimePicker.afterClose().subscribe((time) => {
            const temp: Date = newDate();
            const timePickerResult: string[] = time.split(':');

            const date = new Date(
                temp.getFullYear(),
                temp.getMonth(),
                temp.getDate(),
                +timePickerResult[0],
                +timePickerResult[1]
            );

            timeTask.startDate = date;
            if (this.isRunningTimeTask(timeTask)) {
                this.timeTaskService.runningTimeTask.startDate = date;
            }
        });
    }

    /**
     * Change the end hour and end minutes of a TimeTask.
     *
     * @param timeTask The end time will be changed for this time task.
     */
    public changeEndDate(timeTask: TimeTask) {
        const amazingTimePicker = this.timePickerService.open();
        amazingTimePicker.afterClose().subscribe((time) => {
            const temp: Date = newDate();
            const timePickerResult: string[] = time.split(':');

            timeTask.endDate = new Date(
                temp.getFullYear(),
                temp.getMonth(),
                temp.getDate(),
                +timePickerResult[0], // hour
                +timePickerResult[1] // min
            );
        });
    }

    /**
     * Get background color for different types of TimeTasks.
     *
     * @param timeTask to set the background color
     * @returns background color
     */
    public setBorderColor(timeTask: TimeTask): string {
        if (this.equals(timeTask, this.timeTaskService.runningTimeTask)) {
            return this.keyService.getColor(Color.YELLOW);
        } else if (this.equals(timeTask, this.selectedTimeTask)) {
            return this.keyService.getColor(Color.BLUE);
        } else if (!this.timeTaskService.isValid(timeTask)) {
            return this.keyService.getColor(Color.RED);
        }

        return this.keyService.getColor(Color.GREEN);
    }

    /**
     * Change all abbreviations to text in the task description
     * (based on ngModelChange).
     *
     * @param timeTask to be changed
     */
    public replaceWithShortcuts(timeTask: TimeTask) {
        Object.keys(this.keyService.getShortcuts()).forEach((key) => {
            timeTask.longDescription = timeTask.longDescription.replace(
                key,
                this.keyService.getShortcut(key)
            );
        });
    }

    /**
     * Get distinct dates of all TimeTasks.
     *
     * @returns array of distinct dates
     */
    public selectDistinctDates(): Array<string> {
        const tempDates: Date[] = [];
        this.timeTasks.forEach((timeTask) => {
            if (
                !tempDates.find((date) => {
                    const dateToInsert: Date = new Date(timeTask.startDate);
                    const insertedDate: Date = new Date(date);
                    return (
                        insertedDate.getDate() === dateToInsert.getDate() &&
                        insertedDate.getMonth() === dateToInsert.getMonth() &&
                        insertedDate.getFullYear() ===
                            dateToInsert.getFullYear()
                    );
                })
            ) {
                tempDates.push(timeTask.startDate);
            }
        });

        return tempDates
            .sort((e) => new Date(e).getTime())
            .map((e) => {
                const date: Date = new Date(e);
                return (
                    formatToTwoDigits(date.getDate()) +
                    '.' +
                    formatToTwoDigits(date.getMonth() + 1) +
                    '.' +
                    formatToTwoDigits(date.getFullYear()) +
                    ', ' +
                    getDayOfTheWeek(date.getDay())
                );
            });
    }

    public formatDateToStringWithDescription(
        date: Date,
        description: string
    ): string {
        const temp: Date = new Date(date);

        return `${description}: ${formatToTwoDigits(
            temp.getHours()
        )}:${formatToTwoDigits(temp.getMinutes())}`;
    }

    // TODO: What is this?
    public toString(timeTask: TimeTask): string {
        return formatToHms(
            new Date(timeTask.endDate).getTime() -
                new Date(timeTask.startDate).getTime()
        );
    }

    public formatToHms(num: number): string {
        return formatToHms(num);
    }

    public splitWithNewLine(str: string) {
        return splitWith(str, '/n');
    }

    public calculateCurrentWeekNumber(): number {
        return calculateCurrentWeekNumber();
    }

    public formatToTwoDigits(num: number): any {
        return formatToTwoDigits(num);
    }

    public getTimeTasksByTitle(title: string): TimeTask[] {
        return this.timeTasks
            .filter(timetask => timetask.title === title);
    }

    /**
     * Used to create accumulated graph data and description.
     *
     * @param timeTasks from today
     */
    private initAccumulationProcess(timeTasks: TimeTask[], period: Period) {
        const accumulatedInSeconds = this.timeTaskService.extractAccumulatedTimeTasks(
            timeTasks
        );
        const descriptionData = this.createAccumulationDescription(
            accumulatedInSeconds
        );
        const graphData = this.graphDataService.createAccumulationGraph(
            accumulatedInSeconds
        );

        if (period === Period.TODAY) {
            this.accumulatedTasksFromToday = descriptionData;
            this.graphDataFromToday = graphData;
        } else if (period === Period.HISTORY) {
            this.accumulatedTasksFromHistory = descriptionData;
            this.graphDataFromHistory = graphData;
        }
    }

    private setTimerConfiguration() {
        this.testConfig = new countUpTimerConfigModel();
        this.testConfig.timerClass = 'test_Timer_class';
        this.testConfig.timerTexts = new timerTexts();
        this.testConfig.timerTexts.hourText = ' h -';
        this.testConfig.timerTexts.minuteText = ' min -';
        this.testConfig.timerTexts.secondsText = ' s';
    }

    private getSettings() {
        this.settingsService.getSettings().subscribe((settings) => {
                this.settings = settings[0];
        });
    }

    private getTimeTasks() {
        this.timeTaskService
            .getTimeTasks()
            .pipe(
                tap((timeTasks) => {
                    const todaysTimeTasks = this.timeTaskService.retrieveFromToday(timeTasks);
                    this.todaysTimeTasks = todaysTimeTasks;
                    this.initAccumulationProcess(todaysTimeTasks, Period.TODAY);
                })
            )
            .subscribe((timeTasks) => {
                this.timeTasks = timeTasks;
                this.titles = this.getDistinctTitles(timeTasks);
            });
    }

    private getTimeTasksHistory(day: string, month: string, year: string) {
        this.timeTaskService
            .getTimeTasks()
            .pipe(
                map((timeTasks) =>
                    timeTasks.filter((timeTask) =>
                        this.timeTaskService.retrieveFromHistory(
                            timeTask,
                            day,
                            month,
                            year
                        )
                    )
                ),
                tap((timeTasks) => {
                    this.initAccumulationProcess(timeTasks, Period.HISTORY);
                })
            )
            .subscribe((timeTasks) => {
                this.timeTasksFromHistory = timeTasks;
            });
    }

    private getDistinctTitles(timeTasks: TimeTask[]): string[] {
        return timeTasks
            .map(timetask => timetask.title)
            .filter(project => project != null)
            .filter(sortDistinct);
    }

    /**
     * Creates a key value pair with the task and the accumulated time in ms
     * as formatted string.
     *
     * @param pair A key value pair array that includes every tasks and the
     * accumulated time fot it.
     */
    private createAccumulationDescription(pair: NumberValueGraph[]) {
        return pair.map((entry) => ({
            name: entry.name,
            value: formatToHms(entry.value),
        }));
    }

    private equals(a: TimeTask, b: TimeTask): boolean {
        return b !== undefined && b !== null && a.id === b.id;
    }

    private selectRunningTimeTask(timeTask: TimeTask) {
        this.timeTaskService.runningTimeTask = timeTask;
    }

    private hideSelectedTimeTask() {
        this.selectedTimeTask = null;
    }

    private hideRunningTimeTask() {
        this.timeTaskService.runningTimeTask = null;
    }

    private isRunningTimeTask(timeTask: TimeTask) {
        return timeTask.id === this.timeTaskService.runningTimeTask.id;
    }

    private startTimer() {
        this.timerService.startTimer();
        this.title.setTitle(this.keyService.getKeyTranslation('a3'));
    }

    private resetTimer() {
        this.timerService.stopTimer();
        this.timerService.setTimervalue(0);
        this.title.setTitle(this.keyService.getKeyTranslation('ti1'));
    }

    /**
     * Opens window for fastCreation on user interface
     * Focus or unfocus html element when not activating/deactivating
     */
    private toggleFastCreation() {
        this.showCreationField = !this.showCreationField;

        setTimeout(() => {
            // this will make the execution after the above boolean has changed
            this.inputElement.nativeElement.focus();
        }, 0);

        if (!this.showCreationField) {
            this.inputElement.nativeElement.value = '';
            this.unFocusAfterClick();
        }
    }

    private unFocusAfterClick() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }
}
