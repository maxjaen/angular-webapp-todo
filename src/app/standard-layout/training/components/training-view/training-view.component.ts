import { Component, OnInit } from "@angular/core";
import { TrainingService } from "../../services/training.service";
import { Training } from "../../model/training";
import { ActivatedRoute, Router } from "@angular/router";
import { Exercise } from "../../model/exercise";

@Component({
  selector: "app-training-view",
  templateUrl: "./training-view.component.html",
  styleUrls: ["./training-view.component.scss"]
})
export class TrainingViewComponent implements OnInit {
  actualTraining: Training;
  dataSource: Exercise[] = [];
  displayedColumns: string[] = ["name", "category", "string"];

  constructor(
    private trainingService: TrainingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.getTrainingFromService();
  }

  getTrainingFromService() {
    this.route.params.subscribe(params => {
      this.trainingService
        .getTrainingByID(+params["id"])
        .subscribe(training => {
          this.actualTraining = training;
          this.dataSource = this.actualTraining.exercices;
        });
    });
  }

  removeTraining() {
    if (window.confirm("Are sure you want to delete this item ?")) {
      this.route.params.subscribe(params => {
        this.trainingService.deleteTrainingByID(+params["id"]).subscribe(() => {
          this.gotoTraining();
        });
      });
    }
  }

  gotoTraining() {
    this.router.navigate(["/training"]);
  }

  showDatestring(date: Date): string {
    let tempDate: Date = new Date(date);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    };
    return tempDate.toLocaleDateString("de-DE", options);
  }
}
