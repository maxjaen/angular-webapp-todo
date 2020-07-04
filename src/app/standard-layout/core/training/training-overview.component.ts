import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Exercise } from "../exercise/model/exercise";
import { Training } from "./model/training";
import { ExerciseService } from "../exercise/services/exercise.service";
import { TrainingService } from "./services/training.service";
import { MatDatepickerInputEvent, MatSnackBar } from "@angular/material";
import { WeightPattern } from "../exercise/model/pattern/weight-pattern";
import { ConditionalPattern } from "../exercise/model/pattern/conditional-pattern";
import { CountablePattern } from "../exercise/model/pattern/countable-pattern";
import { ConditionalPattern2d } from "../exercise/model/pattern/conditional-pattern2d";
import { FreePattern } from "../exercise/model/pattern/free-pattern";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { UtilityService } from "../../shared/services/utility.service";
import { KeyService } from "../../shared/services/key.service";

@Component({
  selector: "app-training-overview",
  templateUrl: "./training-overview.component.html",
  styleUrls: ["./training-overview.component.scss"],
})
export class TrainingOverViewComponent implements OnInit {
  displayedTrainings: number = 10;
  sessionMode = ["Normal Session", "Time Session"];
  selectedMode: string;

  trainings: Training[];
  trainingsDate: Date = new Date();
  training: Training;
  trainingDescription: string = "";

  exercises: Exercise[];
  exercisesToInsert: Exercise[] = [];

  formGroups: FormGroup[] = [];
  formGroupToInsert: FormGroup;

  constructor(
    private keyService: KeyService,
    public exerciseService: ExerciseService,
    private trainingService: TrainingService,
    private utilityService: UtilityService,
    private _tabTitle: Title,
    private _snackBar: MatSnackBar,
    private _router: Router
  ) {
    this._tabTitle.setTitle(this.keyService.getString("t1"));
  }

  ngOnInit() {
    this.getExercisesFromService();
    this.getTrainingsFromService();
  }

  /*
   * ===================================================================================
   * HOSTLISTENER
   * ===================================================================================
   */

  @HostListener("window:beforeunload")
  onBeforeUnload() {
    return false;
  }

  /*
   * ===================================================================================
   * EXERCISE FUNCTIONS
   * ===================================================================================
   */

  // Get all exercises from service
  getExercisesFromService() {
    this.exerciseService.getAllExercises().subscribe((exercises) => {
      this.exercises = exercises;
    });
  }

  // Compares the name of the exerciseof one element to the element one postion in before
  // Returns true, if it's the same exercise name, otherwise false
  compareExercisetoElementBefore(exercise: Exercise, index: number): boolean {
    if (index > 0) {
      if (this.exercisesToInsert[index - 1].name == exercise.name) {
        return true;
      }
    }

    return false;
  }

  /*
   * ===================================================================================
   * TRAINING FUNCTIONS
   * ===================================================================================
   */

  // Choose olf training as template for new training
  selectTraining(event: { value: Training }) {
    this.trainingDescription = event.value.description;

    event.value.exercices.forEach((element) => {
      this.toggleCheckboxEvent(element, { checked: true });
    });
  }

  // Choose olf training as template for new training
  selectMode(event: { value: string }) {
    this.selectedMode = event.value;
  }

  // Routes to url with detail view of of a training
  viewTraining(training: Training) {
    this._router.navigate(["/training/" + training.id]);
  }

  // Creates new training data based on choosen exercises
  // Triggered whne pressing create button
  createTraining() {
    this.training = {
      id: 0,
      exercices: [],
      date: this.trainingsDate,
      description: this.trainingDescription,
    };

    this.trainingDescription = "";

    this.formGroups.forEach((formGroup) => {
      this.training.exercices.push(formGroup.getRawValue());
    });

    this.training.exercices.forEach((element) => {
      element.string = this.createExerciseString(element);
    });

    this.trainingService.postTraining(this.training).subscribe(() => {
      this.openSnackBar(this.keyService.getString("t2"), null);
      this.getTrainingsFromService();
      this.resetForm();
    });
  }

  // Creates a exercise string that can be displayed on the website
  // Returns view string
  createExerciseString(exercise: Exercise): string {
    let stringArray: string[] = Object.getOwnPropertyNames(exercise).filter(
      (e) => e != "name" && e != "category"
    );
    let tempString = "Exercise [";

    stringArray.forEach((element, index) => {
      // only one element
      if (index == 0 && stringArray.length == 1) {
        tempString += element + ": " + exercise[element];
        // more than one element - start
      } else if (index == 0) {
        tempString += element + ": " + exercise[element] + ", ";
        // more than one element - finish
      } else if (index == stringArray.length - 1) {
        tempString += element + ": " + exercise[element];
        // more than one element - middle
      } else {
        tempString += element + ": " + exercise[element] + ", ";
      }

      if (index == stringArray.length - 1) {
        tempString += "]";
      }
    });
    return tempString;
  }

  // Get training data from service
  getTrainingsFromService() {
    this.trainingService.getAllTrainings().subscribe((trainings) => {
      this.trainings = this.trainingService.getSortedTrainings(trainings);
    });
  }

  // Set the training date to the date choosen from the pupup dialog clock
  setTrainingsDate(type: string, event: MatDatepickerInputEvent<Date>) {
    this.trainingsDate = event.value;
  }

  // Creates human readable String from date object
  // Returns date as string
  showDatestring(date: Date): string {
    let tempDate: Date = new Date(date);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return tempDate.toLocaleDateString("de-DE", options);
  }

  isRunningOrBicycle(training: Training): boolean {
    if (training.exercices.length == 1) {
      return true;
    }

    return false;
  }

  isGym(training: Training): boolean {
    if (
      training.exercices.find(
        (e) =>
          e.name == "Bankdrücken" ||
          e.name == "Rudern sitzend am Kabelzug" ||
          e.name == "Latzug Obergriff" ||
          e.name == "Butterfly" ||
          e.name == "Kastensteigen"
      )
    ) {
      return true;
    }

    return false;
  }

  getStatusColorValue(training: Training): string {
    if (this.isRunningOrBicycle(training)) {
      return this.keyService.getColor("red");
    }

    if (this.isGym(training)) {
      return this.keyService.getColor("blue");
    }

    return this.keyService.getColor("darkgray");
  }

  showMoreTrainings() {
    if (this.moreTrainingsThanDisplayed()) {
      this.displayedTrainings += 10;
    } else {
      console.log(this.keyService.getString("a21"));
    }
  }

  showLessTrainings() {
    if (this.displayedTrainings > 10) {
      this.displayedTrainings -= 10;
    } else {
      console.log(this.keyService.getString("a22"));
    }
  }

  moreTrainingsThanDisplayed() {
    if (this.trainings.length - this.displayedTrainings > 0) {
      return true;
    }

    return false;
  }

  /*
   * ===================================================================================
   * CHECKBOX METHODS
   * ===================================================================================
   */

  // Gets called when any checkbox for a exercise is toogled
  // Adds/Removes exercises and form groups to/from lists
  toggleCheckboxEvent(exercise: Exercise, event: { checked: boolean }) {
    this.setCheckBoxFromExerciseName(exercise.name, true);

    let pattern: ConditionalPattern = {
      name: "conditionalpattern1d",
      records: 0,
      repetitions: 0,
      unit: "s",
    };

    if (this.selectedMode == "Time Session") {
      exercise.pattern = pattern;
      exercise.category = "conditionalpattern1d";
    }

    if (event.checked === true) {
      this.exercisesToInsert.push(exercise);
      this.createFormGroup(exercise);
    } else {
      while (this.exercisesToInsert.find((e) => e.name == exercise.name)) {
        this.utilityService.removeElementFromArray(
          this.exercisesToInsert.filter((e) => e.name == exercise.name)[0],
          this.exercisesToInsert
        );
      }

      while (
        this.formGroups.find((e) => e.getRawValue().name == exercise.name)
      ) {
        this.utilityService.removeElementFromArray(
          this.formGroups.filter(
            (e) => e.getRawValue().name == exercise.name
          )[0],
          this.formGroups
        );
      }
    }
  }

  // Set checked poperty for each toogled checkbox
  setCheckBoxFromExerciseName(exerciseName: string, checked: boolean) {
    this.exercises
      .filter((exercise) => exerciseName == exercise.name)
      .forEach((exercise) => {
        exercise.checked = checked;
      });
  }

  /*
   * ===================================================================================
   * FORM METHODS
   * ===================================================================================
   */

  // Get form group from array with specific id
  // Returns form group
  getFormGroup(index: number): FormGroup {
    return this.formGroups[index];
  }

  // Create form group
  createFormGroup(exercise: Exercise) {
    this.formGroupToInsert = new FormGroup({});

    let patternArray: string[] = this.getPatternKeys(exercise);

    patternArray.forEach((key) => {
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

  // Removes element in exercise list and form group list
  removeElementFromForm(exercise: Exercise, elementPosition: number) {
    if (
      // only toogle exercise checkbox, when exercise only once inserted
      this.exercisesToInsert.filter((e) => e.name == exercise.name).length == 1
    ) {
      this.setCheckBoxFromExerciseName(exercise.name, false);
    }

    while (true) {
      if (
        // Remove last element, when more than one element with same name in a row
        elementPosition < this.exercisesToInsert.length - 1 &&
        this.exercisesToInsert[elementPosition + 1].name == exercise.name
      ) {
        elementPosition++;
      } else {
        break;
      }
    }

    this.utilityService.removePositionFromArray(
      elementPosition,
      this.exercisesToInsert
    );
    this.utilityService.removePositionFromArray(
      elementPosition,
      this.formGroups
    );
  }

  // Checks if a form is valid
  // Returns true, if the form is valid, otherwise false
  formIsValid(): boolean {
    if (this.formGroups.length <= 0 || this.formGroups.find((e) => e.invalid)) {
      return false;
    }

    // TODO validating form

    return true;
  }

  // Reset forms and choosen exercises
  // Triggered by reset button
  resetForm() {
    this.exercisesToInsert = [];
    this.formGroupToInsert = null;
    this.formGroups = [];

    this.exercises.forEach((exercise) => {
      exercise.checked = false;
    });
  }

  /*
   * ===================================================================================
   * TRAINING TYPES/PATTERN METHODS
   * ===================================================================================
   */

  // Get pattern keys from exercise pattern
  // Returns string array with keys of a specific pattern
  getPatternKeys(exercise: Exercise) {
    if (exercise.category == "conditionalpattern1d") {
      let pattern: ConditionalPattern = {
        name: "conditionalpattern1d",
        records: 0,
        repetitions: 0,
        unit: "s",
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
        unitspeed: "km/h",
      };
      exercise.pattern = pattern;
      return Object.getOwnPropertyNames(pattern);
    }

    if (exercise.category == "countablepattern") {
      let pattern: CountablePattern = {
        name: "countablepattern",
        records: 0,
        repetitions: 0,
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
        unit: "kg",
      };
      exercise.pattern = pattern;
      return Object.getOwnPropertyNames(pattern);
    }

    if (exercise.category == "freepattern") {
      let pattern: FreePattern = {
        name: "freepattern",
        text: "",
      };
      exercise.pattern = pattern;
      return Object.getOwnPropertyNames(pattern);
    }
  }

  // Checks if exercise has a specific training pattern
  // Return true if is has the pattern, otherwise false
  hasPattern(exercise: Exercise, pattern: string): boolean {
    if (exercise.pattern.name == pattern) {
      return true;
    }

    return false;
  }

  // Opens popup menu for notifications
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 4000,
    });
  }

  // Changes the position of an element in forms group and exercise array at the same time
  switchPosition(direction: string, index: number) {
    this.utilityService.changeElementOrderInArray(
      this.formGroups,
      direction,
      index
    );
    this.utilityService.changeElementOrderInArray(
      this.exercisesToInsert,
      direction,
      index
    );
  }

  /*
   * ===================================================================================
   * SMOOTH SCROLLING
   * ===================================================================================
   */

  @ViewChild("overviewtraining")
  overviewtraining: ElementRef;
  @ViewChild("createtraining")
  createtraining: ElementRef;

  scroll(element: string) {
    switch (element) {
      case "overviewtraining":
        this.overviewtraining.nativeElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        break;
      case "createtraining":
        this.createtraining.nativeElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        break;
    }
  }
}
