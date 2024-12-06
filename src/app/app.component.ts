import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighlightLoader } from 'ngx-highlightjs';
import { Highlight } from 'ngx-highlightjs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, Highlight, MatSlideToggleModule, MatButtonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private hljsLoader: HighlightLoader = inject(HighlightLoader);
  title = 'js-runbook';
  lightTheme = true;
  Theme = 'Light'

  showCard: boolean = false;
  isLoading: boolean = false;


  ngOnInit(): void {
    this.hljsLoader.setTheme('assets/styles/atom-one-light.css');
  }
  onAppThemeChange(event: any) {
    this.lightTheme = event.checked;
    this.lightTheme ? this.Theme = 'Light' : this.Theme = 'Dark';
    this.hljsLoader.setTheme(this.lightTheme ? 'assets/styles/atom-one-light.css' : 'assets/styles/atom-one-dark.css');
    const body = document.body;
    if (this.lightTheme) {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
    }
  }

  executeCode(code: string, variable: any, section?: any) {
    section.showCard = true;
    section.isLoading = true;


    setTimeout(() => {
      section.isLoading = false;
      const output = this.executeCodeConsole(code);
      variable.value = output.split('\n');
      console.log('output', output, variable)  
    }, 1000);
  }

  executeCodeConsole(code: string): string {
    let output = '';
    const originalConsoleLog = console.log;
  
    try {
      console.log = (message: any) => {
        output += message + '\n';
      };
      new Function(code)();
    } catch (error: any) {
      output = '' + error as string;
    } finally {
      console.log = originalConsoleLog;
    }
  
    return output.trim();
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
          fnResult: {value: ''},
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
          fnResult: {value: ''},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "",
          "sub_concept_desc": "let and const declarations are hoisted but they remain in a 'temporal dead zone' until the code execution reaches their line. Accessing them before initialization causes a ReferenceError.",
          fnCode: 
`console.log(y); // ReferenceError
let y = 10;`,          
          fnResult: {value: ''},
          showCard: false,
          isLoading: false    
        },
        {
          fnCode: 
`console.log(z); // ReferenceError
const z = 20;`,          
          fnResult: {value: ''},
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
          fnResult: {value: ''},
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
          fnResult: {value: ''},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "Reference Error",
          "sub_concept_desc": "When a variable declared using let, const, or a class object is accessed while it is still in the Temporal Dead Zone (TDZ), a ReferenceError is thrown.",
          fnCode: 
`console.log(a);
let a = 10;`, 
          fnResult: {value: ''},
          showCard: false,
          isLoading: false    
        },
        {
          fnCode: 
`console.log(b);
const b = 10;`, 
          fnResult: {value: ''},
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
          fnResult: {value: ''},
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
          fnResult: {value: ''},
          showCard: false,
          isLoading: false    
        },
        {
          fnCode: 
`const b;
console.log(b);`, 
          fnResult: {value: ''},
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
          fnResult: {value: ''},
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
          fnResult: {value: ''},
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
          fnResult: {value: ''},
          showCard: false,
          isLoading: false  
        },
        {
          fnCode: 
`const x = 89;          // Script Scope
console.log(x);`,
          fnResult: {value: ''},
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
          fnResult: {value: ''},
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
          fnResult: {value: ''},
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
          fnResult: {value: ''},
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
          fnResult: {value: ''},
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
          fnResult: {value: ''},
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
          fnResult: {value: ''},
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
          fnResult: {value: ''},
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
          fnResult: {value: ''},
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
          fnResult: {value: ''},
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
          fnResult: {value: ''},
          showCard: false,
          isLoading: false  
        },
      ]
    }
    
  ]

}
