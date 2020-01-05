import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingComponent } from './training/exercise.component';
import { TrainingViewComponent } from './training/components/training-view/training-view.component';
import { TimeTaskComponent } from './timetask/timetask.component';
import { WeightComponent } from './weight/weight.component';
import { TasksComponent} from './tasks/tasks.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { InsertTaskDialog } from './tasks/dialogs/insert-task-dialog';
import { InsertTaskDialogTime } from './timetask/dialogs/insert-task-dialog';
import { RemoveTaskDialog } from './tasks/dialogs/remove-task-dialog';
import { NgxTimerModule } from 'ngx-timer';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';

@NgModule({
  declarations: [TrainingComponent, TasksComponent, TimeTaskComponent, WeightComponent, InsertTaskDialog, InsertTaskDialogTime, RemoveTaskDialog, TrainingViewComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    NgxTimerModule,

     // Material
     MatAutocompleteModule,
     MatButtonModule,
     MatButtonToggleModule,
     MatCardModule,
     MatCheckboxModule,
     MatChipsModule,
     MatDatepickerModule,
     MatDialogModule,
     MatExpansionModule,
     MatGridListModule,
     MatIconModule,
     MatInputModule,
     MatListModule,
     MatMenuModule,
     MatProgressBarModule,
     MatProgressSpinnerModule,
     MatRadioModule,
     MatRippleModule,
     MatSelectModule,
     MatSidenavModule,
     MatSlideToggleModule,
     MatSliderModule,
     MatSnackBarModule,
     MatStepperModule,
     MatTableModule,
     MatTabsModule,
     MatToolbarModule,
     MatTooltipModule,
     MatNativeDateModule,
  ],
   exports: [
    TrainingComponent,
    TasksComponent,
    TimeTaskComponent,
    WeightComponent,
    TrainingViewComponent
  ],
  entryComponents: [
    InsertTaskDialog,
    InsertTaskDialogTime,
    RemoveTaskDialog
  ]
})
export class StandardLayoutModule { }
