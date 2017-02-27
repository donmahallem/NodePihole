import {
    NgModule,
    ModuleWithProviders
} from '@angular/core';
import { BoxDirective } from "./directives/box.directive";
import { BoxBodyDirective } from "./directives/box-body.directive";
import { BoxBodyToggleDirective } from "./directives/box-body-toggle.directive";


@NgModule({
    declarations: [
        BoxDirective,
        BoxBodyDirective,
        BoxBodyToggleDirective],
    exports: [
        BoxDirective,
        BoxBodyDirective,
        BoxBodyToggleDirective]
})
export class BoxModule {
    public static forRoot(): ModuleWithProviders {
        return { ngModule: BoxModule, providers: [] };
    }
}