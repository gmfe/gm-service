import { RequestInterceptor } from 'gm-util'
import { NProgress } from 'react-gm'

const useProgressInterceptor = () => {
  const progressInterceptor = {
    request () {
      NProgress.start()
    },
    response () {
      NProgress.done()
    },
    responseError () {
      NProgress.done()
    }
  }
  RequestInterceptor.add(progressInterceptor)
}

export default useProgressInterceptor
