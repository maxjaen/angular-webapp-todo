import { Component, OnInit } from '@angular/core';
import { ExerciseService } from '../../shared/services/core/exercise.service';
import { Exercise } from './model/exercise';
import { MatSnackBar } from '@angular/material';
import { KeyService } from '../../shared/services/utils/key.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { UtilityService } from '../../shared/services/utils/utility.service';
import { Title } from '@angular/platform-browser';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-exercise-overview',
  templateUrl: './exercise-overview.component.html',
  styleUrls: ['./exercise-overview.component.scss'],
})
export class ExerciseOverViewComponent implements OnInit {
  exercises: Exercise[];
  exerciseToCreate: Exercise = new Exercise();
  formForExerciseCreation = new FormGroup({
    name: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
  });
  exerciseToDelete: Exercise = new Exercise();

  selectedExercise: Exercise;

  patterns = [
    'conditionalpattern1d',
    'conditionalpattern2d',
    'countablepattern',
    'weightpattern',
    'freepattern',
  ];

  constructor(
    private utilityService: UtilityService,
    public exerciseService: ExerciseService,
    private keyService: KeyService,
    private tabTitleService: Title,
    private snackBarService: MatSnackBar
  ) {}

  ngOnInit() {
    this.initExercises();
    this.tabTitleService.setTitle(this.keyService.getKeyTranslation('e1'));
  }

  initExercises() {
    this.exerciseService
      .getExercises()
      .pipe(
        map((exercises) => {
          return exercises.sort((a, b) =>
            this.utilityService.sortAlphabetical(a.name, b.name)
          );
        })
      )
      .subscribe((exercises) => {
        this.exercises = exercises;
      });
  }

  saveExercise() {
    this.prepareExerciseName(this.formForExerciseCreation.getRawValue().name);

    this.exerciseService.postExercise(this.exerciseToCreate).subscribe(() => {
      this.displayNotification(this.keyService.getKeyTranslation('t4'), null);
      this.initExercises();
    });
  }

  deleteExercise() {
    this.exerciseService.deleteExercise(this.exerciseToDelete).subscribe(() => {
      this.displayNotification(this.keyService.getKeyTranslation('t5'), null);
      this.initExercises();
    });
  }

  /**
   * Select exercise from user interface
   * @param exercise to be selected
   */
  selectExercise(exercise: Exercise) {
    this.selectedExercise = exercise;
  }

  /**
   * Set exercise that should be deleted on user interface
   * @param event to init exercise to be deleted
   */
  selectExerciseToDelete(event: { value: Exercise }) {
    this.exerciseToDelete = event.value;
  }

  /**
   *  Set name of new exercise
   * @param name to be setted for new exercise
   */
  prepareExerciseName(name: string) {
    this.exerciseToCreate.name = name;
  }

  /**
   * Set category of new exercise
   * @param event to init value for new exercise
   */
  prepareExerciseCategory(event: { value: string }) {
    this.exerciseToCreate.category = event.value;
  }

  /**
   * Opens popup menu to show new notifications on user interface
   * @param message to be displayed
   * @param action to be taken
   */
  displayNotification(message: string, action: string) {
    this.snackBarService.open(message, action, {
      duration: 4000,
    });
  }
}
