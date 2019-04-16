# Trulioo Embed ID (Beta)

## Install

`npm install trulioo-react`

## Description

⚡**Trulioo EmbedID**⚡ (private BETA) leverages the GlobalGateway RestFul API, this API can not be invoked directly through web browser, therefore an intermediary (proxy) hosted on your web server is required to complete the request. For demonstration purposes Trulioo provides the **[trulioo-react-sample-app](https://github.com/Trulioo/trulioo-react-sample-app)** (sample code of a lightweight Node.js proxy server). Trulioo recommends developing your own intermediary (proxy) for production purposes.

## Use

```
import EmbedID from 'trulioo-react/EmbedID'

const handleResponse = (e) => {
    // handle verification submission result here ...
}

<EmbedID url='TRULIOO_PROXY_SERVER_URL' handleResponse={handleResponse} />
```

## Add Bootstrap CSS for better looks 💇🏼

`<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">`

# Quickstart

You have the option to develop your own, or simply use [trulioo-quickstart project](https://github.com/Trulioo/trulioo-react-sample-app), an easy to follow guide to boostrap your server 🚀.

# Best Practice

Trulioo EmbedID passes user input data to the "proxy" on your server. When developing systems that consume internet exposed fields for the purpose of data collection, ensure you take all necessary precautions to protect your system from from denial of service attacks, exploits or security vulnerabilities. Please refer to the [Legal disclaimer](https://developer.trulioo.com/docs/legal) on the Trulioo Developer Portal.

# Custom Fields

If you want to collect data not included in EmbedID, you can define your own custom fields using the `customFields` prop. You can also pass a callback method using the `handleSubmit` prop to handle this data on submission. 

```
// callback method to handle the Trulioo verification response 
const handleResponse = (e) => {
    console.log("Response from Trulioo: ", e)
}

// callback method to handle form data on submit
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

render(<EmbedID url='http://localhost:3111' handleResponse={handleResponse} customFields={simpleExample} handleSubmit={handleSubmit} />, 
```

If you choose to include custom fields, they should be constructed following the schema outlined by [react-jsonschema-form](https://react-jsonschema-form.readthedocs.io/en/latest/#usage). This gives you complete control over the data you collect using EmbedID. 

## Learn More

Trulioo is a global identity verification company that provides secure access to reliable and independent data sources to instantly verify individuals and business entities online. Hundreds of organizations across the world use GlobalGateway, Trulioo’s RESTful API used to verify five billion people and 250 million businesses across 195 countries. In addition to helping organizations meet compliance requirements, GlobalGateway also streamlines the customer onboarding process, mitigates risk, and performs the first layer of defense against fraud. Learn more about [Trulioo](https://www.trulioo.com/).

## License

Apache 2
