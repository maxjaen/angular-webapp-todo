import { Component, OnInit } from '@angular/core';
import { Exercise } from '../exercise/model/exercise';
import { Training } from '../training/model/training';
import { TrainingService } from '../../shared/services/core/training.service';
import { SoundService } from '../../shared/services/utils/sound.service';
import { UtilityService } from '../../shared/services/utils/utility.service';
import { MatSnackBar } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { KeyService } from '../../shared/services/utils/key.service';
import { SessionState, Pattern } from '../../shared/model/Enums';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
})
export class SessionComponent implements OnInit {
  trainings: Training[];
  selectedTraining: Training;
  exerciseInterval: number;

  currentExercise: Exercise;
  currentExerciseIndex: number;

  exerciseCountdown: number;
  workoutCountdown: number;
  readyCountdown: number;

  state: SessionState = SessionState.Initial;

  constructor(
    private utilityService: UtilityService,
    private trainingService: TrainingService,
    private soundService: SoundService,
    private keyService: KeyService,
    private snackBarService: MatSnackBar,
    private tabTitleService: Title
  ) {}

  ngOnInit() {
    this.initTrainings();
    this.tabTitleService.setTitle(this.keyService.getKeyTranslation('wo1'));
  }

  public initTrainings() {
    this.trainingService
      .getTrainings()
      .pipe(
        map((trainings) => {
          if (trainings.length >= 2) {
            trainings.sort((a, b) =>
              this.utilityService.sortNumerical(
                Date.parse(a.date.toString()),
                Date.parse(b.date.toString())
              )
            );
            return trainings;
          }
        }),
        map((trainings) =>
          trainings.filter((training) =>
            training.exercices.every(
              (exercise) => exercise.category === Pattern.CONDITIONAL1
            )
          )
        )
      )
      .subscribe((trainings) => {
        this.trainings = trainings;
      });
  }

  /**
   * Pause workout within the session
   */
  public stopWorkout() {
    switch (this.state) {
      case SessionState.Initial:
        this.displayNotification(
          this.keyService.getKeyTranslation('se21'),
          null
        );
        return;
      case SessionState.Started:
        this.displayNotification(
          this.keyService.getKeyTranslation('se33'),
          null
        );
        this.state = SessionState.Stopped;
        break;
      case SessionState.Stopped:
        this.displayNotification(
          this.keyService.getKeyTranslation('se23'),
          null
        );
        return;
      default:
        throw new Error(`State ${this.state} not implemented yet.`);
    }

    window.clearInterval(this.exerciseInterval);
  }

  /**
   * Reset your progress to initial state
   */
  public resetWorkout(): void {
    switch (this.state) {
      case SessionState.Initial:
        this.displayNotification(
          this.keyService.getKeyTranslation('se21'),
          null
        );
        return;
      case SessionState.Started:
      case SessionState.Stopped:
        this.displayNotification(
          this.keyService.getKeyTranslation('se34'),
          null
        );
        this.state = SessionState.Initial;
        break;
      default:
        throw new Error(`State ${this.state} not implemented yet.`);
    }

    window.clearInterval(this.exerciseInterval);
    this.selectedTraining = null;
    this.currentExercise = null;
  }

  /**
   * Start a new Workout Session and init general exercise countdown
   * @param elementIndex from which the total amount of time will be calculated
   */
  public doWorkout(elementIndex: number): void {
    if (!this.selectedTraining) {
      this.displayNotification(this.keyService.getKeyTranslation('t6'), null);
      return;
    }

    switch (this.state) {
      case SessionState.Initial:
        this.displayNotification(
          this.keyService.getKeyTranslation('se31'),
          null
        );
        this.state = SessionState.Started;
        break;
      case SessionState.Started:
        this.displayNotification(
          this.keyService.getKeyTranslation('se21'),
          null
        );
        return;
      case SessionState.Stopped:
        this.displayNotification(
          this.keyService.getKeyTranslation('se24'),
          null
        );
        return;
      default:
        throw new Error(`State ${this.state} not implemented yet.`);
    }

    // set general exercise countdown
    this.workoutCountdown = this.selectedTraining.exercices
      .slice(elementIndex, this.selectedTraining.exercices.length)
      .map((exercise) => +exercise['repetitions'])
      .reduce((sum, current) => sum + current, 0);

    this.startWorkout(elementIndex);
  }

  /**
   * Continue at the time you stopped in an Workout Session
   */
  public continueWorkout() {
    switch (this.state) {
      case SessionState.Initial:
        this.displayNotification(
          this.keyService.getKeyTranslation('se21'),
          null
        );
        return;
      case SessionState.Started:
        this.displayNotification(
          this.keyService.getKeyTranslation('se22'),
          null
        );
        return;
      case SessionState.Stopped:
        this.displayNotification(
          this.keyService.getKeyTranslation('se32'),
          null
        );
        this.state = SessionState.Started;
        break;
      default:
        throw new Error(`State ${this.state} not implemented yet.`);
    }

    const elementIndex = this.selectedTraining.exercices.indexOf(
      this.currentExercise
    );

    // Update current exercise value with countdown to continue where you stopped
    this.selectedTraining.exercices[elementIndex][
      'repetitions'
    ] = this.exerciseCountdown;

    this.startWorkout(elementIndex);
  }

  /**
   * Init new workout session from training with exercise index
   * @param index for exercise to start with
   */
  public startWorkout(index: number): void {
    this.readyCountdown = 5;

    (async () => {
      this.soundService.playSound('snapchat');
      await this.waitMilliseconds(2000);

      this.currentExerciseIndex = index;
      this.currentExercise = this.selectedTraining.exercices[index];
      this.exerciseCountdown = this.currentExercise['repetitions'];

      let endSound = true;
      let iterationCountdown = this.currentExercise['repetitions'];

      this.exerciseInterval = window.setInterval(() => {
        iterationCountdown = iterationCountdown - 1;

        if (iterationCountdown === 1 && endSound) {
          // play sound before exercise finished
          this.soundService.playSound('iphone');
          endSound = false;
        }
        if (iterationCountdown >= 0) {
          // when exercise finished
          this.exerciseCountdown = this.exerciseCountdown - 1;
          this.workoutCountdown = this.workoutCountdown - 1;
        }
        if (iterationCountdown < 0) {
          // time interval between exercises to get ready
          this.readyCountdown--;
        }
        if (iterationCountdown === -6) {
          // restart workout cycle with next exercise
          window.clearInterval(this.exerciseInterval);
          this.startWorkout(index + 1);
        }
      }, 1000);
    })();
  }

  /**
   * Choose previous (old) training as template for new training
   * @param event to get the training value
   */
  public selectTrainingTemplate(event: { value: Training }) {
    this.selectedTraining = event.value;
    this.currentExercise = null;
  }

  /**
   * Checks if input exercise is one of the following three elements in the selected training list
   * @param exercise to be checked
   */
  public inListOfNextSteps(exercise: Exercise): boolean {
    return (
      this.selectedTraining.exercices.indexOf(exercise) ===
        this.currentExerciseIndex + 1 ||
      this.selectedTraining.exercices.indexOf(exercise) ===
        this.currentExerciseIndex + 2 ||
      this.selectedTraining.exercices.indexOf(exercise) ===
        this.currentExerciseIndex + 3
    );
  }

  /**
   * Helper function to wait a specific time period
   * @param milliseconds to wait
   */
  private waitMilliseconds(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  /**
   * Opens popup menu to show new notifications on user interface
   * @param message to be displayed
   * @param action to be taken
   */
  private displayNotification(message: string, action: string): void {
    this.snackBarService.open(message, action, {
      duration: 4000,
    });
  }
}
