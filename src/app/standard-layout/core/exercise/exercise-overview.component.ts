import { Component, OnInit } from '@angular/core';
import { ExerciseService } from '../../shared/services/core/exercise.service';
import { Exercise } from './model/exercise';
import { KeyService } from '../../shared/services/utils/key.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { Pattern } from '../../shared/model/Enums';
import { sortAlphabetical } from '../../shared/utils/CommonUtils';
import { NotificationService } from '../../shared/services/utils/notification.service';

@Component({
    selector: 'app-exercise-overview',
    templateUrl: './exercise-overview.component.html',
    styleUrls: ['./exercise-overview.component.scss'],
})
export class ExerciseOverViewComponent implements OnInit {

    public formForExerciseCreation = new FormGroup({
        name: new FormControl('', [Validators.required]),
        category: new FormControl('', [Validators.required]),
    });

    public exercises: Exercise[];
    public selectedExercise: Exercise;
    private exerciseToCreate: Exercise = new Exercise();
    private exerciseToDelete: Exercise = new Exercise();

    constructor(
        public exerciseService: ExerciseService,
        private keyService: KeyService,
        private notificationService: NotificationService,
        private title: Title
    ) {
        this.title.setTitle(this.keyService.getKeyTranslation('e1'));
    }

    ngOnInit() {
        this.initExercises();
    }

    /**
     * The user can save a new exercise based on the name and an exercise
     * pattern.
     */
    public saveExercise() {
        this.exerciseToCreate.name = this.formForExerciseCreation.getRawValue().name;

        this.exerciseService
            .postExercise(this.exerciseToCreate)
            .subscribe(() => {
                this.notificationService.displayNotification(
                    this.keyService.getKeyTranslation('t4'),
                    null
                );
                this.formForExerciseCreation.reset();
                this.initExercises();
            });
    }

    /**
     * The user can delete the chosen exercise.
     */
    public deleteExercise() {
        this.exerciseService
            .deleteExercise(this.exerciseToDelete)
            .subscribe(() => {
                this.notificationService.displayNotification(
                    this.keyService.getKeyTranslation('t5'),
                    null
                );
                this.initExercises();
            });
    }

    /**
     * Select the exercise from the user interface to get a detailed view with
     * various visualization options.
     *
     * @param exercise The exercise that will be displayed in a detailed view.
     */
    public selectExercise(exercise: Exercise) {
        this.selectedExercise = exercise;
    }

    /**
     * Set the exercise that should be deleted on user interface.
     *
     * @param event The event that contains the exercise that should be deleted.
     */
    public markForDeletion(event: { value: Exercise }) {
        this.exerciseToDelete = event.value;
    }

    /**
     * Set the category of new exercise during its creation.
     *
     * @param event The event that contains the chosen category for the new
     * exercise.
     */
    public addExerciseCategory(event: { value: Pattern }) {
        this.exerciseToCreate.category = +event.value;
    }

    private initExercises() {
        this.exerciseService
            .getExercises()
            .pipe(
                map((exercises) =>
                    exercises.sort((a, b) => sortAlphabetical(a.name, b.name))
                )
            )
            .subscribe((exercises) => {
                this.exercises = exercises;
            });
    }
}
