import { LightningElement, api, track } from 'lwc';

export default class CommonPaging extends LightningElement {
    @api totalRecord;
    @api currentPage;
    @api itemPerPage;
    @track totalPage;
    @track optionItemPerPage = ['2', '5', '10', '20', '40'];

    connectedCallback() {
        this.totalPage = this.caculateTotalPage();
    }
    renderedCallback() {
        this.totalPage = this.caculateTotalPage();
        if (this.currentPage > this.totalPage) {
            this.currentPage = 1;
            this.dispatchEvent(new CustomEvent('paging', {detail: {currentPage: this.currentPage, itemPerPage: this.itemPerPage}}));
        }
    }

    previousHandler() {
        if (this.currentPage > 1) {
            this.currentPage --;
            this.dispatchEvent(new CustomEvent('paging', {detail: {currentPage: this.currentPage, itemPerPage: this.itemPerPage}}));
        }
    }

    nextHandler() {
        if (this.currentPage < this.totalPage) {
            this.currentPage ++;
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