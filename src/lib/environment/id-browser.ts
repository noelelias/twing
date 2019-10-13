import { TwingEnvironmentBrowser } from "./browser";

/**
 * @author Noel Schenk <schenknoel@gmail.com>
 * incremental dom browser
 */
export class TwingEnvironmentIDBrowser extends TwingEnvironmentBrowser {
    idRender(name: string, context?: any):void{
        super.render(name, context);
    }
}
