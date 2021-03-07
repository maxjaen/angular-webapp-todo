import { Component, OnInit } from '@angular/core';
import { Exercise } from '../exercise/model/exercise';
import { Training } from '../training/model/training';
import { TrainingService } from '../../shared/services/core/training.service';
import { Title } from '@angular/platform-browser';
import { KeyService } from '../../shared/services/utils/key.service';
import { SessionState, Pattern } from '../../shared/model/Enums';
import { map } from 'rxjs/operators';
import { playSound } from '../../shared/utils/SoundUtils';
import { SettingsService } from '../../shared/services/core/settings.service';
import { Settings } from '../settings/model/settings';
import { sortNumerical } from '../../shared/utils/CommonUtils';
import { NotificationService } from '../../shared/services/utils/notification.service';

enum Sound {
    PHONE_SOUND = 'phone.mp3',
    SNAPCHAT_SOUND = 'snapchat.mp3',
}

@Component({
    selector: 'app-session',
    templateUrl: './session.component.html',
    styleUrls: ['./session.component.scss'],
})
export class SessionComponent implements OnInit {

    public trainings: Training[];
    public selectedTraining: Training;
    public currentExercise: Exercise;
    public currentIndex: number;

    public exerciseCountdown: number;
    public workoutCountdownSeconds: number;
    public readyCountdown: number;

    private settings: Settings;
    private exerciseInterval: number;
    private state: SessionState = SessionState.INITIAL;

    constructor(
        private settingsService: SettingsService,
        private trainingService: TrainingService,
        private keyService: KeyService,
        private notificationService: NotificationService,
        private title: Title
    ) {
        this.title.setTitle(this.keyService.getKeyTranslation('wo1'));
    }

    ngOnInit() {
        this.initTrainings();
        this.initSettings();
    }

    /**
     * Gives the user the ability to stop the current workout session.
     * The workout can only be stopped by the user if the session was
     * previously started.
     */
    public stopWorkout() {
        switch (this.state) {
            case SessionState.INITIAL:
                this.notificationService.displayNotification(
                    this.keyService.getKeyTranslation('se21'),
                    null
                );
                return;
            case SessionState.STARTED:
                this.notificationService.displayNotification(
                    this.keyService.getKeyTranslation('se33'),
                    null
                );
                this.state = SessionState.STOPPED;
                break;
            case SessionState.STOPPED:
                this.notificationService.displayNotification(
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
     * Reset the workout session back to the initial state and stops it if
     * necessary. The workout can only be reset by the user if the session is
     * not in initial state.
     */
    public resetWorkout() {
        switch (this.state) {
            case SessionState.INITIAL:
                this.notificationService.displayNotification(
                    this.keyService.getKeyTranslation('se21'),
                    null
                );
                return;
            case SessionState.STARTED:
            case SessionState.STOPPED:
                this.notificationService.displayNotification(
                    this.keyService.getKeyTranslation('se34'),
                    null
                );
                this.state = SessionState.INITIAL;
                break;
            default:
                throw new Error(`State ${this.state} not implemented yet.`);
        }

        window.clearInterval(this.exerciseInterval);
        this.currentExercise = null;
    }

    /**
     * Start a new workout session for the user.
     *
     * @param exerciseIndex The index of the exercise where the workout
     * session should start from.
     */
    public doWorkout(exerciseIndex: number) {
        if (!this.selectedTraining) {
            this.notificationService.displayNotification(
                this.keyService.getKeyTranslation('t6'),
                null
            );
            return;
        }

        switch (this.state) {
            case SessionState.INITIAL:
                this.notificationService.displayNotification(
                    this.keyService.getKeyTranslation('se31'),
                    null
                );
                this.state = SessionState.STARTED;
                break;
            case SessionState.STARTED:
                this.notificationService.displayNotification(
                    this.keyService.getKeyTranslation('se21'),
                    null
                );
                return;
            case SessionState.STOPPED:
                this.notificationService.displayNotification(
                    this.keyService.getKeyTranslation('se24'),
                    null
                );
                return;
            default:
                throw new Error(`State ${this.state} not implemented yet.`);
        }

        this.updateRemainingWorkoutCountdown(exerciseIndex);
        this.startWorkout(exerciseIndex);
    }

    /**
     * Gives the user the option to continue a workout session.
     * The session can only be continued if it was previously stopped by the
     * user.
     */
    public continueWorkout() {
        switch (this.state) {
            case SessionState.INITIAL:
                this.notificationService.displayNotification(
                    this.keyService.getKeyTranslation('se21'),
                    null
                );
                return;
            case SessionState.STARTED:
                this.notificationService.displayNotification(
                    this.keyService.getKeyTranslation('se22'),
                    null
                );
                return;
            case SessionState.STOPPED:
                this.notificationService.displayNotification(
                    this.keyService.getKeyTranslation('se32'),
                    null
                );
                this.state = SessionState.STARTED;
                break;
            default:
                throw new Error(`State ${this.state} not implemented yet.`);
        }

        const exerciseIndex = this.selectedTraining.exercises.indexOf(
            this.currentExercise
        );
        this.updateExerciseSecondsWithCountdown(exerciseIndex);

        this.startWorkout(exerciseIndex);
    }

    /**
     * Initialize a new workout session from the specified exercise index of
     * a training.
     *
     * @param exerciseIndex The index of a chosen exercise where the workout
     * session should start from.
     */
    public startWorkout(exerciseIndex: number) {
        this.readyCountdown = 5;

        (async () => {
            this.playSound(Sound.SNAPCHAT_SOUND);
            await this.waitMilliseconds(2000);

            this.currentIndex = exerciseIndex;
            this.currentExercise = this.selectedTraining.exercises[
                exerciseIndex
            ];
            this.exerciseCountdown = this.currentExercise.repetitions;

            let endSound = true;
            let iterationCountdown = this.currentExercise.repetitions;

            this.exerciseInterval = window.setInterval(() => {
                iterationCountdown = iterationCountdown - 1;

                // play sound before exercise finished
                if (iterationCountdown === 1 && endSound) {
                    this.playSound(Sound.PHONE_SOUND);
                    endSound = false;
                }
                // when exercise finished
                if (iterationCountdown >= 0) {
                    this.exerciseCountdown = this.exerciseCountdown - 1;
                    this.workoutCountdownSeconds =
                        this.workoutCountdownSeconds - 1;
                }
                // time interval between exercises to get ready
                if (iterationCountdown < 0) {
                    this.readyCountdown--;
                }
                // restart workout cycle with next exercise
                if (iterationCountdown === -6) {
                    window.clearInterval(this.exerciseInterval);
                    this.startWorkout(exerciseIndex + 1);
                }
            }, 1000);
        })();
    }

    /**
     * Checks if the input exercise is one of the following three exercise in
     * the chosen workout.
     *
     * @param exercise The exercise to be checked for occurrence in the
     * upcoming three exercises.
     */
    public isInNextThreeExercises(exercise: Exercise): boolean {
        return (
            this.selectedTraining.exercises.indexOf(exercise) ===
                this.currentIndex + 1 ||
            this.selectedTraining.exercises.indexOf(exercise) ===
                this.currentIndex + 2 ||
            this.selectedTraining.exercises.indexOf(exercise) ===
                this.currentIndex + 3
        );
    }

    /**
     * Checks if the current workout state is to take a break until the next
     * exercise will start. A break is per design an exercise where the user
     * don't have to do anything.
     *
     * @param exercise The exercise to be checked for a break value.
     * @returns Returns a boolean to check if the current exercise's value
     * is a break.
     */
    public isBreakTime(exercise: Exercise): boolean {
        return (
            exercise.name === 'Break' &&
            this.selectedTraining.exercises.indexOf(exercise) ===
                this.currentIndex
        );
    }

    /**
     * Converts the currently remaining workout duration in seconds to minutes.
     *
     * @returns Returns the currently remaining workout duration in minutes to
     * the user.
     */
    public formatWorkoutToMin(): number {
        return Math.round(this.workoutCountdownSeconds / 60);
    }

    /**
     * The user can choose another (previous) training as a template for the new
     * training. All values from the previous training will be entered into the
     * forms and can be changed by the user.
     *
     * @param event The event contains a training that was chosen as a template
     * to create a new training.
     */
    public selectTrainingTemplate(event: { value: Training }) {
        this.selectedTraining = event.value;
        this.resetCurrentExercise();

        const totalWorkoutCountdown = this.selectedTraining.exercises
            .map((exercise) => +exercise.repetitions)
            .reduce((sum, current) => sum + current, 0);

        this.updateTotalWorkoutCountDown(totalWorkoutCountdown); // initialize
    }

    private initTrainings() {
        this.trainingService
            .getTrainings()
            .pipe(
                map((trainings) => {
                    if (trainings.length >= 2) {
                        trainings.sort((a, b) =>
                            sortNumerical(
                                Date.parse(a.date.toString()),
                                Date.parse(b.date.toString())
                            )
                        );
                        return trainings;
                    }
                }),
                map((trainings) =>
                    trainings.filter((training) =>
                        training.exercises.every(
                            (exercise) =>
                                exercise.category === Pattern.CONDITIONAL1
                        )
                    )
                )
            )
            .subscribe((trainings) => {
                this.trainings = trainings;
            });
    }

    private initSettings() {
        this.settingsService.getSettings().subscribe((settings) => {
            this.settings = settings[0];
        });
    }

    private updateRemainingWorkoutCountdown(elementIndex: number) {
        const remainingWorkoutCountdown = this.selectedTraining.exercises
            .slice(elementIndex, this.selectedTraining.exercises.length)
            .map((exercise) => +exercise.repetitions)
            .reduce((sum, current) => sum + current, 0);

        this.updateTotalWorkoutCountDown(remainingWorkoutCountdown);
    }

    private updateTotalWorkoutCountDown(workoutCountdownSeconds: number) {
        this.workoutCountdownSeconds = workoutCountdownSeconds;
    }

    private playSound(sound: Sound) {
        if (this.settings.session.playSound.value) {
            playSound(sound);
        }
    }

    private updateExerciseSecondsWithCountdown(elementIndex: number) {
        this.selectedTraining.exercises[
            elementIndex
        ].repetitions = this.exerciseCountdown;
    }

    private resetCurrentExercise() {
        this.currentExercise = null;
    }

    private waitMilliseconds(milliseconds: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }
}
