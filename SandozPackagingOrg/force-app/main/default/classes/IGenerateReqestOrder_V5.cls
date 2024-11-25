global Interface IGenerateReqestOrder_V5 {
	/**
    * @description 
    * @author CommerceCx | 13-02-2024
    * @param Map<Id Object> scopeObjectLst 
    * @param ; 
    **/
    void fastOrderAddToCart(List<Object> orderData, List<Object> productData);

    void saveProductConfiguration(List<Object> orderData, List<Object> productData);    

    void contractedProductsAddToCart(String recId,List<Object> scopeObjectLst);

    void deleteCartConfiguration(String recId);
    
    void reorderAddToCart(String recId,List<Object> scopeObjectLst);
    
    String onBackToCart(String recId);
    
    List<Object> getQuickOrderData(String recId);
    
    List<Object> getReOrderData(String recId);
    
    List<Object> getPricingData(String recId, String fieldsData);
    
    List<Object> getContractedData(String recId);
    
    List<Object> getPricingAggrementData(String productId);
    
    List<Object> fileUpload(String recId,String base64Data, String fieldsData);
    
    Integer getCartRecordCount(String recId);
    
    void errorHandleling(String recId, Exception e);
    
    List<Object> getRecordTypeData();
    
    List<Object> getRecordValues(Id recId, String fieldSetName);

    List<Object> getRecordValuesCheckOutScreen(Id recId, String fieldSetName);
    
    Object getRecordTitle(Id recId);
    
    List<Object> getButtonData(String compName);
    
    map<String,String> getButtonDetails(String buttonLabel, list<string> productData);
}