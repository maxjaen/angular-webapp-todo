import { Task } from '../../tasks/model/task';

export class TimeTask {
  id: number;
  title: string;
  shortdescr: string;
  longdescr: string;
  startdate: Date;
  enddate: Date;
  running?: boolean;
  task?: Task;
}
