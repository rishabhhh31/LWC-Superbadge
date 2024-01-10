import { api, wire, LightningElement, track } from "lwc";
import getBoats from '@salesforce/apex/BoatDataService.getBoats'
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList'
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { publish, MessageContext } from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';
export default class BoatSearchResults extends LightningElement {
  selectedBoatId;
  columns = [
    { label: 'Name', editable: true, fieldName: 'Name' },
    { label: 'Length', editable: true, fieldName: 'Length__c', type: 'number' },
    { label: 'Price', editable: true, fieldName: 'Price__c', type: 'currency', typeAttributes: { currencyCode: 'USD', maximumFractionDigits: 2 } },
    { label: 'Description', editable: true, fieldName: 'Description__c' },
  ];
  boatTypeId = '';
  @track boats;
  isLoading = false;
  @track draftValues = [];

  @wire(MessageContext)
  messageContext;
  @wire(getBoats, { boatTypeId: '$boatTypeId' })
  wiredBoats(result) {
    this.boats = result;
  }

  @api
  searchBoats(boatTypeId) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;
  }

  async refresh() {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    await refreshApex(this.boats);
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }

  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  sendMessageService(boatId) {
    const payload = { recordId: boatId };
    publish(this.messageContext, BOATMC, payload);
  }

  handleSave(event) {
    const updatedFields = event.detail.draftValues;
    updateBoatList({ data: updatedFields })
      .then((result) => {
        this.dispatchEvent(new ShowToastEvent({
          title: SUCCESS_TITLE,
          variant: SUCCESS_VARIANT,
          message: MESSAGE_SHIP_IT
        }))

        this.refresh();
      })
      .catch(error => {
        this.dispatchEvent(new ShowToastEvent({
          title: ERROR_TITLE,
          variant: ERROR_VARIANT,
          message: error.body.message
        }))
      })
      .finally(() => {
        this.draftValues = [];
      });
  }
  notifyLoading(isLoading) {
    if (isLoading) {
      this.dispatchEvent(new CustomEvent('loading'))
    } else {
      this.dispatchEvent(new CustomEvent('doneloading'))
    }
  }
}