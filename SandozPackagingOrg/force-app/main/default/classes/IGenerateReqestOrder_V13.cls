global Interface IGenerateReqestOrder_V13 {
/**
    * @description 
    * @author CommerceCx | 13-02-2024
    * @param Map<Id Object> scopeObjectLst 
    * @param ; 
    **/
    Object fastOrderAddToCart(List<Object> orderData);
    
    Object createConfiguration(String configId);
    
    List<Object> createConfigLineItems(String configId, List<Object> productData);
    
    Object finalizeCart(String configId);

    Object saveCart(String configId);
    
    Object createOrderLineItems(String orderId, String configId);
        
    void saveProductConfiguration(List<Object> orderData, List<Object> productData);    

    void contractedProductsAddToCart(String recId,List<Object> scopeObjectLst);

    void deleteCartConfiguration(String recId);
    
    void reorderAddToCart(String recId,List<Object> scopeObjectLst);
    
    String onBackToCart(String recId);
    
    List<Object> getQuickOrderData(String recId);
    
    List<Object> getReOrderData(String recId);
    
    List<Object> getPricingData(String recId, String fieldsData);
    
    List<Object> getContractedData(String recId);
    
    List<Object> getPricingAggrementData(String productId, String fieldsData);
    
    List<Object> fileUpload(String recId,String base64Data, String fieldsData);
    
    Integer getCartRecordCount(String recId);
    
    void errorHandleling(String recId, Exception e);
    
    List<Object> getRecordTypeData();
    
    List<Object> getRecordValues(Id recId, String fieldSetName);

    List<Object> getRecordValuesCheckOutScreen(Id recId, String fieldSetName);
    
    Object getRecordTitle(Id recId);
    
    List<Object> getButtonData(String compName);
    
    map<String,String> getButtonDetails(String buttonLabel, String productData);

    map<String,String> getPromotionButtonDetails(String buttonLabel, list<string> productData);
    
    List<Object> headerInfo(String fieldLabel);
    
    List<Object> getHeaderData(Id recId, String typename);
    
    List<Object> getRangePricing(String fields, String saveDraftValues,String productData);
    
    List<Object> bestcontractpricing(String fields,String productdata);
}