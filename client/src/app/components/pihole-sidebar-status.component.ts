import { Component } from '@angular/core';

@Component({
  selector: 'pihole-sidebar-status',
  template: require("pug-loader!./pihole-sidebar-status.component.pug")()
})
export class PiholeSidebarStatusComponent {
	$ctrl={};
}
 