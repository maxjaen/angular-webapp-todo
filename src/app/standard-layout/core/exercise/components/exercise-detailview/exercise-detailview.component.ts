import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { Exercise } from "../../model/exercise";
import { TrainingService } from "../../../../shared/services/core/training.service";
import { Training } from "../../../training/model/training";
import { PatternAnalysisService } from "../../../../shared/services/utils/pattern-analysis.service";
import { NameAndNumberPair } from "src/app/standard-layout/shared/model/GraphData";
import { GraphDataService } from "src/app/standard-layout/shared/services/utils/graph.service";

@Component({
  selector: "app-exercise-detailview",
  templateUrl: "./exercise-detailview.component.html",
  styleUrls: ["./exercise-detailview.component.scss"],
})
export class ExerciseDetailviewComponent implements OnChanges {
  @Input() exercise: Exercise;

  trainings: Training[];
  graphData: NameAndNumberPair[] = [];
  graphDataPercent: NameAndNumberPair[] = [];

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

        this.graphDataPercent = this.calculateGraphDataPercent();
      }
    });
  }

  private calculateGraphDataPercent() {
    const graphData = this.graphData;
    let graphDataPercent = [];

    graphData.forEach((currentElem, i) => {
      const lastElem = graphData[i + 1];
      const endOfArray = graphData[graphData.length - 1];

      if (currentElem !== endOfArray) {
        const entry: NameAndNumberPair = {
          name: "From " + lastElem.name + " to " + currentElem.name,
          value:
            ((+currentElem.value - +lastElem.value) / +currentElem.value) * 100,
        };
        graphDataPercent.push(entry);
      }
    });

    return graphDataPercent;
  }
}
