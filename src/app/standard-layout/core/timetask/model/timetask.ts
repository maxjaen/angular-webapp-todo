import { Task } from '../../tasks/model/task';

export class TimeTask {
  id: number;
  title: string;
  shortDescription: string;
  longDescription: string;
  startDate: Date;
  endDate: Date;
  running?: boolean;
  task?: Task;
}
