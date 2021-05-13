import { Component, OnInit } from '@angular/core';

import { ScheduledScript } from 'src/app/models/ScheduledScript'

import { ElectronService } from 'ngx-electron';
import { Subscription, timer } from 'rxjs';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  scripts:ScheduledScript[] = [
    new ScheduledScript(
      DateTime.now(),
      "Backup iTunes Library",
      "Runs a python script to copy my iTunes .itl Library file into my Google Drive",
      "echo hi i'm gay"
    ),
    new ScheduledScript(
      DateTime.now().minus({minutes: 15}),
      "other thing",
      "other description",
      "echo hi i'm actually gay"
    )
  ];
  timer:Subscription = new Subscription();
  dateTimeFormatter = DateTime.TIME_SIMPLE;

  constructor(private electronService: ElectronService) { }

  ngOnInit(): void {
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

}
