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

@Component({
  selector: "app-exercise-detailview",
  templateUrl: "./exercise-detailview.component.html",
  styleUrls: ["./exercise-detailview.component.scss"],
})
export class ExerciseDetailviewComponent implements OnInit, OnChanges {
  @Input() exercise: Exercise;
  trainings: Training[];

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
      }
    });
  }

  getDate(training: Training): string {
    return new Date(training.date).toLocaleString();
  }
}
