({
    doInit: function(component, event, helper) {
        component.set("v.isInitiate",true);
        helper.searchData(component, event);
    },
    handleSearchTermChanged: function(component, event, helper) {
        component.set("v.isInitiate",false);
        helper.searchData(component, event);
    },
    handleClickClose: function(component, event, helper) {
        component.set("v.value", null);
        component.set("v.valueLabel", null);
        component.set("v.searchTerm", null);

    },
    handleClickItem: function(component, event, helper) {
        var value = event.currentTarget.dataset.itemid;
        var label = event.currentTarget.dataset.label;
        component.set("v.value", value);
        component.set("v.valueLabel", label);
        component.set("v.showManu",false);
    },
})