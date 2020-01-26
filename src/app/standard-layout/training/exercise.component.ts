import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Exercise } from "./model/exercise";
import { Training } from "./model/training";
import { ExerciseService } from "./services/exercise.service";
import { TrainingService } from "./services/training.service";
import { MatDatepickerInputEvent, MatSnackBar } from "@angular/material";
import { WeightPattern } from "./model/weight-pattern";
import { ConditionalPattern } from "./model/conditional-pattern";
import { CountablePattern } from "./model/countable-pattern";
import { ConditionalPattern2d } from "./model/conditional-pattern2d";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { FreePattern } from "./model/free-pattern";

@Component({
  selector: "app-exercise",
  templateUrl: "./exercise.component.html",
  styleUrls: ["./exercise.component.scss"]
})
export class TrainingComponent implements OnInit {
  patterns = [
    "conditionalpattern1d",
    "conditionalpattern2d",
    "countablepattern",
    "weightpattern",
    "freepattern"
  ];

  trainings: Training[];
  trainingsDate: Date = new Date();
  training: Training;
  trainingDescription: string = "";

  exerciseToCreate: Exercise = new Exercise();
  exerciseCreateForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    category: new FormControl("", [Validators.required])
  });

  exerciseToDelete: Exercise = new Exercise();

  exercises: Exercise[];
  exercisesToInsert: Exercise[] = [];

  formGroups: FormGroup[] = [];
  formGroupToInsert: FormGroup;

  constructor(
    private exerciseService: ExerciseService,
    private trainingService: TrainingService,
    private titleService: Title,
    private _snackBar: MatSnackBar,
    private router: Router
  ) {
    this.titleService.setTitle("Training");
  }

  ngOnInit() {
    this.getExercisesFromService();
    this.getTrainingsFromService();
  }

  /*
   *
   * HOSTLISTENER
   *
   */

  @HostListener("window:beforeunload")
  onBeforeUnload() {
    return false;
  }

  /*
   *
   * EXERCISE FUNCTIONS
   *
   */

  getExercisesFromService() {
    this.exerciseService.getAllExercises().subscribe(exercises => {
      this.exercises = exercises;
    });
  }

  addCategory(event: { value: string }) {
    this.exerciseToCreate.category = event.value;
  }

  saveExercise() {
    this.exerciseToCreate.name = this.exerciseCreateForm.getRawValue().name;

    this.exerciseService.postExercise(this.exerciseToCreate).subscribe(() => {
      this.openSnackBar("Exercise created!", null);
      this.getExercisesFromService();
    });
  }

  selectExerciseToDetele(event: { value: Exercise }) {
    this.exerciseToDelete = event.value;
  }

  deleteExercise() {
    this.exerciseService.deleteExercise(this.exerciseToDelete).subscribe(() => {
      this.openSnackBar("Exercise deleted!", null);
      this.getExercisesFromService();
    });
  }

  compareToLastExercise(exercise: Exercise, index: number): boolean {
    // cant compare first element to element before because doesnt exist
    if (index > 0) {
      if (this.exercisesToInsert[index - 1].name == exercise.name) {
        return true;
      }
    }

    return false;
  }

  /*
   *
   * TRAINING FUNCTIONS
   *
   */

  selectTraining(event: { value: Training }) {
    this.trainingDescription = event.value.description;

    event.value.exercices.forEach(element => {
      this.toggleCheckboxEvent(element, { checked: true });
    });
  }

  gotoTraining(training: Training) {
    this.router.navigate(["/training/" + training.id]);
  }

  createTraining() {
    this.training = {
      id: 0,
      exercices: [],
      date: this.trainingsDate,
      description: this.trainingDescription
    };

    this.trainingDescription = "";

    this.formGroups.forEach(formGroup => {
      this.training.exercices.push(formGroup.getRawValue());
    });

    this.training.exercices.forEach(element => {
      element.string = this.createExerciseString(element);
    });

    this.trainingService.postTraining(this.training).subscribe(() => {
      this.openSnackBar("Training created!", null);
      this.trainingService.getAllTrainings().subscribe(e => {
        this.trainings = e;
        this.resetForm();
      });
    });
  }

  createExerciseString(exercise: Exercise): string {
    let stringArray: string[] = Object.getOwnPropertyNames(exercise).filter(
      e => e != "name" && e != "category"
    );
    let tempString = "";

    stringArray.forEach((element, index) => {
      tempString += "Exercise [";

      // only one element
      if (index == 0 && stringArray.length == 1) {
        tempString += element + ": " + exercise[element];
        // not only one element start
      } else if (index == 0) {
        tempString += element + ": " + exercise[element] + ", ";
        // not only one element finish
      } else if (index == stringArray.length - 1) {
        tempString += element + ": " + exercise[element];
        // not only one element middle
      } else {
        tempString += element + ": " + exercise[element] + ", ";
      }

      if (index == stringArray.length - 1) {
        tempString += "]";
      }
    });

    return tempString;
  }

  getTrainingsFromService() {
    this.trainingService.getAllTrainings().subscribe(trainings => {
      if (trainings.length >= 2) {
        this.trainings = trainings.sort(function(a, b) {
          return Date.parse(a.date.toString()) - Date.parse(b.date.toString());
        });
      } else {
        this.trainings = trainings;
      }
    });
  }

  setTrainingsDate(type: string, event: MatDatepickerInputEvent<Date>) {
    this.trainingsDate = event.value;
  }

  showDatestring(date: Date): string {
    let tempDate: Date = new Date(date);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    };
    return tempDate.toLocaleDateString("de-DE", options);
  }

  fixClockstring(time: number) {
    return time < 10 ? "0" + time : time;
  }

  /*
   *
   * CHECKBOX METHODS
   *
   */

  toggleCheckboxEvent(exercise: Exercise, event: { checked: boolean }) {
    this.setCheckBoxFromExerciseName(exercise.name, true);

    if (event.checked === true) {
      this.exercisesToInsert.push(exercise);
      this.createFormGroup(exercise);
    } else {
      while (this.exercisesToInsert.find(e => e.name == exercise.name)) {
        this.removeElementFromArray(exercise, this.exercisesToInsert);
      }

      while (this.formGroups.find(e => e.getRawValue().name == exercise.name)) {
        this.removeElementFromArray(
          this.formGroups.filter(e => e.getRawValue().name == exercise.name)[0],
          this.formGroups
        );
      }
    }
  }

  setCheckBoxFromExerciseName(exerciseName: string, checked: boolean) {
    this.exercises
      .filter(exercise => exerciseName == exercise.name)
      .forEach(exercise => {
        exercise.checked = checked;
      });
  }

  /*
   *
   * FORM METHODS
   *
   */

  getFormGroup(index: number): FormGroup {
    return this.formGroups[index];
  }

  createFormGroup(exercise: Exercise) {
    this.formGroupToInsert = new FormGroup({});

    let patternArray: string[] = this.getPatternKeys(exercise);

    patternArray.forEach(key => {
      if (key == "name") {
        this.formGroupToInsert.addControl(key, new FormControl(exercise.name));
      } else if (key.includes("unit")) {
        this.formGroupToInsert.addControl(
          key,
          new FormControl(exercise.pattern[key])
        );
      } else {
        this.formGroupToInsert.addControl(
          key,
          new FormControl(exercise[key.toString()], Validators.required)
        );
      }
    });

    this.formGroupToInsert.addControl(
      "category",
      new FormControl(exercise.category)
    );

    this.formGroups.push(this.formGroupToInsert);
  }

  removeElementFromForm(exercise: Exercise, elementPosition: number) {
    if (
      this.exercisesToInsert.filter(e => e.name == exercise.name).length == 1
    ) {
      this.setCheckBoxFromExerciseName(exercise.name, false);
    }

    while (true) {
      if (
        elementPosition < this.exercisesToInsert.length - 1 &&
        this.exercisesToInsert[elementPosition + 1].name == exercise.name
      ) {
        elementPosition++;
      } else {
        break;
      }
    }

    this.removePositionFromArray(elementPosition, this.exercisesToInsert);
    this.removePositionFromArray(elementPosition, this.formGroups);
  }

  formIsValid(): boolean {
    if (!(this.formGroups.length > 0) || this.formGroups.find(e => e.invalid)) {
      return false;
    }

    // TODO validating form

    return true;
  }

  resetForm() {
    this.exercisesToInsert = [];
    this.formGroupToInsert = null;
    this.formGroups = [];

    this.exercises.forEach(exercise => {
      exercise.checked = false;
    });
  }

  /*
   *
   * PATTERN METHODS
   *
   */

  getPatternKeys(exercise: Exercise) {
    if (exercise.category == "conditionalpattern1d") {
      let pattern: ConditionalPattern = {
        name: "conditionalpattern1d",
        records: 0,
        repetitions: 0,
        unit: "s"
      };
      exercise.pattern = pattern;
      return Object.getOwnPropertyNames(pattern);
    }

    if (exercise.category == "conditionalpattern2d") {
      let pattern: ConditionalPattern2d = {
        name: "conditionalpattern2d",
        period: 0,
        speed: 0,
        unitperiod: "min",
        unitspeed: "km/h"
      };
      exercise.pattern = pattern;
      return Object.getOwnPropertyNames(pattern);
    }

    if (exercise.category == "countablepattern") {
      let pattern: CountablePattern = {
        name: "countablepattern",
        records: 0,
        repetitions: 0
      };
      exercise.pattern = pattern;
      return Object.getOwnPropertyNames(pattern);
    }

    if (exercise.category == "weightpattern") {
      let pattern: WeightPattern = {
        name: "weightpattern",
        records: 0,
        repetitions: 0,
        weight: 0,
        unit: "kg"
      };
      exercise.pattern = pattern;
      return Object.getOwnPropertyNames(pattern);
    }

    if (exercise.category == "freepattern") {
      let pattern: FreePattern = {
        name: "freepattern",
        text: ""
      };
      exercise.pattern = pattern;
      return Object.getOwnPropertyNames(pattern);
    }
  }

  isConditionalPattern1d(exercise: Exercise): boolean {
    if (exercise.pattern.name == "conditionalpattern1d") {
      return true;
    }

    return false;
  }

  isConditionalPattern2d(exercise: Exercise): boolean {
    if (exercise.pattern.name == "conditionalpattern2d") {
      return true;
    }

    return false;
  }

  isCountablePattern(exercise: Exercise): boolean {
    if (exercise.pattern.name == "countablepattern") {
      return true;
    }

    return false;
  }

  isWeightPattern(exercise: Exercise): boolean {
    if (exercise.pattern.name == "weightpattern") {
      return true;
    }

    return false;
  }

  isFreePattern(exercise: Exercise): boolean {
    if (exercise.pattern.name == "freepattern") {
      return true;
    }

    return false;
  }

  /*
   *
   * HELPER METHODS
   *
   */

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 4000
    });
  }

  removePositionFromArray(elementPosition: number, array: any[]) {
    array.splice(elementPosition, 1);
  }

  removeElementFromArray(element: any, array: any[]) {
    array.splice(array.indexOf(element), 1);
  }

  isNumber(param: any): boolean {
    return !isNaN(Number(param));
  }

  selectDistinctExerciseCategories(): Array<string> {
    return this.exercises.map(e => e.category).filter(this.onlyUniques);
  }

  onlyUniques(value, index, self) {
    return self.indexOf(value) === index;
  }

  switchPosition(direction: string, index: number) {
    this.changeExerciseOrder(this.formGroups, direction, index);
    this.changeExerciseOrder(this.exercisesToInsert, direction, index);
  }

  changeExerciseOrder(array: any[], direction: string, index: number) {
    let actualElement: number = index;
    let lastElement: number = index - 1;
    let nextElement: number = index + 1;

    switch (direction) {
      case "up":
        if (index !== 0) {
          var temp = array[lastElement];
          array[lastElement] = array[actualElement];
          array[actualElement] = temp;
        } else {
          console.warn(
            "First element in array " +
              array +
              " cannot be moved further up to index " +
              (index - 1) +
              ". Array from 0 to " +
              (array.length - 1)
          );
        }
        break;
      case "down":
        if (actualElement < array.length - 1) {
          var temp: any = array[nextElement];
          array[nextElement] = array[actualElement];
          array[actualElement] = temp;
        } else {
          console.warn(
            "Last element in array " +
              array +
              "cannot be moved further down to index " +
              (index + 1) +
              ". Array from 0 to " +
              (array.length - 1)
          );
        }
        break;
      default:
        console.warn("Wrong direction selected");
    }
  }

  /*
   *
   * SMOOTH SCROLLING
   *
   */

  @ViewChild("overviewtraining", { read: undefined, static: false })
  overviewtraining: ElementRef;
  @ViewChild("createtraining", { read: undefined, static: false })
  createtraining: ElementRef;

  scroll(element: string) {
    switch (element) {
      case "overviewtraining":
        this.overviewtraining.nativeElement.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
        break;
      case "createtraining":
        this.createtraining.nativeElement.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
        break;
    }
  }
}
