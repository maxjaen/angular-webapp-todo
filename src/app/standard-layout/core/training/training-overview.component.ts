import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    HostListener,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Exercise } from '../exercise/model/exercise';
import { Training } from './model/training';
import { ExerciseService } from '../../shared/services/core/exercise.service';
import { TrainingService } from '../../shared/services/core/training.service';
import { MatDatepickerInputEvent } from '@angular/material';
import { WeightPattern } from '../exercise/model/pattern/weight-pattern';
import { ConditionalPattern } from '../exercise/model/pattern/conditional-pattern';
import { CountablePattern } from '../exercise/model/pattern/countable-pattern';
import { ConditionalPattern2d } from '../exercise/model/pattern/conditional-pattern2d';
import { FreePattern } from '../exercise/model/pattern/free-pattern';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { KeyService } from '../../shared/services/utils/key.service';
import { map } from 'rxjs/operators';
import {
    TrainingType,
    Pattern,
    TrainingSession,
    Color,
} from '../../shared/model/Enums';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { removeIndex } from '../../shared/utils/ArrayUtils';
import { formatLocaleDateStr } from '../../shared/utils/TimeUtils';
import { NotificationService } from '../../shared/services/utils/notification.service';

const DEFAULT_DISPLAYED_TRAININGS = 10;
const IGNORED_EXERCISE_PROPERTIES: string[] = ['name', 'category'];

interface Enum {
    [id: number]: string;
}
interface ExerciseGroup {
    exercise: Exercise;
    formGroup: FormGroup;
}

enum ExerciseGroupAction {
    ADD,
    ADDEND,
    REMOVE,
}

@Component({
    selector: 'app-training-overview',
    templateUrl: './training-overview.component.html',
    styleUrls: ['./training-overview.component.scss'],
})
export class TrainingOverViewComponent implements OnInit {

    @ViewChild('overviewTraining')
    public overviewTraining: ElementRef;
    @ViewChild('generateTraining')
    public generateTraining: ElementRef;

    readonly ExerciseGroupAction = ExerciseGroupAction;
    readonly Pattern = Pattern;

    public exerciseGroup: ExerciseGroup[] = [];
    public training: Training;
    public currentTrainingDescription = '';

    /** retrieved from database */
    public trainings: Training[];
    public exercises: Exercise[];

    /** initial component values */
    public displayableTrainings = DEFAULT_DISPLAYED_TRAININGS;
    public trainingSessions = this.enumToArray(TrainingSession);
    public trainingTypes = this.enumToArray(TrainingType);

    /** select training options */
    private selectedTrainingSession: TrainingSession = TrainingSession.STANDARD;
    private selectedTrainingType: TrainingType = TrainingType.GYM;

    private currentTrainingDate: Date = new Date();

    constructor(
        public exerciseService: ExerciseService,
        private keyService: KeyService,
        private trainingService: TrainingService,
        private notificationService: NotificationService,
        private title: Title,
        private router: Router
    ) {
        this.title.setTitle(this.keyService.getKeyTranslation('t1'));
    }

    /**
     * Shows a dialog window to restart webpage
     */
    @HostListener('window:beforeunload')
    onBeforeUnload() {
        return false;
    }

    ngOnInit() {
        this.initExercises();
        this.initTrainings();
    }

    /**
     * Navigates to the detail view of the specified training.
     *
     * @param training The training that should be navigated to via the UI.
     */
    public selectTraining(training: Training) {
        this.router.navigate(['/training/' + training.id]);
    }

    public selectTrainingTemplate(event: { value: Training }) {
        this.currentTrainingDescription = event.value.description;
        this.selectedTrainingType = event.value.type;

        event.value.exercises.forEach((element) => {
            this.toggleCheckbox(element, { checked: true });
        });
    }

    public selectTrainingSession(event: { value: string }) {
        this.selectedTrainingSession = this.enumToArray(
            TrainingSession
        ).indexOf(event.value);
    }

    public selectTrainingType(event: { value: string }) {
        this.selectedTrainingType = this.enumToArray(TrainingType).indexOf(
            event.value
        );
    }

    public selectTrainingDate(event: MatDatepickerInputEvent<Date>) {
        this.currentTrainingDate = event.value;
    }

    public createTraining() {
        this.training = {
            id: 0,
            exercises: [],
            date: this.currentTrainingDate,
            description: this.currentTrainingDescription,
            type: this.selectedTrainingType,
        };

        // FIXME: Values no shown for training
        this.exerciseGroup.forEach((group) => {
            this.training.exercises.push(group.formGroup.getRawValue());
        });

        this.training.exercises.forEach((exercise) => {
            exercise.str = this.buildExerciseRepresentation(exercise);
        });

        this.trainingService.postTraining(this.training).subscribe(() => {
            this.notificationService.displayNotification(
                this.keyService.getKeyTranslation('t2'),
                null
            );
            this.initTrainings();
            this.resetForm();
        });
    }

    /**
     * Will be called when the user toggles any of the exercise checkboxes.
     * In this case the checkbox will be activated or deactivated and depending on
     * that event the exercise will be added or removed to or from the list.
     */
    public toggleCheckbox(exercise: Exercise, event: { checked: boolean }) {
        this.exercises
            .filter((e) => e.name === exercise.name)
            .forEach((e) => (e.checked = event.checked));

        if (this.isTimeSessionMode()) {
            this.initPatternForTimeSession(exercise);
        }

        if (event.checked) {
            // not checked before
            const formGroup = this.createFormGroup(exercise);
            this.exerciseGroup.push({ exercise, formGroup });
        } else {
            // remove all exercise occurrences
            while (true) {
                const index = this.exerciseGroup
                    .map((group) => group.exercise.name)
                    .indexOf(exercise.name);
                if (index !== -1) {
                    removeIndex(index, this.exerciseGroup);
                } else {
                    break;
                }
            }
        }
    }

    /**
     * Checkbox will be uncheck and the exercise will be removed from the
     * list of current exercises in the training.
     */
    public removeExercise(exercise: Exercise, index: number) {
        this.uncheckCheckbox(exercise);

        let exerciseIndex = index;
        while (
            index < this.exerciseGroup.length - 1 &&
            this.exerciseGroup[index + 1].exercise.name === exercise.name
        ) {
            exerciseIndex++;
        }
        removeIndex(exerciseIndex, this.exerciseGroup);
    }

    /**
     * TODO: Check if that can be refactored. Execute specific actions based on
     * the pressed button on the user interface.
     */
    public executeExerciseGroupAction(
        action: ExerciseGroupAction,
        exerciseGroup: ExerciseGroup,
        index?: number
    ) {
        const exercise = exerciseGroup.exercise;
        const formGroup = this.createFormGroup(exercise);
        const newExerciseGroup = { exercise, formGroup };

        switch (action) {
            case ExerciseGroupAction.ADD:
                const temp: ExerciseGroup[] = [
                    ...this.exerciseGroup.slice(0, index),
                    newExerciseGroup,
                    ...this.exerciseGroup.slice(index),
                ];
                this.exerciseGroup = temp;
                break;
            case ExerciseGroupAction.ADDEND:
                this.exerciseGroup.push(newExerciseGroup);
                break;
            case ExerciseGroupAction.REMOVE:
                this.removeExercise(exerciseGroup.exercise, index);
                break;
            default:
                break;
        }
    }

    /**
     * Checks if an exercise has the specified exercise pattern
     *
     * @param exercise The exercise that could possibly have the pattern.
     * @param pattern  The pattern to check for.
     * @returns Return true if the exercise has the pattern, otherwise false.
     */
    public exerciseHasPattern(exercise: Exercise, pattern: Pattern): boolean {
        return exercise.pattern.category === pattern;
    }

    /**
     * Check if the training form is valid and that there are no missing data
     * that the user should still need to enter.
     *
     * @returns Return true if the form is valid, otherwise false.
     */
    public formIsValid(): boolean {
        return (
            this.exerciseGroup.length > 0 &&
            !this.exerciseGroup.find((group) => group.formGroup.invalid)
        );
    }

    /**
     * Reset the training form to its initial empty and unchecked state.
     */
    public resetForm() {
        this.exerciseGroup = [];
        this.currentTrainingDescription = '';
        this.selectedTrainingSession = TrainingSession.STANDARD;
        this.selectedTrainingType = TrainingType.GYM;

        this.exercises.forEach((exercise) => {
            exercise.checked = false;
        });
    }

    /**
     * Will be used to group same exercise together when next to each other in
     * frontend.
     * The button row will be shown once for each group of exercises.
     */
    public isSameAsPreviousExercise(
        exercise: Exercise,
        index: number
    ): boolean {
        return (
            index > 0 &&
            this.exerciseGroup[index - 1].exercise.name === exercise.name
        );
    }

    /**
     * @see formatLocaleDateStr
     */
    public toLocaleDateString(date: Date): string {
        return formatLocaleDateStr(date);
    }

    /**
     * Set the border color on the left side depending on the type of the
     * training.
     */
    public setBorderColor(training: Training): string {
        switch (training.type) {
            case TrainingType.OUTSIDE:
                return this.keyService.getColor(Color.RED);
            case TrainingType.GYM:
                return this.keyService.getColor(Color.BLUE);
            case TrainingType.HOME:
                return this.keyService.getColor(Color.PURPLE);
            default:
                return this.keyService.getColor(Color.WHITE);
        }
    }

    /**
     * Gives the user the possibility to show 10 trainings more on the
     * user interface.
     */
    public showMoreTrainings() {
        if (this.moreTrainingsThanDisplayed()) {
            this.displayableTrainings += 10;
        } else {
            console.warn(this.keyService.getKeyTranslation('a21'));
        }
    }

    /**
     * Gives the user the possibility to show 10 trainings less on the
     * user interface.
     */
    public showLessTrainings() {
        if (this.displayableTrainings > 10) {
            this.displayableTrainings -= 10;
        } else {
            console.warn(this.keyService.getKeyTranslation('a22'));
        }
    }

    /**
     * Checks if there are more trainings available than currently displayed.
     *
     * @returns Returns true in case more trainings are available, otherwise
     * false.
     */
    public moreTrainingsThanDisplayed(): boolean {
        return this.trainings.length - this.displayableTrainings > 0;
    }

    /**
     * FIXME: Change input param to enum type
     * Scroll to the specific element on the user interface.
     *
     * @param element The element to be scrolled to.
     */
    public scroll(element: string) {
        switch (element) {
            case 'overviewTraining':
                this.overviewTraining.nativeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
                break;
            case 'generateTraining':
                this.generateTraining.nativeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
                break;
        }
    }

    /**
     * Drag and drop exercises to different positions during the training
     * creation.
     */
    public drop(event: CdkDragDrop<string[]>) {
        const group = removeIndex(event.previousIndex, this.exerciseGroup)[0];

        this.exerciseGroup = [
            ...this.exerciseGroup.slice(0, event.currentIndex),
            group,
            ...this.exerciseGroup.slice(event.currentIndex),
        ];
    }

    /**
     * TODO: Is it possible to create a toString for the exercise class?
     * Creates a exercise string representation which can be displayed on the
     * user interface.
     *
     * @param exercise The exercise to create the string representation from.
     * @returns A formatted summary for the exercise as string.
     */
    private buildExerciseRepresentation(exercise: Exercise): string {
        const exerciseProperties: string[] = this.getPropertiesOfInterest(
            exercise
        );

        let representation = 'Exercise ';
        exerciseProperties.forEach((property, index) => {
            const exactlyOneElement = exerciseProperties.length === 1;
            const isFirstElement = index === 0;
            const isLastElement = index === exerciseProperties.length - 1;

            if (exactlyOneElement) {
                representation += `[${property}: ${exercise[property]}]`;
            } else if (isFirstElement) {
                representation += `[${property}: ${exercise[property]}, `;
            } else if (isLastElement) {
                representation += `${property}: ${exercise[property]}]`;
            } else {
                representation += `${property}: ${exercise[property]}, `;
            }
        });

        return representation;
    }

    private initExercises() {
        this.exerciseService.getExercises().subscribe((exercises) => {
            this.exercises = exercises;
        });
    }

    private initTrainings() {
        this.trainingService
            .getTrainings()
            .pipe(
                map((trainings) => this.trainingService.sortByDate(trainings))
            )
            .subscribe((trainings) => {
                this.trainings = trainings;
            });
    }

    private initPatternForTimeSession(exercise: Exercise) {
        const pattern: ConditionalPattern = {
            category: 3,
            records: 0,
            repetitions: 0,
            unit: 's',
        };
        exercise.pattern = pattern;
        exercise.category = Pattern.CONDITIONAL1;
    }

    private isTimeSessionMode(): boolean {
        return this.selectedTrainingSession === TrainingSession.TIME;
    }

    private uncheckCheckbox(exercise: Exercise) {
        if (this.exerciseOccursOnceInTraining(exercise)) {
            this.exercises
                .filter((e) => e.name === exercise.name)
                .forEach((e) => (e.checked = false));
        }
    }

    private exerciseOccursOnceInTraining(exercise: Exercise): boolean {
        return (
            this.exerciseGroup.filter(
                (group) => group.exercise.name === exercise.name
            ).length === 1
        );
    }

    /**
     * Filter unwanted properties from the exercise object.
     */
    private getPropertiesOfInterest(exercise: Exercise): string[] {
        return Object.getOwnPropertyNames(exercise).filter(
            (e) => IGNORED_EXERCISE_PROPERTIES.indexOf(e) === -1
        );
    }

    /**
     * TODO: Check if that can be refactored.
     */
    private createFormGroup(exercise: Exercise): FormGroup {
        const formGroupToInsert = new FormGroup({});

        const properties: string[] = this.retrievePatternProperties(exercise);
        properties.forEach((property) => {
            if (property === 'unit') {
                formGroupToInsert.addControl(
                    property,
                    new FormControl(exercise.pattern[property])
                );
            } else {
                formGroupToInsert.addControl(
                    property,
                    new FormControl(
                        exercise[property.toString()],
                        Validators.required
                    )
                );
            }
        });

        formGroupToInsert.addControl('name', new FormControl(exercise.name));
        formGroupToInsert.addControl(
            'category',
            new FormControl(exercise.category)
        );

        return formGroupToInsert;
    }

    /**
     * TODO: Check if that can be refactored.
     */
    private retrievePatternProperties(exercise: Exercise): string[] {
        switch (exercise.category) {
            case Pattern.FREE:
                const patternFive: FreePattern = {
                    category: Pattern.FREE,
                    text: '',
                };
                exercise.pattern = patternFive;
                return Object.getOwnPropertyNames(patternFive);
            case Pattern.WEIGHT:
                const patternFour: WeightPattern = {
                    category: Pattern.WEIGHT,
                    records: 0,
                    repetitions: 0,
                    weight: 0,
                    unit: 'kg',
                };
                exercise.pattern = patternFour;
                return Object.getOwnPropertyNames(patternFour);
            case Pattern.COUNTABLE:
                const patternThree: CountablePattern = {
                    category: Pattern.COUNTABLE,
                    records: 0,
                    repetitions: 0,
                };
                exercise.pattern = patternThree;
                return Object.getOwnPropertyNames(patternThree);
            case Pattern.CONDITIONAL2:
                const patternTwo: ConditionalPattern2d = {
                    category: Pattern.CONDITIONAL2,
                    period: 0,
                    speed: 0,
                    unitPeriod: 'min',
                    unitSpeed: 'km/h',
                };
                exercise.pattern = patternTwo;
                return Object.getOwnPropertyNames(patternTwo);
            case Pattern.CONDITIONAL1:
                const patternOne: ConditionalPattern = {
                    category: Pattern.CONDITIONAL1,
                    records: 0,
                    repetitions: 0,
                    unit: 's',
                };
                exercise.pattern = patternOne;
                return Object.getOwnPropertyNames(patternOne);
            default:
                break;
        }
    }

    /**
     * Will be used to create a new array with all possible enum members
     * from the specified enum.
     */
    private enumToArray(e: Enum): string[] {
        return Object.keys(e)
            .filter((value) => !isNaN(Number(value)))
            .map((key) => e[key]);
    }
}
