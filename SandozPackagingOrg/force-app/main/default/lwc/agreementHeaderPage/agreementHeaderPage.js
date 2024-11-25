import { LightningElement, api, track, wire } from 'lwc';
import getAgreementHomePageFieldSet from '@salesforce/apex/AgreementController.getAgreementHomePageFieldSet';
import fetchDynamicNames from '@salesforce/apex/AgreementController.fetchDynamicNames';

export default class AgreementHeaderPage extends LightningElement {
    @api recordId;
    @api objectName;
    @track fieldSetFields = []; 
    @track lookupFieldNames = []; 

    connectedCallback() {
        console.log('jj in header the objectname is :',this.objectName);
        console.log('jj in header the recordId is :',this.recordId);
        getAgreementHomePageFieldSet({ objectName: this.objectName })
        .then(result => {
            this.fieldSetFields = result;
            console.log('jj fieldset values is :', JSON.stringify(this.fieldSetFields));
            this.lookupFieldNames = result.filter(field => field.isLookup).map(field => field.fieldName);
            console.log('jj lookup field names are :',JSON.stringify(this.lookupFieldNames));
            this.fetchLookupFieldValues();
        })
        .catch(error => {
            console.error('Error fetching field set fields:', error);
        });
    }
    
    renderedCallback() {
        if (this.fieldSetFields.length > 0 && 
            this.template.querySelectorAll('lightning-input-field').length === this.fieldSetFields.length) {
            window.setTimeout(() => {
                this.getAllFieldValues();
            }, 100);
        }
    }

    fetchLookupFieldValues() {
        fetchDynamicNames({ recordId: this.recordId, objectName: this.objectName, fieldApiNames: this.lookupFieldNames })
            .then(result => {
                this.fieldSetFields = this.fieldSetFields.map(field => ({
                    ...field,
                    value: result[field.fieldName] || field.value
                }));
            })
            .catch(error => {
                console.error('Error fetching lookup field names:', error);
            });
    }
    
    getAllFieldValues() {
        const allInputFields = this.template.querySelectorAll('lightning-input-field');
        let fieldValues = {};
        allInputFields.forEach(field => {
            fieldValues[field.fieldName] = field.value;
        });
        console.log('JJ All Field Values:', JSON.stringify(fieldValues));

        const fieldsChangeEvent = new CustomEvent('fieldschange', {
            detail: { fieldValues }
        });
        this.dispatchEvent(fieldsChangeEvent);
    }

    handleFieldChange(event) {
        const fieldName = event.target.fieldName;
        const fieldValue = event.target.value;
        
        if (this.lookupFieldNames.includes(fieldName)) {   
            let fieldValues = {};
            fieldValues[fieldName] = fieldValue;
    
            fetchDynamicNames({ objectName: this.objectName, fieldValues: fieldValues })
                .then(result => {
                    if (result.hasOwnProperty(fieldName)) {
                    } else {
                        console.log('No resolved name found, using field value instead.');
                    }
                    this.dispatchEvent(new CustomEvent('fieldchange', {
                        detail: { fieldName, fieldValue: result[fieldName] || fieldValue }
                    }));
                })
                .catch(error => {
                    console.error('Error resolving field name:', error);
                    this.dispatchEvent(new CustomEvent('fieldchange', {
                        detail: { fieldName, fieldValue }
                    }));
                });
        } else {
            this.dispatchEvent(new CustomEvent('fieldchange', {
                detail: { fieldName, fieldValue }
            }));
        }
    }
    
    @api
    validateRequiredFields() {
        const allFields = this.template.querySelectorAll('lightning-input-field');
        return [...allFields].reduce((valid, field) => {
            return valid && (field.required ? field.reportValidity() : true);
        }, true);
    }
}