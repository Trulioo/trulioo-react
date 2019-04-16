import React from "react"
import { connect } from 'react-redux'
import { getCountries, getFields, submitForm } from '../actions'
import Form from "react-jsonschema-form"
import { getName } from "country-list"
/** @jsx jsx */
import { jsx, css } from '@emotion/core'


class TruliooForm extends React.Component {

    componentDidMount() { 
        this.props.getCountries(this.props.url)
    }

    handleChange = (e) => {
        let shouldUpdateFormData = (this.props.fields.formData === undefined) || (e.formData.countries !== this.props.fields.formData.countries)
        if (shouldUpdateFormData) {
            this.props.getFields(e.formData.countries)
        }
    }

    handleSubmit = (e) => {
        this.props.submitForm(e).then(res => {
            this.props.handleResponse(res)
        })
    }

    triggerSubmitResponse = (e) => {
        this.props.handleResponse(e)
    }

    render() {
        const style = css`padding: 2rem;`
        return <div css={style}>
            <Form
                schema={this.props.schema}
                onChange={e => this.handleChange(e)}
                onSubmit={e => this.handleSubmit(e)}
                formData={this.props.fields.formData}
            />
        </div>
    }
}

const mapStateToProps = (state) => {
    let schema = {
        type: "object",
        properties: {
            countries: {
                title: "Countries",
                type: "string",
                enum: state.getCountries.countries,
                enumNames: state.getCountries.countries && state.getCountries.countries.map(country => getName(country))
            },
        }
    }
    if (state.fields && state.fields.fields) {
        if (state.fields.fields.properties) {
            schema.properties.Properties = {
                title: "Properties",
                type: "object",
                properties: state.fields && state.fields.fields && state.fields.fields.properties
            }
        }
        if (state.fields.fields.Consents) {
            schema.properties.Consents = state.fields.fields.Consents
        }
    } 

    return {
        fields: state.fields,
        schema,
        formdata: state.formData
    }
}

export default connect(mapStateToProps, { getCountries, getFields, submitForm })(TruliooForm)