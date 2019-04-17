import axios from 'axios'
import 'core-js'
import { GET_COUNTRIES, GET_FIELDS } from './types'
import * as R from 'ramda'

let BASE_URL
let originFieldsResponse
let reservedFormDataKeys = new Set(["countries", "TruliooFields"])

export const getCountries = (url) => async dispatch => {
    BASE_URL = url

    const URL = `${BASE_URL}/api/countryCodes`
    const promise = await axios.get(URL)

    dispatch({ type: GET_COUNTRIES, payload: JSON.parse(promise.data.response).sort() })
}

export const getFields = (countryCode, customFields) => async dispatch => {
    if (countryCode === '' || !countryCode) {
        return
    }
    validateCustomFields(customFields)
    let fields = await requestFields(countryCode)
    let subdivisions = await requestSubdivisions(countryCode)
    let consents = await requestConsents(countryCode)
    appendConsentFields(fields, consents)
    if (fields && fields.properties) {
        updateStateProvince(fields.properties, subdivisions)
    }
    dispatch({
        type: GET_FIELDS,
        payload: {
            fields,
            customFields,
            formData: {
                countries: countryCode,
            }
        }
    })
}

const requestFields = async countryCode => {
    if (countryCode === '' || !countryCode) {
        return
    }
    const URL = `${BASE_URL}/api/getFields/${countryCode}`
    let response = await axios.get(URL)
    originFieldsResponse = JSON.parse(response.data.response)
    let parsedFields = parseAllFields(JSON.parse(JSON.stringify(originFieldsResponse)))
    return parsedFields
}

const requestSubdivisions = async countryCode => {
    if (countryCode === '' || !countryCode) {
        return
    }
    const URL = `${BASE_URL}/api/getCountrySubdivisions/${countryCode}`
    let response =  await axios.get(URL)
    let subdivisions = JSON.parse(response.data.response)
    // sorting subdivisions by 'Name'
    return R.sortBy(R.compose(R.toLower, R.prop('Name')))(subdivisions)
}

const requestConsents = async countryCode => {
    if (countryCode === '' || !countryCode) {
        return
    }
    const URL = `${BASE_URL}/api/getDetailedConsents/${countryCode}`
    let response =  await axios.get(URL)
    let consents = JSON.parse(response.data.response)
    return consents
}

const appendConsentFields = (fields, consents) => {
    if (consents === undefined || consents.length <= 0) {
        return 
    }
    fields.Consents = generateConsentSchema(consents)
}

const generateConsentSchema = consents => {
    let schema = {
        title: "Consents",
        type: "object",
        properties: {
        }
    };
    consents.forEach(x => {
        schema.properties[x.Name] = {title: x.Name, description: x.Text,  type: "boolean", default: false}
    })
    return schema
}

const updateStateProvince = (obj, subdivisions) => {
    Object.keys(obj).forEach(k => {
        if (k === "StateProvinceCode") {
            obj[k] = {
                ...obj[k],
                enum: subdivisions.map(x => x.Code),
                enumNames: subdivisions.map(x => x.Name)
            }
        } else if (obj[k] !== null && typeof obj[k] === 'object') {
            updateStateProvince(obj[k], subdivisions);
        }
    });
}

const getCountryCode = form => {
    for (let [key, value] of Object.entries(form)) {
        if (key === 'countries') {
            return value
        }
    }
}

const getBody = form => {
    const countryCode = getCountryCode(form)
    form = parseFormData(form)
    return {
        "AcceptTruliooTermsAndConditions": true,
        "CleansedAddress": true,
        "ConfigurationName": "Identity Verification",
        "CountryCode": countryCode, 
        "DataFields": form.Properties,
        "ConsentForDataSources": parseConsents(form.Consents)
    }
}

const parseConsents = consents => {
    let result = []
    if (consents === undefined) {
        return result
    }
    Object.keys(consents).forEach(x => {
        if (consents[x]) {
            result.push(x)
        }
    }) 
}

const validateCustomFields = (customFields) => {
    if (customFields) {
        Object.keys(customFields).forEach(key => {
            console.log(key)
            if (reservedFormDataKeys.has(key)) {
                console.log("reserved!")
                throw Error(key + " is a reserved field key. Please use another key for your custom field.")
            }
        })
    } 
}

const parseFormDataAdditionalFields = (obj, formData) => {
    Object.keys(obj).forEach(key => {
        if (key === 'AdditionalFields') { 
            //getFormData equivalent value
            const additionalFieldsObj = obj[key]
            const additionalFieldsKeys = Object.keys(additionalFieldsObj.properties.properties)

            additionalFieldsKeys.forEach(additionalKey => {
                findObjInFormDataByKey(formData, additionalKey)
            })
        }
        if (typeof obj[key] === 'object') {
            parseFormDataAdditionalFields(obj[key], formData)
        }
    })
}

const findObjInFormDataByKey = (formData, wantedKey) => {
    Object.keys(formData).forEach(key => {
        if (wantedKey === key) {
            // temporary hackaround getAdditionalFields (forcing input undefined for the form to be proper)
            formData.AdditionalFields = {
                [key]: formData[key]
            }
            formData[key] = undefined
            return
        }
        if (typeof formData[key] === 'object') {
            findObjInFormDataByKey(formData[key], wantedKey)
        }
    })
}

export const submitForm = (formData) => async () => {
    let truliooFormData = parseTruliooFields(formData)
    parseFormDataAdditionalFields(originFieldsResponse, truliooFormData)
    const body = getBody(truliooFormData)
    const URL = `${BASE_URL}/api/verify`
    const promiseResult = await axios.post(URL, body).then(response => {
        return {
            ...response,
            body
        }
    })
    return promiseResult
}

const parseFormData = (form) => {
    if (form.TruliooFields.Document) {
        var docFront = form.TruliooFields.Document.DocumentFrontImage
        form.TruliooFields.Document.DocumentFrontImage = docFront.substr(docFront.indexOf(',') + 1)
        var docBack = form.TruliooFields.Document.DocumentBackImage
        if (docBack) {
            form.TruliooFields.Document.DocumentBackImage = docBack.substr(docBack.indexOf(',') + 1)
        }
        var livePhoto = form.TruliooFields.Document.LivePhoto
        if (livePhoto) {
            form.TruliooFields.Document.LivePhoto = livePhoto.substr(livePhoto.indexOf(',') + 1)
        }
    }
    if (form.TruliooFields.NationalIds) {
        form.TruliooFields.NationalIds = [form.TruliooFields.NationalIds]
    }
    return form
}

const keysThatShouldBeObjects = ['Communication', 'CountrySpecific', 'Location']
const keysThatShouldBeStrings = ['EnhancedProfile']
const keysThatShouldBeBooleans = ['AcceptIncompleteDocument']
const keysThatShouldBeFileData = ['LivePhoto', 'DocumentBackImage', 'DocumentFrontImage']

const parseAllFields = (obj) => {
    let parsedFields = parseFields(obj)
    removeAdditionalFields(parsedFields)
    return parsedFields
}

const parseTruliooFields = (formData) => {
    let truliooFields = {}
    Object.keys(formData).forEach(key => {
        if (reservedFormDataKeys.has(key)) {
            truliooFields[key] = formData[key]
        } 
    })
    return truliooFields
}

const parseFields = (obj) => {
    for (let [key, _] of Object.entries(obj)) {
        if (key == 0) {
            return
        }
        if (keysThatShouldBeObjects.includes(key)) {
            obj[key] = convertToObject(obj[key])
        }
        if (keysThatShouldBeStrings.includes(key)) {
            obj[key] = convertToString(obj[key])
        }
        if (keysThatShouldBeBooleans.includes(key)) {
            obj[key] = convertToBoolean(obj[key])
        }
        if (keysThatShouldBeFileData.includes(key)) {
            obj[key] = convertToFileData(obj[key])
        }
        if (key === 'label') {
            obj['title'] = obj[key]
        }
        let currentInnerObj = obj[key]
        if (!currentInnerObj.properties && currentInnerObj.type === 'object') {

            currentInnerObj.type = 'string'
        }
        obj[key] = convertIntToInteger(obj, key)
        parseAdditionalFieldRequired(obj, key)
        parseAdditionalFields(obj, key)
        parseFields(obj[key])
    }
    return obj
}

const parseAdditionalFieldRequired = (obj, key) => {
    if (key === 'NationalIds') {
        obj.NationalIds.required = obj.NationalIds.required.filter(element => element !== 'nationalid' && element !=='socialservice').concat('Type', 'Number')
    }
}

const parseAdditionalFields = (obj, key) => {
    if (key === 'AdditionalFields') {
        const additionalFieldsObj = obj[key]
        const innerObj = additionalFieldsObj.properties.properties
        let childObj;
        for (let [innerKey, _] of Object.entries(innerObj)) {
            let innerObj = obj.AdditionalFields.properties.properties[innerKey]
            childObj = {
                [innerKey]: innerObj
            }
        }
        for (let [key, value] of Object.entries(childObj)) {
            obj[key] = value
        }
    }
}

const removeAdditionalFields = (obj) => {
    Object.keys(obj).forEach((k) => {
        if (obj[k] !== null && typeof obj[k] === 'object') {
            if (obj[k].AdditionalFields) {
                const requiredFields = obj[k].AdditionalFields.properties.required
                obj.required = obj.required.filter(requiredProp => requiredProp !== 'AdditionalFields').concat(requiredFields)
                obj[k] = R.omit(['AdditionalFields'], obj[k])
            }
            removeAdditionalFields(obj[k]);
            return;
        }
    });
}

const convertIntToInteger = (obj, key) => {
    if (key === "type" && obj[key] === "int") {
        return "integer"
    }
    return obj[key]
}

const convertToObject = (obj) => {
    if (obj) {
        return {
            ...obj,
            type: "object"
        }
    }
    return obj
}

const convertToFileData = (obj) => {
    if (obj) {
        return {
            ...obj,
            type: "string",
            format: "data-url"
        }
    }
}

const convertToString = (obj) => {
    if (obj) {
        return {
            ...obj,
            type: 'string'
        }
    }
    return obj
}

const convertToBoolean = (obj) => {
    if (obj) {
        return {
            ...obj,
            type: 'boolean'
        }
    }
    return obj
}