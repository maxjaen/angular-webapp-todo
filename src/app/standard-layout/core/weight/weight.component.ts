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
import { map, tap } from 'rxjs/operators';

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

  private getWeightsFromService() {
    this.weightService
      .getAllWeights()
      .pipe(
        tap((weights) => {
          this.initGraphData(weights);
        }),
        map((weights) => {
          return weights.sort((a, b) =>
            this.utilityService.sortNumerical(
              Date.parse(a.date.toString()),
              Date.parse(b.date.toString())
            )
          );
        })
      )
      .subscribe((weights) => {
        this.weights = weights;
      });
  }

  public saveWeight() {
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

  private initGraphData(weights: Weight[]) {
    this.graphData = this.graphDataService.initGraphDataForWeights(
      weights.slice(0, this.displayedWeights)
    );
  }

  /**
   * Remove selected weight from the database
   * @param weight to be removed
   */
  public removeWeight(weight: Weight) {
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

  public showMoreWeights() {
    if (this.moreWeightsThanDisplayed()) {
      this.displayedWeights += 10;
      this.initGraphData(this.weights);
    } else {
      console.log(this.keyService.getKeyTranslation('a21'));
    }
  }

  public showLessWeights() {
    if (this.displayedWeights > 10) {
      this.displayedWeights -= 10;
      this.initGraphData(this.weights);
    } else {
      console.log(this.keyService.getKeyTranslation('a22'));
    }
  }

  public moreWeightsThanDisplayed() {
    return this.weights.length - this.displayedWeights > 0;
  }

  /**
   * Get the latest weight measurement
   */
  private getLatestWeight(): Weight {
    return this.weights.sort((a, b) =>
      this.utilityService.sortNumerical(a.id, b.id)
    )[0];
  }

  /**
   * Get the number of days since last training session
   */
  public getDaysSinceLastWeight(): number {
    const tempDate: Date = this.timeService.createNewDate();
    const milliseconds: number =
      tempDate.getTime() - new Date(this.getLatestWeight().date).getTime();

    return Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate BMI index for latest weight
   */
  public calculateBMI() {
    if (this.weights.length !== 0) {
      return (+this.getLatestWeight().value / (1.85 * 1.85)).toFixed(2);
    }

    return -1;
  }

  /**
   * Get lowest weight value of all weight data
   */
  private getLowestWeightValue(): number {
    return this.weights
      .map((weight) => weight.value)
      .sort(this.utilityService.sortNumerical)[this.weights.length - 1];
  }

  /**
   * Get average data value from all weight data
   */
  private getAverageWeightValue(): number {
    return (
      this.weights.map((e) => +e.value).reduce((a, b) => a + b, 0) /
      this.weights.length
    );
  }

  /**
   * Get highest weight value of all weight data
   */
  private getHighestWeightValue(): number {
    return this.weights
      .map((weight) => weight.value)
      .sort(this.utilityService.sortNumerical)[0];
  }

  /**
   * Get backround color for different weight intervals
   * @param weight to set the background color for
   * @returns backround color
   */
  public getStatusColorValue(weight: Weight): string {
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

  /**
   * Opens popup menu to show new notifications on user interface
   * @param message to be displayed
   * @param action to be taken
   */
  private displayNotification(message: string, action: string) {
    this.snackBarService.open(message, action, {
      duration: 2000,
    });
  }
}
