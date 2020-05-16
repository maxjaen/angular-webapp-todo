import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TrainingComponent } from "./core/training/exercise.component";
import { TrainingViewComponent } from "./core/training/components/training-view/training-view.component";
import { TimeTaskComponent } from "./core/timetask/timetask.component";
import { WeightComponent } from "./core/weight/weight.component";
import { TasksComponent } from "./core/tasks/tasks.component";
import { HttpClientModule } from "@angular/common/http";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { InsertTaskDialog } from "./core/tasks/dialogs/insert-task-dialog";
import { InsertTaskDialogTime } from "./core/timetask/dialogs/insert-task-dialog";
import { NgxTimerModule } from "ngx-timer";
import { AmazingTimePickerModule } from "amazing-time-picker";
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
} from "@angular/material";
import { SettingsComponent } from "./core/settings/settings.component";
import { SessionComponent } from "./core/session/session.component";
import { DashboardComponent } from "./core/dashboard/dashboard.component";

@NgModule({
  declarations: [
    TrainingComponent,
    TasksComponent,
    TimeTaskComponent,
    WeightComponent,
    InsertTaskDialog,
    InsertTaskDialogTime,
    TrainingViewComponent,
    SettingsComponent,
    SessionComponent,
    DashboardComponent,
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
  ],
  exports: [
    TrainingComponent,
    TasksComponent,
    TimeTaskComponent,
    WeightComponent,
    TrainingViewComponent,
  ],
  entryComponents: [InsertTaskDialog, InsertTaskDialogTime],
})
export class StandardLayoutModule {}
