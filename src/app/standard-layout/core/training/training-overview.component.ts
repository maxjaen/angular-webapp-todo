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
import { Direction, Pattern } from '../../shared/model/Enums';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

enum ExerciseGroupAction {
  ADDAFTER,
  ADDBOTTOM,
  REMOVE,
}
interface ExerciseGroup {
  exercise: Exercise;
  formGroup: FormGroup;
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

  public displayedTrainings = 10;
  public sessionMode = ['Normal Session', 'Time Session'];
  private selectedMode: string;

  public trainings: Training[];
  private trainingsDate: Date = new Date();
  public training: Training;
  public trainingDescription = '';

  public exercises: Exercise[];
  public exerciseGroup: ExerciseGroup[] = [];

  readonly ExerciseGroupAction = ExerciseGroupAction;
  readonly Direction = Direction;
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
    this.getExercises();
    this.getTrainings();
  }

  /**
   * Shows a dialog window to restart webpage
   */
  @HostListener('window:beforeunload')
  onBeforeUnload() {
    return false;
  }

  private getExercises() {
    this.exerciseService.getExercises().subscribe((exercises) => {
      this.exercises = exercises;
    });
  }

  private getTrainings() {
    this.trainingService
      .getTrainings()
      .pipe(
        map((trainings) =>
          this.trainingService.retrieveTrainingsSortedByDate(trainings)
        )
      )
      .subscribe((trainings) => {
        this.trainings = trainings;
      });
  }

  public createTraining() {
    this.training = {
      id: 0,
      exercises: [],
      date: this.trainingsDate,
      description: this.trainingDescription,
    };

    this.trainingDescription = '';

    this.exerciseGroup.forEach((group) => {
      this.training.exercises.push(group.formGroup.getRawValue());
    });

    this.training.exercises.forEach((element) => {
      element.string = this.createExerciseString(element);
    });

    this.trainingService.postTraining(this.training).subscribe(() => {
      this.displayNotification(this.keyService.getKeyTranslation('t2'), null);
      this.getTrainings();
      this.resetForm();
    });
  }

  /**
   * Compares the name of the exercise of one element to the element one position in before
   * @returns true, if it's the same exercise name, otherwise false
   * @param exercise to be compared
   * @param index to get the element before in array
   */
  public compareExerciseToOtherBefore(
    exercise: Exercise,
    index: number
  ): boolean {
    return (
      index > 0 && this.exerciseGroup[index - 1].exercise.name === exercise.name
    );
  }

  /**
   * Creates a exercise string that can be displayed on the user interface
   * @param exercise to create string from
   * @returns exercise formatted as string
   */
  private createExerciseString(exercise: Exercise): string {
    const stringArray: string[] = Object.getOwnPropertyNames(exercise).filter(
      (e) => e !== 'name' && e !== 'category'
    );
    let tempString = 'Exercise ';

    stringArray.forEach((element, index) => {
      const hasExactlyOneElement = stringArray.length === 1;
      const isFirstElement = index === 0;
      const isLastElement = index === stringArray.length - 1;

      if (isFirstElement && hasExactlyOneElement) {
        // only one element in array
        tempString += `[${element}: ${exercise[element]}]`;
      } else if (isFirstElement) {
        // more than one element - start
        tempString += `[${element}: ${exercise[element]}, `;
      } else if (isLastElement) {
        // more than one element - finish
        tempString += `${element}: ${exercise[element]}]`;
      } else {
        // more than one element - middle
        tempString += `${element}: ${exercise[element]}, `;
      }
    });

    return tempString;
  }

  /**
   * Gets called when any checkbox for a exercise is toggled
   * Adds/Removes exercises and form groups to/from lists
   * @param exercise to be toggled on
   * @param event when toggle checkbox on user interface
   */
  public toggleCheckboxEvent(exercise: Exercise, event: { checked: boolean }) {
    this.setCheckBoxFromExerciseName(exercise.name, true);

    if (this.isTimeSessionMode()) {
      this.initializeTimeSession(exercise);
    }

    if (event.checked) {
      // checkbox will be checked
      const formGroup = this.createFormGroup(exercise);
      this.exerciseGroup.push({ exercise, formGroup });
    } else {
      // checkbox will be unchecked
      while (
        this.exerciseGroup.find(
          (group) => group.exercise.name === exercise.name
        )
      ) {
        this.utilityService.removeElementFromArray(
          this.exerciseGroup.filter(
            (group) => group.exercise.name === exercise.name
          )[0],
          this.exerciseGroup
        );
      }
    }
  }

  /**
   * Create new from group for exercise
   * @param exercise to create from for
   */
  private createFormGroup(exercise: Exercise): FormGroup {
    let formGroupToInsert = new FormGroup({});

    const patternArray: string[] = this.retrievePatternKeys(exercise);

    patternArray.forEach((key) => {
      if (key === 'name') {
        formGroupToInsert.addControl(key, new FormControl(exercise.name));
      } else if (key.includes('unit')) {
        formGroupToInsert.addControl(
          key,
          new FormControl(exercise.pattern[key])
        );
      } else {
        formGroupToInsert.addControl(
          key,
          new FormControl(exercise[key.toString()], Validators.required)
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
   * Each exercise's pattern will now be the conditional pattern for
   * future time session workouts
   */
  private initializeTimeSession(exercise: Exercise) {
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
    return this.selectedMode === 'Time Session';
  }

  /**
   * Execute specific actions based pressed button on the user interface
   */
  public executeExerciseGroupAction(
    action: ExerciseGroupAction,
    exerciseGroup: ExerciseGroup,
    elementPos?: number
  ) {
    const exercise = exerciseGroup.exercise;
    const formGroup = this.createFormGroup(exercise);
    const newExerciseGroup = { exercise, formGroup };

    switch (action) {
      case ExerciseGroupAction.ADDAFTER:
        let temp: ExerciseGroup[] = [
          ...this.exerciseGroup.slice(0, elementPos),
          newExerciseGroup,
          ...this.exerciseGroup.slice(elementPos),
        ];
        this.exerciseGroup = temp;
        break;
      case ExerciseGroupAction.ADDBOTTOM:
        this.exerciseGroup.push(newExerciseGroup);
        break;
      case ExerciseGroupAction.REMOVE:
        this.removeExerciseGroup(exerciseGroup.exercise, elementPos);
        break;
      default:
        break;
    }

    console.log(this.exerciseGroup);
  }

  /**
   * Removes element in exercise list and form group list
   * @param exercise to be removed
   * @param elementPosition to remove from array
   */
  public removeExerciseGroup(exercise: Exercise, elementPosition: number) {
    if (
      // only toggle exercise checkbox when exercise only once inserted
      this.exerciseGroup.filter(
        (group) => group.exercise.name === exercise.name
      ).length === 1
    ) {
      this.setCheckBoxFromExerciseName(exercise.name, false);
    }

    while (true) {
      if (
        // Remove last element, when more than one element with same name in a row
        elementPosition < this.exerciseGroup.length - 1 &&
        this.exerciseGroup[elementPosition + 1].exercise.name === exercise.name
      ) {
        elementPosition++;
      } else {
        break;
      }
    }

    this.utilityService.removeElementOnPositionFromArray(
      elementPosition,
      this.exerciseGroup
    );
  }

  /**
   * Set checked property for each toggled checkbox
   * @param exerciseName to filter for
   * @param checked value to be set and showed on user interface
   */
  private setCheckBoxFromExerciseName(exerciseName: string, checked: boolean) {
    this.exercises
      .filter((exercise) => exerciseName === exercise.name)
      .forEach((exercise) => {
        exercise.checked = checked;
      });
  }

  /**
   * Retrieve pattern keys string array from input exercise
   * @param exercise to get keys from
   */
  private retrievePatternKeys(exercise: Exercise): string[] {
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
      case Pattern.CONDITIONAL1:
        let patternOne: ConditionalPattern = {
          category: Pattern.CONDITIONAL1,
          records: 0,
          repetitions: 0,
          unit: 's',
        };
        exercise.pattern = patternOne;
        return Object.getOwnPropertyNames(patternOne);
      case Pattern.CONDITIONAL2:
        let patternTwo: ConditionalPattern2d = {
          category: Pattern.CONDITIONAL2,
          period: 0,
          speed: 0,
          unitPeriod: 'min',
          unitSpeed: 'km/h',
        };
        exercise.pattern = patternTwo;
        return Object.getOwnPropertyNames(patternTwo);
      default:
        break;
    }
  }

  /**
   * Checks if exercise has a specific training pattern
   * @param exercise to be checked
   * @param pattern to be checked on exercise
   */
  public hasPattern(exercise: Exercise, pattern: Pattern): boolean {
    return exercise.pattern.category === pattern;
  }

  /**
   * Changes the position of an element in forms group and exercise array at the same time
   * @param direction to switch position
   * @param index of the element to be changed
   */
  public switchPosition(direction: Direction, index: number) {
    this.utilityService.changeElementOrderInArray(
      this.exerciseGroup,
      direction,
      index
    );
  }

  public viewDetailedTraining(training: Training) {
    this.routerService.navigate(['/training/' + training.id]);
  }

  public selectTrainingTemplate(event: { value: Training }) {
    this.trainingDescription = event.value.description;
    event.value.exercises.forEach((element) => {
      this.toggleCheckboxEvent(element, { checked: true });
    });
  }

  public selectTrainingMode(event: { value: string }) {
    this.selectedMode = event.value;
  }

  public showMoreTrainings() {
    if (this.moreTrainingsThanDisplayed()) {
      this.displayedTrainings += 10;
    } else {
      console.log(this.keyService.getKeyTranslation('a21'));
    }
  }

  public showLessTrainings() {
    if (this.displayedTrainings > 10) {
      this.displayedTrainings -= 10;
    } else {
      console.log(this.keyService.getKeyTranslation('a22'));
    }
  }

  public moreTrainingsThanDisplayed() {
    return this.trainings.length - this.displayedTrainings > 0;
  }

  public setTrainingsDate(_type: string, event: MatDatepickerInputEvent<Date>) {
    this.trainingsDate = event.value;
  }

  /**
   * Creates human readable String from date object
   * @param date to be formatted
   * @returns date as formatted string
   */
  public showDateString(date: Date): string {
    const tempDate: Date = new Date(date);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return tempDate.toLocaleDateString('de-DE', options);
  }

  /**
   * Set status color for user interface
   * @param training to get status color for
   */
  public getStatusColorValue(training: Training): string {
    if (this.isRunningOrBicycle(training)) {
      return this.keyService.getColor('red');
    }

    if (this.isGym(training)) {
      return this.keyService.getColor('blue');
    }

    return this.keyService.getColor('darkGray');
  }

  private isRunningOrBicycle(training: Training): boolean {
    return training.exercises.length === 1;
  }

  private isGym(training: Training): boolean {
    return (
      training.exercises.filter(
        (exercise) =>
          exercise.name === 'Bench Press' ||
          exercise.name === 'Rowing Sitting At The Cable Pull' ||
          exercise.name === 'Lat Pulldown Crossover' ||
          exercise.name === 'Butterfly' ||
          exercise.name === 'Box Climbing'
      ).length > 0
    );
  }

  public formIsValid(): boolean {
    return (
      this.exerciseGroup.length > 0 &&
      !this.exerciseGroup.find((group) => group.formGroup.invalid)
    );
  }

  public resetForm() {
    this.exerciseGroup = [];

    this.exercises.forEach((exercise) => {
      exercise.checked = false;
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

  public drop(event: CdkDragDrop<string[]>) {
    const group = this.utilityService.removeElementOnPositionFromArray(
      event.previousIndex,
      this.exerciseGroup
    )[0];

    this.exerciseGroup = [
      ...this.exerciseGroup.slice(0, event.currentIndex),
      group,
      ...this.exerciseGroup.slice(event.currentIndex),
    ];
  }
}
