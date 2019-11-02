import { Token } from "twig-lexer";
import { TwingLoaderArray } from "./array";
import { TwingLexer } from "../lexer";
import { TwingEnvironmentNode } from "../environment/node";
import { TwingLoaderNull } from "./null";
import { TwingEnvironment } from '../../main';
import {TwingFilter} from "../filter";
import Dom = require('incremental-dom');


/**
 * Loads template from a user defined function (made for the browser).
 *
 * @author Noel Schenk <schenknoel@gmail.com>
 */
export class TwingWebLoader extends TwingLoaderArray{
    readonly loader:(path:string)=>Promise<string>;
    private readonly isLoaded:Promise<void>; //doesn't load the template but contains the then function which fires once all the templates are loaded

    private constructor(loader:(path:string)=>Promise<string>, template:string, options:object = {}){
        super({'webLoader':'Templates are loaded using a WebLoader'});
        this.loader = loader;
        this.isLoaded = new Promise((resolve)=>{
            this.addTemplate(template, options).then(()=>{
                resolve();
            });
        });
    }

    /**
     * use this instead of new TwingWebLoader
     * @param loader
     * @param template 
     * @param options 
     */
    static getNewInstance(loader:(path:string)=>Promise<string>, template:string, options:object = {}){
        let newTwingWebLoader = new TwingWebLoader(loader,template,options);
        return ((cb:(twingWebLoader:TwingWebLoader)=>void) => newTwingWebLoader.then(newTwingWebLoader,cb));
    }

    /**
     * use then before accessing TwingWebLoader after init (done via getNewInstance)
     * @param thisTwingLoader passing the webloader otherwise the context/this is losed as we just return the function then
     * @param cb 
     */
    private then(thisTwingLoader:TwingWebLoader, cb:(twingWebLoader:TwingWebLoader)=>void){
        thisTwingLoader.isLoaded.then(()=>{
            cb(thisTwingLoader);
        });
    }

    private addTemplate(template:string, options:object = {}){
        let webTemplate = new WebTemplate({name:"template_" + Math.floor(Math.random() * 1000), source:template, options:options}); //maybe use getTemplateHash instead of math.floor
        return this.preLoadTemplates([webTemplate]).then((templates)=>{
            templates.forEach(template=>{
                this.setTemplate(template.name, template.source);
            });
        });
    }

    private preLoadTemplates(templates:WebTemplate[]){
        let allTemplates = templates.map(template=>{
            let lexedString:Token[] = new TwingLexer(new TwingEnvironmentNode(new TwingLoaderNull()), template.options).tokenize(template.source);
            let promisedTemplates = <Promise<WebTemplate[]>[]>lexedString.filter(v=>{return v.type.match(/(NAME|STRING)/)}).map((v:Token, i:number, tt:Token[])=>{
                let val:string = v.value || '';
                if(val.includes('include')){
                    return this.loadTemplate(tt[i+1].value);
                }else{
                    return null;
                }
            }).filter((v)=>{
                return v!=null;
            });
            return this.resolveTemplates(promisedTemplates);
        });
        return this.resolveTemplates(allTemplates);
    }

    private resolveTemplates(templates:Promise<WebTemplate[]>[]){
        return new Promise<WebTemplate[]>((resolve)=>{
            Promise.all(templates).then((loadedTemplates)=>{
                let allTemplates = new Array<WebTemplate>();
                loadedTemplates.map(loadedTemplateWithSubs=>{loadedTemplateWithSubs.map((loadedTemplate)=>{allTemplates = allTemplates.concat(loadedTemplate)})});
                resolve(allTemplates);
            });
        });
    }

    private loadTemplate(path:string):Promise<WebTemplate[]>{
        return new Promise<WebTemplate[]>((resolve)=>{
            this.loader(path).then((source)=>{
                let loadedTemplate = new Array(new WebTemplate({name:path, source:source}));
                this.preLoadTemplates(loadedTemplate).then((loadedTemplates)=>{ //load other templates needed by this template - recursive templates won't work
                    resolve(loadedTemplate.concat(loadedTemplates));
                });
            });
        });
    }

    /**
     * call this function to be able to render Dom elements
     */
    domPreCompile(){
        let twingEnv = new TwingEnvironment(this);
        let filter = new TwingFilter('dom', (...args)=>{
            return '{!' + args.join('.') + '!}';
        }, []);
        twingEnv.addFilter(filter);
        return twingEnv;
    }

    /**
     * will return a Text element from incremental-dom where you can modify the data to change the text
     * @param DOMTree 
     */
    domModify(DOMTree:DOMTree){
        return ProxyPath.getInstance((subNameCallArray)=>{
            let argsPos = subNameCallArray.indexOf('args');
            let callTree = subNameCallArray.slice(0,argsPos).join('.');
            let newText = subNameCallArray.slice(argsPos + 1)[0];
            DOMTree.filter(domItem=>domItem.name==callTree)[0].domObject.data = newText;
        }, true);
    }

    /**
     * Will render the full webpage with the incremental Dom
     * has to be used in a Browser
     * @param source source from domPreCompile
     */
    domRender(source:string, document?:Document){
        let DOMTree:DOMTree = [];
        let regex = /((.*?)({!)(.*?)(!})(.*?))|.*$/gms;
        let match;
        while((match = regex.exec(source))[0] !== ''){
            if(match[1] != undefined){ //if it's undefined its the last portion of the string
                this.domAddHtml(match[2], document);
                let varData = match[4].split('.'); //0 = the actual data everything else is the call tree
                DOMTree.push({data:varData[0], domObject:Dom.text(varData[0]), name:varData.slice(1).join('.')}); //join with dots since we use this as a seperator but can be used in a name
            }else{
                this.domAddHtml(match[0], document);
            }
        }
        return this.domModify(DOMTree);
    }

    /**
     * Add HTML to the Dom without the need of modifying it's content
     * @param content the content to add
     * @param document optional passing the document mainly used for testing it inside node with jsdom 
     */
    private domAddHtml(content:string, document?:Document) {
        const el = Dom.elementOpen('html-blob');
        Dom.skip()
        Dom.elementClose('html-blob');

        let template = document.createElement('template'); //https://stackoverflow.com/a/35385518/4563136
        content = content.trim();
        template.innerHTML = content;
        el.replaceWith(template.content.firstChild);
    }
}

type DOMTree = Array<{
    data:string;
    domObject:Text;
    name:string;
}>

type IWebTemplate = {
    name:string;
    source:string;
    options?:object;
}

class WebTemplate implements IWebTemplate{
    name:string;
    source:string;
    options?:object;
    constructor(params:IWebTemplate){
        this.name = params.name;
        this.source = params.source;
        this.options = params.options;

    }
}

class ProxyPath{
    static getInstance(cb:(subNameCallArray:Array<string>)=>any, hasArgs:boolean):any{
        let functions = {
            get(target:any, key:any):any{
                target().subName.push(key);
                return new Proxy(target, functions);
            },
            apply(target:any, key:any, args:any){
                hasArgs ? args.unshift("args"):undefined;
                let sendBack = cb(target().subName.concat(args)); //whatever cb is returning will be send back
                target().subName = []; //reset the element as it is no longer used
                return sendBack;
            }
        };
        let save = new ProxyPath.Save([]);
        return new Proxy(()=>{return save.load(save)}, functions);
    }
    static Save = class{
        subName:any;
      constructor(subName:any){
          this.subName = subName;
      }
      load(instance:this){
        return instance;
      }
    }
}