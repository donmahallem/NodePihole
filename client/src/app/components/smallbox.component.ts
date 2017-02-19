import { Component, Input } from '@angular/core';

@Component({
  selector: 'div.small-box[smallbox]',
  template: require("pug-loader!./smallbox.component.pug")(),
  styleUrls: ['./smallbox.component.css']
})
export class SmallboxComponent {
	@Input("box-title") boxTitle: string ="" ;
	@Input("box-subtitle") boxSubtitle: string =null;
	@Input("box-icon") boxIcon: string=null;
	@Input("loading") isLoading:boolean=true;
}
 