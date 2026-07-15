export interface DataPointsModel {
    id: number;
    label?: string;
    code: string;
    dataPointCode: string;
    dataType: DataType;
    controlType: string;
    relation: string;
    relationEntityCode: string;
    valueLength?: number;
    decimalPointLength?: number;
    validations?: string;
    relationLabel?: string;
    relationValue?: string;
    regex: string;
    actionBy: string;
    tooltip: string;
    isHidden: boolean;
    isMandatory: boolean;
    isReadonly: boolean;
    isPrimary: boolean;
    isMultiSelect?: boolean;
    mimeGroup: any;
    mimeType: any;
    maxFileSize: number;
    isFiltered?: boolean;
    isShowInGrid: boolean;
}

export enum DataType {
    String = 'STR',
    Number = 'INT',
    Decimal = 'DML',
    Boolean = 'BOL',
    Date = 'DAT',
    DateTime = 'DT',
    LongString = 'LSTR',
    File = 'FILE'
}


export class OtherConfig {
    static readonly CONTROLS = [
        {id: 'INPUT', name: 'Input', icon: 'title', controlType: 'INPUT'},
        {id: 'TEXT_EDITOR', name: 'Text Area', icon: 'text_format', controlType: 'TEXT_EDITOR'},
        {id: 'FIELD_TEXT_CK_EDITOR', name: 'CK Editor', icon: 'text_format', controlType: 'FIELD_TEXT_CK_EDITOR'},
        {id: 'FIELD_QUILL_EDITOR', name: 'Quill Editor', icon: 'text_format', controlType: 'FIELD_QUILL_EDITOR'},
        {id: 'FIELD_TINYMCE_EDITOR', name: 'TinyMCE Editor', icon: 'text_format', controlType: 'FIELD_TINYMCE_EDITOR'},
        {id: 'TEXTAREA', name: 'Text Area', icon: 'text_format', controlType: 'TEXTAREA'},
        {id: 'DROPDOWN', name: 'Dropdown', icon: 'menu', controlType: 'DROPDOWN'},
        {id: 'RELATION', name: 'RELATION', icon: 'list', controlType: 'RELATION'},
        {id: 'CHECKBOX', name: 'Checkbox', icon: 'check', controlType: 'CHECKBOX'},
        {id: 'DATE', name: 'Date Piker', icon: 'date_range', controlType: 'DATE'},
        {id: 'DATE_TIME', name: 'Date & Time Picker', icon: 'access_time', controlType: 'DATE_TIME'},
        {id: 'ATTACHMENT', name: 'Attachment', icon: 'file_copy', controlType: 'ATTACHMENT'},
        {id: 'NUMBER', name: 'Number Input', icon: 'filter_1', controlType: 'NUMBER'},
        {id: 'RANGE', name: 'Range', icon: 'filter_1', controlType: 'RANGE'},
        {id: 'FILE', name: 'File', icon: 'filter_1', controlType: 'FILE'},
    ];
    static readonly FIELD_GROUP_TYPES = [
        {
            groupName: 'Datapoint Group',
            controlType: 'DP_GRP',
            groupType: 'DP_GRP',
            groupProperties: {width: 100},
            type: 'DPG'
        },
        {
            groupName: 'Grid Datapoint',
            controlType: 'DP_GRP',
            groupType: 'GRID',
            groupProperties: {width: 100},
            type: 'DPG'
        },
        {
            groupName: 'Entity Group',
            controlType: 'DP_GRP',
            groupType: 'ETY',
            groupProperties: {width: 100},
            type: 'DPG'
        },
    ];
    static readonly DATA_TYPE_CONTROL_MAPPING: any = {
        STR: [
            {id: 'INPUT', name: 'Input', icon: 'title'},
            {id: 'TEXTAREA', name: 'Text Area', icon: 'text_format'},
            {id: 'TEXT_EDITOR', name: 'Text Editor', icon: 'text_format'},
            {id: 'DROPDOWN', name: 'Dropdown', icon: 'menu'},
            {id: 'RELATION', name: 'Relation', icon: 'list'},
            {id: 'FIELD_TEXT_CK_EDITOR', name: 'CK Editor', icon: 'text_format', controlType: 'FIELD_TEXT_CK_EDITOR'},
            {id: 'FIELD_QUILL_EDITOR', name: 'Quill Editor', icon: 'text_format', controlType: 'FIELD_QUILL_EDITOR'},
            {id: 'FIELD_TINYMCE_EDITOR', name: 'TinyMCE Editor', icon: 'text_format', controlType: 'FIELD_TINYMCE_EDITOR'},
        ], LSTR: [
            {id: 'INPUT', name: 'Input', icon: 'title'},
            {id: 'TEXTAREA', name: 'Text Area', icon: 'text_format'},
            {id: 'TEXT_EDITOR', name: 'Text Editor', icon: 'text_format'},
        ],
        DML: [
            {id: 'NUMBER', name: 'Number Input', icon: 'filter_1'},
        ], INT: [
            {id: 'NUMBER', name: 'Number Input', icon: 'filter_1'},
            {id: 'DROPDOWN', name: 'Dropdown', icon: 'menu'},
            {id: 'RELATION', name: 'Relation', icon: 'list'},
        ],
        BOL: [
            {id: 'CHECKBOX', name: 'Checkbox', icon: 'check'},
        ],
        DAT: [
            {id: 'DATE', name: 'Date Piker', icon: 'date_range'},
        ],
        DT: [
            {id: 'DATE_TIME', name: 'Date & Time Picker', icon: 'access_time'},
        ],
        FILE: [
            {id: 'ATTACHMENT', name: 'Attachment', icon: 'file_copy'},
        ]
    };
}

export interface EntityDefinitionModel {
    id: number;
    entityName: string;
    entityCode: string;
    actionBy: string;
    entityDataPoints: EntityDataPointsModel[];
    entityDatapointGroups: EntityDataPointGroupModel[];
    entityDef?: any;
    totalRecords?: number;
    gridData?: any[];
    validations?: any;
    entityProperties: any;
    recordMode?: string;
    isExistingTable?:boolean;
}

export interface EntityDataPointGroupModel {
    type?: string;
    entityCode: string;
    sequenceNo: number;
    groupName: string;
    groupType: string;
    groupViewType: string;
    relationEntityCode: string;
    groupProperties: any;
    groupPropertiesStr: string;
    datapoint?: EntityDataPointsModel[];
}

export interface EntityDataPointsModel {
    id?: number;
    entityId: number;
    datapointId: number;
    validations: any[];
    enrichment: any[];
    label: string;
    regex: string;
    actionBy: string;
    isHidden: boolean;
    isMandatory: boolean;
    isReadonly: boolean;
    isShowColumn: boolean;
    errors?: any[];
    value?: any;
    code: string;
    dataType?: string;
    controlType: string;
    tooltip?: string;
}

export interface ValidationMasterModel {
    id: number;
    validatorCode: string;
    validatorName: string;
    validatorAction: string;
    isActive: boolean;
    errorMessage: string;
    validatorHelper: string;
    value: string;
    editable: boolean;
    inputs: any[];
    validatorInput: any;
}


export interface ValidationModel {
    id?: number;
    validatorCode?: string;
    validatorName?: string;
    validatorAction?: string;
    isActive?: boolean;
    errorMessage?: string;
    validatorHelper?: string;
    value?: string;
    editable?: boolean;
    inputs: any[];
    validatorInput?: any;
}

export interface MapperListModel {
    processName: string;
    masterEntity: string;
   // totalColumn: number;
    isActive: string;
}

export interface UserLogModel {
    fileLogId: number;
    processId: number;
    processName: string;
    status: string;
    totalRows: number;
    excludedRows: number;
    startTimeLabel: Date;
    endTimeLabel: Date;
    uploadedOnLabel: Date;
    uploadedBy: string;
}

export interface DropdownValuesModel {
    id?: number;
    label: string;
    groupCode: string;
    parentId: number;
    isActive: boolean;
    isDeleted: boolean;
    sequenceNo: number;
}
