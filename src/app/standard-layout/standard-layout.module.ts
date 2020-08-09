import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingOverViewComponent } from './core/training/training-overview.component';
import { TrainingDetailViewComponent } from './core/training/components/training-detailview/training-detailview.component';
import { TimeTaskComponent } from './core/timetask/timetask.component';
import { WeightComponent } from './core/weight/weight.component';
import { TasksComponent } from './core/tasks/tasks.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InsertTaskDialog } from './core/tasks/dialogs/insert-task-dialog';
import { InsertTaskDialogTime } from './core/timetask/dialogs/insert-task-dialog';
import { NgxTimerModule } from 'ngx-timer';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { DragDropModule } from '@angular/cdk/drag-drop';
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
  MatTooltipModule,
} from '@angular/material';
import { SettingsComponent } from './core/settings/settings.component';
import { SessionComponent } from './core/session/session.component';
import { DashboardComponent } from './core/dashboard/dashboard.component';
import { ExerciseOverViewComponent } from './core/exercise/exercise-overview.component';
import { ExerciseDetailviewComponent } from './core/exercise/components/exercise-detailview/exercise-detailview.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PinViewComponent } from './core/tasks/views/pin-view/pin-view.component';
import { ProjectViewComponent } from './core/tasks/views/project-view/project-view.component';

@NgModule({
  declarations: [
    TrainingOverViewComponent,
    TasksComponent,
    TimeTaskComponent,
    WeightComponent,
    InsertTaskDialog,
    InsertTaskDialogTime,
    TrainingDetailViewComponent,
    SettingsComponent,
    SessionComponent,
    DashboardComponent,
    ExerciseOverViewComponent,
    ExerciseDetailviewComponent,
    PinViewComponent,
    ProjectViewComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    NgxTimerModule,
    AmazingTimePickerModule,

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
    DragDropModule,

    // ngx-charts
    BrowserAnimationsModule,
    NgxChartsModule,
  ],
  exports: [
    TasksComponent,
    TimeTaskComponent,
    WeightComponent,
    TrainingOverViewComponent,
    TrainingDetailViewComponent,
    ExerciseOverViewComponent,
  ],
  entryComponents: [InsertTaskDialog, InsertTaskDialogTime],
})
export class StandardLayoutModule {}
