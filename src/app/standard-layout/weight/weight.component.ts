import { Component, OnInit } from "@angular/core";
import { Weight } from "./model/weight";
import { WeightService } from "./services/weight.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material";

@Component({
  selector: "app-weight",
  templateUrl: "./weight.component.html",
  styleUrls: ["./weight.component.scss"]
})
export class WeightComponent implements OnInit {
  weights: Weight[];

  form = new FormGroup({
    weight: new FormControl("", [Validators.required])
  });

  constructor(
    private weightService: WeightService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.getWeightsFromService();
  }

  getWeightsFromService() {
    this.weights = [];

    this.weightService.getAllWeights().subscribe(e => {
      this.weights = e.sort(function(a, b) {
        return Date.parse(b.date.toString()) - Date.parse(a.date.toString());
      });
    });
  }

  saveWeight() {
    if (this.form.getRawValue().weight != "") {
      let weightValue: number = this.form.getRawValue().weight;
      let tempWeight: Weight = { id: 0, value: weightValue, date: new Date() };

      if (this.isNumber(tempWeight.value)) {
        this.weightService.postWeight(tempWeight).subscribe(() => {
          this.openSnackBar("Weight created!", null);
          this.getWeightsFromService();
        });
      } else {
        console.warn(
          "saveWeight(): ID: " + tempWeight.value + ", expected number"
        );
      }
    } else {
      console.warn(
        "saveWeight(): Value: " +
          this.form.getRawValue().weight +
          ", expected Value"
      );
    }
  }

  removeWeight(weight: Weight) {
    if (!(weight === undefined)) {
      if (this.isNumber(weight.id)) {
        this.weightService.deleteWeight(weight.id).subscribe(() => {
          this.openSnackBar("Weight removed!", null);
          this.getWeightsFromService();
        });
      } else {
        console.warn("removeTask(): ID: " + weight.id + ", expected number");
      }
    } else {
      console.warn("removeTask(): ID: " + weight.id + ", expected ID");
    }
  }

  /*
   *
   * HELPER FUNCTIONS
   *
   */

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000
    });
  }

  isNumber(param: any): boolean {
    return !isNaN(Number(param));
  }

  /*
   *
   * STATISTICS
   *
   */

  getLatestWeight(): Weight {
    let id: number = this.weights
      .map(e => e.id)
      .sort(function(a, b) {
        return a - b;
      })[this.weights.length - 1];
    return this.weights.filter(e => e.id == id)[0];
  }

  getDaysSinceLastWeight(): number {
    let weight: Weight = this.getLatestWeight();

    if (weight !== undefined) {
      let tempDate: Date = new Date();
      let milliseconds: number =
        tempDate.getTime() - new Date(weight.date).getTime();

      return Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    }

    return -1;
  }

  calculateBMI() {
    if (this.weights.length != 0) {
      return (+this.getLatestWeight().value / (1.85 * 1.85)).toFixed(2);
    }

    return -1;
  }

  getLowestWeightValue(): number {
    return this.weights.map(e => e.value).sort()[0];
  }

  getAverageWeightValue(): number {
    return (
      this.weights.map(e => +e.value).reduce((a, b) => a + b, 0) /
      this.weights.length
    );
  }

  getHighestWeightValue(): number {
    return this.weights.map(e => e.value).sort()[this.weights.length - 1];
  }

  getBackgroundColorValue(weight: Weight): string {
    let highestValue: number = this.getHighestWeightValue();
    if (weight.value == highestValue) {
      return "#758B60";
    }

    let lowestValue: number = this.getLowestWeightValue();
    if (weight.value == lowestValue) {
      return "#8B6066";
    }

    let averageValue: number = this.getAverageWeightValue();
    if (weight.value <= averageValue + 1 && weight.value >= averageValue - 1) {
      return "#8B7B60";
    }
    if (weight.value < averageValue - 1) {
      return "#8B6B60";
    }
    if (weight.value > averageValue + 1) {
      return "#8B8B60";
    }

    return "424242";
  }
}
