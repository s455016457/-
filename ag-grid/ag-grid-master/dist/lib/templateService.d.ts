// Type definitions for ag-grid-community v21.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class TemplateService {
    private $scope;
    private templateCache;
    private waitingCallbacks;
    getTemplate(url: any, callback: any): any;
    handleHttpResult(httpResult: any, url: any): void;
}
