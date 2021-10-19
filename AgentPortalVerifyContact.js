({
    doInit : function(component, event, helper) {
        var action = component.get('c.getListAgentUrns');
        action.setCallback(this, function(response) {
            var state = response.getState();
            
            if (state === "SUCCESS"){
               
               component.set("v.mainContact", response.getReturnValue().mainContact);
               component.set("v.agentList", response.getReturnValue().agentList);
                
               console.log(response.getReturnValue().contactList);
                
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
                
                const contacts = response.getReturnValue().contactList;
                
                if (contacts && contacts.length) {
                    component.set('v.contacts', contacts);
                    helper.helperMethod(component, contacts);
                return;
            }
                
            }else{
               
            }
        });
        // enqueue action to invoke apex code
        $A.enqueueAction(action);
    },

    clickContact : function(component, event, helper) {
       // get value 
       var contactId = event.getSource().get("v.value"); 
       var ischecked = event.getSource().get("v.checked"); 
       var selectedUrns = new Set(component.get("v.selectedContactIds"));
       if(ischecked){
           component.set("v.isChecked", true);
           selectedUrns.add(contactId);
       }else{
          component.set("v.isChecked", false);
          selectedUrns.delete(contactId);
       }
       
        component.set("v.selectedContactIds", selectedUrns);
        
        if(selectedUrns.size >= 1){
            component.set("v.isChecked", true);
        } else {
            component.set("v.isChecked", false);
        }
        
       console.log('selectedUrns:', selectedUrns.size);
       console.log(contactId);
       console.log(ischecked);
    },
    clickAll : function(component, event, helper) {
        // get value 
        var contactId = event.getSource().get("v.value"); 
        var ischecked = event.getSource().get("v.checked"); 
        var selectedUrns = new Set();
        var checkedBoxs = component.find("checkContact");
        if(!ischecked){
            component.set("v.selectedContactIds", null);
            checkedBoxs.forEach(row=>{
                if(row.get("v.checked")){
                    row.set("v.checked",false);
                }
            });
        }else{
            var contacts = component.get("v.contactList");

            contacts.forEach(contact => {
                selectedUrns.add(contact.Id);
            });
            checkedBoxs.forEach(row=>{
                if(!row.get("v.checked")){
                    row.set("v.checked",true);
                }
            });
            component.set("v.selectedContactIds", selectedUrns);
            
        }

        console.log('selectedUrns : ' + selectedUrns);
     },
     searchContact : function(component, event, helper) {
        var action = component.get('c.getContactsByEmailName');

        // pass the agent urn as param into apex action
         action.setParams({
             "searchTerm":component.get('v.searchTerm'),
             "agentUrn" : component.get('v.selectedURN')
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
     },
                
     deactivateContact : function(component, event, helper) {
        
        // enqueue action to invoke apex code
        $A.enqueueAction(action);
     },
                
     getPage: function (component, event, helper) {
        helper.pageTransactions(component, event.getSource().get("v.value"));
     }
})