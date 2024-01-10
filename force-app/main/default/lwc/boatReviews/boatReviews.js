import { LightningElement, api } from "lwc";
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import { NavigationMixin } from "lightning/navigation";
export default class BoatReviews extends NavigationMixin(LightningElement) {
    boatId;
    error;
    boatReviews;
    isLoading;

    @api
    get recordId() {
        return this.boatId;
    }
    set recordId(value) {
        this.setAttribute('boatId', value)
        this.boatId = value;
        this.getReviews();
    }

    get reviewsToShow() {
        return this.boatReviews && this.boatReviews.length > 0 ? true : false;
    }

    @api
    refresh() {
        this.getReviews();
    }

    getReviews() {
        if (!this.boatId) {
            return
        }
        this.isLoading = true;
        getAllReviews({ boatId: this.boatId }).then(data => {
            this.boatReviews = data;
            this.isLoading = false;
        }).catch(error => {
            this.error = error;
        })
    }

    navigateToRecord(event) {
        event.preventDefault();
        event.stopPropagation();
        let userId = event.target.dataset.recordId;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: userId,
                objectApiName: 'User',
                actionName: 'view'
            }
        });
    }
}