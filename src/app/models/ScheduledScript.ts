import * as moment from 'moment';

export class ScheduledScript {
    
    timeToRun:moment.Moment;
    name:string;
    description:string;
    commandToRun:string;

    constructor(timeToRun:moment.Moment, name:string, description:string, commandToRun:string) {
        this.timeToRun = timeToRun
        this.name = name
        this.description = description
        this.commandToRun = commandToRun
    }
}