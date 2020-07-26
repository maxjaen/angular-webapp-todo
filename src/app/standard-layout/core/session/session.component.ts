import { Component, OnInit } from "@angular/core";
import { Exercise } from "../exercise/model/exercise";
import { Training } from "../training/model/training";
import { TrainingService } from "../../shared/services/core/training.service";
import { SoundService } from "../../shared/services/utils/sound.service";
import { UtilityService } from "../../shared/services/utils/utility.service";
import { MatSnackBar } from "@angular/material";
import { Title } from "@angular/platform-browser";
import { KeyService } from "../../shared/services/utils/key.service";
import { SessionState } from "../../shared/model/Enums";

@Component({
  selector: "app-session",
  templateUrl: "./session.component.html",
  styleUrls: ["./session.component.scss"],
})
export class SessionComponent implements OnInit {
  timedTrainings: Training[];
  selectedTimedTraining: Training;
  exerciseIntervalId: number;

  currentExercise: Exercise;
  currentExerciseIndex: number;
  currentExerciseCountdown: number;
  generalExerciseCountdown: number;

  workoutCountdown: number;
  getReadyCountdown: number;

  state: SessionState = SessionState.Initial;

  constructor(
    private utilityService: UtilityService,
    private trainingService: TrainingService,
    private soundService: SoundService,
    private keyService: KeyService,
    private snackBarService: MatSnackBar,
    private tabTitleService: Title
  ) {}

  ngOnInit(): void {
    this.getTrainingsFromService();

    this.tabTitleService.setTitle(this.keyService.getString("wo1"));
  }

  // ===================================================================================
  // CRUD SESSION OPERATIONS
  // ===================================================================================

  /*
   * Get training data from service
   */
  public getTrainingsFromService(): void {
    this.trainingService.getAllTrainings().subscribe((trainings) => {
      if (trainings.length >= 2) {
        trainings.sort((a, b) =>
          this.utilityService.sortNumerical(
            Date.parse(a.date.toString()),
            Date.parse(b.date.toString())
          )
        );
      }

      // Show the last x trainings
      this.timedTrainings = trainings.filter((training) =>
        training.exercices.every(
          (exercise) => exercise.category == "conditionalpattern1d"
        )
      );
    });
  }

  // ===================================================================================
  // TRAINING FUNCTIONS
  // ===================================================================================

  /*
   * Checks i a input exercise is one of the following three elments in the seelcted exercise list
   */
  public inListOfNextSteps(exercise: Exercise): boolean {
    return (
      this.selectedTimedTraining.exercices.indexOf(exercise) ==
        this.currentExerciseIndex + 1 ||
      this.selectedTimedTraining.exercices.indexOf(exercise) ==
        this.currentExerciseIndex + 2 ||
      this.selectedTimedTraining.exercices.indexOf(exercise) ==
        this.currentExerciseIndex + 3
    );
  }

  /*
   * Choose previous (old) training as template for new training
   */
  public selectTraining(event: { value: Training }): void {
    this.selectedTimedTraining = event.value;
    this.currentExercise = null;
  }

  /*
   * Pause your Workout Session
   */
  public stopWorkout() {
    switch (this.state) {
      case SessionState.Initial:
        this.openSnackBar(this.keyService.getString("se21"), null);
        return;
      case SessionState.Started:
        this.openSnackBar(this.keyService.getString("se33"), null);
        this.state = SessionState.Stopped;
        break;
      case SessionState.Stopped:
        this.openSnackBar(this.keyService.getString("se23"), null);
        return;
      default:
        throw new Error(`State ${this.state} not implemented yet.`);
    }

    window.clearInterval(this.exerciseIntervalId);
  }

  /*
   * Reset your progress to initial state
   */
  public resetWorkout(): void {
    switch (this.state) {
      case SessionState.Initial:
        this.openSnackBar(this.keyService.getString("se21"), null);
        return;
      case SessionState.Started:
      case SessionState.Stopped:
        this.openSnackBar(this.keyService.getString("se34"), null);
        this.state = SessionState.Initial;
        break;
      default:
        throw new Error(`State ${this.state} not implemented yet.`);
    }

    window.clearInterval(this.exerciseIntervalId);
    this.selectedTimedTraining = null;
    this.currentExercise = null;
  }

  /*
   * Start a new Workout Session and init general exercise countdown
   */
  public doWorkout(elementIndex: number): void {
    if (!this.selectedTimedTraining) {
      this.openSnackBar(this.keyService.getString("t6"), null);
      return;
    }

    switch (this.state) {
      case SessionState.Initial:
        this.openSnackBar(this.keyService.getString("se31"), null);
        this.state = SessionState.Started;
        break;
      case SessionState.Started:
        this.openSnackBar(this.keyService.getString("se21"), null);
        return;
      case SessionState.Stopped:
        this.openSnackBar(this.keyService.getString("se24"), null);
        return;
      default:
        throw new Error(`State ${this.state} not implemented yet.`);
    }

    // set general exercise countdown
    this.generalExerciseCountdown = this.selectedTimedTraining.exercices
      .slice(elementIndex, this.selectedTimedTraining.exercices.length)
      .map((exercise) => +exercise["repetitions"])
      .reduce((sum, current) => sum + current, 0);

    this.startWorkout(elementIndex);
  }

  /*
   * Continue at the time you stopped in an Workout Session
   */
  public continueWorkout(): void {
    switch (this.state) {
      case SessionState.Initial:
        this.openSnackBar(this.keyService.getString("se21"), null);
        return;
      case SessionState.Started:
        this.openSnackBar(this.keyService.getString("se22"), null);
        return;
      case SessionState.Stopped:
        this.openSnackBar(this.keyService.getString("se32"), null);
        this.state = SessionState.Started;
        break;
      default:
        throw new Error(`State ${this.state} not implemented yet.`);
    }

    const elementIndex = this.selectedTimedTraining.exercices.indexOf(
      this.currentExercise
    );

    // Update current exercise timespan with current exercise countdown
    // Continue exactly where you stopped in an exercise
    this.selectedTimedTraining.exercices[elementIndex][
      "repetitions"
    ] = this.currentExerciseCountdown;

    this.startWorkout(elementIndex);
  }

  /*
   * Starts your Workout Session on position of your input parameter
   */
  public startWorkout(i: number): void {
    // Set current ready countdown in seconds
    this.getReadyCountdown = 5;

    (async () => {
      this.soundService.playSound("snapchat");
      await this.delay(2000);

      let endSound = true;

      this.currentExerciseIndex = i;
      this.currentExercise = this.selectedTimedTraining.exercices[i];
      this.workoutCountdown = this.currentExercise["repetitions"];
      this.currentExerciseCountdown = this.currentExercise["repetitions"];

      this.exerciseIntervalId = window.setInterval(() => {
        this.workoutCountdown = this.workoutCountdown - 1;

        if (this.workoutCountdown == 1 && endSound) {
          this.soundService.playSound("iphone");
          endSound = false;
        }
        if (this.workoutCountdown >= 0) {
          this.currentExerciseCountdown = this.currentExerciseCountdown - 1;
          this.generalExerciseCountdown = this.generalExerciseCountdown - 1;
        }
        if (this.workoutCountdown < 0) {
          this.getReadyCountdown--;
        }
        if (this.workoutCountdown === -6) {
          window.clearInterval(this.exerciseIntervalId);
          this.startWorkout(i + 1);
        }
      }, 1000);
    })();
  }

  // ===================================================================================
  // HELPER FUNCTIONS
  // ===================================================================================

  /*
   * Opens popup menu for notifications
   */
  private openSnackBar(message: string, action: string): void {
    this.snackBarService.open(message, action, {
      duration: 4000,
    });
  }

  /*
   * Delay to wait in application execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
