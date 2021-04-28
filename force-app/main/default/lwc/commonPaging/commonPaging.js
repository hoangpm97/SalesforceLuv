import { LightningElement, api, track } from 'lwc';

export default class CommonPaging extends LightningElement {
    @api totalRecord;
    @api currentPage;
    @api itemPerPage;
    @track totalPage;

    connectedCallback() {
        console.log('connectedCallback');
        this.totalPage = this.caculateTotalPage();
        console.log('total: ' + this.totalPage);
        console.log('current: ' + this.currentPage);
        console.log('itemPerPage: ' + this.itemPerPage);
    }
    renderedCallback() {
        console.log('renderedCallback');
        this.totalPage = this.caculateTotalPage();
        console.log('total: ' + this.totalPage);
        console.log('current: ' + this.currentPage);
        console.log('itemPerPage: ' + this.itemPerPage);
    }

    previousHandler() {
        if (this.currentPage > 1) {
            this.currentPage --;
            // console.log('currentP: ' + this.currentPage);
            // console.log('itemPerPageP: ' + this.itemPerPage);
            this.dispatchEvent(new CustomEvent('paging', {detail: {currentPage: this.currentPage, itemPerPage: this.itemPerPage}}));
        }
    }

    nextHandler() {
        if (this.currentPage < this.totalPage) {
            this.currentPage ++;
            // console.log('currentN: ' + this.currentPage);
            // console.log('itemPerPageN: ' + this.itemPerPage);
            this.dispatchEvent(new CustomEvent('paging', {detail: {currentPage: this.currentPage, itemPerPage: this.itemPerPage}}));
        }
    }

    changeItemPerPageHandler(event) {
        this.currentPage = 1;
        this.itemPerPage = event.target.value;
        this.dispatchEvent(new CustomEvent('paging', {detail: {currentPage: this.currentPage, itemPerPage: this.itemPerPage}}));
    }

    caculateTotalPage() {
        let totalPage = parseInt(this.totalRecord / this.itemPerPage);
        if (this.totalRecord % this.itemPerPage == 0) {
            return totalPage;
        }
        return totalPage + 1;
    }

    get getTotalPage() {
        return this.caculateTotalPage();
    }

    get getPreviousCssClass() {
        return (this.currentPage == 1) ? 'paging-item unactive-item' : 'paging-item';
    }

    get getNextCssClass() {
        return (this.currentPage == this.totalPage) ? 'paging-item unactive-item' : 'paging-item';
    }




}