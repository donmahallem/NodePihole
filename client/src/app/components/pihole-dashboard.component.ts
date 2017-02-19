import { Component } from '@angular/core';


@Component({
  template: require("pug-loader!./pihole-dashboard.component.pug")()
})
export class PiholeDashboardComponent {
}