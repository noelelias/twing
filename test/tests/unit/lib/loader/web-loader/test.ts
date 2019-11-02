import * as tape from 'tape';
import { TwingWebLoader } from "../../../../../../src/lib/loader/web-loader";
import { TwingEnvironment } from '../../../../../../src/main';
import tsNode = require('ts-node');
import path = require('path');
import fs = require('fs');
import { JSDOM } from 'jsdom';

//demo data
const template = 
`shouldBeTemplate1[{% include 'template1.twing' %}]
shouldBeTemplate2[{% include 'template2.twing' %}]
shouldNotKnowTemplate3[{% include 'template3.twing' %}]
templateWithSub[{% include 'templateWithSub.twing' %}]
dom pong => ping[{{ pong|dom('pong.n1') }}]
dom pong => ping[{{ pong|dom('pongN2') }}]`;

const expectedTemplate = 
`shouldBeTemplate1[template1 loaded]
shouldBeTemplate2[template2 loaded]
shouldNotKnowTemplate3[dont know this template]
templateWithSub[templateWithSub loaded [sub template loaded]]
dom pong =&gt; ping[this is pong.n1]
dom pong =&gt; ping[this is pongN2]`;

const data = {pong:'ping'};
const webLoader = (path:string)=>{
    return new Promise<string>((resolve)=>{
        switch(path){
            case 'template1.twing':
                resolve('template1 loaded');
                break;
            case 'template2.twing':
                resolve('template2 loaded');
                break;
            case 'templateWithSub.twing':
                resolve('templateWithSub loaded [{% include "templateSub.twing" %}]');
                break;
            case 'templateSub.twing':
                resolve('sub template loaded');
                break;
            default:
                resolve('dont know this template');
        }
    });
}

tape('loader web loader', (test) => {
    let loader = TwingWebLoader.getNewInstance(webLoader,template,data);

    test.test('templates output', (test) =>{
        loader((loader)=>{
            var env = loader.domPreCompile();

            var res = env.createTemplate(template, 'main').render(data);

            const {window:{document}} = new JSDOM();
            require('incremental-dom').patch(document.querySelectorAll('body')[0], ()=>{
                let domTree = loader.domRender(res, document);
                domTree.pong.n1('this is pong.n1');
                domTree.pongN2('this is pongN2');
                let result = document.querySelectorAll('body')[0].innerHTML;
                test.equal(result, expectedTemplate);
                test.end();
            });
        });
    });
    test.end();
});
