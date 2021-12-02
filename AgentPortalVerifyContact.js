({
    doInit : function(component, event, helper) {
        var filterOptions = [
            {'label': $A.get("$Label.c.All"), 'value': 'All'}, 
            {'label': $A.get("$Label.c.Active"), 'value': 'Active'},
            {'label':  $A.get("$Label.c.Unverified"), 'value': 'Unverified'}
            ];
        
        component.set("v.fiterViewOptions", filterOptions);
        component.set("v.isFetching", true);
        var action = component.get('c.getListAgentUrns');
        action.setCallback(this, function(response) {
            var state = response.getState();
            component.set("v.isFetching", false);
            if (state === "SUCCESS"){
               
               component.set("v.mainContact", response.getReturnValue().mainContact);
               component.set("v.agentList", response.getReturnValue().agentList);
               component.set("v.contactListSearched", response.getReturnValue().contactList);
               component.set("v.timezone", response.getReturnValue().timezone)
                if(!response.getReturnValue().agentList || response.getReturnValue().agentList.length == 0){
                    component.set("v.isAuthorised", false);
                }else{
                    component.set("v.isAuthorised", true);
                }
                
                if(response.getReturnValue().agentList.length == 1){
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
     searchContact : function(component, event, helper) {
        component.set("v.isFetching", true);
        var action = component.get('c.getContactsByEmailName');
        component.set("v.selectedContactIds", null);
        component.set("v.isChecked", false);
        //component.find("checkAll").set("v.checked",false);
        component.set("v.isCheckedAll",false);
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
        component.set("v.replacedAgent",null);
        component.set("v.noProvidedReplacer",null);
        
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
            component.set("v.modalTitle", $A.get("$Label.c.Deactivate_agent"));
            component.set("v.messageConfirmation", $A.get("$Label.c.Deactivate_agent_message_modal_1"));
            component.set("v.isDeactivateAction",true);
        }
         else{
            // show message no agent is selected
            helper.showToast("Warning!", "Selected Agents are not Active." ,"warning", "dismissible",15000);
        }
         
        document.addEventListener('keydown', evt => {
            if (evt.key === 'Escape') {
            	component.set("v.openModal",false);
        	}
        });
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
            component.set("v.modalTitle",$A.get("$Label.c.Verify_agent"));
            component.set("v.messageConfirmation", $A.get("$Label.c.Verify_agent_message_modal"));
            component.set("v.isDeactivateAction",false);

        }else{
            // show message no agent is selected
            helper.showToast("Warning!", "Selected Agents are verified  already." ,"warning", "dismissible",15000);
        }
         
        document.addEventListener('keydown', evt => {
            if (evt.key === 'Escape') {
            	component.set("v.openModal",false);
        	}
        });
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
                helper.showToast("Success!", $A.get("$Label.c.Verify_Agent_Success_Message") ,"success", "dismissible",15000);
            }else{
                helper.showToast("Error!", response.getError()[0].message ,"error", "dismissible",15000);
            }
            component.set("v.isupdatingContact", false);  
        });
        // enqueue action to invoke apex code
        $A.enqueueAction(action);
   },
   handleDeactivateAgents: function(component, event, helper){
        let replacedAgent = component.get("v.replacedAgent");
        component.set("v.noProvidedReplacer",null);
        if(!replacedAgent){
            component.set("v.noProvidedReplacer",$A.get("$Label.c.Select_Agent_Validate_Message"));
            return;
        }
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
            "agentUrn":  component.get('v.selectedURN'),
            "replacedAgent": replacedAgent
        });
        // handle response
        action.setCallback(this, function(response) {
            var state = response.getState();
            component.set("v.openModal", false);
            component.set("v.isDeactivateAction",false);
            if (state === "SUCCESS"){                
                component.set("v.contactListSearched", response.getReturnValue());
                helper.handleFilter(component);
                helper.showToast("Success!",$A.get("$Label.c.Deactive_Agent_Success_Message") ,"success", "dismissible",15000);
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
   
        
        helper.handleFilter(component);
        
    },
            
    getPage: function (component, event, helper) {
        
        helper.pageContacts(component, event.getSource().get("v.value"));
    },
    
    doneRendering :function (component, event, helper) {
        //component.find("checkAll").set("v.checked",component.get("v.isCheckedAll"));
    
        var selectedAgents = new Set(component.get("v.selectedContactIds"));
        if(component.find("checkContact")){
            checkedBoxes = component.find("checkContact");
            checkedBoxes.forEach(row=>{
                if(!row.get("v.checked") && selectedAgents.has(row.get("v.value"))){
                    row.set("v.checked",true);
                }
            });
        }
       
    },
    
})