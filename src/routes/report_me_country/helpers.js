import { NumberOrEmpty } from '../../utils/lo';

export const getRecordByData = (data) => {
    return {
      UserName: data.UserName,
      Realm: data.Realm,
  
      Level: data.Level,
  
      Plans: NumberOrEmpty(data.Plans),
      Completions: NumberOrEmpty(data.Completions),
      CompletionRate: NumberOrEmpty(data.CompletionRate),
      Incompletions: NumberOrEmpty(data.Incompletions),
      Cancels: NumberOrEmpty(data.Cancels),
  
      Chairmen: NumberOrEmpty(data.Chairmen),
      Speakers: NumberOrEmpty(data.Speakers),
      Attendees: NumberOrEmpty(data.Attendees),
      SubstituteEvents: NumberOrEmpty(data.SubstituteEvents),
      SubstitutedEvents: NumberOrEmpty(data.SubstitutedEvents),
      ActualEvents: NumberOrEmpty(data.ActualEvents),
  
      AreaAC: NumberOrEmpty(data.AreaAC),
      AreaACChairmen: NumberOrEmpty(data.AreaACChairmen),
      AreaACSpeakers: NumberOrEmpty(data.AreaACSpeakers),
      AreaACAttendees: NumberOrEmpty(data.AreaACAttendees),
  
      HospitalAC: NumberOrEmpty(data.HospitalAC),
      HospitalACChairmen: NumberOrEmpty(data.HospitalACChairmen),
      HospitalACSpeakers: NumberOrEmpty(data.HospitalACSpeakers),
      HospitalACAttendees: NumberOrEmpty(data.HospitalACAttendees),
  
      DepartmentAC: NumberOrEmpty(data.DepartmentAC),
      DepartmentACChairmen: NumberOrEmpty(data.DepartmentACChairmen),
      DepartmentACSpeakers: NumberOrEmpty(data.DepartmentACSpeakers),
      DepartmentACAttendees: NumberOrEmpty(data.DepartmentACAttendees),
  
      CityAC: NumberOrEmpty(data.CityAC),
      CityACChairmen: NumberOrEmpty(data.CityACChairmen),
      CityACSpeakers: NumberOrEmpty(data.CityACSpeakers),
      CityACAttendees: NumberOrEmpty(data.CityACAttendees),
  
      RoundTableAC: NumberOrEmpty(data.RoundTableAC),
      RoundTableACChairmen: NumberOrEmpty(data.RoundTableACChairmen),
      RoundTableACSpeakers: NumberOrEmpty(data.RoundTableACSpeakers),
      RoundTableACAttendees: NumberOrEmpty(data.RoundTableACAttendees),
  
      MundiNationalAC: NumberOrEmpty(data.MundiNationalAC),
      MundiNationalACChairmen: NumberOrEmpty(data.MundiNationalACChairmen),
      MundiNationalACSpeakers: NumberOrEmpty(data.MundiNationalACSpeakers),
      MundiNationalACAttendees: NumberOrEmpty(data.MundiNationalACAttendees),
  
      ThirdPartyAC: NumberOrEmpty(data.ThirdPartyAC),
      ThirdPartyACChairmen: NumberOrEmpty(data.ThirdPartyACChairmen),
      ThirdPartyACSpeakers: NumberOrEmpty(data.ThirdPartyACSpeakers),
      ThirdPartyACAttendees: NumberOrEmpty(data.ThirdPartyACAttendees),
  
      AbroadAC: NumberOrEmpty(data.AbroadAC),
      AbroadACChairmen: NumberOrEmpty(data.AbroadACChairmen),
      AbroadACSpeakers: NumberOrEmpty(data.AbroadACSpeakers),
      AbroadACAttendees: NumberOrEmpty(data.AbroadACAttendees),
  
      ExpertConf: NumberOrEmpty(data.ExpertConf),
      ExpertConfChairmen: NumberOrEmpty(data.ExpertConfChairmen),
      ExpertConfSpeakers: NumberOrEmpty(data.ExpertConfSpeakers),
      ExpertConfAttendees: NumberOrEmpty(data.ExpertConfAttendees),
  
      AnesthesiologyTraining: NumberOrEmpty(data.AnesthesiologyTraining),
      AnesthesiologyTrainingChairmen: NumberOrEmpty(data.AnesthesiologyTrainingChairmen),
      AnesthesiologyTrainingSpeakers: NumberOrEmpty(data.AnesthesiologyTrainingSpeakers),
      AnesthesiologyTrainingAttendees: NumberOrEmpty(data.AnesthesiologyTrainingAttendees),
  
      BusinessConf: NumberOrEmpty(data.BusinessConf),
      BusinessConfChairmen: NumberOrEmpty(data.BusinessConfChairmen),
      BusinessConfSpeakers: NumberOrEmpty(data.BusinessConfSpeakers),
      BusinessConfAttendees: NumberOrEmpty(data.BusinessConfAttendees),
  
      NoCancerPainWard: NumberOrEmpty(data.NoCancerPainWard),
      NoCancerPainWardChairmen: NumberOrEmpty(data.NoCancerPainWardChairmen),
      NoCancerPainWardSpeakers: NumberOrEmpty(data.NoCancerPainWardSpeakers),
      NoCancerPainWardAttendees: NumberOrEmpty(data.NoCancerPainWardAttendees),
  
      DocContinuingEdu: NumberOrEmpty(data.DocContinuingEdu),
      DocContinuingEduChairmen: NumberOrEmpty(data.DocContinuingEduChairmen),
      DocContinuingEduSpeakers: NumberOrEmpty(data.DocContinuingEduSpeakers),
      DocContinuingEduAttendees: NumberOrEmpty(data.DocContinuingEduAttendees),
  
      MTMReviewMeeting: NumberOrEmpty(data.MTMReviewMeeting),
      MTMReviewMeetingChairmen: NumberOrEmpty(data.MTMReviewMeetingChairmen),
      MTMReviewMeetingSpeakers: NumberOrEmpty(data.MTMReviewMeetingSpeakers),
      MTMReviewMeetingAttendees: NumberOrEmpty(data.MTMReviewMeetingAttendees),
  
      DeptRoundTableCaseReview: NumberOrEmpty(data.DeptRoundTableCaseReview),
      DeptRoundTableCaseReviewChairmen: NumberOrEmpty(data.DeptRoundTableCaseReviewChairmen),
      DeptRoundTableCaseReviewSpeakers: NumberOrEmpty(data.DeptRoundTableCaseReviewSpeakers),
      DeptRoundTableCaseReviewAttendees: NumberOrEmpty(data.DeptRoundTableCaseReviewAttendees),
    };
  };