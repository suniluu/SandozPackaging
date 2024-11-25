import { LightningElement, api, track } from 'lwc';
export default class ProductNameComponent extends LightningElement {
    @api value;
    @api objname;
    @api recordId;
    @api fieldapi;
    @api fieldapiname;
    @api fieldLookupName;
    @api addfield; 
    @api addcol;
    @api aggrementId;
    @api aggrementName;
    @api aggrementCode;
    @api productType;

    @api isDisabled ;
    @api hasValue;
    @api priceList;
    @track isProduct = true;
    
    matchingInfo = {
        primaryField: { fieldPath: this.fieldLookupName }
    };

    displayInfo = {
        primaryField: this.fieldLookupName
    }
    
    connectedCallback() {
        var additionalSearch = this.addfield ? this.addfield : this.fieldLookupName;
        this.matchingInfo = {
            primaryField: { fieldPath: this.fieldLookupName },
            additionalFields: [{ fieldPath: additionalSearch }],
        };
        if(this.addfield){
            this.displayInfo = {
                primaryField: this.fieldLookupName,
                additionalFields: [this.addfield],
            };
        } else {
            this.displayInfo = {
                primaryField: this.fieldLookupName
            };
        }
    }

    handleRecordSelect(event){
            let selectedData = {productId: event.detail.id, rowId: this.recordId, fieldapi : this.fieldapi, recordfieldAPI: this.fieldapiname, addcol: this.addcol};
            const selectedEvent = new CustomEvent('productchanged', {
                detail: selectedData, bubbles: true, composed: true
            });
            this.dispatchEvent(selectedEvent);
       
    }
}