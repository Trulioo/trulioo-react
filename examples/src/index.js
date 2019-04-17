import React from 'react'
import { render } from 'react-dom'
import EmbedID from '../../src/EmbedID'

const handleResponse = (e) => {
    console.log('Client Recieved Response: ', e)
}

const handleSubmit = (e) => {
    console.log("Submitted form: ", e)
}

// example custom fields on base level
let simpleExample = {
    field1: {
        title: "What is your name?",
        type: "string"
    }, 
    field2: {
        title: "What is your age?", 
        type: "number",
    },
    field3: {
        title: "What is your favourite color?", 
        type: "string",
        enum: ["red", "yellow", "blue"]
    }
}

// example custom fields section with required fields
let sectionExample = {
    CustomFieldObj: {
      title: "Custom Fields",
      type: "object", 
      required: ["name", "age"],
      properties: {
        name: {
          title: "What is your name?",
          type: "string"
        }, 
        age: {
            title: "What is your age?", 
            type: "number",
        },
        color: {
            title: "What is your favourite color?", 
            type: "string",
            enum: ["red", "yellow", "blue"]
        }
      }
    }
  }

render(<EmbedID url='http://localhost:3111' handleResponse={handleResponse} customFields={sectionExample} handleSubmit={handleSubmit} />, 
document.getElementById("root"))