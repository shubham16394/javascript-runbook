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
  fnHoistResult = {value: ''};


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

  fnHoistCode = `
  greet(); // Output: Hello, World!

  function greet() {
    console.log("Hello, World!");
  } `;

  contentSections = [
    {
      "concept": "Hoisting",
      "concept_desc": "Hoisting in JavaScript is a behavior where variable and function declarations are moved to the top of their containing scope (script or function) during the compilation phase, before code execution. This means that you can use variables or call functions before they are declared in the code, though there are nuances depending on whether you're dealing with variables declared using var, let, const, or function declarations.",
      "sub_concepts": [
        {
          "sub_concept_heading": "1. Function Declarations",
          "sub_concept_desc": "Function declarations are hoisted and can be used before initialization.",
          fnCode: `
          greet(); // Output: Hello, World!
        
          function greet() {
            console.log("Hello, World!");
          } `,
          fnResult: {value: ''},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "2. Variable Declarations",
          "sub_concept_desc": "var declarations are hoisted but its value is not initialized. Before initialization, the variable is 'undefined'.",
          fnCode: `
          console.log(x); // Output: undefined
          var x = 5;
          console.log(x); // Output: 5`,
          fnResult: {value: ''},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "",
          "sub_concept_desc": "let and const declarations are hoisted but they remain in a 'temporal dead zone' until the code execution reaches their line. Accessing them before initialization causes a ReferenceError.",
          fnCode: `
          console.log(y); // ReferenceError
          let y = 10;`,          
          fnResult: {value: ''},
          showCard: false,
          isLoading: false    
        },
        {
          fnCode: `
          console.log(z); // ReferenceError
          const z = 20;`,          
          fnResult: {value: ''},
          showCard: false,
          isLoading: false    
        },
        {
          "sub_concept_heading": "3. Class Declarations",
          "sub_concept_desc": "Similar to let and const, class declarations are hoisted but cannot be accessed before their definition due to the temporal dead zone.",
          fnCode: `
          const obj = new MyClass(); // ReferenceError
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

    }
  ]

}
