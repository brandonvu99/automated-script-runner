import { Component, Input, OnInit } from '@angular/core';
import { ScheduledScript } from 'src/app/models/ScheduledScript';

import { DateTime } from 'luxon';

@Component({
  selector: '[app-timeline-item]',
  templateUrl: './timeline-item.component.html',
  styleUrls: ['./timeline-item.component.scss']
})
export class TimelineItemComponent implements OnInit {

  @Input() script!: ScheduledScript;
  dateTimeFormatter = DateTime.TIME_SIMPLE;

  constructor() { }

  ngOnInit(): void {
  }

}
