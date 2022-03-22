import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss'],
})
export class PolicyComponent implements OnInit {
  lastPolicyUpdateDate = new Date(2022, 2, 18);
  numeriixEmail = 'numeriix@gmail.com';

  constructor() {}

  ngOnInit(): void {}
}
