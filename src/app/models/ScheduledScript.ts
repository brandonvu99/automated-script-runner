import { DateTime } from 'luxon';

export class ScheduledScript {
    
    timeToRun:DateTime;
    name:string;
    description:string;
    commandToRun:string;

    constructor(timeToRun:DateTime, name:string, description:string, commandToRun:string) {
        this.timeToRun = timeToRun
        this.name = name
        this.description = description
        this.commandToRun = commandToRun
    }
}