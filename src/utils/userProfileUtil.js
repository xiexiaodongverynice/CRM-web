/**
 * Created by wans on 26/10/2017.
 */
import _ from 'lodash';
const USER_PROFILE = 'userProfile';
export const setUerProfile = (profile) => {
  if(profile==undefined){
    profile = [];
  }
  localStorage.setItem(USER_PROFILE, JSON.stringify(profile));
};

export const getProfile = () => {
  const localProfileJson = localStorage.getItem(USER_PROFILE);
  if (localProfileJson) {
    return JSON.parse(localProfileJson);
  } else {
    return {};
  }
};

export const getProfileId = () => {
  const profile = getProfile();
  return _.get(profile,'id')
};
export const cleanLocalStorage = () => {
  localStorage.removeItem(USER_PROFILE);
  delete window.fc_permission;
};
