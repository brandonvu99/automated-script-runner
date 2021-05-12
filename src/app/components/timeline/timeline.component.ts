import { Component, OnInit } from '@angular/core';

import { ScheduledScript } from 'src/app/models/ScheduledScript'

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  scripts:ScheduledScript[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
