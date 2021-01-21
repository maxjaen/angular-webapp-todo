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
import { MatDatepickerInputEvent, MatSnackBar } from '@angular/material';
import { WeightPattern } from '../exercise/model/pattern/weight-pattern';
import { ConditionalPattern } from '../exercise/model/pattern/conditional-pattern';
import { CountablePattern } from '../exercise/model/pattern/countable-pattern';
import { ConditionalPattern2d } from '../exercise/model/pattern/conditional-pattern2d';
import { FreePattern } from '../exercise/model/pattern/free-pattern';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UtilityService } from '../../shared/services/utils/utility.service';
import { KeyService } from '../../shared/services/utils/key.service';
import { map } from 'rxjs/operators';
import { TrainingType, Pattern, TrainingSession, Color } from '../../shared/model/Enums';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

// https://stackoverflow.com/questions/30774874/enum-as-parameter-in-typescript
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

  public exerciseGroup: ExerciseGroup[] = [];

  public training: Training;
  public currentTrainingDescription = '';
  private currentTrainingDate: Date = new Date();

  /** retrieved from database */
  public trainings: Training[];
  public exercises: Exercise[];

  /** initial component values */
  public displayableTrainings = 10;
  public trainingSessions = this.enumToArray(TrainingSession);
  public trainingTypes = this.enumToArray(TrainingType);

  /** select training options */
  private selectedTrainingSession: TrainingSession = TrainingSession.STANDARD;
  private selectedTrainingType: TrainingType = TrainingType.GYM;

  /** navigate to view */
  @ViewChild('overviewTraining')
  public overviewTraining: ElementRef;
  @ViewChild('generateTraining')
  public generateTraining: ElementRef;

  readonly ExerciseGroupAction = ExerciseGroupAction;
  readonly Pattern = Pattern;

  constructor(
    public exerciseService: ExerciseService,
    private keyService: KeyService,
    private trainingService: TrainingService,
    private utilityService: UtilityService,
    private tabTitleService: Title,
    private snackBarService: MatSnackBar,
    private routerService: Router
  ) {
    this.tabTitleService.setTitle(this.keyService.getKeyTranslation('t1'));
  }

  ngOnInit() {
    this.exerciseService
      .getExercises()
      .subscribe((exercises) => {
        this.exercises = exercises;
      });

    this.getTrainings();
  }

  private getTrainings(): void {
    this.trainingService
          .getTrainings()
          .pipe(
            map((trainings) =>
              this.trainingService.sortByDate(trainings)
            )
          )
          .subscribe((trainings) => {
            this.trainings = trainings;
          });
  }

  /**
   * Shows a dialog window to restart webpage
   */
  @HostListener('window:beforeunload')
  onBeforeUnload() {
    return false;
  }

  public selectTraining(training: Training) {
    this.routerService.navigate(['/training/' + training.id]);
  }

  /**
   * Creates human readable String from date object
   * @param date to be formatted
   * @returns date as formatted string
   */
  public toLocaleDateString(date: Date): string {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return new Date(date).toLocaleDateString('en-GB', options);
  }

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

  public showMoreTrainings() {
    if (this.moreTrainingsThanDisplayed()) {
      this.displayableTrainings += 10;
    } else {
      console.warn(this.keyService.getKeyTranslation('a21'));
    }
  }

  public showLessTrainings() {
    if (this.displayableTrainings > 10) {
      this.displayableTrainings -= 10;
    } else {
      console.warn(this.keyService.getKeyTranslation('a22'));
    }
  }

  public moreTrainingsThanDisplayed(): boolean {
    return this.trainings.length - this.displayableTrainings > 0;
  }

  public selectTrainingTemplate(event: { value: Training }) {
    this.currentTrainingDescription = event.value.description;
    this.selectedTrainingType = event.value.type;

    event.value.exercises.forEach((element) => {
      this.toggleCheckbox(element, { checked: true });
    });
  }

  public selectTrainingSession(event: { value: string }) {
    this.selectedTrainingSession = this.enumToArray(TrainingSession).indexOf(event.value);
  }

  public selectTrainingType(event: { value: string }) {
    this.selectedTrainingType = this.enumToArray(TrainingType).indexOf(event.value);
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
      type: this.selectedTrainingType
    };

    this.exerciseGroup.forEach((group) => {
      this.training.exercises.push(group.formGroup.getRawValue());
    });

    this.training.exercises.forEach((exercise) => {
      exercise.string = this.buildExerciseInfo(exercise);
    });

    this.trainingService.postTraining(this.training).subscribe(() => {
      this.displayNotification(this.keyService.getKeyTranslation('t2'), null);
      this.getTrainings();
      this.resetForm();
    });
  }

  public toggleCheckbox(exercise: Exercise, event: { checked: boolean }) {
    this.exercises
      .filter(e => e.name === exercise.name)
      .forEach(e => e.checked = event.checked);

    if (this.selectedTrainingSession === TrainingSession.TIME) {
      const pattern: ConditionalPattern = {
        category: 3,
        records: 0,
        repetitions: 0,
        unit: 's',
      };
      exercise.pattern = pattern;
      exercise.category = Pattern.CONDITIONAL1;
    }

    if (event.checked) {
      // newly checked
      const formGroup = this.createFormGroup(exercise);
      this.exerciseGroup.push({ exercise, formGroup });
    } else {
      // remove all exercise occurrences
      while (true) {
        const index = this.exerciseGroup.map(group => group.exercise.name).indexOf(exercise.name);
        if (index !== -1) {
           this.utilityService.removeFromArray(index, this.exerciseGroup);
        } else {
          break;
        }
      }
    }
  }

  private createFormGroup(exercise: Exercise): FormGroup {
    const formGroupToInsert = new FormGroup({});

    const properties: string[] = this.retrievePatternProperties(exercise);
    properties.forEach((property) => {
      if (property === 'unit') {
        formGroupToInsert.addControl(property, new FormControl(exercise.pattern[property]));
      } else {
        formGroupToInsert.addControl(property, new FormControl(exercise[property.toString()], Validators.required));
      }
    });

    formGroupToInsert.addControl('name', new FormControl(exercise.name));
    formGroupToInsert.addControl('category', new FormControl(exercise.category));

    return formGroupToInsert;
  }

  public removeExerciseGroup(exercise: Exercise, index: number) {
    // ocurred exactly once
    if (this.exerciseGroup.filter((group) => group.exercise.name === exercise.name).length === 1) {
      this.exercises
        .filter(e => e.name === exercise.name)
        .forEach(e => e.checked = false);
    }

    // increment if next exercise has same name
    while (index < this.exerciseGroup.length - 1 &&
        this.exerciseGroup[index + 1].exercise.name === exercise.name) {
        index++;
    }

    this.utilityService.removeFromArray(index, this.exerciseGroup);
  }

  /**
   * Execute specific actions based pressed button on the user interface
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
        this.removeExerciseGroup(exerciseGroup.exercise, index);
        break;
      default:
        break;
    }
  }

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

  public exerciseHasPattern(exercise: Exercise, pattern: Pattern): boolean {
    return exercise.pattern.category === pattern;
  }

  public formIsValid(): boolean {
    return (
      this.exerciseGroup.length > 0 &&
      !this.exerciseGroup.find((group) => group.formGroup.invalid)
    );
  }

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
   * Creates a exercise summary which can be displayed on the user interface
   * @param exercise to create summary from
   * @returns exercise formatted as string
   */
  private buildExerciseInfo(exercise: Exercise): string {
    const ignoredProperties: string[] = ['name', 'category'];
    const properties: string[] = Object.getOwnPropertyNames(exercise).filter(
      (e) => ignoredProperties.indexOf(e) === -1
    );

    let str = 'Exercise ';
    properties.forEach((element, index) => {
      const exactlyOneElement = properties.length === 1;
      const isFirstElement = index === 0;
      const isLastElement = index === properties.length - 1;

      if (exactlyOneElement) {
        str += `[${element}: ${exercise[element]}]`;
      } else if (isFirstElement) {
        str += `[${element}: ${exercise[element]}, `;
      } else if (isLastElement) {
        str += `${element}: ${exercise[element]}]`;
      } else {
        str += `${element}: ${exercise[element]}, `;
      }
    });

    return str;
  }

  /**
   * Will be used to group same exercise together when next to each other in frontend.
   * The button row will be shown once for each group of exercises.
   */
  public isSameAsPreviousExercise(
    exercise: Exercise,
    index: number
  ): boolean {
    return (
      index > 0 && this.exerciseGroup[index - 1].exercise.name === exercise.name
    );
  }

   private enumToArray(e: Enum): string[] {
    return Object.keys(e)
      .filter(value => !isNaN(Number(value)))
        .map(key => e[key]);
  }

  /**
   * Drag and drop exercises to different positions during creation
   */
  public drop(event: CdkDragDrop<string[]>) {
    const group = this.utilityService.removeFromArray(
      event.previousIndex,
      this.exerciseGroup
    )[0];

    this.exerciseGroup = [
      ...this.exerciseGroup.slice(0, event.currentIndex),
      group,
      ...this.exerciseGroup.slice(event.currentIndex),
    ];
  }

  /**
   * Opens popup menu to show new notifications on user interface
   * @param message to be displayed
   * @param action to be taken
   */
  private displayNotification(message: string, action: string) {
    this.snackBarService.open(message, action, {
      duration: 4000,
    });
  }

  /**
   * Scroll on user interface to specific element
   * @param element to be scrolled to
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
}
