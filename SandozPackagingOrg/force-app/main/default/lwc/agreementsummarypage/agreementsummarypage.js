import { LightningElement, api, track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
//import getAgreementSummaryPageFieldSet from '@salesforce/apex/AgreementController.getAgreementSummaryPageFieldSet';
import updateAgreementData from '@salesforce/apex/AgreementController.updateAgreementData';
import updateAgreementLineItemData from '@salesforce/apex/AgreementController.updateAgreementLineItemData';
import getColumns from '@salesforce/apex/AgreementController.getColumns';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Agreementsummarypage extends NavigationMixin(LightningElement) {
    @track isFirstModalOpen = false;
    @track isSecondModalOpen = false;
    @api recordId;
    @api objectname;
    @track isDialogOpen = false;
    @api productData=[];
    @api fieldValues = {};
    fieldSet = []; 
    @track formFieldChanges = [];
    @track finalValues;
    @track columns=[];

    @track steps = [
        { id: 1, label: 'Step 1: Updating Agreement', completed: false },
        { id: 2, label: 'Step 2: Updating Agreement Line Items', completed: false },
    ];
 @wire(getColumns, { columnData: 'agreementsummary' }) wiredColumns({data, error}){
        if (data) {
             this.dataLoading=true;
            this.columns = JSON.parse(data.SCF_QOE__Column_JSON__c);
            console.log('summarycol'+this.columns);
            }else if (error) {
        console.log(error+'erreeeproducterror');
    }}
    handleSubmit() {
        this.isFirstModalOpen = true;
    }

    handleModalClose() {
        this.isFirstModalOpen = false;
    }

    handleSecondModalClose(){
        this.isSecondModalOpen = false;
    }

    markStepCompleted(stepId) {
        const step = this.steps.find(s => s.id === stepId);
        if (step) {
            step.completed = true;
        }
    }

    markStepNotComplete(stepId) {
        const step = this.steps.find(s => s.id === stepId);
        if (step) {
            step.completed = false;
        }
    }

    get processedSteps() {
        return this.steps.map(step => ({
            ...step,
            cssClass: step.completed ? 'icon-success-wrapper' : ''
        }));
    }

    connectedCallback() {
        /*getAgreementSummaryPageFieldSet({ objectName: this.objectname })
            .then(result => {
                this.fieldSet = result;
                console.log('jj summary fieldset values is :', this.fieldSet);
            })
            .catch(error => {
                console.error('Error fetching field set fields:', error);
            });*/
    }

    handleCancel() {
        this.isDialogOpen = true;
    }

    handleDialogClose() {
        this.isDialogOpen = false;
    }

    /*handleFieldChange(event) {
        const fieldName = event.target.fieldName;
        const value = event.target.value;
        const index = this.formFieldChanges.findIndex(field => field.fieldName === fieldName);
        if (index !== -1) {
            this.formFieldChanges[index].value = value;
        } else {
            this.formFieldChanges.push({ fieldName, value });
        }
        console.log('jj field change value is :',JSON.stringify(this.formFieldChanges));
        console.log('jj original form values are :',JSON.stringify(this.fieldValues));
    }*/

    handleRedirect() {
        this.isDialogOpen = false;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: this.objectname,
                actionName: 'view'
            }
        });
    }

    combineFieldValues() {
        let resultArray = Object.keys(this.fieldValues).map(key => ({ fieldName: key, value: this.fieldValues[key] }));
        this.formFieldChanges.forEach(change => {
            let existingEntry = resultArray.find(entry => entry.fieldName === change.fieldName);
            if (existingEntry) {
                existingEntry.value = change.value;
            } else {
                resultArray.push({ fieldName: change.fieldName, value: change.value });
            }
        });
        return resultArray;
    }

    handleProceed(){
        const combinedValues = this.combineFieldValues();
        console.log('jj final values for agreements is :',JSON.stringify(combinedValues));
        console.log('jj final values for products is :',JSON.stringify(this.productData));

        if (combinedValues.length === 0 && (this.productData == null || this.productData.length === 0)) {
            this.isFirstModalOpen = false;
            this.showToast('Error', 'Error: Agreement data is unchanged and ALI data is empty.', 'error');
            this.isFirstModalOpen = false;
        }else if (combinedValues.length > 0) {
            this.isSecondModalOpen = true;
            this.isFirstModalOpen = false;
    
            updateAgreementData({ recordId: this.recordId, agreementData: JSON.stringify(combinedValues)})
            .then(response => {
                console.log('jj after first method:', response);
                if (response.success) {
                    this.markStepCompleted(1);
                    if(this.productData != null){
                        if(this.productData.length > 0){
                            updateAgreementLineItemData({ recordId: this.recordId, agreementLineItemData: JSON.stringify(this.productData)})
                            .then(configResponse1 => {
                                console.log('jj is here after second method configResponse :',configResponse1);
                                if (configResponse1.success) {
                                    console.log('jj after second method json parse :',configResponse1);
                                    this.markStepCompleted(2);
                                    this.showToast('Success', 'Agreement and ALI are processed successfully.', 'success');
                                    setTimeout(() => {
                                        this.isSecondModalOpen = false;
                                        this.markStepNotComplete(1);
                                        this.markStepNotComplete(2);
                                    }, 500); 
                                    /*this[NavigationMixin.Navigate]({
                                        type: 'standard__recordPage',
                                        attributes: {
                                            recordId: this.recordId,
                                            objectApiName: this.objectname,
                                            actionName: 'view'
                                        },
                                    });*/ 
                                } else {
                                    this.isSecondModalOpen = false;
                                    throw new Error(configResponse1.message);
                                }
                            })
                        }
                    }else{
                        this.markStepCompleted(2);
                        this.showToast('Success', 'Agreement is updated successfully.', 'success');
                        setTimeout(() => {
                            this.isSecondModalOpen = false;
                            this.markStepNotComplete(1);
                            this.markStepNotComplete(2);
                        }, 500); 
                        /*this[NavigationMixin.Navigate]({
                            type: 'standard__recordPage',
                            attributes: {
                                recordId: this.recordId,
                                objectApiName: this.objectname,
                                actionName: 'view'
                            },
                        });*/                    
                    }
                } else {
                    this.isSecondModalOpen = false;
                    throw new Error(response.message);
                }
            })
        }
        else if (this.productData != null) {
            this.isSecondModalOpen = true;
            this.isFirstModalOpen = false;
            this.markStepCompleted(1);
    
            updateAgreementLineItemData({ recordId: this.recordId, agreementLineItemData: JSON.stringify(this.productData)})
            .then(configResponse1 => {
                console.log('jj after second method configResponse :',configResponse1);
                if (configResponse1.success) {
                    console.log('jj after second method json parse :',configResponse1);
                    this.markStepCompleted(2);
                    this.showToast('Success', 'ALI are processed successfully.', 'success');
                    setTimeout(() => {
                        this.isSecondModalOpen = false;
                        this.markStepNotComplete(1);
                        this.markStepNotComplete(2);
                    }, 500); 
                    /*this[NavigationMixin.Navigate]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: this.recordId,
                            objectApiName: this.objectname,
                            actionName: 'view'
                        },
                    });*/
                } else {
                    this.isSecondModalOpen = false;
                    //this.updateStepStatus(2, 'error');
                    throw new Error(configResponse1.message);
                }
            })
        }
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}