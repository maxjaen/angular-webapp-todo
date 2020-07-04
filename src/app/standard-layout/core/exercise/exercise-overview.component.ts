import { Component, OnInit } from "@angular/core";
import { ExerciseService } from "./services/exercise.service";
import { Exercise } from "./model/exercise";
import { MatSnackBar } from "@angular/material";
import { KeyService } from "../../shared/services/key.service";
import { FormControl, Validators, FormGroup } from "@angular/forms";

@Component({
  selector: "app-exercise-overview",
  templateUrl: "./exercise-overview.component.html",
  styleUrls: ["./exercise-overview.component.scss"],
})
export class ExerciseOverViewComponent implements OnInit {
  exercises: Exercise[];
  exerciseToCreate: Exercise = new Exercise();
  exerciseCreateForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    category: new FormControl("", [Validators.required]),
  });
  exerciseToDelete: Exercise = new Exercise();

  selectedExercise: Exercise;

  patterns = [
    "conditionalpattern1d",
    "conditionalpattern2d",
    "countablepattern",
    "weightpattern",
    "freepattern",
  ];

  constructor(
    private exerciseService: ExerciseService,
    private keyService: KeyService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getExercisesFromService();
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

  selectExercise(exercise: Exercise): void {
    this.selectedExercise = exercise;
  }

  // Set category of new exercise
  setExerciseCategory(event: { value: string }) {
    this.exerciseToCreate.category = event.value;
  }

  // Set name of new exercise
  setExerciseName(name: string) {
    this.exerciseToCreate.name = name;
  }

  // Creates a new exercise based on the name and category of the input fields
  saveExercise() {
    this.setExerciseName(this.exerciseCreateForm.getRawValue().name);

    this.exerciseService.postExercise(this.exerciseToCreate).subscribe(() => {
      this.openSnackBar(this.keyService.getString("t4"), null);
      this.getExercisesFromService();
    });
  }

  // Set the exercise which should be deleted
  selectExerciseToDelete(event: { value: Exercise }) {
    this.exerciseToDelete = event.value;
  }

  // Deletes exercise from server
  // Opens popup window to display notification
  deleteExercise() {
    this.exerciseService.deleteExercise(this.exerciseToDelete).subscribe(() => {
      this.openSnackBar(this.keyService.getString("t5"), null);
      this.getExercisesFromService(); // TODO remove exercise from array
    });
  }

  /*
   * ===================================================================================
   * HELPER FUNCTIONS
   * ===================================================================================
   */

  // Opens popup menu for notifications
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 4000,
    });
  }
}
