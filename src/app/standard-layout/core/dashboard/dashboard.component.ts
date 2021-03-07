import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../shared/services/core/settings.service';
import { Settings } from '../settings/model/settings';
import { Router } from '@angular/router';
import { TaskService } from '../../shared/services/core/task.service';
import { TimeTaskService } from '../../shared/services/core/timetask.service';
import { TrainingService } from '../../shared/services/core/training.service';
import { WeightService } from '../../shared/services/core/weight.service';
import { Title } from '@angular/platform-browser';
import { KeyService } from '../../shared/services/utils/key.service';
import { Pattern } from '../../shared/model/Enums';
import { Section } from './model/section';
import { first, last, notEmpty } from '../../shared/utils/ArrayUtils';
import { Exercise } from '../exercise/model/exercise';
import { formatToHms, isToday } from '../../shared/utils/TimeUtils';

const SECTION_PLACEHOLDER_VALUE = '_';
const SLASH = '/';

enum SectionType {
    GENERAL = 'general',
    TASK = 'task',
    FITNESS = 'fitness',
}

enum Module {
    TASKS = 'tasks',
    TIMETASKS = 'timetask',
    SESSIONS = 'session',
    WEIGHTS = 'weight',
}

@Component({
    selector: 'app-dashboard.',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

    public sections: Section[];
    public settings: Settings;
    public sectionKeyValuePairs: any[] = [];

    constructor(
        public settingsService: SettingsService,
        private taskService: TaskService,
        private timeTaskService: TimeTaskService,
        private trainingService: TrainingService,
        private weightService: WeightService,
        private title: Title,
        private router: Router,
        private keyService: KeyService
    ) {
        this.title.setTitle(this.keyService.getKeyTranslation('d1'));
    }

    ngOnInit(): void {
        this.sections = this.keyService.getSections();

        this.initSettings();
        this.initTaskPlaceholder();
        this.initTimeTaskPlaceholder();
        this.initSessionPlaceholder();
        this.initWeightPlaceholder();
    }

    /**
     * Navigates to the specified absolute url of the section.
     *
     * @param section The section that should be navigated to via the UI.
     */
    public goToUrl(section: string) {
        this.router.navigate([SLASH + section]);
    }

    /**
     * Creates the title of the section that will be visible in each sections
     * navigation button.
     * The data could be either dynamic content if the users has added any data
     * there or static content if no data is present.
     *
     * @param section Will extract and display data of the specified section.
     * @returns A string presentation of the section that could contain dynamic
     * content.
     */
    public createSectionTitle(section: Section) {
        if (this.isSectionWithAvailableData(section)) {
            return section.displayText.replace(
                SECTION_PLACEHOLDER_VALUE,
                this.getPlaceHolderValue(section)
            );
        } else if (this.isSectionWithoutPlaceholder(section)) {
            return section.displayText;
        } else {
            return this.keyService.getKeyTranslation('d11');
        }
    }

    /**
     * Checks if a section is of type 'task'.
     */
    public hasTaskType(section: Section): boolean {
        return section.type === SectionType.TASK;
    }

    /**
     * Checks if a section is of type 'fitness'.
     */
    public hasFitnessType(section: Section): boolean {
        return section.type === SectionType.FITNESS;
    }

    /**
     * Checks if a section is of type 'general'.
     */
    public hasGeneralType(section: Section): boolean {
        return section.type === SectionType.GENERAL;
    }

    private isSectionWithAvailableData(section: Section) {
        return (
            this.sectionKeyValuePairs &&
            section.displayText.includes(SECTION_PLACEHOLDER_VALUE) &&
            this.hasPlaceHolderValue(section)
        );
    }

    private isSectionWithoutPlaceholder(section: Section): boolean {
        return !section.displayText.includes(SECTION_PLACEHOLDER_VALUE);
    }

    private getPlaceHolderValue(section: Section): string {
        return first(
            this.sectionKeyValuePairs.filter(
                (placeholder) => placeholder.name === section.name
            )
        ).value;
    }

    private hasPlaceHolderValue(section: Section): boolean {
        return (
            first(
                this.sectionKeyValuePairs.filter(
                    (placeholder) => placeholder.name === section.name
                )
            ) !== undefined
        );
    }

    private initSettings() {
        this.settingsService.getSettings().subscribe((settings) => {
            this.settings = first(settings);
        });
    }

    private initTaskPlaceholder() {
        this.taskService.getTasks().subscribe((tasks) => {
            const value = tasks.filter((task) => task.pinned).length.toString();

            this.sectionKeyValuePairs.push({
                name: Module.TASKS,
                value,
            });
        });
    }

    private initTimeTaskPlaceholder() {
        this.timeTaskService.getTimeTasks().subscribe((timeTasks) => {
            const value = timeTasks
                .filter(
                    (timeTaskData) =>
                        isToday(timeTaskData.startDate) &&
                        this.timeTaskService.isValid(timeTaskData)
                )
                .map((validTimeTasks) =>
                    this.timeTaskService.extractTimeBetweenStartAndEnd(
                        validTimeTasks
                    )
                )
                .reduce((a, b) => a + b, 0);

            this.sectionKeyValuePairs.push({
                name: Module.TIMETASKS,
                value: formatToHms(value),
            });
        });
    }

    private initSessionPlaceholder() {
        this.trainingService.getTrainings().subscribe((trainings) => {
            if (notEmpty(trainings)) {
                const timeTrainings = trainings.filter((trainingData) =>
                    trainingData.exercises.every(
                        (exercise) => exercise.category === Pattern.CONDITIONAL1
                    )
                );

                const lastTraining = last(timeTrainings);
                // TODO: Where does the 5 come from?
                const value = (
                    lastTraining.exercises
                        .map((exercise: Exercise) => +exercise.repetitions)
                        .reduce(
                            (sum: number, current: number) => sum + current,
                            0
                        ) +
                    5 * lastTraining.exercises.length
                ).toString();

                this.sectionKeyValuePairs.push({
                    name: Module.SESSIONS,
                    value,
                });
            }
        });
    }

    private initWeightPlaceholder() {
        this.weightService.getAllWeights().subscribe((weights) => {
            if (notEmpty(weights)) {
                const lastWeight = last(weights);

                this.sectionKeyValuePairs.push({
                    name: Module.WEIGHTS,
                    value: lastWeight.value,
                });
            }
        });
    }
}
