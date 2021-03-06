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
  timer:Subscription = new Subscription();
  dateTimeFormatter = DateTime.TIME_SIMPLE;

  constructor(private electronService: ElectronService, private changeDetection: ChangeDetectorRef) {
  }

  ngOnInit(): void {    
    this.electronService.ipcRenderer.once('csv data response', (event, csv_data) => {
      for (let i = 1; i < csv_data.length; i++) {
        let script_info = csv_data[i]
        this.scripts.push(new ScheduledScript(
          DateTime.fromISO(script_info[0]),
          script_info[1],
          script_info[2],
          script_info[3],
          script_info[4]
        ));
      }
      this.scripts.sort((a,b) => a.timeToRun.toMillis() - b.timeToRun.toMillis())
      this.changeDetection.detectChanges();

      this.timer = timer(0, 1*60*1000).subscribe( _ => {
        console.log('Checking for scripts to run.')
        this.runScriptsIfIsTime()
        console.log('Ran any scripts that were time to run')
      })
    });
    this.electronService.ipcRenderer.send('csv data');
  }

  runScriptsIfIsTime(): void {
    let hasSameHourAndSameMinuteAsNow = function(a:DateTime): boolean {
      let now = DateTime.now()
      return (now.hour === a.hour) && (now.minute === a.minute)
    }
    this.scripts.forEach((script, index) => {
      if (hasSameHourAndSameMinuteAsNow(script.timeToRun)) {
        this.electronService.ipcRenderer.send("shell command", script.commandWorkingDirectory, script.commandToRun)
        console.log(`Ran this command: "${script.commandToRun}"`)
      }
    })
  }

  trackScript(index: number, script:ScheduledScript) {
    return script.name + script.description;
  }
}
