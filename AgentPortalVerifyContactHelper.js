({
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
    }
})