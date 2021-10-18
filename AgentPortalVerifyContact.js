({
    doInit : function(component, event, helper) {
        var action = component.get('c.getListAgentUrns');
        action.setCallback(this, function(response) {
            var state = response.getState();
            
            if (state === "SUCCESS"){
               
               component.set("v.mainContact", response.getReturnValue().mainContact);
               component.set("v.agentList", response.getReturnValue().agentList);
                
               console.log("v.agentList");
                
               component.set("v.contactList", response.getReturnValue().contactList);
                if(response.getReturnValue().agentList.length <= 1){
                    component.set('v.selectedURN', response.getReturnValue().agentList[0].Agent_URN__c);
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    manageAgents : function(component, event, helper) {
        // innitate action, call the apex method getListContactByAgent
        var action = component.get('c.getListContactByAgent');
        // get the urn when button is clicked
        var agentUrn = event.getSource().get("v.value");
        
        component.set('v.selectedURN', agentUrn);
        // pass the agent urn as param into apex action
         action.setParams({
             "agentUrn":agentUrn
         });
        // handle response
        action.setCallback(this, function(response) {
            var state = response.getState();
           
            if (state === "SUCCESS"){                
               component.set("v.contactList", response.getReturnValue());
                
            }else{
               
            }
        });
        // enqueue action to invoke apex code
        $A.enqueueAction(action);
    }
})