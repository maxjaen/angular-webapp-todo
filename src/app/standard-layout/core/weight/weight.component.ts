import { Component, OnInit } from "@angular/core";
import { Weight } from "./model/weight";
import { WeightService } from "./services/weight.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material";
import { StringDistributorService } from "../../shared/services/string-distributor.service";
import { UtilityService } from "../../shared/services/utility.service";

@Component({
  selector: "app-weight",
  templateUrl: "./weight.component.html",
  styleUrls: ["./weight.component.scss"],
})
export class WeightComponent implements OnInit {
  weights: Weight[];

  form = new FormGroup({
    weight: new FormControl("", [Validators.required]),
  });

  constructor(
    private weightService: WeightService,
    private stringDistributorService: StringDistributorService,
    private _utilityService: UtilityService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.getWeightsFromService();
  }

  // Get all Weights (sorted) from service
  getWeightsFromService() {
    this.weights = [];

    this.weightService.getAllWeights().subscribe((weights) => {
      weights.sort(function (a, b) {
        return Date.parse(b.date.toString()) - Date.parse(a.date.toString());
      });

      this.weights = weights;
    });
  }

  // Save Weight in the database
  saveWeight() {
    if (this.form.getRawValue().weight != "") {
      let weightValue: number = this.form.getRawValue().weight;
      let temp: Date = new Date();
      temp.setHours(temp.getHours() + 1);
      let tempWeight: Weight = { id: 0, value: weightValue, date: temp };

      if (this._utilityService.isNumber(tempWeight.value)) {
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

  // Remove selected Weight from the database
  removeWeight(weight: Weight) {
    if (weight !== undefined) {
      if (this._utilityService.isNumber(weight.id)) {
        if (window.confirm("Are sure you want to delete this item ?")) {
          this.weightService.deleteWeight(weight.id).subscribe(() => {
            this.openSnackBar("Weight removed!", null);
            this.getWeightsFromService();
          });
        }
      } else {
        console.warn("removeTask(): ID: " + weight.id + ", expected number");
      }
    } else {
      console.warn("removeTask(): ID: " + weight.id + ", expected ID");
    }
  }

  /*
   * ===================================================================================
   * HELPER FUNCTIONS
   * ===================================================================================
   */

  // Opens popup menu for notifications
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  /*
   * ===================================================================================
   * STATISTICS
   * ===================================================================================
   */

  // Get the latest weight measurement
  getLatestWeight(): Weight {
    let id: number = this.weights
      .map((e) => e.id)
      .sort(function (a, b) {
        return a - b;
      })[this.weights.length - 1];
    return this.weights.filter((e) => e.id == id)[0];
  }

  // Get the number of days since last training session
  getDaysSinceLastWeight(): number {
    let weight: Weight = this.getLatestWeight();

    if (weight !== undefined) {
      let tempDate: Date = new Date();
      tempDate.setHours(tempDate.getHours() + 1);
      let milliseconds: number =
        tempDate.getTime() - new Date(weight.date).getTime();

      return Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    }

    return -1;
  }

  // Calculate BMI index
  calculateBMI() {
    if (this.weights.length != 0) {
      return (+this.getLatestWeight().value / (1.85 * 1.85)).toFixed(2);
    }

    return -1;
  }

  // Get lowest weight value of all weight data
  getLowestWeightValue(): number {
    return this.weights
      .map((weight) => weight.value)
      .sort(this._utilityService.sortNumerical)[this.weights.length - 1];
  }

  // Get average data value from all weight data
  getAverageWeightValue(): number {
    return (
      this.weights.map((e) => +e.value).reduce((a, b) => a + b, 0) /
      this.weights.length
    );
  }

  // Get highest weight value of all weight data
  getHighestWeightValue(): number {
    return this.weights
      .map((weight) => weight.value)
      .sort(this._utilityService.sortNumerical)[0];
  }

  // Get backround color for different weight intervals
  // Return backround color
  getBackgroundColorValue(weight: Weight): string {
    let highestValue: number = this.getHighestWeightValue();
    if (weight.value == highestValue) {
      return this.stringDistributorService.COLORS.DARKGREEN;
    }

    let lowestValue: number = this.getLowestWeightValue();
    if (weight.value == lowestValue) {
      return this.stringDistributorService.COLORS.RED;
    }

    let averageValue: number = this.getAverageWeightValue();
    if (weight.value <= averageValue + 1 && weight.value >= averageValue - 1) {
      return this.stringDistributorService.COLORS.YELLOW;
    }

    if (weight.value < averageValue - 1) {
      return this.stringDistributorService.COLORS.ORANGE;
    }

    if (weight.value > averageValue + 1) {
      return this.stringDistributorService.COLORS.LIGHTGREEN;
    }

    return this.stringDistributorService.COLORS.DARKGRAY;
  }
}
