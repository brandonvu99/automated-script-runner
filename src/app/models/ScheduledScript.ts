import { DateTime } from 'luxon';

export class ScheduledScript {
    
    timeToRun:DateTime;
    name:string;
    description:string;
    commandWorkingDirectory:string;
    commandToRun:string;

    constructor(timeToRun:DateTime, name:string, description:string, commandWorkingDirectory:string, commandToRun:string) {
        this.timeToRun = DateTime.now()
        this.name = name
        this.description = description
        this.commandToRun = commandToRun
        this.commandWorkingDirectory = commandWorkingDirectory;
    }
}