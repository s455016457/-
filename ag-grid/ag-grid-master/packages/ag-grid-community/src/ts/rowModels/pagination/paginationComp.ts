import { Component } from "../../widgets/component";
import { Autowired, PostConstruct } from "../../context/context";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { RefSelector } from "../../widgets/componentAnnotations";
import { EventService } from "../../eventService";
import { Events } from "../../events";
import { RowRenderer } from "../../rendering/rowRenderer";
import { PaginationProxy } from "../paginationProxy";
import { _ } from "../../utils";
import { IServerSideRowModel } from "../../interfaces/iServerSideRowModel";
import { IRowModel } from "../../interfaces/iRowModel";
import { Constants } from "../../constants";

export class PaginationComp extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('rowModel') private rowModel: IRowModel;

    @RefSelector('btFirst') private btFirst: HTMLButtonElement;
    @RefSelector('btPrevious') private btPrevious: HTMLButtonElement;
    @RefSelector('btNext') private btNext: HTMLButtonElement;
    @RefSelector('btLast') private btLast: HTMLButtonElement;

    @RefSelector('lbRecordCount') private lbRecordCount: any;
    @RefSelector('lbFirstRowOnPage') private lbFirstRowOnPage: any;
    @RefSelector('lbLastRowOnPage') private lbLastRowOnPage: any;
    @RefSelector('eSummaryPanel') private eSummaryPanel: any;
    @RefSelector('lbCurrent') private lbCurrent: any;
    @RefSelector('lbTotal') private lbTotal: any;

    private serverSideRowModel: IServerSideRowModel;

    constructor() {
        super();
    }

    @PostConstruct
    private postConstruct(): void {

        this.setTemplate(this.getTemplate());

        if (this.rowModel.getType() === Constants.ROW_MODEL_TYPE_SERVER_SIDE) {
            this.serverSideRowModel = this.rowModel as IServerSideRowModel;
        }

        const isPaging = this.gridOptionsWrapper.isPagination();
        const paginationPanelEnabled = isPaging && !this.gridOptionsWrapper.isSuppressPaginationPanel();
        if (!paginationPanelEnabled) {
            this.setVisible(false);
            return;
        }

        this.addDestroyableEventListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));

        this.addDestroyableEventListener(this.btFirst, 'click', this.onBtFirst.bind(this));
        this.addDestroyableEventListener(this.btLast, 'click', this.onBtLast.bind(this));
        this.addDestroyableEventListener(this.btNext, 'click', this.onBtNext.bind(this));
        this.addDestroyableEventListener(this.btPrevious, 'click', this.onBtPrevious.bind(this));

        this.onPaginationChanged();
    }

    private onPaginationChanged(): void {
        this.enableOrDisableButtons();
        this.updateRowLabels();
        this.setCurrentPageLabel();
        this.setTotalLabels();
    }

    private setCurrentPageLabel(): void {
        const pagesExist = this.paginationProxy.getTotalPages() > 0;
        const currentPage = this.paginationProxy.getCurrentPage();

        const toDisplay = pagesExist ? currentPage + 1 : 0;

        this.lbCurrent.innerHTML = this.formatNumber(toDisplay);
    }

    private formatNumber(value: number): string {
        const userFunc = this.gridOptionsWrapper.getPaginationNumberFormatterFunc();
        if (userFunc) {
            return userFunc({value: value});
        } else {
            return _.formatNumberCommas(value);
        }
    }

    private getTemplate(): string {

        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        const strPage = localeTextFunc('page', 'Page');
        const strTo = localeTextFunc('to', 'to');
        const strOf = localeTextFunc('of', 'of');
        const strFirst = localeTextFunc('first', 'First');
        const strPrevious = localeTextFunc('previous', 'Previous');
        const strNext = localeTextFunc('next', 'Next');
        const strLast = localeTextFunc('last', 'Last');

        return `<div class="ag-paging-panel ag-unselectable">
                <span ref="eSummaryPanel" class="ag-paging-row-summary-panel">
                    <span ref="lbFirstRowOnPage"></span> ${strTo} <span ref="lbLastRowOnPage"></span> ${strOf} <span ref="lbRecordCount"></span>
                </span>
                <span class="ag-paging-page-summary-panel">
                    <div class="ag-icon ag-icon-first" ref="btFirst">
                        <button type="button" class="ag-paging-button">${strFirst}</button>
                    </div>
                    <div class="ag-icon ag-icon-previous" ref="btPrevious">
                        <button type="button" class="ag-paging-button">${strPrevious}</button>
                    </div>
                    ${strPage} <span ref="lbCurrent"></span> ${strOf} <span ref="lbTotal"></span>
                    <div class="ag-icon ag-icon-next" ref="btNext">
                        <button type="button" class="ag-paging-button">${strNext}</button>
                    </div>
                    <div class="ag-icon ag-icon-last" ref="btLast">
                        <button type="button" class="ag-paging-button">${strLast}</button>
                    </div>
                </span>
            </div>`;
    }

    private onBtNext() {
        this.paginationProxy.goToNextPage();
    }

    private onBtPrevious() {
        this.paginationProxy.goToPreviousPage();
    }

    private onBtFirst() {
        this.paginationProxy.goToFirstPage();
    }

    private onBtLast() {
        this.paginationProxy.goToLastPage();
    }

    private enableOrDisableButtons() {
        const currentPage = this.paginationProxy.getCurrentPage();
        const maxRowFound = this.paginationProxy.isLastPageFound();
        const totalPages = this.paginationProxy.getTotalPages();

        const disablePreviousAndFirst = currentPage === 0;
        _.addOrRemoveCssClass(this.btPrevious, 'ag-disabled', disablePreviousAndFirst);
        _.addOrRemoveCssClass(this.btFirst, 'ag-disabled', disablePreviousAndFirst);

        const zeroPagesToDisplay = this.isZeroPagesToDisplay();
        const onLastPage = maxRowFound && currentPage === (totalPages - 1);

        const disableNext = onLastPage || zeroPagesToDisplay;
        _.addOrRemoveCssClass(this.btNext, 'ag-disabled', disableNext);

        const disableLast = !maxRowFound || zeroPagesToDisplay || currentPage === (totalPages - 1);
        _.addOrRemoveCssClass(this.btLast, 'ag-disabled', disableLast);
    }

    private updateRowLabels() {
        const currentPage = this.paginationProxy.getCurrentPage();
        const pageSize = this.paginationProxy.getPageSize();
        const maxRowFound = this.paginationProxy.isLastPageFound();
        const rowCount = this.paginationProxy.isLastPageFound() ?
            this.paginationProxy.getTotalRowCount() : null;

        let startRow: any;
        let endRow: any;
        if (this.isZeroPagesToDisplay()) {
            startRow = 0;
            endRow = 0;
        } else {
            startRow = (pageSize * currentPage) + 1;
            endRow = startRow + pageSize - 1;
            if (maxRowFound && endRow > rowCount) {
                endRow = rowCount;
            }
        }

        this.lbFirstRowOnPage.innerHTML = this.formatNumber(startRow);
        if (this.serverSideRowModel && this.serverSideRowModel.isLoading()) {
            this.lbLastRowOnPage.innerHTML = '?';
        } else {
            this.lbLastRowOnPage.innerHTML = this.formatNumber(endRow);
        }
    }

    private isZeroPagesToDisplay() {
        const maxRowFound = this.paginationProxy.isLastPageFound();
        const totalPages = this.paginationProxy.getTotalPages();
        return maxRowFound && totalPages === 0;
    }

    private setTotalLabels() {
        const lastPageFound = this.paginationProxy.isLastPageFound();
        const totalPages = this.paginationProxy.getTotalPages();
        const rowCount = this.paginationProxy.isLastPageFound() ?
            this.paginationProxy.getTotalRowCount() : null;

        if (lastPageFound) {
            this.lbTotal.innerHTML = this.formatNumber(totalPages);
            this.lbRecordCount.innerHTML = this.formatNumber(rowCount);
        } else {
            const moreText = this.gridOptionsWrapper.getLocaleTextFunc()('more', 'more');
            this.lbTotal.innerHTML = moreText;
            this.lbRecordCount.innerHTML = moreText;
        }
    }
}