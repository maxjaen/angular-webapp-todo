import { Component, OnInit } from "@angular/core";
import { Exercise } from "../training/model/exercise";
import { ExerciseService } from "../training/services/exercise.service";
import { Training } from "../training/model/training";
import { TrainingService } from "../training/services/training.service";

@Component({
  selector: "app-session",
  templateUrl: "./session.component.html",
  styleUrls: ["./session.component.scss"],
})
export class SessionComponent implements OnInit {
  timedTrainings: Training[];
  selectedTimedTraining: Training;
  currentExercise: Exercise;
  currentExerciseIndex: number;
  currentExerciseCountdown: number;
  generalExerciseCountdown: number;
  workoutCountdown: number;
  exerciseIntervalId: number;
  getReadyCountdown: number;

  constructor(private trainingService: TrainingService) {}

  ngOnInit(): void {
    this.getTrainingsFromService();
  }

  /*
   * ===================================================================================
   * TRAINING FUNCTIONS
   * ===================================================================================
   */

  // Get training data from service
  getTrainingsFromService() {
    this.trainingService.getAllTrainings().subscribe((trainings) => {
      if (trainings.length >= 2) {
        trainings.sort(function (a, b) {
          return Date.parse(b.date.toString()) - Date.parse(a.date.toString());
        });
      }

      // Show the last x trainings
      this.timedTrainings = trainings.filter((training) =>
        training.exercices.every(
          (exercise) => exercise.category == "conditionalpattern1d"
        )
      );
    });
  }

  inListOfNextSteps(exercise: Exercise): boolean {
    if (
      this.selectedTimedTraining.exercices.indexOf(exercise) ==
        this.currentExerciseIndex + 1 ||
      this.selectedTimedTraining.exercices.indexOf(exercise) ==
        this.currentExerciseIndex + 2 ||
      this.selectedTimedTraining.exercices.indexOf(exercise) ==
        this.currentExerciseIndex + 3
    ) {
      return true;
    }

    return false;
  }

  // Choose olf training as template for new training
  selectTraining(event: { value: Training }) {
    this.selectedTimedTraining = event.value;
  }

  doWorkout(i: number) {
    this.generalExerciseCountdown = this.selectedTimedTraining.exercices
      .map((exercise) => +exercise["repetitions"])
      .reduce((sum, current) => sum + current, 0);

    this.startWorkout(i);
  }

  startWorkout(i: number) {
    this.getReadyCountdown = 5;
    (async () => {
      this.playSound("snapshat");
      await this.delay(2000);

      let endSound = true;

      this.currentExerciseIndex = i;
      this.currentExercise = this.selectedTimedTraining.exercices[i];
      this.workoutCountdown = this.currentExercise["repetitions"];
      this.currentExerciseCountdown = this.currentExercise["repetitions"];

      this.exerciseIntervalId = window.setInterval(() => {
        this.workoutCountdown = this.workoutCountdown - 1;

        if (this.workoutCountdown == 1 && endSound) {
          this.playSound("iphone");
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

  stopWorkout() {
    window.clearInterval(this.exerciseIntervalId);
  }

  continueWorkout() {
    let elementIndex = this.selectedTimedTraining.exercices.indexOf(
      this.currentExercise
    );

    this.selectedTimedTraining.exercices[elementIndex][
      "repetitions"
    ] = this.currentExerciseCountdown;

    this.startWorkout(elementIndex);
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /*
   * ===================================================================================
   * SOUND FUNCTIONS
   * ===================================================================================
   */

  playSound(soundIdentifier) {
    let src = "assets/mp3/" + soundIdentifier + ".mp3";
    let audio = new Audio(src);
    audio.play();
  }
}
