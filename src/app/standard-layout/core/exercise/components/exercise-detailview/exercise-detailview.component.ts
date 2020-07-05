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
import { NameAndNumberPair } from "src/app/standard-layout/shared/model/NameAndNumberPair";
import { GraphDataService } from "src/app/standard-layout/shared/services/graph.service";

@Component({
  selector: "app-exercise-detailview",
  templateUrl: "./exercise-detailview.component.html",
  styleUrls: ["./exercise-detailview.component.scss"],
})
export class ExerciseDetailviewComponent implements OnChanges {
  @Input() exercise: Exercise;

  trainings: Training[];
  graphData: NameAndNumberPair[] = [];

  constructor(
    public trainingService: TrainingService,
    public patternAnalysisService: PatternAnalysisService,
    private graphDataService: GraphDataService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.firstChange) {
      this.initTrainingData();
    }
  }

  initTrainingData() {
    this.trainingService.getAllTrainings().subscribe((trainings) => {
      if (this.exercise) {
        this.trainings = this.trainingService.getSortedTrainingFromExercise(
          trainings,
          this.exercise
        );
        this.graphData = this.graphDataService.initGraphDataForExerciseDetails(
          this.trainings,
          this.exercise
        );
      }
    });
  }
}
