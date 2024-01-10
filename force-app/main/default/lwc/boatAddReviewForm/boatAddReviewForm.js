import BOAT_REVIEW_OBJECT from '@salesforce/schema/BoatReview__c';
import NAME_FIELD from '@salesforce/schema/BoatReview__c.Name';
import COMMENT_FIELD from '@salesforce/schema/BoatReview__c.Comment__c'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
const SUCCESS_TITLE = 'Review Created!';
const SUCCESS_VARIANT = 'success';
import { api, LightningElement } from "lwc";

export default class BoatAddReviewForm extends LightningElement {
    boatId;
    rating = 0;
    boatReviewObject = BOAT_REVIEW_OBJECT;
    nameField = NAME_FIELD;
    commentField = COMMENT_FIELD;
    labelSubject = 'Review Subject';
    labelRating = 'Rating';

    @api
    get recordId() {
        return this.boatId;
    }
    set recordId(value) {
        this.setAttribute('boatId', value);
        this.boatId = value;
    }

    handleRatingChanged(event) {
        this.rating = event.detail.rating;
    }

    handleSubmit(event) {
        event.preventDefault();
        let { fields } = event.detail;
        fields.Rating__c = this.rating;
        fields.Boat__c = this.boatId;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleSuccess() {
        const toast = new ShowToastEvent({
            title: SUCCESS_TITLE,
            variant: SUCCESS_VARIANT,
        });
        this.dispatchEvent(toast);
        this.handleReset();
        const createReviewEvent = new CustomEvent('createreview');
        this.dispatchEvent(createReviewEvent);
    }

    handleReset() {
        let inputFields = this.template.querySelectorAll('lightning-input-field')
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            })
        }
    }
}