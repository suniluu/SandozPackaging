global Interface IGenerateReqestOrder_V1 {
	/**
    * @description 
    * @author CommerceCx | 13-02-2024
    * @param Map<Id Object> scopeObjectLst 
    * @param ; 
    **/
    void fastOrderAddToCart(String recId, List<Object> scopeObjectLst);
    
    void contractedProductsAddToCart(String recId,List<Object> scopeObjectLst);
    
    void reorderAddToCart(String recId,List<Object> scopeObjectLst);
    
    void onBackToCart(String recId);
    
    List<Object> getQuickOrderData(String recId);
    
    List<Object> getReOrderData(String recId);
    
    List<Object> getPricingData(String recId);
    
    List<Object> getContractedData(String recId);
    
    Map<String,Object> getComboboxData(String recId, Map<String,Object> mapComboboxObj);
    
    List<Object> getPricingAggrementData(String productId);
}