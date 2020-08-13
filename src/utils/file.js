import _ from 'lodash';
import * as ImageFileUploadService from '../services/imageFileUploadService';

export const IMG_EXTENSIONS = ['.jpg', '.jpeg', '.git', '.jpe', '.jpz', '.png', '.pnz'];

export const IS_IMG = (filename) => {
  return _.chain(IMG_EXTENSIONS).filter((extension) => _.endsWith(filename, extension)).size().value() > 0
}

export const getImageUrl = (bucketObject, thumb = false) => {
  if(_.isNull(bucketObject) || _.isUndefined(bucketObject)) {
    return null;
  }
  const { sizes = [], key } = bucketObject;
  const size_s = _.first(sizes);
  let thumb_key;
  if (!_.isUndefined(size_s) && thumb) {
    thumb_key = bucketObject[size_s];
  } else {
    thumb_key = key;
  }
  return `${ImageFileUploadService.downloadUrl}/${thumb_key}?token=${localStorage.getItem(
    'token',
  )}`;
};