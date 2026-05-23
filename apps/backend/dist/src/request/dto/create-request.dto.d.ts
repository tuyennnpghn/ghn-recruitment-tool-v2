export declare enum TypeOfRecruitment {
    NEW_HC = "New HC",
    REPLACEMENT = "Replacement"
}
export declare class CreateRequestDto {
    openDate: string;
    departmentId: string;
    section?: string;
    team?: string;
    jobTitleId?: string;
    levelId?: string;
    trackId?: string;
    subTrackId?: string;
    hiringManager?: string;
    recruiterId: string;
    shared1Id?: string;
    shared1Date?: string;
    shared2Id?: string;
    shared2Date?: string;
    shared3Id?: string;
    shared3Date?: string;
    typeOfRecruitment: TypeOfRecruitment;
    replaceFor?: string;
    note?: string;
}
