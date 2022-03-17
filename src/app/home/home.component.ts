import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  apps: any[] = [
    {
      logo: 'assets/img/boli.png',
      name: 'Boli',
      website: 'https://www.bolilove.com',
      description: 'The best dating arround; no kidding',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
