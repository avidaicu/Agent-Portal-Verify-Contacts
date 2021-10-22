({
    doInit : function(component, event, helper) {
        component.set("v.isFetching", true);
        var action = component.get('c.getListAgentUrns');
        action.setCallback(this, function(response) {
            var state = response.getState();
            component.set("v.isFetching", false);
            if (state === "SUCCESS"){
               
               component.set("v.mainContact", response.getReturnValue().mainContact);
               component.set("v.agentList", response.getReturnValue().agentList);
               component.set("v.contactListSearched", response.getReturnValue().contactList);
                console.log('response.getReturnValue().agentList: ', response.getReturnValue().agentList);
                if(response.getReturnValue().agentList.length <= 1){
                    helper.handleFilter(component);
                    component.set('v.selectedURN', response.getReturnValue().agentList[0].Agent_URN__c);
                }
                if(response.getReturnValue().contactList.length === 0){
                    component.set("v.doesContactsExist",true);
                }
            }else{
                helper.showToast("Error!", response.getError()[0].message ,"error", "dismissible",15000);
            }
            
        });
        
        $A.enqueueAction(action);
    },
    
    manageAgents : function(component, event, helper) {
        component.set("v.isFetching", true);
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
                component.set("v.contactListSearched", response.getReturnValue());
                helper.handleFilter(component);
            }else{
                helper.showToast("Error!", response.getError()[0].message ,"error", "dismissible",15000);
            }
            component.set("v.isFetching", false);
        });
        // enqueue action to invoke apex code
        $A.enqueueAction(action);
    },

    clickContact : function(component, event, helper) {
       // get value 
       var contactId = event.getSource().get("v.value"); 
       var ischecked = event.getSource().get("v.checked"); 
       var selectedAgents = new Set(component.get("v.selectedContactIds"));
       
       component.set("v.ischecked", ischecked);
       
       if(ischecked){
           selectedAgents.add(contactId);
       }else{
          selectedAgents.delete(contactId);
       }
       
        component.set("v.selectedContactIds", selectedAgents);
        
        if(selectedAgents.size >= 1){
            component.set("v.isChecked", true);
        } else {
            component.set("v.isChecked", false);
        }
        
       	var el = document.getElementsByClassName(contactId);
        if(ischecked){
            el[0].classList.add("selected");
        }else{
           el[0].classList.remove("selected");  
        }
    },
    clickAll : function(component, event, helper) {
        // get value 
        var contactId = event.getSource().get("v.value"); 
        var ischecked = event.getSource().get("v.checked"); 
        var selectedAgents = new Set();
        var checkedBoxes;
        if(!ischecked){
            component.set("v.isChecked", false);
            component.set("v.selectedContactIds", null);
            if(component.find("checkContact")){
                checkedBoxes = component.find("checkContact");
                checkedBoxes.forEach(row=>{
                    if(row.get("v.checked")){
                        row.set("v.checked",false);
                    }
                });
            }
        }else{
            
            var contacts = component.get("v.activeContactsRendered");

            contacts.forEach(contact => {
                if(contact.Requires_verification__c){
                    selectedAgents.add(contact.Id);
                }
                
            });

            if(component.find("checkContact")){
                checkedBoxes = component.find("checkContact");
                checkedBoxes.forEach(row=>{
                    if(!row.get("v.checked") && selectedAgents.has(row.get("v.value"))){
                        row.set("v.checked",true);
                    }
                });
            }
            component.set("v.selectedContactIds", selectedAgents);
            if(selectedAgents.size > 0){
                component.set("v.isChecked", true);
            }
                
        }
               
     },
     searchContact : function(component, event, helper) {
        component.set("v.isFetching", true);
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
                component.set("v.contactListSearched", response.getReturnValue());
                helper.handleFilter(component);
                
            }else{
                helper.showToast("Error!", response.getError()[0].message ,"error", "dismissible",15000);
            }
            component.set("v.isFetching", false);
        });
        // enqueue action to invoke apex code
        $A.enqueueAction(action);
     },
                
     deactivateAgents : function(component, event, helper) {
        
        let contactId = event.getSource().get("v.value");
        var selectedAgentIds = [];
        
        if(contactId){
            selectedAgentIds.push(contactId);
        }else{
            selectedAgentIds = Array.from(component.get("v.selectedContactIds"));
        }
        let contacts = component.get("v.contactListSearched");
        let selectedAgentsInfo = contacts.filter(con =>selectedAgentIds.includes(con.Id) && !con.Has_left_organisation__c && !con.Requires_verification__c);
        component.set("v.selectedAgentsInfo", selectedAgentsInfo);
        if(selectedAgentsInfo.length >= 1){
            component.set("v.openModal",true);
            component.set("v.modalTitle", "Deactivate agent");
            component.set("v.messageConfirmation", "Are you sure you want to deactivate the following agents? They will no longer have access to the Agent Portal. You will not able to active this agent in future. In Order to activate you would need to raise support request with your Study Group sales representative.");
            component.set("v.isDeactivateAction",true);
        }else{
            // show message no agent is selected
            helper.showToast("Warning!", "Selected Agents are not Active." ,"warning", "dismissible",15000);
        }
     },

     verifyAgents : function(component, event, helper) {
        
        let contactId = event.getSource().get("v.value");
        var selectedAgentIds = [];
        
        if(contactId){
            selectedAgentIds.push(contactId);
        }else{
            selectedAgentIds = Array.from(component.get("v.selectedContactIds"));
        }
        let contacts = component.get("v.contactListSearched");
        let selectedAgentsInfo = contacts.filter(con =>selectedAgentIds.includes(con.Id) && con.Requires_verification__c && !con.Has_left_organisation__c);
        component.set("v.selectedAgentsInfo", selectedAgentsInfo);
        if(selectedAgentsInfo.length >= 1){
            component.set("v.openModal",true);
            component.set("v.modalTitle", "Verify agent");
            component.set("v.messageConfirmation", "You are about to verify the following contacts. They will be granted full access to the agent portal.");
            component.set("v.isDeactivateAction",false);

        }else{
            // show message no agent is selected
            helper.showToast("Warning!", "Selected Agents are verified  already." ,"warning", "dismissible",15000);
        }
     },
     handleVerifyAgents: function(component, event, helper){
        component.set("v.isupdatingContact", true);
        // innitate action, call the apex method getListContactByAgent
        var action = component.get('c.verifyContacts');
        var selectedAgentsInfo = Array.from(component.get("v.selectedAgentsInfo"));
        var selectedAgents = [];
        selectedAgentsInfo.forEach(con=>{
            selectedAgents.push(con.Id);
        });
        action.setParams({
            "contactIds" : selectedAgents,
            "agentUrn":  component.get('v.selectedURN')
        });
        // handle response
        action.setCallback(this, function(response) {
            var state = response.getState();
           component.set("v.openModal", false);
            if (state === "SUCCESS"){                
                component.set("v.contactListSearched", response.getReturnValue());
                helper.handleFilter(component);
                helper.showToast("Success!", 'The agents have been verified sucessfully!' ,"success", "dismissible",15000);
            }else{
                helper.showToast("Error!", response.getError()[0].message ,"error", "dismissible",15000);
            }
            component.set("v.isupdatingContact", false);  
        });
        // enqueue action to invoke apex code
        $A.enqueueAction(action);
   },
   handleDeactivateAgents: function(component, event, helper){
        component.set("v.isupdatingContact", true);
        // innitate action, call the apex method getListContactByAgent
        var action = component.get('c.deactivateContacts');
        var selectedAgentsInfo = Array.from(component.get("v.selectedAgentsInfo"));
        var selectedAgents = [];
        selectedAgentsInfo.forEach(con=>{
            selectedAgents.push(con.Id);
        });  
        action.setParams({
            "contactIds" : selectedAgents,
            "agentUrn":  component.get('v.selectedURN')
        });
        // handle response
        action.setCallback(this, function(response) {
            var state = response.getState();
            component.set("v.openModal", false);
            component.set("v.isDeactivateAction",false);
            if (state === "SUCCESS"){                
                component.set("v.contactListSearched", response.getReturnValue());
                helper.handleFilter(component);
                helper.showToast("Success!", 'The agent has been deactivated sucessfully!' ,"success", "dismissible",15000);
            }else{
                helper.showToast("Error!", response.getError()[0].message ,"error", "dismissible",15000);
                
            }
            component.set("v.isupdatingContact", false);
                
        });
       // enqueue action to invoke apex code
       $A.enqueueAction(action);
    },
    closeModal:function(component, event, helper) {
        component.set("v.openModal",false);

    },
    setView: function(component, event, helper) {
        component.set("v.selectedContactIds", new Set());
        component.set("v.isChecked", false);
        component.find("checkAll").set("v.checked",false);

        var checkedBoxes;
        if(component.find("checkContact")){
            checkedBoxes = Array.from(component.find("checkContact"));
            checkedBoxes.forEach(row=>{
                if(row.get("v.checked")){
                    row.set("v.checked",false);
                }
            });
        }
        
        
        helper.handleFilter(component);
        
    },
            
    getPage: function (component, event, helper) {
        component.find("checkAll").set("v.checked",false);
        helper.pageContacts(component, event.getSource().get("v.value"));
    }
})