import _ from 'lodash'
import * as userService from './services/userService';

export function* fetchSubs({
  userId,
  saga: {
    call
  }
}) {
  // 加载当前用户的下属
  const [subordinates, directSubordinates, territoryIds] = yield [
    call(userService.getSubordinates, {user_id: userId}),
    call(userService.getDirectSubordinates, {user_id: userId}),
    call(userService.getTerritoryIds, {user_id: userId})
  ]

  
  if(subordinates.status === 200) {
    const subordinateResults = [];
    subordinates.result.forEach(element => {
      if(element.id) {
        subordinateResults.push(element)
      }
    });
    localStorage.setItem(`subordinates_${userId}`, JSON.stringify(subordinates.result || []))
    localStorage.setItem(`subordinateResults_${userId}`, JSON.stringify(subordinateResults || []))
  }

  if (_.get(territoryIds, 'status') === 200) {
    localStorage.setItem(`territoryIds_${userId}`, JSON.stringify(_.get(territoryIds, 'result', [])))
  }

  if (_.get(directSubordinates, 'status') === 200) {
    localStorage.setItem(`directSubordinates_${userId}`, JSON.stringify(_.get(directSubordinates, 'result', [])))
  }
}

export function* fetchParentSubs({
  userId,
  saga: {
    call
  }
}) {
  // 加载当前用户的下属
  const subordinates = yield call(userService.getSubordinates, {user_id: userId, parent: true});
  if(subordinates.status === 200) {
    const subordinateResults = [];
    subordinates.result.forEach(element => {
      if(element.id) {
        subordinateResults.push(element)
      }
    });
    localStorage.setItem(`parent_subordinates_${userId}`, JSON.stringify(subordinates.result || []))
    localStorage.setItem(`parent_subordinateResults_${userId}`, JSON.stringify(subordinateResults || []))
  }
}