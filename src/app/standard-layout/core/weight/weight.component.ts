import { Component, OnInit } from '@angular/core';
import { Weight } from './model/weight';
import { WeightService } from '../../shared/services/core/weight.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { KeyService } from '../../shared/services/utils/key.service';
import { NumberValueGraph } from '../../shared/model/GraphData';
import { GraphDataService } from '../../shared/services/utils/graph.service';
import { Title } from '@angular/platform-browser';
import { map, tap } from 'rxjs/operators';
import { Color } from '../../shared/model/Enums';
import { newDate } from '../../shared/utils/TimeUtils';
import { isNumber, sortNumerical } from '../../shared/utils/CommonUtils';
import { NotificationService } from '../../shared/services/utils/notification.service';

const DEFAULT_DISPLAYABLE_WEIGHTS = 15;

@Component({
    selector: 'app-weight',
    templateUrl: './weight.component.html',
    styleUrls: ['./weight.component.scss'],
})
export class WeightComponent implements OnInit {

    public displayedWeights = DEFAULT_DISPLAYABLE_WEIGHTS;
    public weights: Weight[];
    public graphData: NumberValueGraph[] = [];
    public form = new FormGroup({
        weight: new FormControl('', [Validators.required]),
    });

    constructor(
        private graphDataService: GraphDataService,
        private weightService: WeightService,
        private keyService: KeyService,
        private notificationService: NotificationService,
        private title: Title
    ) {}

    ngOnInit() {
        this.getWeightsFromService();
        this.title.setTitle(this.keyService.getKeyTranslation('w1'));
    }

    public saveWeight() {
        if (this.form.getRawValue().weight !== '') {
            const weightValue: number = this.form.getRawValue().weight;
            const dateValue: Date = newDate();

            const weight: Weight = {
                id: 0,
                value: weightValue,
                date: dateValue,
            };

            if (isNumber(weight.value)) {
                this.weightService.postWeight(weight).subscribe(() => {
                    this.notificationService.displayNotification(
                        this.keyService.getKeyTranslation('w2'),
                        null
                    );
                    this.getWeightsFromService();
                });
            } else {
                console.warn(
                    'saveWeight(): ID: ' + weight.value + ', expected number'
                );
            }
        } else {
            console.warn(
                'saveWeight(): Value: ' +
                    this.form.getRawValue().weight +
                    ', expected Value'
            );
        }
    }

    /**
     * Change the date of a weight measurement.
     *
     * @param weight The weight has a date property which wil be changed.
     */
    public changeDate(event: any, weight: Weight) {
        const oldDate: Date = new Date(weight.date);
        const date: Date = new Date(event.value);
        oldDate.setDate(date.getDate());
        oldDate.setHours(date.getHours());
        oldDate.setFullYear(date.getFullYear());
        weight.date = oldDate;

        this.weightService.putWeight(weight).subscribe();
    }

    /**
     * Delete selected weight from the database.
     *
     * @param weight The weight data value that should be deleted form the database.
     */
    public removeWeight(weight: Weight) {
        if (weight !== undefined) {
            if (isNumber(weight.id)) {
                if (window.confirm(this.keyService.getKeyTranslation('a11'))) {
                    this.weightService.deleteWeight(weight.id).subscribe(() => {
                        this.notificationService.displayNotification(
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

    /**
     * Checks if more weights than currently can be displayed to the user on the user interface
     */
    public moreWeightsThanDisplayed(): boolean {
        return this.weights.length - this.displayedWeights > 0;
    }

    /**
     * Get the number of days since last training session
     */
    public getDaysSinceLastWeight(): number {
        const tempDate: Date = newDate();
        const milliseconds: number =
            tempDate.getTime() -
            new Date(this.getLatestWeight().date).getTime();

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
     * Get the background color for different weight intervals.
     *
     * @param weight to set the background color for
     * @returns background color
     */
    public setBorderColor(weight: Weight): string {
        const highestValue: number = this.getHighestWeightValue();
        if (weight.value === highestValue) {
            return this.keyService.getColor(Color.PURPLE);
        }

        const lowestValue: number = this.getLowestWeightValue();
        if (weight.value === lowestValue) {
            return this.keyService.getColor(Color.PURPLE);
        }

        const averageValue: number = this.getAverageWeightValue();
        if (
            weight.value <= averageValue + 1 &&
            weight.value >= averageValue - 1
        ) {
            return this.keyService.getColor(Color.YELLOW);
        }

        if (weight.value < averageValue - 1) {
            return this.keyService.getColor(Color.RED);
        }
        if (weight.value > averageValue + 1) {
            return this.keyService.getColor(Color.GREEN);
        }

        return this.keyService.getColor(Color.BLUE);
    }

    private getWeightsFromService() {
        this.weightService
            .getAllWeights()
            .pipe(
                tap((weights) => {
                    this.initGraphData(weights);
                }),
                map((weights) =>
                    weights.sort((a, b) =>
                        sortNumerical(
                            Date.parse(a.date.toString()),
                            Date.parse(b.date.toString())
                        )
                    )
                )
            )
            .subscribe((weights) => {
                this.weights = weights;
            });
    }

    private initGraphData(weights: Weight[]) {
        this.graphData = this.graphDataService.initGraphDataForWeights(
            weights.slice(0, this.displayedWeights)
        );
    }

    /**
     * Get the latest weight measurement
     */
    private getLatestWeight(): Weight {
        return this.weights.sort((a, b) => sortNumerical(a.id, b.id))[0];
    }

    /**
     * Get lowest weight value of all weight data
     */
    private getLowestWeightValue(): number {
        return this.weights.map((weight) => weight.value).sort(sortNumerical)[
            this.weights.length - 1
        ];
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
            .sort(sortNumerical)[0];
    }
}
