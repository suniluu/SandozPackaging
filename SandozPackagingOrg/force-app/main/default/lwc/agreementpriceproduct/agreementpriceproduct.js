import { LightningElement, track, wire, api } from "lwc";
import getColumns from "@salesforce/apex/AgreementController.getColumns";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import LightningConfirm from "lightning/confirm";
export default class agreementpriceproduct extends NavigationMixin(
  LightningElement
) {
  @track selectedrows = [];
  @track selectedids = "";
  @track columns;
  @api initialRecords = [];
  @track sortBy;
  @track sortDirection = "asc";
  @track totalNetPrice = 0;
  @api index;
  @track isOpenFilterInput = false;
  @track filterAppliedValue = "";
  @track showInput = false;
  @track dataLoading = false;
  @track appliedStyle;
  @track isMassEditPopup = false;
  @track isInlinepopup = false;
  @track flatdiscount = false;
  @track Volumediscount = false;
  @track keyIndex = 0;
  @track itemList = [
    {
      id: 0
    }
  ];
  @track flatmap=new Map();
  @api recordId;
  @api productData;
  componentLoaded = false;
  discount;
  price;
  listPrice;
  netPrice;
  columnIndex;
  saveDraftValues = [];
  @track inlineEditCol = [];
  massColumnUpdates = [];
  cancelArray = [];
  @track itemListmap=new Map();
  mapFilterData = new Map();
  columnFilterValues = new Map();
  mapSortColumn = new Map();
  mapProductData = new Map();
  @api initialData = [];
  @track fieldinlineAPIs = [];
  @track inlinerecordindex = "";
  @track searchKey='';

  get discountOption() {
    let options = [
      { label: "Discount Percent", value: "Percent" },
      { label: "Discount Amount", value: "Amount" }
    ];

    return options;
  }

  get typeOptions() {
    let options = [
      { label: "Flat", value: "Flat" },
      { label: "Volume", value: "Volume" }
    ];

    return options;
  }
  addRow() {
    ++this.keyIndex;
    let newItem = { id: this.keyIndex };
    this.itemList.push(newItem);
  }

   removeRow(event) {
    var rowIndex = event.currentTarget.dataset.index;
    console.log(rowIndex+'rowindex');
    console.log(JSON.stringify(this.itemList[rowIndex]));
    if (this.itemList.length > 1) {
      const itemRecord=this.itemList[rowIndex];
      if(itemRecord.dataindex){
          this.onRemove(itemRecord.dataindex,rowIndex);
      }else{
      this.itemList.splice(rowIndex, 1);
      }
    }
  }
   async onRemove(id,index) {
    const result = await LightningConfirm.open({
      message: "Do you want undo discounts applied",
      variant: "header",
      theme: "gray",
      label: "Undo Data"
    });
    if (result == true) {
      this.confirmClick(id,index);
    }
  }
  confirmClick(id,index) {
    console.log(id+'id');
    this.productData=this.productData.filter(
      (element) => element.recordIndex != id
    );
    this.initialRecords=this.initialRecords.filter(
      (element) => element.recordIndex != id
    );
    console.log(JSON.stringify(this.initialRecords+'initialRecords'));
    
    console.log(JSON.stringify(this.productData+'productData'));
    let datawithindex = { productdata: this.productData, index: this.index };

    const discountdata = new CustomEvent("discount", {
      detail: datawithindex,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(discountdata);
    this.itemList.splice(index, 1);
    
  }
  @wire(getColumns, { columnData: "agreementpriceproduct" }) wiredColumns({
    data,
    error
  }) {
    if (data) {
      this.columns = JSON.parse(data.SCF_QOE__Column_JSON__c);
      for (var i = 0; i < this.columns.length; i++) {
        this.fieldinlineAPIs.push(this.columns[i].fieldName);
        if (
          this.columns[i].editable == true ||
          this.columns[i].editable == "true"
        ) {
          
          if (
            this.columns[i].typeAttributes &&
            this.columns[i].fieldName == "productName"
          ) {
            this.discount = this.columns[i].typeAttributes.discount
              ? this.columns[i].typeAttributes.discount
              : "";
            this.price = this.columns[i].typeAttributes.price
              ? this.columns[i].typeAttributes.price
              : "";
            this.listPrice = this.columns[i].typeAttributes.listPrice
              ? this.columns[i].typeAttributes.listPrice
              : "";
            this.netPrice = this.columns[i].typeAttributes.netPrice
              ? this.columns[i].typeAttributes.netPrice
              : "";
          }
          
       
        }
           if (
            this.columns[i].typeAttributes &&
            (this.columns[i].typeAttributes.massedit == "true" ||
              this.columns[i].typeAttributes.massedit)
          ) {
            var massColObj = {};
            massColObj.type = this.columns[i].type;
            massColObj.label = this.columns[i].label;
            massColObj.fieldName = this.columns[i].fieldName;
            if (this.columns[i].type == "customName") {
              massColObj.lookup = true;
              massColObj.objname = this.columns[i].typeAttributes.objname;
              massColObj.fieldLookupName =
                this.columns[i].typeAttributes.fieldLookupName;
              this.fieldLookupName =
                this.columns[i].typeAttributes.fieldLookupName;
              this.addfield = this.columns[i].typeAttributes.addfield;
            } else if (this.columns[i].type == "customCombox") {
              massColObj.combobox = true;
              massColObj.selectedField =
                this.columns[i].typeAttributes.selectedValue.fieldName;
            } else {
              massColObj.regularType = true;
              massColObj.reqDropdown =
                this.columns[i].typeAttributes.reqDropdown == "true"
                  ? true
                  : false;
              massColObj.label =
                this.columns[i].typeAttributes.reqDropdown == "true"
                  ? "Discount Value"
                  : this.columns[i].label;
              massColObj.selectedDropdownValue = "";
              massColObj.discountoption = "";
              massColObj.inputValue = "";
            }
            this.massColumnUpdates.push(massColObj);
          }
        if (
          this.columns[i].typeAttributes &&
          (this.columns[i].typeAttributes.inline == "true" ||
            this.columns[i].typeAttributes.inline)
        ) {
          var inlinecol = {};
          inlinecol.type = this.columns[i].type;
          inlinecol.fieldName = this.columns[i].fieldName;
          if (this.columns[i].type == "customName") {
            inlinecol.lookup = true;
            inlinecol.objname = this.columns[i].typeAttributes.objname;
            inlinecol.fieldLookupName =
              this.columns[i].typeAttributes.fieldLookupName;
            // this.fieldLookupName = this.columns[i].typeAttributes.fieldLookupName;
            this.addfield = this.columns[i].typeAttributes.addfield;
          } else if (this.columns[i].type == "customCombox") {
            inlinecol.combobox = true;
            inlinecol.selectedField =
              this.columns[i].typeAttributes.selectedValue.fieldName;
          } else {
            inlinecol.regularType = true;
            inlinecol.reqDropdown =
              this.columns[i].typeAttributes.reqDropdown == "true"
                ? true
                : false;
            inlinecol.label =
              this.columns[i].typeAttributes.reqDropdown == "true"
                ? "Discount Value"
                : this.columns[i].label;

            // inlinecol.label = this.columns[i].fieldName == 'price' ? 'Base Price Override' : this.columns[i].label;
            inlinecol.selectedDropdownValue = "";
            inlinecol.discountoption = "";
            inlinecol.inputValue = "";
          }
          this.inlineEditCol.push(inlinecol);
        }

        this[this.columns[i].fieldName] = this.columns[i].fieldName
          ? this.columns[i].fieldName
          : "";
       
        if (
          this.columns[i].typeAttributes &&
          this.columns[i].typeAttributes.sortField
        ) {
          this.mapSortColumn[this.columns[i].fieldName] =
            this.columns[i].typeAttributes.sortField;
        }
      }
      this.columns = this.columns.map((column, index) => {
        const columnWithNumber = {
          ...column,
          columnNumber: index
        };
        return columnWithNumber;
      });
    } else if (error) {
      console.log(error + "priceproducterror");
    }
  }
  openMassEditPopup() {
    var selectedRecords = this.template
      .querySelector("c-custom-type-datatable")
      .getSelectedRows();
    if (selectedRecords.length > 0) {
      for (var j = 0; j < this.massColumnUpdates.length; j++) {
        this.massColumnUpdates[j].inputValue = "";
        this.massColumnUpdates[j].selectedDropdownValue = "";
        this.massColumnUpdates[j].discountoption = "";
      }

      this.isMassEditPopup = true;
    } else {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Mass Edit.",
          message: "Please select atleast one row.",
          variant: "error"
        })
      );
    }
  }
  updateMassEditPopup() {
    let typeval = true;
    let nullval = true;
    var dataArray = [];
    var editedArray = [];
    const ranges = [];
    this.cancelArray = [...this.productData];
    const prodrecordindex = {};
    var selectedRecords = this.template
      .querySelector("c-custom-type-datatable")
      .getSelectedRows();
    for (var j = 0; j < this.massColumnUpdates.length; j++) {
      for (var i = 0; i < selectedRecords.length; i++) {
      if (this.massColumnUpdates[j].inputValue) {
        nullval = false;
      }
      if (
        this.massColumnUpdates[j].reqDropdown &&
        this.massColumnUpdates[j].selectedDropdownValue == "" &&
        nullval == false &&
        this.massColumnUpdates[j].inputValue != ""
      ) {
        const event = new ShowToastEvent({
          title: "Error",
          message: "Please Select Discount Type",
          variant: "error",
          mode: "dismissable"
        });
        this.dispatchEvent(event);
        typeval = false;
        break;
      }
      if (
        this.massColumnUpdates[j].reqDropdown &&
        this.massColumnUpdates[j].selectedDropdownValue == "Flat" &&
        this.massColumnUpdates[j].discountoption == "" &&
        this.massColumnUpdates[j].inputValue != ""
      ) {
        const event = new ShowToastEvent({
          title: "Error",
          message: "Please Select  Type",
          variant: "error",
          mode: "dismissable"
        });
        this.dispatchEvent(event);
        typeval = false;
        break;
      } else if (
        this.massColumnUpdates[j].reqDropdown &&
        this.massColumnUpdates[j].selectedDropdownValue == "Volume"
      ) {
        nullval = false;
        for (let z = 0; z < this.itemList.length; z++) {
          if (
            (!this.itemList[z].hasOwnProperty("UpperBound") ||
              this.itemList[z].UpperBound === "" ||
              this.itemList[z].UpperBound === undefined) &&
            (!this.itemList[z].hasOwnProperty("discountoption") ||
              this.itemList[z].discountoption === "" ||
              this.itemList[z].discountoption === undefined) &&
            (!this.itemList[z].hasOwnProperty("Discount") ||
              this.itemList[z].Discount === "" ||
              this.itemList[z].Discount === undefined)
          ) {
            nullval = true;
            break;
          } else if (
            this.itemList[z].UpperBound == "" ||
            this.itemList[z].UpperBound == undefined
          ) {
            const event = new ShowToastEvent({
              title: "Error",
              message: "UpperBound are Null",
              variant: "error",
              mode: "dismissable"
            });
            this.dispatchEvent(event);
            typeval = false;
            break;
          } else if (
            this.itemList[z].discountoption == "" ||
            this.itemList[z].discountoption == undefined
          ) {
            const event = new ShowToastEvent({
              title: "Error",
              message: "discountoption are Null",
              variant: "error",
              mode: "dismissable"
            });
            this.dispatchEvent(event);
            typeval = false;
            break;
          } else if (
            this.itemList[z].Discount == "" ||
            this.itemList[z].Discount == undefined
          ) {
            const event = new ShowToastEvent({
              title: "Error",
              message: "Discount are Null",
              variant: "error",
              mode: "dismissable"
            });
            this.dispatchEvent(event);
            typeval = false;
            break;
          } else if (
            this.itemList[z].Discount > 100 &&
            this.itemList[z].discountoption == "Percent"
          ) {
            const event = new ShowToastEvent({
              title: "Error",
              message: "Discount more than 100%",
              variant: "error",
              mode: "dismissable"
            });
            this.dispatchEvent(event);
            typeval = false;
            break;
          }
          else if (
            this.itemList[z].Discount > selectedRecords[i].listPrice &&
            this.itemList[z].discountoption == "Amount"
          ) {
            const event = new ShowToastEvent({
              title: "Error",
              message: "Discount more than List Price",
              variant: "error",
              mode: "dismissable"
            });
            this.dispatchEvent(event);
            typeval = false;
            break;
          }
        
        }
      }
      if (
        this.massColumnUpdates[j].reqDropdown &&
        this.massColumnUpdates[j].selectedDropdownValue == "Flat" &&
        this.massColumnUpdates[j].discountoption == "Percent" &&
        this.massColumnUpdates[j].inputValue > 100 &&
        nullval == false &&
        typeval == true
      ) {
        const event = new ShowToastEvent({
          title: "Error",
          message: "Discount more than 100%",
          variant: "error",
          mode: "dismissable"
        });
        this.dispatchEvent(event);
        typeval = false;
        break;
      }
      if (
        this.massColumnUpdates[j].reqDropdown &&
        this.massColumnUpdates[j].selectedDropdownValue == "Flat" &&
        this.massColumnUpdates[j].discountoption == "Amount" &&
        this.massColumnUpdates[j].inputValue > selectedRecords[i].listPrice &&
        nullval == false &&
        typeval == true
      ) {
        const event = new ShowToastEvent({
          title: "Error",
          message: "Discount more than List Price",
          variant: "error",
          mode: "dismissable"
        });
        this.dispatchEvent(event);
        typeval = false;
        break;
      }
    }
    }
       for (let z = 0; z < this.itemList.length; z++) {
     console.log(JSON.stringify(ranges)+'ranges');
           console.log(this.itemList[z].UpperBound+'ranges');

          if (ranges.includes(this.itemList[z].UpperBound)) {
            const event = new ShowToastEvent({
              title: "Error",
              message:
                "You cannot enter the same endrange for different ranges",
              variant: "error",
              mode: "dismissable"
            });
            this.dispatchEvent(event);
            inlinetypeval = false;
            break;
          } else {
            ranges.push(this.itemList[z].UpperBound);
          }
     }
    if (nullval == true) {
      const event = new ShowToastEvent({
        title: "Error",
        message: "No Values entered",
        variant: "error",
        mode: "dismissable"
      });
      this.dispatchEvent(event);
      typeval = false;
    }

    if (selectedRecords.length > 0 && typeval == true && nullval == false) {
      for (let z = 0; z < this.itemList.length; z++) {
        for (var i = 0; i < selectedRecords.length; i++) {
          var obj = { ...selectedRecords[i] };
          var draftObj = {};
          draftObj.recordIndex = obj.recordIndex;
          for (var j = 0; j < this.massColumnUpdates.length; j++) {
            obj.selectedDropdownValue =
              this.massColumnUpdates[j].selectedDropdownValue;
            if (
              this.itemList[z].UpperBound != null &&
              this.itemList[z].discountoption != null &&
              this.itemList[z].Discount != null
            ) {
              if (!(obj.recordIndex in prodrecordindex)) {
                prodrecordindex[obj.recordIndex] = true;
                draftObj.recordIndex = obj.recordIndex;

                obj[this.StartRange] = this.itemList[z].UpperBound;
                obj.discountoption = this.itemList[z].discountoption;
                draftObj.discountoption = this.itemList[z].discountoption;
                draftObj[this.StartRange] = this.itemList[z].UpperBound;
                obj[this.discount] = this.itemList[z].Discount;
                draftObj[this.discount] = this.itemList[z].Discount;
              } else {
                obj.recordIndex = this.index++;
                prodrecordindex[obj.recordIndex] = true;
                draftObj.recordIndex = obj.recordIndex;
                obj[this.StartRange] = this.itemList[z].UpperBound;
                obj.discountoption = this.itemList[z].discountoption;
                draftObj.discountoption = this.itemList[z].discountoption;
                draftObj[this.StartRange] = this.itemList[z].UpperBound;
                obj[this.discount] = this.itemList[z].Discount;
                draftObj[this.discount] = this.itemList[z].Discount;
              }
            }

            if (this.massColumnUpdates[j].inputValue) {
              if (this.massColumnUpdates[j].type == "customName") {
                obj[this.massColumnUpdates[j].fieldName] =
                  this.massColumnUpdates[j].inputValue;
                draftObj[this.massColumnUpdates[j].fieldName] =
                  this.massColumnUpdates[j].inputValue;
              } else if (this.massColumnUpdates[j].type == "customCombox") {
                var hasValue = false;
                for (var k = 0; k < obj.options.length; k++) {
                  if (
                    obj.options[k].value == this.massColumnUpdates[j].inputValue
                  ) {
                    hasValue = true;
                  }
                }
                if (hasValue) {
                  obj[this.massColumnUpdates[j].selectedField] =
                    this.massColumnUpdates[j].inputValue;
                  draftObj[this.massColumnUpdates[j].fieldName] =
                    this.massColumnUpdates[j].inputValue;
                }
              } else {
                if (this.massColumnUpdates[j].reqDropdown) {
                  obj.selectedDropdownValue =
                    this.massColumnUpdates[j].selectedDropdownValue;
                  obj.discountoption = this.massColumnUpdates[j].discountoption;
                }
                obj[this.massColumnUpdates[j].fieldName] =
                  this.massColumnUpdates[j].inputValue;
                draftObj[this.massColumnUpdates[j].fieldName] =
                  this.massColumnUpdates[j].inputValue;
              }
            }
          }
          editedArray.push(draftObj);
          this.mapProductData[obj.recordIndex] = obj;
          dataArray.push(obj);
           if(obj.selectedDropdownValue=='Volume'){
          this.itemListmap[obj.recordIndex]=this.itemList;
          }else{
            this.flatmap[obj.recordIndex]=obj;
          }
        }
      }
      const proddataa = dataArray.filter((record) => {
        return !selectedRecords.some(
          (selected) => selected.recordIndex === record.recordIndex
        );
      });
      const arrinit = [];
      for (var i = 0; i < this.initialRecords.length; i++) {
        var obj = { ...this.initialRecords[i] };
        obj = this.mapProductData[obj.recordIndex]
          ? this.mapProductData[obj.recordIndex]
          : obj;
        arrinit.push(obj);
      }
      this.initialRecords = arrinit.concat(proddataa);

      const arr = [];
      for (var i = 0; i < this.productData.length; i++) {
        var obj = { ...this.productData[i] };
        obj = this.mapProductData[obj.recordIndex]
          ? this.mapProductData[obj.recordIndex]
          : obj;
        arr.push(obj);
      }

      this.productData = arr.concat(proddataa);
      this.saveDraftValues =
        this.saveDraftValues.length > 0
          ? this.saveDraftValues.concat(editedArray)
          : editedArray;
      this.itemList = [
        {
          id: 0
        }
      ];
      this.closeMassEditPopup();
      this.selectedids = [];
    }
  }
   updateinlineEditPopup() {
    let inlinetypeval = true;
    let valuenull = true;
    const ranges = [];
    var dataArray = [];
    var editedArray = [];
    this.cancelArray = [...this.productData];
    const proddata = this.productData.filter(
      (element) => element.recordIndex == this.inlinerecordindex
    );
    for (var j = 0; j < this.inlineEditCol.length; j++) {
      if (this.inlineEditCol[j].inputValue) {
        valuenull = false;
      }
      if (
        this.inlineEditCol[j].reqDropdown &&
        this.inlineEditCol[j].selectedDropdownValue == "" &&
        valuenull == false &&
        this.inlineEditCol[j].inputValue != ""
      ) {
        const event = new ShowToastEvent({
          title: "Error",
          message: "Please Select Discount Type",
          variant: "error",
          mode: "dismissable"
        });
        this.dispatchEvent(event);
        inlinetypeval = false;
        break;
      }
      if (
        this.inlineEditCol[j].reqDropdown &&
        this.inlineEditCol[j].selectedDropdownValue == "Flat" &&
        this.inlineEditCol[j].discountoption == "" &&
        this.inlineEditCol[j].inputValue != ""
      ) {
        const event = new ShowToastEvent({
          title: "Error",
          message: "Please Select  Type",
          variant: "error",
          mode: "dismissable"
        });
        this.dispatchEvent(event);
        inlinetypeval = false;
        break;
      } else if (
        this.inlineEditCol[j].reqDropdown &&
        this.inlineEditCol[j].selectedDropdownValue == "Volume"
      ) {
        valuenull = false;
        for (let z = 0; z < this.itemList.length; z++) {
          if (
            (!this.itemList[z].hasOwnProperty("UpperBound") ||
              this.itemList[z].UpperBound === "" ||
              this.itemList[z].UpperBound === undefined) &&
            (!this.itemList[z].hasOwnProperty("discountoption") ||
              this.itemList[z].discountoption === "" ||
              this.itemList[z].discountoption === undefined) &&
            (!this.itemList[z].hasOwnProperty("Discount") ||
              this.itemList[z].Discount === "" ||
              this.itemList[z].Discount === undefined)
          ) {
            valuenull = true;

            break;
          } else if (
            this.itemList[z].UpperBound == "" ||
            this.itemList[z].UpperBound == undefined
          ) {
            const event = new ShowToastEvent({
              title: "Error",
              message: "UpperBound are Null",
              variant: "error",
              mode: "dismissable"
            });
            this.dispatchEvent(event);
            inlinetypeval = false;
            break;
          } else if (
            this.itemList[z].discountoption == "" ||
            this.itemList[z].discountoption == undefined
          ) {
            const event = new ShowToastEvent({
              title: "Error",
              message: "discountoption are Null",
              variant: "error",
              mode: "dismissable"
            });
            this.dispatchEvent(event);
            inlinetypeval = false;
            break;
          } else if (
            this.itemList[z].Discount == "" ||
            this.itemList[z].Discount == undefined ||
            !this.itemList[z].Discount
          ) {
            const event = new ShowToastEvent({
              title: "Error",
              message: "Discount are Null",
              variant: "error",
              mode: "dismissable"
            });
            this.dispatchEvent(event);
            inlinetypeval = false;
            break;
          } else if (
            this.itemList[z].Discount > 100 &&
            this.itemList[z].discountoption == "Percent"
          ) {
            const event = new ShowToastEvent({
              title: "Error",
              message: "Discount more than 100%",
              variant: "error",
              mode: "dismissable"
            });
            this.dispatchEvent(event);
            inlinetypeval = false;
            break;
          }
         if (
            this.itemList[z].discountoption == "Amount"
          ) { 
        for (var i = 0; i < proddata.length; i++) {
          if (
            this.itemList[z].Discount > proddata[i].listPrice
          ) {
            const event = new ShowToastEvent({
              title: "Error",
              message: "Discount more than List Price",
              variant: "error",
              mode: "dismissable"
            });
            this.dispatchEvent(event);
            inlinetypeval = false;
            break;
          }
          }

        }
          if (ranges.includes(this.itemList[z].UpperBound)) {
            const event = new ShowToastEvent({
              title: "Error",
              message:
                "You cannot enter the same endrange for different ranges",
              variant: "error",
              mode: "dismissable"
            });
            this.dispatchEvent(event);
            inlinetypeval = false;
            break;
          } else {
            ranges.push(this.itemList[z].UpperBound);
          }
        }
      }
      if (
        this.inlineEditCol[j].reqDropdown &&
        this.inlineEditCol[j].selectedDropdownValue == "Flat" &&
        this.inlineEditCol[j].discountoption == "Percent" &&
        this.inlineEditCol[j].inputValue > 100 &&
        valuenull == false &&
        inlinetypeval == true
      ) {
        const event = new ShowToastEvent({
          title: "Error",
          message: "Discount more than 100%",
          variant: "error",
          mode: "dismissable"
        });
        this.dispatchEvent(event);
        inlinetypeval = false;
        break;
      }
      
        for (var i = 0; i < proddata.length; i++) {
            if (
        this.inlineEditCol[j].reqDropdown &&
        this.inlineEditCol[j].selectedDropdownValue == "Flat" &&
        this.inlineEditCol[j].discountoption == "Amount" &&
        this.inlineEditCol[j].inputValue >  proddata[i].listPrice &&
        valuenull == false &&
        inlinetypeval == true
      ) {
        const event = new ShowToastEvent({
          title: "Error",
          message: "Discount more than List Price",
          variant: "error",
          mode: "dismissable"
        });
        this.dispatchEvent(event);
        inlinetypeval = false;
        break;
      }

        }
    }
    if (valuenull == true) {
      const event = new ShowToastEvent({
        title: "Error",
        message: "No Values entered",
        variant: "error",
        mode: "dismissable"
      });
      this.dispatchEvent(event);
      inlinetypeval = false;
    }
    
    const prodrecordindex = {};
  for (let z = 0; z < this.itemList.length; z++) {
        for (var i = 0; i < this.productData.length; i++) {
         if(   this.productData[i].StartRange == this.itemList[z].UpperBound&&
              this.productData[i].discountoption == this.itemList[z].discountoption&&
                    this.productData[i].discount == this.itemList[z].Discount)
                    {
                      
                    prodrecordindex[this.productData[i].recordIndex] = true;
                    }

        }
  }
console.log(JSON.stringify(this.itemList)+'this.productDataitemlist');
console.log(JSON.stringify(this.productData)+'this.productData');
    if (this.inlinerecordindex && valuenull == false && inlinetypeval == true) {
 for (let z = 0; z < this.itemList.length; z++) {
    for (let i = 0; i < this.productData.length; i++) {
        let obj = { ...this.productData[i] };

        if ((this.inlinerecordindex == obj.recordIndex || obj.recordIndex == this.itemList[z].dataindex) &&
            this.itemList[z].record != true) {
                 console.log(JSON.stringify(this.productData[i]) + ' proddata[i]');
       
            let draftObj = {};
            draftObj.recordIndex = obj.recordIndex;
            for (let j = 0; j < this.inlineEditCol.length; j++) {
                console.log(JSON.stringify(this.inlineEditCol[j]) + ' this.inlineEditCol[j]');

                if (this.itemList[z].UpperBound != null &&
                    this.itemList[z].discountoption != null &&
                    this.itemList[z].Discount != null) {

                    if (this.inlineEditCol[j].reqDropdown) {
                        obj.selectedDropdownValue = this.inlineEditCol[j].selectedDropdownValue;
                        console.log(JSON.stringify(this.itemList[z]) + ' this.itemList[z]');

                        if (this.itemList[z].dataindex == obj.recordIndex) {
                            prodrecordindex[obj.recordIndex] = true;
                            draftObj.recordIndex = obj.recordIndex;

                            obj.StartRange = this.itemList[z].UpperBound;
                            obj.discountoption = this.itemList[z].discountoption;
                            draftObj.discountoption = this.itemList[z].discountoption;
                            draftObj.StartRange = this.itemList[z].UpperBound;
                            obj.discount = this.itemList[z].Discount;
                            draftObj.discount = this.itemList[z].Discount;
                            console.log(obj.discount + ' obj.discount');
                            console.log(JSON.stringify(obj) + ' obj');
                            this.itemList[z].record = true;
                            this.itemList[z].dataindex = obj.recordIndex;
                            this.itemListmap[obj.recordIndex] = this.itemList;
                        } else if (!(obj.recordIndex in prodrecordindex) && !this.itemList[z].dataindex) {
                            prodrecordindex[obj.recordIndex] = true;

                            draftObj.recordIndex = obj.recordIndex;

                            obj.StartRange = this.itemList[z].UpperBound;
                            obj.discountoption = this.itemList[z].discountoption;
                            draftObj.discountoption = this.itemList[z].discountoption;
                            draftObj.StartRange = this.itemList[z].UpperBound;
                            obj.discount = this.itemList[z].Discount;
                            draftObj.discount = this.itemList[z].Discount;
                            console.log(obj.discount + ' obj.discount');
                            this.itemList[z].record = true;
                            this.itemList[z].dataindex = obj.recordIndex;
                            this.itemListmap[obj.recordIndex] = this.itemList;
                        } else if (!this.itemList[z].dataindex) {
                            prodrecordindex[obj.recordIndex] = true;
                            obj.recordIndex = this.index++;
                            draftObj.recordIndex = obj.recordIndex;
                            prodrecordindex[obj.recordIndex] = true;
                            obj.StartRange = this.itemList[z].UpperBound;
                            obj.discountoption = this.itemList[z].discountoption;
                            draftObj.discountoption = this.itemList[z].discountoption;
                            draftObj.StartRange = this.itemList[z].UpperBound;
                            obj.discount = this.itemList[z].Discount;
                            console.log(obj.discount + ' obj.discount');
                            draftObj.discount = this.itemList[z].Discount;
                            this.itemList[z].record = true;
                            this.itemList[z].dataindex = obj.recordIndex;
                            this.itemListmap[obj.recordIndex] = this.itemList;
                        }
                        console.log(JSON.stringify(this.itemList[z])+'Itemlist');
                    }
                }

                if (this.inlineEditCol[j].inputValue) {
                    if (this.inlineEditCol[j].type === "customName") {
                        obj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                        draftObj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                    } else if (this.inlineEditCol[j].type === "customCombox") {
                        let hasValue = false;
                        for (let k = 0; k < obj.options.length; k++) {
                            if (obj.options[k].value === this.inlineEditCol[j].inputValue) {
                                hasValue = true;
                            }
                        }
                        if (hasValue) {
                            obj[this.inlineEditCol[j].selectedField] = this.inlineEditCol[j].inputValue;
                            draftObj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                        }
                    } else {
                        if (this.inlineEditCol[j].reqDropdown) {
                            obj.selectedDropdownValue = this.inlineEditCol[j].selectedDropdownValue;
                            obj.discountoption = this.inlineEditCol[j].discountoption;

                            if (obj.selectedDropdownValue === "PriceOverride") {
                                obj.price = this.inlineEditCol[j].inputValue;
                                draftObj.price = this.inlineEditCol[j].inputValue;
                            } else {
                                obj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                                draftObj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                            }

                        } else {
                            obj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                            draftObj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                        }
                    }
                }
            }
          //  editedArray.push(draftObj);
          
             const isOnlyRecordIndex2 = Object.keys(draftObj).length === 1;
                if (!isOnlyRecordIndex2) {
            editedArray.push(draftObj);
             }
            console.log(JSON.stringify(draftObj) + 'draftObj');
            console.log(JSON.stringify(editedArray) + 'editedArray');
            this.mapProductData[obj.recordIndex] = obj;
            dataArray.push(obj);
            this.flatdiscount = false;
            this.Volumediscount = false;
            if (obj.selectedDropdownValue === 'Volume') {
                this.itemListmap[obj.recordIndex] = this.itemList;
            } else {
                this.flatmap[obj.recordIndex] = obj;
            }
        }
    }
    // this.itemList[this.itemList[z].id] = this.itemList[z]!=''||null?this.itemList[z]:[];

}

      const arrinit = [];
      for (var i = 0; i < this.initialRecords.length; i++) {
        var obj = { ...this.initialRecords[i] };
        obj = this.mapProductData[obj.recordIndex]
          ? this.mapProductData[obj.recordIndex]
          : obj;
        arrinit.push(obj);
      }
      const proddataa = dataArray.filter(
        (element) => element.recordIndex != this.inlinerecordindex
      );
      console.log(JSON.stringify(this.itemListmap)+'Itemlist last');
      console.log(JSON.stringify(this.itemList)+'Itemlist');

      console.log(JSON.stringify(proddataa) + 'proddataa');
            console.log(JSON.stringify(arrinit) + 'arrinit');
            const seen1 = new Set();
      const datainit = arrinit.concat(proddataa);
       console.log(JSON.stringify(datainit) + 'datainit');
       this.initialRecords = datainit.filter(record => {
            const duplicate = seen1.has(record.recordIndex);
            seen1.add(record.recordIndex);
            return !duplicate;
        });
      const arr = [];
      for (var i = 0; i < this.productData.length; i++) {
        var obj = { ...this.productData[i] };
        obj = this.mapProductData[obj.recordIndex]
          ? this.mapProductData[obj.recordIndex]
          : obj;
        arr.push(obj);
      }
       const data = arr.concat(proddataa);
const seen = new Set();
        this.productData = data.filter(record => {
            const duplicate = seen.has(record.recordIndex);
            seen.add(record.recordIndex);
            return !duplicate;
        });
      this.saveDraftValues =
        this.saveDraftValues.length > 0
          ? this.saveDraftValues.concat(editedArray)
          : editedArray;
      this.closeinlineEditPopup();
      this.selectedids = [];
      this.itemList = [
        {
          id: 0
        }
      ];
    }
    console.log(JSON.stringify(this.itemListmap)+'Map');
  }
  async onReset() {
    const result = await LightningConfirm.open({
      message: "Do you want undo discounts applied",
      variant: "header",
      theme: "gray",
      label: "Undo Data"
    });
    if (result == true) {
      this.handleConfirmClick();
    }
  }
  handleConfirmClick() {
    this.productData = this.initialData;
    this.initialRecords = this.initialData;
    let datawithindex = { productdata: this.initialData, index: this.index };

    const discountdata = new CustomEvent("discount", {
      detail: datawithindex,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(discountdata);
  }
 handleSearch(event) {
    const searchKey = event.target.value.toLowerCase();
    this.searchKey=searchKey;
       var initialArray = [];
    for (var i = 0; i < this.initialRecords.length; i++) {
      var obj = { ...this.initialRecords[i] };
      obj = this.mapProductData[obj.recordIndex]
        ? this.mapProductData[obj.recordIndex]
        : obj;
      initialArray.push(obj);
    }

    if (searchKey) {
      if (initialArray) {
        let searchRecords = [];
        for (let record of initialArray) {
          let valuesArray = Object.values(record);
          for (let val of valuesArray) {
            let strVal = String(val);
            if (strVal) {
              if (strVal.toLowerCase().includes(searchKey)) {
                searchRecords.push(record);
                break;
              }
            }
          }
        }
         this.columns.forEach((column) => {
      var filterValue = this.columnFilterValues[column.fieldName];
      if (filterValue) {
        searchRecords = searchRecords.filter((row) => {
          var recName;
          if (column.type == "customName") {
            recName = row[column.typeAttributes.fieldapiname]
              ? row[column.typeAttributes.fieldapiname]
              : "";
          } else {
            recName = row[column.fieldName];
          }
          const regex = new RegExp(filterValue, "i");
          if (regex.test(recName)) {
            return true;
          }
          return false;
        });
      }
    });
        this.productData = searchRecords;
      }
    } else {
      let arr = [];
      for (var i = 0; i < this.initialRecords.length; i++) {
        var obj = { ...this.initialRecords[i] };
        obj = this.mapProductData[obj.recordIndex]
          ? this.mapProductData[obj.recordIndex]
          : obj;
        arr.push(obj);
      }
      console.log(JSON.stringify(arr)+'nefrorearr');
            this.columns.forEach((column) => {
      var filterValue = this.columnFilterValues[column.fieldName];
      console.log(JSON.stringify(filterValue)+'filterValue');
      if (filterValue) {
          console.log(JSON.stringify(arr)+'before in');
        arr = arr.filter((row) => {
          var recName;
           console.log(JSON.stringify(recName)+'recName in');
          if (column.type == "customName") {
            recName = row[column.typeAttributes.fieldapiname]
              ? row[column.typeAttributes.fieldapiname]
              : "";
          } else {
            recName = row[column.fieldName];
             console.log(JSON.stringify(recName)+'recName in wlse');
          }
          const regex = new RegExp(filterValue, "i");
           console.log(regex.test(recName)+'regex.test(recName) in wlse');
          if (regex.test(recName)) {
            return true;
          }
          return false;
        });
        console.log(JSON.stringify(arr)+'in');
      }
    });
    
      console.log(JSON.stringify(arr)+'after');
      this.productData = arr;
    }
  }
  handleCancel() {
    if (this.cancelArray.length > 0) {
      this.productData = this.cancelArray;
      this.cancelArray = [];
    }
  }

  handleInputType(event) {
    if (this.isInlinepopup == true) {
      for (var j = 0; j < this.inlineEditCol.length; j++) {
        if (this.inlineEditCol[j].fieldName == event.target.name) {
          this.inlineEditCol[j].inputValue =
            this.inlineEditCol[j].type == "customName"
              ? event.detail.recordId
              : event.detail.value;
        } else if (this.inlineEditCol[j].reqDropdown == true) {
          if (event.target.name == "DiscountType") {
            this.inlineEditCol[j].selectedDropdownValue = event.detail.value;
            if (event.detail.value == "Flat") {
              this.flatdiscount = true;
              this.Volumediscount = false;
            } else {
              this.Volumediscount = true;
              this.flatdiscount = false;
            }
          } else if (event.target.name == "Type") {
            this.inlineEditCol[j].discountoption = event.detail.value;
          }
        }
      }
    } else {
      for (var j = 0; j < this.massColumnUpdates.length; j++) {
        if (this.massColumnUpdates[j].fieldName == event.target.name) {
          this.massColumnUpdates[j].inputValue =
            this.massColumnUpdates[j].type == "customName"
              ? event.detail.recordId
              : event.detail.value;
        } else if (this.massColumnUpdates[j].reqDropdown == true) {
          if (event.target.name == "DiscountType") {
            this.massColumnUpdates[j].selectedDropdownValue =
              event.detail.value;
            if (event.detail.value == "Flat") {
              this.flatdiscount = true;
              this.Volumediscount = false;
            } else {
              this.Volumediscount = true;
              this.flatdiscount = false;
            }
          } else if (event.target.name == "Type") {
            this.massColumnUpdates[j].discountoption = event.detail.value;
          }
        }
      }
    }
  }
  closeMassEditPopup() {
    this.selectedids = [];
    this.isMassEditPopup = false;
    this.flatdiscount = false;
    this.Volumediscount = false;
    this.itemList = [
      {
        id: 0
      }
    ];
  }
  handleInputType1(event) {
    

    const index = event.currentTarget.dataset.index;

    if (this.itemList[index]) {
      const item = this.itemList[index];
      if (event.target.name === "UpperBound") {
        item.UpperBound = event.target.value;
        item.record=false;
      } else if (event.target.name === "Discount") {
        item.Discount = event.target.value;
        item.record=false;
      } else if (event.target.name === "Type") {
        item.discountoption = event.target.value;
        item.record=false;
      }
      console.log(JSON.stringify(this.itemList[index])+'this.itemList[index]');
      this.itemList[index] = item;
    } else {
      console.error("Item not found at index:", index);
    }
  }
  handleButtonActions(event) {
    console.log(event.target.label);
    console.log(JSON.stringify(this.productData));
    const prodids = this.productData.map((item) => item.productId);

  }

  handleSave(event) {
    this.saveDraftValues = event.detail.draftValues;
    var dataArray = [];
    this.totalNetPrice = 0;
    for (var i = 0; i < this.productData.length; i++) {
      var obj = { ...this.productData[i] };
      
      for (var j = 0; j < this.saveDraftValues.length; j++) {
        if (
          this.productData[i].recordIndex == this.saveDraftValues[j].recordIndex
        ) {
          for (var k = 0; k < this.fieldinlineAPIs.length; k++) {
          
            if (this.saveDraftValues[j][this.fieldinlineAPIs[k]]) {
              if (this.fieldinlineAPIs[k] == "aggrementVal") {
                obj.selectedValue =
                  this.saveDraftValues[j][this.fieldinlineAPIs[k]];
              } else {
                obj[this.fieldinlineAPIs[k]] =
                  this.saveDraftValues[j][this.fieldinlineAPIs[k]];
              }
              if (
                this.fieldinlineAPIs[k] == this.discount ||
                this.fieldinlineAPIs[k] == this.price
              ) {
                if (
                  this.netPrice &&
                  this.listPrice &&
                  obj[this.discount] &&
                  obj[this.listPrice]
                ) {
                  
                  if (obj.discountoption == "Amount") {
                    obj[this.netPrice] =
                      obj[this.listPrice] - obj[this.discount];
                  } else {
                    obj[this.netPrice] =
                      obj[this.listPrice] -
                      (obj[this.listPrice] * obj[this.discount]) / 100;
                  }
                } else if (this.listPrice && this.netPrice) {
                  obj[this.netPrice] = obj[this.listPrice];
                }
              }
            }
          }
        }
      }

      this.mapProductData[obj.recordIndex] = obj;
      dataArray.push(obj);
    }
    this.productData = dataArray;

    this.saveDraftValues = [];
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Success!!",
        message: "Saved Successfully!!!",
        variant: "success"
      })
    );
    const arr = [];
    for (var i = 0; i < this.initialRecords.length; i++) {
      var obj = { ...this.initialRecords[i] };
      obj = this.mapProductData[obj.recordIndex]
        ? this.mapProductData[obj.recordIndex]
        : obj;
      arr.push(obj);
    }
    let datawithindex = { productdata: arr, index: this.index };
    const discountdata = new CustomEvent("discount", {
      detail: datawithindex,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(discountdata);
    this.selectedids = [];
  }

  onrowaction(event) {
    const id = event.detail.index;
    this.totalNetPrice = 0;

   this.inlinerecordindex = event.detail.index;
    
   if (event.detail.name == "Discounts") {
       var obj=[];
     const proddata = this.productData.filter(
      (element) => element.recordIndex == this.inlinerecordindex
    ); for (var i = 0; i < proddata.length; i++) {
          if (this.inlinerecordindex == proddata[i].recordIndex && proddata[i].selectedDropdownValue!='') {
           obj = { ...proddata[i] };
          break
          }
    }
      this.isInlinepopup = true;
      console.log(obj.selectedDropdownValue+'obj.selectedDropdownValue==');
      if(this.itemListmap[this.inlinerecordindex] && obj.selectedDropdownValue=='Volume' ){
        for (var j = 0; j < this.inlineEditCol.length; j++) {
        this.inlineEditCol[j].inputValue = "";
        this.inlineEditCol[j].selectedDropdownValue = "Volume";
        this.inlineEditCol[j].discountoption = "";
      }
        this.itemList=this.itemListmap[this.inlinerecordindex];
        this.Volumediscount=true;
      }
      else if(obj.selectedDropdownValue=='Flat' && this.flatmap[this.inlinerecordindex]){
        for (var j = 0; j < this.inlineEditCol.length; j++) {
        this.inlineEditCol[j].inputValue = obj.discount;
        this.inlineEditCol[j].selectedDropdownValue = "Flat";
        this.inlineEditCol[j].discountoption = obj.discountoption;
      }
          this.flatdiscount = true;

      }
      else{
      for (var j = 0; j < this.inlineEditCol.length; j++) {
        this.inlineEditCol[j].inputValue = "";
        this.inlineEditCol[j].selectedDropdownValue = "";
        this.inlineEditCol[j].discountoption = "";
      }
      }
    }
  }
  closeinlineEditPopup() {
    this.isInlinepopup = false;
    this.flatdiscount = false;
    this.Volumediscount = false;
    this.itemList = [
      {
        id: 0
      }
    ];
  }

  toggleInput() {
    this.showInput = !this.showInput;
  }

  doSorting(event) {
    this.sortBy = event.detail.fieldName;
    this.sortDirection = event.detail.sortDirection;
    this.sortData(this.sortBy, this.sortDirection);
  }

  sortData(fieldname, direction) {
    let parseData = JSON.parse(JSON.stringify(this.productData));

    if (this.mapSortColumn[fieldname]) {
      fieldname = this.mapSortColumn[fieldname];
    }

    let keyValue = (a) => {
      return a[fieldname];
    };
    // cheking reverse direction
    let isReverse = direction === "asc" ? 1 : -1;
    // sorting data
    parseData.sort((x, y) => {
      x = keyValue(x) ? keyValue(x) : ""; // handling null values
      y = keyValue(y) ? keyValue(y) : "";
      // sorting values based on direction
      return isReverse * ((x > y) - (y > x));
    });
    this.productData = parseData;
  }

  handleHeaderAction(event) {
    const actionName = event.detail.action.name;
    if (actionName.search("filter") === -1 && actionName.search("clear") === -1)
      return;
    const colDef = event.detail.columnDefinition;
    const columnName = colDef.fieldName;
    const findIndexByName = (name) => {
      const lowerCaseName = name.toLowerCase();
      return this.columns.findIndex(
        (column) =>
          column.fieldName.toLowerCase() === lowerCaseName ||
          column.fieldName.toLowerCase().endsWith(`${lowerCaseName}__c`)
      );
    };
    this.columnIndex = findIndexByName(columnName);
    const fieldNameWithC = this.columns[this.columnIndex].label;
    this.inputLabel = "Filter for " + this.columns[this.columnIndex].label;

    switch (actionName) {
      case "filter":
        this.handleOpenFilterInput();
        break;
      case "clear":
        const filterColumnName = this.columns[this.columnIndex].fieldName;
        delete this.columnFilterValues[filterColumnName];
        this.handleFilterRecords(actionName);
        this.columns[this.columnIndex].actions = this.columns[
          this.columnIndex
        ].actions.map((action) => {
          if (action.name === "clear") {
            return { ...action, disabled: true };
          }
          return action;
        });
        break;

      default:
    }
  }

  handleOpenFilterInput() {
    const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
    this.filterAppliedValue = this.mapFilterData[filterColumnName];
    this.isOpenFilterInput = true;
  }

  handleFilterRecords(actionName) {
    var initialArray = [];
    for (var i = 0; i < this.initialRecords.length; i++) {
      var obj = { ...this.initialRecords[i] };
      obj = this.mapProductData[obj.recordIndex]
        ? this.mapProductData[obj.recordIndex]
        : obj;
      initialArray.push(obj);
    }
    this.initialRecords = initialArray;
    var dataArray = [...this.initialRecords];
    const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
    this.mapFilterData[filterColumnName] = this.filterAppliedValue;
    this.columns.forEach((column) => {
      var filterValue = this.columnFilterValues[column.fieldName];
      if (filterValue) {
        dataArray = dataArray.filter((row) => {
          var recName;
          if (column.type == "customName") {
            recName = row[column.typeAttributes.fieldapiname]
              ? row[column.typeAttributes.fieldapiname]
              : "";
          } else {
            recName = row[column.fieldName];
          }
          const regex = new RegExp(filterValue, "i");
          if (regex.test(recName)) {
            return true;
          }
          return false;
        });
      }
    });
    this.columns[this.columnIndex].actions = this.columns[
      this.columnIndex
    ].actions.map((action) => {
      if (action.name === "clear") {
        return { ...action, disabled: false };
      }
      return action;
    });
    this.columns = [...this.columns];
        if (this.searchKey) {
      if (dataArray) {
        let searchRecords = [];
        for (let record of dataArray) {
          let valuesArray = Object.values(record);
          for (let val of valuesArray) {
            let strVal = String(val);
            if (strVal) {
              if (strVal.toLowerCase().includes(this.searchKey)) {
                searchRecords.push(record);
                break;
              }
            }
          }
        }
        dataArray = searchRecords;
      }
    }
    this.productData = dataArray;
    this.closeFilterModal();
    if (this.template.querySelector(".divDataTable")) {
      if (actionName === "clear") {
        this.addCustomStyle("span", "#f3f3f3");
        this.addCustomStyle("span a.slds-th__action", "#f3f3f3");
      } else {
        this.addCustomStyle("span", "#a0cfa0");
        this.addCustomStyle("span a.slds-th__action", "#a0cfa0");
        this.addCustomStyle(".slds-dropdown__item", "transparent");
        this.addCustomStyle(".slds-dropdown__item span", "transparent");
        this.addCustomStyle(".span a.slds-th__action:focus:hover", "#a0cfa0");
      }
    }
  }

  addCustomStyle(selector, backgroundColor) {
    let style = document.createElement("style");
    style.innerText =
      ".divDataTable .slds-table thead th:nth-child(" +
      (this.columnIndex + 3) +
      ") " +
      selector +
      " { background-color: " +
      backgroundColor +
      ";}";
    this.template.querySelector(".divDataTable").appendChild(style);
  }

  handleChange(event) {
    const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
    this.columnFilterValues[filterColumnName] = event.target.value;
    this.filterAppliedValue = event.target.value;
  }
  onRowSelection(event) {
    this.selectedrows = event.detail.selectedRows;
  }
  cloneProducts() {
    var selectedRecords = this.template
      .querySelector("c-custom-type-datatable")
      .getSelectedRows();
    this.selectedrows = selectedRecords;
    const selectedIds = Array.from(selectedRecords).map(
      (item) => item.recordIndex
    );
    this.selectedids = selectedIds;

    const productDataWithIndex = this.selectedrows.map((record, i) => {
      return { ...record, recordIndex: this.index++ };
    });

    const cloningdata = [...this.productData];
    cloningdata.push(...productDataWithIndex);
    this.productData = cloningdata;
    const initalrec = [...this.initialRecords];
    initalrec.push(...productDataWithIndex);
    this.initialRecords = initalrec;
    const arr = [];
    for (var i = 0; i < this.productData.length; i++) {
      var obj = { ...this.productData[i] };
      obj = this.mapProductData[obj.recordIndex]
        ? this.mapProductData[obj.recordIndex]
        : obj;
      arr.push(obj);
    }

    let datawithindex = { productdata: arr, index: this.index };

    const discountdata = new CustomEvent("discount", {
      detail: datawithindex,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(discountdata);

    this.selectedrows = [];
    this.selectedids = [];
  }
  deleterecords() {
    var selectedRecords = this.template
      .querySelector("c-custom-type-datatable")
      .getSelectedRows();
    this.selectedrows = selectedRecords;
    const selectedIds = Array.from(selectedRecords).map(
      (item) => item.recordIndex
    );
    this.selectedids = selectedIds;
    this.productData = this.productData.filter((record) => {
      return !this.selectedrows.some(
        (selected) => selected.recordIndex === record.recordIndex
      );
    });
    const initrec = this.initialRecords.filter((record) => {
      return !this.selectedrows.some(
        (selected) => selected.recordIndex == record.recordIndex
      );
    });
    this.initialRecords = initrec;
    selectedRecords.forEach((record) => {
      this.mapProductData.delete(record.recordIndex);
    });

    const arr = [];
    for (var i = 0; i < this.productData.length; i++) {
      var obj = { ...this.productData[i] };
      obj = this.mapProductData[obj.recordIndex]
        ? this.mapProductData[obj.recordIndex]
        : obj;
      arr.push(obj);
    }

    let datawithindex = { productdata: arr, index: this.index };

    const discountdata = new CustomEvent("discount", {
      detail: datawithindex,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(discountdata);

    const deletedata = new CustomEvent("productdatadelete", {
      detail: selectedRecords,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(deletedata);
  }

  closeFilterModal() {
    this.isOpenFilterInput = false;
    this.filterAppliedValue = "";
  }

  renderedCallback() {
     if (!this.componentLoaded) {
    if (this.template.querySelector(".divDataTable")) {
      this.applyStyles(
          ".divDataTable",
          ".slds-is-absolute {position: fixed;}"
        );
        this.applyStyles(
          ".divDataTable",
          ".slds-button_icon.slds-input__icon {z-index: 0;}"
        );
        this.applyStyles(
          ".divDataTable",
          ".slds-input__icon.slds-icon-utility-down {z-index: 0;}"
        );
        this.applyStyles(
          ".divDataTable",
          ".slds-truncate {overflow: visible;}"
        );
        this.applyStyles(
          ".divDataTable",
          ".divDataTable lightning-button-icon:nth-child(2) .slds-button_icon svg {width: 1.5rem;height: 1.5rem;}"
        );
        this.applyStyles(
          ".divDataTable",
          ".divDataTable lightning-button-icon:nth-child(1) .slds-button_icon svg {width: 1rem;height: 1rem;}"
        );
      }

      this.applyStyles(
        ".divDataTable",
        ".divDataTable .dt-outer-container .slds-table_header-fixed_container {background-color : white}"
      );

      this.componentLoaded = true;
    }
  }

  applyStyles(selector, innerText) {
   if (this.template.querySelector(selector)) {
      let style = document.createElement("style");
      style.innerText = innerText;
      this.template.querySelector(selector).appendChild(style);
    }
  }
}