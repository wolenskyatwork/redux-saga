import { is, check, uid as nextSagaId, wrapSagaDispatch } from './utils'
import proc from './proc'

export function runSaga(
  iterator,
  {
    subscribe,
    dispatch,
    getState,
    context,
    sagaMonitor,
    logger
  }
) {

  check(iterator, is.iterator, "runSaga must be called on an iterator")

  const effectId = nextSagaId()
  if(sagaMonitor) {
    dispatch = wrapSagaDispatch(dispatch)
    sagaMonitor.effectTriggered({effectId, root: true, parentEffectId: 0, effect: {root: true, saga: iterator, args:[]}})
  }
  const task = proc(
    iterator,
    subscribe,
    dispatch,
    getState,
    context,
    {sagaMonitor, logger},
    effectId,
    iterator.name
  )

  if(sagaMonitor) {
    sagaMonitor.effectResolved(effectId, task)
  }

  task.setContext = (props) => {
    Object.assign(context, props)
    return task
  }

  return task
}
