import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { ScheduledScript } from 'src/app/models/ScheduledScript'

import { ElectronService } from 'ngx-electron';
import { Subscription, timer } from 'rxjs';
import { DateTime } from 'luxon';
import { IpcRenderer } from 'electron';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  scripts:ScheduledScript[] = [];
  // [
  //   new ScheduledScript(
  //     DateTime.now(),
  //     "Backup iTunes Library",
  //     "Runs a python script to copy my iTunes .itl Library file into my Google Drive",
  //     "echo hi i'm gay"
  //   ),
  //   new ScheduledScript(
  //     DateTime.now().minus({minutes: 15}),
  //     "other thing",
  //     "other description",
  //     "echo hi i'm actually gay"
  //   )
  // ];
  timer:Subscription = new Subscription();
  dateTimeFormatter = DateTime.TIME_SIMPLE;
  private ipc: IpcRenderer;

  constructor(private electronService: ElectronService, private changeDetection: ChangeDetectorRef) {
    this.ipc = (<any>window).require('electron').ipcRenderer
  }

  ngOnInit(): void {
    this.electronService.ipcRenderer.on("csv data", (event, args) => {
      console.log("csv data pass")
      console.log(args);
    });
    
    this.ipc.once('csv data response', (event, csv_data) => {
      for (let i = 1; i < csv_data.length; i++) {
        let script_info = csv_data[i]
        this.scripts.push(new ScheduledScript(
          DateTime.fromISO(script_info[0]),
          script_info[1],
          script_info[2],
          script_info[3]
        ));
      }
      this.changeDetection.detectChanges();
    });
    this.ipc.send('csv data');

    console.log(this.scripts)


    this.scripts.sort((a,b) => a.timeToRun.toMillis() - b.timeToRun.toMillis())
    this.timer = timer(0, 1*60*1000).subscribe( _ => {
      console.log('Checking for scripts to run.')
      this.runScriptsIfIsTime()
      console.log('Ran any scripts that were time to run')
    })
  }

  hasSameHourAndSameMinuteAsNow(a:DateTime): boolean {
    let now = DateTime.now()
    return (now.hour === a.hour) && (now.minute === a.minute)
  }

  runScriptsIfIsTime(): void {
    this.scripts.forEach((script, index) => {
      if (this.hasSameHourAndSameMinuteAsNow(script.timeToRun)) {
        this.electronService.ipcRenderer.send("shell command", script.commandToRun)
      }
    })
  }

  trackScript(index: number, script:ScheduledScript) {
    return script.name + script.description;
  }
}
