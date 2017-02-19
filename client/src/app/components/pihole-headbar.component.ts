import { Component } from '@angular/core';

@Component({
  selector: 'pihole-headbar',
  template: require("pug-loader!./pihole-headbar.component.pug")()
})
export class PiholeHeadbarComponent {
}
 