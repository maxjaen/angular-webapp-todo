import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Exercise } from './model/exercise';
import { Training } from './model/training';
import { ExerciseService } from './services/exercise.service';
import { TrainingService } from './services/training.service';
import { MatDatepickerInputEvent } from '@angular/material';
import { ExercisePattern } from './model/exercise-pattern';
import { WeightPattern } from './model/weight-pattern';
import { ConditionalPattern } from './model/conditional-pattern';
import { CountablePattern } from './model/countable-pattern';
import { ConditionalPattern2d } from './model/conditional-pattern2d';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.scss']
})
export class TrainingComponent implements OnInit {

  trainings: Training[];
  trainingsDate: Date = new Date();

  exercises: Exercise[];
  exercisesToInsert: Exercise[] = [];

  formGroups: FormGroup[] = [];
  formGroupToInsert: FormGroup;
  training: Training;

  constructor(private exerciseService: ExerciseService, private trainingService: TrainingService,  private titleService:Title) {
    this.titleService.setTitle("Training");
  }

  ngOnInit() {
    this.getExercisesFromService();
    this.getTrainingsFromService();
  }

  getExercisesFromService() {
    this.exerciseService.getAllExercises().subscribe(exercises => {
      this.exercises = exercises
    });
  }

  compareToLastExercise(exercise: Exercise, index: number): boolean{
    // cant compare first element to element before because doesnt exist
    if (index > 0){
      if (this.exercisesToInsert[index - 1].name == exercise.name){
        return true;
      }
    }

    return false;
  }

  /*
  *
  * TRAINING METHODS
  *
  */

  createTraining() {
    this.training = { id: 0, exercices: [], date: this.trainingsDate };

    this.formGroups.forEach(formGroup => {
      this.training.exercices.push(formGroup.getRawValue());
    });
    
    this.trainingService.postTraining(this.training).subscribe(() => {
      this.trainingService.getAllTrainings().subscribe(e => {
        this.trainings = e;
        this.resetForm();
      });
    });
  }

  getTrainingsFromService() {
    this.trainingService.getAllTrainings().subscribe(trainings => {
     if (trainings.length >= 2){
      this.trainings = trainings.sort(function (a, b) {
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
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return tempDate.toLocaleDateString('de-DE', options);
  }
  
  fixClockstring(time: number) {
    return (time < 10) ? "0" + time : time;
  }

  /*
  *
  * CHECKBOX METHODS
  *
  */

  toggleCheckboxEvent(exercise: Exercise, event: { checked: boolean; }) {
    this.setCheckBoxFromExerciseName(exercise.name, true);

    if (event.checked === true) {
      if (!this.exercisesToInsert.find(e => e.name == exercise.name)){
        this.exercisesToInsert.push(exercise);
        this.createFormGroup(exercise);
      } else {
        let tempExercise: Exercise = this.exercisesToInsert.filter(e => e.name == exercise.name)[0];
        this.exercisesToInsert.push(tempExercise);
        let tempGroup: FormGroup = this.formGroups.filter(e => e.getRawValue().name == exercise.name)[0];
        this.formGroups.push(tempGroup);
      }
    } else {      
      while (this.exercisesToInsert.find(e => e.name == exercise.name)) {
        this.removeElementFromArray(exercise, this.exercisesToInsert);
      };
      
      while (this.formGroups.find(e => e.getRawValue().name == exercise.name)) {
        this.removeElementFromArray(this.formGroups.filter(e => e.getRawValue().name == exercise.name)[0], this.formGroups);
      };      
    }    
  }

  setCheckBoxFromExerciseName(exerciseName: string, checked: boolean) {
    this.exercises.filter(exercise => exerciseName == exercise.name).forEach(exercise => {
      exercise.checked = checked;
    })
  }

  /*
  *
  * FORM METHODS
  *
  */

  getFormGroup(exercice: Exercise): FormGroup {
    return this.formGroups.filter(e => e.getRawValue().name === exercice.name)[0];
  }

  createFormGroup(exercise: Exercise) {
    this.formGroupToInsert = new FormGroup({})

    let patternArray: string[] = this.getPatternKeys(exercise);

    patternArray.forEach(key => {
      if (key != "name"){
        this.formGroupToInsert.addControl(key, new FormControl(''));
      } else {
        this.formGroupToInsert.addControl(key, new FormControl(exercise.name));
      }
    });
    
    this.formGroupToInsert.addControl("category", new FormControl(exercise.category));
    this.formGroupToInsert.addControl("pattern", new FormControl(exercise.pattern));
    
    this.formGroups.push(this.formGroupToInsert);
  }

  removeElementFromForm(exercise: Exercise, elementPosition: number) {
    if (this.exercisesToInsert.filter(e => e.name == exercise.name).length == 1) {
      this.setCheckBoxFromExerciseName(exercise.name, false);
    }
    this.removePositionFromArray(elementPosition, this.exercisesToInsert);
    this.removePositionFromArray(elementPosition, this.formGroups);
  }

  formIsValid(): boolean {
    if (!(this.formGroups.length > 0) || this.formGroups.find(e => e.invalid)) {
      return false;
    }

    // TODO validation not working yet

    // if (this.formGroups.map(e => e.getRawValue()).find(e => e.einheit == "" || e.saetz == "" || e.wdh == "" || !(this.isNumber(e.wdh)) || !(this.isNumber(e.saetz)))) {
    //   return false;
    // }

    return true;
  }

  resetForm() {
    this.exercisesToInsert = [];
    this.formGroupToInsert= null;
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

  getPatternKeys(exercise: Exercise){
    if (exercise.category=="conditionalpattern1d"){
      let pattern: ConditionalPattern = {name :"conditionalpattern1d", records: 0, repetitions:0, unit:"kg"};
      exercise.pattern = pattern;
      return Object.getOwnPropertyNames(pattern); 
    }

    if (exercise.category=="conditionalpattern2d"){
      // TODO change typeformGroup
      let pattern: ConditionalPattern2d = {name :"conditionalpattern2d", period: 0, speed:0, unitperiod:"min", unitspeed:"km/h"};
      exercise.pattern = pattern;
      return Object.getOwnPropertyNames(pattern); 
    }

    if (exercise.category=="countablepattern"){
       // TODO change type
      let pattern: CountablePattern = {name :"countablepattern", records: 0, repetitions:0};
      exercise.pattern = pattern;
      return Object.getOwnPropertyNames(pattern); 
    }

    if (exercise.category=="weightpattern"){
      let pattern: WeightPattern = {name :"weightpattern", records: 0, repetitions:0, weight:0, unit:"kg"};
      exercise.pattern = pattern;
      return Object.getOwnPropertyNames(pattern);
    }
  }

  isConditionalPattern1d(exercise: Exercise): boolean{   
    if (exercise.pattern.name == "conditionalpattern1d"){
      return true;
    }

    return false;
  };

  isConditionalPattern2d(exercise: Exercise): boolean{   
    if (exercise.pattern.name == "conditionalpattern2d"){
      return true;
    }

    return false;
  };
  
  isCountablePattern(exercise: Exercise): boolean{   
    if (exercise.pattern.name == "countablepattern"){
      return true;
    }

    return false;
  };

  isWeightPattern(exercise: Exercise): boolean{
    if (exercise.pattern.name == "weightpattern"){    
      return true;
    }

    return false;
  };

  /*
  *
  * HELPER METHODS
  *
  */

  removePositionFromArray(elementPosition: number, array: any[]) {
    array.splice(elementPosition, 1);
  }

  removeElementFromArray(element: any, array: any[]) {
    array.splice(array.indexOf(element), 1);
  }

  isNumber(param: any): boolean {
    return !(isNaN(Number(param)))
  }

  selectDistinctExerciseCategories(): Array<string> {
    return this.exercises.map(e => e.category).filter(this.onlyUniques);
  }

  onlyUniques(value, index, self) {
    return self.indexOf(value) === index;
  }

  /*
  *
  * SMOOTH SCROLLING
  *
  */

  @ViewChild("overviewtraining", { read: undefined, static: false }) overviewtraining: ElementRef;
  @ViewChild("createtraining", { read: undefined, static: false }) createtraining: ElementRef;

  scroll(el: string) {
    switch (el) {
      case "overviewtraining":
        this.overviewtraining.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
        break;
      case "createtraining":
        this.createtraining.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
        break;
    }
  }
}