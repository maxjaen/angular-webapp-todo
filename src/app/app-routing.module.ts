import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TasksComponent } from "./standard-layout/tasks/tasks.component";
import { TrainingComponent } from "./standard-layout/training/exercise.component";
import { DashboardComponent } from "./basic-layout/dashboard/dashboard.component";
import { TimeTaskComponent } from "./standard-layout/timetask/timetask.component";
import { TrainingViewComponent } from "./standard-layout/training/components/training-view/training-view.component";
import { WeightComponent } from "./standard-layout/weight/weight.component";
import { LandingPageComponent } from "./standard-layout/landing-page/landing-page.component";
import { SessionComponent } from "./standard-layout/session/session.component";
import { SettingsComponent } from "./standard-layout/settings/settings.component";

const routes: Routes = [
  {
    path: "",
    component: LandingPageComponent,
  },
  {
    path: "startpage",
    component: LandingPageComponent,
  },
  {
    path: "settings",
    component: SettingsComponent,
  },
  {
    path: "tasks",
    component: TasksComponent,
  },
  {
    path: "training",
    component: TrainingComponent,
  },
  {
    path: "training/:id",
    component: TrainingViewComponent,
  },
  {
    path: "timetask",
    component: TimeTaskComponent,
  },
  {
    path: "weight",
    component: WeightComponent,
  },
  {
    path: "session",
    component: SessionComponent,
  },
  {
    path: "overview",
    component: DashboardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
