import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-mechanic-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './mechanic-layout.component.html',
  styleUrl: './mechanic-layout.component.css'
})
export class MechanicLayoutComponent {}