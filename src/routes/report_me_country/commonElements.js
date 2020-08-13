import Col, { Table } from 'antd';
import { getSubWhatDatas, getSubDatas, getDatas, rowClassNameForSM, handleRecord } from '../report/helpers';
import * as crmIntlUtil from '../../utils/crmIntlUtil';

const Column = Table.Column;
const ColumnGroup = Table.ColumnGroup;

export const craftRepeatableColumns = (keys) => {
    if(_.isArray(keys) && keys.length >= 4){
        return [
        <Column
            title={crmIntlUtil.fmtStr('text.report.event_times')}
            dataIndex={keys[0]}
            key={keys[0]}
            style={{
            textAlign: 'center'
            }}
            width={120}
        />,
        <Column
            title={crmIntlUtil.fmtStr('text.report.event_chairmen')}
            dataIndex={keys[1]}
            key={keys[1]}
            width={120}
        />,
        <Column
            title={crmIntlUtil.fmtStr('text.report.event_speakers')}
            dataIndex={keys[2]}
            key={keys[2]}
            width={120}
        />,
        <Column
            title={crmIntlUtil.fmtStr('text.report.event_attendees')}
            dataIndex={keys[3]}
            key={keys[3]}
            width={120}
        />
        ];
    }
    return null;
};

export const craftSummaryTable = (staffs, loading) => {
    return (
        <Table dataSource={staffs} loading={loading} pagination={false} scroll={{ x: 10000, y: 400}} style={{marginBottom: 20}} rowClassName={(record) => {
            return rowClassNameForSM(handleRecord(record).is_SM);
          }}>
            <Column
              title={crmIntlUtil.fmtStr('text.report.username')}
              dataIndex="UserName"
              key="UserName"
              width={100}
              fixed
            />
            <Column
              title={crmIntlUtil.fmtStr('text.report.realm')}
              dataIndex="Realm"
              key="Realm"
              width={150}
              fixed
            />
            <ColumnGroup>
              <Column
                title={crmIntlUtil.fmtStr('text.report.event_plans')}
                dataIndex="Plans"
                key="Plans"
                width={100}
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.event_completions')}
                dataIndex="Completions"
                key="Completions"
                width={100}
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.event_completion_rate')}
                dataIndex="CompletionRate"
                key="CompletionRate"
                width={100}
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.event_incompletions')}
                dataIndex="Incompletions"
                key="Incompletions"
                width={100}
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.event_cancels')}
                dataIndex="Cancels"
                key="Cancels"
                width={100}
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.event_chairmen')}
                dataIndex="Chairmen"
                key="Chairmen"
                width={150}
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.event_speakers')}
                dataIndex="Speakers"
                key="Speakers"
                width={150}
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.event_attendees')}
                dataIndex="Attendees"
                key="Attendees"
                width={150}
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.event_substitute_events')}
                dataIndex="SubstituteEvents"
                key="SubstituteEvents"
                width={150}
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.event_substituted_events')}
                dataIndex="SubstitutedEvents"
                key="SubstitutedEvents"
                width={150}
              />
              <Column
                title={crmIntlUtil.fmtStr('text.report.event_actual_events')}
                dataIndex="ActualEvents"
                key="ActualEvents"
                width={150}
              />
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.area_category')}>
              {
                craftRepeatableColumns([
                  "AreaAC",
                  "AreaACChairmen",
                  "AreaACSpeakers",
                  "AreaACAttendees"
                ])
              }
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.hospital_category')}>
              {
                craftRepeatableColumns([
                  "HospitalAC",
                  "HospitalACChairmen",
                  "HospitalACSpeakers",
                  "HospitalACAttendees"
                ])
              }
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.department_category')}>
              {
                craftRepeatableColumns([
                  "DepartmentAC",
                  "DepartmentACChairmen",
                  "DepartmentACSpeakers",
                  "DepartmentACAttendees"
                ])
              }
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.city_category')}>
              {
                craftRepeatableColumns([
                  "CityAC",
                  "CityACChairmen",
                  "CityACSpeakers",
                  "CityACAttendees"
                ])
              }
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.roundtable_category')}>
              {
                craftRepeatableColumns([
                  "RoundTableAC",
                  "RoundTableACChairmen",
                  "RoundTableACSpeakers",
                  "RoundTableACAttendees"
                ])
              }
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.mundi_national_category')}>
              {
                craftRepeatableColumns([
                  "MundiNationalAC",
                  "MundiNationalACChairmen",
                  "MundiNationalACSpeakers",
                  "MundiNationalACAttendees"
                ])
              }
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.third_party_category')}>
              {
                craftRepeatableColumns([
                  "ThirdPartyAC",
                  "ThirdPartyACChairmen",
                  "ThirdPartyACSpeakers",
                  "ThirdPartyACAttendees"
                ])
              }
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.abroad_category')}>
              {
                craftRepeatableColumns([
                  "AbroadAC",
                  "AbroadACChairmen",
                  "AbroadACSpeakers",
                  "AbroadACAttendees"
                ])
              }
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.expert_conf_category')}>
              {
                craftRepeatableColumns([
                  "ExpertConf",
                  "ExpertConfChairmen",
                  "ExpertConfSpeakers",
                  "ExpertConfAttendees"
                ])
              }
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.anesthesiology_training_category')}>
              {
                craftRepeatableColumns([
                  "AnesthesiologyTraining",
                  "AnesthesiologyTrainingChairmen",
                  "AnesthesiologyTrainingSpeakers",
                  "AnesthesiologyTrainingAttendees"
                ])
              }
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.business_conf_category')}>
              {
                craftRepeatableColumns([
                  "BusinessConf",
                  "BusinessConfChairmen",
                  "BusinessConfSpeakers",
                  "BusinessConfAttendees"
                ])
              }
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.no_cancer_pain_ward_category')}>
              {
                craftRepeatableColumns([
                  "NoCancerPainWard",
                  "NoCancerPainWardChairmen",
                  "NoCancerPainWardSpeakers",
                  "NoCancerPainWardAttendees"
                ])
              }
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.doc_continuing_edu_category')}>
              {
                craftRepeatableColumns([
                  "DocContinuingEdu",
                  "DocContinuingEduChairmen",
                  "DocContinuingEduSpeakers",
                  "DocContinuingEduAttendees"
                ])
              }
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.mtm_review_meeting_category')}>
              {
                craftRepeatableColumns([
                  "MTMReviewMeeting",
                  "MTMReviewMeetingChairmen",
                  "MTMReviewMeetingSpeakers",
                  "MTMReviewMeetingAttendees"
                ])
              }
            </ColumnGroup>
            <ColumnGroup title={crmIntlUtil.fmtStr('text.report.dept_roundtable_case_review_category')}>
              {
                craftRepeatableColumns([
                  "DeptRoundTableCaseReview",
                  "DeptRoundTableCaseReviewChairmen",
                  "DeptRoundTableCaseReviewSpeakers",
                  "DeptRoundTableCaseReviewAttendees"
                ])
              }
            </ColumnGroup>
        </Table>
    );

};