public with sharing class AddToCartController implements IGenerateReqestOrder_V15 {
	
    /**
     * @description Bar: sample class for deployment practice
     * @return Bar: sample class for deployment practice
     */
    public Object fastOrderAddToCart(List<Object> orderData){
        Object obj;
        return obj;
    }
    
    public List<Object> createConfigLineItems(String configId, List<Object> productData){
        List<Object> obj = new List<Object>();
        return obj;
    }
    
    public Object createConfiguration(String orderId){
        Object obj;
        return obj;
    }
    
    public Object finalizeCart(String configId){
        Object obj;
        return obj;
    }
    
    public Object createOrderLineItems(String orderId, String configId){
        Object obj;
        return obj;
    }
    
    public Object saveCart(String configId){
        Object obj;
        return obj;
    }
    
    public void saveProductConfiguration(List<Object> orderData, List<Object> productData){
        //System.debug(scopeObjectLst);
    }
    
    public void contractedProductsAddToCart(String recId,List<Object> scopeObjectLst){
        //System.debug(scopeObjectLst);
    }
    
    public void reorderAddToCart(String recId,List<Object> scopeObjectLst){
        //System.debug(scopeObjectLst);
    }
    
    public void errorHandleling(String recId, Exception e){
        
    }
    
    public List<Object> getRecordTypeData(){
        return [select Id,Name from RecordType where sObjectType='Account'];
    }
    
    public Object getRecordTitle(Id recId){
        TitleWrapper tw = new TitleWrapper();
        tw.name = [select Id,Name from Account where Id =: recId].Name;
        tw.objName = 'Account';
        tw.iconName = 'standard:account';
        return tw;
    }
    
    public List<Object> bestcontractpricing(String fields,String productdata){
    	 return  new List<Object>(); 
    }
    public List<Object> getButtonData(String compName){
        return  new List<Object>();
    }
    
    public List<Object> getButtonDetails(String buttonLabel, String productData){
        return new List<Object>();
    }
    
    public List<Object> getRecordValues(Id recId, String fieldSetName, Id orderId){
        
        return new List<Object>();
    }

    public List<Object> getOrderLineItems(Id orderid){
        return new List<Object>();
    }
    
    public Object getOrderDetails(Id recId){
        Object obj;
        return obj;
    }
    
    public List<Object> headerInfo(String fieldLabel){
        return new List<Object>();
    }
    
    public List<Object> getHeaderData(Id recId, String typename, Id orderId){
    	return new List<Object>();
    }
    
    public List<Object> getRecordValuesCheckOutScreen(Id recId, String fieldSetName){
        return new List<Object>();
    }

	public map<String,String> getPromotionButtonDetails(String buttonLabel, list<string> productData){
        return new map<String,String>();
    }
    
    public List<Object> getPricingAggrementData(String productId, String fieldsData){
        return new List<Object>();
    }
    
    public String onBackToCart(String recId ){
        return '';
    }
    
    public Integer getCartRecordCount(String recId){
        return 8;
    }
    
    public void deleteCartConfiguration(String recId){
        
    }
    
    public List<Object> getReOrderData(String recId){
        return new List<Object>();
    }
    
    public List<Object> getRangePricing(String fields, String saveDraftValues, String productData){
    	return new List<Object>();
    }
    
    public List<Object> getPricingData(String recId, String fieldsData){
        return new List<Object>();
    }
    
    public List<Object> getContractedData(String recId){
        return new List<Object>();
    }

    public List<Object> fileUpload(String recId, String base64Data, String fieldsData){
        return new List<Object>();
    }
    
    public List<Object> getQuickOrderData(String recId){
        return new List<Object>();
    }
    
    public class TitleWrapper{
		@AuraEnabled
        public String name {get; set;}
        
        @AuraEnabled
        public String objName {get; set;}
        
        @AuraEnabled
        public String iconName {get; set;}     
    }
}