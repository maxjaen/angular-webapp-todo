import { Component, OnInit } from '@angular/core';
import { ExerciseService } from '../../shared/services/core/exercise.service';
import { Exercise } from './model/exercise';
import { MatSnackBar } from '@angular/material';
import { KeyService } from '../../shared/services/utils/key.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { UtilityService } from '../../shared/services/utils/utility.service';
import { Title } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { Pattern } from '../../shared/model/Enums';

@Component({
  selector: 'app-exercise-overview',
  templateUrl: './exercise-overview.component.html',
  styleUrls: ['./exercise-overview.component.scss'],
})
export class ExerciseOverViewComponent implements OnInit {
  public exercises: Exercise[];
  public formForExerciseCreation = new FormGroup({
    name: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
  });

  public selectedExercise: Exercise;
  private exerciseToCreate: Exercise = new Exercise();
  private exerciseToDelete: Exercise = new Exercise();

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

  private initExercises() {
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

  public saveExercise() {
    const nameInForm = this.formForExerciseCreation.getRawValue().name;

    this.prepareExerciseName(nameInForm);
    this.exerciseService.postExercise(this.exerciseToCreate).subscribe(() => {
      this.displayNotification(this.keyService.getKeyTranslation('t4'), null);
      this.formForExerciseCreation.reset();
      this.initExercises();
    });
  }

  public deleteExercise() {
    this.exerciseService.deleteExercise(this.exerciseToDelete).subscribe(() => {
      this.displayNotification(this.keyService.getKeyTranslation('t5'), null);
      this.initExercises();
    });
  }

  /**
   * Select exercise from user interface
   * @param exercise to be selected
   */
  public selectExercise(exercise: Exercise) {
    this.selectedExercise = exercise;
  }

  /**
   * Set exercise that should be deleted on user interface
   * @param event to init exercise to be deleted
   */
  public selectExerciseToDelete(event: { value: Exercise }) {
    this.exerciseToDelete = event.value;
  }

  /**
   * Set name of new exercise
   * @param name to be set for new exercise
   */
  private prepareExerciseName(name: string) {
    this.exerciseToCreate.name = name;
  }

  /**
   * Set category of new exercise
   * @param event to init value for new exercise
   */
  public prepareExerciseCategory(event: { value: Pattern }) {
    this.exerciseToCreate.category = +event.value;
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
}
