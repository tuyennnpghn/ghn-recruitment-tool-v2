import { TypeOfRecruitment } from './create-request.dto';
export declare class UpdateRequestDto {
    openDate?: string;
    jobTitleId?: string;
    levelId?: string;
    section?: string;
    team?: string;
    trackId?: string;
    subTrackId?: string;
    hiringManager?: string;
    recruiterId?: string;
    shared1Id?: string;
    shared1Date?: string;
    shared2Id?: string;
    shared2Date?: string;
    shared3Id?: string;
    shared3Date?: string;
    typeOfRecruitment?: TypeOfRecruitment;
    replaceFor?: string;
    cddAcceptedOfferDate?: string;
    onboardDate?: string;
    note?: string;
}
