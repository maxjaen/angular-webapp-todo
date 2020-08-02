import { Component, OnInit } from '@angular/core';
import { Weight } from './model/weight';
import { WeightService } from '../../shared/services/core/weight.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { UtilityService } from '../../shared/services/utils/utility.service';
import { KeyService } from '../../shared/services/utils/key.service';
import { TimeService } from '../../shared/services/utils/time.service';
import { NameAndNumberPair } from '../../shared/model/GraphData';
import { GraphDataService } from '../../shared/services/utils/graph.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-weight',
  templateUrl: './weight.component.html',
  styleUrls: ['./weight.component.scss'],
})
export class WeightComponent implements OnInit {
  weights: Weight[];
  graphData: NameAndNumberPair[] = [];

  displayedWeights = 15;
  form = new FormGroup({
    weight: new FormControl('', [Validators.required]),
  });

  constructor(
    private utilityService: UtilityService,
    private timeService: TimeService,
    private graphDataService: GraphDataService,
    private weightService: WeightService,
    private keyService: KeyService,
    private snackBarService: MatSnackBar,
    private tabTitleService: Title
  ) {}

  ngOnInit() {
    this.getWeightsFromService();

    this.tabTitleService.setTitle(this.keyService.getKeyTranslation('w1'));
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
      weights.sort((a, b) =>
        this.utilityService.sortNumerical(
          Date.parse(a.date.toString()),
          Date.parse(b.date.toString())
        )
      );

      this.weights = weights;
      this.initGraphData();
    });
  }

  private initGraphData() {
    this.graphData = this.graphDataService.initGraphDataForWeights(
      this.weights.slice(0, this.displayedWeights)
    );
  }

  /*
   * ===================================================================================
   * CRUD OPERATIONS
   * ===================================================================================
   */

  // Save weight into the database
  saveWeight() {
    if (this.form.getRawValue().weight !== '') {
      const weightValue: number = this.form.getRawValue().weight;
      const dateValue: Date = this.timeService.createNewDate();

      const weight: Weight = { id: 0, value: weightValue, date: dateValue };

      if (this.utilityService.isNumber(weight.value)) {
        this.weightService.postWeight(weight).subscribe(() => {
          this.displayNotification(
            this.keyService.getKeyTranslation('w2'),
            null
          );
          this.getWeightsFromService();
        });
      } else {
        console.warn('saveWeight(): ID: ' + weight.value + ', expected number');
      }
    } else {
      console.warn(
        'saveWeight(): Value: ' +
          this.form.getRawValue().weight +
          ', expected Value'
      );
    }
  }

  // Remove selected weight from the database
  removeWeight(weight: Weight) {
    if (weight !== undefined) {
      if (this.utilityService.isNumber(weight.id)) {
        if (window.confirm(this.keyService.getKeyTranslation('a11'))) {
          this.weightService.deleteWeight(weight.id).subscribe(() => {
            this.displayNotification(
              this.keyService.getKeyTranslation('w3'),
              null
            );
            this.getWeightsFromService();
          });
        }
      } else {
        console.warn(`removeTask(): ID: ${weight.id}, expected number`);
      }
    } else {
      console.warn(`removeTask(): ID: ${weight.id}, expected ID`);
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
      this.initGraphData();
    } else {
      console.log(this.keyService.getKeyTranslation('a21'));
    }
  }

  showLessWeights() {
    if (this.displayedWeights > 10) {
      this.displayedWeights -= 10;
      this.initGraphData();
    } else {
      console.log(this.keyService.getKeyTranslation('a22'));
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
    return this.weights.sort((a, b) =>
      this.utilityService.sortNumerical(a.id, b.id)
    )[0];
  }

  // Get the number of days since last training session
  getDaysSinceLastWeight(): number {
    const tempDate: Date = this.timeService.createNewDate();
    const milliseconds: number =
      tempDate.getTime() - new Date(this.getLatestWeight().date).getTime();

    return Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  }

  // Calculate BMI index
  calculateBMI() {
    if (this.weights.length !== 0) {
      return (+this.getLatestWeight().value / (1.85 * 1.85)).toFixed(2);
    }

    return -1;
  }

  // Get lowest weight value of all weight data
  getLowestWeightValue(): number {
    return this.weights
      .map((weight) => weight.value)
      .sort(this.utilityService.sortNumerical)[this.weights.length - 1];
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
      .sort(this.utilityService.sortNumerical)[0];
  }

  // Get backround color for different weight intervals
  // Return backround color
  getStatusColorValue(weight: Weight): string {
    const highestValue: number = this.getHighestWeightValue();
    if (weight.value === highestValue) {
      return this.keyService.getColor('darkgreen');
    }

    const lowestValue: number = this.getLowestWeightValue();
    if (weight.value === lowestValue) {
      return this.keyService.getColor('red');
    }

    const averageValue: number = this.getAverageWeightValue();
    if (weight.value <= averageValue + 1 && weight.value >= averageValue - 1) {
      return this.keyService.getColor('yellow');
    }

    if (weight.value < averageValue - 1) {
      return this.keyService.getColor('orange');
    }

    if (weight.value > averageValue + 1) {
      return this.keyService.getColor('lightgreen');
    }

    return this.keyService.getColor('darkgray');
  }

  /*
   * ===================================================================================
   * HELPER FUNCTIONS
   * ===================================================================================
   */

  // Opens popup menu for notifications
  displayNotification(message: string, action: string) {
    this.snackBarService.open(message, action, {
      duration: 2000,
    });
  }
}
