import { Component, inject, OnInit, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HighlightLoader } from 'ngx-highlightjs';
import { Highlight } from 'ngx-highlightjs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, Highlight, MatSlideToggleModule, MatButtonModule, MatCardModule, MatProgressSpinnerModule, EditorComponent, FormsModule, MatIconModule, MatTooltipModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  @ViewChild('codeFrame') codeFrame!: ElementRef;
  @ViewChild('output') outputDiv!: ElementRef;
  private hljsLoader: HighlightLoader = inject(HighlightLoader);
  title = 'js-runbook';
  lightTheme = true;
  Theme = 'Light'
  editorTheme = 'vs'

  showCard: boolean = false;
  isLoading: boolean = false;
  iframeUrl: any;
  variable: any;
  section: any;
  editorOptions = {
    language: 'javascript',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineHeight: 20,
    fontSize: 14,
    wordWrap: 'on',
    wrappingIndent: 'indent',
    theme: this.editorTheme,
  };

  code: any = ``;



  constructor(private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer, @Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/iframe.html`);
      console.log('Parent Origin:', window.location.origin);
    }
  }

  ngOnInit(): void {
    this.hljsLoader.setTheme('assets/styles/atom-one-light.css');
    const defaultTheme = 'light-theme';

    document.body.classList.add(defaultTheme);
    this.lightTheme = defaultTheme === 'light-theme';

    // Trigger change detection to ensure styles are applied
    this.cdr.detectChanges();
  }

  onAppThemeChange(event: any) {
    this.lightTheme = event.checked;
    this.lightTheme ? this.Theme = 'Light' : this.Theme = 'Dark';
    this.hljsLoader.setTheme(this.lightTheme ? 'assets/styles/atom-one-light.css' : 'assets/styles/atom-one-dark.css');
    const body = document.body;
    if (this.lightTheme) {
      this.editorTheme = 'vs';
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    } else {
      this.editorTheme = 'vs-dark';
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
    }
    this.editorOptions = {
      language: 'javascript',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineHeight: 20,
      fontSize: 14,
      wordWrap: 'on',
      wrappingIndent: 'indent',
      theme: this.editorTheme,
    };    
  }

  // executeCode(code: string, variable: any, section?: any) {
  //   variable.value = [];
  //   console.log(variable);
  //   const iframe = this.codeFrame.nativeElement as HTMLIFrameElement;
  //   console.log('iframe', iframe);
  //   this.variable = variable;
  //   this.section = section;
  
  //   try {
  //     if (code) {
  //       // Reload the iframe before executing code
  //       const originalSrc = iframe.src; // Store the original iframe src
  //       console.log('originalSrc', originalSrc);
  //       iframe.src = 'about:blank'; // Clear the iframe content
  //       setTimeout(() => {
  //         iframe.src = originalSrc; // Restore the original iframe src after a short delay
  //       }, 50);
  
  //       section.showCard = true;
  //       section.isLoading = true;
  
  //       // Wait for iframe to reload before executing the code
  //       setTimeout(() => {
  //         const contentWindow = iframe.contentWindow as any;
  //         console.log('Iframe Origin:', contentWindow.location.origin);
  
  //         // Attach error handling to the iframe
  //         contentWindow.onerror = (message: string, source: string, lineno: number, colno: number, error: Error) => {
  //           setTimeout(() => {
  //             variable.value.push(error);
  //             section.isLoading = false;  
  //           }, 0);    
  //         };
  
  //         // Execute the code inside the iframe
  //         try {
  //           contentWindow.eval(code);
  //         } catch (err: any) {
  //           setTimeout(() => {
  //             variable.value.push(err);
  //             section.isLoading = false;  
  //           }, 0);    

  //         }
  //       }, 100);
  //     }
  //   } catch (err: any) {
  //     setTimeout(() => {
  //       variable.value.push(err);
  //       section.isLoading = false;
  //     }, 0);
  //   }
  // }
    
  executeCode(code: string, variable: any, section?: any) {
    variable.value = [];
    console.log('Executing Code:', code);
    const iframe = this.codeFrame.nativeElement as HTMLIFrameElement;
  
    this.variable = variable;
    this.section = section;
  
    try {
      if (code) {
        // Reload the iframe before executing code
        const originalSrc = iframe.src; // Store the original iframe src
        iframe.src = 'about:blank'; // Clear the iframe content
        setTimeout(() => {
          iframe.src = originalSrc; // Restore the original iframe src after a short delay
        }, 50);
  
        section.showCard = true;
        section.isLoading = true;
  
        // Wait for iframe to reload before sending the code
        setTimeout(() => {
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow) {
            // Send the code to the iframe for execution
            iframeWindow.postMessage(
              { type: 'execute', code: code },
              window.location.origin // Ensure the message is sent to the same origin
            );
          } else {
            console.error('Iframe contentWindow is not available.');
            variable.value.push('Iframe not ready');
            section.isLoading = false;
          }
        }, 100);
      }
    } catch (err: any) {
      variable.value.push(err);
      section.isLoading = false;
    }
  }
  

  // @HostListener('window:message', ['$event'])
  // onMessage(event: MessageEvent) {
  //   if(this.variable) {
  //     console.log('this.variable', this.variable, event)
  //     if ('message' in event.data) {
  //       this.variable.value.push(event.data.message);
  //     }
  //   }
  //   if(this.section?.isLoading) {
  //     this.section.isLoading = false;
  //   }
  //   if (event.origin !== window.origin) return;
  //   console.log('Event Origin:', event.origin);
  //   console.log('event data', event.data)
  // }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) {
      console.warn('Blocked cross-origin message:', event.origin);
      return;
    }

    const { type, message, result, error } = event.data;

    switch (type) {
      case 'log':
        console.log('Iframe log:', message);
        this.variable?.value.push(...message);
        break;
      case 'error':
        console.error('Iframe error:', message);
        this.variable?.value.push(...message);
        break;
      case 'result':
        console.log('Execution result:', result);
        this.variable?.value.push(result);
        break;
      case 'executionError':
        console.error('Execution error:', error);
        this.variable?.value.push(error);
        break;
      default:
        console.warn('Unknown message type:', type);
    }

    // Mark section as not loading
    if (this.section?.isLoading) {
      this.section.isLoading = false;
    }
  }

  scrollToConcept(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }  

  toggleEdit(section: any): void {
    section.isEditing = !section.isEditing;
  
    // If editing is disabled, reset the code
    if (!section.isEditing) {
      this.code = section.fnCode; // Update the bound `code` variable with the new value
    }
  }
  
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(
      () => {
        console.log('Code copied to clipboard!');
      },
      (err) => {
        console.error('Failed to copy code: ', err);
      }
    );
  }  
    
  contentSections: any = [
    {
      "concept": "Hoisting",
      "concept_desc": "Hoisting in JavaScript is a behavior where variable and function declarations are moved to the top of their containing scope (script or function) during the compilation phase, before code execution. This means that you can use variables or call functions before they are declared in the code, though there are nuances depending on whether you're dealing with variables declared using var, let, const, or function declarations.",
      "sub_concepts": [
        {
          "sub_concept_heading": "1. Function Declarations",
          "sub_concept_desc": "Function declarations are hoisted and can be used before initialization.",
          fnCode: 
`greet(); // Output: Hello, World!
        
function greet() {
    console.log("Hello, World!");
}`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "2. Variable Declarations",
          "sub_concept_desc": "var declarations are hoisted but its value is not initialized. Before initialization, the variable is 'undefined'.",
          fnCode: 
`console.log(x); // Output: undefined
var x = 5;
console.log(x); // Output: 5`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "",
          "sub_concept_desc": "let and const declarations are hoisted but they remain in a 'temporal dead zone' until the code execution reaches their line. Accessing them before initialization causes a ReferenceError.",
          fnCode: 
`console.log(y); // ReferenceError
let y = 10;`,          
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          fnCode: 
`console.log(z); // ReferenceError
const z = 20;`,          
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "3. Class Declarations",
          "sub_concept_desc": "Similar to let and const, class declarations are hoisted but cannot be accessed before their definition due to the temporal dead zone.",
          fnCode: 
`const obj = new MyClass(); // ReferenceError
class MyClass {
  constructor() {
    this.name = "Example";
  }
}`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },

      ],

    },
    {
      "concept": "Temporal Dead Zone (TDZ)",
      "concept_desc": "The Temporal Dead Zone (TDZ) in JavaScript refers to the period of time during which a variable declared with let, const, or a class is in scope but cannot be accessed or used. This happens between the beginning of the block scope where the variable is declared and the point where the variable is initialized.",
      "sub_concepts": [
        {
          fnCode: 
`function demoTDZ() {
  if (true) {
    console.log(x); // ReferenceError
    let x = 42;
  }
}

demoTDZ();`, 
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "Reference Error",
          "sub_concept_desc": "When a variable declared using let, const, or a class object is accessed while it is still in the Temporal Dead Zone (TDZ), a ReferenceError is thrown.",
          fnCode: 
`console.log(a);
let a = 10;`, 
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          fnCode: 
`console.log(b);
const b = 10;`, 
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          fnCode: 
`const obj = new TestClass();
class TestClass {
    constructor() {
        this.name = "Test Name";
    }
}`, 
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "Syntax Error",
          "sub_concept_desc": "Attempting to redeclare a variable with let or don't assign a value to a const variable results in a SyntaxError.",
          fnCode: 
`let a = 10;
console.log(a);
let a = 100;
console.log(a);`, 
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          fnCode: 
`const b;
console.log(b);`, 
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "Type Error",
          "sub_concept_desc": "Attempting to reassign a variable with const results in a TypeError.",
          fnCode: 
`const a = 10;
console.log(a);
a = 100;
console.log(a);`, 
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
      ]
    },
    {
      "concept": "var, let, const, class, function and their scope",
      "sub_concepts": [
        {
          "sub_concept_heading": "var",
          "sub_concept_desc": "Function-scoped, accessible only within the function they are defined in or globally if declared outside a function, hoisted to the top of their scope and initialized with undefined. it can be used before their declaration which outputs undefined.",
          fnCode: 
`console.log(x); // Output: undefined
var x = 5;
console.log(x); // Output: 5`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "let & const",
          "sub_concept_desc": "Block-scoped. Accessible only within the block (enclosed by {}) they are defined in. In browsers it is stored in 'Script' if declared in Global space.",
          fnCode: 
`function fn() {         // Local Scope
    if(true) {
        let x = 99;     // Block Scope
        console.log(x); 
    }
}
fn();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false  
        },
        {
          fnCode: 
`const x = 89;          // Script Scope
console.log(x);`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false            
        },
        {
          "sub_concept_heading": "class",
          "sub_concept_desc": "Accessible only within the block it is defined in, Hoisted but not initialized, accessing it before declaration results in a ReferenceError (like let or const). It cannot be re-declared within the same scope.",
          fnCode: 
`{
  const obj = new MyClass(); // ReferenceError
  class MyClass {
    constructor(name) {
      this.name = name;
    }
  }
}`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false  
        },
        {
          "sub_concept_heading": "function",
          "sub_concept_desc": "Function-scoped if declared traditionally (using function), but block-scoped if defined inside a block with let or const using function expressions. Fully hoisted and can be used before declaration without errors. It can be re-declared if defined traditionally.",
          fnCode: 
`function fn() {
    let x = 99;
    console.log(x);
}
fn();

function fn() { // can be redeclared but latest definition will be used
    let x = 199;
    console.log(x);
}
fn();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false  
        },
        {
          fnCode: 
`// Function Expression - declared using let or const
console.log(subtract(10, 5)); // ReferenceError
const subtract = function (x, y) {
  return x - y;
};`, 
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          fnCode: 
`// Function Expression - declared using var
console.log(subtract(10, 5)); // TypeError
var subtract = function (x, y) {
  return x - y;
};`, 
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "Accessing variables using window and this object in Global Scope",
          "sub_concept_desc": "In JavaScript, when variables are declared in the global scope, they can be accessed using the window or this object, but their availability depends on how the variable is declared (var, let, or const).",
        },
        {
          "sub_concept_heading": "Global Scope and the window Object",
          "sub_concept_desc": "The window object is the global object in browsers. Any variable declared with var in the global scope automatically becomes a property of the window object.",
        },
        {
          "sub_concept_heading": "using var",
          "sub_concept_desc": "Variables declared with var in the global scope are attached to the window object, this in the global scope refers to the window object in browsers in non strict mode.",
          fnCode: 
`var globalVar = "I am global";

console.log(window.globalVar); // "I am global"
console.log(this.globalVar);   // "I am global"`,
          fnResult: null,
          showCard: false,
          isLoading: false  
        },
        {
          "sub_concept_heading": "Using let or const",
          "sub_concept_desc": "Variables declared with let or const do not become properties of the window object. These variables are stored in a separate scope managed by the JavaScript engine, calles Script scope in browsers.",
          fnCode: 
`let globalLet = "I am global";
const globalConst = "I am constant";

console.log(window.globalLet);  // undefined
console.log(window.globalConst); // undefined
console.log(this.globalLet);    // undefined
console.log(this.globalConst);  // undefined`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false  
        }
      ]
    },
    {
      "concept": "Shadowing",
      "concept_desc": "Shadowing in JavaScript refers to the situation where a local variable or parameter has the same name as a variable in a broader scope (such as global or outer function scope). The local variable 'shadows' or 'overrides' the outer variable, making it inaccessible within the scope of the inner variable. This can occur with variables declared using var, let, or const, as well as function parameters.",
      "sub_concepts": [
        {
          "sub_concept_heading": "var",
          fnCode: 
`var x = 10;

function example() {
  var x = 20; // local variable shadows the outer x
  console.log(x); // 20
}

example();
console.log(x); // 10 (global x remains unchanged)`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false  
        },
        {
          fnCode: 
`var x = 10;
if(true) {
  var x = 100; // x is not block scoped but function scoped
  console.log(x);
}
console.log(x);`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false  
        },
        {
          "sub_concept_heading": "let or const",
          fnCode: 
`let x = 10;

if(true) {
  let x = 100; // x is block scoped
  console.log(x);
}
console.log(x);`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false  
        },
        {
          fnCode: 
`let x = 10;

if(true) {
  var x = 100; // x is function scoped - SyntaxError
  console.log(x);
}
console.log(x);`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false  
        },
        {
          "sub_concept_heading": "Function Parameter Shadowing",
          fnCode: 
`let z = 50;

function shadowExample(z) {
  console.log(z); // the parameter 'z' shadows the outer 'z'
}

shadowExample(60); // 60 (parameter shadows the outer variable)
console.log(z); // 50 (outer 'z' is not affected)`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false  
        },
      ]
    },
    {
      "concept": "Closure",
      "concept_desc": "A closure is the combination of a function bundled together with its 'Lexical Environment'.",
      "sub_concepts": [
        {
          fnCode: 
`function createCounter() { // count is encapsulated, no outer control
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
          
        },
        {
          "sub_concept_heading": "Closures in Currying",
          fnCode: 
`function multiply(a) {
  return function (b) {
    return a * b;
  };
}

const double = multiply(2);
console.log(double(5)); // 10
console.log(double(8)); // 16`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
          
        },
        {
          "sub_concept_heading": "Disadvantages of Closure",
          "sub_concept_desc": "Increased Memory Usage",
          fnCode: 
`function createClosure() {
  let largeData = new Array(100).fill("data");
  return function () {
    console.log("Closure in use!");
  };
}

const closure = createClosure(); // 'largeData' is retained in memory
closure();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_desc": "Variable Capturing in Loops",
          fnCode: 
`function loopIssue() {
  var funcs = [];
  for (var i = 0; i < 3; i++) { // use let for avoiding this
    funcs.push(() => console.log(i)); // Captures 'i'
  }
  funcs.forEach((func) => func()); // Outputs: 3, 3, 3
}
loopIssue();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          fnCode: 
`function loopIssueResolved() {
  var funcs = [];
  for (let i = 0; i < 3; i++) { 
    funcs.push(() => console.log(i));
  }
  funcs.forEach((func) => func());
}
loopIssueResolved();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "setTimeout with Closure",
          "sub_concept_desc": "using var",
          fnCode: 
`function fn() {
    for(var i=0; i<5; i++) { // var is function scoped
        setTimeout(() => {
            console.log(i); // reference of i is passed in callback
        }, 0);
    }
}
fn();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_desc": "using let",
          fnCode: 
`function fn() {
    for(let i=0; i<5; i++) { // let is block scoped
        setTimeout(() => {
            console.log(i); // new reference of i is passed in callback
        }, 0);
    }
}
fn();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_desc": "how not to use let ",
          fnCode: 
`function fn() {
    let i; // let is local scoped now
    for(i=0; i<5; i++) { 
        setTimeout(() => {
            console.log(i); // same reference of i is passed in callback
        }, 0);
    }
}
fn();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_desc": "how to use var ",
          fnCode: 
`function fn() {
    for(var i=0; i<5; i++) {
        function fn(x) { // closure
            setTimeout(() => {
                console.log(x);
            }, x*1000);
        }
        fn(i); // every time new value of i is passed
    }
}
fn();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
      ]
    },
    {
      "concept": "Types of Functions",
      "concept_desc": "In JavaScript, functions are versatile and can be categorized based on their definition, usage, or scope. Below are the main types of functions in JavaScript:",
      "sub_concepts": [
        {
          "sub_concept_heading": "Named Functions",
          fnCode: 
`function greet() {
  console.log("Hello, World!");
}
greet();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "Anonymous Functions",
          fnCode: 
`const greet = function () {
  console.log("Hello, World!");
};
greet();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false     
        },
        {
          "sub_concept_heading": "Arrow Functions",
          fnCode: 
`const greet = () => console.log("Hello, World!");
greet();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false     
        },
        {
          "sub_concept_heading": "Function Expressions",
          "sub_concept_desc": "Functions assigned to variables, either named or anonymous.",
          fnCode: 
`const greet = function sayHello() {
  console.log("Hello, World!");
};
greet();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false     
        },
        {
          "sub_concept_heading": "Immediately Invoked Function Expressions (IIFE)",
          fnCode: 
`(function () {
  console.log("This is an IIFE");
})();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false     
        },
        {
          "sub_concept_heading": "Constructor Functions",
          "sub_concept_desc": "Used to create objects, typically invoked with the 'new' keyword.",
          fnCode: 
`function Person(name) {
  this.name = name;
}
const person = new Person("Alice");
console.log(person.name); // Alice`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false     
        },
        {
          "sub_concept_heading": "Generator Functions",
          "sub_concept_desc": "Defined using function*, they can pause and resume execution using the yield keyword.",
          fnCode: 
`function* numbers() {
  yield 1;
  yield 2;
  yield 3;
}
const gen = numbers();
console.log(gen.next().value); // 1`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false     
        },
        {
          "sub_concept_heading": "Async Functions",
          "sub_concept_desc": "Introduced in ES8, they work with await for asynchronous operations.",
          fnCode: 
`async function fetchData() {
  const response = await fn();
  const data = await response;
  console.log(data);
}

function fn() {
  return new Promise((resolve, reject) => {resolve('Fetched Data')});
}
fetchData();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false     
        },
        {
          "sub_concept_heading": "Higher-Order Functions",
          "sub_concept_desc": "Functions that take other functions as arguments or return functions.",
          fnCode: 
`function higherOrderFunction(callback) {
  return callback();
}
higherOrderFunction(() => console.log("I'm a callback function!"));`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false     
        },
        {
          "sub_concept_heading": "First-Class Functions",
          "sub_concept_desc": "Functions which can be assigned to variables, can be passed as arguments to other functions, can be returned from other functions, and can be stored in data structures.",
          fnCode: 
`// Function assigned to variable
const greet = function () {
  console.log("Hello, World!");
};
greet(); // Hello, World!

// Function passed as arguments to other functions
function execute(callback) {
  callback();
}
execute(() => console.log("Executing a callback function!"));

// Function returned from other functions
function createMultiplier(multiplier) {
  return function (value) {
    return value * multiplier;
  };
}
const double = createMultiplier(2);
console.log(double(5)); // 10

// Function stored in data structures
const operations = [
  (a, b) => a + b,
  (a, b) => a - b,
  (a, b) => a * b,
];
console.log(operations[0](5, 3)); // 8`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false     
        }
      ]
    },
    {
      "concept": "Event Loop in JavaScript",
      "concept_desc": "The Event Loop is a mechanism that allows JavaScript to perform non-blocking operations by delegating tasks to the system while still running a single thread. It coordinates the execution of: Synchronous Code (executed on the call stack). Asynchronous Code (tasks in the callback queue or microtask queue).",
      "sub_concepts": [
        {
          "sub_concept_heading": "Components of the Event Loop"
        },
        {
          "sub_concept_desc": "1. Call Stack: Where synchronous code is executed, following a Last In, First Out (LIFO) order."
        },
        {
          "sub_concept_desc": "2. Web APIs: Asynchronous operations (e.g., setTimeout, DOM events, HTTP requests) are sent here and handled by the browser or Node.js environment."
        },
        {
          "sub_concept_desc": "3. Callback Queue (Task Queue): Holds callbacks for tasks like setTimeout and setInterval, processed on a First In, First Out (FIFO) basis."
        },
        {
          "sub_concept_desc": "4. Microtask Queue: Holds microtasks such as promises (.then), MutationObserver, and queueMicrotask. Always given priority over the callback queue."
        },
        {
          fnCode: 
`console.log("Script Start");

// Macro Task: Callback queue
setTimeout(() => {
  console.log("Timeout Callback");
}, 0);

// Micro Task: Microtask queue
Promise.resolve().then(() => {
  console.log("Promise Microtask");
});

// Another synchronous log
console.log("Script End");`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false     
        },
        {
          fnCode: 
`console.log("Start");

setTimeout(() => {
  console.log("Timeout 1");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise 1");
}).then(() => {
  console.log("Promise 2");
});

setTimeout(() => {
  console.log("Timeout 2");
}, 0);

console.log("End");`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          fnCode: 
`setTimeout(() => {
  console.log("Macro Task 1");
}, 0);

Promise.resolve().then(() => {
  console.log("Micro Task 1");
}).then(() => {
  console.log("Micro Task 2");
});

setTimeout(() => {
  console.log("Macro Task 2");
}, 0);

console.log("Synchronous Task");`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
          
        }
      ]

    }, 
    {
      "concept": "Functional Programming",
      "concept_desc": "Functional programming is a programming paradigm that treats computation as the evaluation of mathematical functions and avoids changing state and mutable data. It emphasizes declarative code (what to do) over imperative code (how to do it).",
      "sub_concepts": [
        {
          "sub_concept_heading": "Key Principles of Functional Programming"
        },
        {
          "sub_concept_desc": "1. First-Class Functions: Functions are treated as first-class citizens, meaning they can be assigned to variables, passed as arguments to other functions, returned from other functions."
        },
        {
          "sub_concept_desc": "2. Pure Functions: Functions that always produce the same output for the same input. Have no side effects (do not modify external state)."
        },
        {
          "sub_concept_desc": "3. Immutability: Data should not be mutated. Instead, new copies of data are created."
        },
        {
          "sub_concept_desc": "4. Higher-Order Functions: Functions that can take other functions as arguments. Return functions as results."
        },
        {
          "sub_concept_desc": "5. Declarative Code: Focuses on 'what to do' rather than 'how to do it.'"
        },
        {
          "sub_concept_desc": "6. Avoid Side Effects: Functions should not affect or depend on external variables."
        },
        {
          "sub_concept_heading": "Key Functional Methods in JavaScript",
          "sub_concept_desc": "1. map: Transforms an array by applying a function to each element.",
          fnCode: 
`const numbers = [1, 2, 3];
const squares = numbers.map(num => num ** 2);
console.log(squares); // [1, 4, 9]`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_desc": "2. filter: Filters elements based on a condition.",
          fnCode: 
`const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter(num => num % 2 === 0);
console.log(evens); // [2, 4]`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_desc": "3. reduce: Reduces an array to a single value by applying a function cumulatively.",
          fnCode: 
`const numbers = [1, 2, 3, 4];
const sum = numbers.reduce((total, num) => total + num, 0);
console.log(sum); // 10`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_desc": "4. forEach: Executes a provided function once for each array element (non-functional, doesn't return a new array).",
          fnCode: 
`const numbers = [1, 2, 3];
numbers.forEach(num => console.log(num * 2));
// Output: 2, 4, 6`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        }
      ]
    },
    {
      "concept": "Callback Hell",
      "concept_desc": "Callback hell refers to the situation where multiple nested callbacks are used to handle asynchronous operations, making the code difficult to read, debug, and maintain. This often results in a 'pyramid of doom' structure, where the code becomes deeply nested.",
      "sub_concepts": [
        {
          fnCode: 
`function fetchData(callback) {
  console.log("Data fetched");
  callback();
}

function processData(callback) {
  console.log("Data processed");
  callback();
}

function saveData(callback) {
  console.log("Data saved");
  callback();
}

// Deeply nested callbacks
fetchData(() => {
  processData(() => {
    saveData(() => {
      console.log("All operations completed");
    });
  });
});
`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "Inversion of Control",
          "sub_concept_desc": "Inversion of control (IoC) refers to a design principle where control over the execution of a function is given to another component or framework. This can be seen in callback functions, where the timing and invocation of the callback are controlled by an external function or library.",
          fnCode: 
`function fetchData(callback) {
  const data = { id: 1, name: "Sample" };
  callback(data); // The external function decides when to call the provided callback
}

// The callback is passed as an argument
fetchData((data) => {
  console.log(data);
});`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
      ]
    },
    {
      "concept": "Promises in JavaScript",
      "concept_desc": "A Promise in JavaScript is an object that represents the eventual completion (or failure) of an asynchronous operation and its resulting value. It allows developers to handle asynchronous operations in a more readable and manageable way compared to callbacks.",
      "sub_concepts": [
        {
          "sub_concept_heading": "States of a Promise",
        },
        {
          "sub_concept_desc": "1. Pending: The initial state, neither fulfilled nor rejected."
        },
        {
          "sub_concept_desc": "2. Fulfilled: The operation completed successfully."
        },
        {
          "sub_concept_desc": "3. Rejected: The operation failed."
        },
        {
          "sub_concept_desc": "Once a promise is resolved (fulfilled or rejected), it becomes immutable and cannot change states.",
          fnCode: 
`const myPromise = new Promise((resolve, reject) => {
  const success = true; // Simulating success or failure
  if (success) {
    resolve("Operation successful!"); // Fulfilled
  } else {
    reject("Operation failed!"); // Rejected
  }
});

// Consuming the promise
myPromise
  .then((result) => {
    console.log("Fulfilled:"); // Executes if resolved
    console.log(result);
  })
  .catch((error) => {
    console.error("Rejected:"); // Executes if rejected
    console.error(error);
  });`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "Chaining Promises",
          "sub_concept_desc": "Promises can be chained to perform multiple asynchronous operations in sequence.",
          fnCode: 
`const fetchData = () => {
  return new Promise((resolve) => {
    resolve("Data fetched");
  });
};

const processData = (data) => {
  return new Promise((resolve) => {
    resolve('Processed Data');
  });
};

fetchData()
  .then((data) => {
    console.log(data); // Data fetched
    return processData(data);
  })
  .then((processedData) => {
    console.log(processedData); // Processed Data
  })
  .catch((error) => {
    console.error("Error:", error);
  });`,        
        fnResult: {value: []},
        showCard: false,
        isLoading: false
        },
        {
          "sub_concept_heading": "Any no. of then, catch and finally can be called in chaining after each statment. 'then' after catch will always will called.",
          fnCode: 
`const fetchData = () => {
  return new Promise((resolve) => {
   resolve("data fetched");
  });
};

fetchData()
    .then()
    .then(() => {
      console.log('data processed');
    })
    .catch((error) => {
      console.error("Error:", error);
    })
    .then(() => {
        console.log('promise called')
    })
    .finally(() => {
        console.log('finally called')
    })
    .then(() => {
        console.log('another then called')
    })
    .finally(() => {
        console.log('another finally called')
    })`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "Promise Methods",
          "sub_concept_desc": "1. Promise.resolve(value): Creates a promise that is resolved with the given value.",
          fnCode: 
`Promise.resolve("Resolved immediately")
  .then((value) => console.log(value));`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_desc": "2. Promise.reject(reason): Creates a promise that is rejected with the given reason.",
          fnCode: 
`Promise.reject("Rejected immediately")
  .catch((reason) => console.error(reason));`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_desc": "3. Promise.all(promises): Waits for all promises in the iterable to be fulfilled or for any to be rejected.",
          fnCode: 
`const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .then((values) => console.log(values)) // [1, 2, 3]
  .catch((error) => console.error(error));`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_desc": "4. Promise.race(promises): Returns a promise that resolves or rejects as soon as one of the promises settles.",
          fnCode: 
`const p1 = new Promise((resolve) => setTimeout(() => resolve("First"), 1000));
const p2 = new Promise((resolve) => setTimeout(() => resolve("Second"), 2000));

Promise.race([p1, p2])
  .then((value) => console.log(value)); // "First"`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_desc": "5. Promise.allSettled(promises): Waits for all promises to settle (fulfilled or rejected) and returns their results.",
          fnCode: 
`const p1 = Promise.resolve(1);
const p2 = Promise.reject("Error");
const p3 = Promise.resolve(3);

Promise.allSettled([p1, p2, p3]).then((results) => console.log(results));`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_desc": "6. Promise.any(promises): Resolves as soon as any of the promises in the iterable is fulfilled. Rejects only if all the promises are rejected, in which case it throws an AggregateError containing all the rejection reasons.",
          fnCode: 
`const p1 = new Promise((resolve, reject) => setTimeout(reject, 100, 'Error 1'));
const p2 = new Promise((resolve) => setTimeout(resolve, 200, 'Resolved 1'));
const p3 = new Promise((resolve) => setTimeout(resolve, 300, 'Resolved 2'));

Promise.any([p1, p2, p3])
  .then((result) => console.log(result)) // Output: 'First fulfilled: Resolved 1'
  .catch((error) => console.error('All promises rejected:', error));`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_desc": "All Promises Rejected",
          fnCode: 
`const p1 = Promise.reject('Error 1');
const p2 = Promise.reject('Error 2');

Promise.any([p1, p2])
  .then((result) => console.log('First fulfilled:', result))
  .catch((error) => {
    console.error('All promises rejected:', error);
    console.error('Reasons:', error.errors); // Access all rejection reasons
  });`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        }
      ]
    },
    {
      "concept": "Async/Await",
      "concept_desc": "Async/Await is a syntactic sugar built on top of JavaScript Promises. It allows developers to write asynchronous code in a more synchronous and readable way.",
      "sub_concepts": [
        {
          "sub_concept_heading": "Async Functions:",
          "sub_concept_desc": "Declared with the async keyword. Always return a Promise. The value returned by an async function is automatically wrapped in a Promise.",
        },
        {
          "sub_concept_heading": "Await Keyword:",
          "sub_concept_desc": "Can only be used inside async functions. Pauses the execution of the async function until the Promise is resolved. Resumes execution with the resolved value of the Promise. If the Promise is rejected, it throws an error that can be caught using try...catch.",
        },
        {
          "sub_concept_heading": "Sequential Execution",
          fnCode: 
`async function fetchData1() {
  return new Promise((resolve) => setTimeout(() => resolve("Data 1"), 2000));
}

async function fetchData2() {
  return new Promise((resolve) => setTimeout(() => resolve("Data 2"), 1000));
}

async function main() {
  const data1 = await fetchData1();
  console.log(data1); // "Data 1" (after 2 seconds)

  const data2 = await fetchData2();
  console.log(data2); // "Data 2" (after 3 seconds total)
}

main();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "Parallel Execution",
          fnCode: 
`async function fetchData1() {
  return new Promise((resolve) => setTimeout(() => resolve("Data 1"), 2000));
}

async function fetchData2() {
  return new Promise((resolve) => setTimeout(() => resolve("Data 2"), 1000));
}

async function main() {
  const [data1, data2] = await Promise.all([fetchData1(), fetchData2()]);
  console.log(data1); // "Data 1"
  console.log(data2); // "Data 2" (both after 2 seconds total)
}

main();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "Practical Use Case: Fetching Data",
          fnCode: 
`async function getUserData(userId) {
  const response = await fetch('https://jsonplaceholder.typicode.com/users/'+userId);
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  const user = await response.json();
  return user;
}

async function main() {
  try {
    const user = await getUserData(1);
    console.log(user);
  } catch (error) {
    console.error(error.message);
  }
}

main();`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
      ]
    },
    {
      "concept": "this keyword mystries",
      "concept_desc": "The this keyword in JavaScript is a dynamic context-dependent reference that points to the object that is currently executing a function. Its value depends on how and where the function is called.",
      "sub_concepts": [
        {
          "sub_concept_heading": "1. Global Context",
          "sub_concept_desc": "In the global scope this refers to the global object (window in browsers or global in Node.js).",
          fnCode: 
`console.log(this); // Window object (in browsers)`,        
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "2. Inside a Function",
          "sub_concept_desc": "Non-Strict Mode: this refers to the global object. Strict Mode: this is undefined.",
          fnCode: 
`// Non-strict mode
function example() {
  console.log(this); // Window object (in browsers)
}

example(); 
`,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          fnCode: 
`// Strict mode
"use strict";
function example() {
  console.log(this); // undefined
}

example(); `,
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "3. Inside a Method",
          "sub_concept_desc": "When a method is called on an object, this refers to the object that owns the method.",
          fnCode: 
`const obj = {
  name: "JavaScript",
  greet: function () {
    console.log(this.name);
  },
};

obj.greet(); // "JavaScript"`,    
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "4. Arrow Functions",
          "sub_concept_desc": "Arrow functions do not have their own this. They inherit this from the enclosing lexical scope.",
          fnCode: 
`const obj = {
  nme: "JavaScript",
  greet: () => {
    console.log(this.nme);
  },
};

obj.greet(); // undefined (in browsers, 'this' refers to the global object)

const objWithNormalFunction = {
  nme: "JavaScript",
  greet: function () {
    const arrowFunction = () => {
      console.log(this.nme);
    };
    arrowFunction();
  },
};

objWithNormalFunction.greet(); // "JavaScript"`,    
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "5. Inside a Constructor",
          "sub_concept_desc": "Inside a constructor, this refers to the newly created object.",
          fnCode: 
`function Person(name) {
  this.name = name;
}

const person1 = new Person("John");
console.log(person1.name); // "John"`,    
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "6. Inside a Class",
          "sub_concept_desc": "In a class method, this refers to the instance of the class.",
          fnCode: 
`class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    console.log('Hello, ' + this.name);
  }
}

const person = new Person("John");
person.greet(); // "Hello, John"`,    
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "7. Event Handlers",
          "sub_concept_desc": "In event handlers, this typically refers to the element that fired the event.",
          fnCode: 
`const button = document.createElement("button");
button.textContent = "Click me";
document.body.appendChild(button);

button.addEventListener("click", function () {
  console.log(this); // <button> element
});

button.addEventListener("click", () => {
  console.log(this); // Global object or undefined (arrow function)
});`        
        },
        {
          "sub_concept_heading": "8. this in setTimeout and setInterval",
          "sub_concept_desc": "In a setTimeout or setInterval callback, this depends on the calling context.",
          fnCode: 
`setTimeout(function () {
  console.log(this); // Window (in browsers)
}, 1000);

const obj = {
  name: "Timer",
  start: function () {
    setTimeout(() => {
      console.log(this.name); // "Timer" (arrow function inherits this)
    }, 1000);
  },
};

obj.start();`,    
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "9. this in a Module",
          "sub_concept_desc": "In ES6 modules, this is undefined at the top level because modules are in strict mode by default. In CommonJS modules, this refers to module.exports.",
          fnCode: 
`// ES6 Module
console.log(this); // undefined

// CommonJS (Node.js)
console.log(this); // {} (module.exports)
`,    
        }
      ]
    },
    {
      "concept": "call, apply and bind",
      "concept_desc": "In JavaScript, call, apply, and bind are methods available to functions that allow you to explicitly set the value of this and invoke or return the function with a specific context.",
      "sub_concepts": [
        {
          "sub_concept_heading": "call",
          "sub_concept_desc": "The call method invokes a function immediately and allows you to specify the value of this and pass arguments one by one.",
          fnCode: 
`const person = {
  firstName: "John",
  lastName: "Doe",
};

function greet(greeting, punctuation) {
  console.log(greeting + ', ' + this.firstName + ' ' +this.lastName + punctuation);
}

greet.call(person, "Hello", "!"); // Output: Hello, John Doe!`,    
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "apply",
          "sub_concept_desc": "The apply method is similar to call, but it accepts arguments as an array or an array-like object.",
          fnCode: 
`const person = {
  firstName: "Jane",
  lastName: "Smith",
};

function greet(greeting, punctuation) {
  console.log(greeting + ', ' + this.firstName + ' ' + this.lastName + punctuation);
}

greet.apply(person, ["Hi", "?"]); // Output: Hi, Jane Smith?`,    
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "bind",
          "sub_concept_desc": "The bind method creates a new function with a specified this value and optional arguments, but does not invoke it immediately.",
          fnCode: 
`const person = {
  firstName: "Alice",
  lastName: "Brown",
};

function greet(greeting, punctuation) {
  console.log(greeting + ', ' + this.firstName + ' ' + this.lastName + punctuation);
}

const boundGreet = greet.bind(person, "Hey");
boundGreet("!!!"); // Output: Hey, Alice Brown!!!`,    
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        }
      ]
    },
    {
      "concept": "Prototype",
      "concept_desc": "In JavaScript, a prototype is a mechanism that allows objects to inherit properties and methods from other objects. It is fundamental to JavaScript's object-oriented programming model and enables features like inheritance and shared behaviors among objects.",
      "sub_concepts": [
        {
          "sub_concept_heading": "How Prototypes Work",
          "sub_concept_desc": "Every JavaScript object has an internal property called [[Prototype]] that links it to another object. This is accessible via the special property __proto__ or through Object.getPrototypeOf(). The object that is referenced by the [[Prototype]] serves as a prototype. If you try to access a property or method on an object and it doesn’t exist on that object, JavaScript looks for it in the object's prototype chain.",
          fnCode: 
`const obj = {
  name: "Alice",
};

console.log(obj.toString()); // Output: [object Object]
// toString is not in obj, so JavaScript looks in Object.prototype.`,    
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "Function Prototypes",
          "sub_concept_desc": "Functions in JavaScript have a special property called prototype. This is different from the __proto__ property. prototype is a property of functions that is used when creating objects via constructors. Objects created with a function constructor have their [[Prototype]] linked to the constructor's prototype.",
          fnCode: 
`function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  console.log('Hello, my name is ' + this.name);
};

const alice = new Person("Alice");
alice.greet(); // Output: Hello, my name is Alice

console.log(alice.__proto__ === Person.prototype); // true`,    
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "Object Creation and Prototypes",
          "sub_concept_desc": "You can directly set or create prototypes using Object.create().",
          fnCode: 
`const parent = {
  greet() {
    console.log("Hello from parent!");
  },
};

const child = Object.create(parent);
child.name = "Child";

child.greet(); // Output: Hello from parent!
console.log(child.__proto__ === parent); // true`,    
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        },
        {
          "sub_concept_heading": "Prototype Inheritance",
          "sub_concept_desc": "Prototypes enable inheritance without classes.",
          fnCode: 
`const animal = {
  eats: true,
  walk() {
    console.log("Animal walks");
  },
};

const dog = Object.create(animal);
dog.barks = true;

console.log(dog.eats); // true (inherited from animal)
dog.walk();            // Output: Animal walks`,    
          fnResult: {value: []},
          showCard: false,
          isLoading: false
        }
      ]
    }

    
  ]

}
