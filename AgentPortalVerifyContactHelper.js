({  maxPaginatedPages: 5,
    transactionsPerPage: 10,
    helperMethod : function(component, contacts) {
		// Display first batch of contacts
		//let totalPages = Math.ceil(contacts.length / this.transactionsPerPage);
        let totalPages = component.get("v.totalPages");
        component.set('v.totalPages', totalPages);
        this.pageContacts(component, 0);
    },
    
    /**
     * Returns the selected transactions by page and page size
     * @param {Object} component AgentPortalFinance component instance
     * @param {integer} pageNum The page number
     */
    pageContacts: function (component, pageNum) {
        pageNum = parseInt(pageNum, 10);
        component.set('v.activePageNum', pageNum);
        let pagedTransactions = component.get('v.contactList').slice((pageNum) * this.transactionsPerPage, (pageNum + 1) * this.transactionsPerPage);
        component.set('v.activeContactsRendered', pagedTransactions);
        this.pagination(component, pageNum);
    },

    pagination: function (component, pageNumber) {
        const totalPages = component.get("v.totalPages");
        let noOfPages = this.maxPaginatedPages;
        const pageMultiplier = Math.floor(pageNumber / noOfPages);
        let startAt = (pageMultiplier * noOfPages) + 1;
        if (noOfPages > totalPages) {
            noOfPages = totalPages;
        } else if ((startAt + noOfPages) > totalPages) {
            startAt = totalPages - noOfPages + 1;
        }

        const pagesArrayStarter = Array.apply(null, Array(noOfPages)).map(function () { });
        const pagesArray = pagesArrayStarter.map(function (x, i) { return (i + startAt) });
        component.set('v.pagesArray', pagesArray);
       
        
    },
   showToast : function(title, message,type, mode, duration) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type" : type,
            "mode": mode,
            "duration":duration
        });
        toastEvent.fire();
    },
    handleFilter : function(component){
        var vieMode = component.get("v.filterView");
        var contacts =  component.get("v.contactListSearched");
        var totalPages = Math.ceil(contacts.length/this.transactionsPerPage);
        component.set("v.contactList", contacts);
        if(vieMode == 'Active'){
            let selectedAgentsInfo = contacts.filter(con => !con.Requires_verification__c);
            component.set("v.contactList", selectedAgentsInfo);
            totalPages = Math.ceil(selectedAgentsInfo.length/this.transactionsPerPage);
        }
        if(vieMode == 'Unverified'){
            let selectedAgentsInfo = contacts.filter(con => con.Requires_verification__c);
            component.set("v.contactList", selectedAgentsInfo);
            totalPages = Math.ceil(selectedAgentsInfo.length/this.transactionsPerPage);
           
        }
        component.set("v.totalPages", totalPages)
        this.pageContacts(component, 0);
        
    }
})