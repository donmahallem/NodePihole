import { Component } from '@angular/core';

@Component({
  selector: 'div.content-wrapper',
  template: require("pug-loader!./pihole-content.component.pug")()
})
export class PiholeContentComponent {
}
 