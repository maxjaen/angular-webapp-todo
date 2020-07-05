import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { Exercise } from "../../model/exercise";
import { TrainingService } from "../../../training/services/training.service";
import { Training } from "../../../training/model/training";
import { PatternAnalysisService } from "../../services/pattern-analysis.service";
import { NameAndNumberValuePair } from "src/app/standard-layout/shared/model/NameAndNumberValuePair";

@Component({
  selector: "app-exercise-detailview",
  templateUrl: "./exercise-detailview.component.html",
  styleUrls: ["./exercise-detailview.component.scss"],
})
export class ExerciseDetailviewComponent implements OnInit, OnChanges {
  @Input() exercise: Exercise;

  trainings: Training[];
  graphData: NameAndNumberValuePair[] = [];

  constructor(
    private trainingService: TrainingService,
    public patternAnalysisService: PatternAnalysisService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.firstChange) {
      this.getTrainings();
    }
  }

  ngOnInit(): void {}

  getTrainings() {
    this.trainingService.getAllTrainings().subscribe((trainings) => {
      if (this.exercise) {
        this.trainings = this.trainingService.getSortedTrainingFromExercise(
          trainings,
          this.exercise
        );
        this.initGraphData();
      }
    });
  }

  getDate(training: Training): string {
    return new Date(training.date).toLocaleString();
  }

  initGraphData() {
    let arr: NameAndNumberValuePair[] = [];

    this.trainings
      .filter((e) =>
        e.exercices.find((e) => e.category == this.exercise.category)
      )
      .forEach((e) => {
        let element: NameAndNumberValuePair = {
          name: new Date(e.date).toLocaleString(),
          value: this.patternAnalysisService.calculateSum(e, this.exercise),
        };
        arr.push(element);
      });
    this.graphData = arr;
  }
}
