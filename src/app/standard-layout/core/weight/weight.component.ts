import { Component, OnInit } from "@angular/core";
import { Weight } from "./model/weight";
import { WeightService } from "./services/weight.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material";
import { UtilityService } from "../../shared/services/utility.service";
import { KeyService } from "../../shared/services/key.service";
import { TimeService } from "../../shared/services/time.service";

@Component({
  selector: "app-weight",
  templateUrl: "./weight.component.html",
  styleUrls: ["./weight.component.scss"],
})
export class WeightComponent implements OnInit {
  weights: Weight[];

  displayedWeights: number = 15;
  form = new FormGroup({
    weight: new FormControl("", [Validators.required]),
  });

  constructor(
    private timeService: TimeService,
    private weightService: WeightService,
    private keyService: KeyService,
    private _utilityService: UtilityService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.getWeightsFromService();

    // TODO set tab title
  }

  /*
   * ===================================================================================
   * GET DATA
   * ===================================================================================
   */

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

  /*
   * ===================================================================================
   * CRUD OPERATIONS
   * ===================================================================================
   */

  // Save weight into the database
  saveWeight() {
    if (this.form.getRawValue().weight != "") {
      const weightValue: number = this.form.getRawValue().weight;
      const dateValue: Date = this.timeService.createNewDate();

      const weight: Weight = { id: 0, value: weightValue, date: dateValue };

      if (this._utilityService.isNumber(weight.value)) {
        this.weightService.postWeight(weight).subscribe(() => {
          this.openSnackBar(this.keyService.getString("w2"), null);
          this.getWeightsFromService();
        });
      } else {
        console.warn("saveWeight(): ID: " + weight.value + ", expected number");
      }
    } else {
      console.warn(
        "saveWeight(): Value: " +
          this.form.getRawValue().weight +
          ", expected Value"
      );
    }
  }

  // Remove selected weight from the database
  removeWeight(weight: Weight) {
    if (weight !== undefined) {
      if (this._utilityService.isNumber(weight.id)) {
        if (window.confirm(this.keyService.getString("a1"))) {
          this.weightService.deleteWeight(weight.id).subscribe(() => {
            this.openSnackBar(this.keyService.getString("w3"), null);
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
   * OTHER WEIGHT OPERATIONS
   * ===================================================================================
   */

  showMoreWeights() {
    if (this.moreWeightsThanDisplayed()) {
      this.displayedWeights += 10;
    } else {
      console.log(this.keyService.getString("a21"));
    }
  }

  showLessWeights() {
    if (this.displayedWeights > 10) {
      this.displayedWeights -= 10;
    } else {
      console.log(this.keyService.getString("a22"));
    }
  }

  moreWeightsThanDisplayed() {
    if (this.weights.length - this.displayedWeights > 0) {
      return true;
    }

    return false;
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
    let tempDate: Date = this.timeService.createNewDate();
    let milliseconds: number =
      tempDate.getTime() - new Date(this.getLatestWeight().date).getTime();

    return Math.floor(milliseconds / (1000 * 60 * 60 * 24));
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
  getStatusColorValue(weight: Weight): string {
    let highestValue: number = this.getHighestWeightValue();
    if (weight.value == highestValue) {
      return this.keyService.getColor("darkgreen");
    }

    let lowestValue: number = this.getLowestWeightValue();
    if (weight.value == lowestValue) {
      return this.keyService.getColor("red");
    }

    let averageValue: number = this.getAverageWeightValue();
    if (weight.value <= averageValue + 1 && weight.value >= averageValue - 1) {
      return this.keyService.getColor("yellow");
    }

    if (weight.value < averageValue - 1) {
      return this.keyService.getColor("orange");
    }

    if (weight.value > averageValue + 1) {
      return this.keyService.getColor("lightgreen");
    }

    return this.keyService.getColor("darkgray");
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
}
