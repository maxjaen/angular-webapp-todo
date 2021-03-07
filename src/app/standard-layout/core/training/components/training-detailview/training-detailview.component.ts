import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../../../../shared/services/core/training.service';
import { Training } from '../../model/training';
import { ActivatedRoute, Router } from '@angular/router';
import { Exercise } from '../../../exercise/model/exercise';
import { KeyService } from '../../../../shared/services/utils/key.service';
import { ExerciseService } from 'src/app/standard-layout/shared/services/core/exercise.service';
import { formatLocaleDateStr } from 'src/app/standard-layout/shared/utils/TimeUtils';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-training-detailview',
    templateUrl: './training-detailview.component.html',
    styleUrls: ['./training-detailview.component.scss'],
})
export class TrainingDetailViewComponent implements OnInit {

    public dataSource: Exercise[] = [];
    public displayedColumns: string[] = ['name', 'category', 'string'];
    public viewedTraining: Training;
    private viewedTrainingId: number;

    constructor(
        public exerciseService: ExerciseService,
        private keyService: KeyService,
        private trainingService: TrainingService,
        private activeRoute: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        this.initTrainingOnParamId();
    }

    /**
     * Navigate back to get an overview of all the available trainings.
     */
    public navigateToTrainingsOverview() {
        this.router.navigate(['/training']);
    }

    /**
     * @see formatLocaleDateStr
     */
    public toLocaleDateString(date: Date): string {
        return formatLocaleDateStr(date);
    }

    /**
     * Delete the viewed training from the database.
     */
    public removeTraining() {
        if (window.confirm(this.keyService.getKeyTranslation('a11'))) {
            this.activeRoute.params.subscribe((params) => {
                this.trainingService
                    .deleteTrainingByID(+params.id)
                    .subscribe(() => {
                        this.navigateToTrainingsOverview();
                    });
            });
        }
    }

    private initTrainingOnParamId() {
        this.activeRoute.params
            .pipe(
                tap((params) => {
                    this.viewedTrainingId = +params.id;
                })
            )
            .subscribe(() => {
                this.initTraining();
            });
    }

    private initTraining() {
        this.trainingService
            .getTrainingByID(this.viewedTrainingId)
            .pipe(
                tap((training) => {
                    this.viewedTraining = training;
                    this.dataSource = this.viewedTraining.exercises;
                })
            )
            .subscribe();
    }
}
